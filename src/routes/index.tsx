import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Swords,
  BookOpen,
  FileTerminal,
  Search,
} from "lucide-react";
import { CyberLayout } from "@/components/cyber/Layout";
import { postsMeta } from "@/data/posts";
import { cheatsheetFiles } from "@/data/cheatsheets";
import { writeupsMeta } from "@/data/writeups";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Asbawy — Security Research & Dev Logs" },
      {
        name: "description",
        content: "Offensive security research, CTF writeups, dev logs, and cheatsheets by Asbawy.",
      },
      { property: "og:title", content: "Asbawy — Security Research" },
      {
        property: "og:description",
        content:
          "Offensive security research, CTF walkthroughs, dev logs, and cheatsheets by Asbawy.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  // Sort cheatsheets by date
  const sortedCheatsheets = [...cheatsheetFiles]
    .sort((a, b) => {
      const dateA = new Date(a.meta.updated || a.meta.date || "1970-01-01").getTime();
      const dateB = new Date(b.meta.updated || b.meta.date || "1970-01-01").getTime();
      return dateB - dateA;
    })
    .slice(0, 4);

  return (
    <CyberLayout>
      <section className="px-4 md:px-10 py-8 max-w-6xl space-y-12">
        {/* ── Retro Minimalist Hero Section ──────────────────── */}
        <div className="rounded-xl border border-border bg-card/80 p-6 md:p-8 font-mono shadow-xl transition-all duration-300 hover:border-foreground/30">
          {/* Terminal Command Header */}
          <div className="text-[11px] mb-5 flex items-center gap-1.5 font-mono">
            <span className="text-emerald-500 font-bold">asbawy</span>
            <span className="text-muted-foreground">@</span>
            <span className="text-cyan-500">dedsec</span>
            <span className="text-muted-foreground">~$</span>
            <span className="text-foreground/80 font-medium">./status --all</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Asbawy
            <span className="text-muted-foreground font-normal text-lg md:text-xl font-mono ml-2">
              _security_research
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-xs md:text-sm text-muted-foreground leading-relaxed font-mono">
            Offensive security research, reverse engineering, endpoint security, and CTF
            walkthroughs. Documenting exploit development, low-level internals, and red teaming
            tools.
          </p>

          {/* Retro Navigation Links */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-mono">
            <Link
              to="/writeups"
              className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 hover:underline underline-offset-4 transition-all"
            >
              <Swords className="h-3.5 w-3.5" />
              <span>[writeups]</span>
            </Link>
            <Link
              to="/cheatsheet"
              className="inline-flex items-center gap-2 text-fuchsia-500 hover:text-fuchsia-400 hover:underline underline-offset-4 transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>[cheatsheets]</span>
            </Link>
            <Link
              to="/logs"
              className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 hover:underline underline-offset-4 transition-all"
            >
              <FileTerminal className="h-3.5 w-3.5" />
              <span>[logs]</span>
            </Link>
          </div>

          {/* Retro Search Prompt */}
          <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span>
                Press{" "}
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[9.5px] text-foreground font-bold">
                  Ctrl+K
                </kbd>{" "}
                to search dedsec
              </span>
            </div>
          </div>
        </div>

        {/* ── Retro Minimalist Metrics Bar ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="group rounded-lg border border-border bg-card p-4 font-mono text-center transition-all duration-300 hover:border-emerald-500/50">
            <div className="text-2xl font-bold text-foreground group-hover:text-emerald-500 transition-colors">
              {writeupsMeta.length}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              writeups
            </div>
          </div>

          <div className="group rounded-lg border border-border bg-card p-4 font-mono text-center transition-all duration-300 hover:border-fuchsia-500/50">
            <div className="text-2xl font-bold text-foreground group-hover:text-fuchsia-500 transition-colors">
              {cheatsheetFiles.length}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              cheatsheets
            </div>
          </div>

          <div className="group rounded-lg border border-border bg-card p-4 font-mono text-center transition-all duration-300 hover:border-cyan-500/50">
            <div className="text-2xl font-bold text-foreground group-hover:text-cyan-500 transition-colors">
              {postsMeta.length}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              logs
            </div>
          </div>

          <div className="group rounded-lg border border-border bg-card p-4 font-mono text-center transition-all duration-300 hover:border-amber-500/50">
            <div className="text-2xl font-bold text-amber-500">
              Active
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              status
            </div>
          </div>
        </div>

        {/* ── Section: Machine Writeups ────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono border-b border-border pb-2">
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-500">
              ~/pwned_machines
            </div>
            <Link
              to="/writeups"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>[view_all]</span>
            </Link>
          </div>

          {writeupsMeta.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center font-mono text-xs text-muted-foreground">
              // no writeups available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {writeupsMeta.slice(0, 4).map((w) => {
                const platformColor =
                  w.platform === "HackTheBox"
                    ? "text-[#9FEF00]"
                    : w.platform === "TryHackMe"
                      ? "text-[#FF3E3E]"
                      : w.platform === "VulnHub"
                        ? "text-[#4FC3F7]"
                        : w.platform === "CTF"
                          ? "text-[#FFD43B]"
                          : "text-[#C792EA]";

                const difficultyColor =
                  w.difficulty.toLowerCase() === "easy"
                    ? "text-emerald-500"
                    : w.difficulty.toLowerCase() === "medium"
                      ? "text-amber-500"
                      : w.difficulty.toLowerCase() === "hard"
                        ? "text-red-500"
                        : w.difficulty.toLowerCase() === "insane"
                          ? "text-fuchsia-500"
                          : "text-muted-foreground";

                return (
                  <Link
                    key={w.slug}
                    to="/writeups/$slug"
                    params={{ slug: w.slug }}
                    preload="intent"
                    className="group block rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-emerald-500/50 hover:bg-card-hover"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] mb-3">
                      <span className={`font-semibold ${platformColor}`}>{w.platform}</span>
                      <span className={`${difficultyColor} uppercase tracking-wider font-bold`}>{w.difficulty}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-500 transition-colors leading-snug">
                      {w.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {w.excerpt}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {w.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[9px] text-muted-foreground font-mono before:content-['#']">
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section: Dev Logs & Research ───────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono border-b border-border pb-2">
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-cyan-500">
              ~/security_research
            </div>
            <Link
              to="/logs"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>[view_all]</span>
            </Link>
          </div>

          {postsMeta.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center font-mono text-xs text-muted-foreground">
              // no log entries yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {postsMeta.slice(0, 4).map((p) => (
                <Link
                  key={p.slug}
                  to="/logs/$slug"
                  params={{ slug: p.slug }}
                  preload="intent"
                  className="group block rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-cyan-500/50 hover:bg-card-hover"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] mb-3">
                    <span className="text-muted-foreground">{p.date}</span>
                    <span className="text-cyan-500 font-semibold uppercase tracking-wider">
                      {p.category.toLowerCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-cyan-500 transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {p.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[9px] text-muted-foreground font-mono before:content-['#']">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Section: Reference Cheatsheets ────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono border-b border-border pb-2">
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-fuchsia-500">
              ~/reference_cheatsheets
            </div>
            <Link
              to="/cheatsheet"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>[view_all]</span>
            </Link>
          </div>

          {sortedCheatsheets.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center font-mono text-xs text-muted-foreground">
              // no cheatsheets available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedCheatsheets.map((file) => (
                <Link
                  key={file.path}
                  to="/cheatsheet/$"
                  params={{ _splat: file.path }}
                  preload="intent"
                  className="group block rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-fuchsia-500/50 hover:bg-card-hover"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] mb-3">
                    <span className="text-muted-foreground">
                      {file.meta.updated || file.meta.date}
                    </span>
                    <span className="text-fuchsia-500 font-semibold uppercase tracking-wider">
                      {file.meta.category?.toLowerCase() || "reference"}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-fuchsia-500 transition-colors leading-snug">
                    {file.meta.title || file.path.split("/").pop()}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {file.meta.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {file.meta.tags?.slice(0, 3).map((t) => (
                      <span key={t} className="text-[9px] text-muted-foreground font-mono before:content-['#']">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </CyberLayout>
  );
}

