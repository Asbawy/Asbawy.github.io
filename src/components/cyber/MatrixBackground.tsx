/**
 * CyberBackground — Pure CSS grid-dot background overlay.
 * Zero JavaScript, zero canvas, zero animation frames.
 * Uses the existing `grid-bg` CSS utility for a subtle dot pattern
 * with a fading mask and scanline overlay.
 */
export function CyberBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 light:hidden"
      aria-hidden="true"
    >
      {/* Dot grid layer */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines opacity-15" />
    </div>
  );
}
