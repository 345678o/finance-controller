import { useMemo } from "react";
import { useAuraStore } from "@/store/useAuraStore";
import {
  isThisMonth,
  sumBy,
  groupSpendByCategory,
  computeInvisibleSpend,
} from "@/utils/dashboard";

/**
 * Single source of truth for dashboard derivations.
 * Components read from here so the store stays minimal.
 */
export default function useDashboardData() {
  const transactions = useAuraStore((s) => s.transactions);
  const jars         = useAuraStore((s) => s.jars);
  const auraScore    = useAuraStore((s) => s.auraScore);
  const streak       = useAuraStore((s) => s.streak);

  return useMemo(() => {
    const monthTxns = transactions.filter((t) => isThisMonth(t.timestamp));

    const totalSaved      = sumBy(transactions, (t) => t.savedAmount);
    const monthSaved      = sumBy(monthTxns,   (t) => t.savedAmount);
    const monthSpent      = sumBy(monthTxns,   (t) => t.amount);
    const roundUpThisMonth = monthSaved;

    const totalGoalTarget = sumBy(jars, (j) => j.target);
    const totalGoalSaved  = sumBy(jars, (j) => j.saved);
    const goalProgress    = totalGoalTarget
      ? Math.round((totalGoalSaved / totalGoalTarget) * 100)
      : 0;

    const categoryBreakdown = groupSpendByCategory(monthTxns).slice(0, 4);
    const invisible         = computeInvisibleSpend(transactions);

    // Stability sub-metrics — derived from spend behavior so they feel earned
    const impulseBuys = monthTxns.filter(
      (t) => t.amount > 800 && (t.category === "Shopping" || t.category === "Beauty"),
    ).length;
    const discipline      = Math.max(40, Math.min(95, 100 - impulseBuys * 4));
    const impulseRiskRaw  = Math.min(100, impulseBuys * 12);
    const impulseRiskBand = impulseRiskRaw < 30 ? "Low" : impulseRiskRaw < 60 ? "Medium" : "High";
    const savingsStability = Math.min(96, 50 + Math.min(46, streak * 4));

    return {
      transactions,
      auraScore,
      streak,
      stability: Math.round((discipline + savingsStability) / 2),
      totalSaved,
      monthSaved,
      monthSpent,
      roundUpThisMonth,
      goalProgress,
      categoryBreakdown,
      invisible,
      meters: {
        discipline,
        impulseRisk: impulseRiskRaw,
        impulseRiskBand,
        savingsStability,
      },
      recentTxns: transactions.slice(0, 6),
    };
  }, [transactions, jars, auraScore, streak]);
}
