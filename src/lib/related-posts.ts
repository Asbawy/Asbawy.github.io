import type { PostMeta } from "@/data/posts";

export function getRelatedPosts(current: PostMeta, allPosts: PostMeta[], limit = 3): PostMeta[] {
  return allPosts
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      let score = 0;
      // Same category = strong signal
      if (p.category === current.category) score += 5;
      // Shared tags = weighted signal
      const shared = p.tags.filter((t) => current.tags.includes(t)).length;
      score += shared * 2;
      // Same severity = minor signal
      if (p.severity === current.severity) score += 1;
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.post);
}
