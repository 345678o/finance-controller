import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Activity,
  EyeOff,
} from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import { computeInsightsForPeriod } from "@/utils/dashboard";
import useCountUp from "@/hooks/useCountUp";
import { inr } from "@/utils/format";
import { metaForCategory } from "@/utils/categoryMeta";

import PageHeader              from "@/components/common/PageHeader";
import { OutlinedCard, TabStrip, StampPill } from "@/components/common/Outlined";

const TABS = ["This week", "Last week", "Month", "Year"];

export default function Insights() {
  const transactions = useAuraStore((s) => s.transactions);
  const [tab, setTab] = useState("This week");

  const insights = useMemo(
    () => computeInsightsForPeriod(transactions, tab),
    [transactions, tab],
  );

  return (
    <>
      <div className="fixed inset-0 bg-[var(--t-bg)]" aria-hidden />

      <div className="relative space-y-4">
        <PageHeader title="Insights" />

        {/* Hero — title swaps with the timeline */}
        <motion.section
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5"
        >
          <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
            {insights.copy.title}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#475569]">
            Tiny nudges that catch the spends you don't notice.
          </p>
        </motion.section>

        {/* Timeframe tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <TabStrip
            tabs={TABS}
            active={tab}
            onChange={setTab}
            layoutId="insights-tab-underline"
          />
        </motion.div>

        <PeriodTrend insights={insights} delay={0.12} />
        <Meters meters={insights.meters} delay={0.16} />
        <InvisibleSpend invisible={insights.invisible} sub={insights.copy.invisibleSub} delay={0.2} />
        <TopCategories breakdown={insights.breakdown} delay={0.24} />
      </div>
    </>
  );
}

// ── Period trend (big card) ───────────────────────────────────────────
function PeriodTrend({ insights, delay }) {
  const { series, totalCurrent, totalPrior, delta, copy, period } = insights;
  const max     = Math.max(...series.map((s) => s.total), 1);
  const current = useCountUp(totalCurrent, 1.0, [period]);
  const isUp    = delta >= 0;
  const pillColor = isUp ? "coral" : "teal";

  // Year view = 12 monthly bars → tighter spacing + first-letter labels.
  const dense = series.length > 8;

  return (
    <OutlinedCard className="p-5" delay={delay}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
            {copy.currentLabel}
          </p>
          <p className="num mt-1 text-[28px] font-extrabold leading-none tracking-tight text-[#0F172A]">
            {inr(current)}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">{copy.spread}</p>
        </div>
        <StampPill color={pillColor}>
          {isUp ? (
            <TrendingUp size={12} strokeWidth={2.6} />
          ) : (
            <TrendingDown size={12} strokeWidth={2.6} />
          )}
          {isUp ? "+" : ""}
          {delta}%
        </StampPill>
      </div>

      <div
        key={period}
        className={"mt-5 flex h-[88px] items-end justify-between " + (dense ? "gap-0.5" : "gap-1.5")}
      >
        {series.map((bucket, idx) => {
          const h = max ? (bucket.total / max) * 100 : 0;
          const isLast = idx === series.length - 1;
          return (
            <div key={idx} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-[64px] w-full items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(h, 4)}%` }}
                  transition={{
                    duration: 0.6,
                    delay: 0.12 + idx * 0.03,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="w-full rounded-md border-2 border-[#0F172A]"
                  style={{ background: isLast ? "var(--t-primary)" : "#FFFFFF" }}
                />
              </div>
              <span
                className={
                  "text-[9.5px] font-extrabold " +
                  (isLast ? "text-[#0F172A]" : "text-[#94A3B8]")
                }
              >
                {dense ? bucket.label[0] : bucket.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-[2px] w-full bg-[#0F172A]/10" />
      <p className="mt-3 text-[12px] text-[#64748B]">
        {copy.priorLabel}:{" "}
        <span className="num font-extrabold text-[#0F172A]">{inr(totalPrior)}</span>
      </p>
    </OutlinedCard>
  );
}

// ── Behavioral meters ─────────────────────────────────────────────────
function Meters({ meters, delay }) {
  const { discipline, impulseRisk, impulseRiskBand, savingsStability } = meters;

  return (
    <OutlinedCard className="p-5" delay={delay}>
      <header className="mb-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
          Behavioral meter
        </p>
        <h3 className="mt-1 text-[15px] font-extrabold text-[#0F172A]">
          How you're moving money
        </h3>
      </header>

      <div className="space-y-4">
        <Bar
          Icon={ShieldCheck}
          label="Discipline"
          value={discipline}
          fill="var(--t-secondary)"
          status={discipline >= 70 ? "Strong" : discipline >= 50 ? "Holding" : "Slipping"}
          color={discipline >= 70 ? "teal" : discipline >= 50 ? "mustard" : "coral"}
        />
        <Bar
          Icon={Zap}
          label="Impulse risk"
          value={impulseRisk}
          fill={impulseRisk < 30 ? "var(--t-secondary)" : impulseRisk < 60 ? "var(--t-primary)" : "var(--t-accent)"}
          status={impulseRiskBand}
          color={impulseRisk < 30 ? "teal" : impulseRisk < 60 ? "mustard" : "coral"}
        />
        <Bar
          Icon={Activity}
          label="Savings stability"
          value={savingsStability}
          fill="var(--t-lilac)"
          status={savingsStability >= 70 ? "Strong" : savingsStability >= 50 ? "Even" : "Weak"}
          color="lavender"
        />
      </div>
    </OutlinedCard>
  );
}

function Bar({ Icon, label, value, fill, status, color }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="flex items-center gap-2 font-bold text-[#0F172A]">
          <Icon size={14} strokeWidth={2.4} className="text-[#0F172A]" />
          {label}
        </span>
        <span className="flex items-center gap-2">
          <span className="num font-extrabold text-[#0F172A]">{safe}%</span>
          <StampPill color={color}>{status}</StampPill>
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border-2 border-[#0F172A] bg-white">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safe}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
          style={{ background: fill }}
        />
      </div>
    </div>
  );
}

// ── Invisible spend (warning) ─────────────────────────────────────────
function InvisibleSpend({ invisible, sub, delay }) {
  const total = useCountUp(invisible.total, 1.4, [sub]);

  return (
    <OutlinedCard className="overflow-hidden p-5" delay={delay}>
      <header className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2 border-[#0F172A] bg-[var(--t-accent)]">
          <EyeOff size={16} strokeWidth={2.6} className="text-[#0F172A]" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
            Invisible spending
          </p>
          <h3 className="mt-0.5 text-[15px] font-extrabold text-[#0F172A]">
            Tiny spends you didn't feel
          </h3>
        </div>
      </header>

      <p className="num mt-4 text-[32px] font-extrabold leading-none tracking-tight text-[#0F172A]">
        {inr(total)}
      </p>
      <p className="mt-1 text-[12px] text-[#64748B]">{sub}</p>

      {invisible.breakdown.length > 0 && (
        <ul className="mt-4 space-y-2">
          {invisible.breakdown.map((b) => (
            <li
              key={b.label}
              className="flex items-center justify-between rounded-xl border-2 border-[#0F172A] bg-[var(--t-bg)] px-3 py-2 text-[13px]"
            >
              <span className="font-bold text-[#0F172A]">{b.label}</span>
              <span className="num font-extrabold text-[#0F172A]">{inr(b.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </OutlinedCard>
  );
}

// ── Top categories ────────────────────────────────────────────────────
function TopCategories({ breakdown, delay }) {
  const max = Math.max(...breakdown.map((b) => b.amount), 1);

  return (
    <OutlinedCard className="p-5" delay={delay}>
      <header className="mb-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
          Where money flows
        </p>
        <h3 className="mt-1 text-[15px] font-extrabold text-[#0F172A]">
          Top categories
        </h3>
      </header>

      <ul className="space-y-3">
        {breakdown.map((b) => {
          const pct = (b.amount / max) * 100;
          const { Icon, color } = metaForCategory(b.category);
          return (
            <li key={b.category}>
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0F172A]"
                    style={{ background: color }}
                  >
                    <Icon size={13} strokeWidth={2.4} className="text-white" />
                  </span>
                  <span className="font-bold text-[#0F172A]">{b.category}</span>
                </div>
                <span className="num font-extrabold text-[#0F172A]">{inr(b.amount)}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full border-2 border-[#0F172A] bg-white">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                  style={{ background: color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </OutlinedCard>
  );
}
