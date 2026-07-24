import React, { useEffect, useRef, useState, useMemo } from "react";
import hljs from "highlight.js";
import { Check, Copy, WrapText, ListOrdered, ChevronDown, ChevronUp } from "lucide-react";

const COLLAPSE_LINE_THRESHOLD = 10;

/**
 * Recursively extracts plain text from React nodes/children, preventing "[object Object]" outputs.
 */
function getNodeText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }
  if (React.isValidElement(node)) {
    return getNodeText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

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
  if (!html || typeof document === "undefined") return html;

  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Classes to skip — never re-color tokens inside comments or strings
  const SKIP_CLASSES = ["hljs-comment", "hljs-string", "hljs-meta"];

  const masterPattern = new RegExp(
    [
      `((?:^|\\s+)#.*)`,
      `(https?://[^\\s'"<>&]+|ftp://[^\\s'"<>&]+)`,
      `(\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(?:/\\d{1,2})?\\b)`,
      `(\\b(?:Get|Set|New|Add|Remove|Clear|Import|Export|Start|Stop|Restart|Enable|Disable|Invoke|Register|Unregister|Test|Update|Find|Install|Uninstall|Save|Publish|Write|Read|Out|Enter|Exit|Connect|Disconnect|Move|Copy|Rename|Select|Where|ForEach|Sort|Group|Measure|Compare|Join|Split|Format|ConvertTo|ConvertFrom|Convert|Assert|Wait|Use|Show|Hide|Protect|Unprotect|Grant|Revoke|Block|Unblock|Send|Receive|Approve|Deny|Debug|Trace|Confirm|Submit|Undo|Redo|Open|Close|Lock|Unlock|Watch|Resolve|Expand|Compress|Push|Pop|Suspend|Resume|Reset|Checkpoint|Restore|Repair|Optimize|Mount|Dismount|Merge|Publish|Limit|Initialize|Request|Sync)-[A-Z][a-zA-Z]+\\b)`,
      `(\\b(?:msfvenom|grep|awk|sed|find|xargs|bloodyAD|Rubeus\\.exe|getTGT\\.py|gets4uTicket\\.py|impacket-psexec|impacket-secretsdump|impacket-getTGT|impacket-getST|impacket-ticketer|impacket-ntlmrelayx|dsacls|secretsdump|ticketer|SharpGPOAbuse|Certify|Certipy|ntlmrelayx|PetitPotam|bloodyad|crackmapexec|evil-winrm|bloodhound-python|kerbrute|mimikatz|hashcat|john|python3?|bash|sh|sudo|cmd|powershell|pwsh|curl|wget|scp|rsync|nc|ncat|socat|ssh|net|copy|move|del|type|certutil(?:\\.exe)?|bitsadmin|impacket-smbserver|ruby|php|perl|xxd|base64|openssl|chisel|nmap|proxychains|smbclient|rpcclient|ldapsearch|winrs|wmic|cat|ls|cd|echo|chmod|chown|tar|mkdir|rm|mv|cp|ping|ifconfig|ip|whoami|id|hostname|uname|iwr|iex|IEX|IWR)\\b)`,
      `(\\$(?:[a-zA-Z_]\\w*(?::[a-zA-Z_]\\w*)?|_))`,
      `(\\B-{1,2}[a-zA-Z][a-zA-Z0-9_]*)`,
      `(\\|)`,
    ].join("|"),
    "g",
  );

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (SKIP_CLASSES.some((c) => el.classList?.contains(c))) return;
      Array.from(el.childNodes).forEach(walk);
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      if (!text || !text.trim()) return;

      masterPattern.lastIndex = 0;
      if (!masterPattern.test(text)) return;
      masterPattern.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = masterPattern.exec(text)) !== null) {
        const [full, comment, url, ip, psCmdlet, command, psVar, option, pipe] = match;
        const matchStart = match.index;

        if (matchStart > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));
        }

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

      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      node.parentNode?.replaceChild(frag, node);
    }
  };

  Array.from(temp.childNodes).forEach(walk);
  return temp.innerHTML;
}

/**
 * Safely splits highlighted HTML into lines while keeping HTML tags balanced per line.
 */
