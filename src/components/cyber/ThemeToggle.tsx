import { useEffect, useState, MouseEvent } from "react";
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

  const toggleTheme = (e: MouseEvent<HTMLButtonElement>) => {
    const newTheme = !isLight;

    const applyTheme = () => {
      setIsLight(newTheme);
      if (newTheme) {
        document.documentElement.classList.add("light");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.remove("light");
        localStorage.setItem("theme", "dark");
      }
    };

    if (!document.startViewTransition) {
      document.documentElement.classList.add("theme-transition");
      applyTheme();
      setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
      }, 500);
      return;
    }

    document.startViewTransition(() => {
      applyTheme();
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-md px-3 py-2 border border-panel-border transition-colors text-xs w-full text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground/20 relative overflow-hidden group"
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      {isLight ? (
        <Moon className="h-4 w-4 text-accent-secondary transition-transform group-hover:-rotate-12" />
      ) : (
        <Sun className="h-4 w-4 text-accent-primary transition-transform group-hover:rotate-45" />
      )}
      <span className="font-mono">{isLight ? "dark_mode" : "light_mode"}</span>
    </button>
  );
}
