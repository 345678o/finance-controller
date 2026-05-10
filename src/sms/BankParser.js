/**
 * Base bank-SMS parser. Ported from PennyWise (MIT).
 *
 * A ParsedTransaction looks like:
 *   {
 *     amount: number,
 *     type: 'EXPENSE' | 'INCOME' | 'INVESTMENT' | 'CREDIT' | null,
 *     merchant: string | null,
 *     reference: string | null,
 *     accountLast4: string | null,
 *     balance: number | null,
 *     creditLimit: number | null,
 *     smsBody: string,
 *     sender: string,
 *     timestamp: number,
 *     bankName: string,
 *     isFromCard: boolean,
 *     currency: string,
 *   }
 */

import { Amount, Reference, Account, Balance, Merchant, Cleaning } from "./CompiledPatterns.js";

export const TxnType = Object.freeze({
  EXPENSE: "EXPENSE",
  INCOME: "INCOME",
  INVESTMENT: "INVESTMENT",
  CREDIT: "CREDIT",
});

const TXN_KEYWORDS = [
  "debited", "credited", "withdrawn", "deposited",
  "spent", "received", "transferred", "paid", "sent",
  "purchased", "deducted",
];

export class BankParser {
  getBankName() { throw new Error("getBankName not implemented"); }
  canHandle(_sender) { return false; }
  getCurrency() { return "INR"; }

  parse(smsBody, sender, timestamp) {
    if (!this.isTransactionMessage(smsBody)) return null;

    const amount = this.extractAmount(smsBody);
    if (amount == null) return null;

    const type = this.extractTransactionType(smsBody);
    if (type == null) return null;

    const availableLimit = type === TxnType.CREDIT ? this.extractAvailableLimit(smsBody) : null;
    const rawAccount = this.extractAccountLast4(smsBody);
    const safeAccount = rawAccount ? this.#last4(rawAccount) || rawAccount : null;

    return {
      amount,
      type,
      merchant: this.extractMerchant(smsBody, sender),
      reference: this.extractReference(smsBody),
      accountLast4: safeAccount,
      balance: this.extractBalance(smsBody),
      creditLimit: availableLimit,
      smsBody,
      sender,
      timestamp,
      bankName: this.getBankName(),
      isFromCard: this.detectIsCard(smsBody),
      currency: this.getCurrency(),
    };
  }

  // ── Filters ────────────────────────────────────────────────
  isTransactionMessage(message) {
    const lower = message.toLowerCase();

    if (lower.includes("otp") || lower.includes("one time password") || lower.includes("verification code"))
      return false;

    if (lower.includes("offer") || lower.includes("discount") || lower.includes("cashback offer") || lower.includes("win "))
      return false;

    // Recharge / streaming / subscription promos. These often contain "paid"
    // or "purchase" verbs in marketing copy ("pay Rs.49 to get…"), so we have
    // to filter explicitly — they're not real transactions.
    if (
      lower.includes("recharge with") ||
      lower.includes("recharge of rs") ||
      lower.includes("to recharge") ||
      lower.includes("validity:") ||
      lower.includes(" validity ") ||
      lower.includes("data benefit") ||
      lower.includes("talktime") ||
      lower.includes("talk time") ||
      lower.includes("unlimited calls") ||
      lower.includes("free trial") ||
      lower.includes("subscribe to") ||
      lower.includes("subscription pack") ||
      lower.includes("auto-renew") ||
      lower.includes("auto renew") ||
      lower.includes("with catch the match") ||
      lower.includes("catch the match") ||
      lower.includes("jiohotstar") ||
      lower.includes("jiotv") ||
      lower.includes("watch live") ||
      lower.includes("activate plan") ||
      lower.includes("plan active till") ||
      // Pricing-pitch promos: "...at just Rs.449", "for just Rs.99", "starting at"
      lower.includes("at just rs") ||
      lower.includes("for just rs") ||
      lower.includes("just rs.") ||
      lower.includes("just ₹") ||
      lower.includes("starting at rs") ||
      lower.includes("starting from rs")
    ) return false;

    if (
      lower.includes("has requested") ||
      lower.includes("payment request") ||
      lower.includes("collect request") ||
      lower.includes("requesting payment") ||
      lower.includes("requests rs") ||
      lower.includes("ignore if already paid")
    ) return false;

    if (lower.includes("have received payment")) return false;

    if (
      lower.includes("is due") ||
      lower.includes("min amount due") ||
      lower.includes("minimum amount due") ||
      lower.includes("in arrears") ||
      lower.includes("is overdue") ||
      lower.includes("ignore if paid") ||
      (lower.includes("pls pay") && lower.includes("min of"))
    ) return false;

    return TXN_KEYWORDS.some((kw) => lower.includes(kw));
  }

