import { SideNav, TopBar } from "./SideNav";

export function CyberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <SideNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-panel-border px-6 py-4 font-mono text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>// © 2026 Asbawy — personal blog</span>
          <span className="text-neon-green/70">connection: encrypted · latency: 12ms</span>
        </footer>
      </div>
    </div>
  );
}

export function Panel({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-panel-border bg-panel/60 backdrop-blur-sm overflow-hidden ${className}`}
    >
      {title && (
        <header className="flex items-center justify-between border-b border-panel-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="text-neon-green">▸</span>
            {title}
          </span>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Tag({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "green" | "blue" | "red" | "amber";
}) {
  const styles: Record<string, string> = {
    default: "border-panel-border text-muted-foreground",
    green: "border-neon-green/40 text-neon-green bg-neon-green/5",
    blue: "border-neon-blue/40 text-neon-blue bg-neon-blue/5",
    red: "border-threat-high/50 text-threat-high bg-threat-high/10",
    amber: "border-threat-mid/50 text-threat-mid bg-threat-mid/10",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export function tagVariantFor(tag: string) {
  const t = tag.toLowerCase();
  if (["rce", "ato", "critical"].includes(t)) return "red" as const;
  if (["xss", "idor", "ssrf", "exfil"].includes(t)) return "amber" as const;
  if (["jwt", "llm", "prompt injection"].includes(t)) return "blue" as const;
  return "green" as const;
}