/* eslint-disable @typescript-eslint/no-explicit-any, no-empty */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";

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
    tanstackStart({
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        autoSubfolderIndex: false,
      },
      pages: getPrerenderPages(),
    }),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    react(),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeHighlight],
      providerImportSource: "@mdx-js/react",
    }),
  ],
  resolve: {
    alias: {
      "@": join(process.cwd(), "src"),
    },
  },
});
