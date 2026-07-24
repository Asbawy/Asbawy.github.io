import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { CyberLayout, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";
import { postsMeta } from "@/data/posts";
import { Search, Terminal, Filter, Calendar, Clock, ChevronRight } from "lucide-react";
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
      { title: "/logs — Security Research & Dev Logs" },
      {
        name: "description",
        content:
          "Browse all posts on Asbawy's blog. Filter by category or search by title and tag.",
      },
      { property: "og:title", content: "/logs — Security Research" },
      { property: "og:description", content: "All blog posts by Asbawy." },
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

  // Sync component state with search params from URL
  useEffect(() => {
    const initialQ = search.tag || search.q || "";
    setQ(initialQ);
  }, [search.tag, search.q]);

  const handleSearchChange = (val: string) => {
    setQ(val);
    navigate({
      search: (old) => ({ ...old, q: val || undefined, tag: undefined }),
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

  return (
    <CyberLayout>
      <section className="px-4 md:px-10 py-10 max-w-6xl space-y-8">
        
        {/* ── Page Header ──────────────────── */}
        <div className="relative overflow-hidden rounded-lg border border-foreground/10 bg-foreground/[0.02] p-6 font-mono shadow-sm">
          {/* Subtle Glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-[11px] mb-3 flex items-center gap-2 text-muted-foreground border-b border-foreground/10 pb-2">
            <Terminal className="h-3.5 w-3.5 text-accent-secondary" />
            <span className="text-foreground font-semibold">asbawy@dedsec</span>
            <span className="opacity-50">:~$</span>
            <span className="text-accent-secondary">ls -la ./logs --sort=date</span>
          </div>

          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            ~/logs
            <span className="text-xs font-normal font-mono px-2 py-0.5 rounded border border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary">
              {postsMeta.length} entries
            </span>
          </h1>
          <p className="mt-2 text-sm text-foreground/70 leading-relaxed font-mono max-w-2xl">
            Dev logs, security research, vulnerability disclosures, and general tech ramblings.
          </p>
        </div>

        {/* ── Filters & Search ──────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-foreground/[0.02] border border-foreground/10 p-3 rounded-lg">
          <div className="flex items-center gap-2 border-r border-foreground/10 pr-4">
            <Filter className="w-4 h-4 text-accent-secondary" />
            <span className="text-xs font-mono text-foreground/70 uppercase tracking-widest font-bold">Filter</span>
          </div>
          
          <div className="flex flex-wrap gap-2 flex-1">
            {categories.map((c) => {
              const isActive = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "border-accent-secondary bg-accent-secondary/10 text-accent-secondary font-bold shadow-[0_0_10px_rgba(var(--color-accent-secondary-rgb),0.2)]"
                      : "border-foreground/10 text-muted-foreground hover:border-foreground/30 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {c === "All" ? "*" : c.replace(" ", "_")}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent-secondary" />
            <input
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="grep title|tag..."
              className="w-full rounded border border-foreground/10 bg-background pl-9 pr-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-secondary/50 focus:ring-1 focus:ring-accent-secondary/50 transition-all"
            />
          </div>
        </div>

        {/* ── Log Entries List ──────────────────── */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-foreground/10 bg-foreground/[0.02] p-10 text-center font-mono text-xs text-muted-foreground flex flex-col items-center gap-3">
              <Search className="w-8 h-8 opacity-20" />
              <span>// ERR_NO_MATCHES: grep returned exit code 1</span>
            </div>
          ) : (
            filtered.map((p) => (
              <Link
                key={p.slug}
                to="/logs/$slug"
                params={{ slug: p.slug }}
                preload="intent"
                className="group relative flex flex-col md:flex-row md:items-start gap-4 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-5 transition-all duration-300 hover:border-accent-secondary/40 hover:bg-foreground/[0.04] overflow-hidden"
              >
                {/* Left animated accent border */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-secondary/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                
                {/* Metadata Column */}
                <div className="flex md:flex-col gap-4 md:w-48 shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-foreground/40" />
                    <span>{p.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-foreground/40" />
                    <span>{p.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse" />
                    <span className="text-accent-secondary font-bold">{p.category}</span>
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-foreground group-hover:text-accent-secondary transition-colors flex items-center gap-2">
                    {p.title}
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent-secondary" />
                  </h2>
                  <p className="mt-2 text-sm text-foreground/70 leading-relaxed max-w-3xl">
                    {p.excerpt}
                  </p>
                  
                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
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
                </div>
              </Link>
            ))
          )}
        </div>

        {/* ── Footer Elements ──────────────────── */}
        <div className="pt-8 border-t border-foreground/10">
          <RssSubscribe />
        </div>
      </section>
    </CyberLayout>
  );
}
