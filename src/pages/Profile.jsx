import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Settings as SettingsIcon,
  Shield,
  Download,
  HelpCircle,
  LogOut,
  CreditCard,
  Wallet,
  Sparkles,
  Flame,
  Target,
  BarChart3,
  ScanLine,
  Link2,
  Pencil,
} from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import useDashboardData from "@/hooks/useDashboardData";
import { auraStateFor } from "@/utils/dashboard";
import { inrCompact } from "@/utils/format";
import { findUpiApp } from "@/data/upiApps";

import PageHeader              from "@/components/common/PageHeader";
import { OutlinedCard, StampPill } from "@/components/common/Outlined";
import MagicBento               from "@/components/common/MagicBento";
import UPIConnectModal          from "@/components/upi/UPIConnectModal";
import UpiLogo                  from "@/components/upi/UpiLogo";
import EditProfileModal         from "@/components/profile/EditProfileModal";
import Avatar                   from "@/components/profile/Avatar";

const ROWS = [
  { to: "/settings", label: "Round-up rules",      Icon: CreditCard,    bg: "var(--t-primary)" },
  { to: "/settings", label: "Notifications",       Icon: SettingsIcon,  bg: "var(--t-secondary)" },
  { to: "/settings", label: "Privacy & data",      Icon: Shield,        bg: "var(--t-lilac)" },
  { to: "/settings", label: "Export transactions", Icon: Download,      bg: "var(--t-accent)" },
  { to: "/settings", label: "Help & support",      Icon: HelpCircle,    bg: "var(--t-bg)" },
];

