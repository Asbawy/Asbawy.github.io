import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { CyberLayout } from "@/components/cyber/Layout";
import { postsMeta } from "@/data/posts";
import { Search, Calendar, Clock, ArrowRight, X, FileTerminal } from "lucide-react";
import { RssSubscribe } from "@/components/cyber/RssSubscribe";

type LogsSearch = {
  q?: string;
  tag?: string;
};

export const Route = createFileRoute("/logs/")({
  validateSearch: (search: Record<string, unknown>): LogsSearch => {
    return {
      q: typeof search.q === "string" ? search.q : undefined,
      tag: typeof search.tag === "string" ? search.tag : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Logs — Security Research & Dev Logs" },
      {
        name: "description",
        content:
          "Dev logs, security research, vulnerability disclosures, and tech ramblings by Asbawy.",
      },
    ],
  }),
  component: LogsPage,
});

const categories = ["All", "Web", "AI Security", "Automation", "Scripting", "Network"] as const;

function LogsPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    const initialQ = search.tag || search.q || "";
    setQ(initialQ);
  }, [search.tag, search.q]);

  const handleSearchChange = (val: string) => {
    setQ(val);
    navigate({
      from: Route.fullPath,
      search: (old: any) => ({ ...old, q: val || undefined, tag: undefined }),
      replace: true,
    });
  };

  const filtered = useMemo(() => {
    return postsMeta.filter((p) => {
      const okCat = cat === "All" || p.category === cat;

      let okQ = true;
      if (search.tag) {
        okQ = p.tags.some((t) => t.toLowerCase() === search.tag!.toLowerCase());
      } else if (q) {
        okQ =
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()));
      }
      return okCat && okQ;
    });
  }, [cat, q, search.tag]);

  const clearFilters = () => {
    setCat("All");
    setQ("");
    navigate({
      from: Route.fullPath,
      search: () => ({ q: undefined, tag: undefined }),
      replace: true,
    });
  };

  const hasActiveFilters = Boolean(q || cat !== "All" || search.tag);

  return (
    <CyberLayout>
      <div className="w-full min-h-full bg-background text-foreground py-12 px-6 md:px-12 lg:px-16 font-sans">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="space-y-3">
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Logs
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              Dev logs, security research, vulnerability disclosures, and tech ramblings.
            </p>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            {/* Category Pill Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => {
                const isActive = cat === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${isActive
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-semibold shadow-[0_0_15px_rgba(34,211,238,0.12)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                      }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-9 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {q && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Log Entries Grid */}
          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((p) => (
                <Link
                  key={p.slug}
                  to="/logs/$slug"
                  params={{ slug: p.slug }}
                  className="group flex flex-col md:flex-row md:items-start justify-between gap-6 rounded-xl bg-card border border-border p-6 shadow-sm hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-xl transition-all duration-200"
                >
                  <div className="space-y-3 flex-1">
                    {/* Top Row Badges */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold">
                        {p.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {p.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {p.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-foreground group-hover:text-cyan-400 transition-colors leading-snug">
                      {p.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 max-w-4xl">
                      {p.excerpt}
                    </p>

                    {/* Tags Row */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Read Link */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-2 md:pt-0">
                    <span>Read Log</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
              <FileTerminal className="w-12 h-12 text-[#444] mx-auto" />
              <h3 className="text-lg font-bold text-foreground">No log entries found</h3>
              <p className="text-sm text-muted-foreground">
                No logs matched your selected search filters.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>
          )}

          {/* RSS Footer */}
          <div className="pt-8 border-t border-border">
            <RssSubscribe />
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
