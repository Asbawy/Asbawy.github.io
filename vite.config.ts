import { readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

function getPostPrerenderPages() {
  const postsDir = join(process.cwd(), "src/data/posts");
  return readdirSync(postsDir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => ({
      path: `/logs/${file.replace(/\.ts$/, "")}`,
      prerender: { enabled: true },
    }));
}

export default defineConfig({
  base: "/",
  tanstackStart: {
    prerender: {
      enabled: true,
      autoStaticPathsDiscovery: true,
      crawlLinks: true,
      // GitHub Pages serves /tools from tools.html, not tools/index.html
      autoSubfolderIndex: false,
    },
    pages: getPostPrerenderPages(),
  },
});
