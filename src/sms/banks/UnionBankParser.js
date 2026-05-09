import { BaseIndianBankParser } from "../BaseIndianBankParser.js";

/**
 * Union Bank of India.
 *
 * Sample SMS:
 *   "A/c *4763 Debited for Rs:500.00 on 28-04-2026 22:06:21 by Mob Bk
 *    ref no 611852923121 Avl Bal Rs:5274.95.If not you, Call 1800222243
 *    -Union Bank of India"
 *
 * Quirks:
 *   - Uses Rs:X (colon, no space) for amounts
 *   - "by Mob Bk" / "by ATM" indicate the channel, not a real merchant
 *   - "by NEFT/IMPS/UPI - Beneficiary Name" sometimes carries the merchant
 */
export class UnionBankParser extends BaseIndianBankParser {
  getBankName() { return "Union Bank of India"; }

  canHandle(sender) {
    const s = (sender || "").toUpperCase();
    return s.includes("UNIONB") ||
      s.includes("UBOI") ||
      s.includes("UBIN") ||
      /^[A-Z]{2}-UNIONB.*$/.test(s) ||
      /^[A-Z]{2}-UBOI.*$/.test(s) ||
      /^[A-Z]{2}-UBIN.*$/.test(s);
  }

  extractAmount(message) {
    // "Debited for Rs:500.00" / "Credited with Rs:500.00"
    let m = message.match(/(?:Debited|Credited)\s+(?:for|by|with)\s+Rs[.:\s]*([0-9,]+(?:\.\d{2})?)/i);
    if (m) {
      const num = Number(m[1].replace(/,/g, ""));
      if (!Number.isNaN(num)) return num;
    }
    // "Rs:500.00 debited"
    m = message.match(/Rs[.:\s]*([0-9,]+(?:\.\d{2})?)\s+(?:debited|credited|withdrawn)/i);
    if (m) {
      const num = Number(m[1].replace(/,/g, ""));
      if (!Number.isNaN(num)) return num;
    }
    return super.extractAmount(message);
  }

  extractMerchant(message, sender) {
    // Channel indicators — these aren't really merchants but they're useful context.
    if (/by\s+Mob\s+Bk/i.test(message)) return "Mobile Banking";
    if (/by\s+(?:Internet|Net)\s+Bk/i.test(message)) return "Internet Banking";
    if (/by\s+ATM/i.test(message)) return "ATM";
    if (/by\s+POS/i.test(message)) return "POS";

    // "by UPI - someone@bank" or "by NEFT - JOHN DOE"
    const m = message.match(/by\s+(?:UPI|NEFT|IMPS|RTGS|BIL)\s*[-:]\s*([^.\n]+?)(?:\s+ref|\s+Ref|\.|\sAvl|$)/i);
    if (m && this.isValidMerchant(m[1].trim())) return this.cleanMerchant(m[1].trim());

    return super.extractMerchant(message, sender);
  }

  extractAccountLast4(message) {
    // "A/c *4763" or "A/c X4763"
    const m = message.match(/A\/c\s*[*X]+(\d{3,4})/i);
    if (m) return m[1].slice(-4);
    return super.extractAccountLast4(message);
  }
}
