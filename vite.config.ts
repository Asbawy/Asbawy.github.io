import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  base: "/",
  tanstackStart: {
    server: {
      preset: "github-pages"
    },
  },
});
