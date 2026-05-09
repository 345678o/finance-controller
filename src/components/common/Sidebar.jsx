import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Home,
  Target,
  BarChart3,
  Sparkles,
  User,
  Settings as SettingsIcon,
  RotateCcw,
  LogOut,
} from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import useDashboardData from "@/hooks/useDashboardData";
import { auraStateFor } from "@/utils/dashboard";
import { inrCompact } from "@/utils/format";
import { StampPill } from "@/components/common/Outlined";

const NAV = [
  { to: "/",         label: "Home",     icon: Home,        bg: "#F5C842" },
  { to: "/jars",     label: "Jars",     icon: Target,      bg: "#5DD3CB" },
  { to: "/insights", label: "Insights", icon: BarChart3,   bg: "#C4B5FD" },
  { to: "/wrapped",  label: "Wrapped",  icon: Sparkles,    bg: "#FF8C7A" },
  { to: "/profile",  label: "Profile",  icon: User,        bg: "#F5F1E8" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, bg: "#FFFFFF" },
];

const USER = { name: "Anamika", initial: "A", handle: "@anamika.aura" };

export default function Sidebar({ open, onClose }) {
  const d           = useDashboardData();
  const aura        = auraStateFor(d.auraScore);
  const resetToDemo = useAuraStore((s) => s.resetToDemo);

  // Lock body scroll while open + close on Escape
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const auraColor =
    aura.key === "stable" ? "teal" :
    aura.key === "risky"  ? "mustard" : "coral";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* dim backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#0F172A]/30 backdrop-blur-[2px]"
            aria-hidden
          />

          {/* drawer */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-label="Menu"
            aria-modal="true"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[84%] max-w-[320px] safe-top safe-bottom border-r-2 border-[#0F172A] bg-[#F5F1E8] shadow-[6px_0_0_rgba(15,23,42,0.18)]"
          >
            <div className="flex h-full flex-col p-5">
              {/* Header — close button + identity */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0F172A] bg-[#FF8C7A] text-[16px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A]">
                    {USER.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-extrabold tracking-tight text-[#0F172A]">
                      {USER.name}
                    </p>
                    <p className="truncate text-[11px] text-[#64748B]">{USER.handle}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-2xl border-2 border-[#0F172A] bg-white shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
                >
                  <X size={16} strokeWidth={2.6} className="text-[#0F172A]" />
                </button>
              </div>

              {/* Aura status pill */}
              <div className="mt-4">
                <StampPill color={auraColor}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A]" />
                  {aura.label} · {d.auraScore}%
                </StampPill>
              </div>

              {/* Quick stats */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniStat label="Saved"  value={inrCompact(d.totalSaved)} bg="#F5C842" />
                <MiniStat label="Streak" value={`${d.streak}d`}            bg="#5DD3CB" />
              </div>

              {/* Nav links */}
              <nav className="mt-5 flex-1 overflow-y-auto" aria-label="Sidebar">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#475569]">
                  Navigate
                </p>
                <ul className="mt-2 space-y-2">
                  {NAV.map(({ to, label, icon: Icon, bg }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={to === "/"}
                        onClick={onClose}
                        className={({ isActive }) =>
                          "flex items-center gap-3 rounded-2xl border-2 border-[#0F172A] px-3 py-2.5 transition-all " +
                          (isActive
                            ? "bg-white shadow-[3px_3px_0_#0F172A]"
                            : "bg-white/60 hover:bg-white")
                        }
                      >
                        <span
                          className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0F172A]"
                          style={{ background: bg }}
                        >
                          <Icon size={15} strokeWidth={2.4} className="text-[#0F172A]" />
                        </span>
                        <span className="text-[14px] font-extrabold text-[#0F172A]">
                          {label}
                        </span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Footer actions */}
              <div className="mt-4 space-y-2 border-t-2 border-[#0F172A]/10 pt-4">
                <button
                  onClick={() => {
                    resetToDemo();
                    onClose?.();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0F172A] bg-white py-2.5 text-[13px] font-extrabold text-[#0F172A] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
                >
                  <RotateCcw size={14} strokeWidth={2.6} />
                  Reset demo data
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-[13px] font-extrabold text-[#B91C1C] transition-colors hover:bg-[#FEE2E2]">
                  <LogOut size={14} strokeWidth={2.4} />
                  Sign out
                </button>
              </div>

              <p className="mt-3 text-center text-[10px] text-[#94A3B8]">
                AuraLoop · v0.1
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function MiniStat({ label, value, bg }) {
  return (
    <div className="rounded-xl border-2 border-[#0F172A] bg-white p-2 shadow-[2px_2px_0_#0F172A]">
      <div
        className="mx-auto h-5 rounded-md border-2 border-[#0F172A]"
        style={{ background: bg }}
      />
      <p className="mt-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#475569]">
        {label}
      </p>
      <p className="num text-[14px] font-extrabold leading-tight text-[#0F172A]">
        {value}
      </p>
    </div>
  );
}
