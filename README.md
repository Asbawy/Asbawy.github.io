<div align="center">

# 𓁹 ASBAWY'S SECURITY RESEARCH & KNOWLEDGE VAULT

**Offensive Security Research • Exploit Development • Active Directory • CTF Writeups • Red Team Cheatsheets**

[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-SSR%20%2B%20CSR-059669?style=for-the-badge&logo=react&logoColor=white)](https://tanstack.com/start)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

_"Take time to learn. Take more time to practice. Open your mind and your imagination — this is true power."_

</div>

---

## The Hacker's Manifesto: Beyond Copy-Pasting Flags

In the world of offensive security, HackTheBox, and TryHackMe, it is dangerously easy to fall into the **"CTF Fast-Food Trap."** Many beginners race through platforms, copying and pasting commands from writeups or automated tools just to grab `user.txt` and `root.txt` as fast as possible.

**That is not hacking. That is clerical work.**

Real security research, red teaming, and exploit development do not have predefined flags, hints, or step-by-step walkthroughs. Here is the mindset and discipline required to master the craft:

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                   THE CYCLE OF REAL MASTERY                            │
  │                                                                        │
  │  [01. OBSERVE] ──► [02. DECONSTRUCT] ──► [03. IMAGINE] ──► [04. BUILD] │
  │        ▲                                                         │     │
  │        └─────────────────────────────────────────────────────────┘     │
  └────────────────────────────────────────────────────────────────────────┘
```

### 1. Stop Copy-Pasting Flags — Own the Root Cause

- **A flag is just a string; understanding is permanent.** When you compromise a machine or solve a challenge, do not immediately move on.
- Ask yourself:
  - _Why did this vulnerability exist in the first place?_
  - _How would a developer or systems engineer patch this flaw?_
  - _How would a Blue Team / SOC analyst detect my attack in memory, logs, or network PCAPs?_
  - _Can I replicate this attack using manual requests or custom code instead of automated scripts?_

### 2. Take Time to Learn, Take More Time to Practice

- **Theory without execution is fragile.** Reading about Active Directory Kerberos delegation or heap overflows will only take you so far.
- Spend **20% of your time studying concepts** and **80% of your time in the trenches**: debugging binaries in GDB/WinDbg, inspecting raw network packets in Wireshark, reading source code, and configuring vulnerable environments from scratch.
- Treat every lab machine as an enterprise infrastructure. Enumerate thoroughly, map relationships, and understand the ecosystem.

### 3. Open Your Mind & Your Imagination — This is True Power

- Top-tier security researchers and red teamers do not just run scanners—they **imagine possibilities**.
- **Imagination** allows you to see how a seemingly benign feature (such as an unvalidated redirect, an exposed LDAP attribute, or an orphan COM object) can be chained with a secondary misconfiguration to achieve domain dominance.
- Never stop questioning assumptions: _"What happens if I send negative integers? What if this certificate template is requested by a machine account? What if I replace this DLL during service startup?"_

### 4. Build Tools, Don't Just Consume Them

- When you encounter a complex exploitation path, automate it yourself.
- Writing your own tools in **Go, Python, Rust, or C/Assembly** forces you to understand protocols, headers, memory layouts, and data structures at the byte level.
- **You control the code, or the code controls you.**

---

## Complete Knowledge Vault Contents

This repository hosts Asbawy's personal security blog, interactive utilities, red team cheatsheets, and detailed writeups. Below is the complete, verified inventory of published research and guides.

### Security Research & Dev Logs (/logs)

In-depth technical deep-dives into vulnerability research, exploit development, Active Directory abuse, and forensics.

| Post / Article Title                                                                                          | Category    | Description                                                                                                                                   |
| :------------------------------------------------------------------------------------------------------------ | :---------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **[NGINX Rift (CVE-2026-42945): The 18-Year-Old RCE Hiding in Plain Sight](/logs/cve-2026-42945-nginx-rift)** | `Web`       | Critical heap buffer overflow in `ngx_http_rewrite_module` (CVSS 9.2)—unauthenticated RCE via a single crafted request.                       |
| **[CertiGhost (CVE-2026-54121): AD CS Low-Priv to DC Impersonation](/logs/certighost-cve-2026-54121)**        | `Windows`   | AD CS chase fallback flaw enabling low-privileged Domain Users to forge Domain Controller certificates and escalate to DCSync.                |
| **[BadSuccessor: dMSA Privilege Escalation in Windows Server 2025](/logs/badsuccessor)**                      | `Windows`   | Technical breakdown of dMSA migration mechanics in Windows Server 2025 and vectors for full domain compromise.                                |
| **[Hijacking Grammarly Desktop: Silent Code Execution via Missing DLL](/logs/grammarly-dll-hijacking-blog)**  | `Windows`   | Exploiting user-writable application folder DLL loading in Grammarly Desktop for silent code execution and persistence.                       |
| **[Battlefield Forensics: Anatomy of the IDF OLAR Radio System](/logs/olar-device-forensics)**                | `Forensics` | Hardware reverse engineering, firmware extraction, memory analysis, and cryptographic inspection of tactical military radio systems.          |
| **[Source Code Review: Unearthing Critical Flaws in PHP](/logs/php-code-review)**                             | `Web`       | Practical guide to auditing PHP codebases—identifying type juggling, deserialization, and logic bugs to construct functional exploits.        |
| **[The Art of Data Exfiltration: DNS, ICMP, and HTTPS Tunneling](/logs/data-exfiltration-guide)**             | `Network`   | Red-team exfiltration playbook covering Iodine IP-over-DNS, Neo-reGeorg HTTP tunneling, ICMP payloads, OPSEC, and detection.                  |
| **[Practical Wireless Exploitation for Red Teams](/logs/practical-wireless-exploitation-for-red-teams)**      | `Network`   | Advanced wireless ops covering enterprise Wi-Fi infiltration, BLE MITM, RFID cloning, and IoT device vulnerabilities.                         |
| **[Shellcode 101: From Assembly to AV Evasion](/logs/shellcode101)**                                          | `Windows`   | Custom x64 assembly shellcode construction, PEB resolution, API hashing, null byte elimination, and EDR bypass techniques.                    |
| **[Legacy Lethality: Weaponizing OLE & VBA Macros in the GenAI Era](/logs/weaponizing-ole-vba-macros)**       | `Windows`   | Modern VBA macro weaponization, AMSI bypasses, direct syscalls from VBA, XLM abuse, and CVE-2026-21509 kill-bit bypass.                       |
| **[CVE-2021-43798 Grafana Directory Traversal Deep Dive](/logs/cve-2021-43798-grafana-directory-traversal)**  | `Web`       | Deep dive into unauthenticated Grafana 8.x plugin directory traversal, URL normalization pitfalls, loot targets, and GrafTraverse automation. |

---

### CTF & Machine Writeups (/writeups)

Structured, analytical writeups focusing on methodology, enumeration, vulnerability identification, and custom exploitation scripts.

#### HackTheBox

| Machine / Challenge                                    | Difficulty  |   Type    | Key Topics & Vectors                                                                                                                                                                                                                |
| :----------------------------------------------------- | :---------: | :-------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Active](/writeups/htb-active)**                     |   `Easy`    |  Machine  | Anonymous SMB Replication share access, GPP MS14-025 cpassword decryption, pharaohound AD graph analysis, Administrator Kerberoasting & hashcat cracking, and SYSTEM shell via impacket-psexec.                                 |
| **[Busqueda](/writeups/htb-busqueda)**                 |   `Easy`    |  Machine  | Searchor 2.4.0 eval() injection RCE, .git/config credential harvesting, SSH password reuse, and sudo relative-path script hijacking. [[Auto-Solve Script]](./autosolve/htb_busqueda_solve.py)                                   |
| **[Curveware](/writeups/htb-curveware)**               |   `Hard`    | Challenge | Reverse engineering Windows ransomware, ECDSA partial nonce leakage (40-bit LSB), and LLL lattice reduction on HNP for AES key recovery.                                                                                            |
| **[Headless](/writeups/htb-headless)**                 |   `Easy`    |  Machine  | Blind XSS in User-Agent header, cookie exfiltration, reporting feature command injection, and PAM backdoor via relative PATH hijack in sudo script.                                                                                 |
| **[Hexecution](/writeups/htb-hexecution)**             |   `Hard`    | Challenge | Reversing kitchen-themed custom VM ('cook') on Linux, custom assembly opcodes ('recipe.asm'), and 2-stage permutation algebraic inversion. [[Auto-Solve Script]](./autosolve/htb_hexecution_solve.py)                               |
| **[Neural Detonator](/writeups/htb-neural-detonator)** |   `Hard`    | Challenge | Reversing malicious Keras model ('mlcious.keras'), extracting embedded Lambda Python bytecode, SHA-1 weight seed XOR key derivation, and Dense bias steganography. [[Auto-Solve Script]](./autosolve/htb_neural_detonator_solve.py) |
| **[Nexus](/writeups/htb-nexus)**                       |   `Easy`    |  Machine  | Git history DB credential leak, Krayin CRM TinyMCE file upload RCE, .env password harvest, SSH reuse, and root gitea-template-sync timer traversal via git '..' tree objects. [[Auto-Solve Script]](./autosolve/htb_nexus_solve.py) |
| **[Sauna](/writeups/htb-sauna)**                       |   `Easy`    |  Machine  | AS-REP Roasting, WinRM registry enumeration, AutoLogon credentials, and DCSync via overprivileged service account. |
| **[SpookyPass](/writeups/htb-spooky-pass)**            | `Very Easy` | Challenge | Static binary analysis, hardcoded password string extraction, and C decompiler tracing using Ghidra.                                                                                                                                |
| **[WhiteRabbit](/writeups/htb-whiterabbit)**            |  `Insane`   |  Machine  | Uptime Kuma subdomain leak, WikiJS n8n workflow HMAC secret & SQLi, error-based SQLi command log dump, 7z hashcat cracking, sudo-restic host SSH key extraction, and glibc PRNG millisecond timestamp seed recovery.               |

#### TryHackMe

| Machine / Challenge                              | Difficulty |   Type    | Key Topics & Vectors                                                                                                                                                                     |
| :----------------------------------------------- | :--------: | :-------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Clocky](/writeups/thm-clocky)**               |  `Medium`  |  Machine  | Exposed zip source code recovery, predictable SHA-1 timestamp password-reset token forgery, SSRF open redirect bypass, and MySQL hash cracking to root.                                  |
| **[Complimentary](/writeups/thm-complimentary)** |   `Easy`   |  Machine  | AWS Cognito Identity Pools, overprivileged unauthenticated IAM roles, and guest credential DynamoDB data exfiltration. [[Auto-Exploit Script]](./autosolve/thm_complimentary_exploit.sh) |
| **[El Bandito](/writeups/thm-elbandito)**        |   `Hard`   |  Machine  | WebSocket Request Smuggling via SSRF to access restricted Spring Boot Actuators and chat application manipulation.                                                                       |
| **[Extract](/writeups/thm-extract)**             |   `Hard`   |  Machine  | SSRF escalated to internal service interaction via Gopher, Next.js middleware authentication bypass, and PHP object serialization for 2FA bypass.                                        |
| **[Hammer](/writeups/thm-hammer)**               |  `Medium`  |  Machine  | Open log email leak, 4-digit recovery-code brute forcing, and HS256 JWT forgery for remote command execution on custom port-1337 web app.                                                |
| **[Include](/writeups/thm-include)**             |  `Medium`  |  Machine  | BOPLA admin privilege escalation on Node.js, SSRF via admin settings to leak internal credentials, LFI on System Monitoring Portal, and SSH brute-forcing.                               |
| **[Packed Light](/writeups/thm-packed-light)**   |   `Easy`   | Challenge | HTTP C2 traffic PCAP analysis, Python keylogger staging extraction, XOR cryptanalysis, and exfiltrated cookie decryption. [[Auto-Solve Script]](./autosolve/thm_packed_light_solve.py)   |

---

### Automated Solve Scripts (/autosolve)

Standalone, fully automated exploit and solver scripts for lab machines and challenges. See [`autosolve/README.md`](./autosolve/README.md) for execution details.

| Script Name                                                                      | Target / Lab                  |  Language  | Description                                                                                                                |
| :------------------------------------------------------------------------------- | :---------------------------- | :--------: | :------------------------------------------------------------------------------------------------------------------------- |
| **[`htb_busqueda_solve.py`](./autosolve/htb_busqueda_solve.py)**                 | HackTheBox — Busqueda         | `Python 3` | Searchor 2.4.0 eval() RCE, `.git/config` cred harvesting, SSH password reuse, and sudo relative `./full-checkup.sh` path hijack. |
| **[`htb_hexecution_solve.py`](./autosolve/htb_hexecution_solve.py)**             | HackTheBox — Hexecution       | `Python 3` | Custom VM bytecode parsing (`recipe.asm`), AES256 extraction, permutation inversion, and emulation.                        |
| **[`htb_neural_detonator_solve.py`](./autosolve/htb_neural_detonator_solve.py)** | HackTheBox — Neural Detonator | `Python 3` | Automated Keras (`mlcious.keras`) extraction, Lambda bytecode disassembly, weight XOR key derivation, and bias decryption. |
| **[`htb_nexus_solve.py`](./autosolve/htb_nexus_solve.py)**                       | HackTheBox — Nexus            | `Python 3` | Gitea git history DB credential leak, Krayin CRM TinyMCE file upload RCE, production `.env` password harvest, SSH reuse, and root gitea-template-sync timer traversal via crafted git `..` tree objects. |
| **[`thm_packed_light_solve.py`](./autosolve/thm_packed_light_solve.py)**         | TryHackMe — Packed Light      | `Python 3` | PCAP C2 payload extraction, XOR keylogger cryptanalysis, and keystroke cookie stream decryption.                           |
| **[`thm_complimentary_exploit.sh`](./autosolve/thm_complimentary_exploit.sh)**   | TryHackMe — Complimentary     |   `Bash`   | Cognito Identity Pool ID extraction, temporary AWS credentials exchange, and DynamoDB scan.                                |

---

### Red Team & Offensive Cheatsheets (/cheatsheet)

High-signal, actionable references structured for rapid deployment during engagements.

- **[Active Directory Comprehensive Cheatsheet](/cheatsheet/Active%20Directory/Active_Directory_Cheatsheet)**
  - Full attack lifecycle: External/internal recon, password spraying, network poisoning, BloodHound/Pharaohound mapping, Kerberoasting, AS-REP Roasting, NTLM Relaying, AD CS (Certified Pre-Owned), DCSync, GPO exploitation, and domain persistence.
- **[Linux Privilege Escalation — Enumeration](/cheatsheet/linux/privesc-enumeration)**
  - Copy-paste-ready enumeration commands covering SUID/SGID binaries, cron jobs, writable system paths, kernel exploits, capabilities, and NFS root squashing.
- **[Linux Privilege Escalation — Exploitation](/cheatsheet/linux/privesc-exploitation)**
  - Step-by-step kill chains for sudo abuse, SUID/capabilities, PATH hijacking, cron exploitation, NFS `no_root_squash`, and runtime process hunting with `pspy`.
- **[Linux Shell Upgrades](/cheatsheet/linux/Shell_Upgrades)**
  - Upgrading basic reverse shells to fully interactive TTYs using Penelope, `python/pty`, `socat`, `stty raw -echo`, and SSH tunneling.
- **[MSFvenom Payload Cheat Sheet](/cheatsheet/Tools/MSFvenom)**
  - Payload generation across Windows, Linux, macOS, Web, and Mobile—staged vs. stageless selection, encoding, encryption, bad-character handling, template injection, and handlers.
- **[File Transfer Techniques](/cheatsheet/Tools/file-transfer-techniques)**
  - Living-off-the-land techniques for moving tools and exfiltrating loot across Linux & Windows using HTTP/S, SMB, FTP, SCP, Netcat, PowerShell, `certutil`, and `bitsadmin`.

---

### Custom Open-Source Tools & Repositories (/tools)

Locally built offensive tooling designed for speed, accuracy, and operational security.

| Tool Name                                                                                                    | Language | Description & GitHub Repository                                                                                                                                     |
| :----------------------------------------------------------------------------------------------------------- | :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **[pharaohound](https://github.com/Asbawy/pharaohound)**                                                     | `Python` | Lightweight, CLI-first Active Directory & Azure analysis engine that stream-parses raw BloodHound JSON data to map attack paths and generate exploitation commands. |
| **[dedjs](https://github.com/Asbawy/dedjs)**                                                                 | `Python` | Context-aware JavaScript static analysis tool for bug bounty and pentesting—correlating user-controlled sources with dangerous sinks to eliminate false positives.  |
| **[dedjwt](https://github.com/Asbawy/dedjwt)**                                                               | `Python` | High-performance Python tool designed for rapid JWT token secret brute-forcing and token tampering.                                                                 |
| **[NFR](https://github.com/Asbawy/NFR)**                                                                     | `Python` | Multithreaded race condition testing automation for identifying concurrency vulnerabilities in web APIs.                                                            |
| **[GrafTraverse-CVE-2021-43798](https://github.com/Asbawy/GrafTraverse-CVE-2021-43798)**                     | `Python` | Automated exploitation framework for Grafana directory traversal (CVE-2021-43798) with custom file extraction payloads.                                             |
| **[Automation-for-Juniper-cve-2023-36845](https://github.com/Asbawy/Automation-for-Juniper-cve-2023-36845)** | `Shell`  | Streamlined Bash automation script for detecting and exploiting Juniper Junos OS CVE-2023-36845.                                                                    |

---

## Getting Started & Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/Asbawy/Asbawy.github.io.git
cd Asbawy.github.io
```

### 2. Install Dependencies

We recommend using [Bun](https://bun.sh/) for ultra-fast dependency installation and script execution:

```bash
bun install
# or with npm / pnpm
npm install
```

### 3. Run Development Server

```bash
bun run dev
```

Open your browser and navigate to `http://localhost:3000`. Hot Module Replacement (HMR) is enabled for instant feedback.

### 4. Build for Production

To test the production build and pre-render static HTML routes:

```bash
bun run build
bun run serve
```
