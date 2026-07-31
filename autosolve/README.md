# ⚡ Automated Solve & Exploit Scripts (`/autosolve`)

This directory contains standalone, end-to-end automated exploit and solver scripts for HackTheBox machines, TryHackMe challenges, and CTF challenges documented across [Asbawy's Knowledge Vault](https://asbawy.github.io).

---

## 📌 Inventory of Automated Scripts

| Script Name                                                          | Target / Lab              |  Language  | Vector / Mechanism                                                                                                                               | Writeup Link                                                        |
| :------------------------------------------------------------------- | :------------------------ | :--------: | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| **[`thm_packed_light_solve.py`](./thm_packed_light_solve.py)**       | TryHackMe — Packed Light  | `Python 3` | PCAP extraction of HTTP C2 payload (`updates.py`), single-character XOR keylogger cryptanalysis, and `hotel_sess_state` cookie decryption.       | [Read Writeup](https://asbawy.github.io/writeups/thm-packed-light)  |
| **[`thm_complimentary_exploit.sh`](./thm_complimentary_exploit.sh)** | TryHackMe — Complimentary |   `Bash`   | Frontend JS extraction of Cognito Identity Pool ID, guest identity provisioning, temporary AWS credentials exchange, and DynamoDB flag scanning. | [Read Writeup](https://asbawy.github.io/writeups/thm-complimentary) |

---

## 🚀 Execution Instructions

### Prerequisites

- `curl`, `jq`, `aws-cli` (for Bash scripts)
- Python 3.8+ (for Python scripts)

### Running `thm_packed_light_solve.py`

Place your challenge packet capture (`traffic.pcapng`) in the working directory and run:

```bash
python3 thm_packed_light_solve.py --pcap traffic.pcapng
```

### Running `thm_complimentary_exploit.sh`

Make the script executable and run:

```bash
chmod +x thm_complimentary_exploit.sh
./thm_complimentary_exploit.sh
```
