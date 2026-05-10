import { useId } from "react";
import { motion } from "framer-motion";
import { Palmtree, Laptop, Shield, Bike, Wallet } from "lucide-react";

const ICON_MAP = {
  palm:   Palmtree,
  laptop: Laptop,
  shield: Shield,
  bike:   Bike,
};

// SVG canvas
const W = 96;
const H = 124;

/* Build a path that draws the liquid: a wavy top edge, then straight down + across.
   `phase` shifts where the wave crest sits so successive frames animate naturally. */
function buildWavyPath(top, left, right, bottom, phase = 0) {
  const amp = 1.6;                      // wave height in svg units
  const offset = phase * (right - left); // horizontal phase shift
  const cp1x = left  + (right - left) * 0.25 + offset * 0.2;
  const cp2x = left  + (right - left) * 0.75 + offset * 0.2;
  const cp1y = top - amp;
  const cp2y = top + amp;
  return `
    M ${left - 2} ${top}
    C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${right + 2} ${top}
    L ${right + 2} ${bottom}
    L ${left  - 2} ${bottom}
    Z`;
}

// Jar body geometry
const BODY_TOP    = 26;
const BODY_BOTTOM = 112;
const BODY_LEFT   = 16;
const BODY_RIGHT  = 80;
const BODY_HEIGHT = BODY_BOTTOM - BODY_TOP;
const STROKE      = "#0F172A";

