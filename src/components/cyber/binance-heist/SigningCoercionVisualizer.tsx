import React, { useState } from "react";
import {
  UserCheck,
  Laptop,
  Container,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export function SigningCoercionVisualizer() {
  const [mode, setMode] = useState<"normal" | "hijacked">("normal");
  const isHijacked = mode === "hijacked";

  return (
    <section
      aria-label="Interactive Signing Pipeline Comparison"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
        <div className="font-mono">
          <div className="text-xs font-bold uppercase tracking-widest text-foreground">
            How $6.36B Moved With Zero Stolen Private Keys
          </div>
          <div className="text-[11px] text-muted-foreground font-sans">
            Switch between a normal day and October 29 to see what the attackers actually hijacked
          </div>
        </div>

        <div
          role="group"
          aria-label="Pipeline mode toggle"
          className="inline-flex rounded-lg border border-border bg-background/70 p-0.5 font-mono text-[11px]"
        >
          <button
            type="button"
            aria-pressed={!isHijacked}
            onClick={() => setMode("normal")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              !isHijacked
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/35"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            1. Normal Payout
          </button>
          <button
            type="button"
            aria-pressed={isHijacked}
            onClick={() => setMode("hijacked")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              isHijacked
                ? "bg-red-500/15 text-red-400 border border-red-500/40"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            2. Oct 29 Hijack
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4" aria-live="polite">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2.5 font-mono text-xs">
          {/* Stage 1: Entry */}
          <div
            className={`rounded-lg border p-3.5 transition-all ${
              isHijacked
                ? "border-red-500/45 bg-red-500/10"
                : "border-emerald-500/35 bg-emerald-500/[0.06]"
            }`}
          >
            <div
              className={`flex items-center gap-1.5 font-bold ${
                isHijacked ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {isHijacked ? (
                <Laptop className="h-4 w-4 shrink-0" />
              ) : (
                <UserCheck className="h-4 w-4 shrink-0" />
              )}
              <span>{isHijacked ? "Infected DevOps Laptop" : "Real Customer Request"}</span>
            </div>
            <p className="mt-2 text-xs font-sans text-foreground/85 leading-relaxed m-0">
              {isHijacked
                ? "Malware steals developer cloud tokens and pivots inside Binance's internal network."
                : "A verified user passes 2FA and requests a routine $500 withdrawal."}
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <ArrowRight
              className={`h-4 w-4 ${
                isHijacked ? "text-red-400 animate-pulse" : "text-emerald-400"
              }`}
            />
          </div>

          {/* Stage 2: Withdrawal Container */}
          <div
            className={`rounded-lg border p-3.5 transition-all ${
              isHijacked ? "border-amber-500/50 bg-amber-500/10" : "border-border bg-background/60"
            }`}
          >
            <div
              className={`flex items-center gap-1.5 font-bold ${
                isHijacked ? "text-amber-300" : "text-foreground"
              }`}
            >
              <Container className="h-4 w-4 shrink-0" />
              <span>Withdrawal Container</span>
            </div>
            <p className="mt-2 text-xs font-sans text-foreground/85 leading-relaxed m-0">
              {isHijacked
                ? "POISONED: Attackers inject their own wallet addresses and 50 EIP-7702 slips into the trusted queue."
                : "Formats the unsigned payout slip and forwards it over an authenticated internal API."}
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <ArrowRight
              className={`h-4 w-4 ${
                isHijacked ? "text-amber-400 animate-pulse" : "text-emerald-400"
              }`}
            />
          </div>

          {/* Stage 3: Hardware Signer */}
          <div className="rounded-lg border border-cyan-500/35 bg-cyan-500/[0.06] p-3.5">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Hardware Signer (HSM)</span>
            </div>
            <p className="mt-2 text-xs font-sans text-foreground/85 leading-relaxed m-0">
              {isHijacked
                ? "Private keys never leave the box, yet the box trusts the container and stamps valid signatures!"
                : "Private keys stay locked inside hardware while stamping a valid signature on the slip."}
            </p>
          </div>
        </div>

        {/* Plain-English Bottom Summary */}
        <div
          className={`rounded-lg border p-3.5 flex items-start gap-2.5 text-sm font-sans ${
            isHijacked
              ? "border-red-500/35 bg-red-500/[0.07] text-foreground/90"
              : "border-emerald-500/30 bg-emerald-500/[0.06] text-foreground/90"
          }`}
        >
          {isHijacked ? (
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <span>
            {isHijacked ? (
              <>
                <strong>The Pneumatic-Tube Trick:</strong> Attackers never cracked the titanium
                vault. They hijacked the clerk sending slips down the tube, so Binance's own signing
                machine approved $6.36 billion in payouts across 10 blockchains.
              </>
            ) : (
              <>
                <strong>Why Hardware Signers Exist:</strong> Because exchanges pay out thousands of
                customers every minute, the hardware signer trusts requests arriving from the
                internal withdrawal container.
              </>
            )}
          </span>
        </div>
      </div>
    </section>
  );
}
