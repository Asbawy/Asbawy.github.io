# NetExec (nxc) Operational Cheat Sheet Design Specification

- **Date**: 2026-09-14
- **Target File**: `src/data/cheatsheets/Tools/NetExec.mdx`
- **Category**: Tools
- **Audience**: Security Researchers, Penetration Testers, Red Teams, and Blue Team Defenders.

---

## 1. Goal & Strategic Objective

Transform the basic, repetitive NetExec GitBook command dump into an industry-grade, operational reference manual tailored for `Asbawy.github.io`. 

The cheatsheet avoids passive copy-pasting, reflects modern NetExec (`nxc`) v1.x+ features and protocols, organizes commands logically by assessment lifecycle phases, and provides defensive telemetry (Windows Event IDs) to embody the philosophy of *"Observe -> Deconstruct -> Imagine -> Build"*.

---

## 2. Technical Architecture & Structure

The cheatsheet will reside at `src/data/cheatsheets/Tools/NetExec.mdx` and follow the exact frontmatter and styling schema established by `MSFvenom.mdx`.

### Frontmatter
```yaml
---
title: "NetExec (nxc) Operational Cheat Sheet"
excerpt: "Comprehensive, tradecraft-driven reference for NetExec (nxc). Covers multi-protocol enumeration (SMB, LDAP, WinRM, MSSQL, RDP, WMI, SSH, VNC, FTP), safe password spraying, credential harvesting, BloodHound CE collection, execution methods, and detection telemetry."
url: "https://asbawy.github.io/cheatsheet/Tools/NetExec"
date: "2026-09-14"
updated: "2026-09-14"
category: "Tools"
tags: ["netexec", "nxc", "active-directory", "pentesting", "lateral-movement", "tools"]
difficulty: "Intermediate"
readTime: "22 mins"
---
```

### Document Sections & Operational Progression

1. **Foundations & Core Mechanics**:
   - CLI syntax & target specification (`CIDR`, ranges, files, single host).
   - Global operational flags (`--threads`, `--timeout`, `--jitter`, `--continue-on-success`, `--no-bruteforce`).
   - The Built-in Database Engine (`nxc db`): workspaces, credential tables, host filtering, and data export.
   - Comprehensive Protocol Matrix: 9 supported protocols, ports, auth types, execution capabilities.

2. **Authentication Matrix**:
   - Null & Guest sessions.
   - Local authentication vs Domain authentication (`--local-auth`).
   - NTLM Pass-the-Hash (`-H LM:NT` or `-H NT`).
   - Kerberos Ticketing (`-k`, `--use-kcache`, `--aesKey`, tickets via `KRB5CCNAME`).
   - Certificate / PKINIT Authentication (`--pfx`, `--cert-pem`, `--key-pem`).

3. **Phase 1: Zero-Auth & Low-Privilege Discovery**:
   - SMB signing verification & relay target generation (`--gen-relay-list`).
   - Domain password policy auditing (`--pass-pol`).
   - Anonymous/Guest share and IPC enumeration (`--shares`, `--users`, `--groups`).
   - WebDAV detection (`-M webdav`).

4. **Phase 2: Credential Auditing & Password Spraying**:
   - Safe password spraying methodology: calculating lockout windows, using `--jitter` and `--delay`.
   - Single password vs multiple user spray (`--continue-on-success`).
   - Targeted sprays with credential pairs (`--no-bruteforce`).
   - Cross-protocol credential validation (spraying across SMB, WinRM, SSH, LDAP).

5. **Phase 3: Active Directory & LDAP Deep Dive**:
   - BloodHound CE data collection (`--bloodhound -c All --dns-server ...`).
   - ADCS certificate template audit (`-M adcs`).
   - Delegation discovery (`--find-delegation`, `--trusted-for-delegation`).
   - Kerberoasting (`--kerberoasting`) & AS-REP Roasting (`--asreproast`).
   - Machine account quota & abuse (`-M maq`, `-M pre2k`).
   - Group Managed Service Accounts (gMSA) extraction & decryption (`--gmsa`, `--gmsa-decrypt-lsa`).

6. **Phase 4: Multi-Protocol Service Enumeration**:
   - **WinRM**: PowerShell command execution (`-x`, `-X`), script block execution.
   - **MSSQL**: Query execution (`-q`, `-Q`), `xp_cmdshell` enabling/execution, hash theft via `xp_dirtree`, privilege escalation (`-M mssql_priv`).
   - **RDP**: NLA validation, restricted admin mode verification, unauthenticated RDP screenshots (`--screenshot`).
   - **WMI**: Native WMI protocol execution (`nxc wmi`).
   - **SSH / FTP / VNC**: Linux host auth, private key auth, anonymous FTP spidering, VNC screenshotting/auth.

7. **Phase 5: Post-Exploitation, File Hunting & Share Spidering**:
   - Share hunting & file indexing with `spider_plus` JSON cataloging.
   - Selective file upload and download over SMB and MSSQL.
   - Group Policy Preference password extraction (`-M gpp_password`, `-M gpp_autologin`).
   - Malicious shortcut coercion (`-M slinky`).

8. **Phase 6: Credential Extraction & Secrets Harvesting**:
   - Local SAM database dump (`--sam`).
   - LSA secrets extraction (`--lsa`).
   - DPAPI master keys and backup keys (`--dpapi`).
   - Domain-wide NTDS.dit extraction via DRSUAPI (`--ntds`) and VSS (`-M ntdsutil`).
   - LAPS password extraction (legacy `ms-Mcs-AdmPwd` and modern Windows LAPS `msLAPS-Password` via `--laps`).
   - EDR/AV-conscious memory dumps (`-M nanodump`, `-M handlekatz`, `-M lsassy`).

9. **Phase 7: Execution Methods & Lateral Movement Tradecraft**:
   - Comparison matrix: `smbexec` vs `wmiexec` vs `atexec` vs `mmcexec`.
   - Under-the-hood mechanism, disk footprint, and service creation indicators.

10. **Phase 8: Detection, Forensics & Telemetry**:
    - Windows Event ID mapping for NetExec actions (Logon Type 3 `4624`, Failed `4625`, Service Creation `7045`, Share Access `5140`, Kerberos `4768`/`4769`, NTDS replication `4662`).
    - Blue team mitigation strategies and hardening baselines.

---

## 3. Self-Review & Quality Assurance Checklist

- [x] **No Placeholders**: All syntax strings, IP ranges, domains, and flags are concrete and realistic.
- [x] **Internal Consistency**: Matches site typography, metadata schema, and component requirements in `src/data/cheatsheets.ts`.
- [x] **Completeness**: Expands on all original GitBook sections while adding missing protocols (RDP, WMI, VNC, built-in DB) and advanced modern AD attack vectors.
- [x] **Educational & Operational Value**: Integrates detection telemetry and OPSEC commentary to prevent mindless command execution.
