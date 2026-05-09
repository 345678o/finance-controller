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
} from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import useDashboardData from "@/hooks/useDashboardData";
import { auraStateFor } from "@/utils/dashboard";
import { inrCompact } from "@/utils/format";

import PageHeader              from "@/components/common/PageHeader";
import { OutlinedCard, StampPill } from "@/components/common/Outlined";

const USER = {
  name: "Anamika",
  initial: "A",
  handle: "@anamika.aura",
  email: "anamika@auraloop.app",
  joined: "Member since 2025",
};

const ROWS = [
  { to: "/settings", label: "Round-up rules",      Icon: CreditCard,    bg: "#F5C842" },
  { to: "/settings", label: "Notifications",       Icon: SettingsIcon,  bg: "#5DD3CB" },
  { to: "/settings", label: "Privacy & data",      Icon: Shield,        bg: "#C4B5FD" },
  { to: "/settings", label: "Export transactions", Icon: Download,      bg: "#FF8C7A" },
  { to: "/settings", label: "Help & support",      Icon: HelpCircle,    bg: "#F5F1E8" },
];

export default function Profile() {
  const d         = useDashboardData();
  const aura      = auraStateFor(d.auraScore);
  const jarCount  = useAuraStore((s) => s.jars.length);
  const resetToDemo = useAuraStore((s) => s.resetToDemo);

  // map aura state to outlined chip color
  const auraColor =
    aura.key === "stable" ? "teal" :
    aura.key === "risky"  ? "mustard" : "coral";

  return (
    <>
      <div className="fixed inset-0 bg-[#F5F1E8]" aria-hidden />

      <div className="relative space-y-4">
        <PageHeader title="Profile" />

        {/* Identity card */}
        <OutlinedCard className="p-5" delay={0.04} stamp="lg">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#0F172A] bg-[#FF8C7A] text-2xl font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A]">
              {USER.initial}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[20px] font-extrabold tracking-tight text-[#0F172A]">
                {USER.name}
              </h1>
              <p className="truncate text-[12.5px] text-[#475569]">{USER.handle}</p>
              <p className="mt-1 text-[11px] text-[#64748B]">{USER.joined}</p>
            </div>
            <StampPill color={auraColor}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A]" />
              {aura.label}
            </StampPill>
          </div>
        </OutlinedCard>

        {/* Stat strip */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-3"
        >
          <Stat label="Saved"  value={inrCompact(d.totalSaved)} bg="#F5C842" />
          <Stat label="Streak" value={`${d.streak}d`}            bg="#5DD3CB" />
          <Stat label="Jars"   value={jarCount}                  bg="#C4B5FD" />
        </motion.section>

        {/* Account links */}
        <OutlinedCard className="overflow-hidden" delay={0.12} stamp="lg">
          <ul className="divide-y-2 divide-[#0F172A]/10">
            {ROWS.map(({ to, label, Icon, bg }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F5F1E8]"
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
          AuraLoop · v0.1 · {USER.email}
        </p>
      </div>
    </>
  );
}

function Stat({ label, value, bg }) {
  return (
    <div className="rounded-2xl border-2 border-[#0F172A] bg-white p-3 text-center shadow-[3px_3px_0_#0F172A]">
      <div
        className="mx-auto mb-2 h-10 rounded-xl border-2 border-[#0F172A]"
        style={{ background: bg }}
      />
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569]">
        {label}
      </p>
      <p className="num mt-0.5 text-[16px] font-extrabold text-[#0F172A]">{value}</p>
    </div>
  );
}
