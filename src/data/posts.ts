export type Post = {
  slug: string;
  title: string;
  date: string;
  category: "Web" | "AI Security" | "Automation" | "Scripting";
  tags: string[];
  severity: "Low" | "Medium" | "High" | "Critical";
  excerpt: string;
  readTime: string;
  sections: { id: string; title: string }[];
  content: string;
};

export const posts: Post[] = [];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}