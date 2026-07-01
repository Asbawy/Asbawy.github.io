/**
 * CyberBackground — Pure CSS grid-dot background overlay.
 * Zero JavaScript, zero canvas, zero animation frames.
 * Uses the existing `grid-bg` CSS utility for a subtle dot pattern
 * with a fading mask and scanline overlay.
 */
export function CyberBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Dot grid layer with drift animation */}
      <div className="absolute inset-0 grid-bg opacity-10 dark:opacity-20 animate-drift" />
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines opacity-5 dark:opacity-15" />
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.08)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}
