import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense, useMemo } from "react";
import { FileText, ChevronRight } from "lucide-react";
import { cheatsheetFiles, CheatsheetMdxComponents } from "@/data/cheatsheets";
import { TerminalCode } from "@/components/cyber/TerminalCode";

export const Route = createFileRoute("/cheatsheet/$")({
  loader: async ({ params }) => {
    const slug = params._splat;
    const meta = cheatsheetFiles.find((c) => c.path === slug);
    if (!meta) throw notFound();
    return { slug, meta: meta.meta };
  },
  component: CheatsheetViewer,
  notFoundComponent: () => (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground font-mono opacity-50 p-8">
      <FileText className="h-12 w-12 mb-4" />
      <p className="text-sm">File not found.</p>
      <p className="text-xs mt-1 text-muted-foreground/60">Check the path and try again.</p>
    </div>
  ),
});

function CheatsheetViewer() {
  const { slug, meta } = Route.useLoaderData();
  const MDXContent = CheatsheetMdxComponents[slug] || (() => <div>Component not found</div>);

  const breadcrumbs = slug.split("/");

  const components = useMemo(() => ({
    h1: (props: any) => (
      <h1 className="mt-6 mb-4 text-2xl md:text-3xl font-bold text-foreground font-mono" {...props} />
    ),
    h2: (props: any) => {
      const generatedId = typeof props.children === 'string' ? props.children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;
      return (
      <h2 id={props.id || generatedId} className="scroll-mt-24 mt-10 mb-4 font-mono text-lg text-foreground border-l-2 border-neon-green pl-3" {...props}>
        <span className="text-neon-green mr-2">▸</span>{props.children}
      </h2>
      );
    },
    h3: (props: any) => {
      const generatedId = typeof props.children === 'string' ? props.children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;
      return (
      <h3 id={props.id || generatedId} className="mt-8 mb-3 font-mono text-base text-foreground/90" {...props} />
      );
    },
    p: (props: any) => (
      <p className="my-4 text-[15px] leading-7 text-foreground/85" {...props} />
    ),
    ul: (props: any) => (
      <ul className="my-4 space-y-2 text-[15px] leading-7 text-foreground/85 list-disc ml-5" {...props} />
    ),
    ol: (props: any) => (
      <ol className="my-4 space-y-2 text-[15px] leading-7 text-foreground/85 list-decimal ml-5" {...props} />
    ),
    li: (props: any) => (
      <li className="marker:text-neon-green" {...props} />
    ),
    a: (props: any) => {
      const isExternal = typeof props.href === 'string' && props.href.startsWith('http');
      return (
      <a 
        className="text-neon-green hover:brightness-125 underline underline-offset-2 transition-all" 
        target={isExternal ? "_blank" : undefined} 
        rel={isExternal ? "noopener noreferrer" : undefined} 
        {...props} 
      />
      );
    },
    code: (props: any) => {
      if (props.className) {
        const language = props.className.replace(/language-/, "");
        return <TerminalCode title={language}>{props.children as string}</TerminalCode>;
      }
      return (
        <code className="rounded bg-muted/50 border border-panel-border px-1.5 py-0.5 text-[12px] text-neon-green font-mono">
          {props.children}
        </code>
      );
    },
    pre: (props: any) => <>{props.children}</>,
    table: (props: any) => (
      <div className="my-6 overflow-x-auto rounded border border-panel-border">
        <table className="w-full min-w-[320px] border-collapse font-mono text-[13px]" {...props} />
      </div>
    ),
    thead: (props: any) => <thead {...props} />,
    tr: (props: any) => <tr className="border-b border-panel-border/50 last:border-0" {...props} />,
    th: (props: any) => <th className="px-3 py-2 text-left font-semibold text-neon-green border-b border-panel-border bg-panel/50" {...props} />,
    td: (props: any) => <td className="px-3 py-2 align-top text-foreground/85" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-neon-green pl-4 italic my-4 text-foreground/70 bg-panel/60 py-3 px-1 rounded-r" {...props} />
    ),
    Callout: ({ type, children }: any) => {
      const isDanger = type === "danger" || type === "warning";
      return (
        <div className={`my-4 border-l-4 p-4 rounded-r text-[14px] ${isDanger ? "border-threat-high bg-threat-high/10 text-foreground" : "border-neon-green bg-neon-green/5 text-foreground"}`}>
          {children}
        </div>
      );
    },
    CodeBlock: ({ language, title, children }: any) => {
      return (
        <div className="my-6">
          {title && <div className="text-neon-green font-mono text-xs mb-1 uppercase opacity-80">{title}</div>}
          <TerminalCode title={language}>{children}</TerminalCode>
        </div>
      );
    },
    Tabs: ({ children }: any) => {
      return <div className="my-6 border border-panel-border bg-panel/30 rounded-md p-4 space-y-6">{children}</div>;
    },
    Tab: ({ label, children }: any) => {
      return (
        <div>
          <div className="text-neon-green font-mono text-xs uppercase mb-3 pb-1 border-b border-panel-border/50 inline-block">{label}</div>
          {children}
        </div>
      );
    },
  }), []);

  return (
    <div className="h-full flex flex-col">
      {/* File tab bar */}
      <div className="shrink-0 border-b border-panel-border bg-panel/50">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1 px-4 py-2 font-mono text-[11px] text-muted-foreground">
          <span className="text-neon-green">~</span>
          {breadcrumbs.map((segment, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <span className={i === breadcrumbs.length - 1 ? "text-foreground" : ""}>
                {i === breadcrumbs.length - 1 ? `${segment}.mdx` : segment}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-8 bg-background/95 rounded-xl mx-4 my-6 border border-panel-border/30">
          {/* Title from frontmatter */}
          {meta.title && (
            <div className="mb-8 pb-6 border-b border-panel-border/50">
              <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground">
                {meta.title}
              </h1>
              {meta.excerpt && (
                <p className="mt-2 text-sm text-muted-foreground">{meta.excerpt}</p>
              )}
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <Suspense
              fallback={
                <div className="flex items-center gap-2 animate-pulse text-neon-green font-mono text-sm py-8">
                  <span className="inline-block w-2 h-4 bg-neon-green/80 animate-pulse" />
                  Reading sector...
                </div>
              }
            >
              <MDXContent components={components} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

