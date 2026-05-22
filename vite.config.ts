import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  base: "/Asbawy.github.io",
  tanstackStart: {
    server: {
      preset: "github-pages"
    },
  },
});
