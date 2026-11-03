/* eslint-disable @typescript-eslint/no-explicit-any, no-empty */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { parse as parseYaml } from "yaml";

/**
 * Serves `*.mdx?meta` as a lightweight virtual module exporting only the YAML frontmatter,
 * allowing Rollup to keep full `.mdx` article components in separate code-split chunks.
 */
function mdxFrontmatterOnlyPlugin(): Plugin {
  const prefix = "\0mdx-meta:";
  const suffix = ".meta.js";
  return {
    name: "mdx-frontmatter-only",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.endsWith(".mdx?meta")) return null;
      const cleanSource = source.slice(0, -"?meta".length);
      const resolved = await this.resolve(cleanSource, importer, { skipSelf: true });
      if (!resolved) return null;
      return `${prefix}${resolved.id}${suffix}`;
    },
    load(id) {
      if (!id.startsWith(prefix) || !id.endsWith(suffix)) return null;
      const filePath = id.slice(prefix.length, -suffix.length);
      const raw = readFileSync(filePath, "utf-8");
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const data = match ? parseYaml(match[1]) : {};
      return `export const frontmatter = ${JSON.stringify(data || {})};`;
    },
  };
}

function getPrerenderPages() {
  const pages: any[] = [];

  // Posts
  const postsDir = join(process.cwd(), "src/data/posts");
  try {
    const postFiles = readdirSync(postsDir);
    postFiles
      .filter((f) => f.endsWith(".mdx"))
      .forEach((file) => {
        pages.push({
          path: `/logs/${file.replace(/\.mdx$/, "")}`,
          prerender: { enabled: true },
        });
      });
  } catch (e) {}

  // Cheatsheets (recursive)
  const cheatDir = join(process.cwd(), "src/data/cheatsheets");
  try {
    const cheatFiles = readdirSync(cheatDir, { recursive: true });
    cheatFiles
      .filter((f) => typeof f === "string" && f.endsWith(".mdx"))
      .forEach((file) => {
        // file path might have backslashes on windows, so normalize to forward slashes
        const normalizedPath = (file as string).replace(/\\/g, "/").replace(/\.mdx$/, "");
        pages.push({
          path: `/cheatsheet/${normalizedPath}`,
          prerender: { enabled: true },
        });
      });
  } catch (e) {}

  // Writeups
  const writeupDir = join(process.cwd(), "src/data/writeups");
  try {
    const writeupFiles = readdirSync(writeupDir);
    writeupFiles
      .filter((f) => f.endsWith(".mdx"))
      .forEach((file) => {
        pages.push({
          path: `/writeups/${file.replace(/\.mdx$/, "")}`,
          prerender: { enabled: true },
        });
      });
  } catch (e) {}

  return pages;
}

export default defineConfig({
  base: "/",
  plugins: [
    mdxFrontmatterOnlyPlugin(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        autoSubfolderIndex: false,
        concurrency: 4,
      },
      pages: getPrerenderPages(),
    }),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    react(),
    mdx({
      exclude: /\?meta$/,
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      rehypePlugins: [rehypeSlug],
      providerImportSource: "@mdx-js/react",
    }),
  ],
  resolve: {
    alias: {
      "@": join(process.cwd(), "src"),
    },
  },
});
