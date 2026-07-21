import React, { useState } from "react";
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldAlert,
  Target,
  Terminal,
  Key,
  Zap,
  Search,
  Skull,
  ArrowRight,
  ChevronRight,
  Activity,
  Cpu,
  Lock,
  Globe,
  Wrench,
  FileCode2,
} from "lucide-react";

/* ── Platform Logos (SVG) ────────────────────────────── */

export function HackTheBoxLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.996 0L1.779 5.899v12.202l10.217 5.899 10.225-5.899V5.899L11.996 0zm-8.038 7.15l8.038-4.641 8.046 4.641v3.314l-8.046 4.641-8.038-4.641V7.15zm8.038 14.502l-8.038-4.641v-4.571l8.038 4.641 8.046-4.641v4.571l-8.046 4.641z" />
    </svg>
  );
}

export function TryHackMeLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm0 2.8L19.5 7v10L12 21.2 4.5 17V7L12 2.8zM7 9v2h10V9H7zm0 4v2h7v-2H7z" />
    </svg>
  );
}

export function VulnHubLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8l7.5 3.75v7.5L12 19.8l-7.5-3.75v-7.5L12 4.8zM7.5 9.5v2h9v-2h-9zm0 3.5v2h6v-2h-6z" />
    </svg>
  );
}

export function PlatformIcon({
  platform,
  className = "h-4 w-4",
}: {
  platform: string;
  className?: string;
}) {
  const p = platform.toLowerCase();
  if (p.includes("hackthebox") || p === "htb") return <HackTheBoxLogo className={className} />;
  if (p.includes("tryhackme") || p === "thm") return <TryHackMeLogo className={className} />;
  if (p.includes("vulnhub")) return <VulnHubLogo className={className} />;
  return <Target className={className} />;
}

/* ── Spoiler Flag Component ──────────────────────────── */

