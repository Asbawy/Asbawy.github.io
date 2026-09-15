import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Terminal, Maximize2, Minimize2, Sparkles, CornerDownLeft } from "lucide-react";
import { postsMeta } from "@/data/posts";
import { writeupsMeta } from "@/data/writeups";
import { cheatsheetFiles } from "@/data/cheatsheets";

interface OutputLine {
  id: string;
  type: "command" | "text" | "error" | "links" | "matrix";
  content?: string;
  links?: { label: string; url: string; badge?: string }[];
}

const COMMANDS = [
  "help",
  "whoami",
  "latest",
  "tools",
  "cheats",
  "stats",
  "skills",
  "date",
  "matrix",
  "clear",
];

export function CyberTerminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<OutputLine[]>([
    {
      id: "welcome-1",
      type: "text",
      content: "ASBAWY OFFENSIVE OPERATIONS CONSOLE [v2.6.4-SEC]",
    },
    {
      id: "welcome-2",
      type: "text",
      content: "Type 'help' for available commands or try 'latest', 'tools', 'whoami'.",
    },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTo({
        top: terminalBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    // Add to command history
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const cmdEntry: OutputLine = {
      id: `cmd-${Date.now()}`,
      type: "command",
      content: trimmed,
    };

    const parts = trimmed.toLowerCase().split(" ");
    const command = parts[0];

    let resultEntries: OutputLine[] = [];

    switch (command) {
      case "help":
        resultEntries = [
          {
            id: `help-${Date.now()}`,
            type: "text",
            content: `Available Commands:
  • whoami     - Researcher identity & offensive certifications
  • latest     - View the latest 3 published writeups & research logs
  • tools      - Direct shortcuts to browser pentest utilities
  • cheats     - Quick index of reference cheatsheets
  • stats      - Operational site telemetry & metrics
  • skills     - Technical offensive disciplines & capabilities
  • date       - Display current system operational time
  • matrix     - Trigger digital rain animation
  • clear      - Clear terminal screen buffer`,
          },
        ];
        break;

      case "whoami":
        resultEntries = [
          {
            id: `whoami-${Date.now()}`,
            type: "text",
            content: `Mohammed Al-Kasabi (Asbawy)
Role: Red Team Consultant & Offensive Security Researcher
Focus: Active Directory Exploitation, Reverse Engineering, EDR Evasion, and CTF Pwning.
GitHub: github.com/Asbawy`,
          },
        ];
        break;

      case "latest":
        resultEntries = [
          {
            id: `latest-header-${Date.now()}`,
            type: "text",
            content: "Latest Operations & Published Research:",
          },
          {
            id: `latest-links-${Date.now()}`,
            type: "links",
            links: [
              ...writeupsMeta.slice(0, 2).map((w) => ({
                label: `[Writeup] ${w.title} (${w.platform})`,
                url: `/writeups/${w.slug}`,
                badge: w.difficulty,
              })),
              ...postsMeta.slice(0, 1).map((p) => ({
                label: `[Log] ${p.title}`,
                url: `/logs/${p.slug}`,
                badge: p.category,
              })),
            ],
          },
        ];
        break;

      case "tools":
        resultEntries = [
          {
            id: `tools-${Date.now()}`,
            type: "links",
            links: [
              { label: "Reverse Shell Generator", url: "/tools" },
              { label: "Hash Identifier & Mode Finder", url: "/tools" },
              { label: "IPv4 Subnet & CIDR Calculator", url: "/tools" },
              { label: "Cyber Multi-Codec & JWT Inspector", url: "/tools" },
            ],
          },
        ];
        break;

      case "cheats":
        resultEntries = [
          {
            id: `cheats-${Date.now()}`,
            type: "links",
            links: cheatsheetFiles.slice(0, 4).map((c) => ({
              label: `${c.meta.title || c.path}`,
              url: `/cheatsheet/${c.path}`,
            })),
          },
        ];
        break;

      case "stats":
        resultEntries = [
          {
            id: `stats-${Date.now()}`,
            type: "text",
            content: `Telemetry Report:
  • Pwned Systems & Walkthroughs: ${writeupsMeta.length}
  • Security Research Logs:       ${postsMeta.length}
  • Operational Cheatsheets:      ${cheatsheetFiles.length}
  • Status: [ONLINE] | OPSEC: [NOMINAL]`,
          },
        ];
        break;

      case "skills":
        resultEntries = [
          {
            id: `skills-${Date.now()}`,
            type: "text",
            content: `Core Disciplines:
  [+] Active Directory Attacks (Kerberoasting, AS-REP, ADCS, RBCD, ACLs)
  [+] Reverse Engineering & Binary Exploitation (x86/x64, Buffer Overflows)
  [+] Web Application Security & API Penetration Testing
  [+] Network Pivoting & Lateral Movement (Chisel, Ligolo-ng, Socat)
  [+] Payload Weaponization & Evasion`,
          },
        ];
        break;

      case "date":
        resultEntries = [
          {
            id: `date-${Date.now()}`,
            type: "text",
            content: `Operational Clock: ${new Date().toUTCString()}`,
          },
        ];
        break;

      case "matrix":
        resultEntries = [
          {
            id: `matrix-${Date.now()}`,
            type: "matrix",
            content: `01000001 01110011 01100010 01100001 01110111 01111001
W A K E   U P   N E O . . .
T H E   M A T R I X   H A S   Y O U .
[ ACCESS GRANTED: ROOT OVERRIDE ]`,
          },
        ];
        break;

      case "clear":
        setHistory([]);
        setInput("");
        return;

      default:
        resultEntries = [
          {
            id: `err-${Date.now()}`,
            type: "error",
            content: `bash: command not found: ${trimmed}. Type 'help' for valid commands.`,
          },
        ];
        break;
    }

    setHistory((prev) => [...prev, cmdEntry, ...resultEntries]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx =
          historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < cmdHistory.length) {
          setHistoryIndex(nextIdx);
          setInput(cmdHistory[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setInput("");
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const current = input.trim().toLowerCase();
      if (current) {
        const match = COMMANDS.find((c) => c.startsWith(current));
        if (match) setInput(match);
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      className={`rounded-2xl border border-border bg-[#0a0a0c] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] font-mono transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-50 flex flex-col" : "relative w-full"
      }`}
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card/70 border-b border-border select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/40" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/40" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/40" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>asbawy-ops // bash v5.2</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400/80 font-mono hidden sm:inline">
            [TAB: AUTOCOMPLETE]
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            title={isExpanded ? "Restore" : "Maximize"}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={terminalBodyRef}
        className={`p-4 md:p-5 overflow-y-auto space-y-2 text-xs leading-relaxed text-zinc-300 ${
          isExpanded ? "flex-1 max-h-none" : "max-h-[280px]"
        }`}
      >
        {history.map((line) => {
          if (line.type === "command") {
            return (
              <div key={line.id} className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="text-muted-foreground select-none">visitor@asbawy-ops:~$</span>
                <span>{line.content}</span>
              </div>
            );
          }
          if (line.type === "error") {
            return (
              <div key={line.id} className="text-rose-400 pl-4">
                {line.content}
              </div>
            );
          }
          if (line.type === "matrix") {
            return (
              <div
                key={line.id}
                className="text-emerald-400 pl-4 whitespace-pre-wrap animate-pulse"
              >
                {line.content}
              </div>
            );
          }
          if (line.type === "links" && line.links) {
            return (
              <div key={line.id} className="pl-4 space-y-1 my-1">
                {line.links.map((link, lIdx) => (
                  <div key={lIdx} className="flex items-center gap-2">
                    <span className="text-emerald-400 select-none">↳</span>
                    <Link
                      to={link.url}
                      className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 hover:brightness-125 transition-all"
                    >
                      {link.label}
                    </Link>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded border border-border bg-muted/40 text-muted-foreground">
                        {link.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div key={line.id} className="text-zinc-400 pl-4 whitespace-pre-wrap">
              {line.content}
            </div>
          );
        })}

        {/* Active Prompt Input Row */}
        <div className="flex items-center gap-2 text-emerald-400 pt-1">
          <span className="text-muted-foreground shrink-0 select-none">visitor@asbawy-ops:~$</span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-emerald-300 font-mono text-xs focus:outline-none caret-emerald-400"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
