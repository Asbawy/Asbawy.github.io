import { Link, useRouterState } from "@tanstack/react-router";
import { Home, FileTerminal, Wrench, Activity, BookOpen, User, Search } from "lucide-react";
import { EyeOfRa } from "./EyeOfRa";
import { ThemeToggle } from "./ThemeToggle";

const items = [
  { to: "/", label: "/home", icon: Home },
  { to: "/logs", label: "/logs", icon: FileTerminal },
  { to: "/tools", label: "/tools", icon: Wrench },
  { to: "/stats", label: "/stats", icon: Activity },
  { to: "/cheatsheet", label: "/cheatsheet", icon: BookOpen },
  { to: "/about", label: "/about", icon: User },
];

export function SideNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-panel-border bg-sidebar sticky top-0 h-screen font-mono">
      <div className="px-5 py-5 border-b border-panel-border flex items-center gap-3">
        <Link to="/" className="block focus:outline-none">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-neon-green/30 hover:border-neon-green transition-all shadow-[0_0_15px_color-mix(in_oklab,var(--neon-green)_20%,transparent)] hover:shadow-[0_0_20px_color-mix(in_oklab,var(--neon-green)_40%,transparent)] p-0.5 duration-300 cursor-pointer">
            <EyeOfRa className="h-10 w-10 object-contain" />
          </div>
        </Link>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            root://
          </span>
          <span className="text-base text-foreground text-glow-green">Asbawy</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          ── navigation
        </p>
        {items.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 border transition-all ${
                active
                  ? "border-neon-green/40 bg-neon-green/5 text-neon-green text-glow-green"
                  : "border-transparent text-muted-foreground hover:border-panel-border hover:bg-panel hover:text-foreground"
              }`}
            >
              <span className={`text-xs ${active ? "text-neon-green" : "text-muted-foreground"}`}>
                {active ? "▸" : "·"}
              </span>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mt-auto mb-2 space-y-2">
        <button
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
            );
          }}
          className="flex w-full items-center gap-2 rounded-md border border-panel-border px-3 py-2 font-mono text-xs text-muted-foreground hover:border-neon-green/30 hover:text-foreground transition-all"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="rounded border border-panel-border bg-background/60 px-1.5 py-0.5 text-[9px]">⌘K</kbd>
        </button>
        <ThemeToggle />
      </div>

      <div className="mx-3 mb-3 rounded-md border border-panel-border bg-panel/60 p-3 text-[11px] font-mono">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>session</span>
          <span className="text-neon-green">● live</span>
        </div>
        <div className="mt-1 text-foreground/80 truncate">tty/asbawy</div>
        <div className="mt-2 text-muted-foreground">v0.42.1 // edge</div>
      </div>
    </aside>
  );
}

export function TopBar() {
  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-panel-border bg-background/95 px-4 py-3 font-mono">
      <div className="flex items-center gap-3">
        <Link to="/" className="block focus:outline-none">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-neon-green/30 p-0.5">
            <EyeOfRa className="h-7 w-7 object-contain" />
          </div>
        </Link>
        <span className="text-base text-glow-green">Asbawy</span>
      </div>
      <nav className="flex items-center gap-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-neon-green">/home</Link>
        <Link to="/logs" className="hover:text-neon-green">/logs</Link>
        <Link to="/tools" className="hover:text-neon-green">/tools</Link>
        <Link to="/stats" className="hover:text-neon-green">/stats</Link>
        <Link to="/cheatsheet" className="hover:text-neon-green">/cheat</Link>
        <Link to="/about" className="hover:text-neon-green">/about</Link>
        <div className="pl-2 border-l border-panel-border">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
