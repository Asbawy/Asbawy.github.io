import { Link, useRouterState } from "@tanstack/react-router";
import { Home, FileTerminal, Wrench, Activity, BookOpen, User, Search, Swords } from "lucide-react";
import { EyeOfRa } from "./EyeOfRa";
import { ThemeToggle } from "./ThemeToggle";

const items = [
  { to: "/", label: "/home", icon: Home },
  { to: "/writeups", label: "/writeups", icon: Swords },
  { to: "/cheatsheet", label: "/cheatsheet", icon: BookOpen },
  { to: "/logs", label: "/logs", icon: FileTerminal },
  { to: "/tools", label: "/tools", icon: Wrench },
  { to: "/stats", label: "/stats", icon: Activity },
  { to: "/about", label: "/about", icon: User },
];

export function SideNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-glass-border bg-glass-bg backdrop-blur-md sticky top-0 h-screen font-mono">
      <div className="px-5 py-5 border-b border-glass-border flex items-center gap-3">
        <Link
          to="/"
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 rounded-full"
        >
          <div className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center border border-white/20 hover:border-white shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 cursor-pointer overflow-hidden">
            <EyeOfRa className="relative z-10 h-10 w-10 object-contain hover:scale-105 transition-transform duration-300 text-black" />
          </div>
        </Link>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            root://
          </span>
          <span className="text-base text-foreground">Asbawy</span>
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
              className={`group flex items-center gap-3 rounded-md px-3 py-2 border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 ${
                active
                  ? "border-foreground/20 bg-foreground/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-panel-border hover:bg-panel hover:text-foreground"
              }`}
            >
              <span className={`text-xs ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {active ? "▸" : "·"}
              </span>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mt-auto mb-3 space-y-2">
        <button
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
            );
          }}
          className="flex w-full items-center gap-2 rounded-md border border-panel-border px-3 py-2 font-mono text-xs text-muted-foreground hover:border-foreground/20 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="rounded border border-panel-border bg-background/60 px-1.5 py-0.5 text-[9px]">
            ⌘K
          </kbd>
        </button>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function TopBar() {
  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-glass-border bg-glass-bg backdrop-blur-md px-4 py-3 font-mono">
      <div className="flex items-center gap-3">
        <Link to="/" className="block focus:outline-none">
          <div className="relative w-8 h-8 rounded-full bg-white flex items-center justify-center border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.15)] overflow-hidden">
            <EyeOfRa className="relative z-10 h-6 w-6 object-contain text-black" />
          </div>
        </Link>
        <span className="text-base text-foreground">Asbawy</span>
      </div>
      <nav className="flex items-center gap-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          /home
        </Link>
        <Link to="/writeups" className="hover:text-foreground transition-colors">
          /pwned
        </Link>
        <Link to="/cheatsheet" className="hover:text-foreground transition-colors">
          /cheat
        </Link>
        <Link to="/logs" className="hover:text-foreground transition-colors">
          /logs
        </Link>
        <Link to="/tools" className="hover:text-foreground transition-colors">
          /tools
        </Link>
        <Link to="/stats" className="hover:text-foreground transition-colors">
          /stats
        </Link>
        <Link to="/about" className="hover:text-foreground transition-colors">
          /about
        </Link>
        <div className="pl-2 border-l border-panel-border">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
