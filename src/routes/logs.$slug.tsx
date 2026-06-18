import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CyberLayout, Panel, Tag, tagVariantFor } from "@/components/cyber/Layout";
import { TerminalCode } from "@/components/cyber/TerminalCode";
import { Mermaid } from "@/components/cyber/Mermaid";
import { getPostMeta, getPostContent, postsMeta, MdxComponents } from "@/data/posts";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ImageLightbox } from "@/components/cyber/ImageLightbox";
import { ShareButtons } from "@/components/cyber/ShareButtons";
import { AuthorBio } from "@/components/cyber/AuthorBio";
import { getRelatedPosts } from "@/lib/related-posts";

export const Route = createFileRoute("/logs/$slug")({
  loader: async ({ params }) => {
    const meta = getPostMeta(params.slug);
    if (!meta) throw notFound();
    const post = await getPostContent(params.slug);
    if (!post) throw notFound();
    return { slug: params.slug, post };
  },

  head: ({ params }) => {
    const p = getPostMeta(params.slug);
    const url = `https://asbawy.github.io/logs/${params.slug}`;
    return {
      meta: p
        ? [
            { title: `${p.title} — Asbawy Blog` },
            { name: "description", content: p.excerpt },
            { property: "og:title", content: p.title },
            { property: "og:description", content: p.excerpt },
            { property: "og:type", content: "article" },
            { property: "og:url", content: url },
            { property: "og:image", content: "https://asbawy.github.io/eye-of-ra.png" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:image", content: "https://asbawy.github.io/eye-of-ra.png" },
          ]
        : [{ title: "Asbawy Blog" }],
      links: [
        { rel: "canonical", href: url },
      ],
      scripts: p ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p.title,
          description: p.excerpt,
          datePublished: p.date,
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
          keywords: p.tags.join(", "),
        }),
      }] : [],
    };
  },

  notFoundComponent: () => (
    <CyberLayout>
      <div className="p-10 font-mono text-sm text-muted-foreground">
        // post not found — <Link to="/logs" className="text-neon-green">return to feed</Link>
      </div>
    </CyberLayout>
  ),

  errorComponent: ({ error }) => (
    <CyberLayout>
      <div className="p-10 font-mono text-sm text-threat-high">// {error.message}</div>
    </CyberLayout>
  ),
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const [progress, setProgress] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [headings, setHeadings] = useState<{ id: string; title: string }[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>("");

  useEffect(() => {
    const extractHeadings = () => {
      const h2s = Array.from(document.querySelectorAll("article h2"));
      const extracted = h2s.map(h => ({
        id: h.id,
        title: h.textContent?.replace('▸', '').trim() || ""
      })).filter(h => h.id);
      
      setHeadings(prev => {
        if (prev.length !== extracted.length) return extracted;
        // Simple comparison to prevent infinite re-renders
        const isSame = prev.every((p, i) => p.id === extracted[i]?.id);
        return isSame ? prev : extracted;
      });
    };

    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(Math.min(100, Math.max(0, (scrolled / Math.max(1, max)) * 100)));

      let current = "";
      const h2s = Array.from(document.querySelectorAll("article h2"));
      for (const h2 of h2s) {
        if (h2.getBoundingClientRect().top <= 120) {
          current = h2.id;
        }
      }
      if (!current && h2s.length > 0) current = h2s[0].id;
      setActiveHeading(current);
    };

    const observer = new MutationObserver(() => {
      extractHeadings();
      onScroll();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    extractHeadings();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const components = useMemo(() => ({
    h1: (props: any) => <h1 className="mt-8 mb-4 text-2xl md:text-3xl font-semibold text-foreground" {...props} />,
    h2: (props: any) => (
      <h2
        className="scroll-mt-24 mt-10 mb-4 font-mono text-lg text-foreground border-l-2 border-neon-green pl-3"
        {...props}
      >
        <span className="text-neon-green mr-2">▸</span>
        {props.children}
      </h2>
    ),
    h3: (props: any) => <h3 className="mt-8 mb-3 font-mono text-base text-foreground/90" {...props} />,
    h4: (props: any) => <h4 className="mt-6 mb-2 font-mono text-sm text-neon-green" {...props} />,
    p: (props: any) => <p className="my-4 text-[15px] leading-7 text-foreground/85" {...props} />,
    ul: (props: any) => <ul className="my-4 space-y-2 text-[15px] leading-7 text-foreground/85 list-disc ml-5" {...props} />,
    ol: (props: any) => <ol className="my-4 space-y-2 text-[15px] leading-7 text-foreground/85 list-decimal ml-5" {...props} />,
    li: (props: any) => <li className="marker:text-neon-green" {...props} />,
    hr: (props: any) => <hr className="my-8 border-panel-border" {...props} />,
    a: (props: any) => (
      <a className="text-neon-green hover:text-glow-green underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    strong: (props: any) => <strong className="font-semibold text-foreground" {...props} />,
    code: (props: any) => {
      if (props.className) {
        const language = props.className.replace(/language-/, '');
        if (language === 'mermaid') {
          return <Mermaid chart={props.children as string} />;
        }
        return <TerminalCode title={language}>{props.children as string}</TerminalCode>;
      }
      return (
        <code className="rounded bg-panel/80 border border-panel-border px-1.5 py-0.5 text-[12px] text-neon-green font-mono">
          {props.children}
        </code>
      );
    },
    pre: (props: any) => <>{props.children}</>, // The internal code element renders TerminalCode
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
        <table className="w-full min-w-[320px] border-collapse font-mono text-[13px]" {...props} />
      </div>
    ),
    thead: (props: any) => <thead {...props} />,
    tr: (props: any) => <tr className="border-b border-panel-border/50 last:border-0" {...props} />,
    th: (props: any) => <th className="px-3 py-2 text-left font-semibold text-neon-green border-b border-panel-border bg-panel/50" {...props} />,
    td: (props: any) => <td className="px-3 py-2 align-top text-foreground/85" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-neon-green pl-4 italic my-4 text-foreground/70 bg-panel/30 py-2 rounded-r" {...props} />
    ),
  }), [setLightboxSrc]);

  const MDXContent = MdxComponents[post.slug] || (() => <div>Component not found</div>);

  return (
    <CyberLayout>
      <article className="px-6 md:px-10 py-10 max-w-6xl bg-background/95 rounded-xl mx-4 my-6 border border-panel-border/30">
        <Link
          to="/logs"
          className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground hover:text-neon-green"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> cd ../logs
        </Link>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <div className="min-w-0">
            <div className="font-mono text-[11px] text-muted-foreground flex flex-wrap items-center gap-3">
              <span>{post.date}</span>
              <span>·</span>
              <span className="text-neon-green">{post.category?.toLowerCase()}</span>
              <span>·</span>
              <span>{post.readTime}</span>
              <span>·</span>
              <span
                className={
                  post.severity === "Critical" ? "text-threat-high" :
                  post.severity === "High" ? "text-threat-mid" :
                  post.severity === "Medium" ? "text-neon-green" :
                  "text-neon-green"
                }
              >
                severity: {post.severity?.toLowerCase()}
              </span>
            </div>

            <h1 className="mt-3 text-2xl md:text-4xl font-semibold leading-tight text-foreground">
              {post.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags?.map((t) => (
                <Tag key={t} variant={tagVariantFor(t)}>{t}</Tag>
              ))}
            </div>

            {/* Share Buttons - Top */}
            <div className="mt-5">
              <ShareButtons title={post.title} slug={post.slug} />
            </div>
            
            {/* MDX Content */}
            <div className="mt-6">
              <Suspense fallback={<div className="animate-pulse text-neon-green font-mono">Loading core modules...</div>}>
                <MDXContent components={components} />
              </Suspense>
            </div>

            {/* Share Buttons - Bottom */}
            <div className="mt-10">
              <ShareButtons title={post.title} slug={post.slug} />
            </div>

            {/* Author Bio */}
            <AuthorBio />

            <div className="mt-10 border-t border-panel-border pt-6 font-mono text-[11px] text-muted-foreground">
              // end of post — <Link to="/logs" className="text-neon-green">return /logs</Link>
            </div>
          </div>
          
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              {/* Reading progress bar and TOC */}
              <Panel title="table of contents">
                <div className="mb-4 h-1 w-full overflow-hidden rounded-sm bg-secondary/60">
                  <div
                    className="h-full bg-neon-green"
                    style={{ width: `${progress}%`, boxShadow: "0 0 10px currentColor" }}
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
                                ? "text-neon-green text-glow-green bg-neon-green/5"
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
              
              {getRelatedPosts(post, postsMeta).length > 0 && (
                <Panel title="related" className="mt-4">
                  <ul className="space-y-2 text-xs">
                    {getRelatedPosts(post, postsMeta).map((p) => (
                      <li key={p.slug}>
                        <Link
                          to="/logs/$slug"
                          params={{ slug: p.slug }}
                          className="block text-muted-foreground hover:text-neon-green"
                        >
                          → {p.title}
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

