import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldAlert,
  Lock,
  Activity,
} from "lucide-react";
import { TIMELINE_FRAMES } from "./data";

const ALL_CHAINS = [
  "Ethereum",
  "Bitcoin",
  "Tron",
  "XRP Ledger",
  "Solana",
  "Arbitrum",
  "Optimism",
  "Base",
  "Avalanche",
  "Polygon",
];

function useAnimatedNumber(target: number, durationMs = 450): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const startVal = prevRef.current;
    if (startVal === target) return;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startVal + (target - startVal) * eased;
      setDisplay(current);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      prevRef.current = target;
    };
  }, [target, durationMs]);

  return display;
}

export function HeistTimelineSimulator() {
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<3200 | 1800>(3200);

  const frame = TIMELINE_FRAMES[stepIdx];

  const animGross = useAnimatedNumber(frame.grossStolenB);
  const animFrozen = useAnimatedNumber(frame.frozenB);
  const animAtLarge = useAnimatedNumber(frame.atLargeB);
  const animReplenished = useAnimatedNumber(frame.replenishedB);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= TIMELINE_FRAMES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      setIsPlaying(false);
      setStepIdx((p) => Math.min(TIMELINE_FRAMES.length - 1, p + 1));
    } else if (e.key === "ArrowLeft") {
      setIsPlaying(false);
      setStepIdx((p) => Math.max(0, p - 1));
    }
  };

  const phaseBadgeClass =
    frame.phase === "Hijack" || frame.phase === "Blitz"
      ? "border-red-500/40 bg-red-500/15 text-red-400"
      : frame.phase === "Laundering"
        ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
        : frame.phase === "Containment"
          ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-400"
          : frame.phase === "Recovery"
            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
            : "border-border bg-muted/60 text-muted-foreground";

  return (
    <section
      aria-label="Animated Incident Timeline Replay Simulator"
      onKeyDown={handleKeyDown}
      className="my-10 max-w-[80ch] rounded-xl border border-border bg-card overflow-hidden shadow-xl"
    >
      {/* Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5 font-mono">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/15 border border-red-500/30">
            <Activity className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground">
              Incident Replay Simulator (Oct 28 – Nov 2, 2026)
            </div>
            <div className="text-[11px] text-muted-foreground">
              Press Play or step through each timestamp to watch outflows, DeFi swaps, and freezes
              unfold
            </div>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              if (stepIdx >= TIMELINE_FRAMES.length - 1) setStepIdx(0);
              setIsPlaying((p) => !p);
            }}
            aria-label={isPlaying ? "Pause timeline replay" : "Play timeline replay"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-bold transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? "Pause" : "Auto-Play"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((p) => Math.max(0, p - 1));
            }}
            disabled={stepIdx === 0}
            aria-label="Previous event"
            className="p-1.5 rounded-lg border border-border bg-background/60 text-foreground disabled:opacity-35 hover:bg-muted transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((p) => Math.min(TIMELINE_FRAMES.length - 1, p + 1));
            }}
            disabled={stepIdx === TIMELINE_FRAMES.length - 1}
            aria-label="Next event"
            className="p-1.5 rounded-lg border border-border bg-background/60 text-foreground disabled:opacity-35 hover:bg-muted transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setSpeedMs((s) => (s === 3200 ? 1800 : 3200))}
            aria-label="Toggle playback speed"
            className="px-2 py-1.5 rounded-lg border border-border bg-background/60 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {speedMs === 3200 ? "1x" : "2x"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx(0);
            }}
            aria-label="Reset replay to start"
            className="p-1.5 rounded-lg border border-border bg-background/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Timeline Stepper Bar */}
      <div className="px-5 py-3 border-b border-border/60 bg-background/40">
        <div className="grid grid-cols-9 gap-1.5" role="tablist" aria-label="Timeline stages">
          {TIMELINE_FRAMES.map((f, idx) => {
            const isCurrent = idx === stepIdx;
            const isPast = idx < stepIdx;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`${f.timeEt}: ${f.title}`}
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(idx);
                }}
                className={`group flex flex-col items-start p-1.5 rounded-md border transition-all cursor-pointer ${
                  isCurrent
                    ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_12px_rgba(34,211,238,0.18)]"
                    : isPast
                      ? "border-emerald-500/30 bg-emerald-500/[0.06] hover:bg-emerald-500/10"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <span
                  className={`font-mono text-[10px] font-bold ${
                    isCurrent
                      ? "text-cyan-400"
                      : isPast
                        ? "text-emerald-400"
                        : "text-muted-foreground"
                  }`}
                >
                  0{idx + 1}
                </span>
                <span className="hidden sm:block font-mono text-[9px] text-muted-foreground truncate w-full">
                  {f.phase}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Animated Telemetry Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border border-b border-border bg-background/60 font-mono">
        <div className="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Gross Drained
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-red-400">
            ${animGross.toFixed(2)}B
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (frame.grossStolenB / 6.36) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Frozen On-Chain
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-cyan-400">
            ${animFrozen.toFixed(2)}B
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (frame.frozenB / 6.36) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Unfreezable At-Large
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-amber-400">
            ${animAtLarge.toFixed(2)}B
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (frame.atLargeB / 6.36) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Binance User Backstop
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-emerald-400">
            ${animReplenished.toFixed(2)}B
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (frame.replenishedB / 6.36) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Event Narrative & 10-Chain Live Status Board */}
      <div className="p-5 space-y-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-bold">{frame.timeEt}</span>
            <span className="text-muted-foreground">({frame.timeUtc})</span>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${phaseBadgeClass}`}
          >
            Phase: {frame.phase}
          </span>
        </div>

        <div>
          <h4 className="font-mono text-base font-bold text-foreground m-0">{frame.title}</h4>
          <div className="mt-1 font-mono text-xs text-accent-primary">{frame.headline}</div>
        </div>

        <p className="text-[14px] text-foreground/85 leading-relaxed m-0 font-sans">
          {frame.explanation}
        </p>

        <div className="rounded-lg border border-border bg-muted/25 p-3.5 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[13px] text-foreground/80 leading-relaxed font-sans">
            <strong className="font-mono text-xs uppercase tracking-wider text-amber-400 mr-1.5">
              Strategic Significance:
            </strong>
            {frame.whyItMatters}
          </div>
        </div>

        {/* 10-Blockchain Live Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            <span>10-Blockchain Network Telemetry</span>
            <span>
              Binance 14 EIP-7702 Slot:{" "}
              <strong
                className={
                  frame.eip7702State === "hijacked"
                    ? "text-red-400"
                    : frame.eip7702State === "revoked"
                      ? "text-emerald-400"
                      : "text-amber-400"
                }
              >
                {frame.eip7702State.toUpperCase()}
              </strong>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono text-[11px]">
            {ALL_CHAINS.map((chain) => {
              const isDraining = frame.activeChains.includes(chain);
              const isFrozen = frame.frozenChains.includes(chain);
              return (
                <div
                  key={chain}
                  className={`px-2.5 py-1.5 rounded-md border flex items-center justify-between transition-all duration-300 ${
                    isDraining
                      ? "border-red-500/50 bg-red-500/15 text-red-300 font-bold"
                      : isFrozen
                        ? "border-cyan-500/40 bg-cyan-500/12 text-cyan-300 font-semibold"
                        : "border-border/50 bg-background/40 text-muted-foreground"
                  }`}
                >
                  <span className="truncate">{chain}</span>
                  {isDraining ? (
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  ) : isFrozen ? (
                    <Lock className="h-3 w-3 text-cyan-400 shrink-0" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
