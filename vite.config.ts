import { readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

function getPostPrerenderPages() {
  const postsDir = join(process.cwd(), "src/data/posts");
  return readdirSync(postsDir)
    .filter((file) => file.endsWith(".ts") && file !== "_template.ts")
    .map((file) => ({
      path: `/logs/${file.replace(/\.ts$/, "")}`,
      prerender: { enabled: true },
    }));
}

// Vite plugin to strip the heavy post content when we only need the metadata
function stripPostContentPlugin() {
  return {
    name: 'strip-post-content',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (id.includes('?meta')) {
        // Find "export const post" and completely remove it and the content
        return {
          code: code.replace(/export const post[\s\S]*$/, ''),
          map: null
        };
      }
    }
  };
}

export default defineConfig({
  base: "/",
  plugins: [stripPostContentPlugin()],
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
