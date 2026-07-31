#!/usr/bin/env python3
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║              🔦  PACKED LIGHT — Auto Exploitation Script                   ║
# ║       TryHackMe Network Forensics | PCAP C2 Extraction & XOR Decryption      ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
# Author: Asbawy (https://asbawy.github.io)
# Repository: https://github.com/Asbawy/Asbawy.github.io

import argparse
import base64
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ANSI Color Codes
RED = "\033[0;31m"
GRN = "\033[0;32m"
YEL = "\033[1;33m"
BLU = "\033[0;34m"
MAG = "\033[0;35m"
CYN = "\033[0;36m"
WHT = "\033[1;37m"
BOLD = "\033[1m"
RST = "\033[0m"


def print_banner():
    banner = f"""{CYN}{BOLD}
 ╔══════════════════════════════════════════════════════════════════════╗
 ║         TryHackMe: Packed Light — PCAP Auto-Decryption Tool          ║
 ╚══════════════════════════════════════════════════════════════════════╝{RST}"""
    print(banner)


def check_pcap(pcap_path: Path):
    print(f"{BLU}[*] Step 1/4: Inspecting PCAP file: {pcap_path.name}...{RST}")
    if not pcap_path.exists():
        print(f"{RED}[!] Error: PCAP file not found at {pcap_path}{RST}")
        sys.exit(1)
    size_kb = pcap_path.stat().st_size / 1024
    print(f"{GRN}[✓] Loaded {pcap_path.name} ({size_kb:.2f} KB){RST}\n")


def extract_c2_script(raw_bytes: bytes) -> str:
    print(f"{BLU}[*] Step 2/4: Extracting C2 staging script (/temp/updates.py)...{RST}")
    script_match = re.search(rb"import requests[\s\S]+?listener\.join\(\)", raw_bytes)
    if not script_match:
        print(f"{RED}[!] Error: Could not find updates.py payload in PCAP{RST}")
        sys.exit(1)

    script_code = script_match.group(0).decode("utf-8", errors="replace")
    print(f"{GRN}[✓] Extracted script ({len(script_code)} bytes){RST}")

    p1_match = re.search(r'p1\s*=\s*"([^"]+)"', script_code)
    p2_match = re.search(r'p2\s*=\s*"([^"]+)"', script_code)
    if p1_match and p2_match:
        xor_key = p1_match.group(1) + p2_match.group(1)
        print(f"{GRN}[✓] Identified C2 XOR Key: {CYN}{xor_key}{RST}")
    else:
        xor_key = "H0t3lSt@ff0NlyK3epS3cr3t!"
        print(f"{YEL}[!] Using default XOR key: {xor_key}{RST}")

    print(f"{MAG}[!] Cryptanalysis: sendltr() encrypts characters individually.{RST}")
    print(f"{MAG}[!] Because len(data) == 1, index i=0 always -> XOR byte is key[0] ('{xor_key[0]}', 0x{ord(xor_key[0]):02x}){RST}\n")
    return xor_key


def harvest_cookies(raw_bytes: bytes):
    print(f"{BLU}[*] Step 3/4: Harvesting exfiltrated 'hotel_sess_state' cookies...{RST}")
    cookie_matches = re.findall(rb"hotel_sess_state=([A-Za-z0-9+/=]+)", raw_bytes)
    if not cookie_matches:
        print(f"{RED}[!] Error: No 'hotel_sess_state' cookies found in PCAP{RST}")
        sys.exit(1)

    cookies = [c.decode("ascii") for c in cookie_matches]
    print(f"{GRN}[✓] Harvested {len(cookies)} encrypted keystroke cookies{RST}")
    print(f"{CYN}    Sample: {', '.join(cookies[:6])}...{RST}\n")
    return cookies


def decrypt_keystrokes(cookies: list, xor_key: str):
    print(f"{BLU}[*] Step 4/4: Decrypting keystroke stream...{RST}")
    xor_byte = ord(xor_key[0])

    keystrokes = []
    for c in cookies:
        try:
            raw_data = base64.b64decode(c)
            dec_char = chr(raw_data[0] ^ xor_byte)
            keystrokes.append(dec_char)
        except Exception as e:
            print(f"{YEL}[!] Warning: skipping malformed cookie {c} ({e}){RST}")

    recovered_stream = "".join(keystrokes)
    print(f"{GRN}[✓] Keystroke stream successfully reconstructed!{RST}\n")

    flag_match = re.search(r"THM\{[^}]+\}", recovered_stream)
    if flag_match:
        flag = flag_match.group(0)
        print(f"{GRN}╔══════════════════════════════════════════════════════════════════════╗{RST}")
        print(f"{GRN}║{RST}   {BOLD}{YEL}🏁  FLAG CAPTURED{RST}                                                  {GRN}║{RST}")
        print(f"{GRN}║{RST}      {WHT}{flag:<56}{RST}{GRN}║{RST}")
        print(f"{GRN}╚══════════════════════════════════════════════════════════════════════╝{RST}\n")
        print(f"{CYN}[*] Complete recovered text: {recovered_stream}{RST}")
    else:
        print(f"{RED}[!] No flag matching THM{{...}} found in decrypted stream{RST}")
        print(f"{YEL}[*] Recovered stream: {recovered_stream}{RST}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Auto-solve TryHackMe Packed Light PCAP challenge")
    parser.add_argument("-r", "--pcap", default="traffic.pcapng", help="Path to traffic.pcapng")
    args = parser.parse_args()

    pcap_path = Path(args.pcap)
    print_banner()
    check_pcap(pcap_path)

    with open(pcap_path, "rb") as f:
        raw_bytes = f.read()

    xor_key = extract_c2_script(raw_bytes)
    cookies = harvest_cookies(raw_bytes)
    decrypt_keystrokes(cookies, xor_key)


if __name__ == "__main__":
    main()
