import React, { useState } from "react";
import { TrendingDown, ShieldCheck } from "lucide-react";

const MARKET_CARDS = [
  {
    asset: "Bitcoin (BTC)",
    drop: "-5% Below $80,000",
    detail:
      "Tumbled toward a six-week low near $76,400 ($76.4K-$77.9K) as $1.5B-$1.6B in mostly leveraged long bets liquidated.",
  },
  {
    asset: "Coinbase (COIN)",
    drop: "-11% to -12.5%",
    detail:
      "Hit by sector-wide custody shockwaves alongside Q3 revenue of $1.20B (narrowly missing consensus as transaction revenue fell 44% YoY).",
  },
  {
    asset: "Robinhood (HOOD)",
    drop: "Sharp Sector Slide",
    detail:
      "Pressured by the crypto rout alongside a 55% YoY drop in Robinhood's Q3 crypto transaction revenue (down to $120M).",
  },
  {
    asset: "Strategy (MSTR) & ETH",
    drop: "MSTR -7% to -8% / ETH -5%+",
    detail:
      "Bitcoin-proxy equities and Ether slid together amid shifting Federal Reserve rate expectations and risk-off selling.",
  },
];

const SOLVENCY_STEPS = [
  {
    day: "Oct 31, 2026",
    headline: "90%-95% Replenished ($6.34B Set Aside)",
    detail:
      "Binance earmarked $6.34B across corporate treasury, futures insurance funds, and part of SAFU instead of waiting months for frozen USDT/USDC legal reissuance.",
  },
  {
    day: "Nov 1, 2026",
    headline: "Phased Withdrawals Reopen Token by Token",
    detail:
      "Unlike FTX's 2022 collapse over an $8B hole, phased customer payouts resumed Sunday after security checks.",
  },
  {
    day: "Nov 2, 2026",
    headline: "Proof-of-Reserves Verification Release",
    detail:
      "Fresh PoR snapshot (taken Oct 31 at 00:00 UTC across 10 major tokens) faces scrutiny over 1:1 liquid backing and hot-wallet concentration caps.",
  },
];

export function MarketShockwavePanel() {
  const [view, setView] = useState<"market" | "solvency">("market");

  return (
    <section
      aria-label="Interactive Market Contagion and Solvency Panel"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
        <div className="font-mono">
          <div className="text-xs font-bold uppercase tracking-widest text-foreground">
            Fallout Explorer: Market Contagion vs. Solvency Backstop
          </div>
          <div className="text-[11px] text-muted-foreground font-sans">
            Compare the immediate Wall Street / crypto sell-off against Binance's 72-hour rescue
          </div>
        </div>

        <div
          role="group"
          aria-label="Impact view toggle"
          className="inline-flex rounded-lg border border-border bg-background/70 p-0.5 font-mono text-[11px]"
        >
          <button
            type="button"
            aria-pressed={view === "market"}
            onClick={() => setView("market")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              view === "market"
                ? "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/35"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Market Drop (Oct 30)</span>
          </button>
          <button
            type="button"
            aria-pressed={view === "solvency"}
            onClick={() => setView("solvency")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              view === "solvency"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Binance Rescue (Oct 31-Nov 2)</span>
          </button>
        </div>
      </div>

      {view === "market" ? (
        <div
          aria-live="polite"
          className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200"
        >
          {MARKET_CARDS.map((c) => (
            <div
              key={c.asset}
              className="rounded-lg border border-red-500/25 bg-red-500/[0.04] p-3.5 space-y-1"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-foreground">{c.asset}</span>
                <span className="font-bold text-red-600 dark:text-red-400">{c.drop}</span>
              </div>
              <p className="text-xs font-sans text-foreground/80 leading-relaxed m-0">{c.detail}</p>
            </div>
          ))}
        </div>
      ) : (
        <div aria-live="polite" className="p-5 space-y-3 animate-in fade-in duration-200">
          {SOLVENCY_STEPS.map((s) => (
            <div
              key={s.day}
              className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.04] p-3.5 space-y-1"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  {s.headline}
                </span>
                <span className="text-muted-foreground">{s.day}</span>
              </div>
              <p className="text-xs sm:text-[13px] font-sans text-foreground/85 leading-relaxed m-0">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
