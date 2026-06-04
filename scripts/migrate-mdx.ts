import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, "../src/data/posts");

async function migrate() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".ts") && f !== "index.ts" && !f.includes("posts.ts"));
  
  for (const file of files) {
    if (file === "index.ts" || file === "posts.ts") continue;
    
    const filePath = path.join(POSTS_DIR, file);
    const fileUrl = "file:///" + filePath.replace(/\\/g, "/");
    
    console.log(`Processing: ${file}`);
    
    // Import the TS file to get the exact unescaped string
    const module = await import(fileUrl + "?t=" + Date.now());
    const post = module.post || module.meta;
    
    if (!post || !post.slug) {
      console.warn(`Skipping ${file}: No post/meta exported.`);
      continue;
    }

    const content = post.content || "";
    
    // Create frontmatter
    let frontmatter = "---\n";
    frontmatter += `slug: "${post.slug}"\n`;
    frontmatter += `title: "${post.title.replace(/"/g, '\\"')}"\n`;
    frontmatter += `date: "${post.date}"\n`;
    frontmatter += `category: "${post.category}"\n`;
    frontmatter += `tags:\n${post.tags.map((t: string) => `  - "${t}"`).join("\n")}\n`;
    frontmatter += `severity: "${post.severity}"\n`;
    frontmatter += `excerpt: "${post.excerpt.replace(/"/g, '\\"')}"\n`;
    frontmatter += `readTime: "${post.readTime}"\n`;
    frontmatter += "---\n\n";

    const mdxPath = path.join(POSTS_DIR, `${post.slug}.mdx`);
    fs.writeFileSync(mdxPath, frontmatter + content, "utf-8");
    console.log(`Created: ${post.slug}.mdx`);
    
    // Delete the original TS file
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${file}\n`);
  }
}

migrate().catch(console.error);
