import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bell, Flame, Sparkles, TrendingUp } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import useDashboardData from "@/hooks/useDashboardData";
import useCountUp from "@/hooks/useCountUp";
import { inr, inrCompact } from "@/utils/format";
import GlassJar from "./GlassJar";
import Avatar from "@/components/profile/Avatar";

/* HomeHero — premium dark-mode "first screen" for the Dashboard.
   Self-contained card: top bar (greeting + avatar + bell) → glassy goal jar
   centerpiece → bottom strip with recent round-up, AI insight, and streak. */

function greetFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function pickPrimaryJar(jars) {
  if (!jars?.length) return null;
  // Prefer the jar with the highest progress that isn't yet funded — feels
  // most aspirational. Fall back to the first jar otherwise.
  const ranked = [...jars]
    .map((j) => ({ ...j, pct: j.target ? j.saved / j.target : 0 }))
    .filter((j) => j.pct < 1)
    .sort((a, b) => b.pct - a.pct);
  return ranked[0] || jars[0];
}

export default function HomeHero() {
  const profile = useAuraStore((s) => s.profile);
  const jars = useAuraStore((s) => s.jars);
  const transactions = useAuraStore((s) => s.transactions);
  const d = useDashboardData();

  const primary = useMemo(() => pickPrimaryJar(jars), [jars]);
  const pct = primary ? Math.min(100, Math.round((primary.saved / primary.target) * 100)) : 0;
  const animatedSaved = useCountUp(primary?.saved || 0, 1.4);

  const greeting = greetFor(new Date().getHours());

  const lastTxn = transactions?.[0];
  const insightText = useMemo(() => buildInsight(d), [d]);

  return (
    <section
      className="relative overflow-hidden rounded-[28px] text-white"
      style={{
        background:
          "radial-gradient(120% 80% at 12% -10%, #1B2547 0%, #0E152B 45%, #060912 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.06), 0 18px 50px rgba(6, 9, 18, 0.45)",
      }}
    >
      {/* Soft mint/lavender ambient orbs */}
      <Orbs />

      <div className="relative px-5 pb-5 pt-5 md:px-7 md:pb-7 md:pt-6">
        {/* ── Top bar ──────────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              profile={profile}
              size={42}
              radius={14}
              shadow={false}
              background="rgba(255,255,255,0.08)"
              className="!border-white/10"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                {greeting}
              </p>
              <p className="text-[15px] font-semibold tracking-tight text-white">
                {profile.displayName}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-2xl border backdrop-blur-md transition-transform active:scale-95"
            style={{
              borderColor: "rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <Bell size={16} strokeWidth={1.9} className="text-white/85" />
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
              style={{ background: "#5EEAD4", boxShadow: "0 0 6px #5EEAD4" }}
            />
          </button>
        </header>

        {/* ── Hero stage ───────────────────────────────────────── */}
        <div className="relative mt-2 flex flex-col items-center md:flex-row md:gap-8">
          {/* Left side info on desktop, top stacked on mobile */}
          <div className="order-2 mt-2 w-full md:order-1 md:mt-0 md:flex-1 md:text-left">
            <p className="text-center text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]/85 md:text-left">
              {primary ? "Top jar" : "No jars yet"}
            </p>
            <h2 className="mt-1.5 text-center text-[22px] font-semibold leading-tight tracking-tight md:text-left md:text-[26px]">
              {primary?.name || "Create your first jar"}
              {primary?.emoji && (
                <span className="ml-1.5 align-middle text-[20px]">{primary.emoji}</span>
              )}
            </h2>

            {primary && (
              <>
                <div className="mt-4 flex items-baseline justify-center gap-2 md:justify-start">
                  <span className="num text-[40px] font-semibold leading-none tracking-tight text-white">
                    {inr(animatedSaved)}
                  </span>
                  <span className="num text-[14px] text-white/50">
                    / {inrCompact(primary.target)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-3 md:justify-start">
                  <div
                    className="h-1.5 w-44 overflow-hidden rounded-full"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #5EEAD4 0%, #A78BFA 100%)",
                      }}
                    />
                  </div>
                  <span className="num text-[12.5px] font-semibold text-white/85">
                    {pct}%
                  </span>
                </div>

                <p className="mt-3 text-center text-[12.5px] leading-relaxed text-white/55 md:text-left">
                  Quietly compounding from your spare change. Today's added{" "}
                  <span className="text-white">{inr(d.monthSaved || 0)}</span>{" "}
                  this month alone.
                </p>
              </>
            )}
          </div>

          {/* Glass jar centerpiece */}
          <div className="order-1 mt-2 grid place-items-center md:order-2 md:mt-0 md:flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassJar pct={pct} />
            </motion.div>
          </div>
        </div>

        {/* ── Bottom info row ──────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <GlassTile>
            <span
              className="grid h-8 w-8 place-items-center rounded-xl"
              style={{
                background: "rgba(94,234,212,0.15)",
                boxShadow: "inset 0 0 0 1px rgba(94,234,212,0.32)",
              }}
            >
              <TrendingUp size={14} strokeWidth={2} className="text-[#5EEAD4]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Just now
              </p>
              <p className="truncate text-[12.5px] font-semibold text-white">
                {lastTxn
                  ? `${lastTxn.merchant} · ${inr(lastTxn.amount)}`
                  : "No spends yet"}
              </p>
              {lastTxn && (
                <p className="num text-[11px] text-[#5EEAD4]">
                  +{inr(lastTxn.savedAmount || 0)} saved
                </p>
              )}
            </div>
          </GlassTile>

          <GlassTile>
            <span
              className="grid h-8 w-8 place-items-center rounded-xl"
              style={{
                background: "rgba(167,139,250,0.16)",
                boxShadow: "inset 0 0 0 1px rgba(167,139,250,0.34)",
              }}
            >
              <Sparkles size={14} strokeWidth={2} className="text-[#A78BFA]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Aura insight
              </p>
              <p className="text-[12.5px] font-medium leading-snug text-white">
                {insightText}
              </p>
            </div>
          </GlassTile>

          <GlassTile>
            <span
              className="grid h-8 w-8 place-items-center rounded-xl"
              style={{
                background: "rgba(245,200,66,0.18)",
                boxShadow: "inset 0 0 0 1px rgba(245,200,66,0.36)",
              }}
            >
              <Flame size={14} strokeWidth={2} className="text-[#F5C842]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Streak
              </p>
              <p className="num text-[14px] font-semibold text-white">
                {d.streak} days
              </p>
              <p className="text-[11px] text-white/50">don't break the loop</p>
            </div>
          </GlassTile>
        </div>
      </div>
    </section>
  );
}

function buildInsight(d) {
  if (d.streak >= 7) return "Saving steady — you're 22% above last week.";
  if (d.monthSaved > 1500) return "Round-ups picking up pace this month.";
  if ((d.invisible || 0) > 800) return "Invisible spend is creeping in. Worth a glance.";
  return "Small wins compound. Stay in the loop.";
}

function GlassTile({ children }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.04)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function Orbs() {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-12 h-44 w-44 rounded-full"
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(closest-side, rgba(94,234,212,0.32) 0%, transparent 70%)",
          filter: "blur(28px)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-32 h-56 w-56 rounded-full"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        style={{
          background:
            "radial-gradient(closest-side, rgba(167,139,250,0.30) 0%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />
    </>
  );
}
