import React, { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import { Check, Copy } from "lucide-react";

export function TerminalCode({
  title = "bash",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [children, title]);

  const handleCopy = () => {
    if (typeof children === "string") {
      navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-5 rounded-md border border-panel-border bg-panel/40 overflow-hidden shadow-lg group">
      <div className="flex items-center justify-between border-b border-panel-border bg-panel/80 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[oklch(0.7_0.25_25)]" />
          <span className="h-3 w-3 rounded-full bg-[oklch(0.82_0.18_80)]" />
          <span className="h-3 w-3 rounded-full bg-neon-green" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-4">
          ~ / {title}
        </span>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-neon-green" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[12.5px] leading-relaxed text-foreground/90 font-mono">
        <code ref={codeRef} className={`language-${title} !bg-transparent !p-0`}>
          {children}
        </code>
      </pre>
    </div>
  );
}

