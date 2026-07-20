import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Swords,
  BookOpen,
  ChevronRight,
  Activity,
  FileTerminal,
  Crosshair,
  Search,
} from "lucide-react";
import { CyberLayout, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";
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
      <section className="px-4 md:px-10 py-8 max-w-6xl space-y-10">
        {/* ── Minimal Space Hero Section ──────────────────── */}
        <div className="rounded-xl border border-border bg-card/40 p-6 md:p-8 font-mono">
          <div className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1.5">
            <span className="text-foreground font-semibold">asbawy</span>
            <span className="opacity-40">:</span>
            <span className="text-muted-foreground">~/space</span>
            <span className="opacity-40">$</span>
            <span className="text-muted-foreground/60">cat status.log</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Asbawy <span className="text-muted-foreground/60 font-normal">— security_research</span>
          </h1>

          <p className="mt-2.5 max-w-2xl text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
            Offensive security research, reverse engineering, endpoint security, and CTF
            walkthroughs. Documenting exploit development, low-level internals, and red teaming
            tools.
          </p>

          {/* Minimal Navigation Links */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs">
            <Link
              to="/writeups"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-foreground text-background px-3.5 py-1.5 font-semibold hover:bg-foreground/90 transition-colors cursor-pointer"
            >
              <Swords className="h-3.5 w-3.5" />
              <span>/writeups</span>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </Link>
            <Link
              to="/cheatsheet"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3.5 py-1.5 font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span>/cheatsheets</span>
            </Link>
            <Link
              to="/logs"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3.5 py-1.5 font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <FileTerminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span>/logs</span>
            </Link>
          </div>

          {/* Minimal Search Prompt */}
          <div className="mt-6 flex items-center justify-between rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 min-w-0 truncate text-[11px]">
              <Search className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              <span className="truncate">
                Press{" "}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] text-foreground font-mono">
                  Ctrl+K
                </kbd>{" "}
                to search writeups, cheatsheets, and logs
              </span>
            </div>
          </div>
        </div>

        {/* ── Key Metrics Bar ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-card/40 p-3.5 font-mono text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Swords className="h-3.5 w-3.5 text-foreground/70" />
              <span className="uppercase tracking-wider text-[10px]">pwned</span>
            </div>
            <div className="text-xl font-bold text-foreground">{writeupsMeta.length}</div>
            <div className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mt-0.5">
              writeups
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/40 p-3.5 font-mono text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <BookOpen className="h-3.5 w-3.5 text-foreground/70" />
              <span className="uppercase tracking-wider text-[10px]">knowledge</span>
            </div>
            <div className="text-xl font-bold text-foreground">{cheatsheetFiles.length}</div>
            <div className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mt-0.5">
              cheatsheets
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/40 p-3.5 font-mono text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <FileTerminal className="h-3.5 w-3.5 text-foreground/70" />
              <span className="uppercase tracking-wider text-[10px]">research</span>
            </div>
            <div className="text-xl font-bold text-foreground">{postsMeta.length}</div>
            <div className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mt-0.5">
              logs
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/40 p-3.5 font-mono text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Activity className="h-3.5 w-3.5 text-foreground/70" />
              <span className="uppercase tracking-wider text-[10px]">status</span>
            </div>
            <div className="text-xl font-bold text-foreground">Active</div>
            <div className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mt-0.5">
              online
            </div>
          </div>
        </div>

        {/* ── Section: Machine Writeups ────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-foreground">
              <Crosshair className="h-3.5 w-3.5 text-foreground/70" />
              <span>Pwned_Machines</span>
            </div>
            <Link
              to="/writeups"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>[ view_all ]</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {writeupsMeta.length === 0 ? (
            <div className="rounded-lg border border-border bg-card/40 p-8 text-center font-mono text-xs text-muted-foreground">
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
                const diffColor =
                  w.difficulty === "Easy"
                    ? "text-[#9FEF00]"
                    : w.difficulty === "Medium"
                      ? "text-[#FFD43B]"
                      : w.difficulty === "Hard"
                        ? "text-[#FF7043]"
                        : "text-[#FF3E3E]";
                const diffBg =
                  w.difficulty === "Easy"
                    ? "bg-[#9FEF00]/10 border-[#9FEF00]/20"
                    : w.difficulty === "Medium"
                      ? "bg-[#FFD43B]/10 border-[#FFD43B]/20"
                      : w.difficulty === "Hard"
                        ? "bg-[#FF7043]/10 border-[#FF7043]/20"
                        : "bg-[#FF3E3E]/10 border-[#FF3E3E]/20";

                return (
                  <Link
                    key={w.slug}
                    to="/writeups/$slug"
                    params={{ slug: w.slug }}
                    preload="intent"
                    className="group relative block rounded-lg border border-border bg-card/40 p-4 transition-all duration-200 hover:border-foreground/20 hover:bg-card/70"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] mb-2">
                      <span className={`font-semibold ${platformColor}`}>{w.platform}</span>
                      <span
                        className={`px-2 py-0.5 rounded border font-semibold ${diffBg} ${diffColor}`}
                      >
                        {w.difficulty}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors leading-snug">
                      {w.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground/75 line-clamp-2 leading-relaxed">
                      {w.excerpt}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {w.tags.slice(0, 3).map((t) => (
                        <Tag
                          key={t}
                          variant={tagVariantFor(t)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTagClick(t, navigate);
                          }}
                        >
                          {t}
                        </Tag>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section: Dev Logs & Research ───────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-foreground">
              <FileTerminal className="h-3.5 w-3.5 text-foreground/70" />
              <span>Security_Research</span>
            </div>
            <Link
              to="/logs"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>[ view_all ]</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {postsMeta.length === 0 ? (
            <div className="rounded-lg border border-border bg-card/40 p-8 text-center font-mono text-xs text-muted-foreground">
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
                  className="group relative block rounded-lg border border-border bg-card/40 p-4 transition-all duration-200 hover:border-foreground/20 hover:bg-card/70"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] mb-2">
                    <span className="text-muted-foreground/60">{p.date}</span>
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">
                      {p.category.toLowerCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground/75 line-clamp-2 leading-relaxed">
                    {p.excerpt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <Tag
                        key={t}
                        variant={tagVariantFor(t)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTagClick(t, navigate);
                        }}
                      >
                        {t}
                      </Tag>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Section: Reference Cheatsheets ────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-foreground">
              <BookOpen className="h-3.5 w-3.5 text-foreground/70" />
              <span>Reference_Cheatsheets</span>
            </div>
            <Link
              to="/cheatsheet"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>[ view_all ]</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {sortedCheatsheets.length === 0 ? (
            <div className="rounded-lg border border-border bg-card/40 p-8 text-center font-mono text-xs text-muted-foreground">
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
                  className="group relative block rounded-lg border border-border bg-card/40 p-4 transition-all duration-200 hover:border-foreground/20 hover:bg-card/70"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] mb-2">
                    <span className="text-muted-foreground/60">
                      {file.meta.updated || file.meta.date}
                    </span>
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">
                      {file.meta.category?.toLowerCase() || "reference"}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors leading-snug">
                    {file.meta.title || file.path.split("/").pop()}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground/75 line-clamp-2 leading-relaxed">
                    {file.meta.excerpt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {file.meta.tags?.slice(0, 3).map((t) => (
                      <Tag
                        key={t}
                        variant={tagVariantFor(t)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTagClick(t, navigate);
                        }}
                      >
                        {t}
                      </Tag>
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
