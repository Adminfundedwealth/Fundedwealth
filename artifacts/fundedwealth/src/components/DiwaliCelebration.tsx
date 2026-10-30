import { useEffect, useState } from "react";
import "./DiwaliCelebration.css";

type CelebrationPhase = "fireworks" | "greeting" | "fading";

const SESSION_KEY = "fundedwealth-diwali-celebration-played";
const WAIT_MS = 4_000;
const CELEBRATION_MS = 7_000;

let hasPlayedInMemory = false;
let sessionStorageUnavailable = false;

function wasPlayedThisSession(): boolean {
  if (sessionStorageUnavailable) return hasPlayedInMemory;

  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    sessionStorageUnavailable = true;
    return hasPlayedInMemory;
  }
}

function markPlayedThisSession(): void {
  hasPlayedInMemory = true;

  try {
    window.sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    sessionStorageUnavailable = true;
    // Keep the in-memory guard when browser storage is unavailable.
  }
}

function FireworksCanvas() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.querySelector<HTMLCanvasElement>("[data-diwali-fireworks]");
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      radius: number;
    };

    const colors = ["#ffd166", "#ff8a3d", "#ed5bd7", "#9d7bff", "#64d9ff"];
    const bursts = [
      { launchAt: 0, burstAt: 520, x: 0.18, y: 0.31 },
      { launchAt: 350, burstAt: 880, x: 0.79, y: 0.28 },
      { launchAt: 1_050, burstAt: 1_580, x: 0.56, y: 0.22 },
      { launchAt: 1_650, burstAt: 2_180, x: 0.34, y: 0.4 },
      { launchAt: 2_350, burstAt: 2_880, x: 0.87, y: 0.43 },
      { launchAt: 3_050, burstAt: 3_580, x: 0.12, y: 0.42 },
      { launchAt: 4_050, burstAt: 4_580, x: 0.68, y: 0.35 },
      { launchAt: 4_900, burstAt: 5_430, x: 0.43, y: 0.27 },
      { launchAt: 5_600, burstAt: 6_130, x: 0.91, y: 0.3 },
    ];
    const particles: Particle[] = [];
    const explodedBursts = new Set<number>();
    const startedAt = performance.now();
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const particleCount = isMobile ? 30 : 62;
    let frameId = 0;
    let previousFrame = startedAt;
    let width = 0;
    let height = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const launchRocket = (x: number, targetY: number, progress: number) => {
      const bottom = height + 12;
      const y = bottom + (targetY - bottom) * progress;
      const gradient = context.createLinearGradient(x * width, y + 34, x * width, y);
      gradient.addColorStop(0, "rgba(255, 209, 102, 0)");
      gradient.addColorStop(1, "rgba(255, 229, 164, 0.95)");
      context.beginPath();
      context.moveTo(x * width, y + 34);
      context.lineTo(x * width, y);
      context.strokeStyle = gradient;
      context.lineWidth = 2;
      context.shadowBlur = 12;
      context.shadowColor = "#ffd166";
      context.stroke();
      context.shadowBlur = 0;
    };

    const explode = (x: number, y: number) => {
      const centerX = x * width;
      const centerY = y * height;
      const color = colors[Math.floor(Math.random() * colors.length)];

      for (let index = 0; index < particleCount; index += 1) {
        const angle = (Math.PI * 2 * index) / particleCount + Math.random() * 0.12;
        const speed = 75 + Math.random() * (isMobile ? 145 : 210);
        const life = 0.85 + Math.random() * 0.75;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life,
          maxLife: life,
          color: Math.random() > 0.25 ? color : colors[Math.floor(Math.random() * colors.length)],
          radius: 1 + Math.random() * (isMobile ? 1.4 : 1.8),
        });
      }
    };

    const draw = (timestamp: number) => {
      const elapsed = timestamp - startedAt;
      const delta = Math.min((timestamp - previousFrame) / 1_000, 0.04);
      previousFrame = timestamp;
      context.clearRect(0, 0, width, height);

      bursts.forEach(({ launchAt, burstAt, x, y }, index) => {
        if (elapsed >= launchAt && elapsed < burstAt) {
          launchRocket(x, y, (elapsed - launchAt) / (burstAt - launchAt));
        }
        if (elapsed >= burstAt && !explodedBursts.has(index)) {
          explodedBursts.add(index);
          explode(x, y);
        }
      });

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.life -= delta;
        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }

        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vy += 58 * delta;
        const alpha = particle.life / particle.maxLife;
        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = particle.color;
        context.shadowBlur = 9;
        context.shadowColor = particle.color;
        context.fill();
      }

      context.globalAlpha = 1;
      context.shadowBlur = 0;
      if (elapsed < CELEBRATION_MS || particles.length > 0) {
        frameId = window.requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, width, height);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      context.clearRect(0, 0, width, height);
    };
  }, []);

  return <canvas aria-hidden="true" className="diwali-fireworks-canvas" data-diwali-fireworks />;
}

