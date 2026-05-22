export type Post = {
  slug: string;
  title: string;
  date: string;
  category: "Web" | "AI Security" | "Automation" | "Scripting" | "Network";
  tags: string[];
  severity: "Low" | "Medium" | "High" | "Critical";
  excerpt: string;
  readTime: string;
  sections: { id: string; title: string }[];
  content: string;
};

const postModules = import.meta.glob('./posts/*.ts', { eager: true });

export const posts: Post[] = Object.values(postModules)
  .map((mod: any) => mod.post)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}