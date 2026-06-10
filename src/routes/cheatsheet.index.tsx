import { createFileRoute } from "@tanstack/react-router";
import { Lock, Zap, Terminal, Sparkles, FolderOpen } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/cheatsheet/")({
  component: CheatsheetIndex,
});

function GlitchText({ text }: { text: string }) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-all ${glitch ? "translate-x-[2px] text-threat-high opacity-80" : ""}`}
    >
      {text}
    </span>
  );
}

function FloatingParticle({ delay }: { delay: number }) {
  return (
    <div
      className="absolute h-1 w-1 rounded-full bg-neon-green/30 animate-pulse"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}ms`,
        animationDuration: `${2000 + Math.random() * 3000}ms`,
      }}
    />
  );
}

function CheatsheetIndex() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-lg text-center">
        {/* Glow backdrop */}
        <div className="relative">
          <div className="absolute inset-0 bg-neon-green/[0.02] blur-3xl rounded-full scale-150" />

          <div className="relative">
            {/* Icon cluster */}
            <div className="relative mb-6 inline-flex">
              <div className="absolute inset-0 rounded-full bg-neon-green/10 blur-2xl scale-[2]" />
              <div className="relative flex items-center gap-4">
                <Lock className="h-5 w-5 text-neon-green animate-pulse" />
                <Terminal className="h-7 w-7 text-neon-green" />
                <Zap className="h-5 w-5 text-threat-mid animate-pulse" />
              </div>
            </div>

            {/* Main message */}
            <h2 className="font-mono text-lg md:text-xl text-foreground mb-2">
              <GlitchText text="[ SELECT A FILE ]" />
            </h2>
            <p className="font-mono text-xs text-muted-foreground mb-6">
              <FolderOpen className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Browse the tree on the left to view a cheatsheet
            </p>

            {/* Decorative terminal */}
            <div className="relative mx-auto max-w-xs">
              {Array.from({ length: 8 }).map((_, i) => (
                <FloatingParticle key={i} delay={i * 500} />
              ))}

              <div className="text-left rounded-xl border border-panel-border bg-panel/60 backdrop-blur-md shadow-2xl p-5 font-mono text-[12px] text-muted-foreground space-y-2 relative z-10 transition-all hover:border-neon-green/40 hover:shadow-[0_0_30px_rgba(var(--neon-green),0.1)]">
                <div>
                  <span className="text-neon-green font-bold">$</span> <span className="text-foreground/90">loading cheatsheets{dots}</span>
                </div>
                <div>
                  <span className="text-neon-green font-bold">[info]</span> modules queued: web, network, crypto, RE
                </div>
                <div>
                  <span className="text-threat-mid font-bold">[warn]</span> select a file to begin
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-neon-green font-bold">$</span>
                  <span className="inline-block w-2.5 h-4 bg-neon-green/80 animate-pulse rounded-sm" />
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


