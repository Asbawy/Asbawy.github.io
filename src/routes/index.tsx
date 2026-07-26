import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Swords,
  BookOpen,
  FileTerminal,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
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
  const triggerSearch = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );
  };

  const sortedCheatsheets = [...cheatsheetFiles]
    .sort((a, b) => {
      const dateA = new Date(a.meta.updated || a.meta.date || "1970-01-01").getTime();
      const dateB = new Date(b.meta.updated || b.meta.date || "1970-01-01").getTime();
      return dateB - dateA;
    })
    .slice(0, 4);

  return (
    <CyberLayout>
      <div className="w-full min-h-full bg-background text-foreground py-10 px-6 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Hero Section */}
          <div className="rounded-2xl border border-border bg-card p-8 md:p-10 font-sans shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
            {/* Subtle Terminal Prompt Header */}
            

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
                Asbawy
              </h1>
              <p className="text-lg md:text-xl font-medium text-emerald-400 font-sans">
                Security Research & Offensive Operations
              </p>
            </div>

            {/* Description */}
            <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed font-sans">
              Offensive security research, reverse engineering, endpoint security, and CTF
              walkthroughs. Documenting exploit development, low-level internals, and red teaming
              tools.
            </p>

            {/* Action Buttons Row */}
            <div className="mt-8 flex flex-wrap items-center gap-3 font-sans">
              <Link
                to="/writeups"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all shadow-[0_0_15px_rgba(52,211,153,0.12)]"
              >
                <Swords className="h-4 w-4" />
                <span>Writeups ({writeupsMeta.length})</span>
              </Link>
              <Link
                to="/cheatsheet"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-500/25 transition-all shadow-[0_0_15px_rgba(232,121,249,0.12)]"
              >
                <BookOpen className="h-4 w-4" />
                <span>Cheatsheets ({cheatsheetFiles.length})</span>
              </Link>
              <Link
                to="/logs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all shadow-[0_0_15px_rgba(34,211,238,0.12)]"
              >
                <FileTerminal className="h-4 w-4" />
                <span>Logs ({postsMeta.length})</span>
              </Link>
            </div>

            {/* Global Search Hint */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground font-sans">
              <button
                onClick={triggerSearch}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                <span>
                  Press{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-foreground font-mono font-bold">
                    ⌘K
                  </kbd>{" "}
                  to search dedicated research library
                </span>
              </button>
            </div>
          </div>

          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
            <div className="rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 hover:border-emerald-500/40">
              <Swords className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-foreground">{writeupsMeta.length}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                Writeups
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 hover:border-fuchsia-500/40">
              <BookOpen className="w-5 h-5 text-fuchsia-400 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-foreground">{cheatsheetFiles.length}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                Cheatsheets
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 hover:border-cyan-500/40">
              <FileTerminal className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-foreground">{postsMeta.length}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                Logs
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 hover:border-amber-500/40">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-amber-400 flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                Status
              </div>
            </div>
          </div>

          {/* Section: Dev Logs & Research */}
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <FileTerminal className="w-5 h-5 text-cyan-400" />
                <h2>Security Research Logs</h2>
              </div>
              <Link
                to="/logs"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postsMeta.slice(0, 4).map((p) => (
                <Link
                  key={p.slug}
                  to="/logs/$slug"
                  params={{ slug: p.slug }}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-200"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium">
                        {p.category}
                      </span>
                      <span className="text-muted-foreground">{p.date}</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-cyan-400 transition-colors leading-snug">
                      {p.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Section: Machine Writeups */}
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Swords className="w-5 h-5 text-emerald-400" />
                <h2>CTF Walkthroughs & Pwned Machines</h2>
              </div>
              <Link
                to="/writeups"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {writeupsMeta.slice(0, 4).map((w) => {
                const diffColor =
                  w.difficulty.toLowerCase() === "easy"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : w.difficulty.toLowerCase() === "medium"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20";

                return (
                  <Link
                    key={w.slug}
                    to="/writeups/$slug"
                    params={{ slug: w.slug }}
                    className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-200"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                          {w.platform}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${diffColor}`}>
                          {w.difficulty}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-400 transition-colors leading-snug">
                        {w.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {w.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {w.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Read →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section: Reference Cheatsheets */}
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <BookOpen className="w-5 h-5 text-fuchsia-400" />
                <h2>Quick Reference Cheatsheets</h2>
              </div>
              <Link
                to="/cheatsheet"
                className="text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedCheatsheets.map((file) => (
                <Link
                  key={file.path}
                  to="/cheatsheet/$"
                  params={{ _splat: file.path }}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 hover:-translate-y-1 hover:border-fuchsia-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-200"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30 text-[11px] font-semibold">
                        {file.meta.category || "General"}
                      </span>
                      <span className="text-muted-foreground">{file.meta.readTime || "5 min"}</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-fuchsia-400 transition-colors leading-snug">
                      {file.meta.title || file.path.split("/").pop()}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {file.meta.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {file.meta.tags?.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
