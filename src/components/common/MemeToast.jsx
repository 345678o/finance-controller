import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import { pickRandomMeme } from "@/data/memes";

/* MemeToast
   Listens to `memeNonce` in the store. Each bump pushes a meme onto a queue
   and the visible card shows ~3.5s before auto-dismissing. Tap to dismiss. */

const VISIBLE_MS = 3800;

export default function MemeToast() {
  const memeNonce = useAuraStore((s) => s.memeNonce);
  const lastSeen = useRef(memeNonce);
  const [active, setActive] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (memeNonce === lastSeen.current) return; // initial mount, ignore
    lastSeen.current = memeNonce;
    const meme = pickRandomMeme();
    setActive({ ...meme, key: memeNonce });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActive(null), VISIBLE_MS);
  }, [memeNonce]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4 md:bottom-8"
    >
      <AnimatePresence mode="popLayout">
        {active && (
          <motion.button
            type="button"
            key={active.key}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setActive(null)}
            className="pointer-events-auto relative w-full max-w-[340px] rounded-3xl border-2 text-left transition-transform active:translate-y-[2px] active:shadow-none"
            style={{
              borderColor: "var(--t-line)",
              background: "var(--t-card)",
              boxShadow: "5px 5px 0 var(--t-line)",
            }}
          >
            <span
              aria-hidden
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border-2"
              style={{
                borderColor: "var(--t-line)",
                background: "var(--t-card)",
              }}
            >
              <X size={11} strokeWidth={2.8} />
            </span>

            <ImageMeme meme={active} />

            {/* progress bar */}
            <motion.span
              key={`bar-${active.key}`}
              aria-hidden
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: VISIBLE_MS / 1000, ease: "linear" }}
              className="block h-1 origin-left rounded-b-3xl"
              style={{ background: "var(--t-line)", opacity: 0.55 }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageMeme({ meme }) {
  const [status, setStatus] = useState("loading");

  return (
    <div className="overflow-hidden rounded-t-3xl">
      <div
        className="relative w-full"
        style={{
          aspectRatio: meme.aspect || 1,
          background: "var(--t-bg)",
        }}
      >
        {status === "loading" && (
          <motion.div
            aria-hidden
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, var(--t-bg-soft) 0%, var(--t-card-soft) 50%, var(--t-bg-soft) 100%)",
            }}
          />
        )}

        <img
          src={meme.src}
          alt=""
          loading="eager"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("failed")}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: status === "loaded" ? 1 : 0,
            transition: "opacity 0.35s cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        {/* Classic Impact-style top/bottom caption overlays for templates */}
        {meme.topText && (
          <MemeCaption position="top" status={status}>
            {meme.topText}
          </MemeCaption>
        )}
        {meme.bottomText && (
          <MemeCaption position="bottom" status={status}>
            {meme.bottomText}
          </MemeCaption>
        )}

        {status === "failed" && (
          <div className="absolute inset-0 grid place-items-center bg-[var(--t-primary)]">
            <Sparkles
              size={28}
              strokeWidth={2.2}
              className="text-[var(--t-ink)]"
              style={{ opacity: 0.7 }}
            />
          </div>
        )}
      </div>
      {meme.caption && (
        <div className="px-4 pb-3 pt-3">
          <p className="text-[12.5px] font-bold leading-snug text-[var(--t-ink)]">
            {meme.caption}
          </p>
        </div>
      )}
    </div>
  );
}

function MemeCaption({ position, status, children }) {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 px-3"
      style={{
        [position]: "8px",
        opacity: status === "loaded" ? 1 : 0,
        transition: "opacity 0.35s cubic-bezier(0.16,1,0.3,1) 0.15s",
      }}
    >
      <p
        className="text-center font-extrabold uppercase leading-tight"
        style={{
          fontFamily:
            'Impact, "Anton", "Bebas Neue", "Oswald", system-ui, sans-serif',
          fontSize: "clamp(13px, 5vw, 22px)",
          letterSpacing: "0.02em",
          color: "#FFFFFF",
          // Classic meme stroke — multi-shadow trick gives a crisp 2px outline.
          textShadow: [
            "-2px -2px 0 #000",
            " 2px -2px 0 #000",
            "-2px  2px 0 #000",
            " 2px  2px 0 #000",
            "-2px  0   0 #000",
            " 2px  0   0 #000",
            " 0   -2px 0 #000",
            " 0    2px 0 #000",
          ].join(", "),
          WebkitTextStroke: "0",
        }}
      >
        {children}
      </p>
    </div>
  );
}

