import { motion } from "framer-motion";
import { Flame, Leaf, ShieldCheck } from "lucide-react";

export default function StreakStrip({ streak }) {
  const items = [
    {
      Icon: Flame,
      tint: "#ff5470",
      tintBg: "rgba(255,84,112,0.12)",
      label: "Stability streak",
      big: `${streak}`,
      unit: "days",
      bar: Math.min(100, streak * 7),
    },
    {
      Icon: Leaf,
      tint: "#00ffae",
      tintBg: "rgba(0,255,174,0.12)",
      label: "No-spend days",
      big: `${Math.max(0, Math.min(7, streak - 2))}`,
      unit: "this wk",
      bar: 70,
    },
    {
      Icon: ShieldCheck,
      tint: "#00e5ff",
      tintBg: "rgba(0,229,255,0.12)",
      label: "Discipline XP",
      big: `+${streak * 8}`,
      unit: "xp",
      bar: 55,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
      className="grid grid-cols-3 gap-2"
    >
      {items.map((it, idx) => (
        <Badge key={it.label} {...it} delay={0.4 + idx * 0.06} />
      ))}
    </motion.section>
  );
}

function Badge({ Icon, tint, tintBg, label, big, unit, bar, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3"
      style={{ boxShadow: `inset 0 0 0 1px ${tint}1f` }}
    >
      <div className="flex items-center gap-2">
        <span
          className="grid h-7 w-7 place-items-center rounded-lg"
          style={{ background: tintBg, color: tint }}
        >
          <motion.span
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-flex" }}
          >
            <Icon size={14} strokeWidth={2.4} />
          </motion.span>
        </span>
        <p className="text-[10px] font-medium uppercase tracking-wider text-ink-dim">
          {label}
        </p>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <p className="text-xl font-extrabold text-ink" style={{ textShadow: `0 0 16px ${tint}55` }}>
          {big}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-ink-dim">{unit}</p>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${bar}%` }}
          transition={{ duration: 1.1, delay: delay + 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: tint, boxShadow: `0 0 8px ${tint}aa` }}
        />
      </div>
    </motion.div>
  );
}
