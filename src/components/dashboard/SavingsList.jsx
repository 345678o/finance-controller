import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import { inr } from "@/utils/format";

/* SavingsList — premium "Your Savings" section.
   Shows each goal jar as a clean cream card with a tinted left rail (the jar
   color), saved/target stats, and an inline progress bar. Tap to jump to the
   full Jars page where contributions happen.                                */

export default function SavingsList() {
  const jars = useAuraStore((s) => s.jars);
  const navigate = useNavigate();

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--t-ink-muted)]">
            Your savings
          </p>
          <h3 className="mt-1 text-[22px] font-extrabold tracking-tight text-[var(--t-ink)]">
            Where the spare change is parked
          </h3>
        </div>

        <button
          type="button"
          onClick={() => navigate("/jars")}
          className="inline-flex shrink-0 items-center gap-1 rounded-2xl border-2 px-3 py-2 text-[12px] font-extrabold transition-transform active:translate-y-[2px] active:shadow-none"
          style={{
            borderColor: "var(--t-line)",
            background: "var(--t-card)",
            boxShadow: "3px 3px 0 var(--t-line)",
            color: "var(--t-ink)",
          }}
        >
          View all
          <ArrowUpRight size={13} strokeWidth={2.6} />
        </button>
      </div>

      {/* Cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {jars.map((j, i) => (
          <SavingsTile key={j.id} jar={j} idx={i} onClick={() => navigate("/jars")} />
        ))}

        <motion.button
          type="button"
          onClick={() => navigate("/jars")}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.05 + jars.length * 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="group flex min-h-[124px] items-center justify-center gap-2 rounded-3xl border-2 border-dashed text-[13px] font-extrabold transition-colors hover:bg-[var(--t-bg-soft)]"
          style={{
            borderColor: "var(--t-line)",
            color: "var(--t-ink-muted)",
          }}
        >
          <Plus size={14} strokeWidth={2.6} />
          New jar
        </motion.button>
      </div>
    </section>
  );
}

function SavingsTile({ jar, idx, onClick }) {
  const pct = Math.min(100, Math.round((jar.saved / jar.target) * 100));
  const isFunded = pct >= 100;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay: 0.05 + idx * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative flex flex-col gap-3 overflow-hidden rounded-3xl border-2 bg-[var(--t-card)] p-4 text-left transition-transform active:translate-y-[2px] active:shadow-[2px_2px_0_var(--t-line)]"
      style={{
        borderColor: "var(--t-line)",
        boxShadow: "4px 4px 0 var(--t-line)",
      }}
    >
      {/* Tinted left rail in the jar's color */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-2"
        style={{ background: jar.color }}
      />

      <div className="flex items-start justify-between gap-2 pl-2">
        <div className="min-w-0">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-[var(--t-ink-muted)]">
            Goal jar
          </p>
          <h4 className="mt-0.5 truncate text-[15px] font-extrabold tracking-tight text-[var(--t-ink)]">
            {jar.name} <span className="ml-1 text-[14px]">{jar.emoji}</span>
          </h4>
        </div>

        {isFunded ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 px-2 py-0.5 text-[10.5px] font-extrabold"
            style={{
              borderColor: "var(--t-line)",
              background: "var(--t-secondary)",
              color: "var(--t-ink)",
              boxShadow: "2px 2px 0 var(--t-line)",
            }}
          >
            <Check size={10} strokeWidth={3} />
            Funded
          </span>
        ) : (
          <span
            className="num shrink-0 rounded-full border-2 px-2 py-0.5 text-[11px] font-extrabold"
            style={{
              borderColor: "var(--t-line)",
              background: "var(--t-card)",
              color: "var(--t-ink)",
            }}
          >
            {pct}%
          </span>
        )}
      </div>

      <div className="pl-2">
        <p className="num text-[20px] font-extrabold leading-none tracking-tight text-[var(--t-ink)]">
          {inr(jar.saved)}
        </p>
        <p className="num mt-1 text-[11.5px] text-[var(--t-ink-faint)]">
          of {inr(jar.target)}
        </p>
      </div>

      <div className="pl-2">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: "var(--t-line-soft)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: jar.color }}
          />
        </div>
      </div>
    </motion.button>
  );
}
