import { useRef, useCallback, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function IndiaTraderNetworkHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 30, damping: 22 });
  const sy = useSpring(my, { stiffness: 30, damping: 22 });
  const starX = useTransform(sx, [-500, 500], [-10, 10]);
  const starY = useTransform(sy, [-400, 400], [-8, 8]);
  const imgX = useTransform(sx, [-500, 500], [-6, 6]);
  const imgY = useTransform(sy, [-400, 400], [-4, 4]);

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  }, [mx, my]);

  const particles = useMemo(() => Array.from({ length: 55 }).map((_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: i < 8 ? 4 + Math.random() * 5 : i < 20 ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
    delay: Math.random() * 8, dur: 4 + Math.random() * 6,
    color: ["#D93AA0", "#AB18C2", "#DC4D34", "#4dd4ff", "#fbbf24", "#a855f7", "#ec4899", "#fff"][i % 8],
    opacity: i < 8 ? 0.7 : 0.2 + Math.random() * 0.4,
  })), []);

  return (
    <div ref={containerRef} onMouseMove={onMove} className="absolute inset-0 z-[0] overflow-hidden">
      {/* Background artwork */}
      <motion.img src="/maps/hero-artwork.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center z-[1]"
        style={{ x: imgX, y: imgY, scale: 1.03 }}
        initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1.03 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false}
      />

      {/* Star parallax + floating particles */}
      <motion.div className="absolute inset-0 z-[2] pointer-events-none" style={{ x: starX, y: starY }}>
        {particles.map((p) => (
          <div key={p.id} className="absolute rounded-full" style={{
            left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            backgroundColor: p.color, opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}60`,
            animation: `_floatDrift ${p.dur}s ease-in-out infinite`, animationDelay: `${p.delay}s`,
          }} />
        ))}
      </motion.div>

      {/* ═══ (Orbit + planets removed for cleaner design) ═══ */}

      {/* Shooting meteors (left → right) */}
      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
        {[{ y: 22, size: 8, dur: 6, delay: 0, color: "#DC4D34" }, { y: 48, size: 6, dur: 8, delay: 3, color: "#D93AA0" }, { y: 72, size: 5, dur: 10, delay: 6, color: "#4dd4ff" }, { y: 33, size: 10, dur: 7, delay: 1.5, color: "#fbbf24" }].map((m, i) => (
          <div key={i} className="absolute" style={{ top: `${m.y}%`, left: "-5%", width: m.size, height: m.size, borderRadius: "50%", background: m.color, boxShadow: `0 0 ${m.size * 3}px ${m.color}, 0 0 ${m.size * 6}px ${m.color}80, -${m.size * 8}px 0 ${m.size * 4}px ${m.color}40`, animation: `_meteorShoot ${m.dur}s linear infinite`, animationDelay: `${m.delay}s` }} />
        ))}
      </div>

      {/* Rising particles */}
      <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: 1.5 + Math.random() * 2.5, height: 1.5 + Math.random() * 2.5, left: `${5 + Math.random() * 90}%`, bottom: "-2%", backgroundColor: ["#D93AA0", "#AB18C2", "#DC4D34", "#4dd4ff", "#fbbf24"][i % 5], opacity: 0.5, boxShadow: `0 0 8px ${["#D93AA0", "#AB18C2", "#DC4D34", "#4dd4ff", "#fbbf24"][i % 5]}`, animation: `_riseParticle ${7 + Math.random() * 8}s ease-out infinite`, animationDelay: `${Math.random() * 12}s` }} />
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-0 z-[5] pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 72%, rgba(3,0,10,0.5) 90%, rgba(3,0,10,0.9) 100%)" }} />

      {/* Shimmer */}
      <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: "linear-gradient(115deg, transparent 40%, rgba(171,24,194,0.05) 50%, transparent 60%)", animation: "_shimmer 7s ease-in-out infinite" }} />

      <style>{`
        @keyframes _floatDrift {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          25% { transform: translate(10px, -6px) scale(1.15); opacity: 0.8; }
          50% { transform: translate(-5px, -12px) scale(0.9); opacity: 0.5; }
          75% { transform: translate(7px, 4px) scale(1.05); opacity: 0.7; }
        }
        @keyframes _meteorShoot {
          0% { transform: translateX(0); opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes _riseParticle {
          0% { transform: translateY(0) scale(1); opacity: 0.5; }
          80% { opacity: 0.15; }
          100% { transform: translateY(-90vh) scale(0.3); opacity: 0; }
        }
        @keyframes _shimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(120%); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
