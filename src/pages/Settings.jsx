import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, Coins, EyeOff, MessageSquare, Shield, Sparkles, Zap } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import { inr } from "@/utils/format";

import PageHeader from "@/components/common/PageHeader";
import {
  OutlinedCard,
  StampToggle,
  StampPill,
} from "@/components/common/Outlined";

const ROUND_UPS = [10, 20, 50];

export default function Settings() {
  const settings        = useAuraStore((s) => s.settings);
  const updateSettings  = useAuraStore((s) => s.updateSettings);
  const navigate        = useNavigate();

  return (
    <>
      <div className="fixed inset-0 bg-[#F5F1E8]" aria-hidden />

      <div className="relative space-y-4">
        <PageHeader title="Settings" />

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5"
        >
          <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
            Tune your loop
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#475569]">
            Round-up rules, vibes, and how loud AuraLoop pings you.
          </p>
        </motion.section>

        {/* SMS Import */}
        <Section
          delay={0.06}
          Icon={MessageSquare}
          iconBg="#5DD3CB"
          title="Import from SMS"
          sub="Auto-track real spending from your bank texts. Local, private."
        >
          <button
            onClick={() => navigate("/import-sms")}
            className="mt-4 w-full rounded-xl border-2 border-[#0F172A] bg-[#F5C842] py-3 text-[13px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            Scan inbox now
          </button>
        </Section>

        {/* Round-up rule */}
        <Section
          delay={0.08}
          Icon={Coins}
          iconBg="#F5C842"
          title="Round-up rule"
          sub="Each transaction rounds up to the next multiple."
        >
          <div className="mt-4 flex gap-2">
            {ROUND_UPS.map((step) => {
              const active = settings.roundUpStep === step;
              return (
                <button
                  key={step}
                  onClick={() => updateSettings({ roundUpStep: step })}
                  className={
                    "flex-1 rounded-xl border-2 border-[#0F172A] py-3 text-center transition-transform active:translate-y-[1px] " +
                    (active
                      ? "bg-[#F5C842] shadow-[3px_3px_0_#0F172A]"
                      : "bg-white hover:bg-[#F5F1E8]")
                  }
                >
                  <p className="num text-[18px] font-extrabold tracking-tight text-[#0F172A]">
                    {inr(step)}
                  </p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569]">
                    Round to
                  </p>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Auto-save */}
        <Section
          delay={0.12}
          Icon={Zap}
          iconBg="#C4B5FD"
          title="Auto-save"
          sub="Move round-ups into your top jar automatically."
        >
          <div className="mt-4">
            <StampToggle
              label="Enable auto-save"
              checked={settings.autoSave}
              onChange={(v) => updateSettings({ autoSave: v })}
            />
          </div>
        </Section>

        {/* Notifications */}
        <Section
          delay={0.16}
          Icon={Bell}
          iconBg="#5DD3CB"
          title="Notifications"
          sub="What we ping you about — and what we don't."
        >
          <div className="mt-4 space-y-3">
            <StampToggle
              label="Daily aura digest"
              hint="Morning summary of last 24h"
              checked={settings.notifyDailyDigest}
              onChange={(v) => updateSettings({ notifyDailyDigest: v })}
            />
            <div className="h-[2px] w-full bg-[#0F172A]/8" />
            <StampToggle
              label="Invisible spend alerts"
              hint="Catch subscription creep + drips"
              checked={settings.notifyInvisibleSpend}
              onChange={(v) => updateSettings({ notifyInvisibleSpend: v })}
            />
            <div className="h-[2px] w-full bg-[#0F172A]/8" />
            <StampToggle
              label="Jar milestones"
              hint="When a goal hits 50% / 80% / 100%"
              checked={settings.notifyJarMilestones}
              onChange={(v) => updateSettings({ notifyJarMilestones: v })}
            />
          </div>
        </Section>

        {/* Tracking */}
        <Section
          delay={0.20}
          Icon={EyeOff}
          iconBg="#FF8C7A"
          title="Tracking"
          sub="Control what counts towards your aura."
        >
          <div className="mt-4">
            <StampToggle
              label="Exclude subscriptions"
              hint="Don't round up Spotify, Netflix, etc."
              checked={settings.excludeSubscriptions}
              onChange={(v) => updateSettings({ excludeSubscriptions: v })}
            />
          </div>
        </Section>

        {/* Privacy */}
        <Section
          delay={0.24}
          Icon={Shield}
          iconBg="#F5F1E8"
          title="Privacy"
          sub="All your data lives on this device. Nothing leaves until you say so."
        >
          <div className="mt-4 flex flex-wrap gap-2">
            <StampPill color="teal">Local-only</StampPill>
            <StampPill color="white">No tracking</StampPill>
            <StampPill color="lavender">
              <Sparkles size={11} strokeWidth={2.6} /> End-to-end
            </StampPill>
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({ delay, Icon, iconBg, title, sub, children }) {
  return (
    <OutlinedCard className="p-5" delay={delay} stamp="lg">
      <header className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2 border-[#0F172A]"
          style={{ background: iconBg }}
        >
          <Icon size={16} strokeWidth={2.6} className="text-[#0F172A]" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold text-[#0F172A]">{title}</h3>
          {sub && <p className="mt-0.5 text-[12.5px] text-[#475569]">{sub}</p>}
        </div>
      </header>
      {children}
    </OutlinedCard>
  );
}
