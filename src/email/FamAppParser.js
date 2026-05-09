/**
 * Parser for FamApp / FamPay transaction emails (no-reply@famapp.in).
 *
 * Sample body shape:
 *   Hey Katepally Tribhuvan,
 *   You have successfully paid
 *   ₹50.0
 *   to SRI PAVAN ATHAVA
 *   Transaction ID : FMPIB5427720739
 *   Date : 02:49 PM IST, 09 May 2026
 *   Updated Balance : ₹0.0
 *   UTR : 612908806795
 *   Purpose : Paid securely via FamApp
 */

export class FamAppEmailParser {
  getBankName() { return "FamApp"; }
  getCurrency() { return "INR"; }

  canHandle({ from = "", subject = "" } = {}) {
    const f = from.toLowerCase();
    const s = subject.toLowerCase();
    return f.includes("famapp.in") ||
      f.includes("fampay.in") ||
      f.includes("trio.in") ||
      s.includes("fampay") ||
      s.includes("famapp");
  }

  /**
   * @param  {{from?:string, subject?:string, body:string, timestamp?:number}} email
   * @returns ParsedTransaction-shaped object or null
   */
  parse({ from = "", subject = "", body = "", timestamp = Date.now() }) {
    const text = stripHtml(body);

    // Determine direction (paid vs received).
    const lower = (subject + " " + text).toLowerCase();
    let type = null;
    if (lower.includes("successfully paid") || lower.includes("payment of")) type = "EXPENSE";
    else if (lower.includes("received") || lower.includes("credited") || lower.includes("money in")) type = "INCOME";
    else if (lower.includes("debited") || lower.includes("paid")) type = "EXPENSE";
    if (!type) return null;

    // Amount — try subject first ("Your payment of ₹50.0"), then body's first ₹.
    let amount = matchNumber(subject, /₹\s*([0-9,]+(?:\.\d+)?)/);
    if (amount == null) amount = matchNumber(text, /₹\s*([0-9,]+(?:\.\d+)?)/);
    if (amount == null) return null;

    // Merchant — line like "to SRI PAVAN ATHAVA" (typically all caps, multi-word).
    let merchant = null;
    const toMatch = text.match(/\bto\s+([A-Z][A-Z\s.&-]{2,60}?)\s*(?:\n|Transaction\s+ID|$)/);
    if (toMatch) merchant = toMatch[1].trim().replace(/\s+/g, " ");
    if (!merchant) {
      const fromMatch = text.match(/\bfrom\s+([A-Z][A-Z\s.&-]{2,60}?)\s*(?:\n|Transaction\s+ID|$)/);
      if (fromMatch) merchant = fromMatch[1].trim().replace(/\s+/g, " ");
    }
    merchant = merchant ? toTitleCase(merchant) : "FamApp Payment";

    // Optional fields.
    const txnId = match1(text, /Transaction\s*ID\s*:\s*(\S+)/i);
    const utr = match1(text, /UTR\s*:\s*(\d+)/i);
    const balance = matchNumber(text, /Updated\s+Balance\s*:\s*₹\s*([0-9,]+(?:\.\d+)?)/i);

    // Prefer email body's "Date : 02:49 PM IST, 09 May 2026" — falls back to provided timestamp.
    const dateStr = match1(text, /Date\s*:\s*([\d:]+\s*[AP]M\s+(?:IST,?\s+)?\d{1,2}\s+\w+\s+\d{4})/i);
    const ts = parseFamDate(dateStr) ?? timestamp;

    return {
      amount,
      type,
      merchant,
      reference: utr || txnId || null,
      accountLast4: null,
      balance,
      creditLimit: null,
      smsBody: text,                    // re-using shape from SMS parser
      sender: from || "no-reply@famapp.in",
      timestamp: ts,
      bankName: "FamApp",
      isFromCard: false,
      currency: "INR",
    };
  }
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function stripHtml(input) {
  if (!input) return "";
  return input
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x?\d+;/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function match1(s, re) {
  const m = s.match(re);
  return m ? m[1].trim() : null;
}

function matchNumber(s, re) {
  const m = s.match(re);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function toTitleCase(s) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function parseFamDate(s) {
  if (!s) return null;
  // "02:49 PM IST, 09 May 2026" → ISO
  const m = s.match(/(\d{1,2}):(\d{2})\s*([AP]M)\s+(?:IST,?\s+)?(\d{1,2})\s+(\w+)\s+(\d{4})/i);
  if (!m) return null;
  let [, hh, mm, ampm, dd, mon, yyyy] = m;
  let h = Number(hh) % 12;
  if (ampm.toUpperCase() === "PM") h += 12;
  const monthIdx = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
    .indexOf(mon.toLowerCase().slice(0, 3));
  if (monthIdx < 0) return null;
  // Treat the time as IST (UTC+5:30).
  const utcMs = Date.UTC(Number(yyyy), monthIdx, Number(dd), h, Number(mm)) - 330 * 60 * 1000;
  return utcMs;
}
