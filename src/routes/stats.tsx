import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CyberLayout, Panel, Tag, handleTagClick } from "@/components/cyber/Layout";
import { postsMeta } from "@/data/posts";
import { cheatsheetFiles } from "@/data/cheatsheets";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "/stats — Asbawy Blog" },
      {
        name: "description",
        content: "Aggregate stats and metrics across all posts and cheatsheets on Asbawy's blog.",
      },
      { property: "og:title", content: "/stats — Asbawy Blog" },
      { property: "og:description", content: "Blog and cheatsheets telemetry and analytics." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const navigate = useNavigate();

  // Logs calculations
  const totalLogs = postsMeta.length;

  const logSevCount = postsMeta.reduce<Record<string, number>>((acc, p) => {
    acc[p.severity] = (acc[p.severity] ?? 0) + 1;
    return acc;
  }, {});

  const logCatCount = postsMeta.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  const logTags = Array.from(new Set(postsMeta.flatMap((p) => p.tags)));

  // Cheatsheets calculations
  const totalCheatsheets = cheatsheetFiles.length;

  const cheatsheetCatCount = cheatsheetFiles.reduce<Record<string, number>>((acc, p) => {
    const cat = p.meta.category || p.path.split("/")[0] || "General";
    const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
    acc[formattedCat] = (acc[formattedCat] ?? 0) + 1;
    return acc;
  }, {});

  const cheatsheetDiffCount = cheatsheetFiles.reduce<Record<string, number>>((acc, p) => {
    const diff = p.meta.difficulty || "Intermediate";
    acc[diff] = (acc[diff] ?? 0) + 1;
    return acc;
  }, {});

  const cheatsheetTags = Array.from(
    new Set(cheatsheetFiles.flatMap((p) => p.meta.tags || []))
  );

  // Global calculations
  const combinedTotal = totalLogs + totalCheatsheets;
  const combinedTags = Array.from(
    new Set([
      ...postsMeta.flatMap((p) => p.tags),
      ...cheatsheetFiles.flatMap((p) => p.meta.tags || []),
    ])
  ).sort((a, b) => a.localeCompare(b));
  const combinedTagsCount = combinedTags.length;

  const logSevs: { name: string; color: string }[] = [
    { name: "Critical", color: "bg-threat-high" },
    { name: "High", color: "bg-threat-mid" },
    { name: "Medium", color: "bg-foreground" },
    { name: "Low", color: "bg-foreground" },
  ];

  const cheatsheetDiffs: { name: string; color: string }[] = [
    { name: "Advanced", color: "bg-threat-high" },
    { name: "Intermediate", color: "bg-threat-mid" },
    { name: "Beginner", color: "bg-foreground" },
  ];

  return (
    <CyberLayout>
      <section className="px-6 md:px-10 py-10 max-w-6xl">
        <div className="font-mono text-[11px] text-muted-foreground">
          <span className="text-foreground">asbawy</span>:
          <span className="text-foreground">~/stats</span>$ cat telemetry.log
        </div>
        <h1 className="mt-2 font-mono text-2xl md:text-3xl text-foreground">
          /stats <span className="text-muted-foreground">— telemetry</span>
        </h1>

        {/* Global Stats Overview */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["entries_total", String(combinedTotal)],
            ["logs", String(totalLogs)],
            ["cheatsheets", String(totalCheatsheets)],
            ["tags_total", String(combinedTagsCount)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-panel-border bg-panel/60 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {k}
              </div>
              <div className="mt-1 font-mono text-2xl text-foreground ">{v}</div>
            </div>
          ))}
        </div>

        {/* Split Telemetry Columns */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logs Telemetry Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1.5 w-1.5 bg-accent-primary animate-pulse rounded-full" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Section // Logs Telemetry
              </span>
            </div>

            <Panel title="severity_distribution">
              <ul className="space-y-3 font-mono text-xs">
                {logSevs.map((s) => {
                  const c = logSevCount[s.name] ?? 0;
                  const pct = totalLogs ? (c / totalLogs) * 100 : 0;
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
                {Object.entries(logCatCount).map(([k, v]) => {
                  const pct = totalLogs ? (v / totalLogs) * 100 : 0;
                  return (
                    <li key={k}>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{k.toLowerCase()}</span>
                        <span className="text-foreground">{v}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                        <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
                {Object.keys(logCatCount).length === 0 && (
                  <li className="text-muted-foreground">// no logs yet</li>
                )}
              </ul>
            </Panel>
          </div>

          {/* Cheatsheet Telemetry Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1.5 w-1.5 bg-accent-secondary animate-pulse rounded-full" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Section // Cheatsheet Telemetry
              </span>
            </div>

            <Panel title="difficulty_distribution">
              <ul className="space-y-3 font-mono text-xs">
                {cheatsheetDiffs.map((d) => {
                  const c = cheatsheetDiffCount[d.name] ?? 0;
                  const pct = totalCheatsheets ? (c / totalCheatsheets) * 100 : 0;
                  return (
                    <li key={d.name}>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{d.name.toLowerCase()}</span>
                        <span className="text-foreground">{c}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                        <div className={`h-full ${d.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="category_breakdown">
              <ul className="space-y-3 font-mono text-xs">
                {Object.entries(cheatsheetCatCount).map(([k, v]) => {
                  const pct = totalCheatsheets ? (v / totalCheatsheets) * 100 : 0;
                  return (
                    <li key={k}>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{k.toLowerCase()}</span>
                        <span className="text-foreground">{v}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                        <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
                {Object.keys(cheatsheetCatCount).length === 0 && (
                  <li className="text-muted-foreground">// no cheatsheets yet</li>
                )}
              </ul>
            </Panel>
          </div>
        </div>

        {/* Combined Tag Cloud */}
        <Panel title="combined_tag_cloud" className="mt-8">
          <div className="flex flex-wrap gap-2">
            {combinedTags.length === 0 ? (
              <span className="font-mono text-xs text-muted-foreground">
                // tags will appear here once you add entries
              </span>
            ) : (
              combinedTags.map((t) => (
                <Tag
                  key={t}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTagClick(t, navigate);
                  }}
                >
                  {t}
                </Tag>
              ))
            )}
          </div>
        </Panel>
      </section>
    </CyberLayout>
  );
}

