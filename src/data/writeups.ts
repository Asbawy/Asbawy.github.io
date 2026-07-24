import type { ComponentType } from "react";
export type WriteupMeta = {
  slug: string;
  title: string;
  date: string;
  platform: "HackTheBox" | "TryHackMe" | "VulnHub" | "CTF" | "Other";
  type: "Machine" | "Challenge" | "Sherlock" | "Fortress" | "Endgame" | "Pro Lab";
  category?:
    | "Reverse Engineering"
    | "Web"
    | "Crypto"
    | "Pwn"
    | "Forensics"
    | "Hardware"
    | "Misc"
    | "Mobile"
    | "OSINT"
    | string;
  os?: "Linux" | "Windows" | "Web" | "Misc";
  difficulty: "Very Easy" | "Easy" | "Medium" | "Hard" | "Insane";
  tags: string[];
  excerpt: string;
  readTime: string;
  retired?: boolean;
  rating?: number;
  url?: string;
};

export type Writeup = WriteupMeta;

// Eager: load the modules to get their frontmatter export.
const mdxModules = import.meta.glob<WriteupMeta>("./writeups/*.mdx", {
  eager: true,
  import: "frontmatter",
});

const contentModules = import.meta.glob<{ default: ComponentType; frontmatter: WriteupMeta }>(
  "./writeups/*.mdx",
  { eager: true }
);

export const writeupsMeta: WriteupMeta[] = Object.values(mdxModules)
  .map((mod) => mod)
  .filter((p) => p && p.slug)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getWriteupMeta(slug: string): WriteupMeta | undefined {
  return writeupsMeta.find((p) => p.slug === slug);
}

export const WriteupMdxComponents: Record<string, ComponentType<any>> = Object.fromEntries(
  Object.entries(contentModules).map(([path, mod]) => {
    const slug = path.replace("./writeups/", "").replace(".mdx", "");
    return [slug, mod.default];
  }),
);

export async function getWriteupContent(slug: string): Promise<Writeup | undefined> {
  const key = Object.keys(contentModules).find((k) => k.includes(`/${slug}.mdx`));
  if (!key) return undefined;

  const mod = contentModules[key];
  return mod.frontmatter as Writeup;
}

// Helper: group writeups by platform
export function getWriteupsByPlatform(): Record<string, WriteupMeta[]> {
  const grouped: Record<string, WriteupMeta[]> = {};
  for (const w of writeupsMeta) {
    const platform = w.platform || "Other";
    if (!grouped[platform]) grouped[platform] = [];
    grouped[platform].push(w);
  }
  return grouped;
}

// Helper: platform stats
export function getPlatformStats() {
  const stats = {
    total: writeupsMeta.length,
    platforms: {} as Record<string, number>,
    difficulties: {} as Record<string, number>,
    types: {} as Record<string, number>,
    os: {} as Record<string, number>,
  };
  for (const w of writeupsMeta) {
    stats.platforms[w.platform] = (stats.platforms[w.platform] || 0) + 1;
    stats.difficulties[w.difficulty] = (stats.difficulties[w.difficulty] || 0) + 1;
    stats.types[w.type] = (stats.types[w.type] || 0) + 1;
    if (w.os) stats.os[w.os] = (stats.os[w.os] || 0) + 1;
  }
  return stats;
}
