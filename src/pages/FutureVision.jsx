import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Coffee,
  ShoppingBag,
  Zap,
  Target,
  ScanLine,
} from "lucide-react";

import useDashboardData from "@/hooks/useDashboardData";
import useCountUp from "@/hooks/useCountUp";
import PageHeader from "@/components/common/PageHeader";
import { inr, inrCompact } from "@/utils/format";

const HORIZONS = [
  { key: "1y",  years: 1,  label: "1 year",   caption: "the warm-up" },
  { key: "5y",  years: 5,  label: "5 years",  caption: "the glow up" },
  { key: "10y", years: 10, label: "10 years", caption: "the long game" },
  { key: "25y", years: 25, label: "25 years", caption: "the legacy arc" },
];

const ANNUAL_RATE = 0.07;

function futureValue(monthly, years, rate = ANNUAL_RATE) {
  const m = years * 12;
  const r = rate / 12;
  if (r === 0) return monthly * m;
  return monthly * ((Math.pow(1 + r, m) - 1) / r);
}

function categoryHabit(name) {
  const map = {
    Food:          { icon: Coffee,      swap: "Cook in twice a week",         cutPct: 0.3 },
    Cafes:         { icon: Coffee,      swap: "Brew at home, sip out once",   cutPct: 0.4 },
    Shopping:      { icon: ShoppingBag, swap: "Drop the impulse cart twice",  cutPct: 0.35 },
    Subscriptions: { icon: Zap,         swap: "Trim one streaming service",   cutPct: 0.25 },
    Beauty:        { icon: Sparkles,    swap: "Skip one haul this month",     cutPct: 0.3 },
    Entertainment: { icon: Sparkles,    swap: "One night in, one night out",  cutPct: 0.3 },
  };
  return map[name] || { icon: Target, swap: "Cap this category by a quarter", cutPct: 0.25 };
}

