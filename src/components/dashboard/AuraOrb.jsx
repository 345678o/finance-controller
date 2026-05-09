import { motion } from "framer-motion";
import { useMemo } from "react";
import useCountUp from "@/hooks/useCountUp";
import { auraStateFor } from "@/utils/dashboard";

const SIZE = 300;     // outer footprint
const CORE = 168;     // inner orb
const RING = 232;     // svg ring container

// Stable but varied particle positions
const buildParticles = (count = 8) =>
  Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.4 : -0.2);
    const radius = 92 + ((i * 13) % 28);
    return {
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      delay: (i * 0.35) % 2,
      size: 3 + (i % 3),
    };
  });

export default function AuraOrb({ score, stability }) {
  const aura = auraStateFor(score);
  const particles = useMemo(() => buildParticles(8), []);
  const animatedScore = useCountUp(score, 1.6);
  const animatedStab  = useCountUp(stability, 1.8);

  return (
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
      {/* Outer halo */}
      <motion.div
        aria-hidden
        className="absolute rounded-full blur-3xl"
        style={{
          width: SIZE,
          height: SIZE,
          background: `radial-gradient(circle, ${aura.hex}55 0%, transparent 65%)`,
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.65, 0.95, 0.65] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Concentric SVG rings */}
      <svg
        width={RING}
        height={RING}
        viewBox={`0 0 ${RING} ${RING}`}
        className="absolute"
        aria-hidden
      >
        <defs>
          <linearGradient id="auraRingA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor={aura.hex} stopOpacity="0.95" />
            <stop offset="60%" stopColor={aura.hex} stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff"  stopOpacity="0" />
          </linearGradient>
          <linearGradient id="auraRingB" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#00e5ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ff2d92" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* faint base ring */}
        <circle
          cx={RING / 2}
          cy={RING / 2}
          r={(RING - 8) / 2}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />

        {/* primary aura arc */}
        <motion.circle
          cx={RING / 2}
          cy={RING / 2}
          r={(RING - 24) / 2}
          fill="none"
          stroke="url(#auraRingA)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="180 480"
          style={{ originX: "50%", originY: "50%" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        {/* secondary counter-rotating arc */}
        <motion.circle
          cx={RING / 2}
          cy={RING / 2}
          r={(RING - 56) / 2}
          fill="none"
          stroke="url(#auraRingB)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="40 380"
          style={{ originX: "50%", originY: "50%" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.span
          aria-hidden
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: aura.hex,
            boxShadow: `0 0 8px ${aura.hex}`,
            x: p.x,
            y: p.y,
          }}
          animate={{
            y: [p.y, p.y - 6, p.y],
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 3.2 + (p.id % 3) * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      {/* Core orb */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: CORE,
          height: CORE,
          background: `
            radial-gradient(circle at 32% 30%, rgba(255,255,255,0.55), transparent 38%),
            radial-gradient(circle at 70% 80%, ${aura.hex}66, transparent 55%),
            radial-gradient(circle at 50% 50%, ${aura.hex}cc 0%, ${aura.hex}33 45%, #0a0a0a 100%)
          `,
          boxShadow: `0 0 60px ${aura.hexSoft}, inset 0 0 60px rgba(255,255,255,0.05)`,
        }}
        animate={{ scale: [1, 1.035, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* glass highlight */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 70% 35% at 50% 18%, rgba(255,255,255,0.35), transparent 60%)",
          }}
        />

        {/* center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/60">
            Aura Score
          </p>
          <p
            className="mt-1 text-6xl font-extrabold leading-none text-white"
            style={{ textShadow: aura.textShadow }}
          >
            {animatedScore}
          </p>
          <p className="mt-2 text-[11px] font-medium text-white/85">
            Stability {animatedStab}%
          </p>
          <div
            className="mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: aura.hex,
              background: `${aura.hex}1a`,
              boxShadow: `inset 0 0 0 1px ${aura.hex}55`,
            }}
          >
            {aura.label}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
