import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Swords,
  Shield,
  Flag,
  Terminal,
  Server,
  Globe,
  ChevronRight,
  Sparkles,
  Cpu,
  Filter,
  Clock,
  Star,
  BookOpen,
  Search,
  X,
  TrendingUp,
  Activity,
  Crosshair,
} from "lucide-react";
import { CyberLayout, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";
import { writeupsMeta, getPlatformStats, type WriteupMeta } from "@/data/writeups";
import { PlatformIcon } from "@/components/cyber/WriteupComponents";

export const Route = createFileRoute("/writeups/")(
  {
    head: () => ({
      meta: [
        { title: "/writeups — Asbawy Blog" },
        {
          name: "description",
          content:
            "CTF writeups, HackTheBox walkthroughs, TryHackMe challenges, and more by Asbawy.",
        },
      ],
    }),
    component: WriteupsIndex,
  },
);

/* ── Platform branding ────────────────────────────────── */

const platformConfig: Record<
  string,
  { color: string; icon: typeof Swords; gradient: string; border: string; bg: string; accentHex: string }
> = {
  HackTheBox: {
    color: "text-[#9FEF00]",
    icon: Swords,
    gradient: "from-[#9FEF00]/10 via-transparent to-transparent",
    border: "border-[#9FEF00]/30",
    bg: "bg-[#9FEF00]/5",
    accentHex: "#9FEF00",
  },
  TryHackMe: {
    color: "text-[#FF3E3E]",
    icon: Flag,
    gradient: "from-[#FF3E3E]/10 via-transparent to-transparent",
    border: "border-[#FF3E3E]/30",
    bg: "bg-[#FF3E3E]/5",
    accentHex: "#FF3E3E",
  },
  VulnHub: {
    color: "text-[#4FC3F7]",
    icon: Server,
    gradient: "from-[#4FC3F7]/10 via-transparent to-transparent",
    border: "border-[#4FC3F7]/30",
    bg: "bg-[#4FC3F7]/5",
    accentHex: "#4FC3F7",
  },
  CTF: {
    color: "text-[#FFD43B]",
    icon: Flag,
    gradient: "from-[#FFD43B]/10 via-transparent to-transparent",
    border: "border-[#FFD43B]/30",
    bg: "bg-[#FFD43B]/5",
    accentHex: "#FFD43B",
  },
  Other: {
    color: "text-[#C792EA]",
    icon: Globe,
    gradient: "from-[#C792EA]/10 via-transparent to-transparent",
    border: "border-[#C792EA]/30",
    bg: "bg-[#C792EA]/5",
    accentHex: "#C792EA",
  },
};

/* ── Difficulty helpers ──────────────────────────────── */

function difficultyColor(d: string) {
  switch (d) {
    case "Easy": return "text-[#9FEF00]";
    case "Medium": return "text-[#FFD43B]";
    case "Hard": return "text-[#FF7043]";
    case "Insane": return "text-[#FF3E3E]";
    default: return "text-foreground";
  }
}

function difficultyBg(d: string) {
  switch (d) {
    case "Easy": return "bg-[#9FEF00]/10 border-[#9FEF00]/30";
    case "Medium": return "bg-[#FFD43B]/10 border-[#FFD43B]/30";
    case "Hard": return "bg-[#FF7043]/10 border-[#FF7043]/30";
    case "Insane": return "bg-[#FF3E3E]/10 border-[#FF3E3E]/30";
    default: return "bg-foreground/10 border-border";
  }
}

function difficultyDot(d: string) {
  switch (d) {
    case "Easy": return "bg-[#9FEF00]";
    case "Medium": return "bg-[#FFD43B]";
    case "Hard": return "bg-[#FF7043]";
    case "Insane": return "bg-[#FF3E3E]";
    default: return "bg-foreground";
  }
}

function osIcon(os?: string) {
  switch (os) {
    case "Linux": return <Terminal className="h-3.5 w-3.5" />;
    case "Windows": return <Cpu className="h-3.5 w-3.5" />;
    case "Web": return <Globe className="h-3.5 w-3.5" />;
    default: return <Shield className="h-3.5 w-3.5" />;
  }
}

/* ── Main Component ──────────────────────────────────── */

function WriteupsIndex() {
  const navigate = useNavigate();
  const stats = getPlatformStats();
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWriteups = useMemo(() => {
    let result = writeupsMeta;
    if (platformFilter) result = result.filter((w) => w.platform === platformFilter);
    if (difficultyFilter) result = result.filter((w) => w.difficulty === difficultyFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.excerpt.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [platformFilter, difficultyFilter, searchQuery]);

  const hasActiveFilter = platformFilter || difficultyFilter || searchQuery.trim();

  return (
    <CyberLayout>
      <section className="px-4 md:px-10 py-8 max-w-6xl">

        {/* ── Hero Header ───────────────────────────── */}
        <div className="mb-8">
          <div className="font-mono text-[11px] text-muted-foreground mb-2 flex items-center gap-1.5">
            <span className="text-foreground font-semibold">asbawy</span>
            <span className="opacity-40">:</span>
            <span className="text-muted-foreground">~/writeups</span>
            <span className="opacity-40">$</span>
            <span className="text-muted-foreground/60">ls -la --sort=date</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-mono text-3xl md:text-4xl font-bold text-foreground leading-tight">
                /writeups
                <span className="text-muted-foreground/40 font-normal text-2xl ml-2">_</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground leading-relaxed">
                Detailed walkthroughs covering the full kill chain — from recon to root.
                Each write-up documents the exact tools, techniques, and thought process used.
              </p>
            </div>

            {/* Live Stats mini-pills */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className="flex items-center gap-1.5 border border-border bg-card/60 rounded-full px-3 py-1 font-mono text-[10px] text-foreground/70">
                <Activity className="h-3 w-3 text-green-400" />
                {stats.total} machines pwned
              </span>
              <span className="flex items-center gap-1.5 border border-border bg-card/60 rounded-full px-3 py-1 font-mono text-[10px] text-foreground/70">
                <TrendingUp className="h-3 w-3 text-blue-400" />
                {Object.keys(stats.platforms).length} platforms
              </span>
            </div>
          </div>
        </div>

        {/* ── Platform Stat Cards ───────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Total card */}
          <button
            className={`group relative rounded-xl border p-4 text-left overflow-hidden transition-all duration-200 cursor-pointer ${
              !platformFilter
                ? "border-foreground/20 bg-foreground/5"
                : "border-border bg-card/40 hover:border-border/80 hover:bg-card/60"
            }`}
            onClick={() => setPlatformFilter(null)}
          >
            <div className="flex items-start justify-between mb-2">
              <Crosshair className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground/80 transition-colors" />
              {!platformFilter && <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />}
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
              all_pwned
            </div>
          </button>

          {/* Per-platform cards */}
          {Object.entries(stats.platforms).map(([platform, count]) => {
            const cfg = platformConfig[platform] || platformConfig.Other;
            const isActive = platformFilter === platform;
            return (
              <button
                key={platform}
                className={`group relative rounded-xl border p-4 text-left overflow-hidden transition-all duration-200 cursor-pointer ${
                  isActive
                    ? `${cfg.border} ${cfg.bg}`
                    : "border-border bg-card/40 hover:border-border/80 hover:bg-card/60"
                }`}
                onClick={() => setPlatformFilter(isActive ? null : platform)}
              >
                {/* Accent glow on active */}
                {isActive && (
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${cfg.accentHex}, transparent 70%)` }}
                  />
                )}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <cfg.icon className={`h-4 w-4 ${isActive ? cfg.color : "text-muted-foreground/50 group-hover:text-muted-foreground"} transition-colors`} />
                    {isActive && <span className={`h-1.5 w-1.5 rounded-full animate-pulse`} style={{ background: cfg.accentHex }} />}
                  </div>
                  <div className={`font-mono text-2xl font-bold ${isActive ? cfg.color : "text-foreground"} transition-colors`}>
                    {count}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    {platform.toLowerCase()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Filter & Search Bar ───────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Search writeups, tags, techniques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card/60 pl-9 pr-4 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/30 focus:bg-card/80 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Difficulty pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            {["Easy", "Medium", "Hard", "Insane"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                className={`flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  difficultyFilter === d
                    ? `${difficultyBg(d)} ${difficultyColor(d)}`
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 bg-card/40"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${difficultyDot(d)}`} />
                {d}
              </button>
            ))}
            {hasActiveFilter && (
              <button
                onClick={() => { setPlatformFilter(null); setDifficultyFilter(null); setSearchQuery(""); }}
                className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted/40"
              >
                <X className="h-3 w-3" />
                clear
              </button>
            )}
          </div>
        </div>

        {/* ── Results heading ───────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="text-foreground">▸</span>
            <span>{hasActiveFilter ? "filtered_results" : "all_writeups"}</span>
            <span className="text-foreground/40">({filteredWriteups.length})</span>
          </div>
          {/* Difficulty breakdown mini-bar */}
          <div className="hidden sm:flex items-center gap-3 font-mono text-[9px] text-muted-foreground/60 uppercase tracking-wider">
            {Object.entries(stats.difficulties).map(([diff, count]) => (
              <span key={diff} className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${difficultyDot(diff)}`} />
                {diff}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* ── Writeups Grid ─────────────────────────── */}
        {filteredWriteups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredWriteups.map((w) => (
              <WriteupCard key={w.slug} writeup={w} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/40 p-16 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/25 mx-auto mb-3" />
            <p className="font-mono text-sm text-muted-foreground">
              {writeupsMeta.length === 0
                ? "// no writeups yet — first blood pending"
                : "// no matches for current filters"}
            </p>
          </div>
        )}
      </section>
    </CyberLayout>
  );
}

/* ── Writeup Card Component ──────────────────────────── */

function WriteupCard({
  writeup: w,
  navigate,
}: {
  writeup: WriteupMeta;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const config = platformConfig[w.platform] || platformConfig.Other;

  return (
    <Link
      to="/writeups/$slug"
      params={{ slug: w.slug }}
      preload="intent"
      className="group relative block rounded-xl border border-border bg-card/50 overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px"
    >
      {/* Top accent line */}
      <div
        className="h-0.5 w-full opacity-60"
        style={{ background: `linear-gradient(to right, ${config.accentHex}, transparent)` }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${config.accentHex}0A, transparent 60%)` }}
      />

      <div className="relative z-10 p-4">
        {/* Header: Platform + OS + Meta */}
        <div className="flex items-center justify-between font-mono text-[10px] mb-3">
          <div className="flex items-center gap-1.5">
            <PlatformIcon platform={w.platform} className={`h-3.5 w-3.5 ${config.color}`} />
            <span className={`font-semibold ${config.color}`}>{w.platform}</span>
            <span className="text-muted-foreground/30 mx-0.5">·</span>
            <span className="text-muted-foreground">{w.type}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {w.os && (
              <span className="flex items-center gap-1">
                {osIcon(w.os)}
                <span>{w.os}</span>
              </span>
            )}
            {w.rating && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-[#FFD43B] text-[#FFD43B]" />
                <span className="text-foreground/60">{w.rating}</span>
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors leading-snug mb-1.5">
          {w.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-relaxed mb-3">
          {w.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {w.tags.slice(0, 4).map((t) => (
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
          {w.tags.length > 4 && (
            <span className="font-mono text-[9px] text-muted-foreground/50 self-center">
              +{w.tags.length - 4}
            </span>
          )}
        </div>

        {/* Footer: difficulty + date + readTime + chevron */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded border ${difficultyBg(w.difficulty)} ${difficultyColor(w.difficulty)}`}
            >
              <span className={`h-1 w-1 rounded-full ${difficultyDot(w.difficulty)}`} />
              {w.difficulty}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/50">{w.date}</span>
            {w.readTime && (
              <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground/50">
                <Clock className="h-2.5 w-2.5" />
                {w.readTime}
              </span>
            )}
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground/60 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
