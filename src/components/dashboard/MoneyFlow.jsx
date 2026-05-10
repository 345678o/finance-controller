import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import useCountUp from "@/hooks/useCountUp";
import { inr, inrCompact } from "@/utils/format";

/* MoneyFlow — saved vs spent at a glance.
   Period chips switch the window; numbers + proportion bar + insight all
   recompute. Saved is round-up savings (the actual money parked into jars);
   spent is the gross transaction amount over the same window.               */

const PERIODS = [
  { key: "month", label: "Month" },
  { key: "year",  label: "Year"  },
  { key: "all",   label: "All"   },
];

function startOf(period) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "month") d.setDate(1);
  else if (period === "year") d.setMonth(0, 1);
  else if (period === "all") return new Date(0);
  return d;
}

function rangeLabel(period) {
  const d = new Date();
  if (period === "month") return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  if (period === "year")  return String(d.getFullYear());
  return "All time";
}

export default function MoneyFlow() {
  const transactions = useAuraStore((s) => s.transactions);
  const [period, setPeriod] = useState("month");

  const stats = useMemo(() => {
    const start = startOf(period);
    const filtered = transactions.filter((t) => new Date(t.timestamp) >= start);
    const saved = filtered.reduce((s, t) => s + (t.savedAmount || 0), 0);
    const spent = filtered.reduce((s, t) => s + (t.amount || 0), 0);
    const total = saved + spent;
    return {
      saved,
      spent,
      count: filtered.length,
      // The bar shows what share of "money you touched" stayed with future-you.
      savedPct: total ? Math.round((saved / total) * 100) : 0,
      // For the insight line.
      ratioPer100: spent ? Math.round((saved / spent) * 100) : 0,
    };
  }, [transactions, period]);

  const animatedSaved = useCountUp(stats.saved, 1.2, [period]);
  const animatedSpent = useCountUp(stats.spent, 1.2, [period]);

  const insight = useMemo(() => buildInsight(stats), [stats]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 overflow-hidden rounded-3xl border-2 border-[#0F172A] bg-[var(--t-card)] p-5 shadow-[5px_5px_0_#0F172A]"
    >
      {/* Header row */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--t-ink-muted)]">
            Money flow · {rangeLabel(period)}
          </p>
          <h3 className="mt-1 text-[20px] font-extrabold tracking-tight text-[var(--t-ink)]">
            Saved vs Spent
          </h3>
        </div>

        {/* Period chips */}
        <div
          className="inline-flex items-center gap-0.5 rounded-2xl border-2 p-0.5"
          style={{
            borderColor: "var(--t-line)",
            background: "var(--t-bg)",
          }}
        >
          {PERIODS.map((p) => {
            const active = p.key === period;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className="relative rounded-xl px-3 py-1 text-[11px] font-extrabold transition-colors"
                style={{
                  color: active ? "#0F172A" : "var(--t-ink-muted)",
                }}
              >
                {active && (
                  <motion.span
                    layoutId="moneyflow-period-pill"
                    className="absolute inset-0 rounded-xl border-2"
                    style={{
                      borderColor: "var(--t-line)",
                      background: "var(--t-primary)",
                    }}
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two big stat tiles */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <FlowTile
          label="Saved"
          value={inr(animatedSaved)}
          sub={`${stats.count} round-ups`}
          Icon={PiggyBank}
          arrow={ArrowUpRight}
          tint="var(--t-secondary)"
          accent="#0F172A"
        />
        <FlowTile
          label="Spent"
          value={inr(animatedSpent)}
          sub={stats.count ? `over ${stats.count} txns` : "no spends"}
          Icon={Wallet}
          arrow={ArrowDownRight}
          tint="var(--t-accent)"
          accent="#0F172A"
        />
      </div>

      {/* Proportion bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--t-ink-muted)]">
          <span>Saved share</span>
          <span className="num text-[var(--t-ink)]">{stats.savedPct}%</span>
        </div>
        <div
          className="mt-2 flex h-3 w-full overflow-hidden rounded-full border-2"
          style={{ borderColor: "var(--t-line)", background: "var(--t-bg)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.savedPct}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: "var(--t-secondary)" }}
            className="h-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - stats.savedPct}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: "var(--t-accent)" }}
            className="h-full border-l-2"
          />
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--t-ink-muted)]">
          <Legend swatch="var(--t-secondary)" label="Saved" amount={stats.saved} />
          <Legend swatch="var(--t-accent)"    label="Spent" amount={stats.spent} />
        </div>
      </div>

      {/* Insight line */}
      <div
        className="mt-4 flex items-start gap-2 rounded-2xl border-2 px-3.5 py-3"
        style={{
          borderColor: "var(--t-line-soft)",
          background: "var(--t-bg-soft)",
        }}
      >
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border-2"
          style={{ borderColor: "var(--t-line)", background: "var(--t-lilac)" }}
        >
          <ArrowUpRight size={13} strokeWidth={2.6} className="text-[#0F172A]" />
        </span>
        <p className="text-[12.5px] leading-relaxed text-[var(--t-ink)]">
          {insight}
        </p>
      </div>
    </motion.section>
  );
}

function buildInsight({ saved, spent, ratioPer100, count }) {
  if (count === 0) return "No activity in this window. Nothing to flow yet.";
  if (spent === 0)  return "You saved without spending — that's a vibe.";
  if (saved === 0)  return "Nothing rounded up yet. Try a smaller round-up step in Settings.";
  return `For every ₹100 you spent, ₹${ratioPer100} stayed with future you.`;
}

function FlowTile({ label, value, sub, Icon, arrow: Arrow, tint }) {
  return (
    <div
      className="rounded-2xl border-2 p-4"
      style={{
        borderColor: "var(--t-line)",
        background: tint,
        boxShadow: "3px 3px 0 var(--t-line)",
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0F172A] bg-white"
        >
          <Icon size={15} strokeWidth={2.4} className="text-[#0F172A]" />
        </span>
        <Arrow size={15} strokeWidth={2.6} className="text-[#0F172A]/60" />
      </div>
      <p className="mt-3 text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[#0F172A]/70">
        {label}
      </p>
      <p className="num mt-0.5 text-[22px] font-extrabold leading-none tracking-tight text-[#0F172A]">
        {value}
      </p>
      <p className="num mt-1 text-[11px] text-[#0F172A]/65">{sub}</p>
    </div>
  );
}

function Legend({ swatch, label, amount }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-sm border"
        style={{ background: swatch, borderColor: "var(--t-line)" }}
      />
      <span className="font-bold text-[var(--t-ink)]">{label}</span>
      <span className="num">{inrCompact(amount)}</span>
    </span>
  );
}
