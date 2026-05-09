import { motion } from "framer-motion";
import { EyeOff, AlertTriangle } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";
import { inr } from "@/utils/format";

export default function InvisibleSpendCard({ invisible }) {
  const total = useCountUp(invisible.total, 1.6);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-neon-pink/30 bg-[#1a0a14]/60 p-5 backdrop-blur-xl"
      style={{ boxShadow: "0 0 32px rgba(255,45,146,0.18), inset 0 1px 0 rgba(255,255,255,0.04)" }}
    >
      {/* danger glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,45,146,0.45), transparent 65%)" }}
        animate={{ opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,84,112,0.30), transparent 65%)" }}
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-neon-pink/15 text-neon-pink">
            <EyeOff size={14} strokeWidth={2.4} />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neon-pink">
            Invisible spending
          </p>
        </div>

        <p className="mt-3 text-[11px] uppercase tracking-wider text-ink-dim">
          Disappeared this week
        </p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-white"
           style={{ textShadow: "0 0 24px rgba(255,45,146,0.45)" }}>
          {inr(total)}
        </p>

        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
          Tiny spends you didn't feel — subscription creep, late-night cravings, café drip.
          Plug them and your aura goes up.
        </p>

        {/* breakdown chips */}
        {invisible.breakdown.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {invisible.breakdown.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-ink-muted"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neon-pink/80" />
                {b.label} · <span className="text-ink">{inr(b.amount)}</span>
              </span>
            ))}
          </div>
        )}

        <button className="mt-4 inline-flex items-center gap-1.5 rounded-2xl border border-neon-pink/40 bg-neon-pink/10 px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-neon-pink/20">
          <AlertTriangle size={13} strokeWidth={2.4} className="text-neon-pink" />
          Trace the leaks
        </button>
      </div>
    </motion.section>
  );
}
