import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Zap,
  Layers,
  Sparkles,
  Server,
  Key,
  ShieldAlert,
  FolderGit2,
  Info,
} from "lucide-react";

interface Token {
  id: string;
  label: string;
  category: "engine" | "protocol" | "target" | "auth" | "action" | "module";
  color: string;
  tag: string;
  description: string;
  details: string;
  examples: string[];
}

interface CommandPreset {
  id: string;
  title: string;
  protocol: string;
  tokens: Token[];
}

const PRESETS: CommandPreset[] = [
  {
    id: "smb-spider",
    title: "SMB Share Spidering & Analysis",
    protocol: "SMB",
    tokens: [
      {
        id: "engine",
        label: "nxc",
        category: "engine",
        color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
        tag: "CLI Binary",
        description: "The primary NetExec binary executing the asynchronous task loop.",
        details: "Loads local SQLite cache from ~/.nxc, manages socket thread pools, and handles module dispatching.",
        examples: ["nxc --version", "nxc --help", "nxc db"],
      },
      {
        id: "proto",
        label: "smb",
        category: "protocol",
        color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
        tag: "Protocol Engine",
        description: "Target network protocol module (TCP 445 / 139).",
        details: "Directs communication through Impacket's SMB stack, supporting SMBv1, SMBv2, and SMBv3.",
        examples: ["smb", "ldap", "winrm", "mssql", "rdp", "wmi", "ssh"],
      },
      {
        id: "target",
        label: "10.10.10.0/24",
        category: "target",
        color: "text-blue-400 border-blue-500/40 bg-blue-500/10",
        tag: "Scope / Target",
        description: "Target address range, individual host, or target list.",
        details: "Supports CIDR blocks (/24), IP ranges (10.10.10.1-50), hostnames, and multi-line targets.txt files.",
        examples: ["10.10.10.100", "dc01.corp.local", "10.10.10.0/24", "targets.txt"],
      },
      {
        id: "auth",
        label: "-u 'Administrator' -H '8846f7eaee...'",
        category: "auth",
        color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
        tag: "Identity & Credentials",
        description: "User authentication via NTLM Pass-the-Hash (PtH).",
        details: "Accepts 32-character NT hashes, LM:NT pairs, plaintext passwords (-p), or Kerberos ticket caches (-k).",
        examples: ["-u 'Admin' -p 'Pass123'", "-u 'Admin' -H '8846...'", "-u 'jdoe' -k --use-kcache"],
      },
      {
        id: "action",
        label: "--shares",
        category: "action",
        color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
        tag: "Assessment Action",
        description: "Enumerates all SMB shares and validates READ/WRITE permissions.",
        details: "Checks accessibility of administrative shares (C$, ADMIN$, IPC$) and public file repositories.",
        examples: ["--shares", "--sam", "--lsa", "--ntds", "--pass-pol", "--sessions"],
      },
      {
        id: "module",
        label: "-M spider_plus",
        category: "module",
        color: "text-rose-400 border-rose-500/40 bg-rose-500/10",
        tag: "Extended Module",
        description: "Executes the high-speed spider_plus community module.",
        details: "Generates a structured JSON file index of all readable files while ignoring designated directory noise.",
        examples: ["-M spider_plus", "-M nanodump", "-M lsassy", "-M slinky", "-M adcs"],
      },
    ],
  },
  {
    id: "ldap-bh",
    title: "LDAP BloodHound CE Ingestion",
    protocol: "LDAP",
    tokens: [
      {
        id: "engine",
        label: "nxc",
        category: "engine",
        color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
        tag: "CLI Binary",
        description: "The primary NetExec binary executing the asynchronous task loop.",
        details: "Coordinates the LDAP query pipeline without invoking external PowerShell binaries.",
        examples: ["nxc --version", "nxc db"],
      },
      {
        id: "proto",
        label: "ldap",
        category: "protocol",
        color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
        tag: "Protocol Engine",
        description: "Active Directory LDAP directory service (TCP 389 / 636).",
        details: "Connects to LDAP/LDAPS to inspect Active Directory schemas, objects, ACLs, and trust paths.",
        examples: ["ldap", "smb", "winrm"],
      },
      {
        id: "target",
        label: "dc01.corp.local",
        category: "target",
        color: "text-blue-400 border-blue-500/40 bg-blue-500/10",
        tag: "Scope / Target",
        description: "Domain Controller FQDN hostname.",
        details: "FQDNs are required for Kerberos SPN construction and DNS TCP resolution.",
        examples: ["dc01.corp.local", "10.10.10.10"],
      },
      {
        id: "auth",
        label: "-u 'jdoe' -p 'Welcome2026!'",
        category: "auth",
        color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
        tag: "Identity & Credentials",
        description: "Standard domain user credentials.",
        details: "Any valid domain user account possesses baseline query rights across Active Directory objects.",
        examples: ["-u 'jdoe' -p 'Welcome2026!'", "-u 'jdoe' -k --use-kcache"],
      },
      {
        id: "action",
        label: "--bloodhound",
        category: "action",
        color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
        tag: "Assessment Action",
        description: "Triggers native BloodHound CE graph data collection.",
        details: "Collects users, groups, sessions, trusts, and ACLs directly into BloodHound-compatible JSON archives.",
        examples: ["--bloodhound", "--kerberoasting", "--asreproast", "--find-delegation"],
      },
      {
        id: "module",
        label: "--collection All --dns-tcp",
        category: "module",
        color: "text-rose-400 border-rose-500/40 bg-rose-500/10",
        tag: "Collection Options",
        description: "Configures complete graph scope and forces TCP DNS queries.",
        details: "Ensures large DNS response packets aren't truncated by UDP packet limits.",
        examples: ["--collection All", "--collection DCOnly", "--dns-server 10.10.10.1"],
      },
    ],
  },
  {
    id: "winrm-exec",
    title: "WinRM Remote Execution",
    protocol: "WinRM",
    tokens: [
      {
        id: "engine",
        label: "nxc",
        category: "engine",
        color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
        tag: "CLI Binary",
        description: "The primary NetExec binary executing the asynchronous task loop.",
        details: "Invokes the WinRM client layer to connect to the remote WS-Management listener.",
        examples: ["nxc"],
      },
      {
        id: "proto",
        label: "winrm",
        category: "protocol",
        color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
        tag: "Protocol Engine",
        description: "Windows Remote Management interface (TCP 5985 / 5986).",
        details: "Executes administrative commands without touching SMB port 445 or creating Windows services.",
        examples: ["winrm", "wmi", "smb"],
      },
      {
        id: "target",
        label: "10.10.10.100",
        category: "target",
        color: "text-blue-400 border-blue-500/40 bg-blue-500/10",
        tag: "Scope / Target",
        description: "Target Windows workstation or server IP address.",
        details: "Target must have WinRM service enabled and port 5985/5986 open.",
        examples: ["10.10.10.100", "server01.corp.local"],
      },
      {
        id: "auth",
        label: "-u 'Administrator' -p 'P@ssw0rd123'",
        category: "auth",
        color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
        tag: "Identity & Credentials",
        description: "Local or Domain administrative credentials.",
        details: "User must be a member of Remote Management Users or local Administrators.",
        examples: ["-u 'Administrator' -p 'P@ssw0rd123'", "-u 'Admin' -H 'hash...'"],
      },
      {
        id: "action",
        label: "-X 'Get-Process'",
        category: "action",
        color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
        tag: "Assessment Action",
        description: "Executes a native PowerShell command string remotely.",
        details: "Uses -X for PowerShell syntax or -x for standard cmd.exe execution.",
        examples: ["-X 'Get-Process'", "-x 'whoami /all'", "-X 'Get-Service'"],
      },
      {
        id: "module",
        label: "--no-output",
        category: "module",
        color: "text-rose-400 border-rose-500/40 bg-rose-500/10",
        tag: "Execution Flags",
        description: "Optional flag to suppress output or stream logs to file.",
        details: "Ensures stealth when executing persistent scripts or blind triggers.",
        examples: ["--no-output", "--timeout 10"],
      },
    ],
  },
];

