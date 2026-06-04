import { Link } from "@tanstack/react-router";
import { Github, ExternalLink, BookOpen } from "lucide-react";

export function AuthorBio() {
  return (
    <section className="mt-12 rounded-lg border border-panel-border bg-panel/60 backdrop-blur-sm overflow-hidden">
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
            <div className="rounded-md border border-neon-green/30 bg-panel/60 p-[2px] group-hover:border-neon-green/60 group-hover:shadow-[0_0_12px_rgba(0,255,136,0.1)] transition-all duration-300">
              <img
                src="/asbawy.webp"
                alt="Asbawy"
                className="h-14 w-14 rounded object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
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
            <p className="mt-1 font-mono text-[11px] text-neon-blue">
              Red Team Consultant · Penetration Tester · Bug Bounty Hunter
            </p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-lg">
              Offensive security professional with 250+ vulnerabilities reported across 50+ organizations
              including Atlassian, Vimeo, and AT&T. Sharing research, tools, and field notes.
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
