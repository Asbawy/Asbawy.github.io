import { lazy, type ComponentType } from "react";

export type CheatsheetMeta = {
  title?: string;
  excerpt?: string;
  date?: string;
  updated?: string;
  category?: "Linux" | "Windows" | "Active Directory" | "Network" | "Web" | "Tools";
  tags?: string[];
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  readTime?: string;
  [key: string]: any;
};

export type FileNode = {
  name: string;
  type: "file" | "folder";
  path?: string; // e.g. "windows/privesc"
  meta?: CheatsheetMeta;
  children?: FileNode[];
};

// Eager glob to get frontmatter metadata only via ?meta so full MDX stays code-split
const mdxModules = import.meta.glob<CheatsheetMeta>("./cheatsheets/**/*.mdx", {
  eager: true,
  query: "?meta",
  import: "frontmatter",
});

// Lazy glob for actual React components to code-split each cheatsheet
const contentLoaders = import.meta.glob<{ default: ComponentType<any>; frontmatter: CheatsheetMeta }>(
  "./cheatsheets/**/*.mdx",
);

export type CheatsheetEntry = {
  path: string;
  meta: CheatsheetMeta;
};

export const cheatsheetFiles: CheatsheetEntry[] = Object.entries(mdxModules).map(([path, mod]) => {
  // path is like "./cheatsheets/windows/privesc.mdx"
  const cleanPath = path.replace("./cheatsheets/", "").replace(".mdx", "");
  return {
    path: cleanPath,
    meta: mod || {},
  };
});

// Build the tree
export function getCheatsheetTree(): FileNode[] {
  const root: FileNode[] = [];

  for (const { path, meta } of cheatsheetFiles) {
    const parts = path.split("/");
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      let existingNode = currentLevel.find((n) => n.name === (isFile ? `${part}.mdx` : part));

      if (!existingNode) {
        existingNode = {
          name: isFile ? `${part}.mdx` : part,
          type: isFile ? "file" : "folder",
          path: isFile ? path : undefined,
          meta: isFile ? meta : undefined,
          children: isFile ? undefined : [],
        };
        currentLevel.push(existingNode);
      }

      if (!isFile && existingNode.children) {
        currentLevel = existingNode.children;
      }
    }
  }

  return root;
}

const loadedCheatsheetComponents: Record<string, ComponentType<any>> = {};
const lazyCheatsheetComponents: Record<string, ComponentType<any>> = {};

function findCheatsheetKey(cleanPath: string): string | undefined {
  return Object.keys(contentLoaders).find(
    (k) => k.replace("./cheatsheets/", "").replace(".mdx", "") === cleanPath,
  );
}

export async function preloadCheatsheetContent(cleanPath: string): Promise<CheatsheetMeta | undefined> {
  const key = findCheatsheetKey(cleanPath);
  if (!key) return undefined;

  const mod = await contentLoaders[key]();
  loadedCheatsheetComponents[cleanPath] = mod.default;
  return mod.frontmatter;
}

export function getCheatsheetComponent(cleanPath: string): ComponentType<any> {
  if (loadedCheatsheetComponents[cleanPath]) {
    return loadedCheatsheetComponents[cleanPath];
  }
  if (!lazyCheatsheetComponents[cleanPath]) {
    const key = findCheatsheetKey(cleanPath);
    if (key) {
      lazyCheatsheetComponents[cleanPath] = lazy(async () => {
        const mod = await contentLoaders[key]();
        loadedCheatsheetComponents[cleanPath] = mod.default;
        return { default: mod.default };
      });
    }
  }
  return lazyCheatsheetComponents[cleanPath] || (() => null);
}
