/* eslint-disable @typescript-eslint/no-explicit-any, no-empty */
import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { Suspense, useMemo, useEffect, useState } from "react";
import {
  FileText,
  ChevronRight,
  Copy,
  Check,
  ArrowLeft,
  ArrowUp,
  Terminal,
  Shield,
  Clock,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useSharedMdxComponents } from "@/components/cyber/SharedMdxComponents";
import { cheatsheetFiles, CheatsheetMdxComponents } from "@/data/cheatsheets";
import { useArticleToc } from "@/hooks/use-article-toc";
import { TableOfContents } from "@/components/cyber/TableOfContents";
import { getRelatedCheatsheets } from "@/lib/related-cheatsheets";
import { Panel, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";

export const Route = createFileRoute("/cheatsheet/$")({
  loader: async ({ params }) => {
    const slug = params._splat || "";
    const meta = cheatsheetFiles.find((c) => c.path === slug);
    if (!meta || !slug) throw notFound();
    return { slug, meta: meta.meta };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { title: "Cheatsheet Explorer" };
    const { slug, meta } = loaderData;
    const url = `https://asbawy.github.io/cheatsheet/${slug}`;
    const ogImage = "https://asbawy.github.io/eye-of-ra.png";

    const titleStr = meta.title ? `${meta.title} — Cheatsheet Explorer` : "Cheatsheet Explorer";
    const descStr = meta.excerpt || `Cheat sheet for ${meta.title || slug}`;

    return {
      meta: [
        { title: titleStr },
        { name: "description", content: descStr },
        { property: "og:title", content: meta.title || "Cheatsheet Explorer" },
        { property: "og:description", content: descStr },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: meta.title || "Cheatsheet Explorer" },
        { name: "twitter:description", content: descStr },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: meta.title || "Cheatsheet Explorer",
            description: descStr,
            datePublished: meta.date || "2026-01-01",
            dateModified: meta.updated || meta.date || "2026-01-01",
            author: {
              "@type": "Person",
              name: "Asbawy",
              url: "https://asbawy.github.io/about",
            },
            publisher: {
              "@type": "Person",
              name: "Asbawy",
              url: "https://asbawy.github.io",
            },
            dependencies: meta.tags?.join(", ") || "",
            proficiencyLevel: meta.difficulty || "Intermediate",
            inLanguage: "en",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": url,
            },
          }),
        },
      ],
    };
  },
  component: CheatsheetViewer,
  notFoundComponent: () => (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground font-sans opacity-50 p-8">
      <FileText className="h-12 w-12 mb-4" />
      <p className="text-sm">File not found.</p>
      <p className="text-xs mt-1 text-muted-foreground/60">Check the path and try again.</p>
    </div>
  ),
});

