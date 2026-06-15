import { createFileRoute } from "@tanstack/react-router";
import { Lock, Zap, Terminal, FolderOpen } from "lucide-react";

export const Route = createFileRoute("/cheatsheet/")({
  component: CheatsheetIndex,
});

function CheatsheetIndex() {
  return (
    <div className="h-full flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-lg text-center">
        <div className="relative">
          <div className="relative">
            {/* Icon cluster */}
            <div className="relative mb-6 inline-flex">
              <div className="relative flex items-center gap-4">
                <Lock className="h-5 w-5 text-neon-green opacity-60" />
                <Terminal className="h-7 w-7 text-neon-green" />
                <Zap className="h-5 w-5 text-threat-mid opacity-60" />
              </div>
            </div>

            {/* Main message — pure CSS glitch via animation */}
            <h2 className="font-mono text-lg md:text-xl text-foreground mb-2">
              <span className="inline-block cyber-glitch">[ SELECT A FILE ]</span>
            </h2>
            <p className="font-mono text-xs text-muted-foreground mb-6">
              <FolderOpen className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Browse the tree on the left to view a cheatsheet
            </p>

            {/* Decorative terminal */}
            <div className="relative mx-auto max-w-xs">
              <div className="text-left rounded-xl border border-panel-border bg-panel/80 shadow-2xl p-5 font-mono text-[12px] text-muted-foreground space-y-2 relative z-10 transition-all hover:border-neon-green/40 hover:shadow-[0_0_30px_rgba(var(--neon-green),0.1)]">
                <div>
                  <span className="text-neon-green font-bold">$</span>{" "}
                  <span className="text-foreground/90">loading cheatsheets<span className="loading-dots" /></span>
                </div>
                <div>
                  <span className="text-neon-green font-bold">[info]</span> modules queued: web, network, crypto, RE
                </div>
                <div>
                  <span className="text-threat-mid font-bold">[warn]</span> select a file to begin
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-neon-green font-bold">$</span>
                  <span className="caret" />
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/5 px-4 py-1.5 font-mono text-[11px] text-neon-green">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-green pulse-dot" />
              ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
