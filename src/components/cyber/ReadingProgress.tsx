import React, { useEffect, useRef } from "react";

export const ReadingProgress = React.memo(function ReadingProgress({
  progress: propProgress,
}: { progress?: number } = {}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propProgress !== undefined && barRef.current) {
      barRef.current.style.width = `${propProgress}%`;
      barRef.current.style.opacity = propProgress > 0 ? "1" : "0";
      return;
    }

    let rafId = 0;
    const updateProgress = () => {
      rafId = 0;
      if (!barRef.current) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, (scrollY / total) * 100)) : 0;
      barRef.current.style.width = `${pct}%`;
      barRef.current.style.opacity = pct > 0 ? "1" : "0";
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateProgress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [propProgress]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] transition-[width] duration-75 ease-out"
        style={{ width: `${propProgress ?? 0}%`, opacity: (propProgress ?? 0) > 0 ? 1 : 0 }}
      />
    </div>
  );
});
