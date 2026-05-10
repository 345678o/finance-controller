import { useId } from "react";
import { motion } from "framer-motion";

/* GlassJar
   Premium dark-mode jar — glass body, gradient liquid (mint → lavender),
   wavy surface, rising bubble accents, soft outer glow halo.
   Used only on the home hero (deep-navy background context).               */

const W = 220;
const H = 300;

// Body geometry
const TOP    = 56;
const BOTTOM = 270;
const LEFT   = 36;
const RIGHT  = 184;
const CORNER = 22;

function buildBodyPath() {
  // Rounded jar body — straight neck top → bowed bottom corners.
  return `
    M ${LEFT} ${TOP}
    L ${RIGHT} ${TOP}
    L ${RIGHT} ${BOTTOM - CORNER}
    Q ${RIGHT} ${BOTTOM} ${RIGHT - CORNER} ${BOTTOM}
    L ${LEFT + CORNER} ${BOTTOM}
    Q ${LEFT} ${BOTTOM} ${LEFT} ${BOTTOM - CORNER}
    Z`;
}

function buildWavyLiquid(top, phase = 0) {
  const amp = 4;
  const offset = phase * (RIGHT - LEFT);
  const cp1x = LEFT + (RIGHT - LEFT) * 0.25 + offset * 0.15;
  const cp2x = LEFT + (RIGHT - LEFT) * 0.75 + offset * 0.15;
  const cp1y = top - amp;
  const cp2y = top + amp;
  return `
    M ${LEFT} ${top}
    C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${RIGHT} ${top}
    L ${RIGHT} ${BOTTOM - CORNER}
    Q ${RIGHT} ${BOTTOM} ${RIGHT - CORNER} ${BOTTOM}
    L ${LEFT + CORNER} ${BOTTOM}
    Q ${LEFT} ${BOTTOM} ${LEFT} ${BOTTOM - CORNER}
    Z`;
}

export default function GlassJar({ pct = 48, primary = "#5EEAD4", secondary = "#A78BFA" }) {
  const safe = Math.max(0, Math.min(100, pct));
  const liquidTop = BOTTOM - ((BOTTOM - TOP - 8) * safe) / 100;
  const id = useId();

  return (
    <div className="relative" style={{ width: W, height: H }}>
      {/* Outer glow halo */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: `radial-gradient(50% 55% at 50% 55%, ${primary}45 0%, ${secondary}25 40%, transparent 70%)`,
          filter: "blur(28px)",
        }}
      />

      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        <defs>
          {/* Glass surface gradient — subtle vertical highlight */}
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.10)" />
            <stop offset="35%"  stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.10)" />
          </linearGradient>

          {/* Liquid gradient — mint → lavender along the height */}
          <linearGradient id={`${id}-liquid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={primary}   stopOpacity="0.85" />
            <stop offset="50%"  stopColor={primary}   stopOpacity="0.95" />
            <stop offset="100%" stopColor={secondary} stopOpacity="0.95" />
          </linearGradient>

          {/* Inner highlight stripe (left side) */}
          <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
            <stop offset="60%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Clip mask = jar interior so liquid never bleeds outside */}
          <clipPath id={`${id}-clip`}>
            <path d={buildBodyPath()} />
          </clipPath>
        </defs>

        {/* Soft drop shadow under jar */}
        <ellipse cx={W / 2} cy={BOTTOM + 14} rx={70} ry={6} fill="#000" opacity="0.55" filter="blur(6px)" />

        {/* Lid — glassy neck cap */}
        <rect
          x={LEFT + 18}
          y={26}
          width={RIGHT - LEFT - 36}
          height={20}
          rx={6}
          fill="rgba(255,255,255,0.10)"
          stroke={`${primary}55`}
          strokeWidth={1}
        />

        {/* Neck */}
        <rect
          x={LEFT + 8}
          y={46}
          width={RIGHT - LEFT - 16}
          height={12}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />

        {/* Glass body */}
        <path
          d={buildBodyPath()}
          fill={`url(#${id}-glass)`}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={1.25}
        />

        {/* Liquid inside — wavy surface, gradient, animated */}
        <g clipPath={`url(#${id}-clip)`}>
          <motion.path
            initial={{ d: buildWavyLiquid(BOTTOM) }}
            animate={{
              d: [
                buildWavyLiquid(liquidTop, 0),
                buildWavyLiquid(liquidTop, 0.5),
                buildWavyLiquid(liquidTop, 1),
              ],
            }}
            transition={{
              d: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            fill={`url(#${id}-liquid)`}
          />
          {/* Meniscus shine */}
          {safe > 4 && (
            <motion.rect
              x={LEFT}
              width={RIGHT - LEFT}
              height={1.5}
              fill="rgba(255,255,255,0.55)"
              animate={{ y: [liquidTop + 3, liquidTop + 5, liquidTop + 3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Bubbles rising from base */}
          {safe > 14 &&
            [
              { cx: LEFT + 28, r: 2.4, dur: 4.4, delay: 0.4 },
              { cx: LEFT + 75, r: 1.6, dur: 5.2, delay: 1.6 },
              { cx: LEFT + 110, r: 2.0, dur: 4.8, delay: 2.8 },
              { cx: LEFT + 140, r: 1.4, dur: 5.6, delay: 0.8 },
            ].map((b, i) => (
              <motion.circle
                key={i}
                cx={b.cx}
                r={b.r}
                fill="rgba(255,255,255,0.85)"
                initial={{ cy: BOTTOM, opacity: 0 }}
                animate={{ cy: [BOTTOM - 4, liquidTop + 6], opacity: [0, 0.85, 0] }}
                transition={{ duration: b.dur, repeat: Infinity, ease: "easeOut", delay: b.delay }}
              />
            ))}

          {/* Inner left highlight stripe */}
          <rect
            x={LEFT + 4}
            y={TOP + 8}
            width={20}
            height={BOTTOM - TOP - 16}
            fill={`url(#${id}-shine)`}
          />
        </g>

        {/* Coin floating on liquid surface — rotates gently */}
        {safe > 6 && (
          <motion.g
            animate={{ y: [0, -1.5, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: `${W / 2}px ${liquidTop}px` }}
          >
            <ellipse
              cx={W / 2 + 24}
              cy={liquidTop - 4}
              rx={11}
              ry={3.5}
              fill="rgba(255, 220, 120, 0.95)"
              stroke="rgba(180, 140, 30, 0.8)"
              strokeWidth={0.8}
            />
            <text
              x={W / 2 + 24}
              y={liquidTop - 2}
              textAnchor="middle"
              fontSize="6"
              fontWeight="800"
              fill="rgba(120, 80, 0, 0.85)"
            >
              ₹
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
