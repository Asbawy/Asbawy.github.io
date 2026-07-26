/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate, getRouteApi } from "@tanstack/react-router";
import { Search, X, Clock, ArrowRight, Tag as TagIcon, BookOpen } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { cheatsheetFiles } from "@/data/cheatsheets";

const cheatsheetRoute = getRouteApi("/cheatsheet");

export const Route = createFileRoute("/cheatsheet/")({
  component: CheatsheetIndex,
});

function getCategoryBadgeColor(cat?: string) {
  const c = (cat || "").toLowerCase();
  if (c.includes("active directory") || c === "ad") {
    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
  }
  if (c.includes("linux")) {
    return "bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30";
  }
  if (c.includes("tool")) {
    return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30";
  }
  if (c.includes("windows")) {
    return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30";
  }
  return "bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30";
}

function getDifficultyBadgeColor(diff?: string) {
  const d = (diff || "Intermediate").toLowerCase();
  if (d === "advanced") {
    return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30";
  }
  if (d === "beginner") {
    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
  }
  return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30";
}

function CheatsheetIndex() {
  const navigate = useNavigate();
  const search = cheatsheetRoute.useSearch() as {
    q?: string;
    tag?: string;
    cat?: string;
  };
  const q = (search.q || "").toLowerCase().trim();
  const activeTagParam = (search.tag || "").toLowerCase().trim();

  const [selectedCategory, setSelectedCategory] = useState<string>(search.cat || "All");
  const [activeTag, setActiveTag] = useState<string>(activeTagParam);

  useEffect(() => {
    if (search.cat) setSelectedCategory(search.cat);
    if (search.tag !== undefined) setActiveTag(search.tag.toLowerCase().trim());
  }, [search.cat, search.tag]);

  // All categories with counts
  const categories = useMemo(() => {
    const cats: Record<string, number> = { All: cheatsheetFiles.length };
    for (const file of cheatsheetFiles) {
      const cat = file.meta.category || "General";
      cats[cat] = (cats[cat] || 0) + 1;
    }
    return Object.entries(cats).map(([name, count]) => ({ name, count }));
  }, []);

  // Top unique tags across all cheatsheets
  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    for (const file of cheatsheetFiles) {
      for (const t of file.meta.tags || []) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
    }
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([name, count]) => ({ name, count }));
  }, []);

  // Filtered cheatsheet files
  const displayedFiles = useMemo(() => {
    return cheatsheetFiles.filter((file) => {
      // Category filter
      if (selectedCategory !== "All" && file.meta.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (activeTag && !file.meta.tags?.some((t) => t.toLowerCase() === activeTag)) {
        return false;
      }
      // Query filter
      if (q) {
        const matchesQ =
          file.path.toLowerCase().includes(q) ||
          file.meta.title?.toLowerCase().includes(q) ||
          file.meta.category?.toLowerCase().includes(q) ||
          file.meta.excerpt?.toLowerCase().includes(q) ||
          file.meta.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesQ) return false;
      }
      return true;
    });
  }, [q, selectedCategory, activeTag]);

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    if (catName === "All") {
      navigate({
        from: Route.fullPath,
        search: (old: any) => ({ ...old, cat: undefined }),
        replace: true,
      });
    } else {
      navigate({
        from: Route.fullPath,
        search: (old: any) => ({ ...old, cat: catName }),
        replace: true,
      });
    }
  };

  const handleTagToggle = (tagName: string) => {
    const norm = tagName.toLowerCase();
    if (activeTag === norm) {
      setActiveTag("");
      navigate({
        from: Route.fullPath,
        search: (old: any) => ({ ...old, tag: undefined }),
        replace: true,
      });
    } else {
      setActiveTag(norm);
      navigate({
        from: Route.fullPath,
        search: (old: any) => ({ ...old, tag: tagName }),
        replace: true,
      });
    }
  };

  const handleSearchChange = (val: string) => {
    navigate({
      from: Route.fullPath,
      search: (old: any) => ({ ...old, q: val || undefined }),
      replace: true,
    });
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setActiveTag("");
    navigate({
      from: Route.fullPath,
      search: () => ({ q: undefined, tag: undefined, cat: undefined }),
      replace: true,
    });
  };

  const hasActiveFilters = Boolean(q || selectedCategory !== "All" || activeTag);

  return (
    <div className="w-full min-h-full bg-background text-foreground py-12 px-6 md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Simple Page Header — Blog Style */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
            Cheatsheets
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-sans max-w-2xl">
            Security cheatsheets, command references, and tactical field notes.
          </p>
        </div>

        {/* Category Filter Bar + Search Input — Horizontal Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          {/* Category Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => {
              const isActive = selectedCategory === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => handleCategorySelect(c.name)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer font-sans
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ec9b0]/50
                    ${isActive
                      ? "bg-[#4ec9b0]/15 text-[#4ec9b0] border border-[#4ec9b0]/40 font-semibold shadow-[0_0_15px_rgba(78,201,176,0.12)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                    }
                  `}
                >
                  {c.name}{" "}
                  <span className={`ml-1 text-xs ${isActive ? "text-[#4ec9b0]/80" : "text-muted-foreground"}`}>
                    ({c.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar + Reset Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search.q || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search cheatsheets..."
                className="w-full bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-9 py-2 text-sm font-sans focus:outline-none focus:border-[#4ec9b0] focus:ring-1 focus:ring-[#4ec9b0] transition-colors"
              />
              {q && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer whitespace-nowrap font-sans"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Tag Pills Row (Blog-Style) */}
        {topTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1 font-sans">
              <TagIcon className="w-3.5 h-3.5 text-[#4ec9b0]" />
              Tags:
            </span>
            {topTags.map((t) => {
              const isTagActive = activeTag === t.name.toLowerCase();
              return (
                <button
                  key={t.name}
                  onClick={() => handleTagToggle(t.name)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer font-sans border
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4ec9b0]/50
                    ${isTagActive
                      ? "bg-[#4ec9b0]/20 text-[#4ec9b0] border-[#4ec9b0]/50 shadow-[0_0_12px_rgba(78,201,176,0.15)]"
                      : "bg-muted text-muted-foreground hover:text-foreground border-border hover:border-border"
                    }
                  `}
                >
                  #{t.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Blog-Style Card Grid (3-Col Desktop, 2-Col Tablet, 1-Col Mobile) */}
        {displayedFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFiles.map((file) => {
              const categoryName = file.meta.category || "General";
              const categoryColor = getCategoryBadgeColor(categoryName);
              const readTime = file.meta.readTime || "5 min";
              const difficulty = file.meta.difficulty || "Intermediate";
              const difficultyColor = getDifficultyBadgeColor(difficulty);

              return (
                <Link
                  key={file.path}
                  to="/cheatsheet/$"
                  params={{ _splat: file.path }}
                  className="
                    group flex flex-col justify-between rounded-xl bg-card border border-border p-6
                    hover:-translate-y-1 hover:border-[#4ec9b0]/40 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)]
                    transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ec9b0]
                  "
                >
                  <div className="space-y-4">
                    {/* Top Row: Category Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}
                      >
                        {categoryName}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-foreground group-hover:text-[#4ec9b0] transition-colors font-sans leading-snug">
                      {file.meta.title || file.path.split("/").pop()}
                    </h2>

                    {/* Description */}
                    {file.meta.excerpt && (
                      <p className="text-sm text-muted-foreground font-sans leading-relaxed line-clamp-3">
                        {file.meta.excerpt}
                      </p>
                    )}

                    {/* Metadata Row: Reading Time + Difficulty Level */}
                    <div className="flex items-center gap-2.5 pt-1 text-xs font-sans">
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-medium">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {readTime}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-medium ${difficultyColor}`}
                      >
                        {difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Tags + Hover Action Arrow */}
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {file.meta.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full font-sans"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-medium text-[#4ec9b0] opacity-0 group-hover:opacity-100 transition-opacity font-sans shrink-0">
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-card space-y-4">
            <BookOpen className="w-12 h-12 text-[#444] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground font-sans">No cheatsheets found</h3>
              <p className="text-sm text-muted-foreground font-sans max-w-md mx-auto">
                No cheatsheets matched your search query or selected category and tags.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#4ec9b0] bg-[#4ec9b0]/15 border border-[#4ec9b0]/30 hover:bg-[#4ec9b0]/20 transition-colors cursor-pointer font-sans"
              >
                <X className="w-4 h-4" />
                <span>Clear all filters</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
