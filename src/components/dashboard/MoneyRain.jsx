import { useMemo } from "react";
import { motion } from "framer-motion";

/* MoneyRain — premium money-flowing effect that layers over the CoinJar.
   Three composed pieces:
   1. <CashOnLid> — a small wad of bills resting on top of the jar.
   2. <FallingBills> — banknotes drift down from above and fade as they
      approach the jar lid, looping continuously.
   3. <Sparkles> — gold glints that twinkle around the falling bills. */

const NOTE_W = 56;
const NOTE_H = 30;

export default function MoneyRain({
  // Container the effect lives inside (the jar stage). Coordinates are tuned
  // for a 240×320 jar with the lid roughly at y=40 from the top.
  width = 240,
  height = 320,
  count = 5,
  showStack = true,
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
      style={{ width, height }}
    >
      <FallingBills count={count} width={width} height={height} />
      <Sparkles count={8} width={width} height={height} />
      {showStack && <CashOnLid width={width} />}
    </div>
  );
}

/* ─────────── Falling bills ─────────── */

function FallingBills({ count, width, height }) {
  // Pseudo-random but stable per-mount distribution so the rain doesn't
  // re-shuffle every render.
  const bills = useMemo(() => {
    let s = 7;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      // Spread across the jar's width with edge bias for variety.
      xPct: 8 + rand() * 84,
      duration: 4.2 + rand() * 2.4,
      delay: rand() * 4,
      rotateStart: -20 + rand() * 40,
      rotateDelta: (rand() > 0.5 ? 1 : -1) * (40 + rand() * 60),
      sway: 14 + rand() * 18,
      kind: rand() > 0.55 ? "front" : "back",
      scale: 0.78 + rand() * 0.4,
    }));
  }, [count]);

  return (
    <>
      {bills.map((b) => (
        <motion.div
          key={b.id}
          className="absolute"
          style={{
            left: `${b.xPct}%`,
            top: -NOTE_H,
            width: NOTE_W,
            height: NOTE_H,
            transform: `translateX(-50%) scale(${b.scale})`,
            transformOrigin: "center",
            willChange: "transform, opacity",
          }}
          initial={{ y: 0, rotate: b.rotateStart, opacity: 0, x: 0 }}
          animate={{
            y: [0, height * 0.55],            // fall to ~lid level
            x: [0, b.sway, -b.sway, 0],       // gentle horizontal sway
            rotate: [b.rotateStart, b.rotateStart + b.rotateDelta],
            opacity: [0, 1, 1, 0.4, 0],       // fade out as it nears the lid
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeIn",
            times: [0, 0.15, 0.6, 0.85, 1],
          }}
        >
          <Banknote variant={b.kind} />
        </motion.div>
      ))}
    </>
  );
}

function Banknote({ variant = "front" }) {
  // Two flavors so successive bills don't read identical when overlapping.
  const isFront = variant === "front";
  return (
    <svg viewBox="0 0 56 30" className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`bill-${variant}`} x1="0" y1="0" x2="1" y2="1">
          {isFront ? (
            <>
              <stop offset="0%"   stopColor="#D1F0CC" />
              <stop offset="50%"  stopColor="#7CB37A" />
              <stop offset="100%" stopColor="#3F6B45" />
            </>
          ) : (
            <>
              <stop offset="0%"   stopColor="#E5DAA9" />
              <stop offset="50%"  stopColor="#B79E5A" />
              <stop offset="100%" stopColor="#5D4D2A" />
            </>
          )}
        </linearGradient>
      </defs>
      {/* Body */}
      <rect
        x="0.6"
        y="0.6"
        width="54.8"
        height="28.8"
        rx="2.5"
        fill={`url(#bill-${variant})`}
        stroke="rgba(15,23,42,0.45)"
        strokeWidth="0.6"
      />
      {/* Ornate inner border */}
      <rect
        x="2"
        y="2"
        width="52"
        height="26"
        rx="2"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.4"
      />
      {/* Center oval portrait */}
      <ellipse
        cx="28"
        cy="15"
        rx="9"
        ry="8"
        fill="rgba(255,255,255,0.18)"
        stroke="rgba(15,23,42,0.45)"
        strokeWidth="0.4"
      />
      <text
        x="28"
        y="18"
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        fill="rgba(15,23,42,0.78)"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        ₹
      </text>
      {/* Corner denominations */}
      <text x="5"  y="9"  fontSize="5" fontWeight="800" fill="rgba(15,23,42,0.78)">100</text>
      <text x="51" y="26" fontSize="5" fontWeight="800" fill="rgba(15,23,42,0.78)" textAnchor="end">100</text>
      {/* Decorative tick marks */}
      <line x1="6"  y1="22" x2="14" y2="22" stroke="rgba(15,23,42,0.6)" strokeWidth="0.3" />
      <line x1="42" y1="8"  x2="50" y2="8"  stroke="rgba(15,23,42,0.6)" strokeWidth="0.3" />
    </svg>
  );
}

