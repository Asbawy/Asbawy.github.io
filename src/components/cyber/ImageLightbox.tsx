import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

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
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={(e) => {
        // Close if clicked on the background overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={4}
        centerOnInit={true}
        limitToBounds={true}
        panning={{
          lockToContainerBoundary: true,
          velocityDisabled: false,
        }}
        wheel={{
          smoothStep: 0.005,
          step: 0.1,
        }}
        pinch={{
          step: 5,
        }}
        zoomAnimation={{
          animationType: "easeOut",
          animationTime: 200,
        }}
        doubleClick={{ disabled: false, mode: "toggle", step: 2 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Header controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-panel-border bg-background/50 backdrop-blur-sm z-10">
              <span className="font-mono text-xs text-muted-foreground truncate max-w-[50vw]">
                {alt || "Image Preview"}
              </span>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-foreground/5 border border-panel-border rounded-lg p-1 pointer-events-auto">
                  <button
                    onClick={() => zoomOut()}
                    className="p-1.5 rounded hover:bg-foreground/10 text-foreground transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="p-1.5 rounded hover:bg-foreground/10 text-foreground transition-colors cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => zoomIn()}
                    className="p-1.5 rounded hover:bg-foreground/10 text-foreground transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px h-6 bg-panel-border mx-1" />

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground border border-panel-border transition-colors cursor-pointer pointer-events-auto"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Viewport Area */}
            <div
              className="flex-1 relative overflow-hidden pointer-events-auto w-full h-full"
              onClick={(e) => {
                // Close if clicked on empty background viewport space
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                }}
              >
                {/* 
                  Wrapper container to handle click outside image and cursor states.
                  Must be flex centered to align the image when zoom is 1x.
                  We stop propagation on click so clicking the image doesn't close the modal.
                */}
                <div
                  className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      onClose();
                    }
                  }}
                >
                  <img
                    src={src}
                    alt={alt}
                    className="max-h-[80vh] max-w-[90vw] object-contain rounded border border-panel-border shadow-2xl select-none"
                    draggable={false}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>,
    document.body,
  );
}
