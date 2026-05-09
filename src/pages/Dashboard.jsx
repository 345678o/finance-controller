import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Wallet,
  Sparkles,
  Flame,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Target,
  PiggyBank,
  Coffee,
  Zap,
  BarChart3,
  MessageSquare,
} from "lucide-react";

import useDashboardData from "@/hooks/useDashboardData";
import useCountUp       from "@/hooks/useCountUp";
import { auraStateFor, formatTime, dailySpendSeries } from "@/utils/dashboard";
import { merchantBrand }            from "@/utils/wrapped";
import { inr, inrCompact }          from "@/utils/format";

import PageHeader               from "@/components/common/PageHeader";
import { TabStrip }             from "@/components/common/Outlined";

const TABS = ["Overview", "Saved", "Spent", "Goals"];

export default function Dashboard() {
  const d           = useDashboardData();
  const aura        = auraStateFor(d.auraScore);
  const [tab, setTab] = useState("Overview");
  const navigate     = useNavigate();
  const animatedSaved = useCountUp(d.totalSaved, 1.4);

  const series = useMemo(() => dailySpendSeries(d.transactions, 7), [d.transactions]);

  return (
    <>
      {/* Mobile header (replaced by TopNav on desktop) */}
      <PageHeader title="Home" />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-stretch">
        {/* Left: heading + search */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--t-ink-faint)]">
            Dashboard · {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
          </p>
          <h1 className="mt-2 text-[28px] md:text-[44px] lg:text-[52px] font-extrabold leading-[1.04] tracking-tight text-[var(--t-ink)]">
            Saving Everyday,
            <br className="hidden md:block" />{" "}
            <span
              className="rounded-2xl border-2 px-3 py-0.5 inline-block"
              style={{
                borderColor: "var(--t-line)",
                background: "var(--t-primary)",
                boxShadow: "4px 4px 0 var(--t-line)",
              }}
            >
              one round-up
            </span>{" "}
            at a time.
          </h1>
          <p className="mt-4 max-w-xl text-[14px] md:text-[15px] leading-relaxed text-[var(--t-ink-muted)]">
            Track every spend, grow your aura, and watch tiny round-ups stack
            into real savings. Your calm money loop, in one place.
          </p>

          {/* Search + quick CTA */}
          <div className="mt-5 flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search
                size={17}
                strokeWidth={2.4}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--t-ink)]"
              />
              <input
                type="text"
                placeholder="Search transactions, jars, merchants…"
                className="w-full rounded-2xl border-2 py-3.5 pl-11 pr-4 text-[14px] font-medium placeholder:text-[var(--t-ink-faint)] focus:translate-y-[2px] focus:shadow-none focus:outline-none transition-transform"
                style={{
                  borderColor: "var(--t-line)",
                  background: "var(--t-card)",
                  color: "var(--t-ink)",
                  boxShadow: "3px 3px 0 var(--t-line)",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate("/jars")}
              className="stamp-btn !py-3.5 !px-5"
              style={{ background: "var(--t-primary)" }}
            >
              <Plus size={16} strokeWidth={2.8} />
              New goal jar
            </button>
          </div>

          {/* Tabs (animated indicator) */}
          <div className="mt-6">
            <TabStrip
              tabs={TABS}
              active={tab}
              onChange={setTab}
              layoutId="dashboard-tab-underline"
            />
          </div>
        </motion.div>

        {/* Right: aura mini-card + quick stats summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4"
        >
          <AuraMiniCard score={d.auraScore} aura={aura} />
          <QuickSummary
            totalSaved={animatedSaved}
            monthSaved={d.monthSaved}
            txnCount={d.transactions.length}
            stability={d.stability}
          />
        </motion.div>
      </section>

      {/* ── 4-CARD GRID ────────────────────────────────────────────── */}
      <section className="mt-7 md:mt-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          delay={0.1}
          Icon={Wallet}
          tone="primary"
          label="Total saved"
          value={inr(animatedSaved)}
          sub={`${d.transactions.length} round-ups · all time`}
        />
        <StatCard
          delay={0.14}
          Icon={Sparkles}
          tone="secondary"
          label="Aura score"
          value={`${d.auraScore}%`}
          sub={aura.label + " · this week"}
        />
        <StatCard
          delay={0.18}
          Icon={Flame}
          tone="accent"
          label="Streak"
          value={String(d.streak)}
          sub="days saving in a row"
        />
        <StatCard
          delay={0.22}
          Icon={TrendingUp}
          tone="lilac"
          label="This month"
          value={`+ ${inrCompact(d.monthSaved)}`}
          sub="vs last cycle"
        />
      </section>

      {/* ── TWO-COLUMN BLOCK: Trends + Goal Progress ──────────────── */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TrendsCard series={series} delta={percentDelta(series)} />
        <GoalProgressCard progress={d.goalProgress} />
      </section>

      {/* ── THREE-COLUMN BLOCK: Recent Activity + Quick Actions ────── */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RecentActivityCard txns={d.recentTxns} />
        <QuickActionsCard />
      </section>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                              */
/* ────────────────────────────────────────────────────────────────────── */

const TONE_BG = {
  primary:   "var(--t-primary)",
  secondary: "var(--t-secondary)",
  accent:    "var(--t-accent)",
  lilac:     "var(--t-lilac)",
};

function percentDelta(series) {
  const half = Math.floor(series.length / 2);
  const a = series.slice(0, half).reduce((s, b) => s + b.total, 0) || 1;
  const b = series.slice(half).reduce((s, b) => s + b.total, 0);
  return Math.round(((b - a) / a) * 100);
}

/* ── Stat card (4-up grid) ───────────────────────────────────────────── */
function StatCard({ Icon, tone = "primary", label, value, sub, delay = 0 }) {
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
          style={{
            borderColor: "var(--t-line)",
            background: TONE_BG[tone],
          }}
        >
          <Icon size={26} strokeWidth={2.2} className="text-[var(--t-ink)]" />
        </div>
        <span
          className="grid h-9 w-9 place-items-center rounded-xl border-2 transition-transform group-hover:translate-x-0.5"
          style={{
            borderColor: "var(--t-line)",
            background: "var(--t-card-soft)",
          }}
        >
          <ArrowUpRight size={14} strokeWidth={2.6} />
        </span>
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

/* ── Aura mini-card (hero right) ─────────────────────────────────────── */
function AuraMiniCard({ score, aura }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="stamp-card stamp-card-hover p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
          Aura score
        </p>
        <span
          className="rounded-full border-2 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
          style={{
            borderColor: "var(--t-line)",
            background: aura.key === "stable"
              ? "var(--t-secondary)"
              : aura.key === "risky"
              ? "var(--t-primary)"
              : "var(--t-accent)",
          }}
        >
          {aura.label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-[96px] w-[96px] shrink-0">
          <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={r}
              fill="none"
              stroke="var(--t-line-soft)"
              strokeWidth="9"
            />
            <motion.circle
              cx="48"
              cy="48"
              r={r}
              fill="none"
              stroke="var(--t-primary)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="num text-[20px] font-extrabold">{score}%</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-[var(--t-ink)]">
            Your money is glowing.
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--t-ink-dim)]">
            {aura.caption}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Quick summary (hero right) ──────────────────────────────────────── */
function QuickSummary({ totalSaved, monthSaved, txnCount, stability }) {
  return (
    <div
      className="stamp-card stamp-card-hover p-5 flex flex-col gap-4"
      style={{ background: "var(--t-card-soft)" }}
    >
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
          Quick summary
        </p>
        <p className="num mt-1 text-[26px] font-extrabold tracking-tight text-[var(--t-ink)] leading-none">
          {inr(totalSaved)}
        </p>
        <p className="mt-1 text-[12px] text-[var(--t-ink-dim)]">
          across {txnCount} round-ups
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MicroStat
          label="This month"
          value={`+${inrCompact(monthSaved)}`}
          tint="var(--t-secondary)"
        />
        <MicroStat
          label="Stability"
          value={`${stability}%`}
          tint="var(--t-lilac)"
        />
      </div>
    </div>
  );
}

function MicroStat({ label, value, tint }) {
  return (
    <div
      className="rounded-xl border-2 p-2.5"
      style={{
        borderColor: "var(--t-line)",
        background: tint,
      }}
    >
      <p className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--t-ink-muted)]">
        {label}
      </p>
      <p className="num mt-0.5 text-[16px] font-extrabold leading-tight text-[var(--t-ink)]">
        {value}
      </p>
    </div>
  );
}

/* ── Trends card ─────────────────────────────────────────────────────── */
function TrendsCard({ series, delta }) {
  const max = Math.max(1, ...series.map((b) => b.total));
  const positive = delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
      className="stamp-card stamp-card-hover p-5 lg:col-span-2 flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
            Savings trends
          </p>
          <p className="mt-1 text-[18px] font-extrabold text-[var(--t-ink)]">
            Last 7 days of spend
          </p>
        </div>
        <span
          className="rounded-full border-2 px-3 py-1 text-[11px] font-extrabold inline-flex items-center gap-1"
          style={{
            borderColor: "var(--t-line)",
            background: positive ? "var(--t-accent)" : "var(--t-secondary)",
          }}
        >
          <TrendingUp size={12} strokeWidth={2.8} />
          {positive ? "+" : ""}{delta}%
        </span>
      </div>

      <div className="mt-5 flex h-[140px] items-end gap-2.5 sm:gap-3">
        {series.map((b, i) => {
          const h = 12 + Math.round((b.total / max) * 110);
          const isLast = i === series.length - 1;
          return (
            <motion.div
              key={i}
              className="flex-1 flex flex-col items-center justify-end gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
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
                transition={{ duration: 0.7, delay: 0.25 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className="text-[10px] font-extrabold text-[var(--t-ink-faint)] uppercase">
                {b.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Goal Progress ───────────────────────────────────────────────────── */
function GoalProgressCard({ progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.22 }}
      className="stamp-card stamp-card-hover p-5 flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
            Goal progress
          </p>
          <p className="mt-1 text-[18px] font-extrabold text-[var(--t-ink)]">
            All jars combined
          </p>
        </div>
        <div
          className="grid h-11 w-11 place-items-center rounded-2xl border-2"
          style={{
            borderColor: "var(--t-line)",
            background: "var(--t-lilac)",
          }}
        >
          <Target size={18} strokeWidth={2.4} />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <span className="num text-[36px] font-extrabold tracking-tight text-[var(--t-ink)] leading-none">
            {progress}%
          </span>
          <span className="text-[11px] font-bold text-[var(--t-ink-dim)]">
            on track
          </span>
        </div>

        <div
          className="mt-3 h-4 rounded-full border-2 overflow-hidden"
          style={{ borderColor: "var(--t-line)", background: "var(--t-card-soft)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "var(--t-primary)",
              borderRight: "2px solid var(--t-line)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-[var(--t-ink-dim)]">
          Keep stacking round-ups — you're closer than yesterday.
        </p>
      </div>
    </motion.div>
  );
}

/* ── Recent Activity ─────────────────────────────────────────────────── */
function RecentActivityCard({ txns }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.26 }}
      className="stamp-card p-5 lg:col-span-2"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
            Recent activity
          </p>
          <p className="mt-1 text-[18px] font-extrabold text-[var(--t-ink)]">
            Latest round-ups & spends
          </p>
        </div>
        <button className="stamp-btn !py-2 !px-3 text-[12px]">
          View all
          <ChevronRight size={14} strokeWidth={2.8} />
        </button>
      </div>

      <ul className="mt-5 divide-y-2" style={{ borderColor: "var(--t-line-soft)" }}>
        {txns.slice(0, 5).map((t) => {
          const brand = merchantBrand(t.merchant);
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 text-[14px] font-extrabold"
                style={{
                  borderColor: "var(--t-line)",
                  background: brand.bg,
                  color: brand.fg,
                }}
              >
                {(t.merchant[0] || "?").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-[var(--t-ink)]">
                  {t.merchant}
                </p>
                <p className="truncate text-[11px] text-[var(--t-ink-dim)]">
                  {t.category} · {formatTime(t.timestamp)}
                </p>
              </div>
              <div className="text-right">
                <p className="num text-[14px] font-extrabold text-[var(--t-ink)]">
                  {inr(t.amount)}
                </p>
                <p className="num text-[11px] font-bold text-[var(--t-ink-dim)]">
                  +{inr(t.savedAmount || 0)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

/* ── Quick Actions ───────────────────────────────────────────────────── */
function QuickActionsCard() {
  const navigate = useNavigate();
  const ACTIONS = [
    { label: "Import SMS",   icon: MessageSquare, tint: "var(--t-primary)",   to: "/import-sms" },
    { label: "Add jar",      icon: PiggyBank,     tint: "var(--t-secondary)", to: "/jars" },
    { label: "View insights",icon: BarChart3,     tint: "var(--t-accent)",    to: "/insights" },
    { label: "Wrapped",      icon: Sparkles,      tint: "var(--t-lilac)",     to: "/wrapped" },
    { label: "Rituals",      icon: Coffee,        tint: "var(--t-primary)",   to: "/future" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="stamp-card p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
            Quick actions
          </p>
          <p className="mt-1 text-[18px] font-extrabold text-[var(--t-ink)]">
            Jump in
          </p>
        </div>
        <Zap size={18} strokeWidth={2.4} className="text-[var(--t-ink-dim)]" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {ACTIONS.map(({ label, icon: Icon, tint, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="touch-target group rounded-2xl border-2 p-3 text-left transition-transform hover:-translate-y-0.5"
            style={{
              borderColor: "var(--t-line)",
              background: "var(--t-card-soft)",
              boxShadow: "3px 3px 0 var(--t-line)",
            }}
          >
            <span
              className="grid h-10 w-10 place-items-center rounded-xl border-2"
              style={{ borderColor: "var(--t-line)", background: tint }}
            >
              <Icon size={17} strokeWidth={2.4} />
            </span>
            <p className="mt-2.5 text-[13px] font-extrabold text-[var(--t-ink)]">
              {label}
            </p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
