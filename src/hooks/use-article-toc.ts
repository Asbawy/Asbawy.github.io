import { startTransition, useEffect, useState } from "react";

export type TocHeading = { id: string; title: string; level: number };

export function useArticleToc(rootSelector: string, levels: number[] = [2], dependency?: any) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState("");

  const levelsStr = levels.join(",");

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;

    const selector = levelsStr
      .split(",")
      .map((l) => `${rootSelector} h${l}`)
      .join(",");

    const extractHeadings = (): boolean => {
      const nodes = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      const headingElements = nodes.filter((n) => n.id);
      if (headingElements.length === 0) {
        return false;
      }

      const next = headingElements.map((n) => ({
        id: n.id,
        title: (n.textContent || "")
          .replace(/^[:\s_#▸▹>]+/, "")
          .replace(/\s+/g, " ")
          .trim(),
        level: Number(n.tagName.replace("H", "")),
      }));

      setHeadings((prev) => {
        const isSame = prev.length === next.length && prev.every((p, i) => p.id === next[i]?.id);
        return isSame ? prev : next;
      });

      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }

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
            startTransition(() => {
              setActiveId((prev) => (prev === active ? prev : active));
            });
          }
        },
        {
          rootMargin: "-100px 0px -75% 0px",
        },
      );

      headingElements.forEach((el) => intersectionObserver?.observe(el));
      return true;
    };

    // Extract immediately if headings are already in DOM (e.g. prerendered/hydrated)
    const extractedImmediately = extractHeadings();

    // Only observe DOM mutations until headings are initially mounted;
    // disconnect immediately once found so interactive clicks inside the article never trigger re-extraction.
    if (!extractedImmediately) {
      const rootEl = document.querySelector(rootSelector) || document.body;
      observer = new MutationObserver(() => {
        if (extractHeadings()) {
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(rootEl, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [rootSelector, levelsStr, dependency]);

  return { headings, activeId, progress: undefined };
}
