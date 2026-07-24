/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CyberLayout, Panel, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";
import { TerminalCode } from "@/components/cyber/TerminalCode";
import { Mermaid } from "@/components/cyber/Mermaid";
import {
  getWriteupMeta,
  getWriteupContent,
  writeupsMeta,
  WriteupMdxComponents,
} from "@/data/writeups";
import { Suspense } from "react";
import { ArrowLeft, Swords, Flag, Server, Globe, Terminal, Cpu, Shield } from "lucide-react";
import { PlatformIcon, SpoilerFlag, KillChain, SkillMatrix, CategoryIcon } from "@/components/cyber/WriteupComponents";
import { ImageLightbox } from "@/components/cyber/ImageLightbox";
import { ShareButtons } from "@/components/cyber/ShareButtons";
import { AuthorBio } from "@/components/cyber/AuthorBio";
import { useSharedMdxComponents } from "@/components/cyber/SharedMdxComponents";
import { useArticleToc } from "@/hooks/use-article-toc";

export const Route = createFileRoute("/writeups/$slug")({
  loader: async ({ params }) => {
    const meta = getWriteupMeta(params.slug);
    if (!meta) throw notFound();
    const writeup = await getWriteupContent(params.slug);
    if (!writeup) throw notFound();
    return { slug: params.slug, writeup };
  },

  head: ({ params }) => {
    const w = getWriteupMeta(params.slug);
    const url = `https://asbawy.github.io/writeups/${params.slug}`;
    return {
      meta: w
        ? [
            { title: `${w.title} — Asbawy Blog` },
            { name: "description", content: w.excerpt },
            { property: "og:title", content: w.title },
            { property: "og:description", content: w.excerpt },
            { property: "og:type", content: "article" },
            { property: "og:url", content: url },
            { property: "og:image", content: "https://asbawy.github.io/eye-of-ra.png" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:image", content: "https://asbawy.github.io/eye-of-ra.png" },
          ]
        : [{ title: "Asbawy Blog" }],
      links: [{ rel: "canonical", href: url }],
      scripts: w
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: w.title,
                description: w.excerpt,
                datePublished: w.date,
                author: {
                  "@type": "Person",
                  name: "Asbawy",
                  url: "https://asbawy.github.io",
                },
                publisher: {
                  "@type": "Person",
                  name: "Asbawy",
                },
                url,
                mainEntityOfPage: { "@type": "WebPage", "@id": url },
                keywords: w.tags.join(", "),
              }),
            },
          ]
        : [],
    };
  },

  notFoundComponent: () => (
    <CyberLayout>
      <div className="p-10 font-mono text-sm text-muted-foreground">
        // writeup not found —{" "}
        <Link to="/writeups" className="text-foreground hover:text-foreground/80 transition-colors">
          return to feed
        </Link>
      </div>
    </CyberLayout>
  ),

  errorComponent: ({ error }) => (
    <CyberLayout>
      <div className="p-10 font-mono text-sm text-threat-high">// {error.message}</div>
    </CyberLayout>
  ),
  component: WriteupPage,
});

/* ── Platform config ─────────────────────────────────── */

const platformConfig: Record<string, { color: string; icon: typeof Swords }> = {
  HackTheBox: { color: "text-[#9FEF00]", icon: Swords },
  TryHackMe: { color: "text-[#FF3E3E]", icon: Flag },
  VulnHub: { color: "text-[#4FC3F7]", icon: Server },
  CTF: { color: "text-[#FFD43B]", icon: Flag },
  Other: { color: "text-[#C792EA]", icon: Globe },
};

