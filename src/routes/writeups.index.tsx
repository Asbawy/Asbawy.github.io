import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Swords,
  Shield,
  Flag,
  Terminal,
  Server,
  Globe,
  Sparkles,
  Cpu,
  Clock,
  Search,
  X,
  Crosshair,
  ArrowRight,
} from "lucide-react";
import { CyberLayout } from "@/components/cyber/Layout";
import { writeupsMeta, getPlatformStats } from "@/data/writeups";
import { CategoryIcon } from "@/components/cyber/WriteupComponents";

export const Route = createFileRoute("/writeups/")({
  head: () => ({
    meta: [
      { title: "Writeups — Asbawy" },
      {
        name: "description",
        content: "CTF writeups, HackTheBox walkthroughs, TryHackMe challenges, and more by Asbawy.",
      },
    ],
  }),
  component: WriteupsIndex,
});

const platformConfig: Record<
  string,
  {
    color: string;
    icon: typeof Swords;
    border: string;
    bg: string;
  }
> = {
  HackTheBox: {
    color: "text-[#9FEF00]",
    icon: Swords,
    border: "border-[#9FEF00]/30",
    bg: "bg-[#9FEF00]/10",
  },
  TryHackMe: {
    color: "text-[#FF3E3E]",
    icon: Flag,
    border: "border-[#FF3E3E]/30",
    bg: "bg-[#FF3E3E]/10",
  },
  VulnHub: {
    color: "text-[#4FC3F7]",
    icon: Server,
    border: "border-[#4FC3F7]/30",
    bg: "bg-[#4FC3F7]/10",
  },
  CTF: {
    color: "text-[#FFD43B]",
    icon: Flag,
    border: "border-[#FFD43B]/30",
    bg: "bg-[#FFD43B]/10",
  },
  Other: {
    color: "text-[#C792EA]",
    icon: Globe,
    border: "border-[#C792EA]/30",
    bg: "bg-[#C792EA]/10",
  },
};

function difficultyBg(d: string) {
  switch (d) {
    case "Very Easy":
      return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30";
    case "Easy":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
    case "Medium":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30";
    case "Hard":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30";
    case "Insane":
      return "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/30";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

function WriteupsIndex() {
  const stats = getPlatformStats();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const machineCount = useMemo(
    () => writeupsMeta.filter((w) => w.type === "Machine").length,
    [],
  );
  const challengeCount = useMemo(
    () => writeupsMeta.filter((w) => w.type === "Challenge").length,
    [],
  );

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const w of writeupsMeta) {
      if (w.category) cats.add(w.category);
    }
    if (cats.size === 0) {
      ["Reverse Engineering", "Web", "Crypto", "Pwn", "Forensics"].forEach((c) => cats.add(c));
    }
    return Array.from(cats);
  }, []);

  const filteredWriteups = useMemo(() => {
    let result = writeupsMeta;
    if (typeFilter) result = result.filter((w) => w.type === typeFilter);
    if (categoryFilter)
      result = result.filter(
        (w) => w.category === categoryFilter || w.tags.includes(categoryFilter),
      );
    if (platformFilter) result = result.filter((w) => w.platform === platformFilter);
    if (difficultyFilter) result = result.filter((w) => w.difficulty === difficultyFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.excerpt.toLowerCase().includes(q) ||
          (w.category && w.category.toLowerCase().includes(q)) ||
          w.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [typeFilter, categoryFilter, platformFilter, difficultyFilter, searchQuery]);

  const hasActiveFilter =
    Boolean(typeFilter) ||
    Boolean(categoryFilter) ||
    Boolean(platformFilter) ||
    Boolean(difficultyFilter) ||
    Boolean(searchQuery.trim());

  const clearFilters = () => {
    setTypeFilter(null);
    setCategoryFilter(null);
    setPlatformFilter(null);
    setDifficultyFilter(null);
    setSearchQuery("");
  };

  return (
    <CyberLayout>
      <div className="w-full min-h-full bg-background text-foreground py-12 px-6 md:px-12 lg:px-16 font-sans">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="space-y-3">
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Writeups
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              Detailed walkthroughs covering the full kill chain — from recon to root.
            </p>
          </div>

          {/* Platform Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setPlatformFilter(null)}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${!platformFilter
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.1)]"
                  : "bg-card text-foreground border-border hover:border-border"
                }`}
            >
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                  All Writeups
                </div>
              </div>
              <Crosshair className="w-5 h-5 text-emerald-400 opacity-80" />
            </button>

            {Object.entries(stats.platforms).map(([platform, count]) => {
              const cfg = platformConfig[platform] || platformConfig.Other;
              const isActive = platformFilter === platform;
              return (
                <button
                  key={platform}
                  onClick={() => setPlatformFilter(isActive ? null : platform)}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${isActive
                      ? `${cfg.bg} ${cfg.border} ${cfg.color} shadow-md`
                      : "bg-card text-foreground border-border hover:border-border"
                    }`}
                >
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                      {platform}
                    </div>
                  </div>
                  <cfg.icon className={`w-5 h-5 ${cfg.color} opacity-80`} />
                </button>
              );
            })}
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            {/* Type Pill Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTypeFilter(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${!typeFilter
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                  }`}
              >
                All ({writeupsMeta.length})
              </button>
              <button
                onClick={() => setTypeFilter(typeFilter === "Machine" ? null : "Machine")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${typeFilter === "Machine"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                  }`}
              >
                Machines ({machineCount})
              </button>
              <button
                onClick={() => setTypeFilter(typeFilter === "Challenge" ? null : "Challenge")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${typeFilter === "Challenge"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                  }`}
              >
                Challenges ({challengeCount})
              </button>
            </div>

            {/* Search Input & Reset */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search writeups..."
                  className="w-full bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-9 py-2 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {hasActiveFilter && (
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

          {/* Difficulty Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium mr-1">Difficulty:</span>
            {["Very Easy", "Easy", "Medium", "Hard", "Insane"].map((d) => {
              const isActive = difficultyFilter === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(isActive ? null : d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${isActive
                      ? difficultyBg(d) + " font-semibold shadow-sm"
                      : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          {filteredWriteups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWriteups.map((w) => {
                const cfg = platformConfig[w.platform] || platformConfig.Other;
                return (
                  <Link
                    key={w.slug}
                    to="/writeups/$slug"
                    params={{ slug: w.slug }}
                    className="group flex flex-col justify-between rounded-xl bg-card border border-border p-6 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)] transition-all duration-200"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} ${cfg.border} border`}
                        >
                          <cfg.icon className="w-3.5 h-3.5" />
                          {w.platform}
                        </span>

                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyBg(w.difficulty)}`}
                        >
                          {w.difficulty}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-foreground group-hover:text-emerald-400 transition-colors leading-snug">
                        {w.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {w.excerpt}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                        {w.date && <span>{w.date}</span>}
                        {w.os && (
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                            {w.os}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Tags Row */}
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {w.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
              <Swords className="w-12 h-12 text-[#444] mx-auto" />
              <h3 className="text-lg font-bold text-foreground">No writeups found</h3>
              <p className="text-sm text-muted-foreground">
                No writeups matched your selected search filters.
              </p>
              {hasActiveFilter && (
                <button
                  onClick={clearFilters}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </CyberLayout>
  );
}
