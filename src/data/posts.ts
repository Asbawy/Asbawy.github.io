import { lazy, type ComponentType } from "react";

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

// Eager: load only the frontmatter metadata export via ?meta so full MDX stays code-split.
const mdxModules = import.meta.glob<PostMeta>("./posts/*.mdx", {
  eager: true,
  query: "?meta",
  import: "frontmatter",
});

// Lazy: code-split each MDX article into its own on-demand chunk.
const contentLoaders = import.meta.glob<{ default: ComponentType<any>; frontmatter: PostMeta }>(
  "./posts/*.mdx",
);

export const postsMeta: PostMeta[] = Object.values(mdxModules)
  .map((mod) => mod)
  .filter((p) => p && p.slug)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getPostMeta(slug: string): PostMeta | undefined {
  return postsMeta.find((p) => p.slug === slug);
}

const loadedPostComponents: Record<string, ComponentType<any>> = {};
const lazyPostComponents: Record<string, ComponentType<any>> = {};

function findPostKey(slug: string): string | undefined {
  return Object.keys(contentLoaders).find((k) => k.endsWith(`/${slug}.mdx`));
}

export async function getPostContent(slug: string): Promise<Post | undefined> {
  const key = findPostKey(slug);
  if (!key) return undefined;

  const mod = await contentLoaders[key]();
  loadedPostComponents[slug] = mod.default;
  return (mod.frontmatter || getPostMeta(slug)) as Post;
}

export function getPostComponent(slug: string): ComponentType<any> {
  if (loadedPostComponents[slug]) {
    return loadedPostComponents[slug];
  }
  if (!lazyPostComponents[slug]) {
    const key = findPostKey(slug);
    if (key) {
      lazyPostComponents[slug] = lazy(async () => {
        const mod = await contentLoaders[key]();
        loadedPostComponents[slug] = mod.default;
        return { default: mod.default };
      });
    }
  }
  return lazyPostComponents[slug] || (() => null);
}