export default function DiwaliCelebration() {
  const [phase, setPhase] = useState<CelebrationPhase | null>(null);

  useEffect(() => {
    if (wasPlayedThisSession()) return;

    let remainingWait = WAIT_MS;
    let waitStartedAt = 0;
    let waitTimer: number | undefined;
    let phaseTimers: number[] = [];
    let active = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const startCelebration = () => {
      if (!active || wasPlayedThisSession()) return;
      markPlayedThisSession();
      setPhase(reducedMotion ? "greeting" : "fireworks");

      if (reducedMotion) {
        phaseTimers.push(window.setTimeout(() => setPhase("fading"), 2_000));
        phaseTimers.push(window.setTimeout(() => setPhase(null), 3_000));
        return;
      }

      phaseTimers = [
        window.setTimeout(() => setPhase("greeting"), 2_000),
        window.setTimeout(() => setPhase("fading"), 5_000),
        window.setTimeout(() => setPhase(null), CELEBRATION_MS),
      ];
    };

    const pauseWait = () => {
      if (waitTimer === undefined) return;
      window.clearTimeout(waitTimer);
      waitTimer = undefined;
      remainingWait = Math.max(0, remainingWait - (Date.now() - waitStartedAt));
    };

    const resumeWait = () => {
      if (!active || waitTimer !== undefined || document.visibilityState !== "visible") return;
      waitStartedAt = Date.now();
      waitTimer = window.setTimeout(startCelebration, remainingWait);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") resumeWait();
      else pauseWait();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    resumeWait();

    return () => {
      active = false;
      pauseWait();
      phaseTimers.forEach(window.clearTimeout);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (!phase) return null;

  return (
    <div
      aria-label={phase === "fireworks" ? undefined : "Happy Diwali"}
      aria-live={phase === "fireworks" ? undefined : "polite"}
      className={`diwali-celebration diwali-celebration--${phase}`}
      role={phase === "fireworks" ? undefined : "status"}
    >
      <FireworksCanvas />
      {phase !== "fireworks" && (
        <>
          <div aria-hidden="true" className="diwali-lantern diwali-lantern--left">✦</div>
          <div aria-hidden="true" className="diwali-lantern diwali-lantern--right">✦</div>
          <div aria-hidden="true" className="diwali-diya diwali-diya--left">🪔</div>
          <div aria-hidden="true" className="diwali-diya diwali-diya--right">🪔</div>
          <div className="diwali-greeting">
            <span aria-hidden="true" className="diwali-greeting__flourish">✧ ── ✦ ── ✧</span>
            <svg aria-hidden="true" className="diwali-greeting__lamp" viewBox="0 0 64 64">
              <path d="M32 8c-5 8-7 12-7 17a7 7 0 0 0 14 0c0-5-2-9-7-17Z" />
              <path d="M12 37c4 10 11 15 20 15s16-5 20-15H12Z" />
              <path d="M8 56c7 4 15 6 24 6s17-2 24-6" />
            </svg>
            <span className="diwali-greeting__happy">HAPPY</span>
            <span className="diwali-greeting__diwali">DIWALI</span>
            <span aria-hidden="true" className="diwali-greeting__flourish">✧ ── ❖ ── ✧</span>
          </div>
        </>
      )}
    </div>
  );
}
