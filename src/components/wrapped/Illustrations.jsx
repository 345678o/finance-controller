import { motion } from "framer-motion";
import { merchantBrand } from "@/utils/wrapped";

const STROKE = "#0F172A";

// ── Burger ─────────────────────────────────────────────────────────────
export function BurgerIllustration({ size = 64 }) {
  return (
    <svg
      viewBox="0 0 64 52"
      width={size}
      height={size * 0.81}
      aria-hidden
      className="drop-shadow-[2px_2px_0_rgba(15,23,42,0.18)]"
    >
      {/* top bun */}
      <ellipse cx="32" cy="14" rx="24" ry="9" fill="#D89550" stroke={STROKE} strokeWidth="1.5" />
      <ellipse cx="22" cy="9"  rx="1.6" ry="1" fill="#fff" opacity="0.55" />
      <ellipse cx="34" cy="11" rx="1.2" ry="0.8" fill="#fff" opacity="0.45" />
      <ellipse cx="42" cy="9"  rx="1.4" ry="0.9" fill="#fff" opacity="0.4" />
      {/* lettuce */}
      <path
        d="M8 23 Q12 20 16 23 Q20 20 24 23 Q28 20 32 23 Q36 20 40 23 Q44 20 48 23 Q52 20 56 23 L56 27 L8 27 Z"
        fill="#7CC04E"
        stroke={STROKE}
        strokeWidth="1.2"
      />
      {/* cheese */}
      <path d="M9 27 L55 27 L52 32 L12 32 Z" fill="#F5C842" stroke={STROKE} strokeWidth="1.2" />
      {/* patty */}
      <rect x="9" y="32" width="46" height="7" rx="2" fill="#6B3E22" stroke={STROKE} strokeWidth="1.2" />
      {/* bottom bun */}
      <ellipse cx="32" cy="44" rx="24" ry="7" fill="#B97A40" stroke={STROKE} strokeWidth="1.5" />
    </svg>
  );
}

// ── Clock (data-driven hands at hour:minute) — cream version ───────────
export function ClockIllustration({ hour = 22, minute = 48, size = 64 }) {
  const cx = 32;
  const cy = 32;
  const r  = 26;
  const minuteAngle = (minute * 6 - 90) * (Math.PI / 180);
  const hourAngle   = ((hour % 12) * 30 + minute * 0.5 - 90) * (Math.PI / 180);
  const minHandX = cx + Math.cos(minuteAngle) * 18;
  const minHandY = cy + Math.sin(minuteAngle) * 18;
  const hrHandX  = cx + Math.cos(hourAngle)   * 12;
  const hrHandY  = cy + Math.sin(hourAngle)   * 12;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden
      className="drop-shadow-[2px_2px_0_rgba(15,23,42,0.18)]"
    >
      {/* face */}
      <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={STROKE} strokeWidth="2" />
      {/* tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const x1 = cx + Math.cos(a) * (r - 4);
        const y1 = cy + Math.sin(a) * (r - 4);
        const x2 = cx + Math.cos(a) * (r - 1);
        const y2 = cy + Math.sin(a) * (r - 1);
        const major = i % 3 === 0;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={STROKE}
            strokeWidth={major ? 2 : 1}
            opacity={major ? 1 : 0.45}
            strokeLinecap="round"
          />
        );
      })}
      {/* hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={hrHandX}
        y2={hrHandY}
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={minHandX}
        y2={minHandY}
        stroke={STROKE}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* center pin */}
      <circle cx={cx} cy={cy} r="2.4" fill="#A855F7" stroke={STROKE} strokeWidth="1" />
      {/* sparkle */}
      <g transform="translate(54 14)">
        <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" fill="#A855F7" stroke={STROKE} strokeWidth="0.6" />
      </g>
    </svg>
  );
}

