import React, { useMemo } from "react";
import { TocHeading } from "@/hooks/use-article-toc";
import { ChevronRight, ListTree } from "lucide-react";

interface TableOfContentsProps {
  headings: TocHeading[];
  activeId: string;
  progress: number;
  title?: string;
  accentColor?: string; // Tailwind color class or hex string for custom accent styling
}

interface TocTreeGroup {
  parent: TocHeading;
  children: TocHeading[];
}

/**
 * Builds a hierarchical tree structure from flat TOC headings.
 * Headings with level 2 act as parents, level 3+ act as children under their preceding level 2 parent.
 */
function buildTocTree(headings: TocHeading[]): TocTreeGroup[] {
  const tree: TocTreeGroup[] = [];
  let currentGroup: TocTreeGroup | null = null;

  for (const heading of headings) {
    if (heading.level === 2 || !currentGroup) {
      currentGroup = {
        parent: heading,
        children: [],
      };
      tree.push(currentGroup);
    } else {
      currentGroup.children.push(heading);
    }
  }

  return tree;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  activeId,
  progress,
  title = "table of contents",
  accentColor = "bg-accent-primary",
}) => {
  const tree = useMemo(() => buildTocTree(headings), [headings]);

  if (!headings || headings.length === 0) {
    return null;
  }

  // Find index of currently active heading for the counter badge
  const activeIndex = headings.findIndex((h) => h.id === activeId);
  const activeCountDisplay = activeIndex >= 0 ? activeIndex + 1 : 1;

  const handleHeadingClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const targetEl = document.getElementById(id);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update hash without jumping
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <nav aria-label="Table of contents" className="w-full font-sans text-xs">
      {/* Header & Progress Indicator */}
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-1.5 font-bold text-foreground/90">
          <ListTree className="h-3.5 w-3.5 text-accent-primary" />
          <span>{title}</span>
        </div>
        <span className="text-[10px] text-muted-foreground/80 font-mono">
          [{String(activeCountDisplay).padStart(2, "0")} /{" "}
          {String(headings.length).padStart(2, "0")}]
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.06] p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-200 ${accentColor}`}
          style={{
            width: `${progress}%`,
            boxShadow: "0 0 10px currentColor",
          }}
        />
      </div>

      {/* Tree Structure */}
      <div className="space-y-1.5">
        {tree.map((group, groupIdx) => {
          const isParentActive = activeId === group.parent.id;
          const isChildActive = group.children.some((c) => c.id === activeId);
          const isGroupExpanded = isParentActive || isChildActive;

          return (
            <div key={group.parent.id} className="group/node">
              {/* Parent Node (H2) */}
              <a
                href={`#${group.parent.id}`}
                onClick={(e) => handleHeadingClick(e, group.parent.id)}
                className={`flex items-center justify-between rounded-md px-2.5 py-1.5 font-mono text-xs font-semibold transition-all duration-200 ${
                  isParentActive
                    ? "bg-accent-primary/15 text-accent-primary border-l-2 border-accent-primary shadow-[inset_0_0_12px_rgba(52,211,153,0.1)]"
                    : isChildActive
                      ? "text-foreground font-bold bg-white/[0.03] border-l-2 border-accent-primary/60"
                      : "text-foreground/70 hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">
                    {String(groupIdx + 1).padStart(2, "0")}.
                  </span>
                  <span className="truncate">{group.parent.title}</span>
                </div>
                {group.children.length > 0 && (
                  <ChevronRight
                    className={`h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform duration-200 ${
                      isGroupExpanded ? "rotate-90 text-accent-primary" : ""
                    }`}
                  />
                )}
              </a>

              {/* Children Branch (H3 / H4) */}
              {group.children.length > 0 && (
                <div className="relative ml-3.5 mt-1 space-y-1 border-l border-white/10 pl-3">
                  {group.children.map((child, childIdx) => {
                    const isChildSelfActive = activeId === child.id;
                    const isLast = childIdx === group.children.length - 1;

                    return (
                      <div key={child.id} className="relative flex items-center">
                        {/* Horizontal Branch Connector */}
                        <span
                          className={`absolute -left-3.5 h-px w-2.5 ${
                            isChildSelfActive ? "bg-accent-primary" : "bg-white/15"
                          }`}
                        />

                        <a
                          href={`#${child.id}`}
                          onClick={(e) => handleHeadingClick(e, child.id)}
                          className={`flex items-center gap-2 w-full rounded px-2 py-1 text-[11px] transition-all duration-200 ${
                            isChildSelfActive
                              ? "bg-accent-primary/15 text-accent-primary font-bold shadow-[0_0_8px_rgba(52,211,153,0.15)]"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                          }`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full shrink-0 ${
                              isChildSelfActive
                                ? "bg-accent-primary shadow-[0_0_6px_currentColor]"
                                : "bg-white/30"
                            }`}
                          />
                          <span className="truncate">{child.title}</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};
