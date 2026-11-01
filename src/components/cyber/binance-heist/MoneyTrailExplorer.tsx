import React, { useState } from "react";
import { Coins, Filter } from "lucide-react";
import { CHAIN_BREAKDOWN, type ChainBreakdownItem } from "./data";

type FilterMode = "All" | "Mostly Frozen" | "Unfreezable";

export function MoneyTrailExplorer() {
  const [filterMode, setFilterMode] = useState<FilterMode>("All");
  const [selectedChainId, setSelectedChainId] = useState<string>("ethereum");

  const visibleChains = CHAIN_BREAKDOWN.filter((item) => {
    if (filterMode === "All") return true;
    if (filterMode === "Mostly Frozen") return item.frozenEstimateM >= 30;
    return item.freezeCategory === "Unfreezable" || item.atLargeEstimateM >= 200;
  });

  const activeChain: ChainBreakdownItem =
    visibleChains.find((c) => c.id === selectedChainId) || visibleChains[0] || CHAIN_BREAKDOWN[0];

  return (
    <section
      aria-label="Interactive 10-Blockchain Loot Breakdown"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5 font-mono">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/30">
            <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground">
              Where the $6.36B Came From (10-Chain Breakdown)
            </div>
            <div className="text-[11px] text-muted-foreground font-sans">
              Click any blockchain bar to see what was drained and whether issuers could freeze it
            </div>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter chains"
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/70 p-0.5 font-mono text-[11px]"
        >
          <Filter className="h-3 w-3 text-muted-foreground ml-2 mr-0.5" />
          {(["All", "Mostly Frozen", "Unfreezable"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={filterMode === mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterMode === mode
                  ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/35 font-bold"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-4 space-y-1.5">
          {visibleChains.map((chain) => {
            const isSelected = chain.id === activeChain.id;
            const frozenRatio = chain.frozenEstimateM / chain.amountM;
            const barWidth = Math.max(6, Math.min(100, chain.sharePct * 1.6));
            return (
              <button
                key={chain.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedChainId(chain.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "border-cyan-400/60 bg-cyan-500/10"
                    : "border-border/50 bg-background/30 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs mb-1">
                  <span className="font-bold text-foreground">{chain.name}</span>
                  <span className="text-foreground font-bold">
                    {chain.displayAmount}{" "}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      ({chain.sharePct}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/70 overflow-hidden flex">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${barWidth * frozenRatio}%` }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${barWidth * (1 - frozenRatio)}%` }}
                  />
                </div>
              </button>
            );
          })}
          <div className="pt-1.5 flex items-center gap-4 font-mono text-[10px] text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Frozen On-Chain
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Unfreezable / Escaped
            </span>
          </div>
        </div>

        <div
          key={activeChain.id}
          aria-live="polite"
          className="p-5 flex flex-col justify-between gap-3.5 bg-background/20 animate-in fade-in duration-200"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-mono text-base font-bold text-foreground m-0">
                {activeChain.name}
              </h4>
              <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-cyan-700 dark:text-cyan-300 font-bold">
                {activeChain.vectorType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/[0.06] p-2.5">
                <div className="text-[10px] text-muted-foreground">Frozen</div>
                <div className="mt-0.5 font-bold text-cyan-700 dark:text-cyan-300">
                  ~${activeChain.frozenEstimateM.toLocaleString()}M
                </div>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-2.5">
                <div className="text-[10px] text-muted-foreground">Unfreezable</div>
                <div className="mt-0.5 font-bold text-amber-700 dark:text-amber-300">
                  ~${activeChain.atLargeEstimateM.toLocaleString()}M
                </div>
              </div>
            </div>

            <div className="font-mono text-xs space-y-0.5">
              <div className="text-[10px] uppercase text-muted-foreground">Assets Taken</div>
              <div className="text-foreground/90">{activeChain.primaryAssets}</div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3.5 text-sm font-sans text-foreground/90 leading-relaxed">
            {activeChain.simpleTakeaway}
          </div>
        </div>
      </div>
    </section>
  );
}
