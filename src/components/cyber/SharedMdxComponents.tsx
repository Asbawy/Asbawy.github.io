import React, { useMemo } from "react";
import { TerminalCode } from "@/components/cyber/TerminalCode";
import { Mermaid } from "@/components/cyber/Mermaid";
import { SpoilerFlag, KillChain, SkillMatrix, CategoryIcon } from "@/components/cyber/WriteupComponents";

export function useSharedMdxComponents(
  setLightboxSrc?: (src: string) => void
) {
  return useMemo(
    () => ({
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
        const generatedId = typeof props.children === "string"
          ? props.children.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
          : undefined;
        return (
          <div className="mt-16 mb-8 max-w-[75ch]">
            <div className="flex items-center gap-3 border-b border-foreground/15 pb-4">
              <span className="bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded text-sm font-mono font-bold">_</span>
              <h2
                id={props.id || generatedId}
                className="scroll-mt-24 font-mono text-2xl md:text-3xl font-bold text-foreground"
                {...props}
              />
            </div>
          </div>
        );
      },
      h3: (props: any) => {
        const generatedId = typeof props.children === "string"
          ? props.children.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
          : undefined;
        return (
          <h3
            id={props.id || generatedId}
            className="scroll-mt-24 mt-12 mb-5 font-mono text-xl font-bold text-foreground flex items-center gap-2.5"
          >
            <span className="text-threat-mid font-bold text-lg animate-pulse">::</span>
            <span {...props} />
          </h3>
        );
      },
      h4: (props: any) => (
        <h4 className="mt-10 mb-4 font-mono text-lg font-bold text-foreground/80 flex items-center gap-2">
          <span className="text-foreground/40 text-sm">{'>'}</span>
          <span {...props} />
        </h4>
      ),
      p: (props: any) => <p className="my-6 text-[16px] md:text-[17px] leading-[1.8] text-foreground/80 max-w-[75ch] tracking-wide" {...props} />,
      ul: (props: any) => (
        <ul className="my-6 space-y-3 text-[16px] md:text-[17px] leading-[1.8] text-foreground/80 list-none max-w-[75ch]" {...props} />
      ),
      ol: (props: any) => (
        <ol className="my-6 space-y-3 text-[16px] md:text-[17px] leading-[1.8] text-foreground/80 list-decimal ml-6 max-w-[75ch] font-mono marker:text-accent-primary marker:font-bold" {...props} />
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
        <div className="my-14 max-w-[75ch] flex items-center gap-4 opacity-70">
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
        <figure className="my-10 max-w-[75ch] group cursor-zoom-in" onClick={() => setLightboxSrc?.(props.src)}>
          <div className="relative rounded-lg border border-foreground/10 bg-background overflow-hidden shadow-md">
            <div className="bg-foreground/5 border-b border-foreground/10 px-3 py-1.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-threat-high/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-threat-mid/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent-primary/60" />
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
              <img
                {...props}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 border border-foreground/5 z-20 pointer-events-none group-hover:border-accent-primary/40 transition-colors duration-300"></div>
            </div>
          </div>
          {props.alt && (
            <figcaption className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
              <span className="text-accent-primary opacity-60 mr-2">_img:</span>
              {props.alt}
            </figcaption>
          )}
        </figure>
      ),
      table: (props: any) => (
        <div className="my-8 overflow-x-auto rounded-lg border border-foreground/10 bg-background shadow-sm max-w-[75ch]">
          <table className="w-full text-left border-collapse font-mono text-[13px]" {...props} />
        </div>
      ),
      thead: (props: any) => <thead className="bg-foreground/5 border-b-2 border-foreground/10 text-foreground/90 uppercase tracking-wider text-xs" {...props} />,
      tr: (props: any) => <tr className="border-b border-foreground/5 hover:bg-foreground/[0.03] transition-colors" {...props} />,
      th: (props: any) => <th className="px-5 py-4 font-bold text-foreground" {...props} />,
      td: (props: any) => <td className="px-5 py-4 text-foreground/80 align-top" {...props} />,
      blockquote: (props: any) => (
        <div className="my-10 max-w-[75ch] relative group">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-accent-secondary/50 rounded-full transition-all group-hover:bg-accent-secondary group-hover:shadow-[0_0_10px_rgba(var(--color-accent-secondary-rgb),0.5)]" />
          <blockquote className="bg-foreground/[0.02] border border-foreground/5 rounded-r-lg p-6 font-mono text-[14px] text-foreground/70 italic shadow-sm leading-relaxed" {...props} />
        </div>
      ),
      // Custom specialized components
      SpoilerFlag,
      KillChain,
      SkillMatrix,
      CategoryIcon,
      Callout: ({ type, title, children }: any) => {
        const isDanger = type === "danger" || type === "warning";
        const isSuccess = type === "success";
        
        // Tailwind string building safe approach
        let colorTheme = {
          border: "border-accent-secondary/30",
          bg: "bg-accent-secondary/10",
          text: "text-accent-secondary",
          badge: "bg-accent-secondary",
          icon: "i"
        };
        
        if (isDanger) {
          colorTheme = {
            border: "border-threat-high/30",
            bg: "bg-threat-high/10",
            text: "text-threat-high",
            badge: "bg-threat-high",
            icon: "!"
          };
        } else if (isSuccess) {
          colorTheme = {
            border: "border-accent-primary/30",
            bg: "bg-accent-primary/10",
            text: "text-accent-primary",
            badge: "bg-accent-primary",
            icon: "✓"
          };
        }

        return (
          <div className={`my-10 max-w-[75ch] rounded-lg border ${colorTheme.border} bg-background overflow-hidden shadow-lg`}>
            {/* Callout Top Bar */}
            <div className={`${colorTheme.bg} border-b ${colorTheme.border} px-4 py-2 flex items-center justify-between`}>
              <div className={`flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider ${colorTheme.text}`}>
                <span className={`flex items-center justify-center w-4 h-4 rounded-full border border-current text-[10px]`}>{colorTheme.icon}</span>
                <span>{title || (isDanger ? "SYS.WARNING" : isSuccess ? "SYS.SUCCESS" : "SYS.INFO")}</span>
              </div>
              <div className={`flex gap-1.5 opacity-50`}>
                <span className={`w-2.5 h-2.5 rounded-full ${colorTheme.badge} animate-pulse`} />
                <span className={`w-2.5 h-2.5 rounded-full ${colorTheme.badge} opacity-40`} />
              </div>
            </div>
            {/* Content */}
            <div className={`p-5 text-[15px] text-foreground/90 leading-relaxed font-sans`}>
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
      Tabs: ({ children }: any) => {
        return (
          <div className="my-8 border border-foreground/10 bg-foreground/[0.02] rounded-md p-5 space-y-6 max-w-[75ch]">
            {children}
          </div>
        );
      },
      Tab: ({ label, children }: any) => {
        return (
          <div>
            <div className="text-foreground/90 font-mono text-xs uppercase mb-4 pb-1.5 border-b border-foreground/10 inline-block tracking-wider">
              {label}
            </div>
            {children}
          </div>
        );
      },
    }),
    [setLightboxSrc]
  );
}
