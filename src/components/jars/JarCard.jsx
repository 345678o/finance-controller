import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Sparkles } from "lucide-react";
import JarIllustration from "./JarIllustration";
import { inr } from "@/utils/format";

/* JarCard — a single goal jar.
   Tap → fires `onContribute(jar)` AND we surface a floating "+₹X" indicator
   plus a brief percent-tick animation. Funded jars (≥100%) swap the tap
   target for a celebratory "Funded" pill and a confetti burst on mount. */

export default function JarCard({ jar, idx, onContribute }) {
  const pct = Math.min(100, Math.round((jar.saved / jar.target) * 100));
  const isFunded = pct >= 100;

  // Track each contribution to fire a floating "+₹X" popup. We watch `saved`
  // delta so any contribute action — wherever it's called — animates here.
  const lastSaved = useRef(jar.saved);
  const [pops, setPops] = useState([]); // [{ id, amount }]

  useEffect(() => {
    const delta = jar.saved - lastSaved.current;
    lastSaved.current = jar.saved;
    if (delta > 0) {
      const id = Date.now() + Math.random();
      setPops((p) => [...p, { id, amount: delta }]);
      const t = setTimeout(() => {
        setPops((p) => p.filter((x) => x.id !== id));
      }, 1100);
      return () => clearTimeout(t);
    }
  }, [jar.saved]);

  // Velocity hint — at the current saved/months-left rate, when does the jar fund?
  const remaining = Math.max(0, jar.target - jar.saved);
  const months = Math.max(1, jar.monthsLeft || 1);
  const monthlyTarget = Math.ceil(remaining / months);

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.05 + idx * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={isFunded ? undefined : () => onContribute?.(jar)}
      className={
        "relative flex items-center gap-4 rounded-3xl border-2 border-[#0F172A] bg-white p-4 shadow-[4px_4px_0_#0F172A] transition-transform " +
        (isFunded
          ? "cursor-default"
          : "cursor-pointer active:translate-y-[2px] active:shadow-[2px_2px_0_#0F172A]")
      }
    >
      <JarIllustration color={jar.color} fillPct={pct} iconKey={jar.iconKey} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate text-[17px] font-extrabold tracking-tight text-[#0F172A]">
              {jar.name}
            </h3>
            <span className="shrink-0 text-base">{jar.emoji}</span>
          </div>

          {isFunded ? (
            <FundedPill />
          ) : (
            <span className="num shrink-0 rounded-full border-2 border-[#0F172A] bg-[var(--t-card)] px-2 py-0.5 text-[11px] font-extrabold text-[#0F172A]">
              {pct}%
            </span>
          )}
        </div>

        <p className="num mt-1 text-[13.5px]">
          <span className="font-extrabold text-[#0F172A]">{inr(jar.saved)}</span>
          <span className="text-[#94A3B8]"> / {inr(jar.target)}</span>
        </p>

        <div className="mt-2">
          <div className="h-2 overflow-hidden rounded-full border-2 border-[#0F172A] bg-white">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
              style={{ background: jar.color }}
            />
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2 text-[12px] text-[#64748B]">
          <span>
            {isFunded
              ? "Goal funded"
              : `${jar.monthsLeft} mo left · ${inr(monthlyTarget)}/mo`}
          </span>
          {!isFunded && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F172A]">
              <Plus size={11} strokeWidth={2.6} />
              Tap to top up
            </span>
          )}
        </div>
      </div>

      {/* Floating "+₹X" popups */}
      <AnimatePresence>
        {pops.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0, y: 0, scale: 0.85 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -44, scale: 0.95 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="num pointer-events-none absolute right-5 top-3 rounded-full border-2 border-[#0F172A] bg-[var(--t-secondary)] px-2.5 py-1 text-[12px] font-extrabold text-[#0F172A] shadow-[2px_2px_0_#0F172A]"
          >
            +{inr(p.amount)}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Confetti burst when funded — fires once on mount/transition */}
      {isFunded && <ConfettiBurst color={jar.color} />}
    </motion.li>
  );
}

function FundedPill() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-[#0F172A] bg-[var(--t-secondary)] px-2 py-0.5 text-[11px] font-extrabold text-[#0F172A] shadow-[2px_2px_0_#0F172A]">
      <Check size={11} strokeWidth={3} />
      Funded
    </span>
  );
}

/* Tiny celebration — six bursts that fly outward and fade. */
function ConfettiBurst({ color }) {
  const pieces = [
    { dx: -34, dy: -22, rot:  -28, c: color },
    { dx:  32, dy: -28, rot:   18, c: "var(--t-primary)" },
    { dx: -22, dy:  18, rot:   42, c: "var(--t-accent)"  },
    { dx:  28, dy:  16, rot:  -22, c: "var(--t-lilac)"   },
    { dx:   0, dy: -36, rot:    0, c: "var(--t-secondary)" },
    { dx: -10, dy:  30, rot:  -52, c: color },
  ];
  return (
    <span className="pointer-events-none absolute left-[58px] top-[50%] -translate-y-1/2">
      <Sparkles size={14} strokeWidth={2.6} className="text-[#0F172A] opacity-0" />
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.5 }}
          animate={{
            x: p.dx,
            y: p.dy,
            rotate: p.rot,
            opacity: [0, 1, 0],
            scale: 1,
          }}
          transition={{ duration: 1.1, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="absolute h-1.5 w-2.5 rounded-[1px] border border-[#0F172A]"
          style={{ background: p.c }}
        />
      ))}
    </span>
  );
}
