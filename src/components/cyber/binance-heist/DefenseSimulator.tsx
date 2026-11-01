import React, { useState } from "react";
import { CheckSquare, Square, Sliders } from "lucide-react";
import { DEFENSE_CONTROLS } from "./data";

const GROSS_LOSS_M = 6360;

export function DefenseSimulator() {
  const [enabledIds, setEnabledIds] = useState<string[]>([]);

  const toggleControl = (id: string) => {
    setEnabledIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const mitigatedM = Math.min(
    GROSS_LOSS_M,
    DEFENSE_CONTROLS.filter((c) => enabledIds.includes(c.id)).reduce(
      (sum, c) => sum + c.mitigatesM,
      0,
    ),
  );
  const residualM = Math.max(0, GROSS_LOSS_M - mitigatedM);
  const residualB = residualM / 1000;
  const pctBlocked = Math.round((mitigatedM / GROSS_LOSS_M) * 100);

  return (
    <section
      aria-label="Interactive Custody Hardening Simulator"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/30">
            <Sliders className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground">
              What Would Have Stopped It? (Interactive Defense Lab)
            </div>
            <div className="text-[11px] text-muted-foreground font-sans">
              Illustrative model: toggle each control to estimate potential blast-radius reduction
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setEnabledIds(
              enabledIds.length === DEFENSE_CONTROLS.length
                ? []
                : DEFENSE_CONTROLS.map((c) => c.id),
            )
          }
          className="px-3 py-1 rounded-md border border-emerald-500/35 bg-emerald-500/10 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
        >
          {enabledIds.length === DEFENSE_CONTROLS.length ? "Reset All" : "Enable All 4"}
        </button>
      </div>

      <div className="px-5 py-4 border-b border-border/60 bg-background/50 font-mono space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-2">
              Remaining Stolen Funds:
            </span>
            <span
              className={`text-xl font-extrabold transition-colors ${
                residualM === 0
                  ? "text-emerald-400"
                  : residualM < 2000
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              ${residualB.toFixed(2)}B
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">(out of $6.36B)</span>
          </div>
          <span className="text-xs font-bold text-emerald-400">{pctBlocked}% Prevented</span>
        </div>

        <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex border border-border/60">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${pctBlocked}%` }}
          />
          <div
            className="h-full bg-red-500/80 transition-all duration-500"
            style={{ width: `${100 - pctBlocked}%` }}
          />
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEFENSE_CONTROLS.map((ctrl) => {
          const isOn = enabledIds.includes(ctrl.id);
          return (
            <button
              key={ctrl.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggleControl(ctrl.id)}
              className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isOn
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-border/60 bg-background/40 hover:bg-muted/30"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-mono">
                  {isOn ? (
                    <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs font-bold text-foreground">{ctrl.title}</span>
                </div>
                <p className="mt-2 text-xs font-sans text-foreground/80 leading-relaxed m-0">
                  {ctrl.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between font-mono text-[10px]">
                <span className="text-muted-foreground">{ctrl.layer}</span>
                <span className={isOn ? "text-emerald-400 font-bold" : "text-amber-300"}>
                  Est. ~${(ctrl.mitigatesM / 1000).toFixed(2)}B
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
