import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { CyberLayout, Panel, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";
import { postsMeta } from "@/data/posts";
import { Search } from "lucide-react";
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
      { title: "/logs — Asbawy Blog" },
      {
        name: "description",
        content:
          "Browse all posts on Asbawy's blog. Filter by category or search by title and tag.",
      },
      { property: "og:title", content: "/logs — Asbawy Blog" },
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
      <section className="px-6 md:px-10 py-10 max-w-6xl">
        <div className="font-mono text-[11px] text-muted-foreground">
          <span className="text-foreground">asbawy</span>:
          <span className="text-foreground">~/logs</span>$ ls -la --sort=date
        </div>
        <h1 className="mt-2 font-mono text-2xl md:text-3xl text-foreground">
          /logs <span className="text-muted-foreground">— blog posts</span>
        </h1>

        <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-all ${
                  cat === c
                    ? "border-foreground/30 bg-foreground/10 text-foreground"
                    : "border-panel-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
              >
                {c === "All" ? "*" : c.toLowerCase().replace(" ", "_")}
              </button>
            ))}
          </div>
          <div className="md:ml-auto relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="grep title|tag"
              className="w-full md:w-72 rounded-md border border-panel-border bg-panel/60 pl-9 pr-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
            />
          </div>
        </div>

        <Panel title={`results // ${filtered.length} entries`} className="mt-6">
          <ul className="divide-y divide-panel-border/60">
            {filtered.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/logs/$slug"
                  params={{ slug: p.slug }}
                  preload="intent"
                  className="group block py-4 px-1 transition-colors hover:bg-foreground/5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-3 font-mono text-[10px]">
                        <span className="text-muted-foreground">{p.date}</span>
                        <span className="text-foreground/20">·</span>
                        <span className="text-accent-primary">{p.category.toLowerCase()}</span>
                        <span className="text-foreground/20">·</span>
                        <span className="text-accent-link">{p.readTime}</span>
                      </div>
                      <h2 className="mt-1 text-foreground group-hover:text-foreground transition-colors">
                        {p.title}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:justify-end md:w-[320px] shrink-0 mt-3 md:mt-0">
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
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-10 text-center font-mono text-xs text-muted-foreground">
                // no posts yet — add your first post in src/data/posts.ts
              </li>
            )}
          </ul>
        </Panel>

        {/* RSS Subscribe Prompt */}
        <RssSubscribe />
      </section>
    </CyberLayout>
  );
}
