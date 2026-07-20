import React, { useState } from "react";
import { Copy, Check, Eye, EyeOff, ShieldAlert, Target, Terminal, Lock, Key, Zap, CheckCircle2, Search, Skull, ArrowRight } from "lucide-react";

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

export function SpoilerFlag({
  flag,
  label = "Flag",
}: {
  flag: string;
  label?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(flag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg border border-border bg-card/80 p-3.5 font-mono backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between gap-3 text-xs mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Key className="h-3.5 w-3.5 text-accent-primary" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setRevealed(!revealed)}
            className="flex items-center gap-1 rounded border border-border bg-muted/60 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title={revealed ? "Hide flag" : "Reveal flag"}
          >
            {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>{revealed ? "Hide" : "Reveal"}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded border border-border bg-muted/60 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Copy flag"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
      <div
        onClick={() => !revealed && setRevealed(true)}
        className={`relative select-none rounded bg-muted/80 px-3 py-2 text-xs font-mono transition-all duration-300 ${
          revealed ? "text-accent-primary font-bold select-text" : "cursor-pointer blur-sm hover:blur-[2px] text-muted-foreground"
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

function getPhaseIcon(phase: string) {
  const p = phase.toLowerCase();
  if (p.includes("recon")) return <Search className="h-3 w-3" />;
  if (p.includes("foothold") || p.includes("initial")) return <Target className="h-3 w-3" />;
  if (p.includes("exec") || p.includes("shell")) return <Terminal className="h-3 w-3" />;
  if (p.includes("priv")) return <ShieldAlert className="h-3 w-3" />;
  if (p.includes("loot") || p.includes("flag")) return <Key className="h-3 w-3" />;
  if (p.includes("root") || p.includes("pwn")) return <Skull className="h-3 w-3" />;
  return <Zap className="h-3 w-3" />;
}

export function KillChain({ steps }: { steps: KillChainStep[] }) {
  return (
    <div className="my-8 rounded-xl border border-border bg-card/60 p-1 md:p-6 font-mono backdrop-blur-md relative overflow-hidden shadow-sm">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-threat-high/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6 px-4 md:px-0">
          <div className="rounded bg-accent-primary/10 p-1.5 border border-accent-primary/20">
            <Zap className="h-4 w-4 text-accent-primary" />
          </div>
          <span className="text-sm uppercase tracking-[0.2em] font-semibold text-foreground">
            Exploit_Kill_Chain
          </span>
        </div>

        <div className="relative space-y-6 before:absolute before:left-[27px] md:before:left-[35px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-accent-primary before:via-border before:to-threat-high px-2 md:px-0">
          {steps.map((s, idx) => {
            const isLast = idx === steps.length - 1;
            const nodeColor = isLast ? "text-threat-high border-threat-high/50 shadow-threat-high/20" : "text-accent-primary border-accent-primary/50 shadow-accent-primary/20";
            const bgColor = isLast ? "bg-threat-high/10" : "bg-accent-primary/10";

            return (
              <div key={idx} className="group relative flex items-start gap-4 md:gap-6 pl-14 md:pl-20">
                {/* Step Node */}
                <div className={`absolute left-[28px] md:left-[36px] top-1.5 flex h-7 w-7 md:h-8 md:w-8 -translate-x-1/2 items-center justify-center rounded-full border ${nodeColor} ${bgColor} bg-background backdrop-blur-sm shadow-[0_0_15px_var(--tw-shadow-color)] transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_var(--tw-shadow-color)] z-10`}>
                  {s.icon || getPhaseIcon(s.phase)}
                </div>

                {/* Content Card */}
                <div className="flex-1 min-w-0 rounded-lg border border-border bg-background/50 p-4 md:p-5 transition-all duration-300 hover:border-accent-primary/30 hover:bg-background/80 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-3">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {s.title}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-2.5 py-1 text-[10px] text-muted-foreground uppercase tracking-wider whitespace-nowrap self-start sm:self-auto font-medium">
                      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isLast ? "bg-threat-high" : "bg-accent-primary"}`} />
                      {s.phase}
                    </span>
                  </div>

                  {s.desc && (
                    <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed font-sans border-l-2 border-border pl-3">
                      {s.desc}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-muted-foreground bg-muted/60 rounded p-2 border border-border/50">
                    {s.technique && (
                      <span className="flex items-center gap-1.5 text-foreground/80">
                        <ArrowRight className="h-3 w-3 opacity-50" />
                        <span className="opacity-50 font-semibold uppercase tracking-wider">tech:</span> 
                        <span className="text-accent-link font-medium">{s.technique}</span>
                      </span>
                    )}
                    {s.tools && s.tools.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Terminal className="h-3 w-3 opacity-50" />
                        <span className="opacity-50 font-semibold uppercase tracking-wider">tools:</span>
                        {s.tools.map((t) => (
                          <span key={t} className="rounded bg-background px-1.5 py-0.5 border border-border text-foreground font-medium transition-colors hover:bg-muted cursor-default">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Machine Skill Matrix Component ─────────────────── */

export interface SkillRating {
  name: string;
  level: number; // 1 to 10
}

export function SkillMatrix({ skills, max = 10 }: { skills: SkillRating[], max?: number }) {
  return (
    <div className="my-6 rounded-xl border border-border bg-card/60 p-5 font-mono backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-5">
        <Target className="h-4 w-4 text-accent-primary" />
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground">
          Machine_Matrix
        </span>
      </div>
      <div className="space-y-4 font-mono text-xs">
        {skills.map((s, idx) => (
          <div key={s.name} className="group">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5 transition-colors group-hover:text-foreground">
              <span className="uppercase tracking-wider font-medium">{s.name}</span>
              <span className="text-accent-primary font-semibold">{s.level}/{max}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden border border-border/50">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-accent-primary via-accent-primary to-[#00ffcc] shadow-sm transition-all duration-1000 ease-out delay-${idx * 100}`}
                style={{ width: `${(s.level / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
