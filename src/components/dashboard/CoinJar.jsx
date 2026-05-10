import { useId, useMemo } from "react";
import { motion } from "framer-motion";

/* CoinJar — Coinly-inspired clear glass jar piled with chunky 3D coins and
   gemstones. Items are hand-curated (positions, rotations, types) so the
   pile looks natural — not the synthetic hex grid that gave the previous
   version away. As `pct` rises, more items fade-and-drop into the jar. */

const W = 240;
const H = 320;

// Body geometry
const TOP    = 64;
const BOTTOM = 286;
const LEFT   = 36;
const RIGHT  = 204;
const CORNER = 26;

function buildBodyPath() {
  return `
    M ${LEFT} ${TOP}
    L ${RIGHT} ${TOP}
    L ${RIGHT} ${BOTTOM - CORNER}
    Q ${RIGHT} ${BOTTOM} ${RIGHT - CORNER} ${BOTTOM}
    L ${LEFT + CORNER} ${BOTTOM}
    Q ${LEFT} ${BOTTOM} ${LEFT} ${BOTTOM - CORNER}
    Z`;
}

/* ── Item library ────────────────────────────────────────────────
   Hand-curated piles, sorted bottom-up. Each entry's `fill` is the
   minimum fill % at which it appears, so the pile grows in a
   visually believable order (heavy items settle, lighter on top).
   Packed densely with mixed coins / cash bills / gems so the jar
   reads as overflowing with money rather than half-empty.            */
