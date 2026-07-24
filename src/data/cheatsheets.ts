import type { ComponentType } from "react";
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

// Eager glob to get frontmatter
const mdxModules = import.meta.glob<CheatsheetMeta>("./cheatsheets/**/*.mdx", {
  eager: true,
  import: "frontmatter",
});

// Eager glob for actual React components to remove loading delay
const contentModules = import.meta.glob<{ default: ComponentType; frontmatter: CheatsheetMeta }>(
  "./cheatsheets/**/*.mdx",
  { eager: true }
);

export const cheatsheetFiles = Object.entries(mdxModules).map(([path, mod]) => {
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

export const CheatsheetMdxComponents: Record<string, ComponentType<any>> = Object.fromEntries(
  Object.entries(contentModules).map(([path, mod]) => {
    const cleanPath = path.replace("./cheatsheets/", "").replace(".mdx", "");
    return [cleanPath, mod.default];
  }),
);