// ── Merchant tile (brand-coloured square with first letter) ─────────────
export function MerchantTile({ name, size = 56 }) {
  const { bg, fg } = merchantBrand(name);
  const initial = (name || "?")[0]?.toUpperCase() ?? "?";
  return (
    <div
      className="grid shrink-0 place-items-center rounded-2xl border-2 border-[#0F172A] font-extrabold shadow-[2px_2px_0_#0F172A]"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.42,
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

// ── Shopping bags ──────────────────────────────────────────────────────
export function BagsIllustration({ size = 64 }) {
  return (
    <svg
      viewBox="0 0 64 56"
      width={size}
      height={size * 0.875}
      aria-hidden
      className="drop-shadow-[2px_2px_0_rgba(15,23,42,0.18)]"
    >
      {/* bag 1 — purple */}
      <path d="M5 24 Q5 18 10 18 L18 18 Q23 18 23 24 L23 28" stroke={STROKE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="3" y="24" width="22" height="28" rx="2" fill="#7C3AED" stroke={STROKE} strokeWidth="1.6" />

      {/* bag 2 — red (front) */}
      <path d="M22 18 Q22 12 28 12 L40 12 Q46 12 46 18 L46 22" stroke={STROKE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="20" y="18" width="28" height="34" rx="2" fill="#EF4444" stroke={STROKE} strokeWidth="1.6" />
      <text x="34" y="38" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" opacity="0.95">D</text>

      {/* bag 3 — pink */}
      <path d="M44 22 Q44 16 49 16 L57 16 Q62 16 62 22 L62 26" stroke={STROKE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="42" y="22" width="20" height="30" rx="2" fill="#EC4899" stroke={STROKE} strokeWidth="1.6" />
    </svg>
  );
}

// ── Sparkline — animated line chart with end-dot ───────────────────────
export function SparklineIllustration({ values = [], size = 64 }) {
  const W = 100;
  const H = 50;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = values.length > 1 ? (i / (values.length - 1)) * W : W / 2;
    const y = H - 6 - ((v - min) / range) * (H - 12);
    return [x, y];
  });
  const pathD = points.length ? `M ${points.map((p) => p.join(",")).join(" L ")}` : "";
  const last = points[points.length - 1] || [W, H / 2];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size * 1.6}
      height={size}
      aria-hidden
    >
      {/* baseline */}
      <line x1="0" y1={H - 6} x2={W} y2={H - 6} stroke={STROKE} strokeWidth="0.8" opacity="0.25" />

      {pathD && (
        <>
          <motion.path
            d={pathD}
            stroke="#22C55E"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
          <motion.circle
            cx={last[0]}
            cy={last[1]}
            r="4"
            fill="#22C55E"
            stroke={STROKE}
            strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.3 }}
          />
        </>
      )}
    </svg>
  );
}

// ── Coin stack ─────────────────────────────────────────────────────────
export function CoinStackIllustration({ size = 64 }) {
  const stack = (cx, cy, tilt = 0) => (
    <g transform={`translate(${cx} ${cy}) rotate(${tilt})`}>
      <ellipse cx="0" cy="3" rx="14" ry="3.6" fill="#B47B12" stroke={STROKE} strokeWidth="1.2" />
      <rect x="-14" y="-3" width="28" height="6" fill="#E0AC2E" />
      <line x1="-14" y1="-3" x2="-14" y2="3" stroke={STROKE} strokeWidth="1.2" />
      <line x1="14"  y1="-3" x2="14"  y2="3" stroke={STROKE} strokeWidth="1.2" />
      <ellipse cx="0" cy="-3" rx="14" ry="3.6" fill="#FACC15" stroke={STROKE} strokeWidth="1.2" />
      <text x="0" y="0" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#92400E">
        ₹
      </text>
    </g>
  );

  return (
    <svg
      viewBox="0 0 64 56"
      width={size}
      height={size * 0.875}
      aria-hidden
      className="drop-shadow-[2px_2px_0_rgba(15,23,42,0.18)]"
    >
      {/* base shadow on cream */}
      <ellipse cx="32" cy="50" rx="22" ry="2.4" fill={STROKE} opacity="0.18" />
      {/* stack 1 (back) — 4 coins */}
      {stack(20, 20, -2)}
      {stack(20, 28, -2)}
      {stack(20, 36, -2)}
      {stack(20, 44, -2)}
      {/* stack 2 (front) — 3 coins */}
      {stack(42, 26, 2)}
      {stack(42, 34, 2)}
      {stack(42, 42, 2)}
    </svg>
  );
}
