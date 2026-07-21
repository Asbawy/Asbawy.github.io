import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CyberLayout, Panel, Tag, handleTagClick } from "@/components/cyber/Layout";
import { postsMeta } from "@/data/posts";
import { cheatsheetFiles } from "@/data/cheatsheets";
import { writeupsMeta } from "@/data/writeups";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "/stats — Asbawy Blog" },
      {
        name: "description",
        content:
          "Aggregate stats, machine telemetry, and metrics across all writeups, logs, and cheatsheets.",
      },
      { property: "og:title", content: "/stats — Telemetry & Analytics" },
      {
        property: "og:description",
        content: "Writeups, dev logs, and cheatsheets telemetry and analytics.",
      },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const navigate = useNavigate();

  // 1. Writeups Telemetry
  const totalWriteups = writeupsMeta.length;

  const writeupPlatformCount = writeupsMeta.reduce<Record<string, number>>((acc, w) => {
    acc[w.platform] = (acc[w.platform] ?? 0) + 1;
    return acc;
  }, {});

  const writeupDiffCount = writeupsMeta.reduce<Record<string, number>>((acc, w) => {
    acc[w.difficulty] = (acc[w.difficulty] ?? 0) + 1;
    return acc;
  }, {});

  const writeupOsCount = writeupsMeta.reduce<Record<string, number>>((acc, w) => {
    if (w.os) acc[w.os] = (acc[w.os] ?? 0) + 1;
    return acc;
  }, {});

  // 2. Logs Telemetry
  const totalLogs = postsMeta.length;

  const logSevCount = postsMeta.reduce<Record<string, number>>((acc, p) => {
    acc[p.severity] = (acc[p.severity] ?? 0) + 1;
    return acc;
  }, {});

  const logCatCount = postsMeta.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  // 3. Cheatsheets Telemetry
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

  // Global Combined Calculations
  const combinedTotal = totalWriteups + totalLogs + totalCheatsheets;
  const combinedTags = Array.from(
    new Set([
      ...writeupsMeta.flatMap((w) => w.tags),
      ...postsMeta.flatMap((p) => p.tags),
      ...cheatsheetFiles.flatMap((p) => p.meta.tags || []),
    ]),
  ).sort((a, b) => a.localeCompare(b));

  const writeupDiffs: { name: string; color: string }[] = [
    { name: "Very Easy", color: "bg-[#00E5FF]" },
    { name: "Easy", color: "bg-[#9FEF00]" },
    { name: "Medium", color: "bg-[#FFD43B]" },
    { name: "Hard", color: "bg-[#FF7043]" },
    { name: "Insane", color: "bg-[#FF3E3E]" },
  ];

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
      <section className="px-4 md:px-10 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <div className="font-mono text-[11px] text-muted-foreground mb-1">
            <span className="text-foreground">asbawy</span>:
            <span className="text-foreground">~/stats</span>$ cat telemetry.log
          </div>
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground">
            /stats{" "}
            <span className="text-muted-foreground/60 font-normal">— telemetry & analytics</span>
          </h1>
        </div>

        {/* Global Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
          {[
            ["total_entries", String(combinedTotal)],
            ["writeups", String(totalWriteups)],
            ["logs", String(totalLogs)],
            ["cheatsheets", String(totalCheatsheets)],
            ["total_tags", String(combinedTags.length)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-card/40 p-3.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="mt-1 text-2xl font-bold text-foreground">{v}</div>
            </div>
          ))}
        </div>

        {/* 3-Column Telemetry Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
          {/* Writeups Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1.5 w-1.5 bg-[#9FEF00] rounded-full" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                Section // Writeups Telemetry
              </span>
            </div>

            <Panel title="difficulty_distribution">
              <ul className="space-y-2.5 text-xs">
                {writeupDiffs.map((d) => {
                  const c = writeupDiffCount[d.name] ?? 0;
                  const pct = totalWriteups ? (c / totalWriteups) * 100 : 0;
                  return (
                    <li key={d.name}>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>{d.name.toLowerCase()}</span>
                        <span className="text-foreground font-semibold">{c}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                        <div className={`h-full ${d.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="platform_breakdown">
              <ul className="space-y-2.5 text-xs">
                {Object.entries(writeupPlatformCount).map(([k, v]) => {
                  const pct = totalWriteups ? (v / totalWriteups) * 100 : 0;
                  return (
                    <li key={k}>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>{k.toLowerCase()}</span>
                        <span className="text-foreground font-semibold">{v}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                        <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="os_target_breakdown">
              <ul className="space-y-2.5 text-xs">
                {Object.entries(writeupOsCount).map(([k, v]) => {
                  const pct = totalWriteups ? (v / totalWriteups) * 100 : 0;
                  return (
                    <li key={k}>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>{k.toLowerCase()}</span>
                        <span className="text-foreground font-semibold">{v}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                        <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </div>

          {/* Dev Logs Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1.5 w-1.5 bg-[#4FC3F7] rounded-full" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                Section // Logs Telemetry
              </span>
            </div>

            <Panel title="severity_distribution">
              <ul className="space-y-2.5 text-xs">
                {logSevs.map((s) => {
                  const c = logSevCount[s.name] ?? 0;
                  const pct = totalLogs ? (c / totalLogs) * 100 : 0;
                  return (
                    <li key={s.name}>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>{s.name.toLowerCase()}</span>
                        <span className="text-foreground font-semibold">{c}</span>
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
              <ul className="space-y-2.5 text-xs">
                {Object.entries(logCatCount).map(([k, v]) => {
                  const pct = totalLogs ? (v / totalLogs) * 100 : 0;
                  return (
                    <li key={k}>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>{k.toLowerCase()}</span>
                        <span className="text-foreground font-semibold">{v}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                        <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
                {Object.keys(logCatCount).length === 0 && (
                  <li className="text-muted-foreground">// no logs recorded</li>
                )}
              </ul>
            </Panel>
          </div>

          {/* Cheatsheet Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1.5 w-1.5 bg-[#FFD43B] rounded-full" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                Section // Cheatsheet Telemetry
              </span>
            </div>

            <Panel title="difficulty_distribution">
              <ul className="space-y-2.5 text-xs">
                {cheatsheetDiffs.map((d) => {
                  const c = cheatsheetDiffCount[d.name] ?? 0;
                  const pct = totalCheatsheets ? (c / totalCheatsheets) * 100 : 0;
                  return (
                    <li key={d.name}>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>{d.name.toLowerCase()}</span>
                        <span className="text-foreground font-semibold">{c}</span>
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
              <ul className="space-y-2.5 text-xs">
                {Object.entries(cheatsheetCatCount).map(([k, v]) => {
                  const pct = totalCheatsheets ? (v / totalCheatsheets) * 100 : 0;
                  return (
                    <li key={k}>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>{k.toLowerCase()}</span>
                        <span className="text-foreground font-semibold">{v}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-sm bg-secondary/60 overflow-hidden">
                        <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
                {Object.keys(cheatsheetCatCount).length === 0 && (
                  <li className="text-muted-foreground">// no cheatsheets recorded</li>
                )}
              </ul>
            </Panel>
          </div>
        </div>

        {/* Combined Tag Cloud */}
        <Panel title="combined_tag_cloud" className="mt-6">
          <div className="flex flex-wrap gap-1.5">
            {combinedTags.length === 0 ? (
              <span className="font-mono text-xs text-muted-foreground">// no tags available</span>
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