function difficultyColor(d: string) {
  switch (d) {
    case "Very Easy":
      return "text-[#00E5FF]";
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
    case "Very Easy":
      return "bg-[#00E5FF]/10 border-[#00E5FF]/30";
    case "Easy":
      return "bg-[#9FEF00]/10 border-[#9FEF00]/30";
    case "Medium":
      return "bg-[#FFD43B]/10 border-[#FFD43B]/30";
    case "Hard":
      return "bg-[#FF7043]/10 border-[#FF7043]/30";
    case "Insane":
      return "bg-[#FF3E3E]/10 border-[#FF3E3E]/30";
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

function WriteupPage() {
  const navigate = useNavigate();
  const { writeup } = Route.useLoaderData();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const {
    headings,
    activeId: activeHeading,
    progress,
  } = useArticleToc("article", [2], writeup.slug);

  const config = platformConfig[writeup.platform] || platformConfig.Other;
  const PlatformIcon = config.icon;

  const components = useSharedMdxComponents(setLightboxSrc);

  const MDXContent = WriteupMdxComponents[writeup.slug] || (() => <div>Component not found</div>);

  // Related writeups (same platform or overlapping tags)
  const relatedWriteups = useMemo(() => {
    return writeupsMeta
      .filter(
        (w) =>
          w.slug !== writeup.slug &&
          (w.platform === writeup.platform || w.tags.some((t) => writeup.tags.includes(t))),
      )
      .slice(0, 4);
  }, [writeup]);

  return (
    <CyberLayout>
      {/* Global Scroll Progress Bar */}
      <div className="fixed top-0 left-0 h-1 z-50 w-full bg-transparent">
        <div 
          className="h-full bg-foreground/80 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article className="px-6 md:px-10 py-10 max-w-7xl mx-auto glass-panel rounded-xl my-6 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          to="/writeups"
          className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> cd ../writeups
        </Link>

        <div className="mt-2 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          <div className="min-w-0 flex flex-col items-start">
            
            {/* Mission Briefing Card */}
            <div className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 mb-10 shadow-[0_0_15px_rgba(0,0,0,0.2)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-50"></div>
              
              <div className="font-mono text-[11px] flex flex-wrap items-center gap-3 mb-4 tracking-wider">
                <span className="text-muted-foreground">{writeup.date}</span>
                <span className="text-foreground/20">·</span>
                <span className={`flex items-center gap-1.5 ${config.color}`}>
                  <PlatformIcon platform={writeup.platform} className="h-4 w-4" />
                  {writeup.platform}
                </span>
                <span className="text-foreground/20">·</span>
                <span className="text-muted-foreground">{writeup.type}</span>
                <span className="text-foreground/20">·</span>
                <span className="text-foreground/60">{writeup.readTime}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground tracking-tight mb-6">
                {writeup.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span
                  className={`font-mono text-[11px] px-2.5 py-1 rounded border ${difficultyBg(
                    writeup.difficulty,
                  )} ${difficultyColor(writeup.difficulty)} uppercase font-bold tracking-widest`}
                >
                  {writeup.difficulty}
                </span>
                {writeup.category && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded border border-purple-500/30 bg-purple-500/10 text-purple-300 uppercase font-bold tracking-widest">
                    <CategoryIcon category={writeup.category} className="h-3.5 w-3.5" />
                    {writeup.category}
                  </span>
                )}
                {writeup.os && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded border border-white/10 bg-white/5 text-muted-foreground uppercase font-bold tracking-widest">
                    {osIcon(writeup.os)} {writeup.os}
                  </span>
                )}
                {writeup.retired !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-widest ${
                      writeup.retired
                        ? "border-foreground/10 text-muted-foreground bg-white/5"
                        : "border-[#9FEF00]/20 text-[#9FEF00] bg-[#9FEF00]/5"
                    }`}
                  >
                    {writeup.retired ? "retired" : "active"}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {writeup.tags?.map((t) => (
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

            {/* Share */}
            <div className="mb-8 w-full max-w-[75ch]">
              <ShareButtons title={writeup.title} slug={writeup.slug} />
            </div>

            {/* MDX Content */}
            <div className="w-full text-[16px]">
              <Suspense
                fallback={
                  <div className="animate-pulse text-foreground/60 font-mono flex flex-col gap-4">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                    <div className="mt-8 text-sm">[ LOADING EXPLOIT CHAIN... ]</div>
                  </div>
                }
              >
                <MDXContent components={components} />
              </Suspense>
            </div>

            {/* Share bottom */}
            <div className="mt-16 w-full max-w-[75ch]">
              <ShareButtons title={writeup.title} slug={writeup.slug} />
            </div>

            <AuthorBio />

            <div className="mt-10 border-t border-panel-border pt-6 font-mono text-[11px] text-muted-foreground">
              // end of writeup —{" "}
              <Link
                to="/writeups"
                className="text-foreground hover:text-foreground/80 transition-colors"
              >
                return /writeups
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              {/* Reading progress bar and TOC */}
              <Panel title="table of contents">
                <div className="mb-4 h-1 w-full overflow-hidden rounded-sm bg-secondary/60">
                  <div
                    className="h-full bg-foreground/60"
                    style={{
                      width: `${progress}%`,
                      boxShadow: "0 0 10px currentColor",
                    }}
                  />
                </div>

                {headings.length > 0 && (
                  <ol className="space-y-1.5 font-mono text-xs">
                    {headings.map((s) => {
                      const isActive = activeHeading === s.id;
                      return (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            className={`flex items-center gap-2 rounded px-2.5 py-1.5 transition-all duration-300 ${
                              isActive
                                ? "text-foreground bg-white/[0.08] shadow-[inset_2px_0_0_0_currentColor]"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                            }`}
                          >
                            <span className={isActive ? "opacity-100 text-foreground" : "opacity-40"}>
                              {isActive ? "▸" : "·"}
                            </span>
                            <span className="truncate">{s.title}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Panel>

              {/* Machine Info Panel */}
              <Panel title="machine_info" className="mt-4">
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">platform</span>
                    <span className={config.color}>{writeup.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">difficulty</span>
                    <span className={difficultyColor(writeup.difficulty)}>
                      {writeup.difficulty}
                    </span>
                  </div>
                  {writeup.os && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">os</span>
                      <span className="text-foreground">{writeup.os}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">type</span>
                    <span className="text-foreground">{writeup.type}</span>
                  </div>
                  {writeup.rating && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">rating</span>
                      <span className="text-foreground">
                        {"★".repeat(Math.round(writeup.rating))}
                        {"☆".repeat(5 - Math.round(writeup.rating))} {writeup.rating}
                      </span>
                    </div>
                  )}
                </div>
              </Panel>

              {/* Related writeups */}
              {relatedWriteups.length > 0 && (
                <Panel title="related" className="mt-4">
                  <ul className="space-y-2 text-xs">
                    {relatedWriteups.map((w) => (
                      <li key={w.slug}>
                        <Link
                          to="/writeups/$slug"
                          params={{ slug: w.slug }}
                          className="block text-muted-foreground hover:text-foreground transition-colors"
                        >
                          → {w.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </div>
          </aside>
        </div>
      </article>
      <ImageLightbox src={lightboxSrc} alt="Expanded image" onClose={() => setLightboxSrc(null)} />
    </CyberLayout>
  );
}
