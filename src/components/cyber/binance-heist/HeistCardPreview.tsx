import { useEffect, useState } from "react";
import { Activity, ArrowRight, Cpu, Layers, Lock, ShieldAlert, Sparkles, Zap } from "lucide-react";

const LIVE_TICKER_FRAMES = [
  {
    phase: "VECTOR // ZERO KEYS LEAKED",
    detail: "DevOps container hijack -> 50x EIP-7702 nonces (18,914,775-824)",
    accent: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  {
    phase: "BLITZ // BLOCK 26300770",
    detail: "Binance 14 -> 0xef0100 sweeper drains $2.5B+ in 1 Ethereum tx",
    accent: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500 dark:bg-rose-400",
  },
  {
    phase: "COUNTER // 37-MIN FREEZE RACE",
    detail: "Tether & Circle lock $2.38B in 59m; $2.7B-$3.0B total immobilized",
    accent: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
] as const;

export function HeistCardPreview({ variant = "compact" }: { variant?: "compact" | "wide" }) {
  const [frameIdx, setFrameIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % LIVE_TICKER_FRAMES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const activeFrame = LIVE_TICKER_FRAMES[frameIdx];

  if (variant === "compact") {
    return (
      <div className="mt-3 rounded-lg border border-amber-500/30 dark:border-amber-500/25 bg-gradient-to-br from-rose-500/[0.06] via-amber-500/[0.04] to-cyan-500/[0.06] dark:from-rose-950/25 dark:via-background/90 dark:to-cyan-950/25 p-3 space-y-2.5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Mini KPI Strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md bg-rose-500/[0.08] dark:bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/25 px-2.5 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300/80">
                Gross Drain
              </span>
              <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-sm font-extrabold font-mono text-rose-700 dark:text-rose-300 tabular-nums mt-0.5">
              $6.36B
            </div>
            <div className="text-[9px] text-muted-foreground truncate">10 chains · 20m blitz</div>
          </div>

          <div className="rounded-md bg-amber-500/[0.08] dark:bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/25 px-2.5 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300/80">
                Exploit
              </span>
              <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-sm font-extrabold font-mono text-amber-800 dark:text-amber-300 tabular-nums mt-0.5">
              EIP-7702
            </div>
            <div className="text-[9px] text-muted-foreground truncate">50-nonce 0x04 salvo</div>
          </div>

          <div className="rounded-md bg-emerald-500/[0.08] dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/25 px-2.5 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300/80">
                Frozen
              </span>
              <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-sm font-extrabold font-mono text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
              $2.7B-$3B
            </div>
            <div className="text-[9px] text-muted-foreground truncate">USDT / USDC / ARB</div>
          </div>
        </div>

        {/* Segmented Chain Distribution Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-cyan-700 dark:text-cyan-300 font-semibold">
              ETH $3.80B (59.7%)
            </span>
            <span className="text-amber-700 dark:text-amber-300 font-semibold">
              BTC $1.50B (23.6%)
            </span>
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
              8 Chains $1.06B
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/80 dark:bg-muted/60 overflow-hidden flex gap-0.5 p-[1px] border border-border/70 dark:border-white/10">
            <div className="h-full w-[59.7%] rounded-l-full bg-gradient-to-r from-cyan-600 to-blue-500 dark:from-cyan-500 dark:to-blue-400" />
            <div className="h-full w-[23.6%] bg-gradient-to-r from-amber-500 to-yellow-500 dark:from-amber-500 dark:to-yellow-400" />
            <div className="h-full w-[16.7%] rounded-r-full bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400" />
          </div>
        </div>

        {/* Live-Cycling Telemetry Feed */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/60 dark:border-white/10 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${activeFrame.dot} animate-pulse shrink-0`}
            />
            <span className={`font-bold shrink-0 ${activeFrame.accent}`}>{activeFrame.phase}:</span>
            <span className="text-foreground/80 dark:text-muted-foreground truncate">
              {activeFrame.detail}
            </span>
          </div>
          <span className="text-[9px] font-semibold text-cyan-800 dark:text-cyan-300/90 bg-cyan-500/15 dark:bg-cyan-500/10 border border-cyan-500/35 dark:border-cyan-500/25 px-1.5 py-0.5 rounded shrink-0">
            12 Labs
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full md:w-[340px] lg:w-[380px] shrink-0 p-4 md:p-5 md:border-l border-t md:border-t-0 border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-br from-rose-500/[0.06] via-amber-500/[0.04] to-cyan-500/[0.06] dark:from-rose-950/20 dark:via-background/80 dark:to-cyan-950/20 flex flex-col justify-between gap-3.5">
      {/* Header Telemetry Label */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
          <Activity className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
          Live Incident Telemetry
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/35 dark:border-cyan-500/30">
          <Sparkles className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
          12 Interactive Labs
        </span>
      </div>

      {/* 2x2 Key Heist Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-rose-500/[0.08] dark:bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/25 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-rose-700 dark:text-rose-300/80 uppercase">
            <span>Stolen</span>
            <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-300 tabular-nums mt-0.5">
            $6.36 Billion
          </div>
          <div className="text-[10px] text-muted-foreground">~$300M/min peak rate</div>
        </div>

        <div className="rounded-lg bg-amber-500/[0.08] dark:bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/25 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-amber-800 dark:text-amber-300/80 uppercase">
            <span>Ethereum Vector</span>
            <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-base font-extrabold font-mono text-amber-800 dark:text-amber-300 tabular-nums mt-0.5">
            50x EIP-7702
          </div>
          <div className="text-[10px] text-muted-foreground">$2.5B+ in 1 block</div>
        </div>

        <div className="rounded-lg bg-emerald-500/[0.08] dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/25 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-emerald-800 dark:text-emerald-300/80 uppercase">
            <span>Immobilized</span>
            <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
            $2.7B - $3.0B
          </div>
          <div className="text-[10px] text-muted-foreground">$2.38B in first 59m</div>
        </div>

        <div className="rounded-lg bg-cyan-500/[0.08] dark:bg-cyan-500/10 border border-cyan-500/30 dark:border-cyan-500/25 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-cyan-800 dark:text-cyan-300/80 uppercase">
            <span>Attribution</span>
            <Layers className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-base font-extrabold font-mono text-cyan-800 dark:text-cyan-300 tabular-nums mt-0.5">
            TraderTraitor
          </div>
          <div className="text-[10px] text-muted-foreground">Zero private keys leaked</div>
        </div>
      </div>

      {/* Multi-Chain Proportion Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-cyan-700 dark:text-cyan-300 font-semibold">ETH $3.8B</span>
          <span className="text-amber-700 dark:text-amber-300 font-semibold">BTC $1.5B</span>
          <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
            TRX / XRP / SOL + 5 ($1.06B)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/80 dark:bg-muted/60 overflow-hidden flex gap-0.5 p-[1px] border border-border/70 dark:border-white/10">
          <div className="h-full w-[59.7%] rounded-l-full bg-gradient-to-r from-cyan-600 to-blue-500 dark:from-cyan-500 dark:to-blue-400" />
          <div className="h-full w-[23.6%] bg-gradient-to-r from-amber-500 to-yellow-500 dark:from-amber-500 dark:to-yellow-400" />
          <div className="h-full w-[16.7%] rounded-r-full bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400" />
        </div>
      </div>

      {/* Live Rotating Incident Ticker + CTA */}
      <div className="rounded-md bg-background/85 dark:bg-black/35 border border-border/80 dark:border-white/10 px-2.5 py-2 flex items-center justify-between gap-2 shadow-xs">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${activeFrame.dot} animate-pulse shrink-0`}
            />
            <span className={`text-[9px] font-mono font-bold uppercase ${activeFrame.accent}`}>
              {activeFrame.phase}
            </span>
          </div>
          <div className="text-[10px] font-mono text-foreground/80 dark:text-muted-foreground truncate mt-0.5">
            {activeFrame.detail}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 dark:border-amber-500/30 text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 group-hover:bg-amber-500/25 transition-colors shrink-0">
          <span>Launch</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}
