import React, { useState } from "react";
import { Fingerprint, BarChart3, CheckCircle2 } from "lucide-react";
import { HISTORICAL_HEISTS } from "./data";

const CLUES = [
  {
    id: "staging",
    title: "1. Tornado Cash & 36h Rehearsal",
    badge: "Pre-Attack Hygiene",
    detail:
      "Funding caller 0x7C86...5CA0 through Tornado Cash and dry-running unverified sweeper code 36 hours ahead matched prior 2025-2026 North Korean contract deployments tracked by TRM Labs.",
  },
  {
    id: "automation",
    title: "2. Multi-Chain Speed & DeFi Evasion",
    badge: "Post-Bybit Evolution",
    detail:
      "Draining eight blockchains in 20 minutes (and ten within four hours) while routing stolen USDT through UniswapX, 1inch, and a $60M Aave V3 borrow trick showed pre-built state automation.",
  },
  {
    id: "laundering",
    title: "3. Lazarus Laundering Corridors",
    badge: "On-Chain Graph Match",
    detail:
      "Downstream peel-chain dispersion and bridge routing overlapped wallet clusters previously tied by Chainalysis, the FBI, and the U.S. Secret Service to DPRK's Reconnaissance General Bureau.",
  },
];

export function AttributionScaleExplorer() {
  const [tab, setTab] = useState<"clues" | "scale">("clues");
  const [activeClue, setActiveClue] = useState(0);

  return (
    <section
      aria-label="Interactive Attribution Evidence and Historical Scale Comparison"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
        <div className="font-mono">
          <div className="text-xs font-bold uppercase tracking-widest text-foreground">
            TraderTraitor Attribution & Historical Scale
          </div>
          <div className="text-[11px] text-muted-foreground font-sans">
            Inspect the forensic clues or compare October 2026 against history's biggest crypto
            thefts
          </div>
        </div>

        <div
          role="group"
          aria-label="Attribution view selector"
          className="inline-flex rounded-lg border border-border bg-background/70 p-0.5 font-mono text-[11px]"
        >
          <button
            type="button"
            aria-pressed={tab === "clues"}
            onClick={() => setTab("clues")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              tab === "clues"
                ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/35"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Fingerprint className="h-3.5 w-3.5" />
            <span>3 Forensic Clues</span>
          </button>
          <button
            type="button"
            aria-pressed={tab === "scale"}
            onClick={() => setTab("scale")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              tab === "scale"
                ? "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/35"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Record Scale (4.2x Bybit)</span>
          </button>
        </div>
      </div>

      {tab === "clues" ? (
        <div className="p-5 space-y-4 animate-in fade-in duration-200" aria-live="polite">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
            {CLUES.map((c, idx) => {
              const selected = idx === activeClue;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveClue(idx)}
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    selected
                      ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                      : "border-border/60 bg-background/40 text-foreground/80 hover:bg-muted/40"
                  }`}
                >
                  <div className="text-[10px] uppercase text-muted-foreground">{c.badge}</div>
                  <div className="mt-1 text-xs font-bold">{c.title}</div>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/[0.05] p-4 flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-sm font-sans text-foreground/90 leading-relaxed m-0">
              {CLUES[activeClue].detail}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-3.5 animate-in fade-in duration-200" aria-live="polite">
          {HISTORICAL_HEISTS.map((item) => {
            const widthPct = Math.max(8, Math.round((item.amountB / 6.36) * 100));
            const isTop = item.rank === 1;
            return (
              <div
                key={item.victim}
                className={`rounded-lg border p-3 ${
                  isTop
                    ? "border-red-500/40 bg-red-500/[0.06]"
                    : "border-border/60 bg-background/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs mb-1.5">
                  <div>
                    <span className="font-bold text-foreground">
                      #{item.rank} {item.victim}
                    </span>{" "}
                    <span className="text-muted-foreground">({item.date})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{item.actor}</span>
                    <span
                      className={
                        isTop
                          ? "text-red-600 dark:text-red-400 font-extrabold"
                          : "text-amber-700 dark:text-amber-300 font-bold"
                      }
                    >
                      {item.displayAmount}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-1.5">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isTop ? "bg-red-500" : "bg-amber-400/80"
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <div className="text-xs font-sans text-foreground/75">{item.howItHappened}</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
