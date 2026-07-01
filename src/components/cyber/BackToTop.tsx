import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react"; // Fallback, but we'll use a custom SVG for "pixel" look

const PixelArrowUp = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
  >
    <path d="M10 2h4v4h4v4h4v4h-4v-4h-4v12h-4V10H6v4H2v-4h4V6h4V2z" />
  </svg>
);

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-50 p-3 
        bg-panel/80 backdrop-blur-sm border-2 
        border-neon-green/50 text-neon-green
        hover:bg-neon-green hover:text-background 
        hover:border-neon-green hover:shadow-[0_0_15px_rgba(var(--neon-green),0.6)]
        transition-all duration-300 ease-in-out cursor-pointer
      `}
      style={{
        boxShadow: "4px 4px 0px rgba(var(--neon-green), 0.2)",
        borderRadius: "0", // Square for pixel theme
      }}
      aria-label="Back to top"
    >
      <PixelArrowUp />
    </button>
  );
}
