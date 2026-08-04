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
import { CategoryIcon, AutoScriptBadge } from "@/components/cyber/WriteupComponents";

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
    glow: string;
  }
> = {
  HackTheBox: {
    color: "text-[#9FEF00]",
    icon: Swords,
    border: "border-[#9FEF00]/30",
    bg: "bg-[#9FEF00]/10",
    glow: "shadow-[0_0_20px_rgba(159,239,0,0.12)]",
  },
  TryHackMe: {
    color: "text-[#FF3E3E]",
    icon: Flag,
    border: "border-[#FF3E3E]/30",
    bg: "bg-[#FF3E3E]/10",
    glow: "shadow-[0_0_20px_rgba(255,62,62,0.12)]",
  },
  VulnHub: {
    color: "text-[#4FC3F7]",
    icon: Server,
    border: "border-[#4FC3F7]/30",
    bg: "bg-[#4FC3F7]/10",
    glow: "shadow-[0_0_20px_rgba(79,195,247,0.12)]",
  },
  CTF: {
    color: "text-[#FFD43B]",
    icon: Flag,
    border: "border-[#FFD43B]/30",
    bg: "bg-[#FFD43B]/10",
    glow: "shadow-[0_0_20px_rgba(255,212,59,0.12)]",
  },
  Other: {
    color: "text-[#C792EA]",
    icon: Globe,
    border: "border-[#C792EA]/30",
    bg: "bg-[#C792EA]/10",
    glow: "shadow-[0_0_20px_rgba(199,146,234,0.12)]",
  },
};

function difficultyBg(d: string) {
  switch (d) {
    case "Very Easy":
      return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-semibold";
    case "Easy":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold";
    case "Medium":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-semibold";
    case "Hard":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)] font-semibold";
    case "Insane":
      return "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.35)] font-semibold";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

function difficultyAccent(d: string) {
  switch (d) {
    case "Very Easy":
      return "from-cyan-500/60 to-cyan-500/10";
    case "Easy":
      return "from-emerald-500/60 to-emerald-500/10";
    case "Medium":
      return "from-amber-500/60 to-amber-500/10";
    case "Hard":
      return "from-rose-500/60 to-rose-500/10";
    case "Insane":
      return "from-purple-500/70 to-purple-500/10";
    default:
      return "from-muted-foreground/40 to-muted-foreground/5";
  }
}

