import { defineConfig } from "@lovable.dev/vite-tanstack-config";

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
  },
});
