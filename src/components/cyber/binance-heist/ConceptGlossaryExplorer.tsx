import React, { useState } from "react";
import { BookOpen, Cpu, Lightbulb, Crosshair } from "lucide-react";
import { CONCEPTS } from "./data";

export function ConceptGlossaryExplorer() {
  const [activeId, setActiveId] = useState<string>(CONCEPTS[0].id);
  const [viewMode, setViewMode] = useState<"analogy" | "technical">("analogy");

  const active = CONCEPTS.find((c) => c.id === activeId) || CONCEPTS[0];

  return (
    <section
      aria-label="Interactive Plain-English Concept Decoder"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5 font-mono">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/30">
            <BookOpen className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground">
              60-Second Jargon Decoder
            </div>
            <div className="text-[11px] text-muted-foreground font-sans">
              New to crypto security? Tap any term below before diving into the heist
            </div>
          </div>
        </div>

        <div
          role="group"
          aria-label="Explanation mode"
          className="inline-flex rounded-lg border border-border bg-background/70 p-0.5 font-mono text-[11px]"
        >
          <button
            type="button"
            aria-pressed={viewMode === "analogy"}
            onClick={() => setViewMode("analogy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === "analogy"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Everyday Analogy</span>
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "technical"}
            onClick={() => setViewMode("technical")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === "technical"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>How It Works</span>
          </button>
        </div>
      </div>

      {/* Simple 6-Tile Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-b border-border/60 bg-background/30">
        {CONCEPTS.map((item) => {
          const isActive = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveId(item.id)}
              className={`text-left px-3 py-2.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                isActive
                  ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-300 font-bold"
                  : "border-border/60 bg-card text-foreground/80 hover:bg-muted/40"
              }`}
            >
              {item.term}
            </button>
          );
        })}
      </div>

      {/* Focused Explanation Card */}
      <div
        key={`${active.id}-${viewMode}`}
        aria-live="polite"
        className="p-5 space-y-3 animate-in fade-in duration-200"
      >
        <div>
          <h4 className="font-mono text-base font-bold text-foreground m-0">{active.term}</h4>
          <p className="mt-1 text-xs text-muted-foreground m-0 font-sans">{active.shortDef}</p>
        </div>

        <div
          className={`rounded-lg border p-3.5 ${
            viewMode === "analogy"
              ? "border-emerald-500/30 bg-emerald-500/[0.06]"
              : "border-cyan-500/30 bg-cyan-500/[0.06]"
          }`}
        >
          <p className="text-sm text-foreground/90 leading-relaxed m-0 font-sans">
            {viewMode === "analogy" ? active.analogy : active.technical}
          </p>
        </div>

        <div className="flex items-start gap-2 text-xs text-amber-300 font-sans pt-0.5">
          <Crosshair className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong className="font-mono uppercase text-amber-400">Oct 29 Impact:</strong>{" "}
            {active.roleInHeist}
          </span>
        </div>
      </div>
    </section>
  );
}
