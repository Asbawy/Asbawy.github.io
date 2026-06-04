import { readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

function getPostPrerenderPages() {
  const postsDir = join(process.cwd(), "src/data/posts");
  return readdirSync(postsDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({
      path: `/logs/${file.replace(/\.mdx$/, "")}`,
      prerender: { enabled: true },
    }));
}

export default defineConfig({
  base: "/",
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      rehypePlugins: [rehypeSlug],
      providerImportSource: "@mdx-js/react"
    }),
  ],
  tanstackStart: {
    prerender: {
      enabled: true,
      autoStaticPathsDiscovery: true,
      crawlLinks: true,
      autoSubfolderIndex: false,
    },
    pages: getPostPrerenderPages(),
  },
});
