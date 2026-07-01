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
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-panel-border bg-sidebar sticky top-0 h-screen font-mono">
      <div className="px-5 py-5 border-b border-panel-border flex items-center gap-3">
        <Link
          to="/"
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-green rounded-full"
        >
          <div className="relative w-12 h-12 rounded-full bg-neon-green/5 flex items-center justify-center border border-neon-green/30 hover:border-neon-green/60 transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_22px_rgba(0,255,136,0.3)] p-1 duration-300 cursor-pointer backdrop-blur-md overflow-hidden">
            {/* Soft glowing backdrop to illuminate the dark logo */}
            <div className="absolute inset-0.5 rounded-full bg-neon-green/20 blur-md pointer-events-none" />
            <EyeOfRa className="relative z-10 h-9 w-9 object-contain hover:scale-105 transition-transform duration-300" />
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
              className={`group flex items-center gap-3 rounded-md px-3 py-2 border transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/60 ${
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
              new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
            );
          }}
          className="flex w-full items-center gap-2 rounded-md border border-panel-border px-3 py-2 font-mono text-xs text-muted-foreground hover:border-neon-green/30 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/60"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="rounded border border-panel-border bg-background/60 px-1.5 py-0.5 text-[9px]">
            ⌘K
          </kbd>
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
          <div className="relative w-8 h-8 rounded-full bg-neon-green/5 flex items-center justify-center border border-neon-green/30 shadow-[0_0_10px_rgba(0,255,136,0.12)] p-0.5 backdrop-blur-md overflow-hidden">
            {/* Soft glowing backdrop to illuminate the dark logo */}
            <div className="absolute inset-0.5 rounded-full bg-neon-green/20 blur-sm pointer-events-none" />
            <EyeOfRa className="relative z-10 h-6 w-6 object-contain" />
          </div>
        </Link>
        <span className="text-base text-glow-green">Asbawy</span>
      </div>
      <nav className="flex items-center gap-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-neon-green">
          /home
        </Link>
        <Link to="/logs" className="hover:text-neon-green">
          /logs
        </Link>
        <Link to="/tools" className="hover:text-neon-green">
          /tools
        </Link>
        <Link to="/stats" className="hover:text-neon-green">
          /stats
        </Link>
        <Link to="/cheatsheet" className="hover:text-neon-green">
          /cheat
        </Link>
        <Link to="/about" className="hover:text-neon-green">
          /about
        </Link>
        <div className="pl-2 border-l border-panel-border">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
