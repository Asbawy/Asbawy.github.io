import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = "https://asbawy.github.io";
const postsDir = join(process.cwd(), "src/data/posts");

type FrontmatterData = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
};

function extractFrontmatter(content: string): FrontmatterData | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const yaml = match[1];
  const get = (key: string): string => {
    const m = yaml.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "m"));
    return m ? m[1] : "";
  };

  const tagsMatch = yaml.match(/tags:\s*\n((?:\s+-\s+.+\n?)*)/);
  const tags = tagsMatch
    ? tagsMatch[1].split("\n").map(l => l.replace(/^\s*-\s*["']?|["']?\s*$/g, "")).filter(Boolean)
    : [];

  return {
    slug: get("slug"),
    title: get("title"),
    date: get("date"),
    category: get("category"),
    tags,
    excerpt: get("excerpt"),
  };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function main() {
  const files = readdirSync(postsDir).filter(f => f.endsWith(".mdx"));

  const posts: FrontmatterData[] = [];

  for (const file of files) {
    const content = readFileSync(join(postsDir, file), "utf-8");
    const fm = extractFrontmatter(content);
    if (fm && fm.slug) {
      posts.push(fm);
    }
  }

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const now = new Date().toUTCString();

  const items = posts.map(p => {
    const url = `${BASE_URL}/logs/${p.slug}`;
    const pubDate = new Date(p.date).toUTCString();
    return [
      "    <item>",
      `      <title>${escapeXml(p.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <description>${escapeXml(p.excerpt)}</description>`,
      `      <pubDate>${pubDate}</pubDate>`,
      ...p.tags.map(t => `      <category>${escapeXml(t)}</category>`),
      "    </item>",
    ].join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Asbawy Blog</title>",
    `    <link>${BASE_URL}</link>`,
    "    <description>Security research, dev logs, automation, and scripting by Asbawy.</description>",
    "    <language>en-us</language>",
    `    <lastBuildDate>${now}</lastBuildDate>`,
    `    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>`,
    ...items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  const outDir = join(process.cwd(), "public");
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  writeFileSync(join(outDir, "feed.xml"), xml);
  console.log(`✓ feed.xml generated with ${posts.length} items`);
}

main();