const ITEMS = [
  // ── Floor row (y ~258-268) ─────────────────────────────────
  { kind: "bill",      x: 64,  y: 264, w: 38, h: 12, rot: -16, fill: 1 },
  { kind: "gemPurple", x: 102, y: 258, w: 28, rot: -10, fill: 2 },
  { kind: "coin",      x: 138, y: 262, r: 18, rot:  18, fill: 3, glyph: "₹" },
  { kind: "bill",      x: 174, y: 264, w: 30, h: 11, rot:  10, fill: 4 },
  { kind: "coinEdge",  x: 56,  y: 268, w: 18, h: 6,  rot: -8,  fill: 5 },
  { kind: "gemSilver", x: 78,  y: 268, w: 12, rot:  16, fill: 6 },
  { kind: "coin",      x: 188, y: 262, r: 14, rot: -24, fill: 7, glyph: "$" },

  // ── Lower-mid row (y ~232-246) ─────────────────────────────
  { kind: "coin",      x: 76,  y: 240, r: 17, rot:  -8, fill: 8, glyph: "$" },
  { kind: "gemSilver", x: 108, y: 236, w: 16, rot:  18, fill: 9 },
  { kind: "bill",      x: 146, y: 240, w: 36, h: 13, rot:  -4, fill: 10 },
  { kind: "gemPurple", x: 178, y: 234, w: 22, rot:  20, fill: 12 },
  { kind: "coinEdge",  x: 56,  y: 240, w: 16, h: 5,  rot:  14, fill: 14 },
  { kind: "coin",      x: 122, y: 246, r: 14, rot:  32, fill: 15, glyph: "₹" },
  { kind: "bill",      x: 92,  y: 244, w: 22, h: 9,  rot:  22, fill: 16 },

  // ── Mid row (y ~206-220) ───────────────────────────────────
  { kind: "gemPurple", x: 70,  y: 214, w: 24, rot: -16, fill: 18 },
  { kind: "coin",      x: 104, y: 212, r: 18, rot:  12, fill: 20, glyph: "₹" },
  { kind: "bill",      x: 142, y: 216, w: 32, h: 11, rot:   8, fill: 22 },
  { kind: "coin",      x: 174, y: 210, r: 16, rot: -22, fill: 24, glyph: "$" },
  { kind: "gemSilver", x: 56,  y: 212, w: 14, rot:  28, fill: 26 },
  { kind: "coinEdge",  x: 124, y: 220, w: 18, h: 5,  rot:  -8, fill: 27 },
  { kind: "gemPurple", x: 188, y: 218, w: 14, rot: -28, fill: 28 },

  // ── Upper-mid row (y ~182-196) ─────────────────────────────
  { kind: "coinEdge",  x: 76,  y: 188, w: 20, h: 6,  rot: -10, fill: 30 },
  { kind: "gemPurple", x: 108, y: 184, w: 22, rot:  10, fill: 32 },
  { kind: "coin",      x: 142, y: 188, r: 17, rot: -18, fill: 34, glyph: "₹" },
  { kind: "bill",      x: 176, y: 188, w: 28, h: 10, rot:  16, fill: 36 },
  { kind: "gemSilver", x: 60,  y: 192, w: 11, rot:  44, fill: 38 },
  { kind: "coin",      x: 124, y: 196, r: 13, rot:  24, fill: 39, glyph: "$" },

  // ── Higher row (y ~156-172) ────────────────────────────────
  { kind: "coin",      x: 84,  y: 164, r: 16, rot:  20, fill: 42, glyph: "$" },
  { kind: "gemSilver", x: 116, y: 162, w: 13, rot: -24, fill: 44 },
  { kind: "bill",      x: 150, y: 166, w: 30, h: 11, rot: -10, fill: 46 },
  { kind: "gemPurple", x: 182, y: 160, w: 18, rot:  14, fill: 48 },
  { kind: "coinEdge",  x: 60,  y: 168, w: 14, h: 4,  rot:  18, fill: 50 },
  { kind: "coin",      x: 134, y: 156, r: 14, rot: -10, fill: 52, glyph: "₹" },

  // ── Crown row (y ~132-148) ─────────────────────────────────
  { kind: "coinEdge",  x: 90,  y: 142, w: 18, h: 5,  rot:  22, fill: 56 },
  { kind: "coin",      x: 122, y: 138, r: 17, rot: -10, fill: 60, glyph: "₹" },
  { kind: "gemPurple", x: 156, y: 140, w: 20, rot:  18, fill: 64 },
  { kind: "bill",      x: 184, y: 142, w: 24, h: 9,  rot:  -6, fill: 68 },
  { kind: "gemSilver", x: 64,  y: 138, w: 12, rot: -34, fill: 72 },
  { kind: "coin",      x: 174, y: 132, r: 13, rot:  28, fill: 74, glyph: "$" },

  // ── Top scatter (y ~104-124) ───────────────────────────────
  { kind: "coin",      x: 100, y: 116, r: 15, rot:  14, fill: 76, glyph: "$" },
  { kind: "gemPurple", x: 138, y: 114, w: 18, rot: -22, fill: 80 },
  { kind: "bill",      x: 172, y: 118, w: 24, h: 9,  rot:  18, fill: 84 },
  { kind: "coinEdge",  x: 70,  y: 116, w: 16, h: 5,  rot:   8, fill: 86 },
  { kind: "gemSilver", x: 156, y: 104, w: 10, rot:  20, fill: 87 },
  { kind: "coin",      x: 116, y: 100, r: 12, rot: -18, fill: 88, glyph: "₹" },

  // ── Brim (y ~80-96) — peek over the top ─────────────────────
  { kind: "coin",      x: 124, y: 92,  r: 14, rot:   6, fill: 90, glyph: "₹" },
  { kind: "gemSilver", x: 156, y: 90,  w: 11, rot:  32, fill: 94 },
  { kind: "gemPurple", x: 92,  y: 88,  w: 14, rot: -18, fill: 96 },
  { kind: "bill",      x: 140, y: 82,  w: 22, h: 8,  rot:  10, fill: 98 },
  { kind: "coin",      x: 78,  y: 80,  r: 10, rot:  24, fill: 99, glyph: "$" },
];

