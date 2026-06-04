import { createFileRoute } from "@tanstack/react-router";
import { CyberLayout, Panel } from "@/components/cyber/Layout";
import { Lock, Zap, Terminal, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/cheatsheet")({
  head: () => ({
    meta: [
      { title: "/cheatsheet — Asbawy Blog" },
      {
        name: "description",
        content:
          "Security cheatsheets, quick references, and field notes by Asbawy.",
      },
      { property: "og:title", content: "/cheatsheet — Asbawy Blog" },
      {
        property: "og:description",
        content: "Quick-reference cheatsheets for security and development.",
      },
    ],
  }),
  component: CheatsheetPage,
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

function CheatsheetPage() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <CyberLayout>
      <section className="px-6 md:px-10 py-10 max-w-5xl">
        {/* Breadcrumb */}
        <div className="font-mono text-[11px] text-muted-foreground">
          <span className="text-neon-green">asbawy</span>:
          <span className="text-neon-blue">~/cheatsheet</span>$ cat
          README.md
        </div>
        <h1 className="mt-2 font-mono text-2xl md:text-3xl text-foreground">
          /cheatsheet{" "}
          <span className="text-muted-foreground">— quick_ref</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Field-tested commands, payloads, and shortcuts — all in one place.
        </p>

        {/* Coming Soon Hero */}
        <div className="mt-10 relative">
          <Panel title="status_report">
            <div className="relative overflow-hidden py-16 md:py-24 flex flex-col items-center justify-center text-center">
              {/* Background particles */}
              {Array.from({ length: 12 }).map((_, i) => (
                <FloatingParticle key={i} delay={i * 400} />
              ))}

              {/* Icon cluster */}
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-neon-green/10 blur-2xl scale-150" />
                <div className="relative flex items-center gap-3">
                  <Lock className="h-6 w-6 text-neon-blue animate-pulse" />
                  <Terminal className="h-8 w-8 text-neon-green" />
                  <Zap className="h-6 w-6 text-threat-mid animate-pulse" />
                </div>
              </div>

              {/* Main message */}
              <h2 className="font-mono text-lg md:text-xl text-foreground">
                <GlitchText text="[ CLASSIFIED ]" />
              </h2>
              <div className="mt-4 max-w-md">
                <p className="font-mono text-sm text-neon-green text-glow-green">
                  &gt; impressive things will happen here{dots}
                </p>
                <p className="mt-2 font-mono text-sm text-neon-green/80">
                  &gt; just wait{" "}
                  <Sparkles className="inline h-3.5 w-3.5 text-threat-mid" />
                </p>
              </div>

              {/* Decorative terminal output */}
              <div className="mt-8 w-full max-w-sm text-left rounded-md border border-panel-border bg-background/60 p-4 font-mono text-[11px] text-muted-foreground space-y-1">
                <div>
                  <span className="text-neon-green">$</span> loading
                  cheatsheets...
                </div>
                <div>
                  <span className="text-neon-blue">[info]</span> modules
                  queued: web, network, crypto, RE
                </div>
                <div>
                  <span className="text-threat-mid">[warn]</span> content
                  pending deployment
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-neon-green">$</span>
                  <span className="inline-block w-2 h-3.5 bg-neon-green/80 animate-pulse" />
                </div>
              </div>

              {/* ETA badge */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/5 px-4 py-1.5 font-mono text-[11px] text-neon-green">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-green pulse-dot" />
                eta: soon™
              </div>
            </div>
          </Panel>
        </div>
      </section>
    </CyberLayout>
  );
}
