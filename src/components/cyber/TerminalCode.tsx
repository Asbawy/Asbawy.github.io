export function TerminalCode({
  title = "bash",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-5 rounded-md border border-panel-border bg-[oklch(0.12_0.02_260)] overflow-hidden shadow-lg">
      <div className="flex items-center justify-between border-b border-panel-border bg-panel/80 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[oklch(0.7_0.25_25)]" />
          <span className="h-3 w-3 rounded-full bg-[oklch(0.82_0.18_80)]" />
          <span className="h-3 w-3 rounded-full bg-neon-green" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          ~ / {title}
        </span>
        <span className="h-3 w-8" />
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[12.5px] leading-relaxed text-foreground/90 font-mono">
        {children}
      </pre>
    </div>
  );
}