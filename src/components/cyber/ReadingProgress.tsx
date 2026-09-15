import { useEffect, useState } from "react";

export function ReadingProgress({ progress: propProgress }: { progress?: number } = {}) {
  const [internalProgress, setInternalProgress] = useState(0);

  useEffect(() => {
    if (propProgress !== undefined) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        const pct = Math.min(100, Math.max(0, (scrollY / total) * 100));
        setInternalProgress(pct);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [propProgress]);

  const activeProgress = propProgress !== undefined ? propProgress : internalProgress;

  if (activeProgress <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] transition-[width] duration-75 ease-out"
        style={{ width: `${activeProgress}%` }}
      />
    </div>
  );
}
