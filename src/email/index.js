import { FamAppEmailParser } from "./FamAppParser.js";

export { FamAppEmailParser };

const PARSERS = [new FamAppEmailParser()];

/**
 * Try each registered email parser in turn.
 * @param {{from?:string, subject?:string, body:string, timestamp?:number}} email
 * @returns ParsedTransaction or null
 */
export function parseEmail(email) {
  for (const p of PARSERS) {
    if (p.canHandle(email)) {
      const r = p.parse(email);
      if (r) return r;
    }
  }
  return null;
}

/**
 * Crude raw-email parser: extract From / Subject / Body from a pasted blob.
 * Handles "From: foo\nSubject: bar\n\nbody…" format and also a bare body.
 */
export function splitRawEmail(raw) {
  if (!raw) return { from: "", subject: "", body: "" };
  const text = raw.trim();

  // Look for header lines at the top.
  const headerMatch = text.match(/^([\s\S]*?\n\n)([\s\S]*)$/);
  let headerBlob = "";
  let body = text;
  if (headerMatch) {
    headerBlob = headerMatch[1];
    body = headerMatch[2];
  }

  const fromLine = headerBlob.match(/^From:\s*(.+)$/im);
  const subjectLine = headerBlob.match(/^Subject:\s*(.+)$/im);

  // Heuristic: if there's no header block but the body itself contains "From:" or "Subject:" lines, use them.
  let from = fromLine ? fromLine[1].trim() : "";
  let subject = subjectLine ? subjectLine[1].trim() : "";

  if (!from) {
    const m = text.match(/^From:\s*(.+)$/im);
    if (m) from = m[1].trim();
  }
  if (!subject) {
    const m = text.match(/^Subject:\s*(.+)$/im);
    if (m) subject = m[1].trim();
  }

  // Light-touch infer when the user just pastes the body of a FamApp email.
  if (!from && /famapp|fampay/i.test(text)) from = "no-reply@famapp.in";
  if (!subject) {
    const sm = text.match(/Your\s+payment\s+of\s+₹[\d.,]+\s+is\s+successful/i);
    if (sm) subject = sm[0];
  }

  return { from, subject, body };
}
