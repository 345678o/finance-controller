import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const MESSAGES = [
  { tag: "Today",    body: "Your wallet survived the day — small wins compound." },
  { tag: "Pattern",  body: "Food delivery is up 18% this week. Late-night orders are the driver." },
  { tag: "Flag",     body: "3 late-night purchases detected since Monday." },
  { tag: "Future",   body: "Future-you just gained +24 stability XP." },
  { tag: "Streak",   body: "7-day round-up streak — that's ₹248 of invisible savings." },
];

const ROTATE_MS = 5500;

export default function AICoachCard() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % MESSAGES.length), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const msg = MESSAGES[i];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="glass-card relative overflow-hidden p-4"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 0% 0%, rgba(139,92,246,0.18), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(0,229,255,0.14), transparent 55%)",
        }}
      />

      <div className="relative flex gap-3">
        {/* AI indicator */}
        <div className="relative h-9 w-9 shrink-0">
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #00ffae, #00e5ff, #8b5cf6, #ff2d92, #00ffae)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <span className="absolute inset-[2px] grid place-items-center rounded-full bg-bg-elev">
            <Sparkles size={14} strokeWidth={2.4} className="text-neon-green" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold tracking-wider text-ink">
              AURA AI
            </p>
            <Dot />
            <span className="text-[10px] uppercase tracking-wider text-ink-dim">
              {msg.tag}
            </span>
            <Typing />
          </div>

          <div className="relative mt-1 h-[44px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="text-[13.5px] leading-relaxed text-ink"
              >
                {msg.body}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* progress bar tied to rotation cadence */}
      <div className="relative mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          key={i}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
          className="h-full bg-gradient-to-r from-neon-green via-neon-cyan to-neon-pink"
        />
      </div>
    </motion.section>
  );
}

const Dot = () => (
  <span className="h-1 w-1 rounded-full bg-ink-dim" aria-hidden />
);

function Typing() {
  return (
    <span className="ml-auto inline-flex items-center gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1 w-1 rounded-full bg-neon-green"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -1.5, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
