import React, { useState } from "react";
import {
  Radio,
  Server,
  Cloud,
  Shield,
  Lock,
  Cpu,
  Wifi,
  Key,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ChevronRight,
  Skull,
  Eye,
  Zap,
  Target,
  Terminal,
  Network,
  ShieldAlert,
  Container,
  Database,
  Smartphone,
  HardDrive,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   1. 5G ATTACK SURFACE MAP — Interactive layered diagram
   ═══════════════════════════════════════════════════════ */

interface AttackLayer {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  attacks: string[];
  interfaces: string[];
}

const LAYERS: AttackLayer[] = [
  {
    id: "ue",
    label: "UE / SIM",
    icon: <Smartphone className="h-4 w-4" />,
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    bgColor: "bg-violet-500/8",
    attacks: ["SIM Clone", "SUCI De-anonymization", "Baseband Exploit", "Downgrade Attack"],
    interfaces: ["NR Uu"],
  },
  {
    id: "ran",
    label: "RAN (gNodeB / DU / CU)",
    icon: <Radio className="h-4 w-4" />,
    color: "text-cyan-400",
    borderColor: "border-cyan-500/40",
    bgColor: "bg-cyan-500/8",
    attacks: ["Rogue gNodeB", "IMSI Capture", "BBU Firmware Extraction", "MML Injection"],
    interfaces: ["F1-C/F1-U", "eCPRI", "N2/N3"],
  },
  {
    id: "transport",
    label: "Transport",
    icon: <Network className="h-4 w-4" />,
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    bgColor: "bg-amber-500/8",
    attacks: ["IPsec PSK Extraction", "GTP-U Probe", "SCTP INIT Flood", "eCPRI Replay"],
    interfaces: ["IPsec", "SCTP", "GTP-U"],
  },
  {
    id: "core",
    label: "5G Core (SBA)",
    icon: <Server className="h-4 w-4" />,
    color: "text-red-400",
    borderColor: "border-red-500/40",
    bgColor: "bg-red-500/8",
    attacks: ["SSRF via SBI Headers", "NRF Poisoning", "Ghost SMF", "OAuth2 Bypass", "JWT alg=none"],
    interfaces: ["HTTP/2 REST", "N32/SEPP"],
  },
  {
    id: "crypto",
    label: "Crypto / HSM",
    icon: <Lock className="h-4 w-4" />,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-500/8",
    attacks: ["5G-AKA RAND Bias", "SUCI NULL Scheme", "HSM Session Exhaustion", "PKCS#11 Timing"],
    interfaces: ["PKCS#11", "ECIES"],
  },
  {
    id: "k8s",
    label: "Kubernetes / CNF",
    icon: <Container className="h-4 w-4" />,
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/8",
    attacks: ["LFI → SA Token", "Cluster-admin Escalation", "DaemonSet Escape", "Istio mTLS Downgrade"],
    interfaces: ["CNI", "Helm", "etcd"],
  },
  {
    id: "iaas",
    label: "IaaS / Cloud",
    icon: <Cloud className="h-4 w-4" />,
    color: "text-orange-400",
    borderColor: "border-orange-500/40",
    bgColor: "bg-orange-500/8",
    attacks: ["Keystone Token Forgery", "Glance Image Poisoning", "QEMU Escape", "Supply Chain"],
    interfaces: ["OpenStack API", "Nova", "Neutron"],
  },
];

export function AttackSurfaceMap() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  return (
    <div className="my-10 rounded-xl border border-border bg-card/80 overflow-hidden shadow-2xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/20 border border-red-500/40">
            <Target className="h-4 w-4 text-red-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            5G Attack Surface — End-to-End Kill Chain
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-400 uppercase tracking-widest font-semibold">Live Threat Map</span>
        </div>
      </div>

      {/* Layers */}
      <div className="p-4 space-y-2">
        {LAYERS.map((layer, idx) => {
          const isActive = activeLayer === layer.id;
          return (
            <div key={layer.id}>
              <button
                onClick={() => setActiveLayer(isActive ? null : layer.id)}
                className={`w-full text-left rounded-lg border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? `${layer.borderColor} ${layer.bgColor} shadow-lg`
                    : "border-border/50 bg-background/40 hover:border-border hover:bg-muted/20"
                }`}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold text-muted-foreground/50 w-4`}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className={layer.color}>{layer.icon}</span>
                    <span className="text-sm font-semibold text-foreground">{layer.label}</span>
                    <div className="hidden sm:flex items-center gap-1.5 ml-2">
                      {layer.interfaces.map((iface) => (
                        <span
                          key={iface}
                          className="rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground font-medium"
                        >
                          {iface}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{layer.attacks.length} vectors</span>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isActive ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded attacks */}
              {isActive && (
                <div className="mt-1 ml-8 mr-2 mb-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 animate-in slide-in-from-top-2 duration-200">
                  {layer.attacks.map((attack) => (
                    <div
                      key={attack}
                      className={`flex items-center gap-2 rounded-md border ${layer.borderColor} ${layer.bgColor} px-3 py-2 text-xs`}
                    >
                      <AlertTriangle className={`h-3 w-3 ${layer.color} shrink-0`} />
                      <span className="text-foreground/90">{attack}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Connector arrow */}
              {idx < LAYERS.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-2 bg-muted-foreground/20" />
                    <ChevronRight className="h-3 w-3 text-muted-foreground/30 rotate-90" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   2. THREAT ACTOR CARDS
   ═══════════════════════════════════════════════════════ */

interface ThreatActor {
  name: string;
  origin: string;
  targets: string;
  ttps: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const THREAT_ACTORS: ThreatActor[] = [
  {
    name: "Salt Typhoon",
    origin: "PRC-linked APT",
    targets: "U.S. broadband providers, lawful intercept infrastructure",
    ttps: "SBI exploitation, LI system compromise, credential theft from CNF service accounts",
    color: "text-red-400",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/5",
  },
  {
    name: "APT41",
    origin: "China (dual espionage/financial)",
    targets: "Global telecoms, SMS interception for dissident tracking",
    ttps: "SS7/Diameter interworking abuse, SMS lure delivery, supply chain compromise",
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/5",
  },
  {
    name: "APT43",
    origin: "DPRK-linked",
    targets: "Korean & Southeast Asian carriers",
    ttps: "N32/SEPP roaming exploitation, subscriber metadata harvesting, SMS interception",
    color: "text-violet-400",
    borderColor: "border-violet-500/30",
    bgColor: "bg-violet-500/5",
  },
];

export function ThreatActorCards() {
  return (
    <div className="my-10 rounded-xl border border-border bg-card/80 overflow-hidden shadow-2xl font-mono">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/20 border border-red-500/40">
            <Skull className="h-4 w-4 text-red-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Active Threat Actors Targeting 5G
          </span>
        </div>
        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] text-red-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Active
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {THREAT_ACTORS.map((actor) => (
          <div
            key={actor.name}
            className={`rounded-lg border ${actor.borderColor} ${actor.bgColor} p-4 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Eye className={`h-4 w-4 ${actor.color}`} />
              <span className={`text-sm font-bold ${actor.color}`}>{actor.name}</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-muted-foreground uppercase tracking-wider font-semibold">Origin: </span>
                <span className="text-foreground/80">{actor.origin}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase tracking-wider font-semibold">Targets: </span>
                <span className="text-foreground/80">{actor.targets}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase tracking-wider font-semibold">TTPs: </span>
                <span className="text-foreground/80">{actor.ttps}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3. ROGUE gNODEB ATTACK FLOW
   ═══════════════════════════════════════════════════════ */

interface FlowStep {
  num: number;
  from: string;
  fromIcon: React.ReactNode;
  fromColor: string;
  to: string;
  toIcon: React.ReactNode;
  toColor: string;
  action: string;
  critical?: boolean;
  dir?: "right" | "left";
}

const ROGUE_GNB_STEPS: FlowStep[] = [
  { num: 1, from: "Attacker SDR", fromIcon: <Radio className="h-3.5 w-3.5" />, fromColor: "red", to: "Target UE", toIcon: <Smartphone className="h-3.5 w-3.5" />, toColor: "blue", action: "Broadcast rogue SSB (stronger RSRP)", dir: "right" },
  { num: 2, from: "Target UE", fromIcon: <Smartphone className="h-3.5 w-3.5" />, fromColor: "blue", to: "Rogue gNodeB", toIcon: <Radio className="h-3.5 w-3.5" />, toColor: "red", action: "Attach with SUCI (NULL scheme → plaintext SUPI)", dir: "right" },
  { num: 3, from: "Rogue gNodeB", fromIcon: <Radio className="h-3.5 w-3.5" />, fromColor: "red", to: "Target UE", toIcon: <Smartphone className="h-3.5 w-3.5" />, toColor: "blue", action: "Force NEA0 (null cipher) in Security Mode Command", critical: true, dir: "right" },
  { num: 4, from: "Target UE", fromIcon: <Smartphone className="h-3.5 w-3.5" />, fromColor: "blue", to: "Rogue Core", toIcon: <Server className="h-3.5 w-3.5" />, toColor: "red", action: "Complete 5G-AKA — all NAS in cleartext", dir: "right" },
  { num: 5, from: "Rogue Core", fromIcon: <Server className="h-3.5 w-3.5" />, fromColor: "red", to: "Attacker", toIcon: <Terminal className="h-3.5 w-3.5" />, toColor: "red", action: "Log RAND/AUTN/XRES*/K_SEAF vectors", dir: "right" },
];

function FlowStepRow({ step }: { step: FlowStep }) {
  const getColor = (c: string) => {
    switch (c) {
      case "red": return "border-red-500/40 bg-red-500/10 text-red-400";
      case "blue": return "border-blue-500/40 bg-blue-500/10 text-blue-400";
      case "amber": return "border-amber-500/40 bg-amber-500/10 text-amber-400";
      default: return "border-border bg-muted/60 text-foreground/90";
    }
  };

  const isCritical = step.critical;
  const isLeft = step.dir === "left";

  return (
    <div className={`relative flex items-center justify-between gap-1.5 md:gap-3 w-full py-1.5 px-1 rounded-lg transition-all ${isCritical ? "bg-red-950/20 border border-red-500/30" : ""}`}>
      {/* From Node Card */}
      <div
        className={`flex items-center gap-1.5 shrink-0 px-2 md:px-3 py-2 rounded-lg border text-[11px] md:text-xs font-semibold uppercase tracking-wider w-[105px] md:w-[145px] justify-center text-center shadow-sm ${getColor(step.fromColor)}`}
      >
        {step.fromIcon}
        <span className="truncate font-mono">{step.from}</span>
      </div>

      {/* Central Arrow & Action Track */}
      <div className="relative flex-grow flex items-center justify-center min-w-[120px] md:min-w-[200px] h-10 px-1">
        {/* Glowing Arrow Line */}
        <div
          className={`absolute w-full h-[2px] rounded-full ${
            isCritical
              ? "bg-gradient-to-r from-red-500/30 via-red-500 to-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"
              : "bg-gradient-to-r from-cyan-500/20 via-cyan-500/50 to-cyan-500/20"
          }`}
        />

        {/* Directional Arrow Icon */}
        {isLeft ? (
          <ArrowLeft
            className={`absolute left-0 z-10 shrink-0 ${
              isCritical ? "text-red-400 animate-pulse" : "text-cyan-400"
            }`}
            size={16}
          />
        ) : (
          <ArrowRight
            className={`absolute right-0 z-10 shrink-0 ${
              isCritical ? "text-red-400 animate-pulse" : "text-cyan-400"
            }`}
            size={16}
          />
        )}

        {/* Center Action Badge */}
        <div
          className={`relative z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] md:text-[11px] font-mono font-medium tracking-wide shadow-md max-w-[95%] truncate ${
            isCritical
              ? "border-red-500/60 bg-red-950/90 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
              : "border-cyan-500/30 bg-card/95 text-cyan-300 backdrop-blur-sm"
          }`}
        >
          <span
            className={`flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold shrink-0 ${
              isCritical
                ? "bg-red-500/30 text-red-200 border border-red-400/50"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
            }`}
          >
            {step.num}
          </span>
          <span className="truncate">{step.action}</span>
        </div>
      </div>

      {/* To Node Card */}
      <div
        className={`flex items-center gap-1.5 shrink-0 px-2 md:px-3 py-2 rounded-lg border text-[11px] md:text-xs font-semibold uppercase tracking-wider w-[105px] md:w-[145px] justify-center text-center shadow-sm ${getColor(step.toColor)}`}
      >
        {step.toIcon}
        <span className="truncate font-mono">{step.to}</span>
      </div>
    </div>
  );
}

export function RogueGnbFlow() {
  return (
    <div className="my-10 rounded-xl border border-border bg-card/80 overflow-hidden shadow-2xl font-mono">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/20 border border-red-500/40">
            <Radio className="h-4 w-4 text-red-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Rogue gNodeB Attack Flow
          </span>
        </div>
        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] text-red-400 uppercase tracking-widest font-semibold">
          5 Steps
        </span>
      </div>
      <div className="p-4 space-y-4">
        {ROGUE_GNB_STEPS.map((step) => (
          <FlowStepRow key={step.num} step={step} />
        ))}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <Key className="h-4 w-4 text-red-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
            Result: SUPI Exposed + Authentication Vectors Captured + Cleartext NAS Traffic
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   4. GHOST SMF ATTACK SEQUENCE
   ═══════════════════════════════════════════════════════ */

const GHOST_SMF_STEPS: FlowStep[] = [
  { num: 1, from: "Attacker", fromIcon: <Terminal className="h-3.5 w-3.5" />, fromColor: "red", to: "NEF", toIcon: <Server className="h-3.5 w-3.5" />, toColor: "amber", action: "SSRF via Nnef_EventExposure notifUri" },
  { num: 2, from: "NEF (SSRF)", fromIcon: <Server className="h-3.5 w-3.5" />, fromColor: "amber", to: "NRF", toIcon: <Database className="h-3.5 w-3.5" />, toColor: "amber", action: "Reach internal NRF via SSRF" },
  { num: 3, from: "Attacker", fromIcon: <Terminal className="h-3.5 w-3.5" />, fromColor: "red", to: "NRF", toIcon: <Database className="h-3.5 w-3.5" />, toColor: "amber", action: "Register rogue SMF via Nnrf_NFRegister", critical: true },
  { num: 4, from: "AMF", fromIcon: <Server className="h-3.5 w-3.5" />, fromColor: "blue", to: "Rogue SMF", toIcon: <Terminal className="h-3.5 w-3.5" />, toColor: "red", action: "Sends PDU sessions to rogue SMF" },
  { num: 5, from: "Rogue SMF", fromIcon: <Terminal className="h-3.5 w-3.5" />, fromColor: "red", to: "Real SMF", toIcon: <Server className="h-3.5 w-3.5" />, toColor: "blue", action: "Forward traffic (full MITM — zero degradation)" },
];

export function GhostSmfFlow() {
  return (
    <div className="my-10 rounded-xl border border-border bg-card/80 overflow-hidden shadow-2xl font-mono">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/20 border border-amber-500/40">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Ghost SMF — NRF Poisoning Kill Chain
          </span>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] text-amber-400 uppercase tracking-widest font-semibold">
          MITM
        </span>
      </div>
      <div className="p-4 space-y-4">
        {GHOST_SMF_STEPS.map((step) => (
          <FlowStepRow key={step.num} step={step} />
        ))}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <Eye className="h-4 w-4 text-amber-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Result: Full PDU Session Interception — SUPI, TEID, QFI, SMS, Location
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   5. BASEBAND-TO-CLOUD KILL CHAIN TIMELINE
   ═══════════════════════════════════════════════════════ */

interface KillChainDay {
  day: string;
  title: string;
  detail: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
}

const KILL_CHAIN_DAYS: KillChainDay[] = [
  { day: "Day 0", title: "Physical Access", detail: "UART dump → U-Boot → SPI flash image from cell-site BBU cabinet", icon: <HardDrive className="h-3.5 w-3.5" />, color: "text-slate-300", borderColor: "border-slate-400/40", bgColor: "bg-slate-500/8" },
  { day: "Day 1", title: "Firmware RE", detail: "Extract /etc/ipsec.secrets → IPsec PSK for transport network", icon: <Cpu className="h-3.5 w-3.5" />, color: "text-slate-400", borderColor: "border-slate-400/40", bgColor: "bg-slate-500/8" },
  { day: "Day 2", title: "Transport Pivot", detail: "IPsec tunnel into 5G core transport VLAN — bypass all edge firewalls", icon: <Network className="h-3.5 w-3.5" />, color: "text-cyan-400", borderColor: "border-cyan-500/40", bgColor: "bg-cyan-500/8" },
  { day: "Day 3", title: "Core Recon", detail: "SCTP scan of AMF pool → find debug port 8080 (Open5GS WebUI)", icon: <Target className="h-3.5 w-3.5" />, color: "text-cyan-400", borderColor: "border-cyan-500/40", bgColor: "bg-cyan-500/8" },
  { day: "Day 4", title: "K8s Initial Access", detail: "LFI in AMF WebUI → K8s service account token → cluster-admin", icon: <Terminal className="h-3.5 w-3.5" />, color: "text-amber-400", borderColor: "border-amber-500/40", bgColor: "bg-amber-500/8" },
  { day: "Day 5", title: "Secret Dump", detail: "Dump all 5g-core secrets → mTLS certs + NRF JWT signing key", icon: <Key className="h-3.5 w-3.5" />, color: "text-amber-400", borderColor: "border-amber-500/40", bgColor: "bg-amber-500/8" },
  { day: "Day 6", title: "Ghost SMF", detail: "Register rogue SMF via NRF → intercept all new PDU sessions", icon: <ShieldAlert className="h-3.5 w-3.5" />, color: "text-red-400", borderColor: "border-red-500/40", bgColor: "bg-red-500/8" },
  { day: "Day 7", title: "Data Exfiltration", detail: "SUPI, TEID, location, SMS content for 50k subscribers", icon: <Eye className="h-3.5 w-3.5" />, color: "text-red-400", borderColor: "border-red-500/40", bgColor: "bg-red-500/8" },
  { day: "Day 8", title: "IaaS Pivot", detail: "Keystone token from metadata service → full OpenStack API access", icon: <Cloud className="h-3.5 w-3.5" />, color: "text-red-500", borderColor: "border-red-600/40", bgColor: "bg-red-600/8" },
  { day: "Day 9", title: "Hypervisor Root", detail: "Glance image upload → Nova boot → QEMU escape → host root", icon: <Server className="h-3.5 w-3.5" />, color: "text-red-500", borderColor: "border-red-600/40", bgColor: "bg-red-600/8" },
  { day: "Day 10", title: "HSM Compromise", detail: "PKCS#11 → C_WrapKey to attacker HSM → operator master K extracted", icon: <Lock className="h-3.5 w-3.5" />, color: "text-red-600", borderColor: "border-red-700/40", bgColor: "bg-red-700/8" },
  { day: "Day 11+", title: "Total Network Pwn", detail: "Real-time tracking, SMS interception, unauthorized wiretaps, persistent backdoor", icon: <Skull className="h-3.5 w-3.5" />, color: "text-red-600", borderColor: "border-red-700/50", bgColor: "bg-red-700/10" },
];

export function KillChainTimeline() {
  return (
    <div className="my-10 rounded-xl border border-border bg-card/80 overflow-hidden shadow-2xl font-mono">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/20 border border-red-500/40">
            <Zap className="h-4 w-4 text-red-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Baseband to Cloud — Full Kill Chain
          </span>
        </div>
        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] text-red-400 uppercase tracking-widest font-semibold">
          12 Phases
        </span>
      </div>

      <div className="p-4 space-y-2">
        {KILL_CHAIN_DAYS.map((step, idx) => (
          <div key={idx} className="group">
            {/* Card */}
            <div className={`rounded-lg border ${step.borderColor} bg-background/60 overflow-hidden transition-all duration-200 hover:shadow-md`}>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${step.color}`}>{step.day}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{step.title}</span>
                </div>
              </div>
              <div className="px-4 pb-2.5">
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   6. IMPACT STATS DASHBOARD
   ═══════════════════════════════════════════════════════ */

interface ImpactStat {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const IMPACT_STATS: ImpactStat[] = [
  { label: "Attack Layers", value: "7", icon: <Target className="h-5 w-5" />, color: "text-cyan-400" },
  { label: "Attack Vectors", value: "30+", icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-400" },
  { label: "3GPP Specs Referenced", value: "12", icon: <Database className="h-5 w-5" />, color: "text-amber-400" },
  { label: "Open Source Tools", value: "25+", icon: <Terminal className="h-5 w-5" />, color: "text-emerald-400" },
];

export function ImpactDashboard() {
  return (
    <div className="my-10 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
      {IMPACT_STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card/80 p-4 text-center transition-all duration-200 hover:shadow-md hover:border-border"
        >
          <div className={`flex justify-center mb-2 ${stat.color}`}>{stat.icon}</div>
          <div className="text-2xl font-black text-foreground">{stat.value}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   7. SUCI PRIVACY FLOW
   ═══════════════════════════════════════════════════════ */

export function SuciFlow() {
  const [showVuln, setShowVuln] = useState(false);

  return (
    <div className="my-10 rounded-xl border border-border bg-card/80 overflow-hidden shadow-2xl font-mono">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/20 border border-emerald-500/40">
            <Lock className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            SUCI Privacy Protection — Normal vs. NULL Scheme
          </span>
        </div>
        <button
          onClick={() => setShowVuln(!showVuln)}
          className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] text-red-400 uppercase tracking-widest font-semibold cursor-pointer hover:bg-red-500/20 transition-colors"
        >
          {showVuln ? "Show Protected" : "Show Vulnerable"}
        </button>
      </div>

      <div className="p-5">
        {!showVuln ? (
          /* Protected Flow */
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-blue-500/40 bg-blue-500/8 text-blue-400 font-semibold w-24 justify-center">
                <Smartphone className="h-3.5 w-3.5" /> UE
              </div>
              <div className="flex-1 relative h-8 flex items-center">
                <div className="w-full h-[2px] bg-emerald-500/40" />
                <ArrowRight className="absolute right-0 text-emerald-500/60" size={14} />
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-card px-2 text-[10px] text-emerald-400 whitespace-nowrap flex items-center gap-1">
                  <Lock className="h-3 w-3" /> SUCI (ECIES P-256 encrypted)
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-emerald-500/40 bg-emerald-500/8 text-emerald-400 font-semibold w-24 justify-center">
                <Server className="h-3.5 w-3.5" /> AUSF
              </div>
            </div>
            <div className="text-center text-[11px] text-emerald-400 font-semibold">
              ✓ SUPI concealed — IMSI never exposed over the air
            </div>
          </div>
        ) : (
          /* Vulnerable Flow */
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-blue-500/40 bg-blue-500/8 text-blue-400 font-semibold w-24 justify-center">
                <Smartphone className="h-3.5 w-3.5" /> UE
              </div>
              <div className="flex-1 relative h-8 flex items-center">
                <div className="w-full h-[2px] bg-red-500/40" />
                <ArrowRight className="absolute right-0 text-red-500/60" size={14} />
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-card px-2 text-[10px] text-red-400 whitespace-nowrap flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> SUPI (plaintext — NULL scheme 0x0)
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-red-500/40 bg-red-500/8 text-red-400 font-semibold w-24 justify-center">
                <Radio className="h-3.5 w-3.5" /> Rogue
              </div>
            </div>
            <div className="text-center text-[11px] text-red-400 font-semibold">
              ✕ SUPI exposed — attacker captures IMSI in real-time
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   8. 5G KEY HIERARCHY COMPONENT
   ═══════════════════════════════════════════════════════ */

export function FiveGKeyHierarchy() {
  return (
    <div className="my-10 rounded-xl border border-border bg-card/80 overflow-hidden shadow-2xl font-mono">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/20 border border-violet-500/40">
            <Key className="h-4 w-4 text-violet-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            How 5G Keys Are Generated
          </span>
        </div>
        <span className="hidden sm:inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] text-violet-400 uppercase tracking-widest font-semibold">
          Key Hierarchy (TS 33.501)
        </span>
      </div>

      <div className="p-6 flex flex-col items-center gap-4">
        
        {/* Tier 1: Root Keys */}
        <div className="w-full flex justify-between items-center max-w-2xl bg-muted/20 rounded-xl p-4 border border-border/50">
          <div className="flex-1 text-center">
            <div className="inline-flex items-center justify-center gap-2 text-xs font-bold text-violet-400 uppercase mb-1">
              <Smartphone className="h-4 w-4" /> 1. SIM Card (USIM)
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Holds the secret Master Key (K)</p>
          </div>
          
          <div className="px-4 flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest">5G-AKA</span>
            <Lock className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="flex-1 text-center">
            <div className="inline-flex items-center justify-center gap-2 text-xs font-bold text-red-400 uppercase mb-1">
              <Database className="h-4 w-4" /> 1. Telecom Core (UDM)
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Holds the matching Master Key (K)</p>
          </div>
        </div>

        <ArrowDown className="h-5 w-5 text-muted-foreground opacity-50" />

        {/* Tier 2: Home Network Anchor */}
        <div className="w-full max-w-md rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-center">
          <div className="text-xs font-bold text-amber-400 uppercase mb-1">2. Home Network Auth (AUSF)</div>
          <div className="text-[12px] font-mono text-foreground font-semibold">Derives K_AUSF</div>
          <span className="text-[10px] text-muted-foreground block mt-1">Both sides prove who they are. K_AUSF is born.</span>
        </div>

        <ArrowDown className="h-5 w-5 text-muted-foreground opacity-50" />

        {/* Tier 3: Serving Network Anchor */}
        <div className="w-full max-w-md rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-center">
          <div className="text-xs font-bold text-cyan-400 uppercase mb-1">3. Local Core Network (AMF)</div>
          <div className="text-[12px] font-mono text-foreground font-semibold">Derives K_AMF</div>
          <span className="text-[10px] text-muted-foreground block mt-1">The key is passed to the local city's core network.</span>
        </div>

        <ArrowDown className="h-5 w-5 text-muted-foreground opacity-50" />

        {/* Tier 4: Split into NAS and AS */}
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 text-center">
            <div className="text-xs font-bold text-blue-400 uppercase mb-1">4. Core Traffic (NAS Layer)</div>
            <div className="text-[11px] font-mono text-foreground font-semibold">K_NASint / K_NASenc</div>
            <span className="text-[10px] text-muted-foreground block mt-1">Encrypts phone-to-core text messages.</span>
          </div>

          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-center">
            <div className="text-xs font-bold text-emerald-400 uppercase mb-1">4. Radio Traffic (gNodeB)</div>
            <div className="text-[11px] font-mono text-foreground font-semibold">K_RRC / K_UP</div>
            <span className="text-[10px] text-muted-foreground block mt-1">Encrypts phone-to-tower radio signals.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   9. 5G-AKA SEQUENCE DIAGRAM COMPONENT
   ═══════════════════════════════════════════════════════ */

interface AkaStep {
  num: number;
  from: string;
  to: string;
  msg: string;
  note?: string;
  dir: "right" | "left";
}

const AKA_STEPS: AkaStep[] = [
  { num: 1, from: "Phone (UE)", to: "Local Core (AMF)", msg: "Request Connection", note: "Phone sends its hidden identity (SUCI) to the network.", dir: "right" },
  { num: 2, from: "Local Core (AMF)", to: "Main Auth Server (AUSF)", msg: "Verify Identity", note: "Local core asks the main security server to check this user.", dir: "right" },
  { num: 3, from: "Main Auth Server (AUSF)", to: "Database (UDM)", msg: "Generate Security Puzzle", note: "The central database generates a random math challenge (RAND).", dir: "right" },
  { num: 4, from: "Local Core (AMF)", to: "Phone (UE)", msg: "Send Math Challenge", note: "The network sends the challenge to the phone.", dir: "left" },
  { num: 5, from: "Phone (UE)", to: "Phone (UE)", msg: "Solve Challenge inside SIM", note: "The SIM card uses its secret Master Key to solve the puzzle.", dir: "right" },
  { num: 6, from: "Phone (UE)", to: "Local Core (AMF)", msg: "Return Answer", note: "The phone sends its mathematical answer (RES*) back.", dir: "right" },
  { num: 7, from: "Local Core (AMF)", to: "Main Auth Server (AUSF)", msg: "Check Answer", note: "The server checks if the phone's answer matches the correct one.", dir: "right" },
  { num: 8, from: "Main Auth Server (AUSF)", to: "Local Core (AMF)", msg: "Authentication Success", note: "Phone is granted access and encryption keys are generated.", dir: "left" },
];

export function FiveGAkaSequence() {
  return (
    <div className="my-10 rounded-xl border border-border bg-card/80 overflow-hidden shadow-2xl font-mono">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/20 border border-cyan-500/40">
            <Network className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            How 5G Authentication Works
          </span>
        </div>
        <span className="hidden sm:inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] text-cyan-400 uppercase tracking-widest font-semibold">
          8 Steps (Simplified)
        </span>
      </div>

      {/* Actors Banner */}
      <div className="p-4 overflow-x-auto">
        <div className="grid grid-cols-4 gap-2 min-w-[600px] mb-4 pb-3 border-b border-border/60 text-center text-xs font-bold uppercase">
          <div className="py-2 px-1 rounded border border-violet-500/40 bg-violet-500/10 text-violet-400 flex items-center justify-center gap-1">
            <Smartphone className="h-3.5 w-3.5" /> Phone (UE)
          </div>
          <div className="py-2 px-1 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 flex items-center justify-center gap-1">
            <Server className="h-3.5 w-3.5" /> Local Core (AMF)
          </div>
          <div className="py-2 px-1 rounded border border-red-500/40 bg-red-500/10 text-red-400 flex items-center justify-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" /> Main Auth (AUSF)
          </div>
          <div className="py-2 px-1 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center justify-center gap-1">
            <Database className="h-3.5 w-3.5" /> Database (UDM)
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2.5 min-w-[600px]">
          {AKA_STEPS.map((s) => (
            <div key={s.num} className="space-y-1">
              <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg border border-border/50 bg-background/50">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center border border-cyan-500/40">
                    {s.num}
                  </span>
                  <span className="font-semibold text-foreground/90">{s.msg}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                  <span className="text-cyan-400">{s.from}</span>
                  {s.dir === "right" ? <ArrowRight className="h-3 w-3" /> : <ArrowLeft className="h-3 w-3" />}
                  <span className="text-cyan-400">{s.to}</span>
                </div>
              </div>
              {s.note && (
                <div className="ml-7 text-[10px] text-amber-400/90 italic bg-amber-500/5 px-2.5 py-1 rounded border border-amber-500/20">
                  ℹ {s.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   10. KUBERNETES NFV ARCHITECTURE COMPONENT
   ═══════════════════════════════════════════════════════ */

export function K8sNfvArchitecture() {
  return (
    <div className="my-10 rounded-xl border border-border bg-card/80 overflow-hidden shadow-2xl font-mono">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/20 border border-blue-500/40">
            <Container className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            How 5G Runs in the Cloud
          </span>
        </div>
        <span className="hidden sm:inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] text-blue-400 uppercase tracking-widest font-semibold">
          Cloud-Native Architecture
        </span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        
        {/* Layer 1: Telecom Software */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
          <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-bold block mb-2 pl-3">
            1. Telecom Software (The 5G Brain)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-3">
            <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-center">
              <div className="text-sm font-bold text-cyan-100">AMF Pod</div>
              <div className="text-[11px] text-cyan-400/80 mt-1">Handles Logins</div>
            </div>
            <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-center">
              <div className="text-sm font-bold text-cyan-100">SMF Pod</div>
              <div className="text-[11px] text-cyan-400/80 mt-1">Manages Sessions</div>
            </div>
            <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-center">
              <div className="text-sm font-bold text-cyan-100">UPF Pod</div>
              <div className="text-[11px] text-cyan-400/80 mt-1">Routes Internet Data</div>
            </div>
          </div>
        </div>

        {/* Layer 2: Kubernetes Platform */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold block mb-2 pl-3">
            2. Kubernetes Platform (The Engine)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-3">
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center">
              <div className="text-xs font-bold text-emerald-100">Automation</div>
              <div className="text-[10px] text-emerald-400/80 mt-1">K8s Operators auto-fix crashes</div>
            </div>
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center">
              <div className="text-xs font-bold text-emerald-100">Security</div>
              <div className="text-[10px] text-emerald-400/80 mt-1">Service Mesh encrypts traffic</div>
            </div>
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center">
              <div className="text-xs font-bold text-emerald-100">Networking</div>
              <div className="text-[10px] text-emerald-400/80 mt-1">CNI Plugins route packets</div>
            </div>
          </div>
        </div>

        {/* Layer 3: Physical Cloud */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold block mb-2 pl-3">
            3. Physical Infrastructure (The Iron)
          </span>
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-around gap-4 ml-3">
            <div className="text-center">
              <div className="text-xs font-bold text-amber-100">Private Cloud</div>
              <div className="text-[10px] text-amber-400/80 mt-1">OpenStack / VMware</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-amber-100">Bare Metal</div>
              <div className="text-[10px] text-amber-400/80 mt-1">Physical Servers in Telecom Datacenters</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-amber-100">Public Cloud</div>
              <div className="text-[10px] text-amber-400/80 mt-1">AWS / Azure / GCP</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   9. INTERACTIVE TERM TOOLTIP & GLOSSARY WIDGET
   ═══════════════════════════════════════════════════════ */

export interface GlossaryEntry {
  term: string;
  fullName: string;
  category: "Core" | "RAN" | "Crypto" | "Cloud" | "Security" | "Standards" | "Hardware";
  desc: string;
}

export const GLOSSARY_DICT: Record<string, GlossaryEntry> = {
  "3GPP": {
    term: "3GPP",
    fullName: "3rd Generation Partnership Project",
    category: "Standards",
    desc: "The international standards body governing 5G, LTE, and 3G cellular specifications.",
  },
  "5G SA": {
    term: "5G SA",
    fullName: "5G Standalone",
    category: "Core",
    desc: "Pure 5G network architecture operating with a native 5G Core (5GC), independent of legacy 4G LTE EPC.",
  },
  "5G-AKA": {
    term: "5G-AKA",
    fullName: "5G Authentication & Key Agreement",
    category: "Crypto",
    desc: "Primary authentication protocol defined in 3GPP TS 33.501 to derive key hierarchy between UE and network.",
  },
  "AMF": {
    term: "AMF",
    fullName: "Access & Mobility Management Function",
    category: "Core",
    desc: "Core NF responsible for UE connection, registration management, mobility, and NAS ciphering.",
  },
  "AUSF": {
    term: "AUSF",
    fullName: "Authentication Server Function",
    category: "Crypto",
    desc: "Core NF performing 5G-AKA authentication vector verification and key derivation (K_SEAF).",
  },
  "BBU": {
    term: "BBU",
    fullName: "Baseband Unit",
    category: "RAN",
    desc: "Cell-site hardware processing digital radio signals, physical layer, and IPsec transport to core.",
  },
  "CNF": {
    term: "CNF",
    fullName: "Containerized Network Function",
    category: "Cloud",
    desc: "Cloud-native 5G core function running as Kubernetes pods (replacing traditional physical NFs / VNFs).",
  },
  "CU": {
    term: "CU",
    fullName: "Centralized Unit",
    category: "RAN",
    desc: "Upper-layer gNodeB node managing RRC and PDCP protocols in split RAN architectures.",
  },
  "DU": {
    term: "DU",
    fullName: "Distributed Unit",
    category: "RAN",
    desc: "Lower-layer gNodeB node managing RLC, MAC, and High-PHY processing connected via F1/eCPRI.",
  },
  "RU": {
    term: "RU",
    fullName: "Radio Unit",
    category: "RAN",
    desc: "Cellular antenna hardware processing low-PHY and RF signals over the air interface.",
  },
  "ECIES": {
    term: "ECIES",
    fullName: "Elliptic Curve Integrated Encryption Scheme",
    category: "Crypto",
    desc: "Asymmetric encryption scheme used to conceal subscriber identity (SUPI) into SUCI.",
  },
  "eCPRI": {
    term: "eCPRI",
    fullName: "Enhanced Common Public Radio Interface",
    category: "RAN",
    desc: "High-speed Ethernet-based packet protocol linking DU to RU over fronthaul networks.",
  },
  "gNodeB": {
    term: "gNodeB",
    fullName: "Next Generation Node B (gNB)",
    category: "RAN",
    desc: "5G radio base station serving the air interface (NR Uu) to mobile devices.",
  },
  "gNB": {
    term: "gNB",
    fullName: "Next Generation Node B",
    category: "RAN",
    desc: "5G radio base station serving the air interface (NR Uu) to mobile devices.",
  },
  "GTP-U": {
    term: "GTP-U",
    fullName: "GPRS Tunneling Protocol User Plane",
    category: "Core",
    desc: "Protocol tunneling user-plane IP packets between gNodeB, UPF, and external IP networks (N3/N9).",
  },
  "HSM": {
    term: "HSM",
    fullName: "Hardware Security Module",
    category: "Crypto",
    desc: "FIPS-compliant hardware appliance securing operator master key K and generating auth vectors.",
  },
  "IMSI": {
    term: "IMSI",
    fullName: "International Mobile Subscriber Identity",
    category: "Security",
    desc: "Legacy 3G/4G unique subscriber hardware ID (replaced by SUPI in 5G).",
  },
  "LI": {
    term: "LI",
    fullName: "Lawful Interception",
    category: "Security",
    desc: "Architecture for court-authorized wiretapping and traffic mirroring (X1/X2/X3 interfaces).",
  },
  "LIPF": {
    term: "LIPF",
    fullName: "Lawful Interception Point of Function",
    category: "Security",
    desc: "Point of interception embedded inside NFs for intercepting target traffic.",
  },
  "MML": {
    term: "MML",
    fullName: "Man-Machine Language",
    category: "RAN",
    desc: "Command console protocol used for legacy OSS management of telecom base stations.",
  },
  "NEF": {
    term: "NEF",
    fullName: "Network Exposure Function",
    category: "Core",
    desc: "Northbound API gateway exposing 5G core capabilities to external Application Functions (AFs).",
  },
  "NF": {
    term: "NF",
    fullName: "Network Function",
    category: "Core",
    desc: "Modular microservice in 5G Service-Based Architecture (e.g., AMF, SMF, UPF, NRF).",
  },
  "NFV": {
    term: "NFV",
    fullName: "Network Functions Virtualization",
    category: "Cloud",
    desc: "Paradigm of replacing dedicated telecom hardware with software running on cloud/containers.",
  },
  "NRF": {
    term: "NRF",
    fullName: "Network Repository Function",
    category: "Core",
    desc: "Central SBI service registry enabling NFs to discover and authenticate other NFs.",
  },
  "OAM": {
    term: "OAM",
    fullName: "Operations, Administration & Maintenance",
    category: "RAN",
    desc: "Management plane VLAN and interfaces (NETCONF, RESTCONF) controlling cell-site nodes.",
  },
  "PCF": {
    term: "PCF",
    fullName: "Policy Control Function",
    category: "Core",
    desc: "Core NF managing QoS rules, network slicing policies, and subscriber bandwidth limits.",
  },
  "PLMN": {
    term: "PLMN",
    fullName: "Public Land Mobile Network",
    category: "Standards",
    desc: "Unique identifier for a cellular carrier network, composed of MCC (Country) and MNC (Network).",
  },
  "RAN": {
    term: "RAN",
    fullName: "Radio Access Network",
    category: "RAN",
    desc: "Radio side of the cellular network consisting of UEs, gNodeBs, antennas, and fronthaul/midhaul.",
  },
  "SBA": {
    term: "SBA",
    fullName: "Service-Based Architecture",
    category: "Core",
    desc: "5G core architecture where NFs communicate via RESTful HTTP/2 APIs instead of SS7/Diameter.",
  },
  "SBI": {
    term: "SBI",
    fullName: "Service-Based Interface",
    category: "Core",
    desc: "The HTTP/2 REST API control plane interconnecting 5G NFs (3GPP TS 29.500).",
  },
  "LFI": {
    term: "LFI",
    fullName: "Local File Inclusion",
    category: "Security",
    desc: "Vulnerability permitting an attacker to read arbitrary files from the target server's filesystem.",
  },
  "mTLS": {
    term: "mTLS",
    fullName: "Mutual Transport Layer Security",
    category: "Security",
    desc: "Two-way authentication using X.509 client and server certificates to establish encrypted channels.",
  },
  "OAuth2": {
    term: "OAuth2",
    fullName: "Open Authorization 2.0",
    category: "Security",
    desc: "Authorization framework used by NRF to issue access tokens (JWTs) for SBI service authorization.",
  },
  "IPsec": {
    term: "IPsec",
    fullName: "Internet Protocol Security",
    category: "Security",
    desc: "Suite of protocols securing IP communications between gNodeB BBUs and 5G core transport network.",
  },
  "PSK": {
    term: "PSK",
    fullName: "Pre-Shared Key",
    category: "Security",
    desc: "Shared secret used for authenticating IPsec tunnels or IKE exchanges.",
  },
  "JTAG": {
    term: "JTAG",
    fullName: "Joint Test Action Group",
    category: "Hardware",
    desc: "Hardware debugging interface used to access SoC registers, flash memory, and processor execution.",
  },
  "UART": {
    term: "UART",
    fullName: "Universal Asynchronous Receiver-Transmitter",
    category: "Hardware",
    desc: "Serial console hardware interface exposing bootloader shells and system diagnostic logs.",
  },
  "SPI": {
    term: "SPI",
    fullName: "Serial Peripheral Interface",
    category: "Hardware",
    desc: "High-speed bus used for reading/writing flash memory chips (NOR/NAND) storing BBU firmware.",
  },
  "SCTP": {
    term: "SCTP",
    fullName: "Stream Control Transmission Protocol",
    category: "Core",
    desc: "Transport-layer protocol used for 5G N2 signaling (NGAP) and F1-C fronthaul control.",
  },
  "RCE": {
    term: "RCE",
    fullName: "Remote Code Execution",
    category: "Security",
    desc: "Vulnerability enabling arbitrary shell command or binary execution on the target host.",
  },
  "RBAC": {
    term: "RBAC",
    fullName: "Role-Based Access Control",
    category: "Cloud",
    desc: "Kubernetes authorization system assigning API permissions to Service Accounts and Users.",
  },
  "CNI": {
    term: "CNI",
    fullName: "Container Network Interface",
    category: "Cloud",
    desc: "Kubernetes networking plugin framework (e.g. Calico, Cilium, Multus, SR-IOV) routing pod traffic.",
  },
  "IaaS": {
    term: "IaaS",
    fullName: "Infrastructure as a Service",
    category: "Cloud",
    desc: "Cloud infrastructure layer (e.g., OpenStack, AWS, vSphere) hosting Kubernetes nodes and NF VMs.",
  },
  "QoS": {
    term: "QoS",
    fullName: "Quality of Service",
    category: "Core",
    desc: "Resource allocation policies guaranteeing bandwidth, latency, and priority for specific PDU sessions.",
  },
  "TEID": {
    term: "TEID",
    fullName: "Tunnel Endpoint Identifier",
    category: "Core",
    desc: "32-bit ID identifying specific GTP-U tunnels between gNodeB and UPF.",
  },
  "DRB": {
    term: "DRB",
    fullName: "Data Radio Bearer",
    category: "RAN",
    desc: "Radio transport channel carrying user data packets over the NR air interface.",
  },
  "PRB": {
    term: "PRB",
    fullName: "Physical Resource Block",
    category: "RAN",
    desc: "Minimum allocated radio frequency/time resource unit in 5G NR OFDM air interface.",
  },
  "ARFCN": {
    term: "ARFCN",
    fullName: "Absolute Radio Frequency Channel Number",
    category: "RAN",
    desc: "Code structure specifying the exact radio frequency carrier for cellular bands.",
  },
  "PCI": {
    term: "PCI",
    fullName: "Physical Cell ID",
    category: "RAN",
    desc: "Physical layer cell identifier (0-1007) used by UEs to distinguish adjacent 5G base stations.",
  },
  "RSRP": {
    term: "RSRP",
    fullName: "Reference Signal Received Power",
    category: "RAN",
    desc: "Measure of the power level of cellular reference signals received by a UE.",
  },
  "SSB": {
    term: "SSB",
    fullName: "Synchronization Signal Block",
    category: "RAN",
    desc: "Broadcast signal containing PSS, SSS, and PBCH for UE cell search and synchronization.",
  },
  "TMSI": {
    term: "TMSI",
    fullName: "Temporary Mobile Subscriber Identity",
    category: "Security",
    desc: "Temporary randomized identifier assigned to UEs to obscure SUPI/IMSI over radio.",
  },
  "NAS": {
    term: "NAS",
    fullName: "Non-Access Stratum",
    category: "Core",
    desc: "Control plane protocol between UE and AMF for registration, auth, and session control.",
  },
  "AUTN": {
    term: "AUTN",
    fullName: "Authentication Token",
    category: "Crypto",
    desc: "Vector parameter generated by UDM/AUSF to prove network authenticity to the USIM.",
  },
  "RAND": {
    term: "RAND",
    fullName: "Random Challenge",
    category: "Crypto",
    desc: "128-bit random value sent in 5G-AKA authentication requests to challenge the USIM.",
  },
  "XRES*": {
    term: "XRES*",
    fullName: "Expected Authentication Response",
    category: "Crypto",
    desc: "Expected response value calculated during 5G-AKA to verify UE authenticity.",
  },
  "Kseaf": {
    term: "Kseaf",
    fullName: "Key Security Anchor Function",
    category: "Crypto",
    desc: "Anchor key derived by AUSF during 5G-AKA from which K_AMF is generated.",
  },
  "ADMF": {
    term: "ADMF",
    fullName: "Administration Function",
    category: "Security",
    desc: "Central management function in Lawful Interception receiving wiretap targets from law enforcement.",
  },
  "F1": {
    term: "F1",
    fullName: "F1 Interface / Protocol",
    category: "RAN",
    desc: "3GPP standard interface connecting Centralized Unit (CU) and Distributed Unit (DU) in split gNodeB base stations.",
  },
  "YANG": {
    term: "YANG",
    fullName: "Yet Another Next Generation",
    category: "Standards",
    desc: "Data modeling language used with NETCONF to define configuration and state data of network devices.",
  },
  "NETCONF": {
    term: "NETCONF",
    fullName: "Network Configuration Protocol",
    category: "Standards",
    desc: "IETF network management protocol (TCP 830) used to install, manipulate, and delete network device configs.",
  },
  "OSS": {
    term: "OSS",
    fullName: "Operations Support System",
    category: "RAN",
    desc: "Management platform used by operators to monitor network performance, configure cell sites, and provision NFs.",
  },
  "CT": {
    term: "CT",
    fullName: "Certificate Transparency",
    category: "Security",
    desc: "Public append-only log ecosystem for auditing and monitoring issued TLS/SSL certificates.",
  },
  "SEPP": {
    term: "SEPP",
    fullName: "Security Edge Protection Proxy",
    category: "Security",
    desc: "Core network edge gateway that protects and filters roaming signaling traffic between different operators on the N32 interface.",
  },
  "N32": {
    term: "N32",
    fullName: "N32 Interface",
    category: "Security",
    desc: "3GPP roaming control-plane interface connecting Security Edge Protection Proxies (SEPPs) across operators.",
  },
  "UE": {
    term: "UE",
    fullName: "User Equipment",
    category: "RAN",
    desc: "3GPP term for any device used directly by an end-user to communicate (e.g., smartphone, IoT sensor).",
  },
  "SNOW 3G": {
    term: "SNOW 3G",
    fullName: "SNOW 3G Stream Cipher",
    category: "Crypto",
    desc: "Word-based synchronous stream cipher used for radio interface confidentiality and integrity in 3G/4G/5G.",
  },
  "TAC": {
    term: "TAC",
    fullName: "Tracking Area Code",
    category: "Core",
    desc: "Identifier used to locate a mobile device within a specific tracking area of the cellular network.",
  },
  "SUPI": {
    term: "SUPI",
    fullName: "Subscription Permanent Identifier",
    category: "Security",
    desc: "Globally unique 5G subscriber identity, replacing the legacy IMSI, and always transmitted in encrypted form (SUCI) over the air.",
  },
  "SUCI": {
    term: "SUCI",
    fullName: "Subscription Concealed Identifier",
    category: "Security",
    desc: "Privacy-preserving encrypted form of the SUPI sent over the air interface to prevent IMSI catching.",
  },
  "SoC": {
    term: "SoC",
    fullName: "System on a Chip",
    category: "Hardware",
    desc: "Integrated circuit incorporating all components of a computer or electronic system (used heavily in BBUs).",
  },
  "PKCS#11": {
    term: "PKCS#11",
    fullName: "Public-Key Cryptography Standards #11",
    category: "Crypto",
    desc: "Standard API defining an interface to cryptographic tokens and HSMs.",
  },
  "VXLAN": {
    term: "VXLAN",
    fullName: "Virtual Extensible LAN",
    category: "Cloud",
    desc: "Network virtualization technology encapsulating Layer 2 ethernet frames within Layer 4 UDP packets.",
  },
  "UDM": {
    term: "UDM",
    fullName: "Unified Data Management",
    category: "Core",
    desc: "Core NF storing subscriber profiles, keys, and authentication algorithms (similar to HSS in 4G).",
  },
  "UDR": {
    term: "UDR",
    fullName: "Unified Data Repository",
    category: "Core",
    desc: "Backend database storing policy data, subscriber profiles, and structured data for the UDM.",
  },
  "SR-IOV": {
    term: "SR-IOV",
    fullName: "Single Root I/O Virtualization",
    category: "Cloud",
    desc: "PCIe standard enabling a single network adapter to appear as multiple separate physical devices for containerized NFs.",
  },
  "QEMU": {
    term: "QEMU",
    fullName: "Quick Emulator",
    category: "Cloud",
    desc: "Open-source hardware emulator and virtualization suite used in NFV environments.",
  },
  "KVM": {
    term: "KVM",
    fullName: "Kernel-based Virtual Machine",
    category: "Cloud",
    desc: "Virtualization module in the Linux kernel allowing it to function as a hypervisor.",
  },
  "IWF": {
    term: "IWF",
    fullName: "Interworking Function",
    category: "Core",
    desc: "Gateway node translating signaling and protocols between modern 5G SBA and legacy 3G/4G networks.",
  },
  "SMF": {
    term: "SMF",
    fullName: "Session Management Function",
    category: "Core",
    desc: "Core NF managing PDU sessions, IP address allocation, and controlling the UPF via PFCP.",
  },
  "UPF": {
    term: "UPF",
    fullName: "User Plane Function",
    category: "Core",
    desc: "Core NF acting as the high-speed data router and anchor point for subscriber internet traffic.",
  },
  "TTPs": {
    term: "TTPs",
    fullName: "Tactics, Techniques, and Procedures",
    category: "Security",
    desc: "The behavior, methods, and patterns used by threat actors and red teams during an attack lifecycle.",
  },
  "SDR": {
    term: "SDR",
    fullName: "Software-Defined Radio",
    category: "Hardware",
    desc: "Radio communication system where physical layer components (mixers, filters, modulators) are implemented in software.",
  },
  "SMSF": {
    term: "SMSF",
    fullName: "Short Message Service Function",
    category: "Core",
    desc: "Core NF handling SMS delivery and routing over NAS signaling in 5G Standalone networks.",
  },
  "IP-SM-GW": {
    term: "IP-SM-GW",
    fullName: "IP Short Message Gateway",
    category: "Core",
    desc: "Gateway enabling SMS over IP and interworking between 5G SBI protocols and legacy SS7/MAP.",
  },
  "JWT": {
    term: "JWT",
    fullName: "JSON Web Token",
    category: "Security",
    desc: "Compact URL-safe means of representing claims (used heavily by NRF for NF service authorization).",
  },
  "SoftHSM": {
    term: "SoftHSM",
    fullName: "Software HSM",
    category: "Crypto",
    desc: "Software implementation of a cryptographic store with a PKCS#11 interface, used when hardware HSMs are unavailable.",
  },
  "AF": {
    term: "AF",
    fullName: "Application Function",
    category: "Core",
    desc: "External application or server interacting with the 5G Core through the NEF to request QoS or routing changes.",
  },
  "SSRF": {
    term: "SSRF",
    fullName: "Server-Side Request Forgery",
    category: "Security",
    desc: "Vulnerability where an attacker forces a server to make HTTP requests to an arbitrary internal IP or domain.",
  },
  "AES": {
    term: "AES",
    fullName: "Advanced Encryption Standard",
    category: "Crypto",
    desc: "Symmetric block cipher used heavily across 5G (NEA2, NIA2, IPsec, TLS) for data confidentiality.",
  },
  "SCP": {
    term: "SCP",
    fullName: "Service Communication Proxy",
    category: "Core",
    desc: "Decentralized router and load balancer in the 5G SBA handling request routing between NFs.",
  },
  "N2": {
    term: "N2",
    fullName: "N2 Interface",
    category: "Core",
    desc: "3GPP control-plane interface connecting gNodeB base stations to the Access and Mobility Management Function (AMF).",
  },
  "N3": {
    term: "N3",
    fullName: "N3 Interface",
    category: "Core",
    desc: "3GPP user-plane interface carrying GTP-U encapsulated traffic between gNodeB and User Plane Function (UPF).",
  },
  "N4": {
    term: "N4",
    fullName: "N4 Interface",
    category: "Core",
    desc: "3GPP control-plane interface using PFCP between Session Management Function (SMF) and UPF.",
  },
  "N6": {
    term: "N6",
    fullName: "N6 Interface",
    category: "Core",
    desc: "3GPP user-plane interface connecting the User Plane Function (UPF) to external Data Networks (DN / Internet).",
  },
  "PFCP": {
    term: "PFCP",
    fullName: "Packet Forwarding Control Protocol",
    category: "Core",
    desc: "3GPP protocol used on N4 interface enabling SMF to control packet processing rules (PDR/FAR) in UPF.",
  },
  "NGAP": {
    term: "NGAP",
    fullName: "Next Generation Application Protocol",
    category: "Core",
    desc: "3GPP control plane protocol (TS 38.413) operating on N2 interface between gNodeB and AMF over SCTP.",
  },
  "F1AP": {
    term: "F1AP",
    fullName: "F1 Application Protocol",
    category: "RAN",
    desc: "3GPP control plane signaling protocol operating on the F1 interface between CU and DU.",
  },
  "WAF": {
    term: "WAF",
    fullName: "Web Application Firewall",
    category: "Security",
    desc: "Security barrier filtering, monitoring, and blocking HTTP/2 traffic to and from SBI microservices.",
  },
  "SIEM": {
    term: "SIEM",
    fullName: "Security Information & Event Management",
    category: "Security",
    desc: "Centralized security platform aggregating and analyzing log data from 5G NFs and network appliances.",
  },
  "USRP": {
    term: "USRP",
    fullName: "Universal Software Radio Peripheral",
    category: "Hardware",
    desc: "High-performance software-defined radio (SDR) hardware used for RF testing and base station emulation.",
  },
  "GPSDO": {
    term: "GPSDO",
    fullName: "GPS-Disciplined Oscillator",
    category: "Hardware",
    desc: "High-precision reference clock module locked to GPS signals for accurate 5G TDD frame synchronization.",
  },
  "RF": {
    term: "RF",
    fullName: "Radio Frequency",
    category: "RAN",
    desc: "Electromagnetic wave frequency spectrum used for wireless over-the-air signal transmission.",
  },
  "MVNO": {
    term: "MVNO",
    fullName: "Mobile Virtual Network Operator",
    category: "Standards",
    desc: "Cellular provider that offers mobile services without owning physical radio spectrum or cell infrastructure.",
  },
  "MNO": {
    term: "MNO",
    fullName: "Mobile Network Operator",
    category: "Standards",
    desc: "Telecommunications carrier that owns and operates licensed radio spectrum and physical cell sites.",
  },
  "IKE": {
    term: "IKE",
    fullName: "Internet Key Exchange",
    category: "Security",
    desc: "Protocol used to set up Security Associations (SAs) and negotiate keys for IPsec VPN tunnels.",
  },
  "PDR": {
    term: "PDR",
    fullName: "Packet Detection Rule",
    category: "Core",
    desc: "PFCP rule configured by SMF on the UPF specifying packet matching criteria for subscriber traffic.",
  },
  "FAR": {
    term: "FAR",
    fullName: "Forwarding Action Rule",
    category: "Core",
    desc: "PFCP rule instructing the UPF whether to forward, drop, duplicate, or buffer matched subscriber packets.",
  },
  "KDF": {
    term: "KDF",
    fullName: "Key Derivation Function",
    category: "Crypto",
    desc: "HMAC-SHA-256 based cryptographic function (TS 33.220) deriving session keys from master anchor keys.",
  },
  "Helm": {
    term: "Helm",
    fullName: "Helm Package Manager",
    category: "Cloud",
    desc: "The package manager for Kubernetes used to deploy 5G Containerized Network Functions (CNFs).",
  },
  "kubectl": {
    term: "kubectl",
    fullName: "Kubernetes Command-Line Tool",
    category: "Cloud",
    desc: "CLI utility for controlling and inspecting Kubernetes clusters hosting 5G core pods.",
  },
  "SIM": {
    term: "SIM",
    fullName: "Subscriber Identity Module",
    category: "Hardware",
    desc: "Integrated circuit card storing master key K, IMSI/SUPI, and USIM authentication application.",
  },
  "USIM": {
    term: "USIM",
    fullName: "Universal Subscriber Identity Module",
    category: "Security",
    desc: "Application running on SIM card executing 5G-AKA authentication and key calculation.",
  },
  "Ki": {
    term: "Ki",
    fullName: "Master Subscriber Key (K)",
    category: "Crypto",
    desc: "128-bit or 256-bit secret master key shared exclusively between the subscriber's USIM and UDM/AUC.",
  },
  "OPc": {
    term: "OPc",
    fullName: "Operator Variant Algorithm Configuration Key",
    category: "Crypto",
    desc: "128-bit operator-specific key derived from OP and K used in Milenage authentication algorithm.",
  },
  "LEA": {
    term: "LEA",
    fullName: "Law Enforcement Agency",
    category: "Security",
    desc: "Authorized judicial or government agency requesting wiretaps and intercept data via Lawful Interception.",
  },
  "WORM": {
    term: "WORM",
    fullName: "Write Once, Read Many",
    category: "Security",
    desc: "Storage architecture preventing modification or deletion of security audit logs.",
  },
  "FIPS": {
    term: "FIPS",
    fullName: "Federal Information Processing Standards",
    category: "Security",
    desc: "U.S. government standards (e.g., FIPS 140-3) validating cryptographic security modules and HSMs.",
  },
  "DF": {
    term: "DF",
    fullName: "Delivery Function",
    category: "Security",
    desc: "Mediation node in Lawful Interception delivering intercepted content (CC/IRI) to agencies.",
  },
};

interface TermProps {
  name?: string;
  children?: React.ReactNode;
}

export function Term({ name, children }: TermProps) {
  const [show, setShow] = useState(false);
  const rawKey = name || (typeof children === "string" ? children.trim() : "");
  
  // Try exact match first
  let entry = GLOSSARY_DICT[rawKey];
  
  // Fallback: strip trailing 's' if plural (e.g. BBUs -> BBU, UEs -> UE, NFs -> NF)
  if (!entry && rawKey.endsWith("s") && GLOSSARY_DICT[rawKey.slice(0, -1)]) {
    entry = GLOSSARY_DICT[rawKey.slice(0, -1)];
  }
  if (!entry && rawKey.endsWith("es") && GLOSSARY_DICT[rawKey.slice(0, -2)]) {
    entry = GLOSSARY_DICT[rawKey.slice(0, -2)];
  }

  // Generic fallback if missing
  if (!entry) {
    entry = {
      term: rawKey,
      fullName: rawKey,
      category: "Security" as const,
      desc: "Telecom / technical term.",
    };
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Core": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
      case "RAN": return "bg-violet-500/20 text-violet-400 border-violet-500/40";
      case "Crypto": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "Cloud": return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "Security": return "bg-red-500/20 text-red-400 border-red-500/40";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    }
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      <span className="cursor-help font-semibold text-cyan-400 underline decoration-cyan-400/50 decoration-dashed underline-offset-4 transition-colors hover:text-cyan-300 hover:decoration-cyan-300">
        {children || rawKey}
      </span>

      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2.5 w-72 -translate-x-1/2 rounded-xl border border-cyan-500/40 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md pointer-events-none block animate-in fade-in zoom-in-95 duration-150">
          <span className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 mb-2">
            <span className="text-xs font-bold text-cyan-400 font-mono tracking-wider">{entry.term}</span>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getCategoryColor(entry.category)}`}>
              {entry.category}
            </span>
          </span>
          <span className="block text-xs font-semibold text-slate-200 mb-1">{entry.fullName}</span>
          <span className="block text-[11px] text-slate-400 leading-relaxed font-normal">{entry.desc}</span>
        </span>
      )}
    </span>
  );
}

export function InteractiveGlossary() {
  return null;
}


