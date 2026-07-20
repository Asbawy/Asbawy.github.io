import { SideNav, TopBar } from "./SideNav";
import { CommandPalette } from "./CommandPalette";
import { postsMeta } from "@/data/posts";
import { cheatsheetFiles } from "@/data/cheatsheets";

export function handleTagClick(tag: string, navigate: any) {
  const normalizedTag = tag.toLowerCase().trim();
  const hasPosts = postsMeta.some((p) =>
    p.tags.some((t) => t.toLowerCase().trim() === normalizedTag),
  );
  const hasCheatsheets = cheatsheetFiles.some((c) =>
    c.meta.tags?.some((t) => t.toLowerCase().trim() === normalizedTag),
  );

  if (hasPosts && !hasCheatsheets) {
    navigate({ to: "/logs", search: { tag } });
  } else if (!hasPosts && hasCheatsheets) {
    navigate({ to: "/cheatsheet", search: { q: tag } });
  } else {
    navigate({ to: "/logs", search: { tag } });
  }
}

export function CyberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full text-foreground">
      <SideNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-glass-border px-6 py-4 font-mono text-[11px] text-muted-foreground">
          <span>© 2026 Asbawy</span>
        </footer>
      </div>
      <CommandPalette />
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
    <section className={`rounded-lg glass-panel overflow-hidden ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-glass-border bg-foreground/[0.02] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="text-foreground/30">—</span>
            {title}
          </span>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

const TAG_COLORS: Record<string, string> = {
  // OS & Platform Tags
  windows: "#00A4EF",
  linux: "#F5A623",
  macos: "#A8A8A8",
  android: "#3DDC84",
  ios: "#FC3D39",

  // Network & Infrastructure Tags
  network: "#00D4AA",
  wireless: "#FFD93D",
  bluetooth: "#4A90D9",
  dns: "#7B68EE",
  "active-directory": "#E06060",
  "active directory": "#E06060",
  cloud: "#64B5F6",
  aws: "#FF9900",
  docker: "#2496ED",
  kubernetes: "#326CE5",
  k8s: "#326CE5",

  // Forensics & Analysis Tags
  forensics: "#BB86FC",
  malware: "#FF5252",
  "reverse-engineering": "#6C63FF",
  "reverse engineering": "#6C63FF",
  osint: "#4FC3F7",
  "threat-intel": "#FF7043",
  "threat intel": "#FF7043",

  // Exploitation & Attack Tags
  rce: "#FF1744",
  lpe: "#FF5252",
  xss: "#E040FB",
  sqli: "#FF6E40",
  exploit: "#FF3D00",
  "privilege-escalation": "#FFAB40",
  "privilege escalation": "#FFAB40",
  phishing: "#CE93D8",
  "post-exploitation": "#D50000",
  "post exploitation": "#D50000",

  // Defense & Security Tags
  "mobile-security": "#69F0AE",
  "mobile security": "#69F0AE",
  "web-security": "#FF80AB",
  "web security": "#FF80AB",
  cryptography: "#FFD740",
  pentest: "#FF6D00",
  "red-team": "#FF1744",
  "red team": "#FF1744",
  "blue-team": "#448AFF",
  "blue team": "#448AFF",
  "purple-team": "#B388FF",
  "purple team": "#B388FF",
  hardware: "#AED581",
  iot: "#80CBC4",
  firmware: "#90A4AE",

  // Tool & Language Tags
  python: "#FFD43B",
  "c/c++": "#659AD2",
  "c++": "#659AD2",
  c: "#659AD2",
  rust: "#CE422B",
  golang: "#00ADD8",
  powershell: "#5391FE",
  bash: "#4EAA25",
  assembly: "#8D6E63",
  ida: "#F48FB1",
  ghidra: "#80DEEA",
  wireshark: "#1679A7",

  // General / Fallback Tags
  tutorial: "#81C784",
  writeup: "#90CAF9",
  ctf: "#FFAB91",
  research: "#B39DDB",
  news: "#FFF176",
  "default/other": "#6B7280",
  default: "#6B7280",
  other: "#6B7280",
};

function getTagColor(tag: string): string {
  const normalized = tag.toLowerCase().trim().replace(/\s+/g, " ");
  return TAG_COLORS[normalized] || "#6B7280";
}

export function Tag({
  children,
  variant = "default",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "default" | "green" | "blue" | "red" | "amber";
  onClick?: (e: React.MouseEvent) => void;
}) {
  const tagText = typeof children === "string" ? children : "";
  const tagColor = getTagColor(tagText);

  const style = {
    color: tagColor,
    backgroundColor: `color-mix(in oklab, ${tagColor} calc(var(--tag-bg-opacity) * 100%), transparent)`,
    borderColor: `color-mix(in oklab, ${tagColor} calc(var(--tag-border-opacity) * 100%), transparent)`,
    borderWidth: "1px",
    borderStyle: "solid",
  };

  return (
    <span
      className={`custom-tag ${
        onClick
          ? "cursor-pointer hover:brightness-125 hover:-translate-y-[1px] transition-all duration-150"
          : ""
      }`}
      style={style}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

export function tagVariantFor(tag: string) {
  // Kept for API backward-compatibility, as inline colors are resolved dynamically now.
  return "default" as const;
}