export default function FutureVision() {
  const navigate = useNavigate();
  const d = useDashboardData();
  const [horizon, setHorizon] = useState("5y");

  const active = HORIZONS.find((h) => h.key === horizon) ?? HORIZONS[1];

  const projection = useMemo(() => {
    const monthly = Math.max(d.monthSaved || 0, 200);
    const wealth = futureValue(monthly, active.years);
    const naive  = monthly * 12 * active.years;
    const compoundGain = wealth - naive;

    const points = Array.from({ length: active.years }, (_, i) => ({
      year: i + 1,
      value: futureValue(monthly, i + 1),
    }));

    const topLeak = d.categoryBreakdown[0];
    const monthlyLeak = topLeak ? topLeak.total : 0;
    const slipped = monthlyLeak * 12 * active.years;

    const glowDelta = Math.min(22, Math.round((d.streak || 0) * 1.2 + active.years * 0.6));
    const projectedAura = Math.min(99, (d.auraScore || 70) + glowDelta);

    return { monthly, wealth, naive, compoundGain, points, slipped, projectedAura, glowDelta };
  }, [d, active]);

  const habits = useMemo(() => {
    return (d.categoryBreakdown || []).slice(0, 2).map((c) => {
      const meta = categoryHabit(c.category);
      const monthlyCut = c.total * meta.cutPct;
      const projected = futureValue(monthlyCut, active.years);
      return { ...c, ...meta, monthlyCut, projected };
    });
  }, [d.categoryBreakdown, active.years]);

  const animatedWealth = useCountUp(projection.wealth, 1.4);
  const animatedSlip   = useCountUp(projection.slipped, 1.4);

  return (
    <>
      <PageHeader title="Future Vision" />

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 md:mt-6"
      >
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--t-ink-faint)]">
          Future Vision · {active.caption}
        </p>
        <h1 className="mt-2 text-[28px] md:text-[44px] lg:text-[52px] font-extrabold leading-[1.04] tracking-tight text-[var(--t-ink)]">
          Tomorrow's wallet,
          <br className="hidden md:block" />{" "}
          <span
            className="inline-block rounded-2xl border-2 px-3 py-0.5"
            style={{
              borderColor: "var(--t-line)",
              background: "var(--t-primary)",
              boxShadow: "4px 4px 0 var(--t-line)",
            }}
          >
            built today
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-[14px] md:text-[15px] leading-relaxed text-[var(--t-ink-muted)]">
          Project your current round-up rhythm forward. Compound at {Math.round(ANNUAL_RATE * 100)}% a year — see what
          the boring habits become when you stop watching the clock.
        </p>

        {/* Horizon selector + AR launcher */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {HORIZONS.map((h) => {
              const isActive = h.key === horizon;
              return (
                <button
                  key={h.key}
                  type="button"
                  onClick={() => setHorizon(h.key)}
                  className="rounded-2xl border-2 px-3.5 py-2 text-[12px] font-extrabold transition-transform active:translate-y-[2px]"
                  style={{
                    borderColor: "var(--t-line)",
                    background: isActive ? "var(--t-primary)" : "var(--t-card)",
                    color: "var(--t-ink)",
                    boxShadow: isActive ? "3px 3px 0 var(--t-line)" : "none",
                  }}
                >
                  {h.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => navigate("/scan")}
            className="stamp-btn shrink-0"
            style={{ background: "var(--t-secondary)" }}
          >
            <ScanLine size={14} strokeWidth={2.6} />
            Open AR scanner
          </button>
        </div>
      </motion.section>

      {/* 3 STAT CARDS */}
      <section className="mt-7 md:mt-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <FutureStatCard
          delay={0.1}
          Icon={TrendingUp}
          tone="primary"
          label="Future you owns"
          value={inr(animatedWealth)}
          sub={`compounded over ${active.years} ${active.years === 1 ? "year" : "years"}`}
          highlight={`+${inrCompact(projection.compoundGain)} from interest`}
          highlightTone="secondary"
        />
        <FutureStatCard
          delay={0.14}
          Icon={AlertTriangle}
          tone="accent"
          label="If habits don't flip"
          value={inr(animatedSlip)}
          sub={
            d.categoryBreakdown[0]
              ? `slipping into ${d.categoryBreakdown[0].category.toLowerCase()} alone`
              : "no leak detected — keep flowing"
          }
          highlight={d.categoryBreakdown[0] ? "leak alert" : "all clear"}
          highlightTone="primary"
        />
        <FutureStatCard
          delay={0.18}
          Icon={Sparkles}
          tone="lilac"
          label="Aura, projected"
          value={`${projection.projectedAura}%`}
          sub={`+${projection.glowDelta} pts from streak compounding`}
          highlight={projection.projectedAura >= 90 ? "glowing" : "rising"}
          highlightTone="accent"
        />
      </section>

      {/* PROJECTION CHART */}
      <section className="mt-6">
        <ProjectionCard
          points={projection.points}
          monthly={projection.monthly}
          horizonYears={active.years}
        />
      </section>

      {/* HABIT FLIPS */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {habits.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="stamp-card p-5 lg:col-span-2"
            >
              <p className="text-[13px] font-bold text-[var(--t-ink-muted)]">
                No spend leaks to flip yet — your habits are already aligned.
              </p>
            </motion.div>
          ) : (
            habits.map((h, i) => (
              <HabitFlipCard
                key={h.category}
                idx={i}
                habit={h}
                horizonLabel={active.label}
              />
            ))
          )}
        </AnimatePresence>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.32 }}
        className="mt-6 mb-2"
      >
        <div
          className="stamp-card stamp-card-hover flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: "var(--t-card-soft)" }}
        >
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
              Lock the future
            </p>
            <p className="mt-1 text-[18px] font-extrabold leading-tight text-[var(--t-ink)]">
              Park this projection into a goal jar
            </p>
            <p className="mt-1 text-[12px] text-[var(--t-ink-dim)]">
              Auto-route round-ups so {active.label.toLowerCase()} from now isn't a vibe — it's a balance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/jars")}
            className="stamp-btn shrink-0"
            style={{ background: "var(--t-primary)" }}
          >
            Open jars
            <ArrowRight size={14} strokeWidth={2.8} />
          </button>
        </div>
      </motion.section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

const TONE_BG = {
  primary:   "var(--t-primary)",
  secondary: "var(--t-secondary)",
  accent:    "var(--t-accent)",
  lilac:     "var(--t-lilac)",
};

function FutureStatCard({ Icon, tone, label, value, sub, highlight, highlightTone, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="stamp-card stamp-card-hover h-full p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div
          className="grid h-14 w-14 place-items-center rounded-2xl border-2"
          style={{ borderColor: "var(--t-line)", background: TONE_BG[tone] }}
        >
          <Icon size={26} strokeWidth={2.2} className="text-[var(--t-ink)]" />
        </div>
        {highlight && (
          <span
            className="rounded-full border-2 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
            style={{
              borderColor: "var(--t-line)",
              background: TONE_BG[highlightTone],
            }}
          >
            {highlight}
          </span>
        )}
      </div>

      <div className="mt-auto">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
          {label}
        </p>
        <p className="num mt-1 text-[28px] font-extrabold tracking-tight text-[var(--t-ink)] leading-none">
          {value}
        </p>
        <p className="num mt-2 text-[12px] text-[var(--t-ink-dim)]">{sub}</p>
      </div>
    </motion.div>
  );
}

function ProjectionCard({ points, monthly, horizonYears }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const tickEvery = points.length > 12 ? 5 : points.length > 6 ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.22 }}
      className="stamp-card stamp-card-hover p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
            Wealth curve
          </p>
          <p className="mt-1 text-[18px] font-extrabold text-[var(--t-ink)]">
            {inr(monthly)}/mo, compounding quietly
          </p>
        </div>
        <span
          className="rounded-full border-2 px-3 py-1 text-[11px] font-extrabold inline-flex items-center gap-1"
          style={{
            borderColor: "var(--t-line)",
            background: "var(--t-secondary)",
          }}
        >
          <TrendingUp size={12} strokeWidth={2.8} />
          {horizonYears}y
        </span>
      </div>

      <div className="mt-5 flex h-[180px] items-end gap-1.5 sm:gap-2">
        {points.map((p, i) => {
          const h = 14 + Math.round((p.value / max) * 150);
          const isLast = i === points.length - 1;
          const showTick = i === 0 || (i + 1) % tickEvery === 0 || isLast;
          return (
            <div
              key={p.year}
              className="flex-1 flex flex-col items-center justify-end gap-2 min-w-0"
            >
              <motion.div
                className="w-full rounded-t-xl border-2"
                style={{
                  borderColor: "var(--t-line)",
                  background: isLast ? "var(--t-primary)" : "var(--t-card-soft)",
                  boxShadow: "2px 2px 0 var(--t-line)",
                }}
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{
                  duration: 0.7,
                  delay: 0.25 + i * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
              <span className="text-[10px] font-extrabold text-[var(--t-ink-faint)] uppercase">
                {showTick ? `Y${p.year}` : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 grid grid-cols-3 divide-x-2 rounded-2xl border-2 overflow-hidden"
        style={{
          borderColor: "var(--t-line)",
          background: "var(--t-card-soft)",
        }}
      >
        <ProjectionStat label="Year 1"      value={inrCompact(points[0]?.value || 0)} />
        <ProjectionStat label={`Year ${Math.ceil(horizonYears / 2)}`} value={inrCompact(points[Math.ceil(horizonYears / 2) - 1]?.value || 0)} />
        <ProjectionStat label={`Year ${horizonYears}`} value={inrCompact(points[points.length - 1]?.value || 0)} highlight />
      </div>
    </motion.div>
  );
}

function ProjectionStat({ label, value, highlight }) {
  return (
    <div
      className="px-3 py-3 text-center"
      style={{ borderColor: "var(--t-line)" }}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--t-ink-muted)]">
        {label}
      </p>
      <p
        className="num mt-1 text-[16px] font-extrabold leading-tight text-[var(--t-ink)]"
        style={highlight ? { color: "var(--t-ink)" } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function HabitFlipCard({ habit, horizonLabel, idx }) {
  const Icon = habit.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, delay: 0.28 + idx * 0.06 }}
      className="stamp-card stamp-card-hover flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2"
          style={{
            borderColor: "var(--t-line)",
            background: idx === 0 ? "var(--t-accent)" : "var(--t-lilac)",
          }}
        >
          <Icon size={20} strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
            Habit flip · {habit.category}
          </p>
          <p className="mt-1 text-[16px] font-extrabold leading-snug text-[var(--t-ink)]">
            {habit.swap}
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl border-2 px-3.5 py-3"
        style={{
          borderColor: "var(--t-line)",
          background: "var(--t-card-soft)",
        }}
      >
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--t-ink-muted)]">
          Spare ~{inr(habit.monthlyCut)}/mo for {horizonLabel.toLowerCase()}
        </p>
        <p className="num mt-1 text-[22px] font-extrabold leading-none text-[var(--t-ink)]">
          + {inr(Math.round(habit.projected))}
        </p>
        <p className="mt-1.5 text-[11px] text-[var(--t-ink-dim)]">
          That's {inrCompact(Math.round(habit.projected))} sitting in future-you's account, just from one swap.
        </p>
      </div>
    </motion.div>
  );
}
