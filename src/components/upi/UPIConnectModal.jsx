import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, X } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import { UPI_APPS, isValidVpa } from "@/data/upiApps";
import UpiLogo from "./UpiLogo";

/* UPIConnectModal
   Three-step flow: pick app → enter VPA → confirm linking.
   No real bank rails — this is a simulated link that records appId+vpa in the
   store. Settings can later toggle auto-debit and txn-sync.                   */

const STEPS = ["app", "vpa", "confirming", "done"];

export default function UPIConnectModal({ open, onClose }) {
  const linkUpi = useAuraStore((s) => s.linkUpi);

  const [step, setStep] = useState("app");
  const [appId, setAppId] = useState(null);
  const [vpa, setVpa] = useState("");
  const [vpaError, setVpaError] = useState(null);

  // Reset flow whenever the modal opens fresh.
  useEffect(() => {
    if (open) {
      setStep("app");
      setAppId(null);
      setVpa("");
      setVpaError(null);
    }
  }, [open]);

  // Auto-advance the "confirming" step after the faux handshake animation.
  useEffect(() => {
    if (step !== "confirming") return;
    const t = setTimeout(() => {
      linkUpi({ appId, vpa: vpa.trim().toLowerCase() });
      setStep("done");
    }, 1400);
    return () => clearTimeout(t);
  }, [step, appId, vpa, linkUpi]);

  const app = UPI_APPS.find((a) => a.id === appId) || null;

  function handleAppPick(id) {
    setAppId(id);
    setStep("vpa");
  }

  function handleVpaSubmit(e) {
    e.preventDefault();
    if (!isValidVpa(vpa)) {
      setVpaError("That doesn't look like a UPI ID. Try name@oksbi or name@ybl.");
      return;
    }
    setVpaError(null);
    setStep("confirming");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-4 sm:items-center"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 50, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-3xl border-2 border-[#0F172A] bg-[var(--t-card)] p-5 shadow-[6px_6px_0_#0F172A]"
          >
            <Header step={step} onBack={() => setStep("app")} onClose={onClose} />

            <div className="mt-4 min-h-[260px]">
              <AnimatePresence mode="wait">
                {step === "app" && (
                  <motion.div
                    key="app"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-[12.5px] leading-relaxed text-[var(--t-ink-muted)]">
                      Pick the UPI app you actually use. We'll route round-ups through
                      it and pull spend SMS automatically.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {UPI_APPS.map((a) => (
                        <UpiAppCard key={a.id} app={a} onClick={() => handleAppPick(a.id)} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === "vpa" && app && (
                  <motion.form
                    key="vpa"
                    onSubmit={handleVpaSubmit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-3">
                      <UpiLogo app={app} size={44} />
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[var(--t-ink-muted)]">
                          Connecting
                        </p>
                        <p className="text-[15px] font-extrabold tracking-tight text-[var(--t-ink)]">
                          {app.name}
                        </p>
                      </div>
                    </div>

                    <label className="mt-5 block">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--t-ink-muted)]">
                        Your UPI ID
                      </span>
                      <input
                        autoFocus
                        type="text"
                        inputMode="email"
                        autoCapitalize="off"
                        value={vpa}
                        onChange={(e) => {
                          setVpa(e.target.value);
                          if (vpaError) setVpaError(null);
                        }}
                        placeholder={app.handleHint}
                        className="mt-2 w-full rounded-2xl border-2 border-[#0F172A] bg-[var(--t-bg)] px-3 py-3 text-[14.5px] font-bold text-[var(--t-ink)] outline-none focus:bg-[var(--t-card)]"
                      />
                      {vpaError && (
                        <p className="mt-2 text-[11.5px] font-bold text-[#B91C1C]">
                          {vpaError}
                        </p>
                      )}
                    </label>

                    <div className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-[#0F172A]/12 bg-[var(--t-bg-soft)] p-3">
                      <ShieldCheck size={14} strokeWidth={2.4} className="mt-0.5 shrink-0 text-[var(--t-ink-muted)]" />
                      <p className="text-[11.5px] leading-relaxed text-[var(--t-ink-muted)]">
                        We never store your UPI PIN. Round-ups use a one-time mandate
                        on your linked app — you can revoke any time.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={!vpa.trim()}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0F172A] bg-[var(--t-primary)] py-3 text-[13.5px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:bg-[var(--t-bg-soft)] disabled:text-[var(--t-ink-faint)] disabled:shadow-none"
                    >
                      Continue
                      <ArrowRight size={14} strokeWidth={2.6} />
                    </button>
                  </motion.form>
                )}

                {step === "confirming" && app && (
                  <motion.div
                    key="confirming"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid place-items-center py-6"
                  >
                    <ConnectingPulse color={app.color} />
                    <p className="mt-5 text-[14px] font-extrabold tracking-tight text-[var(--t-ink)]">
                      Asking {app.name} for permission…
                    </p>
                    <p className="mt-1 text-[12px] text-[var(--t-ink-muted)]">
                      You'd normally see a confirmation in your UPI app right about now.
                    </p>
                  </motion.div>
                )}

                {step === "done" && app && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -8 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 18 }}
                      className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border-2 border-[#0F172A] shadow-[3px_3px_0_#0F172A]"
                      style={{ background: "var(--t-secondary)" }}
                    >
                      <Check size={26} strokeWidth={3} className="text-[#0F172A]" />
                    </motion.div>
                    <h4 className="mt-4 text-[18px] font-extrabold tracking-tight text-[var(--t-ink)]">
                      {app.name} linked
                    </h4>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--t-ink-muted)]">
                      <span className="font-bold text-[var(--t-ink)]">{vpa.trim().toLowerCase()}</span> is now your round-up rail.
                    </p>

                    <button
                      onClick={onClose}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border-2 border-[#0F172A] bg-[var(--t-card)] py-3 text-[13.5px] font-extrabold text-[var(--t-ink)] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────── Internal pieces ─────────── */

function Header({ step, onBack, onClose }) {
  const showBack = step === "vpa";
  return (
    <div className="flex items-center justify-between">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] shadow-[2px_2px_0_#0F172A] active:translate-y-[1px] active:shadow-none"
        >
          <ArrowLeft size={14} strokeWidth={2.6} />
        </button>
      ) : (
        <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[var(--t-ink-muted)]">
          UPI · {step === "done" ? "Linked" : "Connect"}
        </span>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] shadow-[2px_2px_0_#0F172A] active:translate-y-[1px] active:shadow-none"
      >
        <X size={14} strokeWidth={2.6} />
      </button>
    </div>
  );
}

function UpiAppCard({ app, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border-2 border-[#0F172A] bg-[var(--t-card)] p-3 text-left shadow-[3px_3px_0_#0F172A] transition-transform hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none"
    >
      <UpiLogo app={app} size={36} />
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-extrabold leading-tight text-[var(--t-ink)]">
          {app.short}
        </p>
        <p className="truncate text-[10.5px] text-[var(--t-ink-muted)]">
          {app.handleHint}
        </p>
      </div>
    </button>
  );
}

function ConnectingPulse({ color }) {
  return (
    <div className="relative grid h-20 w-20 place-items-center">
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: color, opacity: 0.18 }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.18, 0, 0.18] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-3 rounded-full"
        style={{ background: color, opacity: 0.32 }}
        animate={{ scale: [0.9, 1.18, 0.9], opacity: [0.32, 0.05, 0.32] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.25 }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0F172A] shadow-[3px_3px_0_#0F172A]"
        style={{ background: color }}
      >
        <span className="block h-2.5 w-2.5 rounded-full bg-white" />
      </motion.div>
    </div>
  );
}