function CheatsheetViewer() {
  const navigate = useNavigate();
  const { slug, meta } = Route.useLoaderData();
  const MDXContent = CheatsheetMdxComponents[slug] || (() => <div>Component not found</div>);

  const breadcrumbs = slug.split("/");

  // TOC Heading scroll extraction
  const { headings, activeId, progress } = useArticleToc("#cheatsheet-article", [2, 3], slug);

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJumpToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Save to recently viewed list on mount / change
  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem("cheatsheet_recent");
      let items: { path: string; title: string }[] = stored ? JSON.parse(stored) : [];
      items = items.filter((item) => item.path !== slug);
      items.unshift({ path: slug, title: meta.title || slug.split("/").pop() || "" });
      items = items.slice(0, 4);
      localStorage.setItem("cheatsheet_recent", JSON.stringify(items));
      window.dispatchEvent(new Event("cheatsheet_recent_updated"));
    } catch (e) {}
  }, [slug, meta.title]);

  // Related cheatsheets list
  const related = useMemo(() => {
    const currentEntry = { path: slug, meta };
    return getRelatedCheatsheets(currentEntry, cheatsheetFiles, 3);
  }, [slug, meta]);

  // Sibling sequential cheatsheets (prev/next)
  const { prevItem, nextItem } = useMemo(() => {
    const currentFolder = slug.split("/").slice(0, -1).join("/");
    const siblingSheets = cheatsheetFiles
      .filter((file) => {
        const fileFolder = file.path.split("/").slice(0, -1).join("/");
        return fileFolder === currentFolder;
      })
      .sort((a, b) => a.path.localeCompare(b.path));

    const idx = siblingSheets.findIndex((file) => file.path === slug);
    return {
      prevItem: idx > 0 ? siblingSheets[idx - 1] : null,
      nextItem: idx < siblingSheets.length - 1 ? siblingSheets[idx + 1] : null,
    };
  }, [slug]);

  const components = useSharedMdxComponents();
  const diff = meta.difficulty || "Intermediate";
  const isAdvanced = diff === "Advanced";
  const isBeginner = diff === "Beginner";

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Sticky Action Top Bar + Breadcrumbs */}
      <div className="sticky top-0 z-40 border-b border-white/[0.08] bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 md:px-8 py-2.5 font-sans text-xs">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <span className="text-foreground font-bold">~</span>
            {breadcrumbs.map((segment, i) => (
              <span key={i} className="flex items-center gap-1.5 truncate">
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                <span
                  className={i === breadcrumbs.length - 1 ? "text-foreground font-semibold" : ""}
                >
                  {i === breadcrumbs.length - 1 ? `${segment}.mdx` : segment}
                </span>
              </span>
            ))}
          </div>

          {/* Right: Quick Action Bar */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/cheatsheet"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-foreground transition-all duration-150"
              title="Return to Directory"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">DIRECTORY</span>
            </Link>

            <button
              onClick={handleCopyLink}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all duration-150 cursor-pointer
                ${
                  copied
                    ? "bg-accent-primary/20 text-accent-primary border-accent-primary/40 font-bold"
                    : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-foreground"
                }
              `}
              title="Copy URL"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">SHARE</span>
                </>
              )}
            </button>

            <button
              onClick={handleScrollToTop}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-foreground transition-all duration-150 cursor-pointer"
              title="Scroll to Top"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">TOP</span>
            </button>
          </div>
        </div>

        {/* Reading Progress Line along bottom edge */}
        <div className="h-[2px] w-full bg-white/[0.05] overflow-hidden">
          <div
            className="h-full bg-accent-primary transition-all duration-150 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content layout with right rail */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-10 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-8">
            {/* Main content pane */}
            <div className="min-w-0 bg-background/95 rounded-xl border border-white/[0.08] p-6 md:p-8 shadow-xl">
              {/* Title and metadata banner */}
              {meta.title && (
                <div className="mb-8 pb-6 border-b border-white/[0.08]">
                  {/* Badge Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 font-sans text-xs mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-accent-primary/15 text-accent-primary border border-accent-primary/30 px-2.5 py-0.5 rounded text-[11px] font-bold">
                        {meta.category || "General"}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span
                        className={`flex items-center gap-1.5 font-bold ${
                          isAdvanced
                            ? "text-threat-high"
                            : isBeginner
                              ? "text-accent-primary"
                              : "text-yellow-400"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {diff.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      {meta.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground/60" />
                          {meta.readTime}
                        </span>
                      )}
                      {(meta.date || meta.updated) && (
                        <span>verified: {meta.updated || meta.date}</span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="font-sans text-3xl md:text-4xl font-black text-foreground mb-3 tracking-tight">
                    {meta.title}
                  </h1>

                  {/* Excerpt */}
                  {meta.excerpt && (
                    <p className="text-sm md:text-base text-muted-foreground/90 leading-relaxed font-sans mb-5">
                      {meta.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  {meta.tags && meta.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {meta.tags.map((tag: string) => (
                        <Tag
                          key={tag}
                          variant={tagVariantFor(tag)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTagClick(tag, navigate);
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MDX Content wrapper */}
              <div id="cheatsheet-article" className="prose prose-invert max-w-none">
                <Suspense
                  fallback={
                    <div className="flex items-center gap-2 animate-pulse text-foreground font-sans text-sm py-8">
                      <span className="inline-block w-2 h-4 bg-foreground/80 animate-pulse" />
                      Reading sector...
                    </div>
                  }
                >
                  <MDXContent components={components} />
                </Suspense>
              </div>

              {/* Sequential Prev/Next Navigation */}
              {(prevItem || nextItem) && (
                <div className="mt-14 pt-8 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                  {prevItem ? (
                    <Link
                      to="/cheatsheet/$"
                      params={{ _splat: prevItem.path }}
                      className="group cheatsheet-card-hover flex flex-col items-start justify-between gap-2 p-4 rounded-lg glass-panel border border-white/[0.08] transition-all text-muted-foreground hover:text-foreground"
                    >
                      <span className="text-[10px] text-accent-primary uppercase font-bold flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        PREV_MODULE
                      </span>
                      <span className="font-bold text-sm text-foreground group-hover:text-accent-primary transition-colors">
                        {prevItem.meta.title || prevItem.path.split("/").pop()}
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextItem ? (
                    <Link
                      to="/cheatsheet/$"
                      params={{ _splat: nextItem.path }}
                      className="group cheatsheet-card-hover flex flex-col items-end justify-between gap-2 p-4 rounded-lg glass-panel border border-white/[0.08] transition-all text-muted-foreground hover:text-foreground text-right"
                    >
                      <span className="text-[10px] text-accent-primary uppercase font-bold flex items-center gap-1">
                        NEXT_MODULE
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="font-bold text-sm text-foreground group-hover:text-accent-primary transition-colors">
                        {nextItem.meta.title || nextItem.path.split("/").pop()}
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              )}

              {/* Bottom Related Reference Modules Grid */}
              {related.length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/[0.08]">
                  <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                    <BookOpen className="w-3.5 h-3.5 text-accent-primary" />
                    <span>RELATED REFERENCE MODULES</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {related.map((p) => (
                      <Link
                        key={p.path}
                        to="/cheatsheet/$"
                        params={{ _splat: p.path }}
                        className="group cheatsheet-card-hover rounded-lg glass-panel p-4 border border-white/[0.08] flex flex-col justify-between"
                      >
                        <div>
                          <span className="font-sans text-[10px] text-accent-primary uppercase font-bold">
                            {p.meta.category || "General"}
                          </span>
                          <h4 className="mt-1 font-sans text-sm font-bold text-foreground group-hover:text-accent-primary transition-colors line-clamp-1">
                            {p.meta.title || p.path.split("/").pop()}
                          </h4>
                          {p.meta.excerpt && (
                            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                              {p.meta.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-end font-sans text-[10px] text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          LOAD →
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky right rail (TOC / Related) */}
            <aside className="hidden lg:block">
              <div className="sticky top-16 space-y-5">
                {/* TOC Panel */}
                <div className="glass-panel p-4 rounded-xl border border-white/[0.08] shadow-[0_0_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
                  <TableOfContents headings={headings} activeId={activeId} progress={progress} />
                </div>

                {/* Related Cheatsheets Sidebar Cards */}
                {related.length > 0 && (
                  <Panel title="related modules">
                    <div className="space-y-2.5 font-sans text-xs">
                      {related.map((p) => (
                        <Link
                          key={p.path}
                          to="/cheatsheet/$"
                          params={{ _splat: p.path }}
                          className="group block rounded-md bg-white/[0.02] border border-white/[0.06] hover:border-accent-primary/30 p-3 transition-all"
                        >
                          <div className="flex items-center justify-between text-[10px] text-accent-primary mb-1">
                            <span>{p.meta.category || "General"}</span>
                            <span className="text-muted-foreground">→</span>
                          </div>
                          <span className="font-bold text-foreground group-hover:text-accent-primary transition-colors block truncate">
                            {p.meta.title || p.path.split("/").pop()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </Panel>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
