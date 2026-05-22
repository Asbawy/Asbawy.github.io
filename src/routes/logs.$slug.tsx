

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CyberLayout, Panel, Tag, tagVariantFor } from "@/components/cyber/Layout";
import { TerminalCode } from "@/components/cyber/TerminalCode";
import { getPost, posts, type Post } from "@/data/posts";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/logs/$slug")({

  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post: post as Post };
  },


  head: ({ loaderData }) => {
    const p = loaderData?.post;
    return {
      meta: p
        ? [
            { title: `${p.title} — Asbawy Blog` },
            { name: "description", content: p.excerpt },
            { property: "og:title", content: p.title },
            { property: "og:description", content: p.excerpt },
          ]
        : [{ title: "Asbawy Blog" }],
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


function renderContent(md: string, sectionIds: string[]) {
  const lines = md.trim().split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let headingIdx = -1;


  const renderInline = (s: string) =>
    s.split(/(`[^`]+`)/g).map((chunk, idx) =>
      chunk.startsWith("`") && chunk.endsWith("`") ? (
        <code
          key={idx}
          className="rounded bg-panel/80 border border-panel-border px-1.5 py-0.5 text-[12px] text-neon-green font-mono"
        >
          {chunk.slice(1, -1)}
        </code>
      ) : (
        <span key={idx}>{chunk}</span>
      ),
    );

  while (i < lines.length) {
    const line = lines[i];


    if (line.startsWith("## ")) {
      headingIdx++;
      const id = sectionIds[headingIdx] ?? `h-${headingIdx}`;
      out.push(
        <h2
          key={`h-${i}`}
          id={id}
          className="scroll-mt-24 mt-10 mb-4 font-mono text-lg text-foreground border-l-2 border-neon-green pl-3"
        >
          <span className="text-neon-green mr-2">▸</span>
          {line.replace("## ", "")}
        </h2>,
      );
      i++;


    } else if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "bash";
      i++;
      const buf: string[] = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      out.push(
        <TerminalCode key={`c-${i}`} title={lang}>
          {buf.join("\n")}
        </TerminalCode>,
      );


    } else if (line.trim() === "") {
      i++;


    } else {
      const buf: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("##") && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      out.push(
        <p key={`p-${i}`} className="my-4 text-[15px] leading-7 text-foreground/85">
          {renderInline(buf.join(" "))}
        </p>,
      );
    }
  }
  return out;
}


function PostPage() {
  const { post } = Route.useLoaderData() as { post: Post };
  const sectionIds = useMemo(() => post.sections.map((s) => s.id), [post]);
  const [active, setActive] = useState(sectionIds[0]);
  const [progress, setProgress] = useState(0);


  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(Math.min(100, Math.max(0, (scrolled / Math.max(1, max)) * 100)));

      // Determine which section heading is currently in view
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds]);

  return (
    <CyberLayout>
      <article className="px-6 md:px-10 py-10 max-w-6xl">

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
              <span className="text-neon-blue">{post.category.toLowerCase()}</span>
              <span>·</span>
              <span>{post.readTime}</span>
              <span>·</span>
              <span
                className={
                  post.severity === "Critical" ? "text-threat-high" :
                  post.severity === "High" ? "text-threat-mid" :
                  post.severity === "Medium" ? "text-neon-blue" :
                  "text-neon-green"
                }
              >
                severity: {post.severity.toLowerCase()}
              </span>
            </div>


            <h1 className="mt-3 text-2xl md:text-4xl font-semibold leading-tight text-foreground">
              {post.title}
            </h1>


            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <Tag key={t} variant={tagVariantFor(t)}>{t}</Tag>
              ))}
            </div>


            <div className="mt-2">{renderContent(post.content, sectionIds)}</div>


            <div className="mt-16 border-t border-panel-border pt-6 font-mono text-[11px] text-muted-foreground">
              // end of post — <Link to="/logs" className="text-neon-green">return /logs</Link>
            </div>
          </div>


          <aside className="hidden lg:block">
            <div className="sticky top-6">

              <Panel title="table of contents">

                <div className="mb-3 h-1 w-full overflow-hidden rounded-sm bg-secondary/60">
                  <div
                    className="h-full bg-neon-green"
                    style={{ width: `${progress}%`, boxShadow: "0 0 10px currentColor" }}
                  />
                </div>

                <ol className="space-y-1 font-mono text-xs">
                  {post.sections.map((s) => {
                    const isActive = active === s.id;
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
              </Panel>


              {posts.filter((p) => p.slug !== post.slug).length > 0 && (
                <Panel title="related" className="mt-4">
                  <ul className="space-y-2 text-xs">
                    {posts.filter((p) => p.slug !== post.slug).slice(0, 3).map((p) => (
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
    </CyberLayout>
  );
}