import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useCountUp from "@/hooks/useCountUp";
import {
  X,
  Coffee,
  UtensilsCrossed,
  ShoppingBag,
  PlaySquare,
  Car,
  Sparkles,
  ScanLine,
  ReceiptText,
  TrendingUp,
  SwitchCamera,
} from "lucide-react";

import { useAuraStore } from "@/store/useAuraStore";
import { inr, inrCompact } from "@/utils/format";

/* ───────── Scenario library ─────────
   Each scenario is calibrated against believable urban-India spend patterns
   and resolves "equivalents" against the user's real jars where possible. */
const SCENARIOS = {
  coffee: {
    key: "coffee",
    title: "Daily coffee habit",
    perUnit: 150,
    cadence: "/cup",
    perDay: 1,
    daysPerYear: 365,
    Icon: Coffee,
    accent: "#5EEAD4",
    soft: "rgba(94, 234, 212, 0.16)",
    insight: "A small ritual that quietly costs you a vacation every year.",
    delayMonths: 2,
    swap: "Brew at home four mornings — same warmth, eight times the savings.",
  },
  food: {
    key: "food",
    title: "Food delivery loop",
    perUnit: 280,
    cadence: "/order",
    perDay: 4 / 7,
    daysPerYear: 365,
    Icon: UtensilsCrossed,
    accent: "#A78BFA",
    soft: "rgba(167, 139, 250, 0.18)",
    insight: "Late-night delivery spending increased ~22% this quarter.",
    delayMonths: 3,
    swap: "Cap delivery at twice a week — your future jar gets the rest.",
  },
  shopping: {
    key: "shopping",
    title: "Weekend shopping impulse",
    perUnit: 1200,
    cadence: "/order",
    perDay: 1 / 7,
    daysPerYear: 365,
    Icon: ShoppingBag,
    accent: "#F472B6",
    soft: "rgba(244, 114, 182, 0.18)",
    insight: "Micro-shopping drained roughly ₹3,200 this month alone.",
    delayMonths: 4,
    swap: "Park items in a wishlist for 48 hours — most of them quietly disappear.",
  },
  subscription: {
    key: "subscription",
    title: "Stacked subscriptions",
    perUnit: 650,
    cadence: "/month",
    perDay: 1 / 30,
    daysPerYear: 365,
    Icon: PlaySquare,
    accent: "#5EEAD4",
    soft: "rgba(94, 234, 212, 0.16)",
    insight: "Three streaming plans, one truly used. The other two run silently.",
    delayMonths: 1,
    swap: "Trim one service this month — the saved money compounds quietly.",
  },
  cab: {
    key: "cab",
    title: "Cab convenience",
    perUnit: 220,
    cadence: "/ride",
    perDay: 3 / 7,
    daysPerYear: 365,
    Icon: Car,
    accent: "#A78BFA",
    soft: "rgba(167, 139, 250, 0.18)",
    insight: "Convenience rides quietly outpace your monthly round-up rate.",
    delayMonths: 2,
    swap: "Pick metro on weekday commutes — keep cabs for the late nights.",
  },
};

const CATEGORIES = [
  { key: "coffee",       label: "Coffee",      Icon: Coffee },
  { key: "food",         label: "Food",        Icon: UtensilsCrossed },
  { key: "shopping",     label: "Shopping",    Icon: ShoppingBag },
  { key: "subscription", label: "Subscription",Icon: PlaySquare },
  { key: "cab",          label: "Cab",         Icon: Car },
];

function projectScenario(s) {
  const yearly  = Math.round(s.perUnit * s.perDay * s.daysPerYear);
  const monthly = Math.round(yearly / 12);
  return { yearly, monthly };
}

