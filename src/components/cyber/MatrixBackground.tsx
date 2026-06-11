import { useEffect, useRef } from "react";

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion — skip animation entirely
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let columns = 0;
    const drops: number[] = [];

    // Use larger cell size on mobile to reduce column count & GPU load
    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 22 : 16;

    // Matrix characters (Katakana + Latin + Digits)
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+{}[]|;:<>?,./アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split("");

    const resizeCanvas = () => {
      // Cap DPR to 1 so the canvas stays lightweight on high-DPI displays
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const newColumns = Math.floor(canvas.width / fontSize);

      // Add new drops if width increased
      if (newColumns > columns) {
        for (let i = columns; i < newColumns; i++) {
          drops[i] = Math.random() * -100;
        }
      }
      columns = newColumns;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Animation timing — lower FPS on mobile for battery savings
    let lastDrawTime = 0;
    const drawInterval = isMobile ? 50 : 30; // ~20fps mobile, ~33fps desktop
    let animationFrameId: number;

    const draw = (timestamp: number) => {
      if (timestamp - lastDrawTime < drawInterval) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastDrawTime = timestamp;

      // Semi-transparent background for the trail effect
      ctx.fillStyle = "rgba(10, 10, 10, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Character color
      ctx.fillStyle = "#00ff41";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = characters[Math.floor(Math.random() * characters.length)];

        // Draw character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop randomly when it hits bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }

        drops[i] += 0.4; // Fractional increment for a smoother glide
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    // Also listen for runtime changes to prefers-reduced-motion
    const onMotionChange = () => {
      if (motionQuery.matches) {
        cancelAnimationFrame(animationFrameId);
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      motionQuery.removeEventListener("change", onMotionChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-25 light:hidden"
      style={{
        willChange: "transform",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)"
      }}
    />
  );
}