function WriteupsIndex() {
  const stats = getPlatformStats();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const machineCount = useMemo(() => writeupsMeta.filter((w) => w.type === "Machine").length, []);
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Swords className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-emerald-400 bg-clip-text text-transparent">
                Writeups
              </h1>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Detailed walkthroughs covering the full kill chain — from recon to root.
            </p>
          </div>

          {/* Platform Stat Cards */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPlatformFilter(null)}
              className={`group/stat relative flex items-center justify-between p-5 rounded-xl border text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                !platformFilter
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.12)]"
                  : "bg-card text-foreground border-border hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]"
              }`}
            >
              {/* Top color accent strip */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/80 to-emerald-500/20" />
              <div className="relative z-10">
                <div className="text-3xl font-extrabold tabular-nums">{stats.total}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                  All Writeups
                </div>
              </div>
              <Crosshair className="w-6 h-6 text-emerald-400 opacity-40 group-hover/stat:opacity-100 group-hover/stat:rotate-90 transition-all duration-500" />
            </button>

            {Object.entries(stats.platforms).map(([platform, count]) => {
              const cfg = platformConfig[platform] || platformConfig.Other;
              const isActive = platformFilter === platform;
              return (
                <button
                  key={platform}
                  onClick={() => setPlatformFilter(isActive ? null : platform)}
                  className={`group/stat relative flex items-center justify-between p-5 rounded-xl border text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? `${cfg.bg} ${cfg.border} ${cfg.color} ${cfg.glow}`
                      : "bg-card text-foreground border-border hover:border-border/80"
                  }`}
                >
                  {/* Top color accent strip */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
                    platform === "HackTheBox" ? "from-[#9FEF00]/80 to-[#9FEF00]/20"
                    : platform === "TryHackMe" ? "from-[#FF3E3E]/80 to-[#FF3E3E]/20"
                    : platform === "VulnHub" ? "from-[#4FC3F7]/80 to-[#4FC3F7]/20"
                    : "from-[#C792EA]/80 to-[#C792EA]/20"
                  }`} />
                  <div className="relative z-10">
                    <div className="text-3xl font-extrabold tabular-nums">{count}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                      {platform}
                    </div>
                  </div>
                  <cfg.icon className={`w-6 h-6 ${cfg.color} opacity-40 group-hover/stat:opacity-100 group-hover/stat:scale-110 transition-all duration-300`} />
                </button>
              );
            })}
          </div>

          {/* Unified Filter Bar */}
          <div className="flex flex-col gap-4 rounded-xl bg-card/50 border border-border/50 p-4">
            {/* Top Row: Type Tabs + Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Type Pill Tabs */}
              <div className="flex items-center gap-1 bg-muted/40 rounded-full p-1 border border-border/60">
                <button
                  onClick={() => setTypeFilter(null)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    !typeFilter
                      ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-[0_0_10px_rgba(52,211,153,0.15)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({writeupsMeta.length})
                </button>
                <button
                  onClick={() => setTypeFilter(typeFilter === "Machine" ? null : "Machine")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    typeFilter === "Machine"
                      ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-[0_0_10px_rgba(52,211,153,0.15)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Machines ({machineCount})
                </button>
                <button
                  onClick={() => setTypeFilter(typeFilter === "Challenge" ? null : "Challenge")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    typeFilter === "Challenge"
                      ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-[0_0_10px_rgba(52,211,153,0.15)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Challenges ({challengeCount})
                </button>
              </div>

              {/* Search Input & Reset */}
              <div className="flex items-center gap-2">
                <div className="relative md:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search writeups..."
                    className="w-full bg-muted/60 border border-border/60 text-foreground placeholder:text-muted-foreground rounded-full pl-10 pr-9 py-1.5 text-sm focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(52,211,153,0.15)] transition-all"
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Row: Difficulty Pills */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mr-1">Difficulty</span>
              {["Very Easy", "Easy", "Medium", "Hard", "Insane"].map((d) => {
                const isActive = difficultyFilter === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(isActive ? null : d)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isActive
                        ? difficultyBg(d)
                        : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground hover:border-border"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredWriteups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWriteups.map((w) => {
                const cfg = platformConfig[w.platform] || platformConfig.Other;
                return (
                  <Link
                    key={w.slug}
                    to="/writeups/$slug"
                    params={{ slug: w.slug }}
                    className="group relative flex flex-col justify-between rounded-xl bg-card border border-border overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300"
                  >
                    {/* Left difficulty accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${difficultyAccent(w.difficulty)} group-hover:w-[4px] transition-all duration-300`} />

                    {/* Hover glow overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-cyan-500/[0.03] transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10 p-6 space-y-4">
                      {/* Top Row: Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border} border`}
                          >
                            <cfg.icon className="w-3 h-3" />
                            {w.platform}
                          </span>

                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] ${difficultyBg(w.difficulty)}`}
                          >
                            {w.difficulty}
                          </span>
                        </div>

                        {w.hasAutoScript && <AutoScriptBadge size="sm" />}
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-foreground group-hover:text-emerald-400 transition-colors duration-300 leading-snug line-clamp-2">
                        {w.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {w.excerpt}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {w.date && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 opacity-60" />
                            {w.date}
                          </span>
                        )}
                        {w.os && (
                          <span className="flex items-center gap-1.5">
                            <Cpu className="w-3 h-3 opacity-60" />
                            {w.os}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Tags Row */}
                    <div className="relative z-10 mx-6 py-4 border-t border-border/60 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {w.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] text-muted-foreground bg-muted/60 border border-border/60 px-2 py-0.5 rounded-md font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
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
