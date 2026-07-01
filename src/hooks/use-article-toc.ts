import { useEffect, useState } from "react";

export type TocHeading = { id: string; title: string; level: number };

export function useArticleToc(rootSelector: string, levels: number[] = [2]) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState("");
  const [progress, setProgress] = useState(0);

  const levelsStr = levels.join(",");

  useEffect(() => {
    const selector = levelsStr
      .split(",")
      .map((l) => `${rootSelector} h${l}`)
      .join(",");

    const extract = () => {
      const nodes = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      const next = nodes
        .filter((n) => n.id)
        .map((n) => ({
          id: n.id,
          title: n.textContent?.replace("▸", "").trim() || "",
          level: Number(n.tagName.replace("H", "")),
        }));
      setHeadings((prev) =>
        prev.length === next.length && prev.every((p, i) => p.id === next[i]?.id) ? prev : next,
      );
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(Math.min(100, Math.max(0, (doc.scrollTop / Math.max(1, max)) * 100)));

      const nodes = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      let current = "";
      for (const n of nodes) {
        if (n.getBoundingClientRect().top <= 120) {
          current = n.id;
        }
      }
      setActiveId(current || nodes[0]?.id || "");
    };

    const observer = new MutationObserver(() => {
      extract();
      onScroll();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    extract();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [rootSelector, levelsStr]);

  return { headings, activeId, progress };
}
