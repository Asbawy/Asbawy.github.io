import React, { useState } from "react";
import {
  Server,
  Shield,
  Database,
  Terminal,
  Cpu,
  Key,
  Flame,
  Radio,
  Share2,
  HardDrive,
  Lock,
  Eye,
  Activity,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";

interface ProtocolNode {
  id: string;
  name: string;
  category: "identity" | "exec" | "secrets";
  port: string;
  transport: string;
  summary: string;
  command: string;
  modules: string[];
  opsec: "Low Risk" | "Medium Risk" | "High Risk (Creates Service/Noise)";
}

const PROTOCOLS: ProtocolNode[] = [
  {
    id: "ldap",
    name: "LDAP / LDAPS",
    category: "identity",
    port: "389 / 636",
    transport: "TCP / Kerberos / TLS",
    summary: "Active Directory object enumeration, bloodhound collection, delegation checks, and ADCS audits.",
    command: "nxc ldap 10.10.10.10 -u 'jdoe' -p 'Pass123' --bloodhound -c All",
    modules: ["adcs", "maq", "pre2k", "whisker", "rbcd", "ldap-checker"],
    opsec: "Low Risk",
  },
  {
    id: "kerberos",
    name: "Kerberos & PKINIT",
    category: "identity",
    port: "88",
    transport: "TCP / UDP",
    summary: "Stealthy authentication avoiding NTLM challenge-response. AS-REP roasting and Kerberoasting.",
    command: "nxc ldap dc01.corp.local -u 'jdoe' -p 'Pass123' --kerberoasting hashes.txt",
    modules: ["--use-kcache", "--aesKey", "--pfx", "--cert-pem"],
    opsec: "Low Risk",
  },
  {
    id: "smb",
    name: "SMB / CIFS",
    category: "exec",
    port: "445 / 139",
    transport: "TCP / NetBIOS",
    summary: "Share enumeration, file spidering, relay target lists, local SAM/LSA dumping, and remote command execution.",
    command: "nxc smb 10.10.10.0/24 -u 'Admin' -H 'hash...' --sam --lsa",
    modules: ["spider_plus", "lsassy", "nanodump", "slinky", "coerce_plus"],
    opsec: "Medium Risk",
  },
  {
    id: "winrm",
    name: "WinRM",
    category: "exec",
    port: "5985 / 5986",
    transport: "HTTP / HTTPS SOAP",
    summary: "Administrative remote PowerShell execution without dropping temporary binaries or creating Windows services.",
    command: "nxc winrm 10.10.10.100 -u 'Admin' -p 'Pass123' -X 'Get-Process'",
    modules: ["-x (cmd)", "-X (PowerShell)"],
    opsec: "Low Risk",
  },
  {
    id: "wmi",
    name: "Native WMI",
    category: "exec",
    port: "135 / RPC",
    transport: "DCOM / RPC",
    summary: "Native WMI protocol execution spawning processes under WmiPrvSE.exe without touching SMB services.",
    command: "nxc wmi 10.10.10.100 -u 'Admin' -p 'Pass123' -x 'whoami'",
    modules: ["Process.Create", "WMI queries"],
    opsec: "Low Risk",
  },
  {
    id: "mssql",
    name: "MSSQL Server",
    category: "exec",
    port: "1433",
    transport: "TDS / TCP",
    summary: "SQL query execution, privilege escalation through DB links, and OS command execution via xp_cmdshell.",
    command: "nxc mssql 10.10.10.50 -u 'sa' -p 'Pass123' -x 'whoami'",
    modules: ["mssql_priv", "xp_cmdshell", "xp_dirtree"],
    opsec: "Medium Risk",
  },
  {
    id: "rdp",
    name: "RDP / Desktop",
    category: "exec",
    port: "3389",
    transport: "TCP / RDP",
    summary: "Network Level Authentication (NLA) verification, Restricted Admin validation, and unauthenticated screenshots.",
    command: "nxc rdp 10.10.10.100 --screenshot --res 1024x768",
    modules: ["--screenshot", "--nla"],
    opsec: "Low Risk",
  },
  {
    id: "secrets",
    name: "Secrets & Vault",
    category: "secrets",
    port: "Local / RPC",
    transport: "DRSUAPI / LSASS / DPAPI",
    summary: "Extraction of SAM, LSA, DPAPI, NTDS.dit via DCSync, Windows LAPS passwords, and LSASS memory parsing.",
    command: "nxc smb dc01.corp.local -u 'Admin' -p 'Pass123' --ntds",
    modules: ["nanodump", "handlekatz", "lsassy", "ntdsutil", "--laps"],
    opsec: "High Risk (Creates Service/Noise)",
  },
  {
    id: "db",
    name: "SQLite Engine",
    category: "secrets",
    port: "Internal",
    transport: "SQLite (~/.nxc)",
    summary: "Automated indexing of credentials, discovered hosts, pwned administrative status, and relay target exports.",
    command: "nxc db creds --pwn3d --export hashcat -o cracked.txt",
    modules: ["workspace", "creds", "hosts", "export"],
    opsec: "Low Risk",
  },
];

export const NetExecArchitecture = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "identity" | "exec" | "secrets">("all");
  const [selectedId, setSelectedId] = useState<string>("smb");

  const selectedNode = PROTOCOLS.find((p) => p.id === selectedId) || PROTOCOLS[2];

  const filteredNodes = PROTOCOLS.filter((node) => {
    if (activeFilter === "all") return true;
    return node.category === activeFilter;
  });

  return (
    <div className="my-10 rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d131f]/95 via-[#0a0e17]/98 to-[#06090e]/100 p-6 font-sans shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Background Cyber Mesh Accent */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Status & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="relative flex h-3 w-3 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </div>
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
              Interactive Topology Matrix
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
            NetExec Architecture & Protocol Pipeline
          </h3>
          <p className="text-xs text-slate-400 m-0 mt-1">
            Explore how NetExec coordinates multi-protocol enumeration, credential harvesting, and execution.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs font-mono">
          {(
            [
              { id: "all", label: "All Nodes" },
              { id: "identity", label: "Directory & Auth" },
              { id: "exec", label: "Execution & Ops" },
              { id: "secrets", label: "Harvest & DB" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Central Engine Banner Node */}
      <div className="my-6 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500" />
        <div className="relative rounded-xl border border-cyan-500/30 bg-[#0c1424]/90 p-4.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white m-0">NetExec Core Orchestrator (`nxc`)</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Async Python Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 m-0 mt-0.5">
                Central dispatcher managing concurrent network sockets, rate-limiters, credential vaults, and community modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300 shrink-0">
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Pool: 100 Threads</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span>DB: ~/.nxc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Interactive Protocol Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-6">
        {filteredNodes.map((node) => {
          const isSelected = node.id === selectedId;
          const categoryColors = {
            identity: {
              border: isSelected ? "border-emerald-500" : "border-emerald-500/20 hover:border-emerald-500/50",
              bg: isSelected ? "bg-emerald-500/10" : "bg-[#0c1520]/80 hover:bg-[#0f1b29]",
              badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
              icon: <Shield className="h-4 w-4 text-emerald-400" />,
            },
            exec: {
              border: isSelected ? "border-cyan-500" : "border-cyan-500/20 hover:border-cyan-500/50",
              bg: isSelected ? "bg-cyan-500/10" : "bg-[#0c1520]/80 hover:bg-[#0f1b29]",
              badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
              icon: <Terminal className="h-4 w-4 text-cyan-400" />,
            },
            secrets: {
              border: isSelected ? "border-amber-500" : "border-amber-500/20 hover:border-amber-500/50",
              bg: isSelected ? "bg-amber-500/10" : "bg-[#0c1520]/80 hover:bg-[#0f1b29]",
              badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
              icon: <Key className="h-4 w-4 text-amber-400" />,
            },
          }[node.category];

          return (
            <button
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${categoryColors.border} ${categoryColors.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-black/40 border border-white/5">{categoryColors.icon}</span>
                  <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {node.name}
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${categoryColors.badge}`}>
                  Port {node.port}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 m-0 leading-relaxed">{node.summary}</p>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{node.transport}</span>
                <span className="flex items-center text-cyan-400 group-hover:translate-x-1 transition-transform">
                  Inspect <ChevronRight className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Details Drawer */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#080d16]/95 p-5 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h4 className="text-base font-bold text-white m-0">{selectedNode.name} Deep Dive</h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  Default Port: {selectedNode.port}
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0 mt-0.5">{selectedNode.summary}</p>
            </div>
          </div>

          {/* OPSEC Rating Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">OPSEC Profile:</span>
            <span
              className={`px-2.5 py-1 rounded-lg border font-semibold ${
                selectedNode.opsec.includes("Low")
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : selectedNode.opsec.includes("Medium")
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {selectedNode.opsec}
            </span>
          </div>
        </div>

        {/* Command Syntax Card */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              Example Operational Invocation
            </span>
            <span className="text-slate-500">Live Syntax</span>
          </div>
          <div className="rounded-lg bg-black/60 border border-white/10 p-3 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
            <code>{selectedNode.command}</code>
          </div>
        </div>

        {/* Active Modules Tag Bar */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-400" /> Featured Modules:
          </span>
          {selectedNode.modules.map((mod) => (
            <span
              key={mod}
              className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-slate-300 font-mono text-[11px]"
            >
              {mod}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