  // ── Extractors ─────────────────────────────────────────────
  extractAmount(message) {
    for (const re of Amount.ALL) {
      const m = message.match(re);
      if (m) {
        const num = Number(m[1].replace(/,/g, ""));
        if (!Number.isNaN(num)) return num;
      }
    }
    return null;
  }

  extractTransactionType(message) {
    const lower = message.toLowerCase();
    if (this.isInvestmentTransaction(lower)) return TxnType.INVESTMENT;

    if (lower.includes("debited") || lower.includes("withdrawn") || lower.includes("spent") ||
        lower.includes("charged") || lower.includes("paid") || lower.includes("purchase") ||
        lower.includes("deducted") || /\bsent\s+rs/i.test(message) || /\bsent\s+inr/i.test(message))
      return TxnType.EXPENSE;

    if (lower.includes("credited") || lower.includes("deposited") || lower.includes("received") ||
        lower.includes("refund") || (lower.includes("cashback") && !lower.includes("earn cashback")))
      return TxnType.INCOME;

    return null;
  }

  isInvestmentTransaction(lower) {
    const kws = [
      "iccl", "indian clearing corporation", "nsccl", "nse clearing", "clearing corporation",
      "nach", " ach ", " ecs ",
      "groww", "zerodha", "upstox", "kite", "kuvera", "paytm money", "etmoney", "coin by zerodha",
      "smallcase", "angel one", "angel broking", "5paisa", "icici securities", "icici direct",
      "hdfc securities", "kotak securities", "motilal oswal", "sharekhan", "edelweiss",
      "axis direct", "sbi securities",
      "mutual fund", " sip ", "elss", " ipo ", "folio", "demat", "stockbroker",
      "digital gold", "sovereign gold",
      " nse ", " bse ", "cdsl", "nsdl",
    ];
    return kws.some((k) => lower.includes(k));
  }

  extractMerchant(message, _sender) {
    // UPI VPA: "to X@bank" or "from X@bank" — capture the local part as merchant.
    const vpa = message.match(/(?:to|from)\s+([A-Za-z0-9._-]+)@[A-Za-z0-9._-]+/i);
    if (vpa) {
      const name = this.cleanMerchant(vpa[1].trim());
      if (this.isValidMerchant(name)) return this.#prettyVpa(name);
    }

    for (const re of Merchant.ALL) {
      const m = message.match(re);
      if (m) {
        const name = this.cleanMerchant(m[1].trim());
        if (this.isValidMerchant(name)) return name;
      }
    }
    return null;
  }

  #prettyVpa(name) {
    // Common UPI handle styles: "swiggy", "swiggy.upi", "john.doe.123"
    const cleaned = name.replace(/[._-]+/g, " ").replace(/\d+$/, "").trim();
    if (!cleaned) return name;
    return cleaned
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  extractReference(message) {
    for (const re of Reference.ALL) {
      const m = message.match(re);
      if (m) return m[1].trim();
    }
    return null;
  }

