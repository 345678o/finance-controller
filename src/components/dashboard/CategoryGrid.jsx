import { motion } from "framer-motion";
import { metaForCategory } from "@/utils/categoryMeta";
import { inrCompact } from "@/utils/format";

export default function CategoryGrid({ breakdown }) {
  const max = Math.max(...breakdown.map((b) => b.amount), 1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      className="glass-card p-5"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-dim">
            Where money flows
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-ink">Top categories</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wider text-ink-muted">
          This month
        </span>
      </header>

      <div className="grid grid-cols-2 gap-2.5">
        {breakdown.map((b, idx) => (
          <CategoryTile
            key={b.category}
            category={b.category}
            amount={b.amount}
            pct={Math.round((b.amount / max) * 100)}
            delay={0.35 + idx * 0.06}
          />
        ))}
      </div>
    </motion.section>
  );
}

const SIZE = 64;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

function CategoryTile({ category, amount, pct, delay }) {
  const { Icon, color } = metaForCategory(category);
  const dashOffset = CIRC - (CIRC * pct) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.05]"
      style={{ boxShadow: `inset 0 0 0 1px ${color}1a` }}
    >
      <div className="flex items-center gap-3">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE}
            />
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={{ strokeDashoffset: CIRC }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + 0.1 }}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <Icon size={18} strokeWidth={2.2} style={{ color }} />
          </div>
        </div>

        <div className="min-w-0">
          <p className="truncate text-[12px] font-medium text-ink">{category}</p>
          <p className="text-base font-bold text-ink">{inrCompact(amount)}</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color }}>
            {pct}% of top
          </p>
        </div>
      </div>
    </motion.div>
  );
}
