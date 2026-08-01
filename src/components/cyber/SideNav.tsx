import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  FileTerminal,
  Wrench,
  Activity,
  BookOpen,
  User,
  Search,
  Swords,
  Github,
  Linkedin,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { EyeOfRa } from "./EyeOfRa";
import { ThemeToggle } from "./ThemeToggle";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/writeups", label: "Writeups", icon: Swords },
  { to: "/cheatsheet", label: "Cheatsheets", icon: BookOpen },
  { to: "/logs", label: "Logs", icon: FileTerminal },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/stats", label: "Stats", icon: Activity },
  { to: "/about", label: "About", icon: User },
];

export function SideNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const triggerSearch = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar sticky top-0 h-screen font-sans transition-colors duration-300">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-border flex items-center gap-3 transition-colors duration-300">
        <Link
          to="/"
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-full"
        >
          <div className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center border border-border hover:border-emerald-400/50 shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300 cursor-pointer overflow-hidden">
            <EyeOfRa className="relative z-10 h-9 w-9 object-contain hover:scale-105 transition-transform duration-300 text-zinc-950" />
          </div>
        </Link>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">
            SECURITY RESEARCH
          </span>
          <span className="text-lg font-extrabold text-foreground font-sans tracking-tight">
            Asbawy
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        <p className="px-3 pb-2 text-[10px] uppercase font-mono tracking-[0.2em] text-muted-foreground/70">
          Navigation
        </p>
        {items.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-lg px-3.5 py-2.5 font-sans text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 ${
                active
                  ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-l-2 border-emerald-500 dark:border-emerald-400 font-semibold shadow-[0_0_15px_rgba(52,211,153,0.12)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent"
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-colors ${
                  active
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer & Controls */}
      <div className="mx-3 mt-auto mb-4 space-y-3 pt-3 border-t border-border">
        {/* Search trigger */}
        <button
          onClick={triggerSearch}
          className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-sans text-muted-foreground hover:border-emerald-400/40 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle & Social Links */}
        <div className="flex items-center justify-between gap-2 px-1">
          <ThemeToggle />

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <a
              href="https://github.com/Asbawy"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-md hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-muted/50 transition-colors"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/in/mhmmdashraf"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-md hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-muted/50 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://asbawy.medium.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-md hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-muted/50 transition-colors"
              title="Medium"
            >
              <BookOpen className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-center text-muted-foreground/70 font-sans pt-1">
          © 2026 Asbawy
        </p>
      </div>
    </aside>
  );
}

export function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-3 font-sans">
        <div className="flex items-center gap-3">
          <Link to="/" className="block focus:outline-none">
            <div className="relative w-8 h-8 rounded-full bg-white flex items-center justify-center border border-border shadow-[0_0_8px_rgba(0,0,0,0.05)] overflow-hidden">
              <EyeOfRa className="relative z-10 h-6 w-6 object-contain text-zinc-950" />
            </div>
          </Link>
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] font-mono tracking-wider text-muted-foreground uppercase">
              SECURITY RESEARCH
            </span>
            <span className="text-sm font-bold text-foreground">Asbawy</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {items.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-semibold border-l-2 border-emerald-500 dark:border-emerald-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
