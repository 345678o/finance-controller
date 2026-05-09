import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Share2 } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import {
  computeWeeklyStory,
  dailySavingsSeries,
  format12h,
} from "@/utils/wrapped";
import { inr } from "@/utils/format";

import StatCard from "@/components/wrapped/StatCard";
import {
  BurgerIllustration,
  ClockIllustration,
  MerchantTile,
  BagsIllustration,
  SparklineIllustration,
  CoinStackIllustration,
} from "@/components/wrapped/Illustrations";

export default function Wrapped() {
  const navigate     = useNavigate();
  const transactions = useAuraStore((s) => s.transactions);
  const streak       = useAuraStore((s) => s.streak);

  const story  = useMemo(() => computeWeeklyStory(transactions, streak), [transactions, streak]);
  const series = useMemo(() => dailySavingsSeries(transactions, 7), [transactions]);

  const danger = format12h(story.dangerHour, story.dangerMinute);

  const handleShare = async () => {
    const text = `My AuraLoop week: ${inr(story.totalSaved)} saved · ${story.streak}-day streak · ${story.topMerchant.name} was my top merchant.`;
    if (navigator.share) {
      try { await navigator.share({ title: "Aura Wrapped", text }); } catch { /* dismissed */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(text); } catch { /* ignored */ }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#F5F1E8]" aria-hidden />

      <div className="relative">
        {/* Top bar — back · title · share, all outlined */}
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-[#0F172A] bg-[#F5C842] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            <ArrowLeft size={20} strokeWidth={2.6} className="text-[#0F172A]" />
          </button>

          <h1 className="text-[15px] font-extrabold tracking-tight text-[#0F172A]">
            Aura Wrapped
          </h1>

          <button
            onClick={handleShare}
            aria-label="Share"
            className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-[#0F172A] bg-white shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            <Share2 size={18} strokeWidth={2.4} className="text-[#0F172A]" />
          </button>
        </motion.header>

        {/* Hero subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 text-center text-[26px] font-extrabold leading-snug tracking-tight text-[#0F172A]"
        >
          Your Financial Story
          <br />
          This Week <span className="inline-block">✨</span>
        </motion.h2>

        {/* 2x3 grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard
            label="You spent"
            big={inr(story.foodSpend)}
            bigColor="#16A34A"
            sub="on food delivery"
            illustration={<BurgerIllustration size={64} />}
            illustrationAlign="center"
            delay={0.08}
          />

          <StatCard
            label="Most dangerous spending hour"
            big={danger.time}
            bigSuffix={danger.period}
            bigColor="#A855F7"
            illustration={
              <ClockIllustration
                hour={story.dangerHour}
                minute={story.dangerMinute}
                size={60}
              />
            }
            illustrationAlign="center"
            delay={0.14}
          />

          <StatCard
            label="Top Merchant"
            big={story.topMerchant.name}
            bigColor="#0F172A"
            sub={`${story.topMerchant.count} orders`}
            illustration={<MerchantTile name={story.topMerchant.name} size={52} />}
            delay={0.20}
          />

          <StatCard
            label="Impulse buys"
            big={inr(story.impulseSpend)}
            bigColor="#16A34A"
            sub={`${story.impulsePct}% of total spends`}
            illustration={<BagsIllustration size={64} />}
            delay={0.26}
          />

          <StatCard
            label="Savings Streak"
            big={String(story.streak)}
            bigColor="#16A34A"
            sub="days"
            illustration={<SparklineIllustration values={series} size={48} />}
            illustrationAlign="center"
            delay={0.32}
          />

          <StatCard
            label="Total Saved"
            big={inr(story.totalSaved)}
            bigColor="#16A34A"
            sub="from round-ups"
            illustration={<CoinStackIllustration size={60} />}
            delay={0.38}
          />
        </div>

        {/* Share CTA — mustard outlined pill */}
        <motion.button
          onClick={handleShare}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 w-full rounded-full border-2 border-[#0F172A] bg-[#F5C842] py-4 text-[14px] font-extrabold text-[#0F172A] shadow-[4px_4px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-[2px_2px_0_#0F172A]"
        >
          Share Your Wrap
        </motion.button>
      </div>
    </>
  );
}
