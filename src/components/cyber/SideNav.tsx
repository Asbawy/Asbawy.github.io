import { Link, useRouterState } from "@tanstack/react-router";
import { Home, FileTerminal, Wrench, Activity, BookOpen, User, Search, Swords } from "lucide-react";
import { EyeOfRa } from "./EyeOfRa";
import { ThemeToggle } from "./ThemeToggle";

const items = [
  { to: "/", label: "/home", icon: Home, baseColor: "text-foreground", groupHover: "group-hover:text-foreground", activeClass: "border-border bg-card-hover text-foreground", hoverClass: "hover:border-border hover:bg-card-hover" },
  { to: "/writeups", label: "/writeups", icon: Swords, baseColor: "text-emerald-500", groupHover: "group-hover:text-emerald-500", activeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500", hoverClass: "hover:border-emerald-500/30 hover:bg-emerald-500/5" },
  { to: "/cheatsheet", label: "/cheatsheet", icon: BookOpen, baseColor: "text-fuchsia-500", groupHover: "group-hover:text-fuchsia-500", activeClass: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-500", hoverClass: "hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5" },
  { to: "/logs", label: "/logs", icon: FileTerminal, baseColor: "text-cyan-500", groupHover: "group-hover:text-cyan-500", activeClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-500", hoverClass: "hover:border-cyan-500/30 hover:bg-cyan-500/5" },
  { to: "/tools", label: "/tools", icon: Wrench, baseColor: "text-amber-500", groupHover: "group-hover:text-amber-500", activeClass: "border-amber-500/30 bg-amber-500/10 text-amber-500", hoverClass: "hover:border-amber-500/30 hover:bg-amber-500/5" },
  { to: "/stats", label: "/stats", icon: Activity, baseColor: "text-sky-500", groupHover: "group-hover:text-sky-500", activeClass: "border-sky-500/30 bg-sky-500/10 text-sky-500", hoverClass: "hover:border-sky-500/30 hover:bg-sky-500/5" },
  { to: "/about", label: "/about", icon: User, baseColor: "text-purple-500", groupHover: "group-hover:text-purple-500", activeClass: "border-purple-500/30 bg-purple-500/10 text-purple-500", hoverClass: "hover:border-purple-500/30 hover:bg-purple-500/5" },
];

export function SideNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-glass-border bg-glass-bg sticky top-0 h-screen font-mono transition-colors duration-300">
      <div className="px-5 py-5 border-b border-glass-border flex items-center gap-3 transition-colors duration-300">
        <Link
          to="/"
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-full"
        >
          <div className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center border border-border hover:border-zinc-400 shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer overflow-hidden">
            <EyeOfRa className="relative z-10 h-10 w-10 object-contain hover:scale-105 transition-transform duration-300 text-zinc-950" />
          </div>
        </Link>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            root@dedsec
          </span>
          <span className="text-base font-bold text-foreground">Asbawy</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          ~/navigation
        </p>
        {items.map(({ to, label, icon: Icon, baseColor, groupHover, activeClass, hoverClass }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border ${
                active
                  ? activeClass
                  : `border-transparent text-muted-foreground ${hoverClass} ${groupHover}`
              }`}
            >
              <span className={`text-xs ${active ? baseColor : `text-muted-foreground/50 ${groupHover}`}`}>
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
          className="flex w-full items-center gap-2 rounded-md border border-glass-border px-3 py-2 font-mono text-xs text-muted-foreground hover:border-border hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[9px] text-foreground">
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
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-glass-border bg-glass-bg/90 backdrop-blur-md px-4 py-3 font-mono transition-colors duration-300">
      <div className="flex items-center gap-3">
        <Link to="/" className="block focus:outline-none">
          <div className="relative w-8 h-8 rounded-full bg-white flex items-center justify-center border border-border shadow-[0_0_8px_rgba(0,0,0,0.05)] overflow-hidden">
            <EyeOfRa className="relative z-10 h-6 w-6 object-contain text-zinc-950" />
          </div>
        </Link>
        <span className="text-base font-bold text-foreground">Asbawy</span>
      </div>
      <nav className="flex items-center gap-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          /home
        </Link>
        <Link to="/writeups" className="hover:text-emerald-500 transition-colors">
          /pwned
        </Link>
        <Link to="/cheatsheet" className="hover:text-fuchsia-500 transition-colors">
          /cheat
        </Link>
        <Link to="/logs" className="hover:text-cyan-500 transition-colors">
          /logs
        </Link>
        <div className="pl-2 border-l border-glass-border">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
