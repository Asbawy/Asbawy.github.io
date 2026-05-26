import { readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = "https://asbawy.github.io";
const postsDir = join(process.cwd(), "src/data/posts");

async function main() {
  const files = readdirSync(postsDir).filter((f) => f.endsWith(".ts") && f !== "_template.ts");

  const staticPages = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/logs", changefreq: "daily", priority: "0.9" },
    { path: "/tools", changefreq: "monthly", priority: "0.7" },
    { path: "/stats", changefreq: "weekly", priority: "0.6" },
  ];

  const postPages = files.map((f) => ({
    path: `/logs/${f.replace(/\.ts$/, "")}`,
    changefreq: "monthly",
    priority: "0.8",
  }));

  const entries = [...staticPages, ...postPages];

  const urls = entries.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      "  </url>",
    ].join("\n")
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
  ].join("\n");

  const outDir = join(process.cwd(), "dist/client");
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  writeFileSync(join(outDir, "sitemap.xml"), xml);
  console.log(`✓ sitemap.xml generated with ${entries.length} URLs`);
}

main();
