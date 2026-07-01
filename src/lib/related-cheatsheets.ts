import type { CheatsheetMeta } from "@/data/cheatsheets";

type Entry = { path: string; meta: CheatsheetMeta };

export function getRelatedCheatsheets(current: Entry, all: Entry[], limit = 3): Entry[] {
  return all
    .filter((e) => e.path !== current.path)
    .map((e) => {
      let score = 0;
      // Category match is highly weighted
      if (e.meta.category && e.meta.category === current.meta.category) {
        score += 5;
      }
      // Tag matches
      const currentTags = current.meta.tags || [];
      const entryTags = e.meta.tags || [];
      const sharedTags = entryTags.filter((t) => currentTags.includes(t)).length;
      score += sharedTags * 2;

      // Difficulty match is minor signal
      if (e.meta.difficulty && e.meta.difficulty === current.meta.difficulty) {
        score += 1;
      }
      return { entry: e, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);
}
