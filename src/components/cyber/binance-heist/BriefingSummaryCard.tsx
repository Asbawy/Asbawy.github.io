import React from "react";
import { Activity, Lock, Unlock, ShieldCheck } from "lucide-react";

const TOP_FACTS = [
  { label: "Attack Window", value: "Oct 29, 4:05 PM - 7:56 PM ET", sub: "20-min primary blitz" },
  { label: "Gross Stolen", value: "$6.36 Billion", sub: "Across 10 blockchains (>4x Bybit)" },
  {
    label: "Suspected Actor",
    value: "TraderTraitor (DPRK)",
    sub: "FBI / USSS / TRM / Chainalysis",
  },
  {
    label: "Root Vector",
    value: "Laptop -> Container -> EIP-7702",
    sub: "Zero private keys leaked",
  },
];

const MINI_BARS = [
  { name: "Ethereum", amount: "~$3.80B", pct: 59.6 },
  { name: "Bitcoin", amount: "~$1.47B-$1.50B", pct: 23.1 },
  { name: "Tron", amount: "$628M", pct: 9.9 },
  { name: "XRP Ledger", amount: "$296M", pct: 4.7 },
  { name: "Solana + 5 Chains", amount: "$173M", pct: 2.7 },
];

export function BriefingSummaryCard() {
  return (
    <section
      aria-label="One-Page Incident Briefing Summary"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-border bg-red-500/10 font-mono">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-foreground">
            One-Page Executive Briefing: October 2026 Binance Heist
          </span>
        </div>
        <span className="rounded border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700 dark:text-red-300">
          Severity: Critical
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* 4 Key Headline Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono">
          {TOP_FACTS.map((f) => (
            <div key={f.label} className="rounded-lg border border-border/70 bg-background/60 p-3">
              <div className="text-[10px] uppercase text-muted-foreground">{f.label}</div>
              <div className="mt-1 text-xs font-bold text-foreground">{f.value}</div>
              <div className="mt-0.5 text-[10.5px] font-sans text-muted-foreground">{f.sub}</div>
            </div>
          ))}
        </div>

        {/* Visual Split: Chain Share + Final Ledger Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/70 bg-background/40 p-4 space-y-2.5 font-mono">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Haul by Network ($6.36B Gross)
            </div>
            {MINI_BARS.map((b) => (
              <div key={b.name} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-foreground/90">{b.name}</span>
                  <span className="font-bold text-foreground">
                    {b.amount} <span className="text-muted-foreground">({b.pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${Math.max(4, b.pct * 1.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border/70 bg-background/40 p-4 flex flex-col justify-between gap-2.5 font-mono text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Where the Money Stands (Nov 1, 2026)
            </div>

            <div className="rounded border border-cyan-500/30 bg-cyan-500/[0.07] p-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300">
                <Lock className="h-3.5 w-3.5" /> Frozen On-Chain
              </span>
              <span className="font-bold text-cyan-700 dark:text-cyan-300">$2.70B - $3.00B</span>
            </div>

            <div className="rounded border border-amber-500/30 bg-amber-500/[0.07] p-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                <Unlock className="h-3.5 w-3.5" /> Escaped (ETH & BTC)
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-300">$3.36B - $3.66B</span>
            </div>

            <div className="rounded border border-emerald-500/30 bg-emerald-500/[0.07] p-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Binance User Backstop
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                $6.34B Set Aside (Nov 1 Open)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