/* ─────────── Sparkles ─────────── */

function Sparkles({ count, width, height }) {
  const dots = useMemo(() => {
    let s = 121;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand() * width,
      y: rand() * (height * 0.55),
      size: 1 + rand() * 1.8,
      duration: 2 + rand() * 2,
      delay: rand() * 3,
    }));
  }, [count, width, height]);

  return (
    <>
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
            background: "#FCD349",
            boxShadow: "0 0 6px rgba(252, 211, 73, 0.85)",
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.7, 1.2, 0.7] }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

/* ─────────── Cash wad on the jar lid ─────────── */

function CashOnLid({ width }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: width / 2,
        top: 14,
        transform: "translateX(-50%)",
      }}
      animate={{ y: [0, -1.5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="92" height="44" viewBox="0 0 92 44">
        <defs>
          <linearGradient id="bundle-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#D1F0CC" />
            <stop offset="50%" stopColor="#83BB7E" />
            <stop offset="100%" stopColor="#3D6940" />
          </linearGradient>
          <linearGradient id="band-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#FFE08A" />
            <stop offset="50%" stopColor="#E0A828" />
            <stop offset="100%" stopColor="#9C6A12" />
          </linearGradient>
        </defs>

        {/* Soft shadow under the wad */}
        <ellipse cx="46" cy="40" rx="34" ry="3" fill="rgba(15,23,42,0.35)" filter="blur(2px)" />

        {/* Back bundle (rotated left) */}
        <g transform="translate(20, 8) rotate(-7)">
          <rect width="50" height="22" rx="2.5" fill="url(#bundle-grad)" stroke="rgba(15,23,42,0.55)" strokeWidth="0.6" />
          <rect y="4"  width="50" height="0.6" fill="rgba(15,23,42,0.5)" />
          <rect y="17.4" width="50" height="0.6" fill="rgba(15,23,42,0.5)" />
          <rect y="9"  width="50" height="4"  fill="url(#band-grad)" stroke="rgba(80,55,0,0.55)" strokeWidth="0.4" />
          <text x="25" y="13" textAnchor="middle" fontSize="3.4" fontWeight="900" fill="rgba(60,40,0,0.85)" style={{ fontFamily: "system-ui, sans-serif" }}>1000</text>
        </g>

        {/* Front bundle (rotated right) */}
        <g transform="translate(28, 14) rotate(8)">
          <rect width="50" height="22" rx="2.5" fill="url(#bundle-grad)" stroke="rgba(15,23,42,0.55)" strokeWidth="0.6" />
          <rect y="4"  width="50" height="0.6" fill="rgba(15,23,42,0.5)" />
          <rect y="17.4" width="50" height="0.6" fill="rgba(15,23,42,0.5)" />
          <rect y="9"  width="50" height="4"  fill="url(#band-grad)" stroke="rgba(80,55,0,0.55)" strokeWidth="0.4" />
          <text x="25" y="13" textAnchor="middle" fontSize="3.4" fontWeight="900" fill="rgba(60,40,0,0.85)" style={{ fontFamily: "system-ui, sans-serif" }}>1000</text>
        </g>

        {/* Top bundle (mostly straight, slightly back) */}
        <g transform="translate(24, 0) rotate(-2)">
          <rect width="48" height="20" rx="2.5" fill="url(#bundle-grad)" stroke="rgba(15,23,42,0.55)" strokeWidth="0.6" />
          <rect y="3.5" width="48" height="0.5" fill="rgba(15,23,42,0.5)" />
          <rect y="16"  width="48" height="0.5" fill="rgba(15,23,42,0.5)" />
          <rect y="8"   width="48" height="3.5" fill="url(#band-grad)" stroke="rgba(80,55,0,0.55)" strokeWidth="0.4" />
        </g>
      </svg>
    </motion.div>
  );
}
