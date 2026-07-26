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
      { label: "Home", to: "/", icon: Home },
      { label: "Writeups", to: "/writeups", icon: Swords },
      { label: "Cheatsheets", to: "/cheatsheet", icon: BookOpen },
      { label: "Logs", to: "/logs", icon: FileTerminal },
      { label: "Tools", to: "/tools", icon: Wrench },
      { label: "Stats", to: "/stats", icon: Activity },
      { label: "About", to: "/about", icon: User },
    ],
    [],
  );

  const go = (path: string) => {
    setOpen(false);
    navigate({ to: path });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <Command
        className="relative w-full max-w-xl rounded-2xl border border-glass-border bg-card text-foreground shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden font-sans animate-in zoom-in-95 duration-200"
        label="Global Search Modal"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-glass-border px-5 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-emerald-400" />
          <Command.Input
            placeholder="Search writeups, cheatsheets, logs, or tools..."
            className="flex-1 bg-transparent py-1 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-sans"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-glass-border bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <Command.List className="max-h-[55vh] overflow-y-auto p-2.5 scrollbar-thin">
          <Command.Empty className="py-12 text-center text-sm text-muted-foreground font-sans">
            No search results found.
          </Command.Empty>

          {/* Pages */}
          <Command.Group
            heading={
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 font-mono">
                Navigation Pages
              </span>
            }
          >
            {pages.map((p) => (
              <Command.Item
                key={p.to}
                value={p.label}
                onSelect={() => go(p.to)}
                className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-muted-foreground cursor-pointer data-[selected=true]:bg-emerald-500/10 data-[selected=true]:text-emerald-400 transition-colors my-0.5 font-sans"
              >
                <p.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 font-medium">{p.label}</span>
                <CornerDownLeft className="h-3.5 w-3.5 opacity-0 data-[selected=true]:opacity-100 shrink-0 text-emerald-400" />
              </Command.Item>
            ))}
          </Command.Group>

          {/* Writeups */}
          {writeupsMeta.length > 0 && (
            <Command.Group
              heading={
                <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 font-mono mt-3 block">
                  Writeups
                </span>
              }
            >
              {writeupsMeta.map((w) => (
                <Command.Item
                  key={w.slug}
                  value={`${w.title} ${w.tags.join(" ")} ${w.platform} ${w.difficulty}`}
                  onSelect={() => go(`/writeups/${w.slug}`)}
                  className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-muted-foreground cursor-pointer data-[selected=true]:bg-emerald-500/10 data-[selected=true]:text-emerald-400 transition-colors my-0.5 font-sans"
                >
                  <Swords className="h-4 w-4 shrink-0 text-emerald-400" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold text-foreground">{w.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-400/90 font-medium">{w.platform}</span>
                      <span>·</span>
                      <span>{w.difficulty}</span>
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
                <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 font-mono mt-3 block">
                  Cheatsheets
                </span>
              }
            >
              {cheatsheetFiles.map((c) => (
                <Command.Item
                  key={c.path}
                  value={`${c.meta.title || c.path} ${c.path}`}
                  onSelect={() => go(`/cheatsheet/${c.path}`)}
                  className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-muted-foreground cursor-pointer data-[selected=true]:bg-emerald-500/10 data-[selected=true]:text-emerald-400 transition-colors my-0.5 font-sans"
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-fuchsia-400" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold text-foreground">
                      {c.meta.title || c.path}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {c.meta.category || "Reference"} · {c.meta.readTime || "Quick ref"}
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Logs */}
          {postsMeta.length > 0 && (
            <Command.Group
              heading={
                <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 font-mono mt-3 block">
                  Research Logs
                </span>
              }
            >
              {postsMeta.map((p) => (
                <Command.Item
                  key={p.slug}
                  value={`${p.title} ${p.tags.join(" ")} ${p.category}`}
                  onSelect={() => go(`/logs/${p.slug}`)}
                  className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-muted-foreground cursor-pointer data-[selected=true]:bg-emerald-500/10 data-[selected=true]:text-emerald-400 transition-colors my-0.5 font-sans"
                >
                  <FileTerminal className="h-4 w-4 shrink-0 text-cyan-400" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold text-foreground">{p.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{p.date}</span>
                      <span>·</span>
                      <span className="text-cyan-400/90">{p.category}</span>
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-glass-border px-5 py-2.5 text-xs text-muted-foreground font-sans bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-glass-border bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px]">
                ↑↓
              </kbd>{" "}
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-glass-border bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>{" "}
              open
            </span>
          </div>
          <span className="text-muted-foreground/60 text-[11px]">Asbawy Search</span>
        </div>
      </Command>
    </div>
  );
}
