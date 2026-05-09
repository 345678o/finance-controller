import { motion } from "framer-motion";
import { ArrowUpRight, Coins, Calendar, Target, Wallet } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";
import { inr, inrCompact } from "@/utils/format";

export default function SavingsSummary({
  totalSaved,
  monthSaved,
  roundUpThisMonth,
  goalProgress,
}) {
  const total      = useCountUp(totalSaved, 1.6);
  const month      = useCountUp(monthSaved, 1.4);
  const roundup    = useCountUp(roundUpThisMonth, 1.3);
  const progress   = useCountUp(goalProgress, 1.2);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
      className="glass-card relative overflow-hidden p-5"
    >
      {/* corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(0,255,174,0.25), transparent 60%)" }}
      />

      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-dim">
            Total Saved
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
            {inr(total)}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-neon-green/30 bg-neon-green/10 px-2.5 py-1 text-[11px] font-semibold text-neon-green">
          <ArrowUpRight size={12} strokeWidth={2.5} />
          12.4%
        </div>
      </header>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Tile
          Icon={Calendar}
          label="This month"
          value={inrCompact(month)}
          accent="#00e5ff"
        />
        <Tile
          Icon={Coins}
          label="Round-ups"
          value={inrCompact(roundup)}
          accent="#00ffae"
        />
        <Tile
          Icon={Target}
          label="Goals"
          value={`${progress}%`}
          accent="#ff2d92"
        />
      </div>
    </motion.section>
  );
}

function Tile({ Icon, label, value, accent }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.05]"
      style={{ boxShadow: `inset 0 0 0 1px ${accent}14` }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="grid h-6 w-6 place-items-center rounded-lg"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon size={12} strokeWidth={2.5} />
        </span>
        <p className="text-[10px] font-medium uppercase tracking-wider text-ink-dim">
          {label}
        </p>
      </div>
      <p className="mt-2 text-base font-bold text-ink">{value}</p>
    </div>
  );
}
