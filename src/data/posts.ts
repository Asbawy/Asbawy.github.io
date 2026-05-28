export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  category: "Web" | "AI Security" | "Automation" | "Scripting" | "Network" | "Windows";
  tags: string[];
  severity: "Low" | "Medium" | "High" | "Critical";
  excerpt: string;
  readTime: string;
  sections: { id: string; title: string }[];
};

export type Post = PostMeta & {
  content: string;
};

// Eager: metadata only (tiny JS footprint thanks to custom Vite plugin)
const metaModules = import.meta.glob<{ meta: PostMeta }>(
  "./posts/*.ts",
  { eager: true, query: '?meta' }
);

export const postsMeta: PostMeta[] = Object.values(metaModules)
  .map((mod) => mod.meta)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getPostMeta(slug: string): PostMeta | undefined {
  return postsMeta.find((p) => p.slug === slug);
}

// Lazy: full post content (loaded per-route)
const contentModules = import.meta.glob<{ post: Post }>("./posts/*.ts");

export async function getPostContent(slug: string): Promise<Post | undefined> {
  const key = Object.keys(contentModules).find((k) => k.includes(`/${slug}.ts`));
  if (!key) return undefined;

  const mod = await contentModules[key]();
  return mod.post;
}