function splitHtmlIntoLines(html: string): string[] {
  const lines: string[] = [];
  let currentLine = "";
  const openTags: string[] = [];

  const tagRegex = /(<\/?[a-z0-9]+[^>]*>)|(\r?\n)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html)) !== null) {
    const textChunk = html.slice(lastIndex, match.index);
    currentLine += textChunk;
    lastIndex = tagRegex.lastIndex;

    const [, tag, newline] = match;

    if (newline) {
      let closedLine = currentLine;
      for (let i = openTags.length - 1; i >= 0; i--) {
        const tagName = openTags[i].match(/<([a-z0-9]+)/i)?.[1];
        if (tagName) closedLine += `</${tagName}>`;
      }
      lines.push(closedLine);
      currentLine = openTags.join("");
    } else if (tag) {
      if (tag.startsWith("</")) {
        openTags.pop();
      } else if (!tag.endsWith("/>")) {
        openTags.push(tag);
      }
      currentLine += tag;
    }
  }

  currentLine += html.slice(lastIndex);
  if (currentLine.length > 0 || lines.length === 0) {
    lines.push(currentLine);
  }

  return lines;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const highlightedLines = useMemo(() => parseLineHighlight(metastring), [metastring]);

  const rawCodeString = useMemo(() => {
    return getNodeText(children);
  }, [children]);

  // Compute processed lines with balanced HTML highlighting
  const processedLines = useMemo(() => {
    let highlightedHtml = "";
    try {
      if (hljs.getLanguage(title)) {
        highlightedHtml = hljs.highlight(rawCodeString, { language: title }).value;
      } else {
        highlightedHtml = hljs.highlightAuto(rawCodeString).value;
      }
    } catch {
      highlightedHtml = rawCodeString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    const isShell = SHELL_LANGUAGES.has(title.toLowerCase());
    if (isShell) {
      highlightedHtml = highlightShellCommands(highlightedHtml);
    }

    const lines = splitHtmlIntoLines(highlightedHtml);
    if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }
    return lines;
  }, [rawCodeString, title]);

  const totalLines = processedLines.length;
  const isCollapsible = totalLines > COLLAPSE_LINE_THRESHOLD;
  const shouldCollapse = isCollapsible && !isExpanded;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCodeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleExpand = () => {
    if (isExpanded) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = scrollTop + rect.top - 80;
        setIsExpanded(false);
        setTimeout(() => {
          window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
        }, 10);
      } else {
        setIsExpanded(false);
      }
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="my-6 rounded-xl border border-white/[0.08] bg-[#0a0a0c]/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden group text-foreground light:border-border/60 light:bg-white/40 light:backdrop-blur-md light:text-[#333333] light:shadow-[0_8px_30px_rgb(0,0,0,0.06)] max-w-[75ch]"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.05] bg-black/40 px-4 py-2.5 select-none light:border-border/60 light:bg-white/50">
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-[0_0_5px_rgba(255,95,86,0.3)] border border-[#e0443e]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-[0_0_5px_rgba(255,189,46,0.3)] border border-[#dea123]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f] shadow-[0_0_5px_rgba(39,201,63,0.3)] border border-[#1aab29]" />
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

      {/* Code Container */}
      <div className="relative">
        <div
          className={`py-3 transition-[max-height] duration-300 ease-in-out ${
            isWrapped ? "overflow-x-hidden" : "overflow-x-auto"
          }`}
          style={
            shouldCollapse
              ? { maxHeight: "250px", overflowY: "hidden" }
              : { maxHeight: "none" }
          }
        >
          {processedLines.map((lineHtml, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightedLines.has(lineNum);

            return (
              <div
                key={idx}
                className={`flex flex-row items-baseline w-full px-4 hover:bg-foreground/[0.02] ${
                  isHighlighted ? "bg-foreground/10 border-l-2 border-foreground/40" : ""
                }`}
              >
                {showLineNumbers && (
                  <span className="w-9 shrink-0 select-none text-right pr-3 font-mono text-[11px] text-muted-foreground/40">
                    {lineNum}
                  </span>
                )}
                <span
                  className={`grow font-mono text-[12.5px] leading-[1.6] text-foreground/90 ${
                    isWrapped ? "whitespace-pre-wrap break-all" : "whitespace-pre"
                  }`}
                  dangerouslySetInnerHTML={{ __html: lineHtml || "&nbsp;" }}
                />
              </div>
            );
          })}
        </div>

        {/* Gradient Fade Mask when Collapsed */}
        {shouldCollapse && (
          <div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, hsl(var(--card)) 100%)",
            }}
          />
        )}
      </div>

      {/* Expand / Collapse Action Bar */}
      {isCollapsible && (
        <button
          onClick={handleToggleExpand}
          className="group/toggle flex items-center justify-center gap-2 w-full py-2.5 px-4 border-t border-border/50 bg-secondary/40 hover:bg-secondary/80 transition-all duration-200 cursor-pointer select-none light:bg-white/30 light:hover:bg-white/60 light:border-border/30"
          title={isExpanded ? "Show first 10 lines" : `Show all ${totalLines} lines`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 text-muted-foreground group-hover/toggle:text-foreground transition-transform duration-200 group-hover/toggle:-translate-y-0.5" />
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground group-hover/toggle:text-foreground">
                Show first 10 lines
              </span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover/toggle:text-foreground transition-transform duration-200 group-hover/toggle:translate-y-0.5" />
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground group-hover/toggle:text-foreground">
                Show all {totalLines} lines
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
