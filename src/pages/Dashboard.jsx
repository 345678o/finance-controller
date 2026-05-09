import { motion } from "framer-motion";
import useDashboardData from "@/hooks/useDashboardData";

import TopHeader          from "@/components/dashboard/TopHeader";
import AuraOrb            from "@/components/dashboard/AuraOrb";
import SavingsSummary     from "@/components/dashboard/SavingsSummary";
import AICoachCard        from "@/components/dashboard/AICoachCard";
import StabilityMeter     from "@/components/dashboard/StabilityMeter";
import RoundUpFeed        from "@/components/dashboard/RoundUpFeed";
import InvisibleSpendCard from "@/components/dashboard/InvisibleSpendCard";
import CategoryGrid       from "@/components/dashboard/CategoryGrid";
import StreakStrip        from "@/components/dashboard/StreakStrip";

export default function Dashboard() {
  const d = useDashboardData();

  return (
    <div className="space-y-5">
      {/* 1 — Header */}
      <TopHeader auraScore={d.auraScore} />

      {/* 2 — Aura Orb (hero) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="-mt-1"
      >
        <AuraOrb score={d.auraScore} stability={d.stability} />
        <p className="mt-1 text-center text-[12px] text-ink-muted">
          Your week is moving in <span className="text-ink">flow</span> — small choices compounding.
        </p>
      </motion.div>

      {/* 3 — Savings Summary */}
      <SavingsSummary
        totalSaved={d.totalSaved}
        monthSaved={d.monthSaved}
        roundUpThisMonth={d.roundUpThisMonth}
        goalProgress={d.goalProgress}
      />

      {/* 4 — AI Coach */}
      <AICoachCard />

      {/* 5 — Stability Meter */}
      <StabilityMeter meters={d.meters} />

      {/* 6 — Round-up Feed */}
      <RoundUpFeed transactions={d.recentTxns} />

      {/* 7 — Invisible Spending */}
      <InvisibleSpendCard invisible={d.invisible} />

      {/* 8 — Category breakdown */}
      <CategoryGrid breakdown={d.categoryBreakdown} />

      {/* 9 — Streaks */}
      <StreakStrip streak={d.streak} />
    </div>
  );
}
