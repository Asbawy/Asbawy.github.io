import React, { useState } from "react";
import {
  Copy, Check, Eye, EyeOff, ShieldAlert, Target, Terminal,
  Key, Zap, Search, Skull, ArrowRight, ChevronRight, Activity
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

export function PlatformIcon({ platform, className = "h-4 w-4" }: { platform: string; className?: string }) {
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
          <span className="font-semibold uppercase tracking-wider text-[11px] text-foreground">{label}</span>
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
        className={`relative select-none rounded bg-muted/80 px-2.5 py-1.5 text-xs font-mono transition-all duration-300 ${revealed ? "text-accent-primary font-bold select-text" : "cursor-pointer blur-sm hover:blur-[2px] text-muted-foreground"
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
  barColor: string;
};

function getPhaseConfig(phase: string): PhaseConfig {
  const p = phase.toLowerCase();
  if (p.includes("recon")) return {
    icon: <Search className="h-3 w-3" />,
    accent: "blue",
    badge: "bg-blue-500/10 border-blue-400/30 text-blue-600 dark:text-blue-300",
    nodeBg: "bg-blue-500/10",
    nodeBorder: "border-blue-400/40",
    nodeText: "text-blue-600 dark:text-blue-300",
    barColor: "#3b82f6",
  };
  if (p.includes("foothold") || p.includes("initial") || p.includes("exploitation")) return {
    icon: <Target className="h-3 w-3" />,
    accent: "amber",
    badge: "bg-amber-500/10 border-amber-400/30 text-amber-600 dark:text-amber-300",
    nodeBg: "bg-amber-500/10",
    nodeBorder: "border-amber-400/40",
    nodeText: "text-amber-600 dark:text-amber-300",
    barColor: "#f59e0b",
  };
  if (p.includes("exec") || p.includes("shell") || p.includes("rce") || p.includes("remote")) return {
    icon: <Terminal className="h-3 w-3" />,
    accent: "cyan",
    badge: "bg-cyan-500/10 border-cyan-400/30 text-cyan-600 dark:text-cyan-300",
    nodeBg: "bg-cyan-500/10",
    nodeBorder: "border-cyan-400/40",
    nodeText: "text-cyan-600 dark:text-cyan-300",
    barColor: "#06b6d4",
  };
  if (p.includes("priv") || p.includes("escalat") || p.includes("root") || p.includes("pwn")) return {
    icon: <ShieldAlert className="h-3 w-3" />,
    accent: "rose",
    badge: "bg-rose-500/10 border-rose-400/30 text-rose-600 dark:text-rose-300",
    nodeBg: "bg-rose-500/10",
    nodeBorder: "border-rose-400/40",
    nodeText: "text-rose-600 dark:text-rose-300",
    barColor: "#f43f5e",
  };
  return {
    icon: <Zap className="h-3 w-3" />,
    accent: "violet",
    badge: "bg-violet-500/10 border-violet-400/30 text-violet-600 dark:text-violet-300",
    nodeBg: "bg-violet-500/10",
    nodeBorder: "border-violet-400/40",
    nodeText: "text-violet-600 dark:text-violet-300",
    barColor: "#8b5cf6",
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
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Exploit_Kill_Chain</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">
            {steps.length} Phases
          </span>
          {/* Decorative scanline dots */}
          <div className="flex gap-1">
            {["bg-blue-400", "bg-amber-400", "bg-rose-400"].map((c, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${c} opacity-70`} />
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="relative px-4 py-3 space-y-2">
        {/* Vertical connector line */}
        <div
          className="absolute left-[30px] top-5 bottom-5 w-px"
          style={{ background: "linear-gradient(to bottom, #3b82f6, #f59e0b, #f43f5e)" }}
        />

        {steps.map((s, idx) => {
          const cfg = getPhaseConfig(s.phase);
          const isLast = idx === steps.length - 1;

          return (
            <div key={idx} className="relative flex items-start gap-3 pl-9 group">
              {/* Node */}
              <div
                className={`absolute left-[14px] top-1.5 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-transform duration-200 group-hover:scale-110 ${cfg.nodeBg} ${cfg.nodeBorder} ${cfg.nodeText} bg-card`}
              >
                {s.icon ?? cfg.icon}
              </div>

              {/* Card */}
              <div className="flex-1 min-w-0 rounded-lg border border-border/70 bg-background/60 overflow-hidden transition-all duration-200 hover:border-border hover:shadow-sm">
                {/* Card header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-mono text-muted-foreground/50 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                    <span className="text-[11px] font-semibold text-foreground truncate">{s.title}</span>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${cfg.badge}`}>
                    {s.phase}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-3 py-2 space-y-1.5">
                  {s.desc && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      {s.desc}
                    </p>
                  )}
                  {(s.technique || (s.tools && s.tools.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[10px] text-muted-foreground">
                      {s.technique && (
                        <span className="flex items-center gap-1">
                          <ArrowRight className="h-2.5 w-2.5 opacity-40" />
                          <span className="opacity-50 uppercase tracking-wider text-[9px] font-bold">Tech:</span>
                          <span className={`font-semibold ${cfg.nodeText}`}>{s.technique}</span>
                        </span>
                      )}
                      {s.tools && s.tools.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Terminal className="h-2.5 w-2.5 opacity-40" />
                          <span className="opacity-50 uppercase tracking-wider text-[9px] font-bold">Tools:</span>
                          {s.tools.map((t) => (
                            <span key={t} className="rounded border border-border/50 bg-muted/50 px-1.5 text-[9px] font-medium text-foreground/80">
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

/* ── Machine Skill Matrix Component ─────────────────── */

export interface SkillRating {
  name: string;
  level: number; // 1 to 10
}

const SKILL_COLORS = [
  { bar: "from-blue-500 to-blue-400", text: "text-blue-500 dark:text-blue-300", dot: "bg-blue-400" },
  { bar: "from-violet-500 to-violet-400", text: "text-violet-500 dark:text-violet-300", dot: "bg-violet-400" },
  { bar: "from-cyan-500 to-cyan-400", text: "text-cyan-500 dark:text-cyan-300", dot: "bg-cyan-400" },
  { bar: "from-amber-500 to-amber-400", text: "text-amber-500 dark:text-amber-300", dot: "bg-amber-400" },
  { bar: "from-rose-500 to-rose-400", text: "text-rose-500 dark:text-rose-300", dot: "bg-rose-400" },
  { bar: "from-emerald-500 to-emerald-400", text: "text-emerald-500 dark:text-emerald-300", dot: "bg-emerald-400" },
];

export function SkillMatrix({ skills, max = 10 }: { skills: SkillRating[]; max?: number }) {
  return (
    <div className="my-4 rounded-xl border border-border bg-card/80 overflow-hidden shadow-md font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Machine_Matrix</span>
        </div>
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">
          Skill Rating
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border p-px">
        {skills.map((s, idx) => {
          const col = SKILL_COLORS[idx % SKILL_COLORS.length];
          const pct = Math.round((s.level / max) * 100);

          return (
            <div
              key={s.name}
              className="group bg-background/80 px-3 py-2.5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/80">
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold tabular-nums ${col.text}`}>{s.level}</span>
                  <span className="text-[9px] text-muted-foreground/60 font-medium">/{max}</span>
                </div>
              </div>

              {/* Segmented bar */}
              <div className="flex gap-0.5">
                {Array.from({ length: max }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${i < s.level
                      ? `bg-gradient-to-r ${col.bar} opacity-100`
                      : "bg-muted/60 opacity-50"
                      }`}
                    style={{ transitionDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>

              {/* Percentage label */}
              <div className="mt-1 flex justify-end">
                <span className="text-[9px] text-muted-foreground/50 tabular-nums">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
