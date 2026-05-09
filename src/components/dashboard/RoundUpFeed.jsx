import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { metaForCategory } from "@/utils/categoryMeta";
import { inr, inrCompact } from "@/utils/format";
import { formatDay, formatTime } from "@/utils/dashboard";

export default function RoundUpFeed({ transactions }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="glass-card p-5"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-dim">
            Round-up feed
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-ink">
            Spare change, on autopilot
          </h3>
        </div>
        <button className="flex items-center gap-1 text-[11px] font-semibold text-neon-green hover:brightness-110">
          See all
          <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </header>

      <ul className="divide-y divide-white/5">
        {transactions.map((t, idx) => (
          <Row key={t.id} t={t} idx={idx} />
        ))}
      </ul>
    </motion.section>
  );
}

function Row({ t, idx }) {
  const meta = metaForCategory(t.category);
  const { Icon, color } = meta;

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.12 + idx * 0.05, ease: "easeOut" }}
      className="flex items-center gap-3 py-3"
    >
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{
          background: `${color}1a`,
          boxShadow: `inset 0 0 0 1px ${color}55`,
          color,
        }}
      >
        <Icon size={16} strokeWidth={2.2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{t.merchant}</p>
        <p className="text-[11px] text-ink-dim">
          {formatDay(t.timestamp)} · {formatTime(t.timestamp)} · {t.paymentMethod}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold text-ink">{inr(t.amount)}</p>
        <p
          className="mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            color: "#00ffae",
            background: "rgba(0,255,174,0.10)",
            boxShadow: "inset 0 0 0 1px rgba(0,255,174,0.30)",
          }}
        >
          + {inrCompact(t.savedAmount)} saved
        </p>
      </div>
    </motion.li>
  );
}
