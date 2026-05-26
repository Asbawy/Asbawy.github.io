import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CyberLayout, Panel, Tag, tagVariantFor } from "@/components/cyber/Layout";
import { TerminalCode } from "@/components/cyber/TerminalCode";
import { getPost, posts } from "@/data/posts";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/logs/$slug")({
  loader: ({ params }) => {
    if (!getPost(params.slug)) throw notFound();
    // Slug only — avoid serializing full post content into hydration JSON
    return { slug: params.slug };
  },

  head: ({ params }) => {
    const p = getPost(params.slug);
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

function parseTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isTableLine(line: string): boolean {
  return line.trim().startsWith("|");
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function isListLine(line: string): boolean {
  return /^- (?:\[ \] )?.+/.test(line);
}

function isHrLine(line: string): boolean {
  return line.trim() === "---";
}

function renderContent(md: string, sectionIds: string[]) {
  const lines = md.trim().split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let headingIdx = -1;

  const linkClassName =
    "text-neon-blue hover:text-glow-blue underline underline-offset-2 transition-colors";

  const renderInline = (s: string) => {
    const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s<>)]+)/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = pattern.exec(s)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(<span key={key++}>{s.slice(lastIndex, match.index)}</span>);
      }

      const chunk = match[0];
      if (chunk.startsWith("`") && chunk.endsWith("`")) {
        nodes.push(
          <code
            key={key++}
            className="rounded bg-panel/80 border border-panel-border px-1.5 py-0.5 text-[12px] text-neon-green font-mono"
          >
            {chunk.slice(1, -1)}
          </code>,
        );
      } else if (chunk.startsWith("**") && chunk.endsWith("**")) {
        nodes.push(
          <strong key={key++} className="font-semibold text-foreground">
            {chunk.slice(2, -2)}
          </strong>,
        );
      } else if (match[2] && match[3]) {
        nodes.push(
          <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            {match[2]}
          </a>,
        );
      } else if (chunk.startsWith("http://") || chunk.startsWith("https://")) {
        nodes.push(
          <a key={key++} href={chunk} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            {chunk}
          </a>,
        );
      } else {
        nodes.push(<span key={key++}>{chunk}</span>);
      }

      lastIndex = match.index + chunk.length;
    }

    if (lastIndex < s.length) {
      nodes.push(<span key={key++}>{s.slice(lastIndex)}</span>);
    }

    return nodes.length > 0 ? nodes : [<span key={0}>{s}</span>];
  };

  while (i < lines.length) {
    const line = lines[i];

    /* ── Image (![alt](url)) ───────────────────────────────────── */
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imgMatch) {
      const [, alt, src] = imgMatch;
      out.push(
        <figure key={`img-${i}`} className="my-8">
          <img
            src={src}
            alt={alt || ""}
            className="w-full rounded border border-panel-border"
            loading="lazy"
          />
          {alt ? (
            <figcaption className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
              {alt}
            </figcaption>
          ) : null}
        </figure>,
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      out.push(
        <h3 key={`h3-${i}`} className="mt-8 mb-3 font-mono text-base text-foreground/90">
          {line.replace("### ", "")}
        </h3>,
      );
      i++;
      continue;
    }

    if (line.startsWith("#### ")) {
      out.push(
        <h4 key={`h4-${i}`} className="mt-6 mb-2 font-mono text-sm text-neon-blue">
          {line.replace("#### ", "")}
        </h4>,
      );
      i++;
      continue;
    }

    if (isTableLine(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines
        .filter((tl) => !isTableSeparator(tl))
        .map(parseTableCells)
        .filter((r) => r.length > 0);
      if (rows.length > 0) {
        const [header, ...body] = rows;
        out.push(
          <div key={`tbl-${i}`} className="my-6 overflow-x-auto rounded border border-panel-border">
            <table className="w-full min-w-[320px] border-collapse font-mono text-[13px]">
              <thead>
                <tr className="border-b border-panel-border bg-panel/50">
                  {header.map((cell, ci) => (
                    <th
                      key={ci}
                      className="px-3 py-2 text-left font-semibold text-neon-green"
                    >
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="border-b border-panel-border/50 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 align-top text-foreground/85">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }

    if (isListLine(line)) {
      const items: { text: string; checkbox: boolean }[] = [];
      while (i < lines.length && isListLine(lines[i])) {
        const chk = lines[i].match(/^- \[ \] (.+)$/);
        const bullet = lines[i].match(/^- (.+)$/);
        if (chk) items.push({ text: chk[1], checkbox: true });
        else if (bullet) items.push({ text: bullet[1], checkbox: false });
        i++;
      }
      const hasCheckbox = items.some((it) => it.checkbox);
      out.push(
        <ul
          key={`ul-${i}`}
          className={`my-4 space-y-2 text-[15px] leading-7 text-foreground/85 ${
            hasCheckbox ? "list-none ml-0" : "list-disc ml-5"
          }`}
        >
          {items.map((it, li) => (
            <li key={li} className={it.checkbox ? "flex items-start gap-2" : undefined}>
              {it.checkbox ? (
                <span className="shrink-0 font-mono text-[12px] text-neon-green">[ ]</span>
              ) : null}
              <span>{renderInline(it.text)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (isHrLine(line)) {
      out.push(<hr key={`hr-${i}`} className="my-8 border-panel-border" />);
      i++;
      continue;
    }

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
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !lines[i].startsWith("##") &&
        !lines[i].startsWith("###") &&
        !lines[i].startsWith("####") &&
        !lines[i].startsWith("```") &&
        !isTableLine(lines[i]) &&
        !isListLine(lines[i]) &&
        !isHrLine(lines[i]) &&
        !/^!\[[^\]]*\]\([^)]+\)\s*$/.test(lines[i])
      ) {
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
  const { slug } = Route.useLoaderData();
  const post = getPost(slug);
  if (!post) throw notFound();
  const sectionIds = useMemo(() => post.sections.map((s) => s.id), [post]);
  const [active, setActive] = useState(sectionIds[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(Math.min(100, Math.max(0, (scrolled / Math.max(1, max)) * 100)));

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
              {/* Reading progress bar + section links */}
              <Panel title="table of contents">
                {/* Progress bar */}
                <div className="mb-3 h-1 w-full overflow-hidden rounded-sm bg-secondary/60">
                  <div
                    className="h-full bg-neon-green"
                    style={{ width: `${progress}%`, boxShadow: "0 0 10px currentColor" }}
                  />
                </div>
                {/* Section links (auto-generated from post.sections) */}
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