import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CyberLayout, Panel, Tag, tagVariantFor, handleTagClick } from "@/components/cyber/Layout";
import { postsMeta } from "@/data/posts";
import { cheatsheetFiles } from "@/data/cheatsheets";
import { writeupsMeta } from "@/data/writeups";

export const Route = createFileRoute("/")({
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
  const navigate = useNavigate();

  return (
    <CyberLayout>
      <section className="px-6 md:px-10 py-10 max-w-6xl">
        <div className="font-mono text-[11px] text-muted-foreground">
          <span className="text-foreground">asbawy</span>:
          <span className="text-foreground">~</span>$ cat welcome.md
        </div>
        <h1 className="mt-2 font-mono text-2xl md:text-3xl text-foreground">
          Asbawy <span className="text-muted-foreground">— dev_logs & security_research</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Welcome to my control center. I write about low-level development, endpoints security, red
          teaming automation, and reverse engineering.
        </p>

        <Panel title="latest_entries" className="mt-8">
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
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="reference_modules" className="mt-8">
          {cheatsheetFiles.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-muted-foreground">
              // no cheatsheets yet — add your first one in src/data/cheatsheets
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...cheatsheetFiles]
                .sort((a, b) => {
                  const dateA = new Date(a.meta.updated || a.meta.date || "1970-01-01").getTime();
                  const dateB = new Date(b.meta.updated || b.meta.date || "1970-01-01").getTime();
                  return dateB - dateA;
                })
                .slice(0, 4)
                .map((file) => (
                  <Link
                    key={file.path}
                    to="/cheatsheet/$"
                    params={{ _splat: file.path }}
                    preload="intent"
                    className="group rounded-md glass-panel glass-panel-hover p-4 block transition-all"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-muted-foreground">{file.meta.updated || file.meta.date}</span>
                      <span className="text-accent-primary">
                        {file.meta.category?.toLowerCase() || "reference"}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm md:text-base text-foreground group-hover:text-foreground transition-colors">
                      {file.meta.title || file.path.split("/").pop()}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{file.meta.excerpt}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {file.meta.tags?.slice(0, 3).map((t) => (
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
                  </Link>
                ))}
            </div>
          )}
          <div className="mt-6 text-center">
            <Link to="/cheatsheet" className="font-mono text-xs text-foreground hover:text-accent-primary transition-colors">
              [ view_all_cheatsheets ]
            </Link>
          </div>
        </Panel>

        <Panel title="pwned_machines" className="mt-8">
          {writeupsMeta.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-muted-foreground">
              // no writeups yet — first blood pending
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {writeupsMeta.slice(0, 4).map((w) => {
                const platformColor =
                  w.platform === "HackTheBox" ? "text-[#9FEF00]" :
                  w.platform === "TryHackMe" ? "text-[#FF3E3E]" :
                  w.platform === "VulnHub" ? "text-[#4FC3F7]" :
                  w.platform === "CTF" ? "text-[#FFD43B]" : "text-[#C792EA]";
                const diffColor =
                  w.difficulty === "Easy" ? "text-[#9FEF00]" :
                  w.difficulty === "Medium" ? "text-[#FFD43B]" :
                  w.difficulty === "Hard" ? "text-[#FF7043]" : "text-[#FF3E3E]";
                return (
                  <Link
                    key={w.slug}
                    to="/writeups/$slug"
                    params={{ slug: w.slug }}
                    preload="intent"
                    className="group rounded-md glass-panel glass-panel-hover p-4 block transition-all"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className={platformColor}>{w.platform}</span>
                      <span className={diffColor}>{w.difficulty.toLowerCase()}</span>
                    </div>
                    <h3 className="mt-2 text-sm md:text-base text-foreground group-hover:text-foreground transition-colors">
                      {w.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{w.excerpt}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {w.tags.slice(0, 3).map((t) => (
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
                  </Link>
                );
              })}
            </div>
          )}
          <div className="mt-6 text-center">
            <Link to="/writeups" className="font-mono text-xs text-foreground hover:text-accent-primary transition-colors">
              [ view_all_writeups ]
            </Link>
          </div>
        </Panel>
      </section>
    </CyberLayout>
  );
}
