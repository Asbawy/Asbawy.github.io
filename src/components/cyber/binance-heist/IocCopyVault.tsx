import React, { useState } from "react";
import { Shield, Check, Copy } from "lucide-react";
import { IOC_LIST } from "./data";

export function IocCopyVault() {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    window.setTimeout(() => setCopiedValue(null), 1800);
  };

  return (
    <section
      aria-label="Interactive One-Click IOC Copy Vault"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-lg font-mono"
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/30">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/15 border border-cyan-500/30">
          <Shield className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-foreground">
            Verified On-Chain IOC Vault (One-Click Copy)
          </div>
          <div className="text-[11px] text-muted-foreground font-sans">
            Primary Ethereum mainnet wallets, transaction hashes, and EIP-7702 bytecode markers
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {IOC_LIST.map((ioc) => {
          const isCopied = copiedValue === ioc.value;
          return (
            <div
              key={ioc.value}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/50 px-3.5 py-2.5 text-xs"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.5 text-[9.5px] font-bold text-cyan-300">
                    {ioc.tag}
                  </span>
                  <span className="text-xs font-semibold text-foreground font-sans">
                    {ioc.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-sans">({ioc.note})</span>
                </div>
                <div className="text-[11.5px] text-cyan-200/90 break-all">{ioc.value}</div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(ioc.value)}
                aria-label={`Copy ${ioc.label}`}
                className="self-start sm:self-center shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-card text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
