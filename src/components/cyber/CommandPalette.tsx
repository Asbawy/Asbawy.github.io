import { useState, useEffect, useMemo } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import {
  FileTerminal,
  BookOpen,
  Home,
  Wrench,
  Activity,
  User,
  Search,
  CornerDownLeft,
  Swords,
} from "lucide-react";
import { postsMeta } from "@/data/posts";
import { cheatsheetFiles } from "@/data/cheatsheets";
import { writeupsMeta } from "@/data/writeups";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle with Ctrl+K / Cmd+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const pages = useMemo(
    () => [
      { label: "/home", to: "/", icon: Home },
      { label: "/writeups", to: "/writeups", icon: Swords },
      { label: "/cheatsheet", to: "/cheatsheet", icon: BookOpen },
      { label: "/logs", to: "/logs", icon: FileTerminal },
      { label: "/tools", to: "/tools", icon: Wrench },
      { label: "/stats", to: "/stats", icon: Activity },
      { label: "/about", to: "/about", icon: User },
    ],
    [],
  );

  const go = (path: string) => {
    setOpen(false);
    navigate({ to: path });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <Command
        className="relative w-full max-w-xl rounded-xl border border-panel-border bg-panel/95 backdrop-blur-xl shadow-[0_0_80px_rgba(0,255,136,0.06),0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden font-mono"
        label="Command Palette"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-panel-border px-4">
          <Search className="h-4 w-4 shrink-0 text-foreground" />
          <Command.Input
            placeholder="Type to search posts, cheatsheets, or pages…"
            className="flex-1 bg-transparent py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-panel-border bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <Command.List className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="py-8 text-center text-xs text-muted-foreground">
            // no results found
          </Command.Empty>

          {/* Pages */}
          <Command.Group
            heading={
              <span className="px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                Pages
              </span>
            }
          >
            {pages.map((p) => (
              <Command.Item
                key={p.to}
                value={p.label}
                onSelect={() => go(p.to)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground cursor-pointer data-[selected=true]:bg-foreground/10 data-[selected=true]:text-foreground transition-colors"
              >
                <p.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{p.label}</span>
                <CornerDownLeft className="h-3 w-3 opacity-0 data-[selected=true]:opacity-100 shrink-0 text-foreground/60" />
              </Command.Item>
            ))}
          </Command.Group>

          {/* Posts */}
          {postsMeta.length > 0 && (
            <Command.Group
              heading={
                <span className="px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Posts
                </span>
              }
            >
              {postsMeta.map((p) => (
                <Command.Item
                  key={p.slug}
                  value={`${p.title} ${p.tags.join(" ")} ${p.category}`}
                  onSelect={() => go(`/logs/${p.slug}`)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground cursor-pointer data-[selected=true]:bg-foreground/10 data-[selected=true]:text-foreground transition-colors"
                >
                  <FileTerminal className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{p.title}</div>
                    <div className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                      {p.date} · {p.category.toLowerCase()}
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Cheatsheets */}
          {cheatsheetFiles.length > 0 && (
            <Command.Group
              heading={
                <span className="px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Cheatsheets
                </span>
              }
            >
              {cheatsheetFiles.map((c) => (
                <Command.Item
                  key={c.path}
                  value={`${c.meta.title || c.path} ${c.path}`}
                  onSelect={() => go(`/cheatsheet/${c.path}`)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground cursor-pointer data-[selected=true]:bg-foreground/10 data-[selected=true]:text-foreground transition-colors"
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{c.meta.title || c.path}</div>
                    <div className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                      ~/{c.path}.mdx
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Writeups */}
          {writeupsMeta.length > 0 && (
            <Command.Group
              heading={
                <span className="px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Writeups
                </span>
              }
            >
              {writeupsMeta.map((w) => (
                <Command.Item
                  key={w.slug}
                  value={`${w.title} ${w.tags.join(" ")} ${w.platform} ${w.difficulty}`}
                  onSelect={() => go(`/writeups/${w.slug}`)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground cursor-pointer data-[selected=true]:bg-foreground/10 data-[selected=true]:text-foreground transition-colors"
                >
                  <Swords className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{w.title}</div>
                    <div className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                      {w.platform} · {w.difficulty.toLowerCase()} · {w.os || w.type}
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-panel-border px-4 py-2 text-[10px] text-muted-foreground/60">
          <span>
            <kbd className="rounded border border-panel-border bg-background/60 px-1 py-0.5">
              ↑↓
            </kbd>{" "}
            navigate{" "}
            <kbd className="rounded border border-panel-border bg-background/60 px-1 py-0.5 ml-1">
              ↵
            </kbd>{" "}
            select
          </span>
          <span className="text-foreground/40">cmd_palette v1</span>
        </div>
      </Command>
    </div>
  );
}
