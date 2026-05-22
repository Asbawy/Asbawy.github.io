import { useEffect, useState } from "react";

export function Typewriter({
  lines,
  speed = 32,
  className = "",
}: {
  lines: string[];
  speed?: number;
  className?: string;
}) {
  const [out, setOut] = useState<string[]>(lines.map(() => ""));
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= lines.length) return;
    if (charIdx >= lines[lineIdx].length) {
      const t = setTimeout(() => {
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      }, 240);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setOut((prev) => {
        const next = [...prev];
        next[lineIdx] = lines[lineIdx].slice(0, charIdx + 1);
        return next;
      });
      setCharIdx((c) => c + 1);
    }, speed);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx, lines, speed]);

  return (
    <div className={`font-mono ${className}`}>
      {lines.map((_, i) => (
        <div key={i} className="whitespace-pre-wrap">
          <span className="text-neon-green/70">$ </span>
          <span className="text-foreground">
            {out[i]}
            {i === lineIdx && <span className="caret" />}
          </span>
        </div>
      ))}
    </div>
  );
}