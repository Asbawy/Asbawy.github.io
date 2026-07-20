import { createFileRoute, Link, useNavigate, getRouteApi } from "@tanstack/react-router";
import { Lock, Zap, Terminal, FolderOpen, ChevronRight, BookOpen } from "lucide-react";
import { useMemo, useEffect } from "react";
import { cheatsheetFiles } from "@/data/cheatsheets";
import { Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";

const cheatsheetRoute = getRouteApi("/cheatsheet");

export const Route = createFileRoute("/cheatsheet/")({
  component: CheatsheetIndex,
});

function CheatsheetIndex() {
  const navigate = useNavigate();
  const search = cheatsheetRoute.useSearch();
  const q = (search.q || "").toLowerCase().trim();

  // Filter cheatsheet files based on search
  const displayedFiles = useMemo(() => {
    if (!q) return cheatsheetFiles;
    return cheatsheetFiles.filter(
      (file) =>
        file.path.toLowerCase().includes(q) ||
        file.meta.title?.toLowerCase().includes(q) ||
        file.meta.category?.toLowerCase().includes(q) ||
        file.meta.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [q]);

  // Auto-navigate if exactly 1 match
  useEffect(() => {
    if (q && displayedFiles.length === 1) {
      navigate({
        to: "/cheatsheet/$",
        params: { _splat: displayedFiles[0].path },
        search: { q },
        replace: true,
      });
    }
  }, [q, displayedFiles, navigate]);

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
                <Lock className="h-5 w-5 text-foreground opacity-60 animate-pulse" />
                <Terminal className="h-7 w-7 text-foreground " />
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
              <div className="text-left rounded-xl glass-panel p-5 font-mono text-[12px] text-muted-foreground space-y-2 relative z-10 transition-all">
                <div>
                  <span className="text-foreground font-bold">$</span>{" "}
                  <span className="text-foreground/90">
                    loading cheatsheets
                    <span className="loading-dots" />
                  </span>
                </div>
                <div>
                  <span className="text-foreground font-bold">[info]</span> modules queued: Active
                  Directory, Linux, Tools
                </div>
                <div>
                  <span className="text-threat-mid font-bold">[warn]</span> terminal ready, select
                  module to load
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-foreground font-bold">$</span>
                  <span className="caret" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid - hide when searching */}
        {!q && (
          <div className="mb-10">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
              <span className="text-foreground">▸</span> select_by_category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((c) => (
                <Link
                  key={c.name}
                  to="/cheatsheet/$"
                  params={{ _splat: c.firstPath }}
                  className="group flex flex-col justify-between p-4 rounded-lg glass-panel glass-panel-hover transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                        {c.name.toLowerCase()}
                      </span>
                      <BookOpen className="h-4 w-4 text-foreground/40 group-hover:text-foreground transition-colors" />
                    </div>
                    <h4 className="font-mono text-base font-semibold text-foreground group-hover: transition-all">
                      {c.name}
                    </h4>
                  </div>
                  <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                    <span>
                      {c.count} {c.count === 1 ? "file" : "files"}
                    </span>
                    <span className="flex items-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      load <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Available Cheatsheets Feed */}
        <div className="text-left">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
            <span className="text-foreground">▸</span>{" "}
            {q ? "search_results" : "all_available_cheatsheets"}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {displayedFiles.length > 0 ? (
              displayedFiles.map((file) => (
                <Link
                  key={file.path}
                  to="/cheatsheet/$"
                  params={{ _splat: file.path }}
                  className="group block rounded-lg glass-panel glass-panel-hover p-4 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 font-mono text-[10px] text-muted-foreground">
                        <span className="text-foreground">{file.meta.category}</span>
                        <span>·</span>
                        <span>{file.meta.readTime || "5 mins"}</span>
                        <span>·</span>
                        <span
                          className={
                            file.meta.difficulty === "Advanced"
                              ? "text-threat-high"
                              : file.meta.difficulty === "Intermediate"
                                ? "text-threat-mid"
                                : "text-foreground"
                          }
                        >
                          {file.meta.difficulty?.toLowerCase()}
                        </span>
                      </div>
                      <h4 className="mt-1 font-mono text-sm font-semibold text-foreground group-hover:text-foreground transition-colors">
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
                        <Tag
                          key={tag}
                          variant={tagVariantFor(tag)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTagClick(tag, navigate);
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center glass-panel glass-panel-hover rounded-lg border-dashed">
                <span className="font-mono text-sm text-muted-foreground">
                  No cheatsheets match your search.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
