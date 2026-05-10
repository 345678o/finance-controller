import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import { inr } from "@/utils/format";

/* AddMoneyModal — drop a custom amount into a specific jar.
   Steps: pick jar (defaulted to primary) → pick a quick amount or type custom
   → confirm. The contribute action bumps `memeNonce`, so the existing meme
   toast still fires for free. Closes after a brief success beat.            */

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500];

export default function AddMoneyModal({ open, onClose, jar }) {
  const jars = useAuraStore((s) => s.jars);
  const contributeToJar = useAuraStore((s) => s.contributeToJar);

  const [targetJarId, setTargetJarId] = useState(jar?.id || jars[0]?.id);
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Re-seed when the modal opens or the suggested jar changes.
  useEffect(() => {
    if (open) {
      setTargetJarId(jar?.id || jars[0]?.id);
      setAmount("");
      setSuccess(false);
      setError(null);
    }
  }, [open, jar?.id, jars]);

  const targetJar = jars.find((j) => j.id === targetJarId) || null;
  const remaining = targetJar ? Math.max(0, targetJar.target - targetJar.saved) : 0;

  function pickAmount(value) {
    setAmount(String(value));
    setError(null);
  }

  function submit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Type an amount above ₹0.");
      return;
    }
    if (!targetJar) {
      setError("Pick a jar first.");
      return;
    }
    contributeToJar(targetJar.id, Math.round(value));
    setSuccess(true);
    setTimeout(() => onClose(), 950);
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
          <motion.form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            initial={{ y: 50, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md space-y-4 rounded-3xl border-2 border-[#0F172A] bg-[var(--t-card)] p-5 shadow-[6px_6px_0_#0F172A]"
          >
            <header className="flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[var(--t-ink-muted)]">
                Add money
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] shadow-[2px_2px_0_#0F172A] active:translate-y-[1px] active:shadow-none"
              >
                <X size={14} strokeWidth={2.6} />
              </button>
            </header>

            {/* Jar picker */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--t-ink-muted)]">
                Drop into
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {jars.map((j) => {
                  const active = j.id === targetJarId;
                  const funded = j.saved >= j.target;
                  return (
                    <button
                      type="button"
                      key={j.id}
                      onClick={() => !funded && setTargetJarId(j.id)}
                      disabled={funded}
                      className={
                        "inline-flex items-center gap-1.5 rounded-2xl border-2 border-[#0F172A] px-2.5 py-1.5 text-[12px] font-extrabold transition-transform active:translate-y-[1px] " +
                        (active
                          ? "shadow-[2px_2px_0_#0F172A]"
                          : funded
                            ? "opacity-50"
                            : "bg-[var(--t-card)]")
                      }
                      style={{
                        background: active ? j.color : (funded ? "var(--t-bg-soft)" : "var(--t-card)"),
                        color: active ? "#fff" : "var(--t-ink)",
                      }}
                    >
                      <span>{j.emoji}</span>
                      <span className="truncate max-w-[8rem]">{j.name}</span>
                      {funded && <Check size={11} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--t-ink-muted)]">
                Amount
              </p>
              <div className="mt-2 flex items-center rounded-2xl border-2 border-[#0F172A] bg-[var(--t-bg)] px-3 focus-within:bg-[var(--t-card)]">
                <span className="num text-[22px] font-extrabold text-[var(--t-ink-muted)]">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="0"
                  autoFocus
                  className="num w-full bg-transparent py-3 pl-2 text-[22px] font-extrabold tracking-tight text-[var(--t-ink)] outline-none placeholder:text-[var(--t-ink-faint)]"
                />
              </div>
              {targetJar && (
                <p className="num mt-1.5 text-[11.5px] text-[var(--t-ink-faint)]">
                  {remaining > 0
                    ? `${inr(remaining)} left to fund this jar`
                    : "This jar is funded."}
                </p>
              )}
              {error && (
                <p className="mt-1.5 text-[11.5px] font-bold text-[#B91C1C]">{error}</p>
              )}

              {/* Quick amount chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => pickAmount(a)}
                    className="num rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--t-ink)] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[1px] active:shadow-none"
                  >
                    +{inr(a)}
                  </button>
                ))}
                {targetJar && remaining > 0 && (
                  <button
                    type="button"
                    onClick={() => pickAmount(remaining)}
                    className="num rounded-xl border-2 border-[#0F172A] bg-[var(--t-secondary)] px-3 py-1.5 text-[12px] font-extrabold text-[#0F172A] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[1px] active:shadow-none"
                  >
                    Fund it
                  </button>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!Number(amount) || success}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0F172A] py-3.5 text-[13.5px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:bg-[var(--t-bg-soft)] disabled:text-[var(--t-ink-faint)] disabled:shadow-none"
              style={{
                background: success ? "var(--t-secondary)" : "var(--t-primary)",
              }}
            >
              {success ? (
                <>
                  <Check size={14} strokeWidth={2.8} />
                  Added
                </>
              ) : (
                <>
                  <Plus size={14} strokeWidth={2.8} />
                  Add to jar
                </>
              )}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
