import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ShieldCheck,
  Loader2,
  Check,
  X,
  Smartphone,
  ChevronLeft,
  Lock,
  Sparkles,
} from "lucide-react";

import { Capacitor } from "@capacitor/core";
import {
  isAndroid,
  requestSmsPermission,
  scanInbox,
} from "@/sms";
import { toAuraTxn } from "@/sms/toAuraTxn";
import { useAuraStore } from "@/store/useAuraStore";
import { inr, inrCompact } from "@/utils/format";
import PageHeader from "@/components/common/PageHeader";

const STEP = { GATE: "gate", SCANNING: "scanning", REVIEW: "review", DONE: "done" };

export default function ImportSms() {
  const navigate = useNavigate();
  const addTransaction = useAuraStore((s) => s.addTransaction);

  const [step, setStep] = useState(STEP.GATE);
  const [error, setError] = useState(null);
  const [parsed, setParsed] = useState([]);    // raw ParsedTransactions
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [importedCount, setImportedCount] = useState(0);
  const [diag, setDiag] = useState([]);           // visible diagnostic log

  const log = (msg) => {
    const t = new Date().toLocaleTimeString();
    setDiag((d) => [...d, `[${t}] ${msg}`]);
    console.log("[import-sms]", msg);
  };

  const candidates = useMemo(
    () => parsed.map((p, i) => ({ key: `${p.timestamp}-${i}`, parsed: p, txn: toAuraTxn(p, i) })).filter((c) => c.txn),
    [parsed],
  );

  const totals = useMemo(() => {
    const expenses = candidates.reduce((s, c) => s + c.txn.amount, 0);
    const savings = candidates.reduce((s, c) => s + c.txn.savedAmount, 0);
    const banks = new Set(parsed.map((p) => p.bankName));
    return { expenses, savings, banks: banks.size, count: candidates.length };
  }, [candidates, parsed]);

  // Default-select all candidates when scan completes.
  useEffect(() => {
    if (step === STEP.REVIEW) setSelected(new Set(candidates.map((c) => c.key)));
  }, [step, candidates]);

  async function startScan() {
    setError(null);
    setDiag([]);
    log(`tap: platform=${Capacitor.getPlatform()} native=${Capacitor.isNativePlatform()}`);
    try {
      if (isAndroid()) {
        const granted = await requestSmsPermission(log);
        if (!granted) {
          setError(
            "Permission not granted. If no Android system dialog appeared, " +
            "the in-app prompt is blocked. Open Settings → Apps → AuraLoop → " +
            "Permissions → SMS → Allow, then come back and tap again.",
          );
          return;
        }
      }
      setStep(STEP.SCANNING);
      const result = await scanInbox({ maxCount: 500, sinceDays: 180 }, log);
      // Backwards-compat: scanInbox now returns { transactions, stats }
      const list = Array.isArray(result) ? result : result.transactions;
      setParsed(list);
      setStats(Array.isArray(result) ? null : result.stats);
      setStep(STEP.REVIEW);
    } catch (e) {
      console.error("[import-sms] scan flow error:", e);
      const msg = e?.message || String(e) || "Scan failed.";
      log(`ERROR: ${msg}`);
      setError(`Scan failed: ${msg}`);
      setStep(STEP.GATE);
    }
  }

  function toggle(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function importSelected() {
    const chosen = candidates.filter((c) => selected.has(c.key));
    chosen.forEach((c) => addTransaction(c.txn));
    setImportedCount(chosen.length);
    setStep(STEP.DONE);
  }

  return (
    <>
      <PageHeader title="Import SMS" />

      <div className="mt-4 md:mt-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="hidden md:inline-flex items-center gap-1 text-[12px] font-bold text-[var(--t-ink-muted)] mb-3"
        >
          <ChevronLeft size={14} strokeWidth={2.6} />
          Back
        </button>

        <AnimatePresence mode="wait">
          {step === STEP.GATE && (
            <Gate key="gate" onStart={startScan} error={error} diag={diag} />
          )}
          {step === STEP.SCANNING && <Scanning key="scan" />}
          {step === STEP.REVIEW && (
            <Review
              key="review"
              candidates={candidates}
              selected={selected}
              onToggle={toggle}
              totals={totals}
              stats={stats}
              onImport={importSelected}
              onBack={() => setStep(STEP.GATE)}
            />
          )}
          {step === STEP.DONE && (
            <Done key="done" count={importedCount} onClose={() => navigate("/")} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function Gate({ onStart, error, diag }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="stamp-card p-5 md:p-7"
    >
      <div
        className="grid h-14 w-14 place-items-center rounded-2xl border-2"
        style={{ borderColor: "var(--t-line)", background: "var(--t-secondary)" }}
      >
        <MessageSquare size={24} strokeWidth={2.4} />
      </div>
      <h2 className="mt-4 text-[24px] md:text-[30px] font-extrabold leading-tight tracking-tight">
        Auto-track from your bank SMS
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--t-ink-muted)] max-w-xl">
        AuraLoop reads transaction SMS from your inbox to auto-fill spending and
        round-up savings. Everything is parsed on your device — nothing leaves your
        phone.
      </p>

      <ul className="mt-5 space-y-2.5">
        <Bullet icon={ShieldCheck}>SMS stay on your phone — no servers, no upload.</Bullet>
        <Bullet icon={Lock}>OTPs and promotional messages are filtered out.</Bullet>
        <Bullet icon={Sparkles}>Round-up savings are computed automatically.</Bullet>
        <Bullet icon={Smartphone}>Android only. iOS doesn't allow SMS reading.</Bullet>
      </ul>

      {error && (
        <div
          className="mt-4 rounded-xl border-2 p-3 text-[13px] font-bold"
          style={{ borderColor: "var(--t-line)", background: "var(--t-card-soft)", color: "var(--t-danger)" }}
        >
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onStart}
          className="stamp-btn !py-3.5 !px-5"
          style={{ background: "var(--t-primary)" }}
        >
          {isAndroid() ? "Allow & scan inbox" : "Scan with sample data"}
        </button>
        {!isAndroid() && (
          <span className="self-center text-[12px] text-[var(--t-ink-dim)]">
            On the web build, you'll see 5 demo SMS so you can preview the flow.
          </span>
        )}
      </div>

      {diag && diag.length > 0 && (
        <div
          className="mt-4 rounded-xl border-2 p-3 font-mono text-[11px] leading-snug max-h-48 overflow-y-auto"
          style={{ borderColor: "var(--t-line)", background: "var(--t-card-soft)", color: "var(--t-ink)" }}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)] mb-1">
            Diagnostic
          </p>
          {diag.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </motion.div>
  );
}

function Bullet({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg border-2 shrink-0"
        style={{ borderColor: "var(--t-line)", background: "var(--t-card-soft)" }}
      >
        <Icon size={14} strokeWidth={2.6} />
      </span>
      <p className="text-[13px] font-bold text-[var(--t-ink)]">{children}</p>
    </li>
  );
}

function Scanning() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="stamp-card p-7 flex flex-col items-center text-center min-h-[320px] justify-center"
    >
      <div
        className="grid h-16 w-16 place-items-center rounded-2xl border-2 mb-5"
        style={{ borderColor: "var(--t-line)", background: "var(--t-primary)" }}
      >
        <Loader2 size={28} strokeWidth={2.4} className="animate-spin" />
      </div>
      <h3 className="text-[20px] font-extrabold">Reading your inbox</h3>
      <p className="mt-2 text-[13px] text-[var(--t-ink-muted)] max-w-sm">
        Parsing SMS from up to 6 months back. We're matching senders against
        HDFC, SBI, ICICI, Axis, Kotak and a generic Indian-bank fallback.
      </p>
    </motion.div>
  );
}

function Review({ candidates, selected, onToggle, totals, stats, onImport, onBack }) {
  const [showSenders, setShowSenders] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryStat label="Detected"  value={totals.count} tint="var(--t-primary)" />
        <SummaryStat label="Banks"     value={totals.banks} tint="var(--t-secondary)" />
        <SummaryStat label="Total spend" value={inrCompact(totals.expenses)} tint="var(--t-accent)" />
        <SummaryStat label="Round-ups"   value={inrCompact(totals.savings)}   tint="var(--t-lilac)" />
      </div>

      {/* Diagnostic — sender breakdown */}
      {stats && stats.raw > 0 && (
        <div
          className="stamp-card mt-4 p-4"
          style={{ background: "var(--t-card-soft)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold text-[var(--t-ink)]">
              Read <strong>{stats.raw}</strong> SMS · matched <strong>{stats.matched}</strong> ·
              imported <strong>{stats.uniqueTxns}</strong> after dedupe
            </p>
            <button
              onClick={() => setShowSenders((v) => !v)}
              className="text-[11px] font-extrabold underline text-[var(--t-ink-muted)]"
            >
              {showSenders ? "Hide" : "Show"} senders
            </button>
          </div>
          {showSenders && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
              <div>
                <p className="font-sans font-extrabold text-[10px] uppercase tracking-[0.1em] text-[var(--t-ink-muted)] mb-1">
                  Matched ({stats.sendersMatched.length})
                </p>
                <ul className="space-y-0.5 max-h-40 overflow-y-auto">
                  {stats.sendersMatched.map(([s, n]) => (
                    <li key={s}>{n.toString().padStart(3, " ")} · {s}</li>
                  ))}
                  {stats.sendersMatched.length === 0 && <li className="text-[var(--t-ink-faint)]">none</li>}
                </ul>
              </div>
              <div>
                <p className="font-sans font-extrabold text-[10px] uppercase tracking-[0.1em] text-[var(--t-ink-muted)] mb-1">
                  Skipped ({stats.sendersSkipped.length})
                </p>
                <ul className="space-y-0.5 max-h-40 overflow-y-auto">
                  {stats.sendersSkipped.slice(0, 50).map(([s, n]) => (
                    <li key={s}>{n.toString().padStart(3, " ")} · {s}</li>
                  ))}
                  {stats.sendersSkipped.length === 0 && <li className="text-[var(--t-ink-faint)]">none</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List */}
      <div className="stamp-card mt-5">
        <div className="p-4 md:p-5 border-b-2" style={{ borderColor: "var(--t-line-soft)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-extrabold">Review {totals.count} transactions</h3>
            <span className="text-[12px] font-bold text-[var(--t-ink-muted)]">
              {selected.size} selected
            </span>
          </div>
          <p className="mt-1 text-[12px] text-[var(--t-ink-dim)]">
            Untick anything that's wrong. We'll only import the ticked ones.
          </p>
        </div>

        {candidates.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[var(--t-ink-dim)]">
            No bank transactions found in the last 6 months.
          </div>
        ) : (
          <ul className="divide-y-2 max-h-[60vh] overflow-y-auto" style={{ borderColor: "var(--t-line-soft)" }}>
            {candidates.map((c) => (
              <CandidateRow
                key={c.key}
                candidate={c}
                checked={selected.has(c.key)}
                onToggle={() => onToggle(c.key)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <button onClick={onBack} className="stamp-btn">
          <ChevronLeft size={14} strokeWidth={2.6} />
          Back
        </button>
        <button
          onClick={onImport}
          disabled={selected.size === 0}
          className="stamp-btn !py-3.5 !px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--t-primary)" }}
        >
          <Check size={16} strokeWidth={2.8} />
          Import {selected.size} transaction{selected.size !== 1 ? "s" : ""}
        </button>
      </div>
    </motion.div>
  );
}

function SummaryStat({ label, value, tint }) {
  return (
    <div
      className="rounded-2xl border-2 p-3"
      style={{ borderColor: "var(--t-line)", background: tint, boxShadow: "3px 3px 0 var(--t-line)" }}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
        {label}
      </p>
      <p className="num mt-1 text-[20px] font-extrabold leading-none">{value}</p>
    </div>
  );
}

function CandidateRow({ candidate, checked, onToggle }) {
  const { txn, parsed } = candidate;
  return (
    <li className="p-3 md:p-4 flex items-center gap-3">
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 touch-target"
        style={{
          borderColor: "var(--t-line)",
          background: checked ? "var(--t-primary)" : "var(--t-card)",
          boxShadow: checked ? "2px 2px 0 var(--t-line)" : "none",
        }}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </button>

      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 text-[12px] font-extrabold"
        style={{ borderColor: "var(--t-line)", background: "var(--t-card-soft)" }}
      >
        {(txn.merchant[0] || "?").toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-extrabold text-[var(--t-ink)]">
          {txn.merchant}
        </p>
        <p className="truncate text-[11px] text-[var(--t-ink-dim)]">
          {parsed.bankName} · {txn.category} · {new Date(txn.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="num text-[13px] font-extrabold">{inr(txn.amount)}</p>
        <p className="num text-[10px] font-bold text-[var(--t-ink-dim)]">
          +{inr(txn.savedAmount)}
        </p>
      </div>
    </li>
  );
}

function Done({ count, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="stamp-card p-7 text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 16 }}
        className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 mb-5"
        style={{ borderColor: "var(--t-line)", background: "var(--t-primary)", boxShadow: "5px 5px 0 var(--t-line)" }}
      >
        <Check size={28} strokeWidth={3} />
      </motion.div>
      <h2 className="text-[24px] font-extrabold">Imported {count} transaction{count !== 1 ? "s" : ""}</h2>
      <p className="mt-2 text-[13px] text-[var(--t-ink-muted)] max-w-sm mx-auto">
        Your dashboard, savings and aura score will reflect these immediately.
      </p>
      <button onClick={onClose} className="stamp-btn !py-3.5 !px-5 mt-6" style={{ background: "var(--t-primary)" }}>
        Back to dashboard
      </button>
    </motion.div>
  );
}