export default function JarIllustration({ color, fillPct, iconKey }) {
  const Icon = ICON_MAP[iconKey] || Wallet;
  const id = useId();
  const safePct = Math.max(0, Math.min(100, fillPct));
  const liquidH = (BODY_HEIGHT * safePct) / 100;
  const liquidTop = BODY_BOTTOM - liquidH;

  // Inner clip — slightly inset of the body stroke so liquid doesn't bleed
  const innerPath = `
    M ${BODY_LEFT + 1} ${BODY_TOP + 1}
    L ${BODY_RIGHT - 1} ${BODY_TOP + 1}
    L ${BODY_RIGHT - 1} ${BODY_BOTTOM - 6}
    Q ${BODY_RIGHT - 1} ${BODY_BOTTOM - 1} ${BODY_RIGHT - 6} ${BODY_BOTTOM - 1}
    L ${BODY_LEFT + 6} ${BODY_BOTTOM - 1}
    Q ${BODY_LEFT + 1} ${BODY_BOTTOM - 1} ${BODY_LEFT + 1} ${BODY_BOTTOM - 6}
    Z`;

  const outerPath = `
    M ${BODY_LEFT} ${BODY_TOP}
    L ${BODY_RIGHT} ${BODY_TOP}
    L ${BODY_RIGHT} ${BODY_BOTTOM - 6}
    Q ${BODY_RIGHT} ${BODY_BOTTOM} ${BODY_RIGHT - 6} ${BODY_BOTTOM}
    L ${BODY_LEFT + 6} ${BODY_BOTTOM}
    Q ${BODY_LEFT} ${BODY_BOTTOM} ${BODY_LEFT} ${BODY_BOTTOM - 6}
    Z`;

  return (
    <div className="relative shrink-0" style={{ width: W, height: H }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          <clipPath id={`${id}-clip`}>
            <path d={innerPath} />
          </clipPath>
        </defs>

        {/* soft drop shadow under jar */}
        <ellipse cx={W / 2} cy={119} rx={28} ry={2.5} fill={STROKE} opacity={0.14} />

        {/* lid */}
        <rect
          x={BODY_LEFT + 6}
          y={6}
          width={BODY_RIGHT - BODY_LEFT - 12}
          height={11}
          rx={2}
          fill="#FFFFFF"
          stroke={STROKE}
          strokeWidth={2}
        />
        <line
          x1={BODY_LEFT + 6}
          y1={11}
          x2={BODY_RIGHT - 6}
          y2={11}
          stroke={STROKE}
          strokeWidth={1}
          opacity={0.4}
        />

        {/* neck */}
        <rect
          x={BODY_LEFT + 4}
          y={17}
          width={BODY_RIGHT - BODY_LEFT - 8}
          height={9}
          fill="#FFFFFF"
          stroke={STROKE}
          strokeWidth={2}
        />

        {/* jar body — outlined */}
        <path
          d={outerPath}
          fill="#FFFFFF"
          stroke={STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Liquid (clipped to jar interior) */}
        <g clipPath={`url(#${id}-clip)`}>
          {/* Wavy liquid surface — animates a sine-wave path so the level breathes. */}
          <motion.path
            initial={{ d: buildWavyPath(BODY_BOTTOM, BODY_LEFT, BODY_RIGHT, BODY_BOTTOM, 0) }}
            animate={{
              d: [
                buildWavyPath(liquidTop, BODY_LEFT, BODY_RIGHT, BODY_BOTTOM, 0),
                buildWavyPath(liquidTop, BODY_LEFT, BODY_RIGHT, BODY_BOTTOM, 0.5),
                buildWavyPath(liquidTop, BODY_LEFT, BODY_RIGHT, BODY_BOTTOM, 1),
              ],
            }}
            transition={{
              d: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
            }}
            fill={color}
          />
          {/* Lighter "shine" stripe just under the meniscus */}
          {safePct > 6 && (
            <motion.rect
              x={BODY_LEFT - 2}
              width={BODY_RIGHT - BODY_LEFT + 4}
              height={2}
              fill="rgba(255,255,255,0.45)"
              initial={{ y: BODY_BOTTOM }}
              animate={{ y: [liquidTop + 4, liquidTop + 5, liquidTop + 4] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {/* Bubbles rising — only when there's enough liquid to host them */}
          {safePct > 14 && (
            <>
              <motion.circle
                cx={W * 0.34}
                r={1.4}
                fill="rgba(255,255,255,0.85)"
                initial={{ cy: BODY_BOTTOM, opacity: 0 }}
                animate={{
                  cy: [BODY_BOTTOM - 2, liquidTop + 4],
                  opacity: [0, 0.9, 0],
                }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              />
              <motion.circle
                cx={W * 0.62}
                r={1.1}
                fill="rgba(255,255,255,0.75)"
                initial={{ cy: BODY_BOTTOM, opacity: 0 }}
                animate={{
                  cy: [BODY_BOTTOM - 6, liquidTop + 6],
                  opacity: [0, 0.8, 0],
                }}
                transition={{ duration: 4.0, repeat: Infinity, ease: "easeOut", delay: 1.4 }}
              />
              <motion.circle
                cx={W * 0.5}
                r={0.9}
                fill="rgba(255,255,255,0.7)"
                initial={{ cy: BODY_BOTTOM, opacity: 0 }}
                animate={{
                  cy: [BODY_BOTTOM - 4, liquidTop + 5],
                  opacity: [0, 0.7, 0],
                }}
                transition={{ duration: 4.6, repeat: Infinity, ease: "easeOut", delay: 2.6 }}
              />
            </>
          )}
        </g>

        {/* Soft outer glow when the jar is nearly funded */}
        {safePct >= 80 && (
          <motion.ellipse
            cx={W / 2}
            cy={(BODY_TOP + BODY_BOTTOM) / 2}
            rx={36}
            ry={48}
            fill={color}
            opacity={0.18}
            animate={{ opacity: [0.12, 0.24, 0.12] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "blur(8px)" }}
          />
        )}
      </svg>

      {/* Icon centered in liquid (white, no glow halo on cream) */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "63%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon
          size={Math.round(W * 0.34)}
          strokeWidth={2}
          color="#FFFFFF"
          style={{
            filter: "drop-shadow(0 1px 0 rgba(15,23,42,0.20))",
          }}
        />
      </motion.div>
    </div>
  );
}
