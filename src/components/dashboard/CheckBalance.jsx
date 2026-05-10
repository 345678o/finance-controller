import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Plus, Sparkles } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import useDashboardData from "@/hooks/useDashboardData";
import useCountUp from "@/hooks/useCountUp";
import { inr } from "@/utils/format";
import CoinJar from "./CoinJar";
import MoneyRain from "./MoneyRain";
import AddMoneyModal from "./AddMoneyModal";
import Avatar from "@/components/profile/Avatar";

/* CheckBalance — Coinly-style light hero.
   Cream surface with the chunky-contents jar centerpiece, a status pill on
   the jar, and a card below with the savings title, amount, and an
   "Add Money" CTA that routes to /jars where contributions actually happen. */

function pickPrimaryJar(jars) {
  if (!jars?.length) return null;
  const ranked = [...jars]
    .map((j) => ({ ...j, pct: j.target ? j.saved / j.target : 0 }))
    .sort((a, b) => b.pct - a.pct);
  // Prefer the most progressed unfunded jar; fall back to the most progressed.
  return ranked.find((j) => j.pct < 1) || ranked[0];
}

function greetFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function CheckBalance() {
  const navigate = useNavigate();
  const profile = useAuraStore((s) => s.profile);
  const jars = useAuraStore((s) => s.jars);
  const d = useDashboardData();
  const [addOpen, setAddOpen] = useState(false);

  const primary = useMemo(() => pickPrimaryJar(jars), [jars]);
  const pct = primary ? Math.min(100, Math.round((primary.saved / primary.target) * 100)) : 0;
  const animatedSaved = useCountUp(primary?.saved || 0, 1.6);

  const isFunded = pct >= 100;
  const status = primary
    ? isFunded
      ? { text: "Completed", color: "var(--t-secondary)", icon: <Check size={11} strokeWidth={3} /> }
      : pct >= 60
        ? { text: "On track", color: "var(--t-primary)", icon: <Sparkles size={11} strokeWidth={2.6} /> }
        : { text: "Building", color: "var(--t-accent)", icon: null }
    : null;

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border-2 border-[#0F172A] bg-[var(--t-bg)] shadow-[5px_5px_0_#0F172A]"
    >
      {/* ── Top bar ──────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 pt-5 md:px-7 md:pt-6">
        <div className="flex items-center gap-3">
          <Avatar profile={profile} size={42} radius={14} background="var(--t-accent)" />
          <div className="min-w-0">
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[var(--t-ink-muted)]">
              {greetFor(new Date().getHours())}
            </p>
            <p className="text-[15px] font-extrabold tracking-tight text-[var(--t-ink)]">
              {profile.displayName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-2xl border-2"
            style={{
              borderColor: "var(--t-line)",
              background: "var(--t-card)",
              boxShadow: "3px 3px 0 var(--t-line)",
            }}
          >
            <Bell size={16} strokeWidth={2.2} className="text-[var(--t-ink)]" />
            <span
              aria-hidden
              className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2"
              style={{ borderColor: "var(--t-line)", background: "var(--t-danger)" }}
            />
          </button>
          <button
            type="button"
            onClick={() => navigate("/jars")}
            aria-label="Create new jar"
            className="inline-flex items-center gap-1 rounded-2xl border-2 px-3 py-2 text-[12px] font-extrabold"
            style={{
              borderColor: "var(--t-line)",
              background: "var(--t-accent)",
              color: "var(--t-ink)",
              boxShadow: "3px 3px 0 var(--t-line)",
            }}
          >
            <Plus size={13} strokeWidth={2.8} />
            Create
          </button>
        </div>
      </header>

      {/* ── Jar stage ────────────────────────────────────────── */}
      <div className="relative grid place-items-center px-4 pt-3 pb-2">
        {/* Falling bills + sparkles + cash wad on the lid */}
        <div className="relative" style={{ width: 240, height: 320 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <CoinJar pct={pct} badge={status} />
          </motion.div>
          <MoneyRain width={240} height={320} count={5} showStack={!isFunded} />
        </div>
      </div>

      {/* ── Goal card sits over the bottom of the jar like the ref ── */}
      <div className="px-5 pb-5 md:px-7 md:pb-7">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative -mt-10 rounded-3xl border-2 border-[#0F172A] bg-white p-5 text-center shadow-[5px_5px_0_#0F172A]"
        >
          {primary ? (
            <>
              <h3 className="mt-1 text-[22px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
                {primary.name}
                {primary.emoji && (
                  <span className="ml-1.5 align-middle text-[20px]">{primary.emoji}</span>
                )}
              </h3>
              <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#475569]">
                Amount saved
              </p>
              <p className="num mt-1 text-[34px] font-extrabold leading-none tracking-tight text-[#0F172A]">
                {inr(animatedSaved)}
              </p>
              <p className="num mt-1 text-[12px] text-[#94A3B8]">
                of {inr(primary.target)} · {pct}%
              </p>

              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0F172A] py-3.5 text-[13.5px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
                style={{
                  background: isFunded ? "var(--t-bg-soft)" : "var(--t-secondary)",
                }}
                disabled={isFunded}
              >
                {isFunded ? "Goal funded" : (
                  <>
                    <Plus size={14} strokeWidth={2.8} />
                    Add money
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <h3 className="text-[18px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
                Start your first jar
              </h3>
              <p className="mt-2 text-[12.5px] text-[#475569]">
                Pick a goal — round-ups will quietly do the rest.
              </p>
              <button
                type="button"
                onClick={() => navigate("/jars")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0F172A] bg-[var(--t-secondary)] py-3.5 text-[13.5px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
              >
                <Plus size={14} strokeWidth={2.8} />
                Create a jar
              </button>
            </>
          )}
        </motion.div>
      </div>

      <AddMoneyModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        jar={primary}
      />
    </section>
  );
}
