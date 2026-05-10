import { motion } from "framer-motion";

// ── OutlinedCard ───────────────────────────────────────────────────────
// White card with the bold black border + offset stamp shadow.
// Animated entrance via framer-motion.
export function OutlinedCard({
  children,
  className = "",
  stamp = "lg",         // "lg" | "md" | "none"
  delay = 0,
  as: Tag = "section",
  ...rest
}) {
  const stampClass =
    stamp === "lg" ? "shadow-[4px_4px_0_#0F172A]" :
    stamp === "md" ? "shadow-[3px_3px_0_#0F172A]" : "";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border-2 border-[#0F172A] bg-white ${stampClass} ${className}`}
      {...rest}
    >
      {/* Tag is purely semantic; styling lives on the motion wrapper */}
      <Tag className="contents">{children}</Tag>
    </motion.div>
  );
}

// ── TabStrip ───────────────────────────────────────────────────────────
// Tab buttons sitting on a thin black underline; active tab gets a mustard pill.
export function TabStrip({ tabs, active, onChange, layoutId = "tab-underline" }) {
  return (
    <div className="flex gap-6 border-b-2 border-[#0F172A]/15">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange?.(tab)}
            className={
              "relative pb-2.5 text-[13px] font-bold transition-colors " +
              (isActive ? "text-[#0F172A]" : "text-[#94A3B8] hover:text-[#475569]")
            }
          >
            {tab}
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute -bottom-[2px] left-0 right-0 h-1 rounded-full bg-[var(--t-primary)]"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── StampToggle ────────────────────────────────────────────────────────
// Outlined toggle — black border on track + black-bordered thumb.
// Uses mustard for ON, white for OFF.
export function StampToggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-[#0F172A]">{label}</p>
        {hint && <p className="mt-0.5 text-[12px] text-[#64748B]">{hint}</p>}
      </div>
      <span
        className={
          "relative h-7 w-12 shrink-0 rounded-full border-2 border-[#0F172A] transition-colors " +
          (checked ? "bg-[var(--t-primary)]" : "bg-white")
        }
      >
        <span
          className="absolute top-[2px] h-5 w-5 rounded-full border-2 border-[#0F172A] bg-white transition-all"
          style={{ left: checked ? "calc(100% - 1.5rem)" : "2px" }}
        />
      </span>
    </button>
  );
}

// ── StampPill (small chip) ─────────────────────────────────────────────
export function StampPill({ children, color = "white", className = "" }) {
  const bg = {
    white:    "bg-white",
    mustard:  "bg-[var(--t-primary)]",
    teal:     "bg-[var(--t-secondary)]",
    coral:    "bg-[var(--t-accent)]",
    lavender: "bg-[var(--t-lilac)]",
    cream:    "bg-[var(--t-bg)]",
  }[color];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-[#0F172A] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0F172A] ${bg} ${className}`}
    >
      {children}
    </span>
  );
}
