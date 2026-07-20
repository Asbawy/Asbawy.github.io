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
  if (!html) return html;

  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Classes to skip — never re-color tokens inside comments or strings
  const SKIP_CLASSES = ["hljs-comment", "hljs-string", "hljs-meta"];

  // Order matters! Longer/more-specific patterns must come first:
  //  1. URLs (before IPs so http://10.10.14.5/foo stays as one URL)
  //  2. IPs
  //  3. PowerShell cmdlets — Verb-Noun pattern (before options so -Noun isn't stolen)
  //  4. Hardcoded tool/command names
  //  5. PowerShell variables ($name)
  //  6. Option flags (-flag, --flag)
  //  7. Pipe operator (|)
  const masterPattern = new RegExp(
    [
      // 0: Shell/PowerShell comments (fallback if hljs misses them). Must come first so IPs inside comments aren't colored!
      `((?:^|\\s+)#.*)`,
      // 1: URLs
      `(https?://[^\\s'"<>&]+|ftp://[^\\s'"<>&]+)`,
      // 2: IPv4 addresses
      `(\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(?:/\\d{1,2})?\\b)`,
      // 3: PowerShell cmdlets — Verb-Noun (e.g. ConvertTo-SecureString, Add-DomainGroupMember)
      `(\\b(?:Get|Set|New|Add|Remove|Clear|Import|Export|Start|Stop|Restart|Enable|Disable|Invoke|Register|Unregister|Test|Update|Find|Install|Uninstall|Save|Publish|Write|Read|Out|Enter|Exit|Connect|Disconnect|Move|Copy|Rename|Select|Where|ForEach|Sort|Group|Measure|Compare|Join|Split|Format|ConvertTo|ConvertFrom|Convert|Assert|Wait|Use|Show|Hide|Protect|Unprotect|Grant|Revoke|Block|Unblock|Send|Receive|Approve|Deny|Debug|Trace|Confirm|Submit|Undo|Redo|Open|Close|Lock|Unlock|Watch|Resolve|Expand|Compress|Push|Pop|Suspend|Resume|Reset|Checkpoint|Restore|Repair|Optimize|Mount|Dismount|Merge|Publish|Limit|Initialize|Request|Sync)-[A-Z][a-zA-Z]+\\b)`,
      // 4: Hardcoded tools & commands
      `(\\b(?:msfvenom|grep|awk|sed|find|xargs|bloodyAD|Rubeus\\.exe|getTGT\\.py|gets4uTicket\\.py|impacket-psexec|impacket-secretsdump|impacket-getTGT|impacket-getST|impacket-ticketer|impacket-ntlmrelayx|dsacls|secretsdump|ticketer|SharpGPOAbuse|Certify|Certipy|ntlmrelayx|PetitPotam|bloodyad|crackmapexec|evil-winrm|bloodhound-python|kerbrute|mimikatz|hashcat|john|python3?|bash|sh|sudo|cmd|powershell|pwsh|curl|wget|scp|rsync|nc|ncat|socat|ssh|net|copy|move|del|type|certutil(?:\\.exe)?|bitsadmin|impacket-smbserver|ruby|php|perl|xxd|base64|openssl|chisel|nmap|proxychains|smbclient|rpcclient|ldapsearch|winrs|wmic|cat|ls|cd|echo|chmod|chown|tar|mkdir|rm|mv|cp|ping|ifconfig|ip|whoami|id|hostname|uname|iwr|iex|IEX|IWR)\\b)`,
      // 5: PowerShell variables ($name, $_, $env:PATH, etc.)
      `(\\$(?:[a-zA-Z_]\\w*(?::[a-zA-Z_]\\w*)?|_))`,
      // 6: Option flags (-Verbose, --output, etc.)
      `(\\B-{1,2}[a-zA-Z][a-zA-Z0-9_]*)`,
      // 7: Pipe
      `(\\|)`,
    ].join("|"),
    "g",
  );

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      // Skip elements with these hljs classes
      if (SKIP_CLASSES.some((c) => el.classList?.contains(c))) return;
      // Walk children (snapshot to avoid live-mutation)
      Array.from(el.childNodes).forEach(walk);
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      if (!text || !text.trim()) return;

      // Check for any match first to avoid unnecessary DOM work
      masterPattern.lastIndex = 0;
      if (!masterPattern.test(text)) return;
      masterPattern.lastIndex = 0;

      // Build a document fragment with highlighted spans
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = masterPattern.exec(text)) !== null) {
        const [full, comment, url, ip, psCmdlet, command, psVar, option, pipe] = match;
        const matchStart = match.index;

        // Add any text before this match
        if (matchStart > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));
        }

        // Create the colored span
        const span = document.createElement("span");
        span.className = "font-mono";
        span.textContent = full;

        if (comment) {
          span.style.color = "var(--code-comment)";
          span.style.fontStyle = "italic";
        } else if (url) {
          span.style.color = "var(--code-url)";
        } else if (ip) {
          span.style.color = "var(--code-ip)";
        } else if (psCmdlet) {
          span.style.color = "var(--code-cmdlet)";
          span.style.fontWeight = "600";
        } else if (command) {
          span.style.color = "var(--code-command)";
          span.style.fontWeight = "600";
        } else if (psVar) {
          span.style.color = "var(--code-psvar)";
        } else if (option) {
          span.style.color = "var(--code-option)";
        } else if (pipe) {
          span.style.color = "var(--code-pipe)";
          span.style.fontWeight = "700";
        }

        frag.appendChild(span);
        lastIndex = matchStart + full.length;
      }

      // Add remaining text after the last match
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      node.parentNode?.replaceChild(frag, node);
    }
  };

  Array.from(temp.childNodes).forEach(walk);
  return temp.innerHTML;
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
    <div className="my-5 rounded-md border border-border bg-card/65 backdrop-blur-sm overflow-hidden shadow-lg group text-foreground light:border-border/60 light:bg-white/40 light:backdrop-blur-md light:text-[#333333] light:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="flex items-center justify-between border-b border-border bg-secondary/80 px-3 py-2 select-none light:border-border/60 light:bg-white/50">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="h-3 w-3 rounded-full bg-[oklch(0.7_0.25_25)]" />
          <span className="h-3 w-3 rounded-full bg-[oklch(0.82_0.18_80)]" />
          <span className="h-3 w-3 rounded-full bg-white/20 light:bg-black/20" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-4 truncate light:text-[#666666]">
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
        className={`px-4 py-3 text-[12.5px] leading-relaxed text-foreground/90 font-mono ${
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