export default function Profile() {
  const d         = useDashboardData();
  const aura      = auraStateFor(d.auraScore);
  const jarCount  = useAuraStore((s) => s.jars.length);
  const upi       = useAuraStore((s) => s.upi);
  const profile   = useAuraStore((s) => s.profile);
  const resetToDemo = useAuraStore((s) => s.resetToDemo);

  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const linkedApp = upi.linked ? findUpiApp(upi.appId) : null;
  const joinedYear = profile.joinedAt
    ? new Date(profile.joinedAt).getFullYear()
    : new Date().getFullYear();

  // map aura state to outlined chip color
  const auraColor =
    aura.key === "stable" ? "teal" :
    aura.key === "risky"  ? "mustard" : "coral";

  return (
    <>
      <div className="fixed inset-0 bg-[var(--t-bg)]" aria-hidden />

      <div className="relative space-y-4">
        <PageHeader title="Profile" />

        {/* Identity card */}
        <OutlinedCard className="p-5" delay={0.04} stamp="lg">
          <div className="flex items-center gap-4">
            <Avatar profile={profile} size={64} radius={16} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[20px] font-extrabold tracking-tight text-[#0F172A]">
                {profile.displayName}
              </h1>
              <p className="truncate text-[12.5px] text-[#475569]">@{profile.handle}</p>
              <p className="mt-1 text-[11px] text-[#64748B]">Member since {joinedYear}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StampPill color={auraColor}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A]" />
                {aura.label}
              </StampPill>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                aria-label="Edit profile"
                className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] px-2.5 py-1.5 text-[11px] font-extrabold text-[#0F172A] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[1px] active:shadow-none"
              >
                <Pencil size={11} strokeWidth={2.6} />
                Edit
              </button>
            </div>
          </div>
        </OutlinedCard>

        {/* UPI card — prominent, single-tap entry to the connect flow */}
        <motion.button
          type="button"
          onClick={() => setUpiModalOpen(true)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full items-center gap-3 rounded-3xl border-2 border-[#0F172A] bg-white p-4 text-left shadow-[4px_4px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-[2px_2px_0_#0F172A]"
        >
          {linkedApp ? (
            <UpiLogo app={linkedApp} size={48} />
          ) : (
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-[#0F172A]"
              style={{ background: "var(--t-primary)" }}
            >
              <Link2 size={18} strokeWidth={2.6} className="text-[#0F172A]" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[#475569]">
              {linkedApp ? "UPI · Linked" : "UPI · Connect"}
            </p>
            <p className="text-[15px] font-extrabold leading-tight text-[#0F172A]">
              {linkedApp ? linkedApp.name : "Connect your UPI app"}
            </p>
            <p className="num mt-0.5 truncate text-[11.5px] text-[#475569]">
              {linkedApp
                ? upi.vpa
                : "GPay · PhonePe · Paytm · BHIM · Amazon · Cred"}
            </p>
          </div>

          {linkedApp ? (
            <StampPill color="teal">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A]" />
              On
            </StampPill>
          ) : (
            <ChevronRight size={18} strokeWidth={2.4} className="text-[#94A3B8]" />
          )}
        </motion.button>

        {/* Feature bento */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <p className="px-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#475569]">
            Your loop
          </p>
          <MagicBento
            cards={[
              {
                key: "saved",
                label: "Saved",
                title: "Round-up wallet",
                description: "Spare change quietly stacking across all your jars.",
                value: inrCompact(d.totalSaved),
                Icon: Wallet,
                tint: "var(--t-primary)",
                to: "/jars",
              },
              {
                key: "aura",
                label: "Aura",
                title: `${aura.label} this week`,
                description: "Your money's vibe-check, tuned by recent habits.",
                value: `${d.auraScore}%`,
                Icon: Sparkles,
                tint: "var(--t-lilac)",
                to: "/insights",
              },
              {
                key: "streak",
                label: "Streak",
                title: "Saving days in a row",
                description: "Don't break the loop — small wins compound the fastest.",
                value: `${d.streak}d`,
                Icon: Flame,
                tint: "var(--t-secondary)",
                to: "/wrapped",
              },
              {
                key: "jars",
                label: "Jars",
                title: "Goal jars",
                description: "Drop spare change into the future you actually want.",
                value: jarCount,
                Icon: Target,
                tint: "var(--t-accent)",
                to: "/jars",
              },
              {
                key: "insights",
                label: "Insights",
                title: "Spend stories",
                description: "What your week of round-ups is quietly telling you.",
                Icon: BarChart3,
                tint: "var(--t-bg)",
                to: "/insights",
              },
              {
                key: "scan",
                label: "Future Vision",
                title: "AR scanner",
                description: "Project today's habits into tomorrow's balance.",
                Icon: ScanLine,
                tint: "var(--t-secondary)",
                to: "/scan",
              },
            ]}
            enableTilt
            enableStars
            enableSpotlight
            enableBorderGlow
            enableMagnetism
            clickEffect
            spotlightRadius={320}
            particleCount={8}
          />
        </motion.section>

        {/* Account links */}
        <OutlinedCard className="overflow-hidden" delay={0.12} stamp="lg">
          <ul className="divide-y-2 divide-[#0F172A]/10">
            {ROWS.map(({ to, label, Icon, bg }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--t-bg)]"
                >
                  <span
                    className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0F172A]"
                    style={{ background: bg }}
                  >
                    <Icon size={15} strokeWidth={2.4} className="text-[#0F172A]" />
                  </span>
                  <span className="flex-1 text-[14px] font-bold text-[#0F172A]">{label}</span>
                  <ChevronRight size={16} strokeWidth={2.4} className="text-[#94A3B8]" />
                </Link>
              </li>
            ))}
          </ul>
        </OutlinedCard>

        {/* Footer actions */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-2"
        >
          <button
            onClick={resetToDemo}
            className="rounded-2xl border-2 border-[#0F172A] bg-white py-3 text-[13px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            Reset demo data
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-extrabold text-[#B91C1C] transition-colors hover:bg-[#FEE2E2]">
            <LogOut size={14} strokeWidth={2.4} />
            Sign out
          </button>
        </motion.section>

        <p className="pt-1 text-center text-[11px] text-[#94A3B8]">
          AuraLoop · v0.1 · {profile.email}
        </p>
      </div>

      <UPIConnectModal
        open={upiModalOpen}
        onClose={() => setUpiModalOpen(false)}
      />
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}

