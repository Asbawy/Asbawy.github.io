# ⚡ Automated Solve & Exploit Scripts (`/autosolve`)

This directory contains standalone, end-to-end automated exploit and solver scripts for HackTheBox machines, TryHackMe challenges, and CTF challenges documented across [Asbawy's Knowledge Vault](https://asbawy.github.io).

---

## 📌 Inventory of Automated Scripts

| Script Name                                                            | Target / Lab                  |  Language  | Vector / Mechanism                                                                                                                                     | Writeup Link                                                           |
| :--------------------------------------------------------------------- | :---------------------------- | :--------: | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **[`htb_hexecution_solve.py`](./htb_hexecution_solve.py)**             | HackTheBox — Hexecution       | `Python 3` | Automated custom VM (`cook`) assembly (`recipe.asm`) parsing, AES256 bytecode extraction, 2-stage permutation inversion, and full Python VM emulation. | [Read Writeup](https://asbawy.github.io/writeups/htb-hexecution)       |
| **[`htb_neural_detonator_solve.py`](./htb_neural_detonator_solve.py)** | HackTheBox — Neural Detonator | `Python 3` | Automated `.keras` extraction, Lambda layer base64+marshal bytecode disassembly, SHA-1 weight key derivation, and Dense bias stego flag decryption.    | [Read Writeup](https://asbawy.github.io/writeups/htb-neural-detonator) |
| **[`thm_complimentary_exploit.sh`](./thm_complimentary_exploit.sh)**   | TryHackMe — Complimentary     |   `Bash`   | Frontend JS extraction of Cognito Identity Pool ID, guest identity provisioning, temporary AWS credentials exchange, and DynamoDB flag scanning.       | [Read Writeup](https://asbawy.github.io/writeups/thm-complimentary)    |
| **[`thm_packed_light_solve.py`](./thm_packed_light_solve.py)**         | TryHackMe — Packed Light      | `Python 3` | PCAP extraction of HTTP C2 payload (`updates.py`), single-character XOR keylogger cryptanalysis, and `hotel_sess_state` cookie decryption.             | [Read Writeup](https://asbawy.github.io/writeups/thm-packed-light)     |

---

## 🚀 Quick Execution Guide

### HackTheBox — Hexecution (`htb_hexecution_solve.py`)

Run the standalone solver against the challenge bytecode file (`recipe.asm`):

```bash
python3 htb_hexecution_solve.py -f recipe.asm
# Or verify execution with the local cook VM binary:
python3 htb_hexecution_solve.py -f recipe.asm --bin ./cook
```

### HackTheBox — Neural Detonator (`htb_neural_detonator_solve.py`)

Run the standalone solver against the challenge model file (`mlcious.keras`):

```bash
python3 htb_neural_detonator_solve.py mlcious.keras
```

### TryHackMe — Complimentary (`thm_complimentary_exploit.sh`)

Execute the unauthenticated AWS Cognito IAM abuse script against the target IP or domain:

```bash
chmod +x thm_complimentary_exploit.sh
./thm_complimentary_exploit.sh <TARGET_IP>
```

### TryHackMe — Packed Light (`thm_packed_light_solve.py`)

Run the automated PCAP extractor and XOR decryptor against the challenge capture file:

```bash
python3 thm_packed_light_solve.py -f capture.pcapng
```
