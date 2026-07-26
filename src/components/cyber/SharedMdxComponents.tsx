import React, { useMemo, useState } from "react";
import { TerminalCode } from "@/components/cyber/TerminalCode";
import { Mermaid } from "@/components/cyber/Mermaid";
import { SpoilerFlag, KillChain, SkillMatrix, CategoryIcon } from "@/components/cyber/WriteupComponents";

/**
 * Recursively extracts plain text from React nodes/children.
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

/**
 * Robust heading ID generation for TOC linking and anchor scroll.
 */
function getHeadingId(id?: string, children?: React.ReactNode, seen?: Map<string, number>): string | undefined {
  if (id) return id;
  const text = getNodeText(children);
  if (!text || !text.trim()) return undefined;
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!seen) return base;
  const count = (seen.get(base) || 0) + 1;
  seen.set(base, count);
  return count > 1 ? `${base}-${count}` : base;
}

/**
 * Interactive client-side Tabs component for cheatsheets.
 */
function InteractiveTabs({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<{ label?: string; children?: React.ReactNode }> =>
      React.isValidElement(child),
  );

  const [activeIdx, setActiveIdx] = useState(0);

  if (tabs.length === 0) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % tabs.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIdx((prev) => (prev - 1 + tabs.length) % tabs.length);
    }
  };

  return (
    <div
      className={`my-8 rounded-lg border border-white/[0.08] bg-background/60 shadow-lg overflow-hidden max-w-[75ch] ${className}`}
    >
      {/* Tab Header Bar */}
      <div
        role="tablist"
        aria-label="Cheatsheet command tabs"
        className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-white/[0.08] bg-white/[0.02]"
      >
        {tabs.map((tab, idx) => {
          const label = tab.props.label || `Tab ${idx + 1}`;
          const isActive = idx === activeIdx;
          return (
            <button
              key={idx}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIdx(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`
                px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-all duration-150 cursor-pointer
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50
                ${
                  isActive
                    ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"
                }
              `}
            >
              <span className="flex items-center gap-1.5">
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                )}
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div role="tabpanel" className="p-5 text-foreground/90 space-y-4">
        {tabs[activeIdx]?.props.children}
      </div>
    </div>
  );
}

function InteractiveTab({
  label,
  children,
}: {
  label?: string;
  children?: React.ReactNode;
}) {
  return <div>{children}</div>;
}

export function useSharedMdxComponents(
  setLightboxSrc?: (src: string) => void
) {
  const seenIds = useMemo(() => new Map<string, number>(), []);
  return useMemo(
    () => {
      seenIds.clear();
      return {
      h1: (props: any) => (
        <div className="mt-16 mb-10 max-w-[75ch] border border-accent-primary/30 bg-accent-primary/[0.03] p-6 md:p-8 rounded-lg shadow-[0_0_20px_rgba(var(--color-accent-primary-rgb),0.05)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-primary/50" />
          <div className="flex items-center gap-2 font-mono text-[11px] text-accent-primary mb-4 tracking-[0.2em] uppercase">
            <span className="flex items-center justify-center w-4 h-4 bg-accent-primary/20 rounded border border-accent-primary/50 animate-pulse">#</span>
            <span>sys.doc_init // root</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight" {...props} />
        </div>
      ),
      h2: (props: any) => {
        const generatedId = getHeadingId(props.id, props.children, seenIds);
        return (
          <div className="mt-16 mb-8 max-w-[75ch]">
            <div className="flex items-center gap-3 border-b border-foreground/15 pb-4">
              <span className="bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded text-sm font-mono font-bold">_</span>
              <h2
                id={generatedId}
                className="scroll-mt-24 font-mono text-2xl md:text-3xl font-bold text-foreground"
                {...props}
              />
            </div>
          </div>
        );
      },
      h3: (props: any) => {
        const generatedId = getHeadingId(props.id, props.children, seenIds);
        return (
          <h3
            id={generatedId}
            className="scroll-mt-24 mt-12 mb-5 font-mono text-xl font-bold text-foreground flex items-center gap-2.5"
          >
            <span className="text-threat-mid font-bold text-lg animate-pulse">::</span>
            <span {...props} />
          </h3>
        );
      },
      h4: (props: any) => {
        const generatedId = getHeadingId(props.id, props.children, seenIds);
        return (
          <h4
            id={generatedId}
            className="scroll-mt-24 mt-10 mb-4 font-mono text-lg font-bold text-foreground/80 flex items-center gap-2"
          >
            <span className="text-foreground/40 text-sm">{'>'}</span>
            <span {...props} />
          </h4>
        );
      },
      p: (props: any) => <p className="my-6 text-[16px] md:text-[17px] leading-[1.8] text-foreground/80 max-w-[80ch] tracking-wide" {...props} />,
      ul: (props: any) => (
        <ul className="my-6 space-y-3 text-[16px] md:text-[17px] leading-[1.8] text-foreground/80 list-none max-w-[80ch]" {...props} />
      ),
      ol: (props: any) => (
        <ol className="my-6 space-y-3 text-[16px] md:text-[17px] leading-[1.8] text-foreground/80 list-decimal ml-6 max-w-[80ch] font-sans marker:text-accent-primary marker:font-bold" {...props} />
      ),
      li: (props: any) => {
        const isListNone = props.className?.includes('list-none') ?? true;
        return (
          <li className="relative pl-7" {...props}>
            {isListNone && <span className="absolute left-0 top-[2px] text-accent-primary font-mono text-[15px] font-bold">▹</span>}
            {props.children}
          </li>
        );
      },
      hr: (props: any) => (
        <div className="my-14 max-w-[80ch] flex items-center gap-4 opacity-70">
          <div className="h-px bg-foreground/10 flex-1" />
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-foreground/30" />
            <span className="w-1 h-1 rounded-full bg-foreground/30" />
            <span className="w-1 h-1 rounded-full bg-foreground/30" />
          </div>
          <div className="h-px bg-foreground/10 flex-1" />
        </div>
      ),
      a: (props: any) => (
        <a
          className="text-accent-primary font-semibold border-b border-accent-primary/40 hover:border-accent-primary hover:bg-accent-primary/10 transition-all duration-200 relative group px-1 py-0.5 rounded-sm"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      ),
      strong: (props: any) => <strong className="font-bold text-foreground tracking-wide" {...props} />,
      code: (props: any) => {
        const isBlock =
          Boolean(props.className) ||
          (typeof props.children === "string" && props.children.includes("\n"));

        if (isBlock) {
          const language = props.className
            ? props.className.replace(/language-/, "").replace("hljs", "").trim() || "code"
            : "code";
          if (language === "mermaid") {
            return <Mermaid chart={props.children as string} />;
          }
          return <TerminalCode title={language}>{props.children as string}</TerminalCode>;
        }
        return (
          <code className="rounded border border-foreground/20 bg-foreground/10 px-1.5 py-0.5 text-[13.5px] text-accent-primary font-mono whitespace-pre-wrap break-words mx-0.5">
            {props.children}
          </code>
        );
      },
      pre: (props: any) => <>{props.children}</>,
      img: (props: any) => (
        <figure className="my-10 max-w-[80ch] group cursor-zoom-in" onClick={() => setLightboxSrc?.(props.src)}>
          <div className="relative rounded-lg border border-border bg-card overflow-hidden shadow-md">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
              <img
                {...props}
                className="w-full h-auto object-cover rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 border border-border/50 rounded-lg z-20 pointer-events-none group-hover:border-accent-primary/40 transition-colors duration-300"></div>
            </div>
          </div>
          {props.alt && (
            <figcaption className="mt-3 text-center font-sans text-xs text-muted-foreground">
              {props.alt}
            </figcaption>
          )}
        </figure>
      ),
      table: (props: any) => (
        <div className="my-8 overflow-x-auto rounded-lg border border-border bg-card shadow-md max-w-[80ch]">
          <table className="w-full text-left border-collapse font-sans text-[13.5px] md:text-[14px]" {...props} />
        </div>
      ),
      thead: (props: any) => (
        <thead className="bg-muted border-b border-border text-foreground uppercase tracking-wider text-[11.5px] font-bold" {...props} />
      ),
      tr: (props: any) => (
        <tr
          className="border-b border-border/50 last:border-0 even:bg-muted/30 hover:bg-muted/60 transition-colors duration-150"
          {...props}
        />
      ),
      th: (props: any) => (
        <th className="px-4 py-3.5 font-bold text-foreground tracking-wide whitespace-nowrap" {...props} />
      ),
      td: (props: any) => (
        <td className="px-4 py-3.5 text-foreground/80 align-top leading-relaxed" {...props} />
      ),
      blockquote: (props: any) => (
        <div className="my-10 max-w-[80ch] relative group">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-accent-secondary/50 rounded-full transition-all group-hover:bg-accent-secondary group-hover:shadow-[0_0_10px_rgba(var(--color-accent-secondary-rgb),0.5)]" />
          <blockquote className="bg-muted/30 border border-border rounded-r-lg p-6 font-sans text-[14px] text-foreground/80 italic shadow-sm leading-relaxed" {...props} />
        </div>
      ),
      // Custom specialized components
      SpoilerFlag,
      KillChain,
      SkillMatrix,
      CategoryIcon,
      Callout: ({ type, title, children }: any) => {
        const t = (type || "info").toLowerCase();
        let colorTheme = {
          border: "border-accent-link/30",
          bg: "bg-accent-link/10",
          text: "text-accent-link",
          badge: "bg-accent-link",
          icon: "ℹ",
          defaultTitle: "SYS.INFO",
        };

        if (t === "danger" || t === "error") {
          colorTheme = {
            border: "border-threat-high/30",
            bg: "bg-threat-high/10",
            text: "text-threat-high",
            badge: "bg-threat-high",
            icon: "✕",
            defaultTitle: "SYS.CRITICAL",
          };
        } else if (t === "warning" || t === "warn") {
          colorTheme = {
            border: "border-yellow-400/30",
            bg: "bg-yellow-400/10",
            text: "text-yellow-400",
            badge: "bg-yellow-400",
            icon: "▲",
            defaultTitle: "SYS.WARNING",
          };
        } else if (t === "success") {
          colorTheme = {
            border: "border-accent-primary/30",
            bg: "bg-accent-primary/10",
            text: "text-accent-primary",
            badge: "bg-accent-primary",
            icon: "✓",
            defaultTitle: "SYS.SUCCESS",
          };
        } else if (t === "tip") {
          colorTheme = {
            border: "border-accent-secondary/30",
            bg: "bg-accent-secondary/10",
            text: "text-accent-secondary",
            badge: "bg-accent-secondary",
            icon: "⚡",
            defaultTitle: "SYS.TIP",
          };
        }

        return (
          <div className={`my-8 max-w-[75ch] rounded-lg border ${colorTheme.border} bg-background/90 overflow-hidden shadow-md`}>
            {/* Callout Top Bar */}
            <div className={`${colorTheme.bg} border-b ${colorTheme.border} px-4 py-2 flex items-center justify-between`}>
              <div className={`flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider ${colorTheme.text}`}>
                <span className="flex items-center justify-center w-4 h-4 rounded-full border border-current text-[10px]">
                  {colorTheme.icon}
                </span>
                <span>{title || colorTheme.defaultTitle}</span>
              </div>
              <div className="flex gap-1.5 opacity-50">
                <span className={`w-2 h-2 rounded-full ${colorTheme.badge} animate-pulse`} />
                <span className={`w-2 h-2 rounded-full ${colorTheme.badge} opacity-40`} />
              </div>
            </div>
            {/* Content */}
            <div className="p-5 text-[14.5px] text-foreground/90 leading-relaxed font-sans">
              {children}
            </div>
          </div>
        );
      },
      CodeBlock: ({ language, title, children }: any) => {
        return (
          <div className="my-8 max-w-[75ch]">
            {title && (
              <div className="text-foreground/70 font-mono text-[11px] mb-1.5 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary"></span>
                {title}
              </div>
            )}
            <TerminalCode title={language}>{children}</TerminalCode>
          </div>
        );
      },
      Tabs: ({ children, className }: any) => {
        return <InteractiveTabs className={className}>{children}</InteractiveTabs>;
      },
      Tab: ({ label, children }: any) => {
        return <InteractiveTab label={label}>{children}</InteractiveTab>;
      },
    };
    },
    [setLightboxSrc, seenIds]
  );
}