export default function CoinJar({ pct = 0, badge }) {
  const safe = Math.max(0, Math.min(100, pct));
  const id = useId();

  const visible = useMemo(
    () => ITEMS.filter((it) => safe >= it.fill),
    [safe],
  );

  return (
    <div className="relative" style={{ width: W, height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        <defs>
          {/* Glass body — very subtle, lets the contents show through */}
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="rgba(15, 23, 42, 0.07)" />
            <stop offset="20%" stopColor="rgba(15, 23, 42, 0.02)" />
            <stop offset="80%" stopColor="rgba(15, 23, 42, 0.02)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.06)" />
          </linearGradient>
          <linearGradient id={`${id}-glass-shine`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="rgba(255, 255, 255, 0.65)" />
            <stop offset="60%" stopColor="rgba(255, 255, 255, 0.05)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.4)" />
          </linearGradient>

          {/* Coin gradients — face & rim */}
          <radialGradient id={`${id}-coin-gold`} cx="32%" cy="28%" r="78%">
            <stop offset="0%"  stopColor="#FFE89A" />
            <stop offset="40%" stopColor="#F2C84B" />
            <stop offset="100%" stopColor="#9C6A12" />
          </radialGradient>
          <linearGradient id={`${id}-coin-edge`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#E0A828" />
            <stop offset="50%" stopColor="#FFD56C" />
            <stop offset="100%" stopColor="#9C6A12" />
          </linearGradient>

          {/* Purple amethyst gradient */}
          <linearGradient id={`${id}-gem-purple`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%"  stopColor="#C8A6FF" />
            <stop offset="40%" stopColor="#7E52E0" />
            <stop offset="100%" stopColor="#3F1E84" />
          </linearGradient>

          {/* Silver gem gradient */}
          <linearGradient id={`${id}-gem-silver`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%"  stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#C0CDE4" />
            <stop offset="100%" stopColor="#5E6A86" />
          </linearGradient>

          {/* Cash bill gradient — folded banknote inside the jar */}
          <linearGradient id={`${id}-bill-front`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#D6F0CE" />
            <stop offset="50%" stopColor="#7CB37A" />
            <stop offset="100%" stopColor="#3E6A45" />
          </linearGradient>
          <linearGradient id={`${id}-bill-band`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#FFE08A" />
            <stop offset="50%" stopColor="#E0A828" />
            <stop offset="100%" stopColor="#9C6A12" />
          </linearGradient>

          {/* Clip mask = jar interior */}
          <clipPath id={`${id}-clip`}>
            <path d={buildBodyPath()} />
          </clipPath>
        </defs>

        {/* Soft drop shadow under jar */}
        <ellipse
          cx={W / 2}
          cy={BOTTOM + 14}
          rx={86}
          ry={8}
          fill="#0F172A"
          opacity="0.18"
          filter="blur(7px)"
        />

        {/* Lid — clear glass cap */}
        <rect
          x={LEFT + 22}
          y={28}
          width={RIGHT - LEFT - 44}
          height={20}
          rx={5}
          fill="rgba(255,255,255,0.55)"
          stroke="rgba(15,23,42,0.18)"
          strokeWidth={1.2}
        />
        {/* Lid screw groove */}
        <line
          x1={LEFT + 26}
          y1={32}
          x2={RIGHT - 26}
          y2={32}
          stroke="rgba(15,23,42,0.2)"
          strokeWidth={0.7}
        />
        <line
          x1={LEFT + 26}
          y1={44}
          x2={RIGHT - 26}
          y2={44}
          stroke="rgba(15,23,42,0.2)"
          strokeWidth={0.7}
        />

        {/* Neck */}
        <rect
          x={LEFT + 14}
          y={48}
          width={RIGHT - LEFT - 28}
          height={16}
          fill="rgba(255,255,255,0.45)"
          stroke="rgba(15,23,42,0.18)"
          strokeWidth={1.2}
        />

        {/* Glass body — light fill so contents show */}
        <path
          d={buildBodyPath()}
          fill={`url(#${id}-glass)`}
          stroke="rgba(15,23,42,0.22)"
          strokeWidth={1.4}
        />

        {/* Items inside, clipped */}
        <g clipPath={`url(#${id}-clip)`}>
          {visible.map((it, i) => (
            <CoinJarItem
              key={`${it.kind}-${it.x}-${it.y}`}
              item={it}
              index={i}
              gradId={id}
            />
          ))}
        </g>

        {/* Vertical glass shine on left */}
        <rect
          x={LEFT + 4}
          y={TOP + 8}
          width={6}
          height={BOTTOM - TOP - 16}
          rx={3}
          fill={`url(#${id}-glass-shine)`}
          opacity={0.55}
        />
        {/* Bottom inner shadow ellipse — fakes refraction at the base */}
        <ellipse
          cx={W / 2}
          cy={BOTTOM - 4}
          rx={(RIGHT - LEFT) / 2 - 6}
          ry={6}
          fill="rgba(15,23,42,0.08)"
          clipPath={`url(#${id}-clip)`}
        />
      </svg>

      {/* Status badge — floats above the jar like the reference */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1/2 top-[110px] -translate-x-1/2 rotate-[-10deg]"
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-white"
            style={{
              background: badge.color || "#FF8C7A",
              boxShadow: "0 6px 18px rgba(15,23,42,0.18), inset 0 -2px 0 rgba(0,0,0,0.18)",
            }}
          >
            {badge.icon}
            {badge.text}
          </span>
        </motion.div>
      )}
    </div>
  );
}

/* ─────────── Items ─────────── */

function CoinJarItem({ item, index, gradId }) {
  const delay = index * 0.05;
  const motionProps = {
    initial: { y: -50, opacity: 0, rotate: item.rot - 30 },
    animate: { y: 0, opacity: 1, rotate: item.rot },
    transition: {
      y:       { delay, type: "spring", stiffness: 240, damping: 18, mass: 0.9 },
      opacity: { delay, duration: 0.4 },
      rotate:  { delay, type: "spring", stiffness: 180, damping: 16 },
    },
  };

  if (item.kind === "coin") {
    return (
      <motion.g {...motionProps} style={{ transformOrigin: `${item.x}px ${item.y}px` }}>
        <CoinFace x={item.x} y={item.y} r={item.r} glyph={item.glyph} gradId={gradId} />
      </motion.g>
    );
  }

  if (item.kind === "coinEdge") {
    // Coin shown edge-on: thin ellipse with a side stripe to imply thickness
    return (
      <motion.g {...motionProps} style={{ transformOrigin: `${item.x}px ${item.y}px` }}>
        <ellipse
          cx={item.x}
          cy={item.y}
          rx={item.w}
          ry={item.h}
          fill={`url(#${gradId}-coin-edge)`}
          stroke="rgba(80, 50, 0, 0.55)"
          strokeWidth={0.5}
        />
        <ellipse
          cx={item.x}
          cy={item.y - 1.5}
          rx={item.w - 1.5}
          ry={item.h - 1.5}
          fill="rgba(255, 220, 130, 0.55)"
        />
      </motion.g>
    );
  }

  if (item.kind === "gemPurple" || item.kind === "gemSilver") {
    const fillId =
      item.kind === "gemPurple" ? `${gradId}-gem-purple` : `${gradId}-gem-silver`;
    const stroke =
      item.kind === "gemPurple" ? "rgba(50, 20, 100, 0.6)" : "rgba(60, 70, 95, 0.5)";
    return (
      <motion.g {...motionProps} style={{ transformOrigin: `${item.x}px ${item.y}px` }}>
        <Gem x={item.x} y={item.y} w={item.w} fillId={fillId} stroke={stroke} />
      </motion.g>
    );
  }

  if (item.kind === "bill") {
    return (
      <motion.g {...motionProps} style={{ transformOrigin: `${item.x}px ${item.y}px` }}>
        <Bill x={item.x} y={item.y} w={item.w} h={item.h} gradId={gradId} />
      </motion.g>
    );
  }

  return null;
}

function Bill({ x, y, w, h, gradId }) {
  // Folded cash bill — body, gold band, embossed ₹ glyph, tiny edge ticks.
  const left = x - w / 2;
  const top  = y - h / 2;
  const bandY = top + h * 0.5 - h * 0.18;
  return (
    <g>
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        rx={1.6}
        fill={`url(#${gradId}-bill-front)`}
        stroke="rgba(15,23,42,0.55)"
        strokeWidth={0.45}
      />
      {/* Top + bottom edge tick lines (the layered pages of a folded stack) */}
      <line x1={left + 1} y1={top + 1.5} x2={left + w - 1} y2={top + 1.5}
            stroke="rgba(15,23,42,0.45)" strokeWidth={0.3} />
      <line x1={left + 1} y1={top + h - 1.5} x2={left + w - 1} y2={top + h - 1.5}
            stroke="rgba(15,23,42,0.45)" strokeWidth={0.3} />
      {/* Gold band */}
      <rect
        x={left}
        y={bandY}
        width={w}
        height={h * 0.36}
        fill={`url(#${gradId}-bill-band)`}
        stroke="rgba(80,55,0,0.55)"
        strokeWidth={0.3}
      />
      {/* Tiny denomination */}
      <text
        x={x}
        y={bandY + h * 0.28}
        textAnchor="middle"
        fontSize={Math.max(3.2, h * 0.28)}
        fontWeight="900"
        fill="rgba(60,40,0,0.9)"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        ₹
      </text>
    </g>
  );
}

function CoinFace({ x, y, r, glyph = "₹", gradId }) {
  return (
    <g>
      {/* Body */}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={`url(#${gradId}-coin-gold)`}
        stroke="rgba(80, 50, 0, 0.6)"
        strokeWidth={0.7}
      />
      {/* Inner ring */}
      <circle
        cx={x}
        cy={y}
        r={r - 3}
        fill="none"
        stroke="rgba(80, 50, 0, 0.5)"
        strokeWidth={0.6}
      />
      {/* Specular highlight */}
      <ellipse
        cx={x - r * 0.35}
        cy={y - r * 0.45}
        rx={r * 0.32}
        ry={r * 0.18}
        fill="rgba(255, 255, 255, 0.7)"
      />
      {/* Glyph */}
      <text
        x={x}
        y={y + r * 0.34}
        textAnchor="middle"
        fontSize={r * 0.95}
        fontWeight="800"
        fill="rgba(80, 50, 0, 0.85)"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        {glyph}
      </text>
    </g>
  );
}

function Gem({ x, y, w, fillId, stroke }) {
  // Octagonal "diamond cut" gem with a couple of internal facet lines.
  const half = w / 2;
  const top = y - half;
  const bot = y + half;
  // Octagon points (8 vertices)
  const pts = [
    [x - half * 0.5, top],
    [x + half * 0.5, top],
    [x + half,        y - half * 0.4],
    [x + half,        y + half * 0.4],
    [x + half * 0.55, bot],
    [x - half * 0.55, bot],
    [x - half,        y + half * 0.4],
    [x - half,        y - half * 0.4],
  ];
  const poly = pts.map((p) => p.join(",")).join(" ");
  return (
    <g>
      {/* Body */}
      <polygon
        points={poly}
        fill={`url(#${fillId})`}
        stroke={stroke}
        strokeWidth={0.7}
      />
      {/* Internal facets — give the gem its cut */}
      <line x1={x - half * 0.5} y1={top} x2={x} y2={y} stroke={stroke} strokeWidth={0.45} opacity={0.6} />
      <line x1={x + half * 0.5} y1={top} x2={x} y2={y} stroke={stroke} strokeWidth={0.45} opacity={0.6} />
      <line x1={x - half} y1={y - half * 0.4} x2={x} y2={y} stroke={stroke} strokeWidth={0.45} opacity={0.6} />
      <line x1={x + half} y1={y - half * 0.4} x2={x} y2={y} stroke={stroke} strokeWidth={0.45} opacity={0.6} />
      <line x1={x - half * 0.55} y1={bot} x2={x} y2={y} stroke={stroke} strokeWidth={0.45} opacity={0.6} />
      <line x1={x + half * 0.55} y1={bot} x2={x} y2={y} stroke={stroke} strokeWidth={0.45} opacity={0.6} />
      {/* Highlight — top-left facet brightening */}
      <polygon
        points={`${pts[0][0]},${pts[0][1]} ${x},${y} ${pts[7][0]},${pts[7][1]}`}
        fill="rgba(255,255,255,0.45)"
      />
    </g>
  );
}
