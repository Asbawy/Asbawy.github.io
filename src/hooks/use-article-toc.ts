import { useEffect, useState } from "react";

export type TocHeading = { id: string; title: string; level: number };

export function useArticleToc(rootSelector: string, levels: number[] = [2], dependency?: any) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState("");
  const [progress, setProgress] = useState(0);

  const levelsStr = levels.join(",");

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;

    const selector = levelsStr
      .split(",")
      .map((l) => `${rootSelector} h${l}`)
      .join(",");

    const extractHeadings = () => {
      const nodes = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      const next = nodes
        .filter((n) => n.id)
        .map((n) => ({
          id: n.id,
          title: n.textContent?.replace("▸", "").trim() || "",
          level: Number(n.tagName.replace("H", "")),
        }));

      setHeadings((prev) => {
        const isSame = prev.length === next.length && prev.every((p, i) => p.id === next[i]?.id);
        return isSame ? prev : next;
      });

      // Disconnect previous observer before setting up new ones
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }

      const headingElements = nodes.filter((n) => n.id);
      if (headingElements.length > 0) {
        const visibleHeadings = new Map<string, boolean>();

        intersectionObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              visibleHeadings.set(entry.target.id, entry.isIntersecting);
            });

            // Find first visible heading
            let active = "";
            for (const el of headingElements) {
              if (visibleHeadings.get(el.id)) {
                active = el.id;
                break;
              }
            }

            if (!active) {
              // If none are visible in viewport, find the closest one above the scroll line
              let closestAbove = "";
              let maxTop = -Infinity;
              for (const el of headingElements) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 150 && rect.top > maxTop) {
                  maxTop = rect.top;
                  closestAbove = el.id;
                }
              }
              active = closestAbove;
            }

            if (active) {
              setActiveId(active);
            }
          },
          {
            rootMargin: "-100px 0px -75% 0px", // Observe elements crossing the top-quarter active band
          }
        );

        headingElements.forEach((el) => intersectionObserver?.observe(el));
      }
    };

    const handleScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(Math.min(100, Math.max(0, (doc.scrollTop / Math.max(1, max)) * 100)));
    };

    // Scope MutationObserver to ONLY observe the target root selector
    const rootEl = document.querySelector(rootSelector);
    if (rootEl) {
      observer = new MutationObserver(() => {
        extractHeadings();
      });
      observer.observe(rootEl, { childList: true, subtree: true });
    } else {
      // Fallback: observe document.body ONLY until root Selector container mounts
      observer = new MutationObserver(() => {
        const found = document.querySelector(rootSelector);
        if (found) {
          extractHeadings();
          observer?.disconnect();
          
          observer = new MutationObserver(() => extractHeadings());
          observer.observe(found, { childList: true, subtree: true });
        }
      });
      observer.observe(document.body, { childList: true, subtree: false });
    }

    extractHeadings();
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [rootSelector, levelsStr, dependency]);

  return { headings, activeId, progress };
}
