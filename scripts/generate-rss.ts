import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = "https://asbawy.github.io";

function getFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const lines = match[1].split('\n');
  const fm: Record<string, string> = {};
  for (const line of lines) {
    const colon = line.indexOf(':');
    if (colon !== -1) {
      const key = line.slice(0, colon).trim();
      const val = line.slice(colon + 1).trim().replace(/^"|"$/g, '');
      fm[key] = val;
    }
  }
  return fm;
}

async function main() {
  const items: any[] = [];
  
  // Posts
  const postsDir = join(process.cwd(), "src/data/posts");
  try {
    if (existsSync(postsDir)) {
      const postFiles = readdirSync(postsDir).filter(f => f.endsWith(".mdx"));
      for (const f of postFiles) {
        const fullPath = join(postsDir, f);
        if (statSync(fullPath).isFile()) {
          const content = readFileSync(fullPath, 'utf-8');
          const fm = getFrontmatter(content);
          if (fm.title) {
            items.push({
              title: fm.title,
              description: fm.excerpt || "",
              link: `${BASE_URL}/logs/${f.replace(/\.mdx$/, "")}`,
              date: fm.date || new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch(e) {
    console.error("Error reading posts:", e);
  }

  // Cheatsheets
  const cheatDir = join(process.cwd(), "src/data/cheatsheets");
  try {
    if (existsSync(cheatDir)) {
      const cheatFiles = readdirSync(cheatDir, { recursive: true });
      for (const f of cheatFiles) {
        if (typeof f === 'string' && f.endsWith(".mdx")) {
          const fullPath = join(cheatDir, f);
          if (statSync(fullPath).isFile()) {
            const content = readFileSync(fullPath, 'utf-8');
            const fm = getFrontmatter(content);
            if (fm.title) {
              const normalized = f.replace(/\\/g, "/").replace(/\.mdx$/, "");
              items.push({
                title: fm.title,
                description: fm.excerpt || "",
                link: `${BASE_URL}/cheatsheet/${normalized}`,
                date: fm.date || new Date().toISOString(),
              });
            }
          }
        }
      }
    }
  } catch(e) {
    console.error("Error reading cheatsheets:", e);
  }

  // Sort by date desc
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const rssItems = items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <guid>${item.link}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    </item>
  `).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Asbawy Blog</title>
    <description>Security cheatsheets, quick references, and field notes by Asbawy.</description>
    <link>${BASE_URL}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  const outDir = join(process.cwd(), "public");
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  writeFileSync(join(outDir, "feed.xml"), xml);
  console.log(`✓ feed.xml generated with ${items.length} items`);
}

main();
