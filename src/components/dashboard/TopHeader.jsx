import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { greetingFor, auraStateFor } from "@/utils/dashboard";

const USER = { name: "Priya", initial: "P" };

export default function TopHeader({ auraScore }) {
  const aura = auraStateFor(auraScore);
  const greeting = greetingFor();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-between"
    >
      {/* Avatar + greeting */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="absolute -inset-[2px] rounded-full opacity-80 blur-[1px]"
            style={{
              background: `conic-gradient(from 0deg, ${aura.hex}, #00e5ff, #ff2d92, ${aura.hex})`,
            }}
          />
          <div className="relative grid h-11 w-11 place-items-center rounded-full bg-bg-elev text-sm font-bold text-ink ring-1 ring-white/10">
            {USER.initial}
          </div>
          {/* online dot */}
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-bg"
            style={{ background: aura.hex, boxShadow: `0 0 10px ${aura.hexSoft}` }}
          />
        </div>
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">
            {greeting}
          </p>
          <p className="text-base font-semibold text-ink">{USER.name}</p>
        </div>
      </div>

      {/* Status pill + bell */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-md"
          style={{ boxShadow: `inset 0 0 0 1px ${aura.hexSoft}33` }}
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: aura.hex, boxShadow: `0 0 8px ${aura.hex}` }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[11px] font-semibold tracking-wide text-ink">
            {aura.label}
          </span>
        </div>

        <button
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-ink-muted transition-colors hover:text-ink"
        >
          <Bell size={18} strokeWidth={2.2} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-neon-pink shadow-glow-pink" />
        </button>
      </div>
    </motion.header>
  );
}
