import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

    if (savedTheme === "light" || (!savedTheme && prefersLight)) {
      setIsLight(true);
      document.documentElement.classList.add("light");
    } else {
      setIsLight(false);
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isLight;
    setIsLight(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-glass-border bg-white/[0.02] hover:border-emerald-400/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 shrink-0"
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
      aria-label="Toggle theme"
    >
      {isLight ? (
        <Moon className="h-4 w-4 text-purple-400 transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="h-4 w-4 text-emerald-400 transition-transform hover:rotate-45" />
      )}
    </button>
  );
}
