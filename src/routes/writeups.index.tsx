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
} from "lucide-react";
import { CyberLayout, Panel, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";
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
  { color: string; icon: typeof Swords; gradient: string; border: string }
> = {
  HackTheBox: {
    color: "text-[#9FEF00]",
    icon: Swords,
    gradient: "from-[#9FEF00]/10 to-transparent",
    border: "border-[#9FEF00]/20",
  },
  TryHackMe: {
    color: "text-[#FF3E3E]",
    icon: Flag,
    gradient: "from-[#FF3E3E]/10 to-transparent",
    border: "border-[#FF3E3E]/20",
  },
  VulnHub: {
    color: "text-[#4FC3F7]",
    icon: Server,
    gradient: "from-[#4FC3F7]/10 to-transparent",
    border: "border-[#4FC3F7]/20",
  },
  CTF: {
    color: "text-[#FFD43B]",
    icon: Flag,
    gradient: "from-[#FFD43B]/10 to-transparent",
    border: "border-[#FFD43B]/20",
  },
  Other: {
    color: "text-[#C792EA]",
    icon: Globe,
    gradient: "from-[#C792EA]/10 to-transparent",
    border: "border-[#C792EA]/20",
  },
};

/* ── Difficulty color helper ─────────────────────────── */

function difficultyColor(d: string) {
  switch (d) {
    case "Easy":
      return "text-[#9FEF00]";
    case "Medium":
      return "text-[#FFD43B]";
    case "Hard":
      return "text-[#FF7043]";
    case "Insane":
      return "text-[#FF3E3E]";
    default:
      return "text-foreground";
  }
}

function difficultyBg(d: string) {
  switch (d) {
    case "Easy":
      return "bg-[#9FEF00]/10 border-[#9FEF00]/20";
    case "Medium":
      return "bg-[#FFD43B]/10 border-[#FFD43B]/20";
    case "Hard":
      return "bg-[#FF7043]/10 border-[#FF7043]/20";
    case "Insane":
      return "bg-[#FF3E3E]/10 border-[#FF3E3E]/20";
    default:
      return "bg-foreground/10";
  }
}

function osIcon(os?: string) {
  switch (os) {
    case "Linux":
      return <Terminal className="h-3.5 w-3.5" />;
    case "Windows":
      return <Cpu className="h-3.5 w-3.5" />;
    case "Web":
      return <Globe className="h-3.5 w-3.5" />;
    default:
      return <Shield className="h-3.5 w-3.5" />;
  }
}

/* ── Main Component ──────────────────────────────────── */

function WriteupsIndex() {
  const navigate = useNavigate();
  const stats = getPlatformStats();
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

  const filteredWriteups = useMemo(() => {
    let result = writeupsMeta;
    if (platformFilter) result = result.filter((w) => w.platform === platformFilter);
    if (difficultyFilter) result = result.filter((w) => w.difficulty === difficultyFilter);
    return result;
  }, [platformFilter, difficultyFilter]);

  return (
    <CyberLayout>
      <section className="px-6 md:px-10 py-10 max-w-6xl">
        {/* Header */}
        <div className="font-mono text-[11px] text-muted-foreground">
          <span className="text-foreground">asbawy</span>:
          <span className="text-foreground">~/writeups</span>$ ls -la --sort=date
        </div>
        <h1 className="mt-2 font-mono text-2xl md:text-3xl text-foreground">
          /writeups{" "}
          <span className="text-muted-foreground">— pwned_machines</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Detailed walkthroughs of CTF challenges, HackTheBox machines, TryHackMe rooms, and more.
          Each writeup covers the full kill chain from reconnaissance to root.
        </p>

        {/* Stats Dashboard */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-panel rounded-lg p-4 text-center">
            <div className="font-mono text-2xl font-bold text-foreground">
              {stats.total}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              total_pwned
            </div>
          </div>
          {Object.entries(stats.platforms).map(([platform, count]) => {
            const config = platformConfig[platform] || platformConfig.Other;
            return (
              <div
                key={platform}
                className={`glass-panel rounded-lg p-4 text-center bg-gradient-to-b ${config.gradient} cursor-pointer hover:scale-[1.02] transition-transform`}
                onClick={() =>
                  setPlatformFilter(platformFilter === platform ? null : platform)
                }
              >
                <div className={`font-mono text-2xl font-bold ${config.color}`}>
                  {count}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  {platform.toLowerCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Difficulty filter bar */}
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
            filter:
          </span>
          {["Easy", "Medium", "Hard", "Insane"].map((d) => (
            <button
              key={d}
              onClick={() =>
                setDifficultyFilter(difficultyFilter === d ? null : d)
              }
              className={`
                font-mono text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer
                ${
                  difficultyFilter === d
                    ? `${difficultyBg(d)} ${difficultyColor(d)} border-current`
                    : "border-panel-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }
              `}
            >
              {d.toLowerCase()}
            </button>
          ))}
          {(platformFilter || difficultyFilter) && (
            <button
              onClick={() => {
                setPlatformFilter(null);
                setDifficultyFilter(null);
              }}
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-2"
            >
              [ clear_all ]
            </button>
          )}
        </div>

        {/* Writeups Grid */}
        <div className="mt-8">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
            <span className="text-foreground">▸</span>{" "}
            {platformFilter || difficultyFilter
              ? "filtered_results"
              : "all_writeups"}
            <span className="text-foreground/40 ml-1">
              ({filteredWriteups.length})
            </span>
          </h3>

          {filteredWriteups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWriteups.map((w) => (
                <WriteupCard key={w.slug} writeup={w} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-lg p-12 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-mono text-sm text-muted-foreground">
                {writeupsMeta.length === 0
                  ? "// no writeups yet — first blood pending"
                  : "// no matches for current filters"}
              </p>
            </div>
          )}
        </div>
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
  const PlatformIcon = config.icon;

  return (
    <Link
      to="/writeups/$slug"
      params={{ slug: w.slug }}
      preload="intent"
      className={`group block rounded-lg glass-panel glass-panel-hover p-5 transition-all relative overflow-hidden border ${config.border}`}
    >
      {/* Subtle gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      <div className="relative z-10">
        {/* Header row: platform + difficulty + OS */}
        <div className="flex items-center justify-between font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={w.platform} className={`h-4 w-4 ${config.color}`} />
            <span className={config.color}>{w.platform}</span>
            <span className="text-foreground/20">·</span>
            <span className="text-muted-foreground">{w.type}</span>
          </div>
          <div className="flex items-center gap-2">
            {w.os && (
              <span className="flex items-center gap-1 text-muted-foreground">
                {osIcon(w.os)}
                {w.os}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-2.5 text-sm md:text-base font-semibold text-foreground group-hover:text-foreground transition-colors leading-snug">
          {w.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
          {w.excerpt}
        </p>

        {/* Bottom row: difficulty + date + tags */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded border ${difficultyBg(
                w.difficulty,
              )} ${difficultyColor(w.difficulty)}`}
            >
              {w.difficulty.toLowerCase()}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {w.date}
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
        </div>

        {/* Tags */}
        <div className="mt-2.5 flex flex-wrap gap-1">
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
        </div>
      </div>
    </Link>
  );
}