export function SpoilerFlag({ flag, label = "Flag" }: { flag: string; label?: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(flag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg border border-border bg-card/80 p-3 font-mono backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Key className="h-3.5 w-3.5 text-accent-primary" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-foreground">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setRevealed(!revealed)}
            className="flex items-center gap-1 rounded border border-border bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title={revealed ? "Hide flag" : "Reveal flag"}
          >
            {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>{revealed ? "Hide" : "Reveal"}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded border border-border bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Copy flag"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
      <div
        onClick={() => !revealed && setRevealed(true)}
        className={`relative select-none rounded bg-muted/80 px-2.5 py-1.5 text-xs font-mono transition-all duration-300 ${
          revealed
            ? "text-accent-primary font-bold select-text"
            : "cursor-pointer blur-sm hover:blur-[2px] text-muted-foreground"
        }`}
      >
        <span className={revealed ? "" : "opacity-30"}>
          {revealed ? flag : flag.replace(/./g, "•")}
        </span>
        {!revealed && (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-foreground/80 tracking-wider uppercase bg-background/60 backdrop-blur-[2px] rounded">
            [ Click to reveal flag ]
          </span>
        )}
      </div>
    </div>
  );
}

/* ── KillChain / Attack Flow Component ─────────────────── */

export interface KillChainStep {
  phase: string;
  title: string;
  desc?: string;
  technique?: string;
  tools?: string[];
  icon?: React.ReactNode;
}

type PhaseConfig = {
  icon: React.ReactNode;
  accent: string;
  badge: string;
  nodeBg: string;
  nodeBorder: string;
  nodeText: string;
  textColor: string;
  barColor: string;
};

function getPhaseConfig(phase: string): PhaseConfig {
  const p = phase.toLowerCase();
  if (p.includes("recon"))
    return {
      icon: <Search className="h-3.5 w-3.5" />,
      accent: "slate",
      badge: "bg-slate-100/10 border-slate-200/50 text-slate-200",
      nodeBg: "bg-slate-200",
      nodeBorder: "border-slate-200",
      nodeText: "text-slate-900",
      textColor: "text-slate-200",
      barColor: "#e2e8f0",
    };
  if (p.includes("foothold") || p.includes("initial") || p.includes("exploitation"))
    return {
      icon: <Target className="h-3.5 w-3.5" />,
      accent: "red",
      badge: "bg-red-400/10 border-red-400/50 text-red-400",
      nodeBg: "bg-red-400",
      nodeBorder: "border-red-400",
      nodeText: "text-red-950",
      textColor: "text-red-400",
      barColor: "#f87171",
    };
  if (p.includes("exec") || p.includes("shell") || p.includes("rce") || p.includes("remote"))
    return {
      icon: <Terminal className="h-3.5 w-3.5" />,
      accent: "red",
      badge: "bg-red-500/10 border-red-500/50 text-red-500",
      nodeBg: "bg-red-600",
      nodeBorder: "border-red-600",
      nodeText: "text-white",
      textColor: "text-red-500",
      barColor: "#dc2626",
    };
  if (p.includes("priv") || p.includes("escalat") || p.includes("root") || p.includes("pwn"))
    return {
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
      accent: "red",
      badge: "bg-red-600/10 border-red-600/50 text-red-600",
      nodeBg: "bg-red-800",
      nodeBorder: "border-red-800",
      nodeText: "text-red-100",
      textColor: "text-red-500",
      barColor: "#991b1b",
    };
  return {
    icon: <Zap className="h-3.5 w-3.5" />,
    accent: "red",
    badge: "bg-red-500/10 border-red-500/50 text-red-500",
    nodeBg: "bg-red-500",
    nodeBorder: "border-red-500",
    nodeText: "text-red-950",
    textColor: "text-red-400",
    barColor: "#ef4444",
  };
}

export function KillChain({ steps }: { steps: KillChainStep[] }) {
  return (
    <div className="my-5 rounded-xl border border-border bg-card/80 overflow-hidden shadow-md font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Exploit_Kill_Chain
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">
            {steps.length} Phases
          </span>
          {/* Decorative scanline dots */}
          <div className="flex gap-1">
            {["bg-slate-200", "bg-red-400", "bg-red-800"].map((c, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${c} opacity-80`} />
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="relative px-4 py-3 space-y-2">
        {/* Vertical connector line */}
        <div
          className="absolute left-[30px] top-5 bottom-5 w-[2px]"
          style={{ background: "linear-gradient(to bottom, #e2e8f0, #f87171, #dc2626, #991b1b)" }}
        />

        {steps.map((s, idx) => {
          const cfg = getPhaseConfig(s.phase);
          const isLast = idx === steps.length - 1;

          return (
            <div key={idx} className="relative flex items-start gap-3 pl-9 group">
              {/* Node */}
              <div
                className={`absolute left-[14px] top-1.5 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-transform duration-200 group-hover:scale-110 ${cfg.nodeBg} ${cfg.nodeBorder} ${cfg.nodeText}`}
              >
                {s.icon ?? cfg.icon}
              </div>

              {/* Card */}
              <div className="flex-1 min-w-0 rounded-lg border border-border/70 bg-background/60 overflow-hidden transition-all duration-200 hover:border-border hover:shadow-sm">
                {/* Card header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {s.title}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${cfg.badge}`}
                  >
                    {s.phase}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-4 py-3 space-y-2">
                  {s.desc && (
                    <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                      {s.desc}
                    </p>
                  )}
                  {(s.technique || (s.tools && s.tools.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground">
                      {s.technique && (
                        <span className="flex items-center gap-1.5">
                          <ArrowRight className="h-3 w-3 opacity-40" />
                          <span className="opacity-50 uppercase tracking-wider text-[10px] font-bold">
                            Tech:
                          </span>
                          <span className={`font-semibold ${cfg.textColor}`}>{s.technique}</span>
                        </span>
                      )}
                      {s.tools && s.tools.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Terminal className="h-3 w-3 opacity-40" />
                          <span className="opacity-50 uppercase tracking-wider text-[10px] font-bold">
                            Tools:
                          </span>
                          {s.tools.map((t) => (
                            <span
                              key={t}
                              className="rounded border border-border/50 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-foreground/80"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Skill Matrix Component ──────────────────────────── */

export interface SkillItem {
  name: string;
  level: number; // 1 to 10
}

export function SkillMatrix({ skills }: { skills: SkillItem[] }) {
  return (
    <div className="my-5 rounded-xl border border-border bg-card/80 p-4 font-mono shadow-sm">
      <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
        <Activity className="h-4 w-4 text-accent-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
          Skill_Breakdown
        </span>
      </div>
      <div className="space-y-2.5">
        {skills.map((s, i) => {
          const pct = Math.min(100, Math.max(10, s.level * 10));
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/90 font-medium">{s.name}</span>
                <span className="text-muted-foreground text-[11px]">{s.level}/10</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/80 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Category Helpers ────────────────────────────────── */

export function CategoryIcon({
  category,
  className = "h-3.5 w-3.5",
}: {
  category?: string;
  className?: string;
}) {
  if (!category) return <Target className={className} />;
  const c = category.toLowerCase();
  if (c.includes("reverse") || c.includes("rev")) return <Cpu className={className} />;
  if (c.includes("crypto")) return <Lock className={className} />;
  if (c.includes("web")) return <Globe className={className} />;
  if (c.includes("pwn") || c.includes("binary")) return <Skull className={className} />;
  if (c.includes("forensic")) return <Search className={className} />;
  if (c.includes("hardware")) return <Wrench className={className} />;
  return <FileCode2 className={className} />;
}

