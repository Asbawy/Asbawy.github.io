/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
import { lazy } from "react";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  category: "Web" | "AI Security" | "Automation" | "Scripting" | "Network" | "Windows";
  tags: string[];
  severity: "Low" | "Medium" | "High" | "Critical";
  excerpt: string;
  readTime: string;
};

// We no longer include the React Component in the Post type because loader data must be serializable.
export type Post = PostMeta;

// Eager: load the modules to get their frontmatter export.
// remark-mdx-frontmatter automatically exports YAML frontmatter as `frontmatter`.
const mdxModules = import.meta.glob<PostMeta>("./posts/*.mdx", { eager: true, import: "frontmatter" });

const contentModules = import.meta.glob<{ default: ComponentType; frontmatter: PostMeta }>(
  "./posts/*.mdx",
);

export const postsMeta: PostMeta[] = Object.values(mdxModules)
  .map((mod) => mod)
  .filter((p) => p && p.slug)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getPostMeta(slug: string): PostMeta | undefined {
  return postsMeta.find((p) => p.slug === slug);
}

// Export a dictionary of lazy-loaded MDX components so they don't pass through the loader
export const MdxComponents: Record<string, ComponentType<any>> = Object.fromEntries(
  Object.entries(contentModules).map(([path, resolver]) => {
    const slug = path.replace("./posts/", "").replace(".mdx", "");
    // Use React.lazy for dynamic chunking without breaking SSR
    return [
      slug,
      lazy(async () => {
        const mod = await resolver();
        return { default: mod.default };
      }),
    ];
  }),
);

export async function getPostContent(slug: string): Promise<Post | undefined> {
  const key = Object.keys(contentModules).find((k) => k.includes(`/${slug}.mdx`));
  if (!key) return undefined;

  const mod = await contentModules[key]();
  return mod.frontmatter as Post;
}
