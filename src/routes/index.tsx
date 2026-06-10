

import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { CyberLayout, Panel, Tag, tagVariantFor } from "@/components/cyber/Layout";
import { Typewriter } from "@/components/cyber/Typewriter";
import { SystemStatus } from "@/components/cyber/SystemStatus";
import { postsMeta } from "@/data/posts";
import { ArrowUpRight, Terminal } from "lucide-react";

export const Route = createFileRoute("/")(
  {

  head: () => ({
    meta: [
      { title: "Asbawy Blog — Dev Logs, Security Research & Tools" },
      {
        name: "description",
        content:
          "Personal blog by Asbawy — security research, dev logs, automation, and scripting.",
      },
      { property: "og:title", content: "Asbawy Blog" },
      { property: "og:description", content: "Dev logs, security research, and tools by Asbawy." },
    ],
  }),
  component: Index,
});

function Index() {

  const recent = postsMeta.slice(0, 4);

  return (
    <CyberLayout>

      <section className="relative overflow-hidden border-b border-panel-border">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />
        <div className="relative px-6 md:px-10 py-12 md:py-20 max-w-6xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-green pulse-dot" />
            session_initialized — welcome
          </div>


          <h1 className="sr-only">Asbawy — personal blog and dev logs</h1>


          <div className="mt-6 rounded-lg border border-panel-border bg-panel/70 backdrop-blur p-5 md:p-7 max-w-3xl">
            <Typewriter
              className="text-base md:text-xl leading-relaxed"
              lines={[
                "whoami",
                "identity: Asbawy // blog_active: true",
                "mission: learn, build, document, share.",
              ]}
            />
          </div>


          <div className="mt-8 flex flex-wrap gap-3 font-mono text-sm">
            <Link
              to="/logs"
              className="group inline-flex items-center gap-2 rounded-md border border-neon-green/40 bg-neon-green/5 px-4 py-2 text-neon-green text-glow-green hover:border-glow-green transition-all"
            >
              <Terminal className="h-4 w-4" />
              read /logs
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-md border border-neon-green/40 bg-neon-green/5 px-4 py-2 text-neon-green hover:border-glow-green transition-all"
            >
              open /tools
            </Link>
            <Link
              to="/cheatsheet"
              className="inline-flex items-center gap-2 rounded-md border border-neon-green/40 bg-neon-green/5 px-4 py-2 text-neon-green hover:border-glow-green transition-all"
            >
              open /cheatsheet
            </Link>
          </div>
        </div>
      </section>


      <section className="px-6 md:px-10 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <SystemStatus />
          </div>


          <Panel title="ops summary">
            <ul className="space-y-3 font-mono text-xs">
              {[
                ["total_posts", String(postsMeta.length)],
                ["categories", "4"],
                ["status", "active"],
                ["version", "v1.0"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between border-b border-panel-border/60 pb-2 last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-neon-green text-glow-green">{v}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>


        <div className="mt-8">
          <Panel
            title="recent posts"
            right={
              <Link to="/logs" className="text-[10px] text-neon-green hover:text-glow-green">
                view all →
              </Link>
            }
          >
            {recent.length === 0 ? (

              <div className="py-8 text-center font-mono text-xs text-muted-foreground">
                // no posts yet — add your first post in src/data/posts.ts
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recent.map((p) => (
                  <Link
                    key={p.slug}
                    to="/logs/$slug"
                    params={{ slug: p.slug }}
                    className="group rounded-md border border-panel-border bg-background/40 p-4 hover:border-neon-green/40 hover:bg-neon-green/5 transition-all"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <span>{p.date}</span>
                      <span className={
                        p.severity === "Critical" ? "text-threat-high" :
                        p.severity === "High" ? "text-threat-mid" :
                        p.severity === "Medium" ? "text-neon-green" :
                        "text-neon-green"
                      }>
                        severity: {p.severity.toLowerCase()}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm md:text-base text-foreground group-hover:text-neon-green transition-colors">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <Tag key={t} variant={tagVariantFor(t)}>{t}</Tag>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>
    </CyberLayout>
  );
}


