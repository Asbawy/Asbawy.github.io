import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { CyberLayout, Panel, Tag, tagVariantFor } from "@/components/cyber/Layout";
import { postsMeta } from "@/data/posts";

export const Route = createFileRoute("/")(  {
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
  return (
    <CyberLayout>
      <section className="px-6 md:px-10 py-10 max-w-6xl">
        <div className="font-mono text-[11px] text-muted-foreground">
          <span className="text-foreground">asbawy</span> / posts
        </div>

        <Panel
          title={`all posts // ${postsMeta.length} entries`}
          right={
            <Link to="/logs" className="text-[10px] text-foreground/60 hover:text-foreground transition-colors">
              view all →
            </Link>
          }
          className="mt-6"
        >
          {postsMeta.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-muted-foreground">
              // no posts yet — add your first post in src/data/posts.ts
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postsMeta.map((p) => (
                <Link
                  key={p.slug}
                  to="/logs/$slug"
                  params={{ slug: p.slug }}
                  preload="intent"
                  className="group rounded-md glass-panel glass-panel-hover p-4 block transition-all"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground">{p.date}</span>
                    <span className="text-accent-primary">
                      {p.category.toLowerCase()}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm md:text-base text-foreground group-hover:text-foreground transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <Tag key={t} variant={tagVariantFor(t)}>
                        {t}
                      </Tag>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </section>
    </CyberLayout>
  );
}
