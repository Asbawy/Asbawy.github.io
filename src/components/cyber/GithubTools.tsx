import { useState, useMemo } from "react";
import { ExternalLink, Github, Code } from "lucide-react";

const REPOS = [
  {
    name: "pharaohound",
    description: "A lightweight, CLI-first Active Directory & Azure analysis engine that stream-parses raw BloodHound JSON data to instantly map attack paths and generate copy-paste-ready exploitation commands.",
    url: "https://github.com/Asbawy/pharaohound",
    language: "Go",
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
  const [langFilter, setLangFilter] = useState<string>("All");
  
  const filteredRepos = useMemo(() => {
    if (langFilter === "All") return REPOS;
    return REPOS.filter(r => r.language === langFilter);
  }, [langFilter]);

  return (
    <div className="space-y-6 font-sans">
      {/* Language Filter */}
      <div className="flex flex-wrap gap-2">
        {["All", "Python", "Go", "Shell"].map((lang) => (
          <button
            key={lang}
            onClick={() => setLangFilter(lang)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              langFilter === lang
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.12)]"
                : "bg-card text-muted-foreground border border-border hover:text-foreground hover:border-border-subtle"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRepos.map((repo) => {
          let langColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
          if (repo.language === "Python") langColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
          if (repo.language === "Go") langColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
          if (repo.language === "Shell") langColor = "bg-green-500/10 text-green-400 border-green-500/20";

          return (
            <div
              key={repo.name}
              className="group flex flex-col justify-between p-5 rounded-xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Code className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg group-hover:text-emerald-400 transition-colors">
                      {repo.name}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${langColor}`}>
                    {repo.language}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {repo.description}
                </p>
              </div>
              
              <div>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-foreground bg-muted border border-border hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>View on GitHub</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
