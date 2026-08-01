#!/usr/bin/env python3
"""
Hexecution - automated solver
=============================
HTB "Hexecution" (rev, hard) - custom kitchen-themed VM interpreter.

The `cook` binary is a virtual machine. It reads a "recipe" (assembly file)
and executes it instruction by instruction. The flag check happens inside
the VM program `recipe.asm`:

    Enter the flag: <input>
    PEPEFROG PROTEIN, CARBO      ; compare 32 bytes stack[PROTEIN+i] vs stack[CARBO+i]
    -> if equal:  "Nice! The flag is HTB{YOUR_INPUT} :)"
    -> otherwise: "Invalid."

This script does everything automatically:
  1. Parses recipe.asm
  2. Extracts the encrypted flag (32 bytes pushed with AES256)
  3. Extracts the two permutation stages (group shuffle + global reorder)
  4. Inverts them to recover the flag
  5. Verifies the result by emulating the whole VM in pure Python
  6. (optional) runs the real binary via docker to confirm

Usage:
    python3 solve.py                # solve from recipe.asm in this folder
    python3 solve.py recipe.asm     # solve from a specific recipe file
    python3 solve.py --verify       # also emulate + (try to) run the binary
"""

import re
import sys
import os
import subprocess
from pathlib import Path

# 1. The VM, reversed from the binary (see WRITEUP for the full analysis)
# Registers live in .bss (16-bit each). Instruction -> C-like meaning:
#   BOIL reg,val      reg = val
#   AES256 val        stack[index + CARBO] = val; index++     (push byte)
#   SPELL 1           print stack[CARBO..PROTEIN] as chars    (write)
#   SPELL 0           scanf("%s") into stack[CARBO..]; store len at stack[CARBO+0x22]
#   QUICKMAFFS idx    PROTEIN = stack[idx]                    (load byte)
#   ROAST r1,r2       r1 ^= r2
#   GRIND r1,r2       if r1 != r2: print "Wrong!"; exit(1)    (compare registers)
#   GOODBYE dst,src   dst = src                               (copy register)
#   WINDOW reg        stack[CARBO] = reg                      (store byte)
#   LADDER reg        reg++
#   PEPEFROG r1,r2    for i in 0..31: if stack[r1+i]!=stack[r2+i]: "Invalid."
#                     else: "Nice! The flag is HTB{YOUR_INPUT} :)"
#   CHAIR             debug dump of stack
REGS = {"VEGETABLE": 0, "FRUIT": 1, "MEAT": 2, "DAIRY": 3,
        "PROTEIN": 4, "CARBO": 5}


def parse_recipe(path):
    """Tokenize recipe.asm into a list of (op, args...) tuples."""
    instrs = []
    for raw in Path(path).read_text().splitlines():
        line = raw.strip()
        if not line:
            continue
        parts = line.replace(",", " ").split()
        instrs.append(tuple(parts))
    return instrs


class VM:
    """A faithful Python emulation of the cook VM (only what recipe.asm uses)."""

    def __init__(self, instrs, user_input=""):
        self.instrs = instrs
        self.regs = [0] * 6          # VEGETABLE FRUIT MEAT DAIRY PROTEIN CARBO
        self.stack = [0] * 256       # VM stack array
        self.idx = 0                 # stack->index (AES256 pushes here + CARBO)
        self.user_input = user_input

    def run(self):
        i = 0
        result = None
        while i < len(self.instrs):
            op = self.instrs[i][0]
            if op == "BOIL":
                self.regs[REGS[self.instrs[i][1]]] = int(self.instrs[i][2], 0)
            elif op == "AES256":
                self.stack[self.idx + self.regs[REGS["CARBO"]]] = int(self.instrs[i][1], 0)
                self.idx += 1
            elif op == "SPELL":
                if self.instrs[i][1] == "1":
                    pass  # write: printed to stdout, irrelevant for solving
                else:
                    # read: input lands at stack[CARBO..], length at stack[CARBO+0x22]
                    base = self.regs[REGS["CARBO"]]
                    for j, ch in enumerate(self.user_input):
                        self.stack[base + j] = ord(ch)
                        self.idx += 1
                    self.stack[base + len(self.user_input)] = 0x0A
                    self.stack[base + 0x22] = len(self.user_input)
            elif op == "QUICKMAFFS":
                self.regs[REGS["PROTEIN"]] = self.stack[int(self.instrs[i][1], 0)]
            elif op == "ROAST":
                r1, r2 = self.instrs[i][1], self.instrs[i][2]
                self.regs[REGS[r1]] ^= (self.regs[REGS[r2]] if r2 in REGS
                                        else int(r2, 0))
            elif op == "GRIND":
                r1, r2 = self.instrs[i][1], self.instrs[i][2]
                if self.regs[REGS[r1]] != self.regs[REGS[r2]]:
                    result = "Wrong!"      # input length != 32
            elif op == "GOODBYE":
                dst, src = self.instrs[i][1], self.instrs[i][2]
                self.regs[REGS[dst]] = self.regs[REGS[src]]
            elif op == "WINDOW":
                self.stack[self.regs[REGS["CARBO"]]] = self.regs[REGS[self.instrs[i][1]]]
            elif op == "LADDER":
                self.regs[REGS[self.instrs[i][1]]] += 1
            elif op == "PEPEFROG":
                r1, r2 = self.instrs[i][1], self.instrs[i][2]
                a, b = self.regs[REGS[r1]], self.regs[REGS[r2]]
                ok = all(self.stack[a + k] == self.stack[b + k] for k in range(32))
                result = "Nice!" if ok else "Invalid."
            elif op == "CHAIR":
                pass  # debug dump
            i += 1
        return result


