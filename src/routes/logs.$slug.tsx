/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CyberLayout, Panel, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";
import { TerminalCode } from "@/components/cyber/TerminalCode";
import { Mermaid } from "@/components/cyber/Mermaid";
import { getPostMeta, getPostContent, postsMeta, MdxComponents } from "@/data/posts";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ImageLightbox } from "@/components/cyber/ImageLightbox";
import { ShareButtons } from "@/components/cyber/ShareButtons";
import { AuthorBio } from "@/components/cyber/AuthorBio";
import { getRelatedPosts } from "@/lib/related-posts";
import { useArticleToc } from "@/hooks/use-article-toc";
import { useSharedMdxComponents } from "@/components/cyber/SharedMdxComponents";

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
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [
          {
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
          },
        ]
        : [],
    };
  },

  notFoundComponent: () => (
    <CyberLayout>
      <div className="p-10 font-mono text-sm text-muted-foreground">
        // post not found —{" "}
        <Link to="/logs" className="text-foreground hover:text-foreground/80 transition-colors">
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
  component: PostPage,
});

function PostPage() {
  const navigate = useNavigate();
  const { post } = Route.useLoaderData();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const { headings, activeId: activeHeading, progress } = useArticleToc("article", [2], post.slug);
  const components = useSharedMdxComponents(setLightboxSrc);

  const MDXContent = MdxComponents[post.slug] || (() => <div>Component not found</div>);

  return (
    <CyberLayout>
      <article className="px-6 md:px-10 py-10 max-w-7xl mx-auto glass-panel rounded-xl my-6 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          to="/logs"
          className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> cd ../logs
        </Link>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <div className="min-w-0">
            <div className="font-mono text-[11px] flex flex-wrap items-center gap-3">
              <span className="text-muted-foreground">{post.date}</span>
              <span className="text-foreground/20">·</span>
              <span className="text-accent-primary">{post.category?.toLowerCase()}</span>
              <span className="text-foreground/20">·</span>
              <span className="text-accent-link">{post.readTime}</span>
              {post.severity && (
                <>
                  <span className="text-foreground/20">·</span>
                  <span
                    className={
                      post.severity?.toLowerCase() === "critical"
                        ? "text-[#FF5252]"
                        : post.severity?.toLowerCase() === "high"
                          ? "text-[#FF7043]"
                          : post.severity?.toLowerCase() === "medium"
                            ? "text-[#FFD43B]"
                            : "text-[#00D4AA]"
                    }
                  >
                    severity: {post.severity?.toLowerCase()}
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-3 text-2xl md:text-4xl font-semibold leading-tight text-foreground">
              {post.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags?.map((t) => (
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

            {/* Share Buttons - Top */}
            <div className="mt-5">
              <ShareButtons title={post.title} slug={post.slug} />
            </div>

            {/* MDX Content */}
            <div className="mt-6">
              <Suspense
                fallback={
                  <div className="animate-pulse text-foreground/60 font-mono">
                    Loading core modules...
                  </div>
                }
              >
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
              // end of post —{" "}
              <Link
                to="/logs"
                className="text-foreground hover:text-foreground/80 transition-colors"
              >
                return /logs
              </Link>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6">
              {/* Reading progress bar and TOC */}
              <Panel title="table of contents">
                <div className="mb-4 h-1 w-full overflow-hidden rounded-sm bg-secondary/60">
                  <div
                    className="h-full bg-foreground/60"
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
                            className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${isActive
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

              {getRelatedPosts(post, postsMeta).length > 0 && (
                <Panel title="related" className="mt-4">
                  <ul className="space-y-2 text-xs">
                    {getRelatedPosts(post, postsMeta).map((p) => (
                      <li key={p.slug}>
                        <Link
                          to="/logs/$slug"
                          params={{ slug: p.slug }}
                          className="block text-muted-foreground hover:text-foreground transition-colors"
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
