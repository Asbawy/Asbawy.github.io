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
import {
  ArrowLeft,
  Swords,
  Flag,
  Server,
  Globe,
  Terminal,
  Cpu,
  Shield,
} from "lucide-react";
import { PlatformIcon, SpoilerFlag, KillChain, SkillMatrix } from "@/components/cyber/WriteupComponents";
import { ImageLightbox } from "@/components/cyber/ImageLightbox";
import { ShareButtons } from "@/components/cyber/ShareButtons";
import { AuthorBio } from "@/components/cyber/AuthorBio";
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
        <Link
          to="/writeups"
          className="text-foreground hover:text-foreground/80 transition-colors"
        >
          return to feed
        </Link>
      </div>
    </CyberLayout>
  ),

  errorComponent: ({ error }) => (
    <CyberLayout>
      <div className="p-10 font-mono text-sm text-threat-high">
        // {error.message}
      </div>
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
    default: return "bg-foreground/10";
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

function WriteupPage() {
  const navigate = useNavigate();
  const { writeup } = Route.useLoaderData();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const { headings, activeId: activeHeading, progress } = useArticleToc("article", [2], writeup.slug);

  const config = platformConfig[writeup.platform] || platformConfig.Other;
  const PlatformIcon = config.icon;

  const components = useMemo(
    () => ({
      h1: (props: any) => (
        <h1
          className="mt-8 mb-4 text-2xl md:text-3xl font-semibold text-foreground"
          {...props}
        />
      ),
      h2: (props: any) => (
        <h2
          className="scroll-mt-24 mt-10 mb-4 font-mono text-lg text-foreground border-l-2 border-foreground/30 pl-3"
          {...props}
        >
          <span className="text-foreground/50 mr-2">▸</span>
          {props.children}
        </h2>
      ),
      h3: (props: any) => (
        <h3
          className="mt-8 mb-3 font-mono text-base text-foreground/90"
          {...props}
        />
      ),
      h4: (props: any) => (
        <h4
          className="mt-6 mb-2 font-mono text-sm text-foreground/80"
          {...props}
        />
      ),
      p: (props: any) => (
        <p className="my-4 text-[15px] leading-7 text-foreground/85" {...props} />
      ),
      ul: (props: any) => (
        <ul
          className="my-4 space-y-2 text-[15px] leading-7 text-foreground/85 list-disc ml-5"
          {...props}
        />
      ),
      ol: (props: any) => (
        <ol
          className="my-4 space-y-2 text-[15px] leading-7 text-foreground/85 list-decimal ml-5"
          {...props}
        />
      ),
      li: (props: any) => (
        <li className="marker:text-foreground/40" {...props} />
      ),
      hr: (props: any) => (
        <hr className="my-8 border-panel-border" {...props} />
      ),
      a: (props: any) => (
        <a
          className="text-foreground underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      ),
      strong: (props: any) => (
        <strong className="font-semibold text-foreground" {...props} />
      ),
      code: (props: any) => {
        if (props.className) {
          const language = props.className
            .replace(/language-/, "")
            .replace("hljs", "")
            .trim();
          if (language === "mermaid") {
            return <Mermaid chart={props.children as string} />;
          }
          return (
            <TerminalCode title={language}>
              {props.children as string}
            </TerminalCode>
          );
        }
        return (
          <code className="rounded bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 text-[12px] text-foreground/90 font-mono">
            {props.children}
          </code>
        );
      },
      pre: (props: any) => <>{props.children}</>,
      img: (props: any) => (
        <figure className="my-8">
          <img
            {...props}
            className="w-full rounded border border-panel-border cursor-zoom-in"
            loading="lazy"
            onClick={() => setLightboxSrc(props.src)}
          />
          {props.alt && (
            <figcaption className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
              {props.alt}
            </figcaption>
          )}
        </figure>
      ),
      table: (props: any) => (
        <div className="my-6 overflow-x-auto rounded border border-panel-border">
          <table
            className="w-full min-w-[320px] border-collapse font-mono text-[13px]"
            {...props}
          />
        </div>
      ),
      thead: (props: any) => <thead {...props} />,
      tr: (props: any) => (
        <tr
          className="border-b border-panel-border/50 last:border-0"
          {...props}
        />
      ),
      th: (props: any) => (
        <th
          className="px-3 py-2 text-left font-semibold text-foreground border-b border-white/[0.06] bg-white/[0.03]"
          {...props}
        />
      ),
      td: (props: any) => (
        <td className="px-3 py-2 align-top text-foreground/85" {...props} />
      ),
      blockquote: (props: any) => (
        <blockquote
          className="border-l-4 border-foreground/20 pl-4 italic my-4 text-foreground/70 bg-white/[0.03] py-2 rounded-r"
          {...props}
        />
      ),
      SpoilerFlag,
      KillChain,
      SkillMatrix,
    }),
    [setLightboxSrc],
  );

  const MDXContent =
    WriteupMdxComponents[writeup.slug] ||
    (() => <div>Component not found</div>);

  // Related writeups (same platform or overlapping tags)
  const relatedWriteups = useMemo(() => {
    return writeupsMeta
      .filter(
        (w) =>
          w.slug !== writeup.slug &&
          (w.platform === writeup.platform ||
            w.tags.some((t) => writeup.tags.includes(t))),
      )
      .slice(0, 4);
  }, [writeup]);

  return (
    <CyberLayout>
      <article className="px-6 md:px-10 py-10 max-w-6xl glass-panel rounded-xl mx-4 my-6">
        <Link
          to="/writeups"
          className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> cd ../writeups
        </Link>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <div className="min-w-0">
            {/* Meta row */}
            <div className="font-mono text-[11px] flex flex-wrap items-center gap-3">
              <span className="text-muted-foreground">{writeup.date}</span>
              <span className="text-foreground/20">·</span>
              <span className={`flex items-center gap-1.5 ${config.color}`}>
                <PlatformIcon platform={writeup.platform} className="h-4 w-4" />
                {writeup.platform}
              </span>
              <span className="text-foreground/20">·</span>
              <span className="text-muted-foreground">{writeup.type}</span>
              <span className="text-foreground/20">·</span>
              <span className="text-accent-link">{writeup.readTime}</span>
            </div>

            {/* Title */}
            <h1 className="mt-3 text-2xl md:text-4xl font-semibold leading-tight text-foreground">
              {writeup.title}
            </h1>

            {/* Difficulty + OS badge row */}
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`font-mono text-[11px] px-2.5 py-1 rounded border ${difficultyBg(
                  writeup.difficulty,
                )} ${difficultyColor(writeup.difficulty)}`}
              >
                {writeup.difficulty}
              </span>
              {writeup.os && (
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  {osIcon(writeup.os)} {writeup.os}
                </span>
              )}
              {writeup.retired !== undefined && (
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                    writeup.retired
                      ? "border-foreground/10 text-muted-foreground"
                      : "border-[#9FEF00]/20 text-[#9FEF00]"
                  }`}
                >
                  {writeup.retired ? "retired" : "active"}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
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

            {/* Share */}
            <div className="mt-5">
              <ShareButtons title={writeup.title} slug={writeup.slug} />
            </div>

            {/* MDX Content */}
            <div className="mt-6">
              <Suspense
                fallback={
                  <div className="animate-pulse text-foreground/60 font-mono">
                    Loading exploit chain...
                  </div>
                }
              >
                <MDXContent components={components} />
              </Suspense>
            </div>

            {/* Share bottom */}
            <div className="mt-10">
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
                  <ol className="space-y-1 font-mono text-xs">
                    {headings.map((s) => {
                      const isActive = activeHeading === s.id;
                      return (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                              isActive
                                ? "text-foreground bg-white/[0.05]"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span>{isActive ? "▸" : "·"}</span>
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
                        {"☆".repeat(5 - Math.round(writeup.rating))}{" "}
                        {writeup.rating}
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
      <ImageLightbox
        src={lightboxSrc}
        alt="Expanded image"
        onClose={() => setLightboxSrc(null)}
      />
    </CyberLayout>
  );
}
