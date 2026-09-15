import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  type: "neutral" | "emerald" | "cyan";
  hasSpike: boolean;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

/**
 * Starfield — An ultra-crisp ambient cyber starfield canvas background.
 * - Adapts dynamically to light and dark theme with tailored palettes.
 * - Multi-depth star layers (faint background, twinkling midground, glowing cyber beacons).
 * - Subtle 4-point diffraction flares on prominent stars.
 * - Occasional ambient shooting star streaks.
 * - Gentle celestial drift with seamless screen wrapping.
 * - Respects prefers-reduced-motion.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animId: number;
    let stars: Star[] = [];
    let shootingStar: ShootingStar | null = null;
    let nextShootingStarTime = performance.now() + 5000 + Math.random() * 8000;
    let isLight = document.documentElement.classList.contains("light");

    // Observe theme class changes on <html>
    const observer = new MutationObserver(() => {
      isLight = document.documentElement.classList.contains("light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      if (!canvas) return;
      const count = Math.floor((canvas.width * canvas.height) / 11000);
      const total = Math.min(Math.max(count, 60), 160);

      stars = Array.from({ length: total }, (_, i) => {
        // Star color type: 72% neutral, 16% emerald, 12% cyan
        const randType = Math.random();
        const type: "neutral" | "emerald" | "cyan" =
          randType < 0.72 ? "neutral" : randType < 0.88 ? "emerald" : "cyan";

        // Depth layering
        const isBeacon = i < 8; // Top 8 stars are beacons with diffraction flare
        const radius = isBeacon
          ? Math.random() * 0.8 + 1.4
          : Math.random() < 0.35
            ? Math.random() * 0.4 + 0.35 // distant
            : Math.random() * 0.6 + 0.7; // mid

        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          baseOpacity: isBeacon
            ? Math.random() * 0.3 + 0.65
            : Math.random() * 0.45 + 0.15,
          opacity: 0,
          twinkleSpeed: Math.random() * 0.0014 + 0.0006,
          twinklePhase: Math.random() * Math.PI * 2,
          type,
          hasSpike: isBeacon,
          // Subtle celestial drift (very slow)
          vx: (Math.random() - 0.5) * 0.04,
          vy: (Math.random() - 0.5) * 0.04,
        };
      });
    }

    function spawnShootingStar(now: number) {
      if (!canvas) return;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3; // ~45 deg downward diagonal
      const startX = Math.random() * (canvas.width * 0.8);
      const startY = Math.random() * (canvas.height * 0.4);

      shootingStar = {
        x: startX,
        y: startY,
        length: Math.random() * 80 + 70,
        speed: Math.random() * 6 + 9,
        angle,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 40 + 45,
      };

      nextShootingStarTime = now + 12000 + Math.random() * 14000;
    }

    function draw(time: number) {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check shooting star trigger
      if (!prefersReducedMotion && !shootingStar && time > nextShootingStarTime) {
        spawnShootingStar(time);
      }

      // Draw all stars
      for (const star of stars) {
        if (!prefersReducedMotion) {
          // Slow drift with wrap-around
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < 0) star.x = canvas.width;
          else if (star.x > canvas.width) star.x = 0;
          if (star.y < 0) star.y = canvas.height;
          else if (star.y > canvas.height) star.y = 0;

          // Twinkle
          star.opacity =
            star.baseOpacity *
            (0.55 + 0.45 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
        } else {
          star.opacity = star.baseOpacity;
        }

        // Color computation based on current theme
        let colorStr = "";
        if (isLight) {
          // White / Light Mode Palette
          if (star.type === "emerald") {
            colorStr = `rgba(5, 150, 105, ${star.opacity * 0.55})`;
          } else if (star.type === "cyan") {
            colorStr = `rgba(8, 145, 178, ${star.opacity * 0.55})`;
          } else {
            colorStr = `rgba(71, 85, 105, ${star.opacity * 0.42})`;
          }
        } else {
          // Dark Cyber Palette
          if (star.type === "emerald") {
            colorStr = `rgba(52, 211, 153, ${star.opacity * 0.95})`;
          } else if (star.type === "cyan") {
            colorStr = `rgba(56, 189, 248, ${star.opacity * 0.95})`;
          } else {
            colorStr = `rgba(240, 246, 255, ${star.opacity * 0.9})`;
          }
        }

        // Draw star dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = colorStr;
        ctx.fill();

        // Draw subtle 4-point diffraction spike on beacon stars
        if (star.hasSpike && star.opacity > 0.45) {
          const spikeLen = star.radius * (isLight ? 2.8 : 3.5);
          const spikeAlpha = isLight ? star.opacity * 0.22 : star.opacity * 0.4;
          const spikeColor = isLight
            ? `rgba(71, 85, 105, ${spikeAlpha})`
            : star.type === "emerald"
              ? `rgba(52, 211, 153, ${spikeAlpha})`
              : `rgba(240, 246, 255, ${spikeAlpha})`;

          ctx.strokeStyle = spikeColor;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          // Horizontal spike
          ctx.moveTo(star.x - spikeLen, star.y);
          ctx.lineTo(star.x + spikeLen, star.y);
          // Vertical spike
          ctx.moveTo(star.x, star.y - spikeLen);
          ctx.lineTo(star.x, star.y + spikeLen);
          ctx.stroke();
        }
      }

      // Draw and update shooting star
      if (shootingStar) {
        shootingStar.life++;
        const progress = shootingStar.life / shootingStar.maxLife;

        if (progress >= 1) {
          shootingStar = null;
        } else {
          const fadeAlpha =
            progress < 0.25
              ? progress / 0.25
              : 1 - (progress - 0.25) / 0.75;

          const currentOpacity = fadeAlpha * (isLight ? 0.6 : 0.85);

          // Move head
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;

          const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
          const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

          const grad = ctx.createLinearGradient(
            tailX,
            tailY,
            shootingStar.x,
            shootingStar.y,
          );

          if (isLight) {
            grad.addColorStop(0, "rgba(8, 145, 178, 0)");
            grad.addColorStop(0.7, `rgba(8, 145, 178, ${currentOpacity * 0.4})`);
            grad.addColorStop(1, `rgba(5, 150, 105, ${currentOpacity})`);
          } else {
            grad.addColorStop(0, "rgba(56, 189, 248, 0)");
            grad.addColorStop(0.7, `rgba(56, 189, 248, ${currentOpacity * 0.5})`);
            grad.addColorStop(1, `rgba(52, 211, 153, ${currentOpacity})`);
          }

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(shootingStar.x, shootingStar.y);
          ctx.stroke();

          // Small head glow
          ctx.beginPath();
          ctx.arc(shootingStar.x, shootingStar.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = isLight
            ? `rgba(5, 150, 105, ${currentOpacity})`
            : `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    animId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
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
