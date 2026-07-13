/* eslint-disable @typescript-eslint/no-explicit-any, no-empty */
import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { Suspense, useMemo, useEffect } from "react";
import { FileText, ChevronRight } from "lucide-react";
import { cheatsheetFiles, CheatsheetMdxComponents } from "@/data/cheatsheets";
import { TerminalCode } from "@/components/cyber/TerminalCode";
import { useArticleToc } from "@/hooks/use-article-toc";
import { getRelatedCheatsheets } from "@/lib/related-cheatsheets";
import { Panel, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";

export const Route = createFileRoute("/cheatsheet/$")({
  loader: async ({ params }) => {
    const slug = params._splat;
    const meta = cheatsheetFiles.find((c) => c.path === slug);
    if (!meta) throw notFound();
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
            datePublished: meta.date,
            dateModified: meta.updated || meta.date,
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
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground font-mono opacity-50 p-8">
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

  const components = useMemo(
    () => ({
      h1: (props: any) => (
        <h1
          className="mt-6 mb-4 text-2xl md:text-3xl font-bold text-foreground font-mono"
          {...props}
        />
      ),
      h2: (props: any) => {
        const generatedId =
          typeof props.children === "string"
            ? props.children
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")
            : undefined;
        return (
          <h2
            id={props.id || generatedId}
            className="scroll-mt-24 mt-10 mb-4 font-mono text-lg text-foreground border-l-2 border-foreground pl-3"
            {...props}
          >
            <span className="text-foreground mr-2">▸</span>
            {props.children}
          </h2>
        );
      },
      h3: (props: any) => {
        const generatedId =
          typeof props.children === "string"
            ? props.children
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")
            : undefined;
        return (
          <h3
            id={props.id || generatedId}
            className="scroll-mt-24 mt-8 mb-3 font-mono text-base text-foreground/90 pl-1"
            {...props}
          />
        );
      },
      p: (props: any) => <p className="my-4 text-[15px] leading-7 text-foreground/85" {...props} />,
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
      li: (props: any) => <li className="marker:text-foreground" {...props} />,
      a: (props: any) => {
        const isExternal = typeof props.href === "string" && props.href.startsWith("http");
        return (
          <a
            className="text-foreground hover:brightness-125 underline underline-offset-2 transition-all"
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            {...props}
          />
        );
      },
      code: (props: any) => {
        if (props.className) {
          const language = props.className.replace(/language-/, "").replace("hljs", "").trim();
          return <TerminalCode title={language}>{props.children as string}</TerminalCode>;
        }
        return (
          <code className="rounded bg-muted/50 border border-white/[0.06] px-1.5 py-0.5 text-[12px] text-foreground font-mono">
            {props.children}
          </code>
        );
      },
      pre: (props: any) => <>{props.children}</>,
      table: (props: any) => (
        <div className="my-6 overflow-x-auto rounded border border-white/[0.06]">
          <table
            className="w-full min-w-[320px] border-collapse font-mono text-[13px]"
            {...props}
          />
        </div>
      ),
      thead: (props: any) => <thead {...props} />,
      tr: (props: any) => (
        <tr className="border-b border-white/[0.06]/50 last:border-0" {...props} />
      ),
      th: (props: any) => (
        <th
          className="px-3 py-2 text-left font-semibold text-foreground border-b border-white/[0.06] bg-white/[0.03]"
          {...props}
        />
      ),
      td: (props: any) => <td className="px-3 py-2 align-top text-foreground/85" {...props} />,
      blockquote: (props: any) => (
        <blockquote
          className="border-l-4 border-foreground pl-4 italic my-4 text-foreground/70 bg-white/[0.03] py-3 px-1 rounded-r"
          {...props}
        />
      ),
      Callout: ({ type, children }: any) => {
        const isDanger = type === "danger" || type === "warning";
        return (
          <div
            className={`my-4 border-l-4 p-4 rounded-r text-[14px] ${isDanger ? "border-threat-high bg-threat-high/10 text-foreground" : "border-foreground bg-foreground/5 text-foreground"}`}
          >
            {children}
          </div>
        );
      },
      CodeBlock: ({ language, title, children }: any) => {
        return (
          <div className="my-6">
            {title && (
              <div className="text-foreground font-mono text-xs mb-1 uppercase opacity-80">
                {title}
              </div>
            )}
            <TerminalCode title={language}>{children}</TerminalCode>
          </div>
        );
      },
      Tabs: ({ children }: any) => {
        return (
          <div className="my-6 border border-white/[0.06] bg-white/[0.03] rounded-md p-4 space-y-6">
            {children}
          </div>
        );
      },
      Tab: ({ label, children }: any) => {
        return (
          <div>
            <div className="text-foreground font-mono text-xs uppercase mb-3 pb-1 border-b border-white/[0.06]/50 inline-block">
              {label}
            </div>
            {children}
          </div>
        );
      },
    }),
    [],
  );

  return (
    <div className="h-full flex flex-col">
      {/* File tab bar */}
      <div className="shrink-0 border-b border-white/[0.06] bg-white/[0.03]">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1 px-4 py-2 font-mono text-[11px] text-muted-foreground">
          <span className="text-foreground">~</span>
          {breadcrumbs.map((segment, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <span className={i === breadcrumbs.length - 1 ? "text-foreground" : ""}>
                {i === breadcrumbs.length - 1 ? `${segment}.mdx` : segment}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Content layout with right rail */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-10 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
            {/* Main content pane */}
            <div className="min-w-0 bg-background/95 rounded-xl border border-white/[0.06]/30 p-6 md:p-8">
              {/* Title and metadata */}
              {meta.title && (
                <div className="mb-6 pb-4 border-b border-white/[0.06]/30">
                  <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground mb-3">
                    {meta.title}
                  </h1>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] text-muted-foreground mb-3">
                    {meta.date && <span>created: {meta.date}</span>}
                    {meta.date && meta.updated && <span>·</span>}
                    {meta.updated && (
                      <span className="text-foreground">verified: {meta.updated}</span>
                    )}
                    {(meta.date || meta.updated) && meta.category && <span>·</span>}
                    {meta.category && (
                      <span className="text-foreground">{meta.category.toLowerCase()}</span>
                    )}
                    {meta.category && meta.readTime && <span>·</span>}
                    {meta.readTime && <span>{meta.readTime}</span>}
                    {meta.readTime && meta.difficulty && <span>·</span>}
                    {meta.difficulty && (
                      <span
                        className={
                          meta.difficulty === "Advanced"
                            ? "text-threat-high"
                            : meta.difficulty === "Intermediate"
                              ? "text-threat-mid"
                              : "text-foreground"
                        }
                      >
                        diff: {meta.difficulty.toLowerCase()}
                      </span>
                    )}
                  </div>

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

                  {meta.excerpt && (
                    <p className="mt-4 text-xs text-muted-foreground/80 leading-relaxed font-mono italic">
                      // {meta.excerpt}
                    </p>
                  )}
                </div>
              )}

              {/* MDX Content wrapper */}
              <div id="cheatsheet-article" className="prose prose-invert max-w-none">
                <Suspense
                  fallback={
                    <div className="flex items-center gap-2 animate-pulse text-foreground font-mono text-sm py-8">
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
                <div className="mt-12 pt-6 border-t border-white/[0.06]/30 flex items-center justify-between font-mono text-xs gap-4 prev-next-container">
                  {prevItem ? (
                    <Link
                      to="/cheatsheet/$"
                      params={{ _splat: prevItem.path }}
                      className="group flex flex-col items-start gap-1 p-3 rounded-md glass-panel glass-panel-hover transition-all text-muted-foreground hover:text-foreground max-w-[45%]"
                    >
                      <span className="text-[10px] text-muted-foreground/60 uppercase">
                        ← previous
                      </span>
                      <span className="truncate font-semibold text-foreground group-hover:text-foreground">
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
                      className="group flex flex-col items-end gap-1 p-3 rounded-md glass-panel glass-panel-hover transition-all text-muted-foreground hover:text-foreground max-w-[45%] text-right"
                    >
                      <span className="text-[10px] text-muted-foreground/60 uppercase">next →</span>
                      <span className="truncate font-semibold text-foreground group-hover:text-foreground">
                        {nextItem.meta.title || nextItem.path.split("/").pop()}
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              )}
            </div>

            {/* Sticky right rail (TOC / Related) */}
            <aside className="hidden lg:block">
              <div className="sticky top-6 space-y-4">
                {/* Reading progress bar and TOC */}
                <Panel title="table of contents">
                  <div className="mb-4 h-1 w-full overflow-hidden rounded-sm bg-secondary/60">
                    <div
                      className="h-full bg-foreground"
                      style={{ width: `${progress}%`, boxShadow: "0 0 10px currentColor" }}
                    />
                  </div>

                  {headings.length > 0 ? (
                    <ol className="space-y-1 font-mono text-xs">
                      {headings.map((s) => {
                        const isActive = activeId === s.id;
                        const isH3 = s.level === 3;
                        return (
                          <li key={s.id} className={isH3 ? "pl-3.5" : ""}>
                            <a
                              href={`#${s.id}`}
                              className={`flex items-center gap-1.5 rounded px-2 py-1 transition-colors ${
                                isActive
                                  ? "text-foreground  bg-foreground/5 font-semibold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <span className="shrink-0">{isActive ? "▸" : "·"}</span>
                              <span className="truncate">{s.title}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <span className="font-mono text-[10px] text-muted-foreground/50 italic">
                      // no sections found
                    </span>
                  )}
                </Panel>

                {/* Related Cheatsheets panel */}
                {related.length > 0 && (
                  <Panel title="related">
                    <ul className="space-y-2 text-xs font-mono">
                      {related.map((p) => (
                        <li key={p.path}>
                          <Link
                            to="/cheatsheet/$"
                            params={{ _splat: p.path }}
                            className="block text-muted-foreground hover:text-foreground truncate"
                          >
                            → {p.meta.title || p.path.split("/").pop()}
                          </Link>
                        </li>
                      ))}
                    </ul>
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
