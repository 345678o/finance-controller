import { BaseIndianBankParser } from "../BaseIndianBankParser.js";

export class ICICIBankParser extends BaseIndianBankParser {
  getBankName() { return "ICICI Bank"; }

  canHandle(sender) {
    const s = (sender || "").toUpperCase();
    return s.includes("ICICI") ||
      s.includes("ICICIB") ||
      /^[A-Z]{2}-ICICIB.*$/.test(s) ||
      /^[A-Z]{2}-ICICI.*$/.test(s);
  }

  extractMerchant(message, sender) {
    // "VPA john@ybl"
    let m = message.match(/VPA\s+([^@\s]+)@/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    // "Info: BIL/MERCHANT" or "Info: NEFT/MERCHANT"
    m = message.match(/Info:?\s*(?:BIL|NEFT|IMPS)\/([^/.\n]+?)(?:\/|$)/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    // "to MERCHANT on 12-MAY-26"
    m = message.match(/to\s+([^.\n]+?)\s+on\s+\d{2}-/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    return super.extractMerchant(message, sender);
  }
}
