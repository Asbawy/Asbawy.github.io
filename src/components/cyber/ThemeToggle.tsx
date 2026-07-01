import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
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
      className={`flex items-center gap-2 rounded-md px-3 py-2 border transition-all text-xs w-full text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/60
        ${
          isLight
            ? "border-neon-green/40 bg-neon-green/5 text-neon-green text-glow-green"
            : "border-neon-green/40 bg-neon-green/5 text-neon-green text-glow-green hover:border-glow-green"
        }`}
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span>{isLight ? "dark_mode" : "light_mode"}</span>
    </button>
  );
}