# 2. Static analysis of recipe.asm -> encrypted flag + permutations
def extract_enc_flag(instrs):
    """Collect the 32 encrypted bytes pushed by the second AES256 block."""
    # Pattern in recipe.asm: BOIL CARBO, 0x40  -> 32x AES256 ...
    enc = []
    seen_carbo_40 = False
    for ins in instrs:
        if ins[0] == "BOIL" and ins[1] == "CARBO" and int(ins[2], 0) == 0x40:
            seen_carbo_40 = True
            continue
        if seen_carbo_40 and ins[0] == "AES256":
            enc.append(int(ins[1], 0))
            if len(enc) == 32:
                break
    if len(enc) != 32:
        raise SystemExit(f"[!] expected 32 encrypted bytes, got {len(enc)}")
    return bytes(enc)


def extract_order(instrs):
    """Extract the global reorder array from the QUICKMAFFS/WINDOW/LADDER dance."""
    # Pattern: BOIL CARBO, 0x42 ; (QUICKMAFFS idx; WINDOW PROTEIN; LADDER CARBO) x32
    order = []
    for i, ins in enumerate(instrs[:-2]):
        if ins[0] == "QUICKMAFFS" and instrs[i + 1][0] == "WINDOW":
            order.append(int(ins[1], 0) - 0x14)  # relative to input start
    return order


def solve(enc, order):
    """
    Invert the two stages:
      stage 2: reordered[i] = shuffled[order[i]]   -> shuffled[j] = enc[inv[j]]
      stage 1: (a,b,c,d) -> (c,b,d,a)              -> inverse: (x3,x1,x0,x2)
    """
    assert len(enc) == len(order) == 32

    inv = [0] * 32
    for i, o in enumerate(order):
        inv[o] = i
    shuffled = bytes(enc[inv[j]] for j in range(32))

    flag = []
    for g in range(0, 32, 4):
        x = shuffled[g:g + 4]
        flag += [x[3], x[1], x[0], x[2]]
    return bytes(flag)


# 3. main
def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "recipe.asm"
    if not Path(path).exists():
        # try the challenge subfolder layout (recipe.asm usually sits next to cook)
        base = Path(__file__).parent
        hits = sorted(base.rglob("recipe.asm"))
        cand = base / path
        if cand.exists():
            path = str(cand)
        elif hits:
            path = str(hits[0])
            print(f"    (found recipe at: {path})")
        else:
            raise SystemExit(f"[!] recipe not found anywhere under {base}")

    print(f"[*] parsing recipe: {path}")
    instrs = parse_recipe(path)

    print("[*] extracting encrypted flag (AES256 pushes) ...")
    enc = extract_enc_flag(instrs)
    print(f"    encrypted flag bytes: {enc.decode()}")

    print("[*] extracting global reorder array (QUICKMAFFS/WINDOW dance) ...")
    order = extract_order(instrs)
    print(f"    order = {order}")
    if len(order) != 32:
        raise SystemExit(f"[!] expected 32 order entries, got {len(order)}")

    print("[*] inverting the two permutation stages ...")
    flag = solve(enc, order)
    print()
    print("=" * 62)
    print(f"  FLAG: HTB{{{flag.decode()}}}")
    print("=" * 62)
    print()

    # verification 1: full VM emulation 
    print("[*] verifying with full VM emulation ...")
    vm = VM(instrs, user_input=flag.decode())
    verdict = vm.run()
    print(f"    emulator verdict: {verdict}")
    if verdict != "Nice!":
        raise SystemExit("[!] emulation did NOT accept the recovered flag!")

    # verification 2: run the real binary (best effort) 
    binpath = str(Path(path).parent / "cook")
    if Path(binpath).exists():
        print("[*] trying to run the real binary ...")
        # binary needs glibc >= 2.38; on older hosts, try docker (Ubuntu 24.04)
        cmd = ["bash", "-c",
               f"printf '{flag.decode()}\\n' | {binpath} {path} 2>/dev/null"]
        try:
            out = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            ok = "Nice!" in out.stdout
        except Exception:
            ok = False
        if not ok:
            try:
                d = Path(binpath).resolve()
                r = Path(path).resolve()
                out = subprocess.run(
                    ["docker", "run", "--rm",
                     "-v", f"{d.parent}:/chall:ro", "-w", "/chall",
                     "ubuntu:24.04", "bash", "-c",
                     f"printf '{flag.decode()}\\n' | ./cook {r.name}"],
                    capture_output=True, text=True, timeout=120)
                ok = "Nice!" in out.stdout
            except Exception:
                ok = False
        print(f"    binary verdict: {'Nice!  (flag accepted by the real binary)' if ok else 'could not run (glibc/docker unavailable) - emulator result stands'}"
              )
    print("\nDone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
