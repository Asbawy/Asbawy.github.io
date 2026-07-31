# ⚡ Automated Solve & Exploit Scripts (`/autosolve`)

This directory contains standalone, end-to-end automated exploit and solver scripts for HackTheBox machines, TryHackMe challenges, and CTF challenges documented across [Asbawy's Knowledge Vault](https://asbawy.github.io).

---

## 📌 Inventory of Automated Scripts

| Script Name                                                          | Target / Lab              |  Language  | Vector / Mechanism                                                                                                                               | Writeup Link                                                        |
| :------------------------------------------------------------------- | :------------------------ | :--------: | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| **[`thm_packed_light_solve.py`](./thm_packed_light_solve.py)**       | TryHackMe — Packed Light  | `Python 3` | PCAP extraction of HTTP C2 payload (`updates.py`), single-character XOR keylogger cryptanalysis, and `hotel_sess_state` cookie decryption.       | [Read Writeup](https://asbawy.github.io/writeups/thm-packed-light)  |
| **[`thm_complimentary_exploit.sh`](./thm_complimentary_exploit.sh)** | TryHackMe — Complimentary |   `Bash`   | Frontend JS extraction of Cognito Identity Pool ID, guest identity provisioning, temporary AWS credentials exchange, and DynamoDB flag scanning. | [Read Writeup](https://asbawy.github.io/writeups/thm-complimentary) |


