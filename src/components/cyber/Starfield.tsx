import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

/**
 * Starfield — A lightweight retro starfield canvas background.
 * Renders tiny white dots with varying opacity and very slow, subtle twinkling.
 * Respects prefers-reduced-motion.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let animId: number;
    let stars: Star[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      const count = Math.floor(
        (canvas!.width * canvas!.height) / 12000,
      );
      stars = Array.from({ length: Math.min(count, 150) }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        radius: Math.random() * 1.0 + 0.2,
        baseOpacity: Math.random() * 0.4 + 0.1,
        opacity: 0,
        // Very slow twinkle — 5-10x slower than before
        twinkleSpeed: Math.random() * 0.0012 + 0.0005,
        twinklePhase: Math.random() * Math.PI * 2,
      }));
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const star of stars) {
        if (prefersReducedMotion) {
          star.opacity = star.baseOpacity;
        } else {
          star.opacity =
            star.baseOpacity *
            (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
        }

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 250, 240, ${star.opacity})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    animId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