  extractAccountLast4(message) {
    for (const re of Account.ALL) {
      const m = message.match(re);
      if (m) {
        const raw = m[1];
        const last4 = this.#last4(raw);
        if (last4 && this.#isValidAccountLast4(last4, message)) return last4;
      }
    }
    return null;
  }

  extractBalance(message) {
    for (const re of Balance.ALL) {
      const m = message.match(re);
      if (m) {
        const num = Number(m[1].replace(/,/g, ""));
        if (!Number.isNaN(num)) return num;
      }
    }
    return null;
  }

  extractAvailableLimit(message) {
    const patterns = [
      /Available\s+limit\s+Rs\.([0-9,]+(?:\.\d{2})?)/i,
      /Available\s+limit:?\s*Rs\.?\s*([0-9,]+(?:\.\d{2})?)/i,
      /Avl\s+Lmt:?\s*Rs\.?\s*([0-9,]+(?:\.\d{2})?)/i,
      /Avail\s+Limit:?\s*Rs\.?\s*([0-9,]+(?:\.\d{2})?)/i,
      /Available\s+Credit\s+Limit:?\s*Rs\.?\s*([0-9,]+(?:\.\d{2})?)/i,
      /(?:^|\s)Limit:?\s*Rs\.?\s*([0-9,]+(?:\.\d{2})?)/i,
    ];
    for (const re of patterns) {
      const m = message.match(re);
      if (m) {
        const num = Number(m[1].replace(/,/g, ""));
        if (!Number.isNaN(num)) return num;
      }
    }
    return null;
  }

  detectIsCard(message) {
    const lower = message.toLowerCase();
    const acctPatterns = ["a/c", "account", "ac ", "acc ", "saving account", "current account", "savings a/c", "current a/c"];
    if (acctPatterns.some((p) => lower.includes(p))) return false;

    const cardPatterns = ["card ending", "card xx", "debit card", "credit card", "card no.", "card number", "card *", "card x"];
    if (cardPatterns.some((p) => lower.includes(p))) return true;

    if (lower.includes("ending") && /(?:xx|XX|\*{2,})?\d{4}/.test(message)) return true;
    return false;
  }

  cleanMerchant(name) {
    return name
      .replace(Cleaning.TRAILING_PARENS, "")
      .replace(Cleaning.REF_SUFFIX, "")
      .replace(Cleaning.DATE_SUFFIX, "")
      .replace(Cleaning.UPI_SUFFIX, "")
      .replace(Cleaning.TIME_SUFFIX, "")
      .replace(Cleaning.TRAILING_DASH, "")
      .replace(Cleaning.PVT_LTD, "")
      .replace(Cleaning.LTD, "")
      .trim();
  }

  isValidMerchant(name) {
    if (!name || name.length < 3) return false;
    const common = new Set(["USING", "VIA", "THROUGH", "BY", "WITH", "FOR", "TO", "FROM", "AT", "THE"]);
    if (/^a\/c\s/i.test(name)) return false;          // "A/c XX1234"
    if (/^(?:account|acct)\s/i.test(name)) return false;
    if (/^xx?\d/i.test(name)) return false;            // "XX1234"
    // Reject pitch-language fragments captured as merchants:
    //   "just Rs", "just Rs 449", "Just Rs.99", "only Rs 199", "Rs 449", "INR 99"
    if (/^\s*(?:just|only)?\s*(?:rs\.?|inr|₹)\b[\s.,\d]*$/i.test(name)) return false;
    if (/^\s*(?:just|only)\b/i.test(name)) return false;
    return /[a-zA-Z]/.test(name) &&
      !common.has(name.toUpperCase()) &&
      !/^\d+$/.test(name) &&
      !name.includes("@");
  }

  // ── Internals ──────────────────────────────────────────────
  #last4(raw) {
    const digits = (raw || "").replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return last4.length >= 3 ? last4 : null;
  }

  #isValidAccountLast4(last4, fullMessage) {
    const esc = last4.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const datePatterns = [
      new RegExp(`\\d{1,2}[/-]\\d{1,2}[/-]${esc}`),
      new RegExp(`${esc}[/-]\\d{1,2}[/-]\\d{1,2}`),
      new RegExp(`\\bon\\s+\\d{1,2}[/-]\\d{1,2}[/-]${esc}`, "i"),
      new RegExp(`\\bdated\\s+\\d{1,2}[/-]\\d{1,2}[/-]${esc}`, "i"),
    ];
    if (datePatterns.some((re) => re.test(fullMessage))) return false;

    const yearLike = Number(last4);
    if (yearLike >= 2000 && yearLike <= 2099) {
      const yearCtx = [
        new RegExp(`\\bon\\s+\\d{1,2}[/-]\\d{1,2}[/-]${esc}`, "i"),
        new RegExp(`\\bdated\\s+.*?${esc}`, "i"),
        new RegExp(`${esc}(?:\\s|$)`),
      ];
      if (yearCtx.some((re) => re.test(fullMessage))) {
        const acctBefore = new RegExp(`(?:A\\/c|Account|Acct).{0,25}${esc}`, "i");
        if (!acctBefore.test(fullMessage)) return false;
      }
    }
    return true;
  }
}