function buildEquivalents(yearly, jars) {
  if (!jars?.length) return [];
  // Prefer the two most aspirational jars by remaining gap.
  const ranked = [...jars]
    .map((j) => ({ ...j, remaining: Math.max(0, j.target - j.saved) }))
    .filter((j) => j.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining)
    .slice(0, 2);

  return ranked.map((j) => {
    const pct = Math.min(100, Math.round((yearly / j.remaining) * 100));
    return {
      emoji: j.emoji || "🎯",
      label: pct >= 100 ? `Fully covers ${j.name}` : `${pct}% of ${j.name}`,
    };
  });
}

export default function ARScan() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const sceneRef = useRef(null);

  const jars = useAuraStore((s) => s.jars);

  const [camState, setCamState] = useState("requesting"); // requesting | live | denied | unsupported
  const [facingMode, setFacingMode] = useState("environment"); // "environment" (rear) | "user" (front)
  const [activeKey, setActiveKey] = useState(null);
  // scanState: idle | locating | estimating | modeling | result
  const [scanState, setScanState] = useState("idle");
  const [pendingKey, setPendingKey] = useState(null);
  const scanTimers = useRef([]);

  const scanning = scanState !== "idle" && scanState !== "result";

  /* ── Pointer parallax: -1..1 across the screen, smoothed ─────────── */
  const pX = useMotionValue(0);
  const pY = useMotionValue(0);
  const sX = useSpring(pX, { stiffness: 90, damping: 18, mass: 0.6 });
  const sY = useSpring(pY, { stiffness: 90, damping: 18, mass: 0.6 });

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const handle = (clientX, clientY) => {
      const rect = el.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((clientY - rect.top) / rect.height) * 2 - 1;
      pX.set(Math.max(-1, Math.min(1, nx)));
      pY.set(Math.max(-1, Math.min(1, ny)));
    };
    const onMove = (e) => handle(e.clientX, e.clientY);
    const onTouch = (e) => {
      const t = e.touches[0];
      if (t) handle(t.clientX, t.clientY);
    };
    const onLeave = () => { pX.set(0); pY.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("touchmove", onTouch, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("touchmove", onTouch);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [pX, pY]);

  // Map pointer to subtle scene parallax
  const sceneRotX = useTransform(sY, [-1, 1], [4, -4]);
  const sceneRotY = useTransform(sX, [-1, 1], [-6, 6]);
  const farX  = useTransform(sX, [-1, 1], [12, -12]);
  const farY  = useTransform(sY, [-1, 1], [10, -10]);
  const nearX = useTransform(sX, [-1, 1], [-22, 22]);
  const nearY = useTransform(sY, [-1, 1], [-18, 18]);

  /* ── Motion tracking against the live camera feed ────────────────
     Frame-difference at 20Hz on a tiny 80×60 canvas. The motion centroid
     drives spring-smoothed offsets that the scene-3D wrapper translates by,
     so the anchor follows whatever's actually moving in front of the lens. */
  const trackXRaw = useMotionValue(0);
  const trackYRaw = useMotionValue(0);
  const detectedRaw = useMotionValue(0);
  const trackX = useSpring(trackXRaw, { stiffness: 150, damping: 26, mass: 0.6 });
  const trackY = useSpring(trackYRaw, { stiffness: 150, damping: 26, mass: 0.6 });
  const detected = useSpring(detectedRaw, { stiffness: 80, damping: 22 });

  useEffect(() => {
    if (camState !== "live") return;
    const video = videoRef.current;
    if (!video) return;

    const W = 80;
    const H = 60;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let prev = null;
    let raf = 0;
    let lastTick = 0;
    let cancelled = false;

    const tick = (now) => {
      if (cancelled) return;
      raf = requestAnimationFrame(tick);
      if (now - lastTick < 50) return; // ~20Hz
      lastTick = now;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      try {
        ctx.drawImage(video, 0, 0, W, H);
        const curr = ctx.getImageData(0, 0, W, H).data;

        if (prev) {
          let mass = 0;
          let cx = 0;
          let cy = 0;
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const i = (y * W + x) * 4;
              const d =
                Math.abs(curr[i] - prev[i]) +
                Math.abs(curr[i + 1] - prev[i + 1]) +
                Math.abs(curr[i + 2] - prev[i + 2]);
              if (d > 60) {
                const w = Math.min(255, d) / 255;
                mass += w;
                cx += x * w;
                cy += y * w;
              }
            }
          }

          if (mass > 8) {
            const nx = (cx / mass) / W * 2 - 1; // -1..1
            const ny = (cy / mass) / H * 2 - 1;
            // Cap travel so the anchor never wanders off-frame.
            trackXRaw.set(Math.max(-1, Math.min(1, nx)) * 110);
            trackYRaw.set(Math.max(-1, Math.min(1, ny)) * 90);
            detectedRaw.set(Math.min(1, mass / 80));
          } else {
            trackXRaw.set(0);
            trackYRaw.set(0);
            detectedRaw.set(0);
          }
        }
        prev = curr;
      } catch {
        // Video not ready or read blocked — skip this tick.
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [camState, trackXRaw, trackYRaw, detectedRaw]);

  /* ── Camera lifecycle ───────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCamState("unsupported");
        return;
      }
      // Stop any prior stream before starting a new one (camera switch)
      const prior = streamRef.current;
      if (prior) {
        prior.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCamState("requesting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCamState("live");
      } catch (e) {
        console.warn("[ar-scan] camera denied:", e?.message);
        setCamState("denied");
      }
    }

    start();
    return () => {
      cancelled = true;
      const stream = streamRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facingMode]);

  /* ── Scenario activation ────────────────────────────────────────── */
  function clearScanTimers() {
    scanTimers.current.forEach(clearTimeout);
    scanTimers.current = [];
  }

  function activate(key) {
    if (scanning) return;
    clearScanTimers();
    setActiveKey(null);
    setPendingKey(key);

    // Three-stage progressive analysis. Each stage is a short beat so the user
    // *feels* the scanner working — locating subject → estimating per-unit cost
    // → modeling habit cadence → reveal card.
    const stages = [
      { state: "locating",   delay: 0    },
      { state: "estimating", delay: 700  },
      { state: "modeling",   delay: 1400 },
      { state: "result",     delay: 2100 },
    ];
    stages.forEach(({ state, delay }) => {
      const t = setTimeout(() => {
        setScanState(state);
        if (state === "result") {
          setActiveKey(key);
          setPendingKey(null);
        }
      }, delay);
      scanTimers.current.push(t);
    });
  }

  function dismissOverlay() {
    clearScanTimers();
    setActiveKey(null);
    setScanState("idle");
    setPendingKey(null);
  }

  useEffect(() => () => clearScanTimers(), []);

  const active = activeKey ? SCENARIOS[activeKey] : null;
  const projection = useMemo(() => (active ? projectScenario(active) : null), [active]);
  const equivalents = useMemo(
    () => (active && projection ? buildEquivalents(projection.yearly, jars) : []),
    [active, projection, jars],
  );

  return (
    <div
      ref={sceneRef}
      className="fixed inset-0 z-[100] overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -10%, #182241 0%, #0A0F1F 55%, #060912 100%)",
        perspective: "1400px",
      }}
    >
      {/* ── Live camera layer ─────────────────────────────────────── */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: camState === "live" ? 1 : 0,
          transition: "opacity 700ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />

      {/* ── Depth particle layers (parallax with pointer) ─────────── */}
      <DepthParticles farX={farX} farY={farY} nearX={nearX} nearY={nearY} />

      {/* ── Permission / fallback messages ────────────────────────── */}
      <AnimatePresence>
        {camState !== "live" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 grid place-items-center px-8 text-center"
          >
            <div className="max-w-sm">
              <div
                className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
                style={{
                  background: "rgba(94, 234, 212, 0.14)",
                  boxShadow: "inset 0 0 0 1px rgba(94, 234, 212, 0.35)",
                }}
              >
                <ScanLine size={22} strokeWidth={1.8} className="text-[#5EEAD4]" />
              </div>
              <h2 className="mt-5 text-[20px] font-semibold tracking-tight">
                {camState === "requesting" && "Preparing your lens"}
                {camState === "denied" && "Camera permission blocked"}
                {camState === "unsupported" && "Camera not available here"}
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">
                {camState === "requesting" &&
                  "Future Vision needs your camera to overlay financial insight on what's in front of you."}
                {camState === "denied" &&
                  "We don't store any frames. Allow camera access and reload, or just tap a category below to see the projection without the live view."}
                {camState === "unsupported" &&
                  "Open this on a device with a camera, or tap a category below to preview the experience."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Vignette + scan frame + 3D anchor ─────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,9,18,0.55) 0%, rgba(6,9,18,0) 22%, rgba(6,9,18,0) 60%, rgba(6,9,18,0.92) 100%)",
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            rotateX: sceneRotX,
            rotateY: sceneRotY,
            x: trackX,
            y: trackY,
            transformStyle: "preserve-3d",
          }}
        >
          <ScanFrame scanning={scanning} />
          <FloatingAnchor
            scenario={active || (pendingKey ? SCENARIOS[pendingKey] : null)}
            scanning={scanning}
            idle={!active && !scanning}
            detected={detected}
          />
          <DetectionTicker
            scanState={scanState}
            scenario={pendingKey ? SCENARIOS[pendingKey] : null}
          />
        </motion.div>
      </div>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Close Future Vision scanner"
          className="grid h-10 w-10 place-items-center rounded-full backdrop-blur-md transition active:scale-95"
          style={{
            background: "rgba(15, 23, 42, 0.55)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
          }}
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div
          className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md"
          style={{
            background: "rgba(15, 23, 42, 0.55)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Future Vision · Live
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
            aria-label={facingMode === "environment" ? "Switch to front camera" : "Switch to rear camera"}
            className="grid h-10 w-10 place-items-center rounded-full backdrop-blur-md transition active:scale-95"
            style={{
              background: "rgba(15, 23, 42, 0.55)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            }}
          >
            <SwitchCamera size={17} strokeWidth={2} className="text-white/85" />
          </button>
          <button
            type="button"
            onClick={() => alert("Receipt OCR is coming next — point at any printed bill.")}
            aria-label="Scan receipt"
            className="grid h-10 w-10 place-items-center rounded-full backdrop-blur-md transition active:scale-95"
            style={{
              background: "rgba(15, 23, 42, 0.55)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            }}
          >
            <ReceiptText size={17} strokeWidth={2} className="text-[#5EEAD4]" />
          </button>
        </div>
      </div>

      {/* ── Hint line (when idle) ─────────────────────────────────── */}
      <AnimatePresence>
        {!active && !scanning && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 px-6 text-center"
          >
            <p className="text-[13px] font-medium tracking-tight text-white/80">
              Point at a purchase
            </p>
            <p className="mt-1 text-[11.5px] text-white/50">
              Tap a category to project its future cost
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tether + insight overlay card ─────────────────────────── */}
      <AnimatePresence>
        {active && projection && (
          <>
            <Tether
              key={`tether-${active.key}`}
              accent={active.accent}
              trackX={trackX}
              trackY={trackY}
            />
            <InsightCard
              key={active.key}
              scenario={active}
              projection={projection}
              equivalents={equivalents}
              onClose={dismissOverlay}
              tiltX={sX}
              tiltY={sY}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom action panel ───────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),18px)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,9,18,0) 0%, rgba(6,9,18,0.78) 38%, rgba(6,9,18,0.95) 100%)",
        }}
      >
        <div
          className="rounded-3xl p-3 backdrop-blur-xl"
          style={{
            background: "rgba(15, 23, 42, 0.55)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.10), 0 12px 40px rgba(0,0,0,0.45)",
          }}
        >
          <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map(({ key, label, Icon }) => {
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => activate(key)}
                  className="group flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 transition-all"
                  style={{
                    background: isActive
                      ? "rgba(94, 234, 212, 0.18)"
                      : "rgba(255,255,255,0.05)",
                    boxShadow: isActive
                      ? "inset 0 0 0 1px rgba(94, 234, 212, 0.55)"
                      : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={2}
                    className={isActive ? "text-[#5EEAD4]" : "text-white/80"}
                  />
                  <span
                    className="text-[12.5px] font-semibold tracking-tight"
                    style={{ color: isActive ? "#5EEAD4" : "rgba(255,255,255,0.85)" }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between px-1.5 pt-1">
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-white/45">
              {scanning
                ? "Analyzing…"
                : active
                  ? "Tap card to dismiss"
                  : "Pick a category to begin"}
            </p>
            <span className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] text-white/45">
              <Sparkles size={11} strokeWidth={2.2} className="text-[#A78BFA]" />
              Projection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Scan frame with gentle scanning sweep ───────── */
function ScanFrame({ scanning }) {
  return (
    <div className="absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] max-h-[420px] max-w-[420px] -translate-x-1/2 -translate-y-1/2">
      {/* corner brackets */}
      {["tl","tr","bl","br"].map((c) => (
        <span
          key={c}
          className="absolute h-7 w-7"
          style={{
            top:    c.includes("t") ? 0 : "auto",
            bottom: c.includes("b") ? 0 : "auto",
            left:   c.includes("l") ? 0 : "auto",
            right:  c.includes("r") ? 0 : "auto",
            borderTop:    c.includes("t") ? "1.5px solid rgba(94,234,212,0.7)" : "none",
            borderBottom: c.includes("b") ? "1.5px solid rgba(94,234,212,0.7)" : "none",
            borderLeft:   c.includes("l") ? "1.5px solid rgba(94,234,212,0.7)" : "none",
            borderRight:  c.includes("r") ? "1.5px solid rgba(94,234,212,0.7)" : "none",
            borderTopLeftRadius:     c === "tl" ? 14 : 0,
            borderTopRightRadius:    c === "tr" ? 14 : 0,
            borderBottomLeftRadius:  c === "bl" ? 14 : 0,
            borderBottomRightRadius: c === "br" ? 14 : 0,
          }}
        />
      ))}
      {/* sweeping line */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            key="sweep"
            initial={{ opacity: 0, top: "8%" }}
            animate={{ opacity: 1, top: "92%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-3 h-[1.5px]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(94,234,212,0.85) 50%, transparent 100%)",
              filter: "drop-shadow(0 0 6px rgba(94,234,212,0.6))",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── Insight card with cursor-driven 3D tilt ───────── */
function InsightCard({ scenario, projection, equivalents, onClose, tiltX, tiltY }) {
  const Icon = scenario.Icon;
  const cardRotX = useTransform(tiltY, [-1, 1], [6, -6]);
  const cardRotY = useTransform(tiltX, [-1, 1], [-8, 8]);
  return (
    <motion.button
      type="button"
      onClick={onClose}
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(4px)" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-x-0 mx-auto top-[18%] z-20 w-[min(92vw,400px)] cursor-pointer rounded-3xl p-5 text-left"
      style={{
        background: "rgba(15, 23, 42, 0.62)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        boxShadow:
          `inset 0 0 0 1px rgba(255,255,255,0.10), 0 22px 60px rgba(0,0,0,0.55), 0 0 0 1px ${scenario.soft}`,
        rotateX: cardRotX,
        rotateY: cardRotY,
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
          style={{
            background: scenario.soft,
            boxShadow: `inset 0 0 0 1px ${scenario.accent}55`,
          }}
        >
          <Icon size={18} strokeWidth={1.9} style={{ color: scenario.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: scenario.accent }}
          >
            Future impact
          </p>
          <h3 className="mt-1 text-[18px] font-semibold leading-snug tracking-tight text-white">
            {scenario.title}
          </h3>
        </div>
      </div>

      {/* Spend numbers */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <FigureBlock
          label="Per month"
          value={inr(projection.monthly)}
          accent={scenario.accent}
        />
        <FigureBlock
          label="Per year"
          value={inr(projection.yearly)}
          accent={scenario.accent}
          loud
        />
      </div>

      {/* Equivalents */}
      {equivalents.length > 0 && (
        <div className="mt-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/55">
            Equivalent to
          </p>
          <ul className="mt-2 space-y-1.5">
            {equivalents.map((e, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                <span className="text-[15px]">{e.emoji}</span>
                <span className="text-[12.5px] font-medium text-white/85">{e.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insight + delay */}
      <div
        className="mt-4 rounded-2xl px-3.5 py-3"
        style={{
          background: scenario.soft,
          boxShadow: `inset 0 0 0 1px ${scenario.accent}33`,
        }}
      >
        <div className="flex items-start gap-2">
          <TrendingUp
            size={14}
            strokeWidth={2}
            style={{ color: scenario.accent, marginTop: 2 }}
          />
          <div>
            <p className="text-[12.5px] leading-relaxed text-white/85">
              {scenario.insight}
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/65">
              This habit delays your savings goal by{" "}
              <span className="font-semibold text-white">
                {scenario.delayMonths} {scenario.delayMonths === 1 ? "month" : "months"}
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3.5 text-[11.5px] leading-relaxed text-white/55">
        <span className="font-semibold text-white/75">Try this — </span>
        {scenario.swap}
      </p>
    </motion.button>
  );
}

function FigureBlock({ label, value, accent, loud = false }) {
  // Count-up from 0 → final value when this block mounts. The original `value`
  // string is rebuilt by reformatting the rounded animated integer so the rupee
  // glyph + grouping stays consistent. We assume `value` is a currency string.
  const numeric = parseAmount(value);
  const animated = useCountUp(numeric, 1.0);
  const display = formatLikeCurrency(animated, value);

  return (
    <div
      className="rounded-2xl px-3.5 py-3"
      style={{
        background: loud ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
        {label}
      </p>
      <p
        className="num mt-1 font-semibold leading-tight tracking-tight tabular-nums"
        style={{
          fontSize: loud ? 22 : 18,
          color: loud ? accent : "rgba(255,255,255,0.95)",
        }}
      >
        {display}
      </p>
    </div>
  );
}

function parseAmount(formatted) {
  const digits = String(formatted).replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function formatLikeCurrency(n, sample) {
  // Detect a leading non-digit prefix from the sample (e.g. "₹") and re-emit.
  const m = String(sample).match(/^([^\d-]*)/);
  const prefix = m ? m[1] : "";
  return `${prefix}${n.toLocaleString("en-IN")}`;
}

/* ───────── Detection ticker — progressive analysis HUD ─────────
   Renders a stack of three stage chips above the scan frame. Each chip flips
   from a "..." loading state to its resolved value when the matching stage
   completes. The middle chip's number rapidly cycles before settling so the
   user feels the estimator working in real time. */
function DetectionTicker({ scanState, scenario }) {
  const visible = scanState !== "idle" && scanState !== "result";
  const accent = scenario?.accent || "#5EEAD4";

  const stage = STAGE_INDEX[scanState] ?? -1;

  const valueLabel = scenario
    ? `₹${scenario.perUnit.toLocaleString("en-IN")}${scenario.cadence}`
    : "—";
  const cadenceLabel = scenario ? `${formatPerYear(scenario)} / yr` : "—";

  const lines = [
    { label: "Locating subject",  done: stage >= 0, value: scenario?.title || "—" },
    { label: "Estimating cost",   done: stage >= 1, value: valueLabel,  ticker: true },
    { label: "Modeling habit",    done: stage >= 2, value: cadenceLabel },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ticker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute left-1/2 top-[16%] z-20 -translate-x-1/2 px-4"
        >
          <div className="flex flex-col gap-1.5 items-center">
            {lines.map((l, i) => (
              <DetectionChip
                key={l.label}
                accent={accent}
                index={i}
                stage={stage}
                {...l}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const STAGE_INDEX = { locating: 0, estimating: 1, modeling: 2 };

function formatPerYear(s) {
  const yearly = Math.round(s.perDay * s.daysPerYear);
  return yearly.toLocaleString("en-IN") + " " + (s.cadence.replace("/", "") + "s");
}

function DetectionChip({ index, label, value, done, ticker, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.12, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-full px-3.5 py-1.5 backdrop-blur-md flex items-center gap-2"
      style={{
        background: "rgba(15, 23, 42, 0.55)",
        boxShadow: `inset 0 0 0 1px ${done ? `${accent}66` : "rgba(255,255,255,0.10)"}`,
      }}
    >
      <span
        className="grid h-3.5 w-3.5 place-items-center rounded-full"
        style={{
          background: done ? accent : "rgba(255,255,255,0.18)",
        }}
      >
        {done ? (
          <motion.svg
            viewBox="0 0 12 12"
            width="9"
            height="9"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.path
              d="M2 6.5 L5 9.5 L10 3.5"
              fill="none"
              stroke="#0A0F1F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        ) : (
          <motion.span
            className="block h-1.5 w-1.5 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "rgba(255,255,255,0.85)" }}
          />
        )}
      </span>
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/70">
        {label}
      </span>
      <span
        className="num min-w-[2ch] text-[11.5px] font-semibold tracking-tight tabular-nums"
        style={{ color: done ? "#fff" : "rgba(255,255,255,0.55)" }}
      >
        {done ? value : ticker ? <RollingNumber finalValue={value} /> : "…"}
      </span>
    </motion.div>
  );
}

/* Rapidly-cycling digits that "settle" — runs while a chip is loading */
function RollingNumber({ finalValue }) {
  const [shown, setShown] = useState("…");
  useEffect(() => {
    const id = setInterval(() => {
      // Random plausible value pulled from the same digit-shape as the target.
      const digits = String(finalValue).replace(/\D/g, "").length || 3;
      const max = Math.pow(10, digits) - 1;
      const r = Math.floor(Math.random() * max);
      setShown(`₹${r.toLocaleString("en-IN")}`);
    }, 70);
    return () => clearInterval(id);
  }, [finalValue]);
  return <span>{shown}</span>;
}

/* ───────── Floating 3D anchor (CSS 3D coin) ─────────
   A spatial-feeling coin parked inside the scan frame: continuously rotates on
   Y-axis, soft depth shadow, ambient glow ring, and a category icon embossed
   on the front face. Color and icon morph when a scenario activates. */
function FloatingAnchor({ scenario, scanning, idle, detected }) {
  const accent = scenario?.accent || "#5EEAD4";
  const soft   = scenario?.soft   || "rgba(94,234,212,0.16)";
  const Icon   = scenario?.Icon   || ScanLine;
  // detected is always a motion value (passed by parent). Map mass → opacity
  // for the TRACKING chip — only appears once there's real motion in frame.
  const trackOpacity = useTransform(detected, [0, 0.15, 0.4], [0, 0, 1]);

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* ambient ground shadow */}
      <motion.div
        animate={{ opacity: idle ? 0.45 : 0.7, scale: scanning ? 1.05 : 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-[78px] -translate-x-1/2 rounded-full"
        style={{
          width: 110,
          height: 14,
          filter: "blur(10px)",
          background: "rgba(0,0,0,0.55)",
        }}
      />

      {/* glow halo */}
      <motion.div
        animate={{
          opacity: scanning ? 0.95 : 0.55,
          scale: scanning ? 1.18 : 1,
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 180,
          height: 180,
          background: `radial-gradient(circle, ${soft} 0%, rgba(0,0,0,0) 65%)`,
          filter: "blur(14px)",
        }}
      />

      {/* Coin: bobbing wrapper */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Coin: rotating disc */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: scanning ? 4.2 : 9, repeat: Infinity, ease: "linear" }}
          className="relative grid place-items-center"
          style={{
            width: 96,
            height: 96,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front face */}
          <CoinFace accent={accent} soft={soft} Icon={Icon} side="front" />
          {/* Back face */}
          <CoinFace accent={accent} soft={soft} Icon={Icon} side="back" />
          {/* Edge ring (cylinder illusion) */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                width: 96,
                height: 6,
                marginLeft: -48,
                marginTop: -3,
                background: `linear-gradient(90deg, ${accent}00 0%, ${accent}66 50%, ${accent}00 100%)`,
                transform: `rotateY(${(i / 18) * 360}deg) translateZ(0px)`,
                transformStyle: "preserve-3d",
                opacity: 0.35,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Pulsing precision ring */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.55, 0.15, 0.55],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 130,
          height: 130,
          border: `1px solid ${accent}66`,
        }}
      />

      {/* Lock-on label — fades in when motion is detected */}
      <motion.div
        className="absolute left-1/2 top-[100px] -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 backdrop-blur-md"
        style={{
          opacity: trackOpacity,
          background: "rgba(15,23,42,0.55)",
          boxShadow: `inset 0 0 0 1px ${accent}66`,
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            className="block h-1.5 w-1.5 rounded-full"
            style={{ background: accent }}
          />
          <span
            className="text-[9.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            Tracking
          </span>
        </span>
      </motion.div>
    </div>
  );
}

function CoinFace({ accent, soft, Icon, side }) {
  const isFront = side === "front";
  return (
    <div
      className="absolute inset-0 grid place-items-center rounded-full"
      style={{
        background: isFront
          ? `radial-gradient(120% 120% at 30% 25%, rgba(255,255,255,0.32) 0%, ${soft} 38%, rgba(15,23,42,0.92) 100%)`
          : `radial-gradient(120% 120% at 70% 75%, rgba(255,255,255,0.18) 0%, ${soft} 42%, rgba(6,9,18,0.95) 100%)`,
        boxShadow: `inset 0 0 0 1px ${accent}55, inset 0 -16px 28px rgba(0,0,0,0.55), 0 12px 30px rgba(0,0,0,0.45), 0 0 26px ${accent}33`,
        transform: isFront ? "translateZ(3px)" : "rotateY(180deg) translateZ(3px)",
        backfaceVisibility: "hidden",
      }}
    >
      <Icon
        size={28}
        strokeWidth={1.8}
        style={{
          color: accent,
          filter: `drop-shadow(0 0 6px ${accent}aa)`,
        }}
      />
    </div>
  );
}

/* ───────── Depth particles (parallax dust) ───────── */
function DepthParticles({ farX, farY, nearX, nearY }) {
  const far  = useMemo(() => seedDots(22, 1337), []);
  const near = useMemo(() => seedDots(14, 4242), []);

  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ x: farX, y: farY }}
      >
        {far.map((d, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              background: i % 2 === 0 ? "rgba(94,234,212,0.55)" : "rgba(167,139,250,0.45)",
              filter: "blur(0.3px)",
              opacity: 0.45,
            }}
            animate={{ y: [0, -6, 0], opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
          />
        ))}
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ x: nearX, y: nearY }}
      >
        {near.map((d, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size + 1,
              height: d.size + 1,
              background: "rgba(255,255,255,0.7)",
              boxShadow: "0 0 10px rgba(255,255,255,0.45)",
              opacity: 0.55,
            }}
            animate={{ y: [0, -10, 0], opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 4 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </>
  );
}

function seedDots(count, seed) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: 1.5 + rand() * 2.2,
  }));
}

/* ───────── Tether: glowing line from anchor to insight card ───────── */
function Tether({ accent, trackX, trackY }) {
  return (
    <motion.svg
      key="tether"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.85 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      preserveAspectRatio="none"
      style={trackX && trackY ? { x: trackX, y: trackY } : undefined}
    >
      <defs>
        <linearGradient id="tether-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.65" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.line
        x1="50%"
        y1="50%"
        x2="50%"
        y2="32%"
        stroke="url(#tether-grad)"
        strokeWidth="1.25"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ filter: `drop-shadow(0 0 6px ${accent}aa)` }}
      />
    </motion.svg>
  );
}
