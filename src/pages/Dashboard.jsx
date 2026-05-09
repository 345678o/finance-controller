import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Wallet,
  Sparkles,
  Flame,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

import useDashboardData from "@/hooks/useDashboardData";
import useCountUp       from "@/hooks/useCountUp";
import { auraStateFor, formatTime } from "@/utils/dashboard";
import { merchantBrand }            from "@/utils/wrapped";
import { inr, inrCompact }          from "@/utils/format";

import PageHeader               from "@/components/common/PageHeader";
import { OutlinedCard, TabStrip } from "@/components/common/Outlined";

const TABS = ["Overview", "Saved", "Spent", "Goals"];

export default function Dashboard() {
  const d           = useDashboardData();
  const aura        = auraStateFor(d.auraScore);
  const [tab, setTab] = useState("Overview");
  const lastTxn     = d.recentTxns[0];

  const animatedSaved = useCountUp(d.totalSaved, 1.4);

  return (
    <>
      <div className="fixed inset-0 bg-[#F5F1E8]" aria-hidden />

      <div className="relative">
        <PageHeader title="Home" />

        {/* Hero greeting */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5"
        >
          <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
            Saving Everyday
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#475569]">
            Track every spend and grow your aura with intention.
          </p>
        </motion.section>

        {/* Search pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-4"
        >
          <Search
            size={17}
            strokeWidth={2.4}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0F172A]"
          />
          <input
            type="text"
            placeholder="Search transactions, jars..."
            className="w-full rounded-full border-2 border-[#0F172A] bg-white py-3 pl-11 pr-4 text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] shadow-[3px_3px_0_#0F172A] transition-transform focus:translate-y-[2px] focus:shadow-none focus:outline-none"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5"
        >
          <TabStrip
            tabs={TABS}
            active={tab}
            onChange={setTab}
            layoutId="dashboard-tab-underline"
          />
        </motion.div>

        {/* 2x2 stat grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatCard
            delay={0.16}
            Icon={Wallet}
            iconBg="#F5C842"
            label="Total saved"
            value={inr(animatedSaved)}
            sub={`${d.transactions.length} round-ups`}
          />
          <StatCard
            delay={0.20}
            Icon={Sparkles}
            iconBg="#5DD3CB"
            label="Aura score"
            value={`${d.auraScore}%`}
            sub={aura.label}
          />
          <StatCard
            delay={0.24}
            Icon={Flame}
            iconBg="#FF8C7A"
            label="Streak"
            value={String(d.streak)}
            sub="days going"
          />
          <StatCard
            delay={0.28}
            Icon={TrendingUp}
            iconBg="#C4B5FD"
            label="This month"
            value={`+ ${inrCompact(d.monthSaved)}`}
            sub="vs last cycle"
          />
        </div>

        {/* Last activity banner */}
        {lastTxn && <LastActivity txn={lastTxn} delay={0.32} />}
      </div>
    </>
  );
}

function StatCard({ Icon, iconBg, label, value, sub, delay = 0 }) {
  return (
    <OutlinedCard className="p-3" delay={delay} stamp="lg">
      <div
        className="grid aspect-[5/4] place-items-center overflow-hidden rounded-xl border-2 border-[#0F172A]"
        style={{ background: iconBg }}
      >
        <Icon size={36} strokeWidth={2.2} className="text-[#0F172A]" />
      </div>
      <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
        {label}
      </p>
      <p className="num mt-0.5 truncate text-[18px] font-extrabold tracking-tight text-[#0F172A]">
        {value}
      </p>
      <p className="num mt-0.5 text-[11px] text-[#64748B]">{sub}</p>
    </OutlinedCard>
  );
}

function LastActivity({ txn, delay }) {
  const brand = merchantBrand(txn.merchant);
  return (
    <OutlinedCard
      className="mt-5 flex items-center gap-3 p-3"
      delay={delay}
      stamp="md"
    >
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F172A]"
        style={{ background: brand.bg, color: brand.fg }}
      >
        <span className="text-[16px] font-extrabold">
          {(txn.merchant[0] || "?").toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#64748B]">
          Last spend
        </p>
        <p className="truncate text-[13px] font-bold text-[#0F172A]">
          {txn.merchant} · {formatTime(txn.timestamp)}
        </p>
      </div>
      <p className="num text-[14px] font-extrabold text-[#0F172A]">
        {inr(txn.amount)}
      </p>
      <button
        aria-label="Open"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#0F172A] bg-[#F5C842] transition-transform active:translate-y-[1px]"
      >
        <ChevronRight size={16} strokeWidth={2.6} className="text-[#0F172A]" />
      </button>
    </OutlinedCard>
  );
}
