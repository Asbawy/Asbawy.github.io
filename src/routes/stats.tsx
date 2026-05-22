

import { createFileRoute } from "@tanstack/react-router";
import { CyberLayout, Panel, Tag } from "@/components/cyber/Layout";
import { posts } from "@/data/posts";

export const Route = createFileRoute("/stats")({

  head: () => ({
    meta: [
      { title: "/stats — Asbawy Blog" },
      { name: "description", content: "Aggregate stats and metrics across all posts on Asbawy's blog." },
      { property: "og:title", content: "/stats — Asbawy Blog" },
      { property: "og:description", content: "Blog telemetry and post analytics." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {

  const total = posts.length;


  const sevCount = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.severity] = (acc[p.severity] ?? 0) + 1;
    return acc;
  }, {});


  const catCount = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});


  const sevs: { name: string; color: string }[] = [
    { name: "Critical", color: "bg-threat-high" },
    { name: "High", color: "bg-threat-mid" },
    { name: "Medium", color: "bg-neon-blue" },
    { name: "Low", color: "bg-neon-green" },
  ];

  return (
    <CyberLayout>
      <section className="px-6 md:px-10 py-10 max-w-6xl">

        <div className="font-mono text-[11px] text-muted-foreground">
          <span className="text-neon-green">asbawy</span>:<span className="text-neon-blue">~/stats</span>$ cat telemetry.log
        </div>
        <h1 className="mt-2 font-mono text-2xl md:text-3xl text-foreground">
          /stats <span className="text-muted-foreground">— telemetry</span>
        </h1>


        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["entries", String(total)],
            ["categories", String(Object.keys(catCount).length)],
            ["tags", String(new Set(posts.flatMap((p) => p.tags)).size)],
            ["status", "active"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-panel-border bg-panel/60 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k}</div>
              <div className="mt-1 font-mono text-2xl text-neon-green text-glow-green">{v}</div>
            </div>
          ))}
        </div>


        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

          <Panel title="severity_distribution">
            <ul className="space-y-3 font-mono text-xs">
              {sevs.map((s) => {
                const c = sevCount[s.name] ?? 0;
                const pct = total ? (c / total) * 100 : 0;
                return (
                  <li key={s.name}>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{s.name.toLowerCase()}</span>
                      <span className="text-foreground">{c}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                      <div className={`h-full ${s.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>


          <Panel title="category_breakdown">
            <ul className="space-y-3 font-mono text-xs">
              {Object.entries(catCount).map(([k, v]) => {
                const pct = total ? (v / total) * 100 : 0;
                return (
                  <li key={k}>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{k.toLowerCase()}</span>
                      <span className="text-foreground">{v}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                      <div className="h-full bg-neon-blue" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
              {Object.keys(catCount).length === 0 && (
                <li className="text-muted-foreground">// no posts yet</li>
              )}
            </ul>
          </Panel>
        </div>


        <Panel title="tag_cloud" className="mt-5">
          <div className="flex flex-wrap gap-2">
            {posts.length === 0 ? (
              <span className="font-mono text-xs text-muted-foreground">
                // tags will appear here once you add posts
              </span>
            ) : (
              Array.from(new Set(posts.flatMap((p) => p.tags))).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))
            )}
          </div>
        </Panel>
      </section>
    </CyberLayout>
  );
}