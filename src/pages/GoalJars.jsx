import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, TrendingUp, X } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import JarCard from "@/components/jars/JarCard";
import PageHeader from "@/components/common/PageHeader";
import { inr, inrCompact } from "@/utils/format";

const EMOJI_CHOICES = ["🌴", "💻", "🛡️", "🏍️", "🎧", "📷", "🏠", "🎓", "✈️", "🎁"];
const COLOR_CHOICES = ["#22C55E", "#EC4899", "#06B6D4", "#F59E0B", "#8B5CF6", "#EF4444"];

export default function GoalJars() {
  const jars = useAuraStore((s) => s.jars);
  const contributeToJar = useAuraStore((s) => s.contributeToJar);
  const addJar = useAuraStore((s) => s.addJar);

  const totals = useMemo(() => {
    const target = jars.reduce((s, j) => s + (j.target || 0), 0);
    const saved  = jars.reduce((s, j) => s + (j.saved  || 0), 0);
    const funded = jars.filter((j) => j.saved >= j.target).length;
    const pct    = target ? Math.round((saved / target) * 100) : 0;
    return { target, saved, funded, pct };
  }, [jars]);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [months, setMonths] = useState("3");

  function reset() {
    setName("");
    setTarget("");
    setEmoji(EMOJI_CHOICES[0]);
    setColor(COLOR_CHOICES[0]);
    setMonths("3");
  }

  function submit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    const targetNum = Number(target);
    if (!trimmed || !Number.isFinite(targetNum) || targetNum <= 0) return;
    addJar({
      id: `jar_${Date.now()}`,
      name: trimmed,
      emoji,
      iconKey: "star",
      target: Math.round(targetNum),
      color,
      monthsLeft: Math.max(1, Number(months) || 1),
    });
    reset();
    setOpen(false);
  }

  return (
    <>
      <div className="fixed inset-0 bg-[var(--t-bg)]" aria-hidden />

      <div className="relative space-y-4">
        <PageHeader title="Jars" />

        {/* Hero row with action */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 flex items-end justify-between gap-3"
        >
          <div className="min-w-0">
            <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
              Your jars
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#475569]">
              Drop spare change into the future you actually want.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="New jar"
            className="inline-flex shrink-0 items-center gap-1 rounded-2xl border-2 border-[#0F172A] bg-[var(--t-primary)] px-3 py-2 text-[12px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            <Plus size={14} strokeWidth={2.8} />
            New
          </button>
        </motion.section>

        {/* Stats hero — total progress across all jars */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-2"
        >
          <StatTile
            label="Saved"
            value={inrCompact(totals.saved)}
            sub={`of ${inrCompact(totals.target)}`}
            tint="var(--t-primary)"
            Icon={TrendingUp}
          />
          <StatTile
            label="On track"
            value={`${totals.pct}%`}
            sub="combined"
            tint="var(--t-secondary)"
            Icon={Target}
          />
          <StatTile
            label="Funded"
            value={`${totals.funded}/${jars.length}`}
            sub="jars done"
            tint="var(--t-lilac)"
          />
        </motion.section>

        {/* Jar list */}
        <ul className="space-y-3">
          {jars.map((jar, idx) => (
            <JarCard
              key={jar.id}
              jar={jar}
              idx={idx}
              onContribute={(j) => {
                // Simulate a burst of round-ups: random ₹400–₹1500 per tap so the
                // bar and liquid visibly fill regardless of jar target size.
                const amount = 400 + Math.floor(Math.random() * 1100);
                contributeToJar(j.id, amount);
              }}
            />
          ))}
        </ul>

        <p className="text-center text-[11px] text-[#94A3B8]">
          Tap a jar to top up · long-press to edit
        </p>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.form
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={submit}
              className="w-full max-w-md space-y-4 rounded-3xl border-2 border-[#0F172A] bg-white p-5 shadow-[6px_6px_0_#0F172A]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-extrabold tracking-tight text-[#0F172A]">
                  New jar
                </h3>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="rounded-full border-2 border-[#0F172A] bg-white p-1.5 shadow-[2px_2px_0_#0F172A] active:translate-y-[1px] active:shadow-none"
                >
                  <X size={14} strokeWidth={2.8} />
                </button>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold text-[#475569]">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tokyo Trip"
                  autoFocus
                  className="w-full rounded-2xl border-2 border-[#0F172A] bg-[var(--t-bg)] px-3 py-2.5 text-[14px] font-bold text-[#0F172A] outline-none focus:bg-white"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-bold text-[#475569]">Target ₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="40000"
                    className="num w-full rounded-2xl border-2 border-[#0F172A] bg-[var(--t-bg)] px-3 py-2.5 text-[14px] font-bold text-[#0F172A] outline-none focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-bold text-[#475569]">Months</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    className="num w-full rounded-2xl border-2 border-[#0F172A] bg-[var(--t-bg)] px-3 py-2.5 text-[14px] font-bold text-[#0F172A] outline-none focus:bg-white"
                  />
                </label>
              </div>

              <div>
                <span className="mb-1.5 block text-[12px] font-bold text-[#475569]">Emoji</span>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_CHOICES.map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`h-9 w-9 rounded-xl border-2 border-[#0F172A] text-[16px] transition-transform active:translate-y-[1px] ${
                        emoji === e ? "bg-[var(--t-primary)] shadow-[2px_2px_0_#0F172A]" : "bg-white"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-[12px] font-bold text-[#475569]">Color</span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_CHOICES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      aria-label={`Color ${c}`}
                      onClick={() => setColor(c)}
                      style={{ background: c }}
                      className={`h-8 w-8 rounded-full border-2 border-[#0F172A] transition-transform active:translate-y-[1px] ${
                        color === c ? "shadow-[2px_2px_0_#0F172A] ring-2 ring-[#0F172A] ring-offset-2 ring-offset-white" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim() || !Number(target)}
                className="mt-2 w-full rounded-2xl border-2 border-[#0F172A] bg-[#22C55E] px-4 py-3 text-[14px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:shadow-none"
              >
                Create jar
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatTile({ label, value, sub, tint, Icon }) {
  return (
    <div className="rounded-2xl border-2 border-[#0F172A] bg-white p-3 shadow-[3px_3px_0_#0F172A]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#475569]">
          {label}
        </p>
        {Icon && (
          <span
            className="grid h-6 w-6 place-items-center rounded-md border-2 border-[#0F172A]"
            style={{ background: tint }}
          >
            <Icon size={11} strokeWidth={2.6} className="text-[#0F172A]" />
          </span>
        )}
      </div>
      <p className="num mt-1.5 text-[18px] font-extrabold leading-none text-[#0F172A]">
        {value}
      </p>
      <p className="mt-1 text-[10.5px] text-[#94A3B8]">{sub}</p>
    </div>
  );
}
