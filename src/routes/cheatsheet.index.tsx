import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Zap, Terminal, FolderOpen, ChevronRight, BookOpen } from "lucide-react";
import { useMemo } from "react";
import { cheatsheetFiles } from "@/data/cheatsheets";
import { Tag, tagVariantFor } from "@/components/cyber/Layout";

export const Route = createFileRoute("/cheatsheet/")({
  component: CheatsheetIndex,
});

function CheatsheetIndex() {
  // Group cheatsheets by category
  const categories = useMemo(() => {
    const cats: Record<string, { count: number; firstPath: string }> = {};
    for (const file of cheatsheetFiles) {
      const cat = file.meta.category || "General";
      if (!cats[cat]) {
        cats[cat] = { count: 0, firstPath: file.path };
      }
      cats[cat].count++;
    }
    return Object.entries(cats).map(([name, data]) => ({
      name,
      ...data,
    }));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 scrollbar-thin">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <div className="relative">
            {/* Icon cluster */}
            <div className="relative mb-4 inline-flex">
              <div className="relative flex items-center gap-4">
                <Lock className="h-5 w-5 text-neon-green opacity-60 animate-pulse" />
                <Terminal className="h-7 w-7 text-neon-green text-glow-green" />
                <Zap className="h-5 w-5 text-threat-mid opacity-60" />
              </div>
            </div>

            {/* Main message */}
            <h2 className="font-mono text-lg md:text-xl text-foreground mb-2">
              <span className="inline-block cyber-glitch font-bold">[ SELECT A REFERENCE ]</span>
            </h2>
            <p className="font-mono text-xs text-muted-foreground mb-6">
              <FolderOpen className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Browse the directory or search to view command lists
            </p>

            {/* Decorative terminal info */}
            <div className="relative mx-auto max-w-sm mb-10">
              <div className="text-left rounded-xl border border-panel-border bg-panel/85 shadow-2xl p-5 font-mono text-[12px] text-muted-foreground space-y-2 relative z-10 transition-all hover:border-neon-green/40 hover:shadow-[0_0_30px_rgba(0,255,170,0.05)]">
                <div>
                  <span className="text-neon-green font-bold">$</span>{" "}
                  <span className="text-foreground/90">
                    loading cheatsheets
                    <span className="loading-dots" />
                  </span>
                </div>
                <div>
                  <span className="text-neon-green font-bold">[info]</span> modules queued: Active
                  Directory, Linux, Tools
                </div>
                <div>
                  <span className="text-threat-mid font-bold">[warn]</span> terminal ready, select
                  module to load
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-neon-green font-bold">$</span>
                  <span className="caret" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-10">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
            <span className="text-neon-green">▸</span> select_by_category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c) => (
              <Link
                key={c.name}
                to="/cheatsheet/$"
                params={{ _splat: c.firstPath }}
                className="group flex flex-col justify-between p-4 rounded-lg border border-panel-border bg-panel/40 hover:bg-neon-green/5 hover:border-neon-green/30 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/50 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-neon-green transition-colors">
                      {c.name.toLowerCase()}
                    </span>
                    <BookOpen className="h-4 w-4 text-neon-green/40 group-hover:text-neon-green transition-colors" />
                  </div>
                  <h4 className="font-mono text-base font-semibold text-foreground group-hover:text-glow-green transition-all">
                    {c.name}
                  </h4>
                </div>
                <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                  <span>
                    {c.count} {c.count === 1 ? "file" : "files"}
                  </span>
                  <span className="flex items-center text-neon-green opacity-0 group-hover:opacity-100 transition-opacity">
                    load <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Available Cheatsheets Feed */}
        <div className="text-left">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
            <span className="text-neon-green">▸</span> all_available_cheatsheets
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {cheatsheetFiles.map((file) => (
              <Link
                key={file.path}
                to="/cheatsheet/$"
                params={{ _splat: file.path }}
                className="group block rounded-lg border border-panel-border bg-panel/40 p-4 hover:border-neon-green/30 hover:bg-neon-green/5 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 font-mono text-[10px] text-muted-foreground">
                      <span className="text-neon-green">{file.meta.category}</span>
                      <span>·</span>
                      <span>{file.meta.readTime || "5 mins"}</span>
                      <span>·</span>
                      <span
                        className={
                          file.meta.difficulty === "Advanced"
                            ? "text-threat-high"
                            : file.meta.difficulty === "Intermediate"
                              ? "text-threat-mid"
                              : "text-neon-green"
                        }
                      >
                        {file.meta.difficulty?.toLowerCase()}
                      </span>
                    </div>
                    <h4 className="mt-1 font-mono text-sm font-semibold text-foreground group-hover:text-neon-green transition-colors">
                      {file.meta.title || file.path.split("/").pop()}
                    </h4>
                    {file.meta.excerpt && (
                      <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-1">
                        {file.meta.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2 sm:mt-0 sm:justify-end shrink-0 max-w-[280px]">
                    {file.meta.tags?.slice(0, 3).map((tag) => (
                      <Tag key={tag} variant={tagVariantFor(tag)}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
