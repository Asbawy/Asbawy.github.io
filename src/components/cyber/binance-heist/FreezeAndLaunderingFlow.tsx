import React, { useState } from "react";
import { Lock, Unlock, ArrowRight, ShieldAlert } from "lucide-react";
import { LAUNDERING_STAGES } from "./data";

const FREEZE_BUCKETS = [
  { label: "Tether (5:01 PM ET)", amount: ">$1.56B USDT", tone: "text-cyan-300" },
  { label: "Circle (5:04 PM ET)", amount: ">$800M USDC", tone: "text-cyan-300" },
  { label: "Arbitrum, USD1 & RLUSD", amount: "~$320M-$620M", tone: "text-cyan-300" },
  { label: "Escaped War Chest", amount: ">420K ETH + 18,270 BTC", tone: "text-amber-300" },
];

export function FreezeAndLaunderingFlow() {
  const [activeStage, setActiveStage] = useState<number>(0);
  const stage = LAUNDERING_STAGES[activeStage];

  return (
    <section
      aria-label="Interactive Freeze Tug-of-War and 4-Stage Laundering Stepper"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-lg"
    >
      {/* Part 1: Clean Visual Freeze Tug-of-War */}
      <div className="p-5 border-b border-border bg-muted/20 space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-cyan-300 font-bold flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Frozen On-Chain: $2.70B - $3.00B (~45%)
          </span>
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Unlock className="h-3.5 w-3.5" /> Escaped & Unfreezable: $3.36B - $3.66B (~55%)
          </span>
        </div>

        <div className="h-3.5 w-full rounded-full bg-muted overflow-hidden flex border border-border/60">
          <div className="h-full bg-cyan-500/85" style={{ width: "45%" }} />
          <div className="h-full bg-amber-500/85" style={{ width: "55%" }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {FREEZE_BUCKETS.map((b) => (
            <div
              key={b.label}
              className="rounded-lg border border-border/60 bg-background/60 px-3 py-2"
            >
              <div className="text-[10px] text-muted-foreground truncate">{b.label}</div>
              <div className={`mt-0.5 text-xs font-bold ${b.tone}`}>{b.amount}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Simple 4-Step Laundering Stepper */}
      <div className="p-5 space-y-4">
        <div className="font-mono">
          <div className="text-xs font-bold uppercase tracking-wider text-foreground">
            How North Korea Washes the Remaining $3.36B-$3.66B (Click Each Step)
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          {LAUNDERING_STAGES.map((s, idx) => {
            const isCurrent = idx === activeStage;
            return (
              <button
                key={s.step}
                type="button"
                aria-pressed={isCurrent}
                onClick={() => setActiveStage(idx)}
                className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isCurrent
                    ? "border-amber-400/60 bg-amber-500/12 text-amber-300"
                    : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="text-[10px] font-bold">STEP 0{s.step}</div>
                <div className="mt-0.5 text-[11px] font-semibold text-foreground line-clamp-2">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>

        <div
          key={stage.step}
          aria-live="polite"
          className="rounded-lg border border-border bg-background/50 p-4 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <span className="font-bold text-amber-300">
              Step 0{stage.step}: {stage.title}
            </span>
            <span className="text-muted-foreground">{stage.window}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs bg-muted/30 px-3 py-2 rounded border border-border/50">
            <span className="text-foreground/85">{stage.fromAsset}</span>
            <ArrowRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-300 font-bold">{stage.toAsset}</span>
          </div>

          <p className="text-sm font-sans text-foreground/90 leading-relaxed m-0">
            {stage.simpleExplanation}
          </p>

          <div className="flex items-start gap-2 text-xs font-sans text-cyan-300 pt-0.5">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-cyan-400" />
            <span>
              <strong className="font-mono uppercase text-cyan-400">
                How Defenders Fight Back:
              </strong>{" "}
              {stage.defenderAction}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
