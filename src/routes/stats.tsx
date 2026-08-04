import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CyberLayout, handleTagClick } from "@/components/cyber/Layout";
import { postsMeta } from "@/data/posts";
import { cheatsheetFiles } from "@/data/cheatsheets";
import { writeupsMeta } from "@/data/writeups";
import { Activity, Swords, FileTerminal, BookOpen, Tag as TagIcon, BarChart2 } from "lucide-react";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Stats & Analytics — Asbawy Blog" },
      {
        name: "description",
        content:
          "Aggregate stats, machine telemetry, and metrics across all writeups, logs, and cheatsheets.",
      },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const navigate = useNavigate();

  const totalWriteups = writeupsMeta.length;
  const totalLogs = postsMeta.length;
  const totalCheatsheets = cheatsheetFiles.length;

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

  const logSevCount = postsMeta.reduce<Record<string, number>>((acc, p) => {
    acc[p.severity] = (acc[p.severity] ?? 0) + 1;
    return acc;
  }, {});

  const logCatCount = postsMeta.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

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
    { name: "Easy", color: "bg-emerald-400" },
    { name: "Medium", color: "bg-amber-400" },
    { name: "Hard", color: "bg-rose-400" },
    { name: "Insane", color: "bg-fuchsia-400" },
  ];

  const logSevs: { name: string; color: string }[] = [
    { name: "Critical", color: "bg-rose-500" },
    { name: "High", color: "bg-amber-500" },
    { name: "Medium", color: "bg-cyan-400" },
    { name: "Low", color: "bg-emerald-400" },
  ];

  const cheatsheetDiffs: { name: string; color: string }[] = [
    { name: "Advanced", color: "bg-rose-400" },
    { name: "Intermediate", color: "bg-amber-400" },
    { name: "Beginner", color: "bg-emerald-400" },
  ];

  return (
    <CyberLayout>
      <div className="w-full min-h-full bg-background text-foreground py-12 px-6 md:px-12 lg:px-16 font-sans">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30">
                <BarChart2 className="w-5 h-5 text-sky-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-sky-400 bg-clip-text text-transparent">
                Stats & Analytics
              </h1>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Telemetry across writeups, logs, and cheatsheets.
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="group/stat relative rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 overflow-hidden hover:border-sky-500/30 hover:bg-sky-500/[0.02]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500/80 to-sky-500/20" />
              <BarChart2 className="w-5 h-5 text-sky-400 mx-auto mb-2 opacity-70 group-hover/stat:opacity-100 group-hover/stat:scale-110 transition-all duration-300" />
              <div className="text-3xl font-extrabold text-foreground tabular-nums">{combinedTotal}</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
                Total Entries
              </div>
            </div>

            <div className="group/stat relative rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 overflow-hidden hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/80 to-emerald-500/20" />
              <Swords className="w-5 h-5 text-emerald-400 mx-auto mb-2 opacity-70 group-hover/stat:opacity-100 group-hover/stat:scale-110 transition-all duration-300" />
              <div className="text-3xl font-extrabold text-foreground tabular-nums">{totalWriteups}</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
                Writeups
              </div>
            </div>

            <div className="group/stat relative rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 overflow-hidden hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/80 to-cyan-500/20" />
              <FileTerminal className="w-5 h-5 text-cyan-400 mx-auto mb-2 opacity-70 group-hover/stat:opacity-100 group-hover/stat:scale-110 transition-all duration-300" />
              <div className="text-3xl font-extrabold text-foreground tabular-nums">{totalLogs}</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
                Logs
              </div>
            </div>

            <div className="group/stat relative rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 overflow-hidden hover:border-teal-500/30 hover:bg-teal-500/[0.02]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500/80 to-teal-500/20" />
              <BookOpen className="w-5 h-5 text-[#4ec9b0] mx-auto mb-2 opacity-70 group-hover/stat:opacity-100 group-hover/stat:scale-110 transition-all duration-300" />
              <div className="text-3xl font-extrabold text-foreground tabular-nums">{totalCheatsheets}</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
                Cheatsheets
              </div>
            </div>

            <div className="group/stat relative rounded-xl border border-border bg-card p-5 text-center col-span-2 sm:col-span-1 transition-all duration-300 overflow-hidden hover:border-purple-500/30 hover:bg-purple-500/[0.02]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/80 to-purple-500/20" />
              <TagIcon className="w-5 h-5 text-purple-400 mx-auto mb-2 opacity-70 group-hover/stat:opacity-100 group-hover/stat:scale-110 transition-all duration-300" />
              <div className="text-3xl font-extrabold text-foreground tabular-nums">{combinedTags.length}</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
                Tags
              </div>
            </div>
          </div>

          {/* 3 Telemetry Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Writeups Breakdown */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Swords className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-foreground">Writeups Breakdown</h2>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Difficulty Distribution
                </h3>
                <div className="space-y-2.5">
                  {writeupDiffs.map((d) => {
                    const c = writeupDiffCount[d.name] ?? 0;
                    const pct = totalWriteups ? (c / totalWriteups) * 100 : 0;
                    return (
                      <div key={d.name} className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">{d.name}</span>
                          <span className="text-foreground font-bold">{c}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${d.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Platform Breakdown
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(writeupPlatformCount).map(([k, v]) => {
                    const pct = totalWriteups ? (v / totalWriteups) * 100 : 0;
                    return (
                      <div key={k} className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">{k}</span>
                          <span className="text-foreground font-bold">{v}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-emerald-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dev Logs Breakdown */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <FileTerminal className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-foreground">Dev Logs Breakdown</h2>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Severity Breakdown
                </h3>
                <div className="space-y-2.5">
                  {logSevs.map((s) => {
                    const c = logSevCount[s.name] ?? 0;
                    const pct = totalLogs ? (c / totalLogs) * 100 : 0;
                    return (
                      <div key={s.name} className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">{s.name}</span>
                          <span className="text-foreground font-bold">{c}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${s.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Category Breakdown
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(logCatCount).map(([k, v]) => {
                    const pct = totalLogs ? (v / totalLogs) * 100 : 0;
                    return (
                      <div key={k} className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">{k}</span>
                          <span className="text-foreground font-bold">{v}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cheatsheets Breakdown */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <BookOpen className="w-5 h-5 text-fuchsia-400" />
                <h2 className="text-lg font-bold text-foreground">Cheatsheets Breakdown</h2>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Difficulty Level
                </h3>
                <div className="space-y-2.5">
                  {cheatsheetDiffs.map((d) => {
                    const c = cheatsheetDiffCount[d.name] ?? 0;
                    const pct = totalCheatsheets ? (c / totalCheatsheets) * 100 : 0;
                    return (
                      <div key={d.name} className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">{d.name}</span>
                          <span className="text-foreground font-bold">{c}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${d.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Category Breakdown
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(cheatsheetCatCount).map(([k, v]) => {
                    const pct = totalCheatsheets ? (v / totalCheatsheets) * 100 : 0;
                    return (
                      <div key={k} className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">{k}</span>
                          <span className="text-foreground font-bold">{v}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-fuchsia-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tag Cloud */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <TagIcon className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-foreground">Combined Tag Index</h2>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {combinedTags.map((t) => (
                <button
                  key={t}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTagClick(t, navigate);
                  }}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border hover:border-emerald-400/50 hover:text-emerald-400 transition-all cursor-pointer"
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
