import { Link } from "@tanstack/react-router";
import { Github, ExternalLink, BookOpen } from "lucide-react";

export function AuthorBio() {
  return (
    <section className="mt-12 rounded-lg border border-panel-border bg-panel/80 overflow-hidden">
      <header className="flex items-center border-b border-panel-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="text-neon-green">▸</span>
          about the author
        </span>
      </header>
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link to="/about" className="shrink-0 group">
            <div className="relative rounded-full bg-neon-green/5 p-1 border border-neon-green/30 shadow-[0_0_10px_rgba(0,255,136,0.1)] hover:border-neon-green/45 hover:shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-all duration-300 backdrop-blur-md overflow-hidden">
              {/* Soft glowing backdrop to illuminate the dark logo */}
              <div className="absolute inset-1 rounded-full bg-neon-green/20 blur-md pointer-events-none" />
              <img
                src="/eye-of-ra.png"
                alt="Eye of Ra"
                className="relative z-10 h-12 w-12 object-contain hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </Link>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <Link
              to="/about"
              className="font-mono text-sm text-foreground hover:text-neon-green transition-colors"
            >
              Asbawy
              <span className="ml-2 text-[10px] text-muted-foreground font-normal">
                (Mohammed Al-Kasabi)
              </span>
            </Link>
            <p className="mt-1 font-mono text-[11px] text-neon-green">
              Red Team Consultant · Penetration Tester · Bug Bounty Hunter
            </p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-lg">
              Offensive security professional with 250+ vulnerabilities reported across 50+
              organizations including Atlassian, Vimeo, and AT&T. Sharing research, tools, and field
              notes.
            </p>

            {/* Social links */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/Asbawy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-neon-green transition-colors"
              >
                <Github className="h-3 w-3" />
                github
              </a>
              <a
                href="https://asbawy.medium.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-neon-green transition-colors"
              >
                <BookOpen className="h-3 w-3" />
                medium
              </a>
              <a
                href="https://linkedin.com/in/mhmmdashraf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-neon-green transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                linkedin
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
