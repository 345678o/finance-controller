import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Coins,
  EyeOff,
  Link2,
  Mail,
  MessageSquare,
  RotateCcw,
  Shield,
  Sparkles,
  Trash2,
  Unplug,
  Zap,
} from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import { inr } from "@/utils/format";
import { findUpiApp } from "@/data/upiApps";

import PageHeader from "@/components/common/PageHeader";
import {
  OutlinedCard,
  StampToggle,
  StampPill,
} from "@/components/common/Outlined";
import UPIConnectModal from "@/components/upi/UPIConnectModal";
import UpiLogo from "@/components/upi/UpiLogo";

const ROUND_UPS = [10, 20, 50];

export default function Settings() {
  const settings              = useAuraStore((s) => s.settings);
  const updateSettings        = useAuraStore((s) => s.updateSettings);
  const resetToDemo           = useAuraStore((s) => s.resetToDemo);
  const clearDemoData         = useAuraStore((s) => s.clearDemoData);
  const clearAllTransactions  = useAuraStore((s) => s.clearAllTransactions);
  const txnCount              = useAuraStore((s) => s.transactions.length);
  const importedCount         = useAuraStore((s) => s.transactions.filter((t) => !!t.source).length);
  const upi                   = useAuraStore((s) => s.upi);
  const updateUpi             = useAuraStore((s) => s.updateUpi);
  const unlinkUpi             = useAuraStore((s) => s.unlinkUpi);
  const navigate              = useNavigate();
  const [upiModalOpen, setUpiModalOpen] = useState(false);

  const linkedApp = upi?.linked ? findUpiApp(upi.appId) : null;

  return (
    <>
      <div className="fixed inset-0 bg-[var(--t-bg)]" aria-hidden />

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

        {/* UPI app integration */}
        <Section
          delay={0.05}
          Icon={Link2}
          iconBg="var(--t-lilac)"
          title="UPI app"
          sub={
            linkedApp
              ? "Round-ups route through your linked app. Manage permissions here."
              : "Connect your UPI app so round-ups happen the moment you spend."
          }
        >
          {!linkedApp ? (
            <button
              onClick={() => setUpiModalOpen(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0F172A] bg-[var(--t-primary)] py-3 text-[13px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
            >
              <Link2 size={14} strokeWidth={2.6} />
              Connect UPI app
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              {/* Linked-app summary */}
              <div className="flex items-center gap-3 rounded-2xl border-2 border-[#0F172A] bg-[var(--t-bg-soft)] p-3">
                <UpiLogo app={linkedApp} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-extrabold leading-tight text-[#0F172A]">
                    {linkedApp.name}
                  </p>
                  <p className="num truncate text-[11.5px] text-[#475569]">
                    {upi.vpa}
                  </p>
                </div>
                <StampPill color="teal">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A]" />
                  Linked
                </StampPill>
              </div>

              {/* Toggles */}
              <StampToggle
                label="Auto-debit round-ups"
                hint="Use a UPI mandate to push spare change into your top jar"
                checked={upi.autoDebit}
                onChange={(v) => updateUpi({ autoDebit: v })}
              />
              <div className="h-[2px] w-full bg-[#0F172A]/8" />
              <StampToggle
                label="Sync app transactions"
                hint="Read spend events from your linked UPI app"
                checked={upi.syncTxns}
                onChange={(v) => updateUpi({ syncTxns: v })}
              />

              {/* Switch + unlink row */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setUpiModalOpen(true)}
                  className="flex-1 rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] py-2.5 text-[12px] font-extrabold text-[#0F172A] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[1px] active:shadow-none"
                >
                  Switch app
                </button>
                <button
                  onClick={unlinkUpi}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] px-3 py-2.5 text-[12px] font-extrabold text-[#B91C1C] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[1px] active:shadow-none"
                >
                  <Unplug size={12} strokeWidth={2.6} />
                  Unlink
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* SMS Import */}
        <Section
          delay={0.06}
          Icon={MessageSquare}
          iconBg="var(--t-secondary)"
          title="Import from SMS"
          sub="Auto-track real spending from your bank texts. Local, private."
        >
          <button
            onClick={() => navigate("/import-sms")}
            className="mt-4 w-full rounded-xl border-2 border-[#0F172A] bg-[var(--t-primary)] py-3 text-[13px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            Scan inbox now
          </button>
        </Section>

        {/* Email Import */}
        <Section
          delay={0.07}
          Icon={Mail}
          iconBg="#C4B5FD"
          title="Import from email"
          sub="Paste FamApp / FamPay transaction emails to add them to your dashboard."
        >
          <button
            onClick={() => navigate("/import-email")}
            className="mt-4 w-full rounded-xl border-2 border-[#0F172A] bg-[#5DD3CB] py-3 text-[13px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            Paste an email
          </button>
        </Section>

        {/* Round-up rule */}
        <Section
          delay={0.08}
          Icon={Coins}
          iconBg="var(--t-primary)"
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
                      ? "bg-[var(--t-primary)] shadow-[3px_3px_0_#0F172A]"
                      : "bg-white hover:bg-[var(--t-bg)]")
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
          iconBg="var(--t-lilac)"
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
          iconBg="var(--t-secondary)"
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
          iconBg="var(--t-accent)"
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

        {/* Data management */}
        <Section
          delay={0.22}
          Icon={Trash2}
          iconBg="#FF8C7A"
          title="Manage data"
          sub={`${txnCount} transactions · ${importedCount} imported · ${txnCount - importedCount} demo`}
        >
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => resetToDemo()}
              className="rounded-xl border-2 border-[#0F172A] bg-[#F5C842] py-2.5 text-[12px] font-extrabold text-[#0F172A] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={13} strokeWidth={2.6} />
              Load demo
            </button>
            <button
              onClick={() => {
                if (confirm("Clear all demo transactions? Imported SMS will be kept.")) clearDemoData();
              }}
              className="rounded-xl border-2 border-[#0F172A] bg-white py-2.5 text-[12px] font-extrabold text-[#0F172A] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
            >
              Clear demo only
            </button>
            <button
              onClick={() => {
                if (confirm("Clear ALL transactions including imported SMS? This cannot be undone.")) clearAllTransactions();
              }}
              className="rounded-xl border-2 border-[#0F172A] bg-[#FEE2E2] py-2.5 text-[12px] font-extrabold text-[#B91C1C] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
            >
              Clear everything
            </button>
          </div>
        </Section>

        {/* Privacy */}
        <Section
          delay={0.24}
          Icon={Shield}
          iconBg="var(--t-bg)"
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

      <UPIConnectModal
        open={upiModalOpen}
        onClose={() => setUpiModalOpen(false)}
      />
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
