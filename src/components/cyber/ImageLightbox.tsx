import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string | null;
  alt: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!src) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // Prevent scrolling

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [src, onClose]);

  if (!src || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-h-screen max-w-screen-xl p-4">
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] max-w-full rounded-md border border-panel-border object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          className="absolute right-4 top-4 rounded-full bg-background/50 p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground backdrop-blur-md border border-panel-border"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
