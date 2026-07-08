import React, { useEffect, useRef, useState, useMemo } from "react";
import hljs from "highlight.js";
import { Check, Copy, WrapText, ListOrdered } from "lucide-react";

function parseLineHighlight(metastring?: string): Set<number> {
  const highlighted = new Set<number>();
  if (!metastring) return highlighted;
  const match = metastring.match(/\{([\d,-]+)\}/);
  if (!match) return highlighted;
  const parts = match[1].split(",");
  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          highlighted.add(i);
        }
      }
    } else {
      const lineNum = Number(part);
      if (!isNaN(lineNum)) {
        highlighted.add(lineNum);
      }
    }
  }
  return highlighted;
}

const SHELL_LANGUAGES = new Set(["bash", "powershell", "cmd", "shell", "sh"]);

function highlightShellCommands(html: string): string {
  const commentIdx = html.indexOf('<span class="hljs-comment">');
  let codePart = html;
  let commentPart = "";

  if (commentIdx !== -1) {
    codePart = html.slice(0, commentIdx);
    commentPart = html.slice(commentIdx);
  }

  const pattern =
    /(<[^>]+>)|(\bmsfvenom\b|\bgrep\b|\bbloodyAD\b|\bRubeus\.exe\b|\bgetTGT\.py\b|\bgets4uTicket\.py\b|\bimpacket-psexec\b|\bNew-MachineAccount\b|\bSet-DomainObject\b|\bGet-DomainObjectAcl\b|\bEnter-PSSession\b|\bGet-SDRawBytes\b|\bNew-ADSecurityDescriptor\b|\bdsacls\b|\bsecretsdump\b|\bticketer\b|\bSharpGPOAbuse\b|\bCertify\b|\bCertipy\b|\bntlmrelayx\b|\bPetitPotam\b|\bbloodyad\b|\bpython3?\b|\bbash\b|\bsh\b|\bsudo\b|\bcmd\b|\bpowershell\b|\bpwsh\b)|(\b-{1,2}[a-zA-Z0-9_-]+)|(\|)/gi;

  const highlightedCode = codePart.replace(pattern, (match, tag, command, option, pipe) => {
    if (tag) return tag;
    if (command) return `<span class="text-cyan-400 font-semibold font-mono">${command}</span>`;
    if (option) return `<span class="text-amber-400 font-mono">${option}</span>`;
    if (pipe) return `<span class="text-foreground font-bold font-mono">${pipe}</span>`;
    return match;
  });

  return highlightedCode + commentPart;
}

export function TerminalCode({
  title = "bash",
  metastring,
  children,
}: {
  title?: string;
  metastring?: string;
  children: React.ReactNode;
}) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);

  const highlightedLines = useMemo(() => parseLineHighlight(metastring), [metastring]);

  useEffect(() => {
    if (codeRef.current) {
      if (typeof children === "string") {
        codeRef.current.textContent = children;
      }

      hljs.highlightElement(codeRef.current);

      const rawHtml = codeRef.current.innerHTML;
      const lines = rawHtml.split(/\r?\n/);

      if (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
      }

      const isShell = SHELL_LANGUAGES.has(title.toLowerCase());
      const wrappedHtml = lines
        .map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = highlightedLines.has(lineNum);
          const highlightClass = isHighlighted
            ? "bg-foreground/10 border-l-2 border-foreground/40 -mx-4 px-4"
            : "";
          const processedLine = isShell ? highlightShellCommands(line) : line;
          return `<span class="code-line ${highlightClass}">${processedLine || " "}</span>`;
        })
        .join("");

      codeRef.current.innerHTML = wrappedHtml;
    }
  }, [children, title, highlightedLines]);

  const handleCopy = () => {
    if (typeof children === "string") {
      navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-5 rounded-md border border-[#222222] bg-[#0A0A0A] overflow-hidden shadow-lg group text-[#E8E8E8] light:border-white/60 light:bg-white/40 light:backdrop-blur-md light:text-[#333333] light:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="flex items-center justify-between border-b border-[#222222] bg-[#0D0D0D] px-3 py-2 select-none light:border-white/60 light:bg-white/50">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="h-3 w-3 rounded-full bg-[oklch(0.7_0.25_25)]" />
          <span className="h-3 w-3 rounded-full bg-[oklch(0.82_0.18_80)]" />
          <span className="h-3 w-3 rounded-full bg-white/20 light:bg-black/20" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#999999] ml-4 truncate light:text-[#666666]">
          ~ / {title}
        </span>
        <div className="flex items-center gap-2">
          {/* Line Numbers Toggle */}
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`p-1 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 ${
              showLineNumbers
                ? "text-foreground bg-foreground/10"
                : "text-[#999999] hover:text-[#E8E8E8] hover:bg-[#1A1A1A] light:text-[#666666] light:hover:text-[#222222] light:hover:bg-black/5"
            }`}
            title="Toggle line numbers"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>

          {/* Wrap Toggle */}
          <button
            onClick={() => setIsWrapped(!isWrapped)}
            className={`p-1 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 ${
              isWrapped
                ? "text-foreground bg-foreground/10"
                : "text-[#999999] hover:text-[#E8E8E8] hover:bg-[#1A1A1A] light:text-[#666666] light:hover:text-[#222222] light:hover:bg-black/5"
            }`}
            title="Toggle line wrapping"
          >
            <WrapText className="h-3.5 w-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="text-[#999999] hover:text-[#E8E8E8] hover:bg-[#1A1A1A] light:text-[#666666] light:hover:text-[#222222] light:hover:bg-black/5 transition-colors p-1 rounded cursor-pointer focus-visible:outline-none"
            title="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-foreground" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      <pre
        className={`px-4 py-3 text-[12.5px] leading-relaxed text-[#E8E8E8] light:text-[#24292e] font-mono ${
          isWrapped ? "whitespace-pre-wrap break-all" : "whitespace-pre overflow-x-auto"
        }`}
      >
        <code
          ref={codeRef}
          className={`language-${title} !bg-transparent !p-0 ${
            showLineNumbers ? "show-line-numbers" : ""
          }`}
        >
          {children}
        </code>
      </pre>
    </div>
  );
}
