import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ShieldCheck,
  Check,
  ChevronLeft,
  ClipboardPaste,
  Sparkles,
  Plus,
  LogIn,
  Loader2,
} from "lucide-react";

import { parseEmail, splitRawEmail } from "@/email";
import { signIn, fetchFamAppMessages } from "@/email/gmail";
import { toAuraTxn } from "@/sms/toAuraTxn";
import { useAuraStore } from "@/store/useAuraStore";
import { inr } from "@/utils/format";
import PageHeader from "@/components/common/PageHeader";

const SAMPLE = `From: FamApp <no-reply@famapp.in>
Subject: Your payment of ₹50.0 is successful

Hey Katepally Tribhuvan,

You have successfully paid

₹50.0

to SRI PAVAN ATHAVA

Transaction ID : FMPIB5427720739
Date : 02:49 PM IST, 09 May 2026
Updated Balance : ₹0.0
UTR : 612908806795
Purpose : Paid securely via FamApp`;

export default function ImportEmail() {
  const navigate = useNavigate();
  const addTransaction = useAuraStore((s) => s.addTransaction);
  const [drafts, setDrafts] = useState([{ id: 1, raw: "" }]);
  const [results, setResults] = useState([]);   // [{ key, txn, parsed, error?, raw }]
  const [importedCount, setImportedCount] = useState(0);

  // Gmail OAuth state
  const [signedIn, setSignedIn] = useState(false);
  const [signInError, setSignInError] = useState(null);
  const [gmailBusy, setGmailBusy] = useState(false);
  const [gmailDiag, setGmailDiag] = useState([]);
  const gLog = (msg) => {
    const t = new Date().toLocaleTimeString();
    setGmailDiag((d) => [...d, `[${t}] ${msg}`]);
    console.log("[gmail]", msg);
  };

  async function handleGmailSync() {
    setSignInError(null);
    setGmailDiag([]);
    setGmailBusy(true);
    try {
      gLog("starting Google sign-in…");
      const { accessToken, profile } = await signIn(gLog);
      setSignedIn(true);
      gLog(`token acquired (length ${accessToken.length}); fetching FamApp emails…`);
      const { transactions: parsed, stats } = await fetchFamAppMessages(accessToken, {
        maxCount: 50,
        log: gLog,
      });
      gLog(`fetched ${stats.listed} messages, parsed ${stats.parsed}, ${stats.unique} unique`);
      const newResults = parsed.map((p, i) => {
        const txn = toAuraTxn(p, i);
        return txn
          ? { key: `g_${p.timestamp}_${i}`, txn, parsed: p }
          : { key: `g_${p.timestamp}_${i}`, error: "Recognised but not an outgoing payment.", raw: p.smsBody };
      });
      setResults(newResults);
    } catch (e) {
      console.error("[gmail] error:", e);
      gLog(`ERROR: ${e?.message || String(e)}`);
      setSignInError(e?.message || String(e));
    } finally {
      setGmailBusy(false);
    }
  }

  function setDraft(id, raw) {
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, raw } : d)));
  }
  function addDraft() {
    setDrafts((ds) => [...ds, { id: Date.now(), raw: "" }]);
  }
  function removeDraft(id) {
    setDrafts((ds) => ds.filter((d) => d.id !== id));
  }

  function parseAll() {
    const out = [];
    drafts.forEach((d, idx) => {
      if (!d.raw.trim()) return;
      const { from, subject, body } = splitRawEmail(d.raw);
      const parsed = parseEmail({ from, subject, body });
      if (!parsed) {
        out.push({ key: `e_${idx}`, error: "Couldn't recognise this email — is it a FamApp transaction?", raw: d.raw });
        return;
      }
      const txn = toAuraTxn(parsed, idx);
      if (!txn) {
        out.push({ key: `e_${idx}`, error: "Recognised, but it's not an outgoing payment (income/credit are skipped).", raw: d.raw });
        return;
      }
      out.push({ key: `e_${idx}`, txn, parsed });
    });
    setResults(out);
  }

  const importable = useMemo(() => results.filter((r) => r.txn), [results]);
  const [selected, setSelected] = useState(new Set());

  function toggle(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // Auto-select all importable when results land.
  useMemo(() => setSelected(new Set(importable.map((r) => r.key))), [importable.length]);

  function importSelected() {
    const chosen = importable.filter((r) => selected.has(r.key));
    chosen.forEach((r) => addTransaction(r.txn));
    setImportedCount(chosen.length);
    setResults([]);
    setDrafts([{ id: 1, raw: "" }]);
  }

  return (
    <>
      <PageHeader title="Import Email" />

      <div className="mt-4 md:mt-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="hidden md:inline-flex items-center gap-1 text-[12px] font-bold text-[var(--t-ink-muted)] mb-3"
        >
          <ChevronLeft size={14} strokeWidth={2.6} />
          Back
        </button>

        <Intro />

        {/* Gmail auto-fetch */}
        <div className="stamp-card mt-5 p-5">
          <div className="flex items-start gap-3">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2"
              style={{ borderColor: "var(--t-line)", background: "var(--t-primary)" }}
            >
              <LogIn size={20} strokeWidth={2.4} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
                Auto-fetch
              </p>
              <h3 className="mt-1 text-[16px] md:text-[18px] font-extrabold tracking-tight">
                Sign in with Google to pull FamApp emails
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--t-ink-muted)]">
                Read-only scope on your inbox. We only query
                <code className="px-1 mx-1 rounded bg-[var(--t-card-soft)] border border-[var(--t-line-soft)] text-[11px]">
                  from:no-reply@famapp.in
                </code>
                — nothing else is touched, nothing leaves your device.
              </p>
            </div>
          </div>

          <button
            onClick={handleGmailSync}
            disabled={gmailBusy}
            className="stamp-btn mt-4 w-full justify-center !py-3.5 disabled:opacity-50"
            style={{ background: "var(--t-secondary)" }}
          >
            {gmailBusy ? (
              <>
                <Loader2 size={16} strokeWidth={2.6} className="animate-spin" />
                Working…
              </>
            ) : (
              <>
                <LogIn size={16} strokeWidth={2.6} />
                {signedIn ? "Sync FamApp emails again" : "Sign in & sync FamApp emails"}
              </>
            )}
          </button>

          {signInError && (
            <div
              className="mt-3 rounded-xl border-2 p-3 text-[12px] font-bold"
              style={{ borderColor: "var(--t-line)", background: "var(--t-card-soft)", color: "var(--t-danger)" }}
            >
              {signInError}
            </div>
          )}
          {gmailDiag.length > 0 && (
            <div
              className="mt-3 rounded-xl border-2 p-3 font-mono text-[11px] leading-snug max-h-40 overflow-y-auto"
              style={{ borderColor: "var(--t-line)", background: "var(--t-card-soft)" }}
            >
              {gmailDiag.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
        </div>

        <p className="mt-5 mb-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
          Or paste manually
        </p>

        <div className="mt-2 space-y-3">
          {drafts.map((d, idx) => (
            <DraftCard
              key={d.id}
              index={idx}
              draft={d}
              onChange={(raw) => setDraft(d.id, raw)}
              onRemove={drafts.length > 1 ? () => removeDraft(d.id) : null}
              onLoadSample={idx === 0 ? () => setDraft(d.id, SAMPLE) : null}
            />
          ))}
          <button
            onClick={addDraft}
            className="stamp-btn w-full justify-center"
          >
            <Plus size={14} strokeWidth={2.8} />
            Paste another email
          </button>
        </div>

        <button
          onClick={parseAll}
          disabled={drafts.every((d) => !d.raw.trim())}
          className="stamp-btn !py-3.5 !px-5 mt-5 disabled:opacity-50"
          style={{ background: "var(--t-primary)" }}
        >
          <Sparkles size={16} strokeWidth={2.6} />
          Parse {drafts.filter((d) => d.raw.trim()).length || ""} email{drafts.length !== 1 ? "s" : ""}
        </button>

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 stamp-card p-5"
            >
              <h3 className="text-[16px] font-extrabold mb-3">Review</h3>
              <ul className="divide-y-2" style={{ borderColor: "var(--t-line-soft)" }}>
                {results.map((r) => (
                  <ResultRow
                    key={r.key}
                    r={r}
                    checked={selected.has(r.key)}
                    onToggle={() => toggle(r.key)}
                  />
                ))}
              </ul>
              {importable.length > 0 && (
                <button
                  onClick={importSelected}
                  className="stamp-btn w-full justify-center !py-3.5 mt-5"
                  style={{ background: "var(--t-primary)" }}
                >
                  <Check size={16} strokeWidth={2.8} />
                  Import {selected.size} selected
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {importedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 stamp-card p-5 text-center"
          >
            <p className="text-[15px] font-extrabold">
              ✅ Imported {importedCount} transaction{importedCount !== 1 ? "s" : ""}.
            </p>
            <button onClick={() => navigate("/")} className="stamp-btn mt-4" style={{ background: "var(--t-primary)" }}>
              Back to dashboard
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function Intro() {
  return (
    <div className="stamp-card p-5">
      <div
        className="grid h-12 w-12 place-items-center rounded-2xl border-2"
        style={{ borderColor: "var(--t-line)", background: "var(--t-secondary)" }}
      >
        <Mail size={20} strokeWidth={2.4} />
      </div>
      <h2 className="mt-3 text-[22px] md:text-[26px] font-extrabold leading-tight tracking-tight">
        Paste a FamApp email
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--t-ink-muted)] max-w-xl">
        Open the FamApp transaction email, copy the body (or "Show original" plain text),
        and paste it below. We'll parse the amount, merchant and date locally.
      </p>
      <ul className="mt-3 space-y-1.5 text-[12px] text-[var(--t-ink-muted)]">
        <li className="flex items-center gap-1.5"><ShieldCheck size={12} strokeWidth={2.6}/> Nothing leaves your device.</li>
        <li className="flex items-center gap-1.5"><ClipboardPaste size={12} strokeWidth={2.6}/> Multi-paste supported — add more emails below.</li>
      </ul>
    </div>
  );
}

function DraftCard({ index, draft, onChange, onRemove, onLoadSample }) {
  return (
    <div className="stamp-card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--t-ink-muted)]">
          Email #{index + 1}
        </p>
        <div className="flex gap-2">
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              className="text-[11px] font-extrabold underline text-[var(--t-ink-muted)]"
            >
              Load sample
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-[11px] font-extrabold text-[var(--t-danger)]"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <textarea
        value={draft.raw}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the FamApp email here…"
        rows={8}
        className="w-full rounded-xl border-2 p-3 font-mono text-[12px] leading-relaxed focus:outline-none focus:translate-y-[1px] transition-transform"
        style={{
          borderColor: "var(--t-line)",
          background: "var(--t-card-soft)",
          color: "var(--t-ink)",
          boxShadow: "2px 2px 0 var(--t-line)",
        }}
      />
    </div>
  );
}

function ResultRow({ r, checked, onToggle }) {
  if (r.error) {
    return (
      <li className="py-3">
        <p className="text-[12px] font-bold" style={{ color: "var(--t-danger)" }}>
          ⚠ {r.error}
        </p>
      </li>
    );
  }
  return (
    <li className="py-3 flex items-center gap-3">
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2"
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
        style={{ borderColor: "var(--t-line)", background: "var(--t-secondary)" }}
      >
        F
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-extrabold">{r.txn.merchant}</p>
        <p className="truncate text-[11px] text-[var(--t-ink-dim)]">
          {r.parsed.bankName} · {new Date(r.txn.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="num text-[13px] font-extrabold">{inr(r.txn.amount)}</p>
        <p className="num text-[10px] font-bold text-[var(--t-ink-dim)]">+{inr(r.txn.savedAmount)}</p>
      </div>
    </li>
  );
}