export const NetExecCommandAnatomy = () => {
  const [activePresetId, setActivePresetId] = useState<string>("smb-spider");
  const [selectedTokenId, setSelectedTokenId] = useState<string>("auth");
  const [copied, setCopied] = useState(false);

  const activePreset = PRESETS.find((p) => p.id === activePresetId) || PRESETS[0];
  const fullCommandString = activePreset.tokens.map((t) => t.label).join(" ");
  const activeToken = activePreset.tokens.find((t) => t.id === selectedTokenId) || activePreset.tokens[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCommandString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-10 rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e1422]/95 via-[#0b0f19]/98 to-[#06090e]/100 p-6 font-sans shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Cyber Glow Accents */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Top Header & Preset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Interactive Syntax Dissector
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
            NetExec Command Architecture & Token Anatomy
          </h3>
          <p className="text-xs text-slate-400 m-0 mt-1">
            Click any token in the command stream below to inspect its operational mechanism, syntax rules, and alternatives.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs font-mono">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setActivePresetId(preset.id);
                setSelectedTokenId(preset.tokens[3]?.id || preset.tokens[0].id);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activePresetId === preset.id
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {preset.title.split(" ")[0]} ({preset.protocol})
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Tokenized Terminal View */}
      <div className="my-6">
        <div className="rounded-xl border border-white/15 bg-black/70 p-4 shadow-inner relative group">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-300 font-semibold">{activePreset.title}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono transition-all cursor-pointer"
              title="Copy complete command"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy Command"}</span>
            </button>
          </div>

          {/* Token Pills */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs sm:text-sm py-2">
            {activePreset.tokens.map((token) => {
              const isSelected = token.id === selectedTokenId;
              return (
                <button
                  key={token.id}
                  onClick={() => setSelectedTokenId(token.id)}
                  className={`px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer relative group flex items-center gap-1.5 ${
                    token.color
                  } ${
                    isSelected
                      ? "ring-2 ring-white/40 ring-offset-2 ring-offset-black scale-105 shadow-lg"
                      : "opacity-85 hover:opacity-100 hover:scale-102"
                  }`}
                >
                  <span className="font-bold">{token.label}</span>
                </button>
              );
            })}
          </div>

          {/* Under-token indicator labels */}
          <div className="hidden lg:grid grid-cols-6 gap-2 mt-4 pt-3 border-t border-white/10 text-[10px] font-mono text-center">
            {activePreset.tokens.map((token) => (
              <div
                key={token.id}
                onClick={() => setSelectedTokenId(token.id)}
                className={`cursor-pointer transition-colors p-1.5 rounded-md ${
                  token.id === selectedTokenId
                    ? "text-cyan-300 font-bold bg-white/5"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <div className="uppercase tracking-wider text-[9px] opacity-75">{token.category}</div>
                <div className="truncate text-slate-300 mt-0.5">{token.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Token Inspector Drawer */}
      <div className="rounded-xl border border-white/10 bg-[#090e18]/90 p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white m-0">{activeToken.tag}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 uppercase">
                  {activeToken.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 m-0 mt-0.5">{activeToken.description}</p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            Token: <span className="text-white font-semibold">{activeToken.label}</span>
          </div>
        </div>

        {/* Technical Details & Mechanics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3.5">
            <div className="text-[11px] font-mono font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Operational Mechanics
            </div>
            <p className="text-xs text-slate-300 m-0 leading-relaxed">{activeToken.details}</p>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3.5">
            <div className="text-[11px] font-mono font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Alternative Formats & Syntax
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeToken.examples.map((ex) => (
                <span
                  key={ex}
                  className="px-2 py-1 rounded bg-black/50 border border-white/10 text-emerald-300 font-mono text-[11px]"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
