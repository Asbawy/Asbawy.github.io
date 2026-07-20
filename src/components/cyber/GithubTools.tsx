import { ExternalLink, Star, GitFork } from "lucide-react";

const REPOS = [
  {
    name: "pharaohound",
    description: "A lightweight, CLI-first Active Directory & Azure analysis engine that stream-parses raw BloodHound JSON data to instantly map attack paths and generate copy-paste-ready exploitation commands.",
    url: "https://github.com/Asbawy/pharaohound",
    language: "Go/Python",
  },
  {
    name: "dedjs",
    description: "Context-aware JavaScript static analysis tool designed for bug bounty and pentesting. Reduces false positives by correlating user-controlled sources with dangerous sinks.",
    url: "https://github.com/Asbawy/dedjs",
    language: "Python",
  },
  {
    name: "dedjwt",
    description: "Python script designed for JWT token fast brute-forcing.",
    url: "https://github.com/Asbawy/dedjwt",
    language: "Python",
  },
  {
    name: "NFR",
    description: "Python script for race condition testing.",
    url: "https://github.com/Asbawy/NFR",
    language: "Python",
  },
  {
    name: "GrafTraverse-CVE-2021-43798",
    description: "CVE-2021-43798 MiNi Exploitation Framework.",
    url: "https://github.com/Asbawy/GrafTraverse-CVE-2021-43798",
    language: "Python",
  },
  {
    name: "Automation-for-Juniper-cve-2023-36845",
    description: "Simple Automation script for juniper cve-2023-36845.",
    url: "https://github.com/Asbawy/Automation-for-Juniper-cve-2023-36845",
    language: "Shell",
  }
];

export function GithubTools() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {REPOS.map((repo) => (
        <a
          key={repo.name}
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-4 border border-panel-border bg-panel-bg hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <h3 className="font-mono text-primary text-sm group-hover:underline flex items-center gap-2">
              {repo.name}
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </h3>
            <span className="text-xs font-mono text-muted-foreground bg-panel-border px-2 py-0.5 rounded">
              {repo.language}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground font-mono leading-relaxed line-clamp-3">
            {repo.description}
          </p>
        </a>
      ))}
    </div>
  );
}
