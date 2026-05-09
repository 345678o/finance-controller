import { BaseIndianBankParser } from "../BaseIndianBankParser.js";

export class KotakBankParser extends BaseIndianBankParser {
  getBankName() { return "Kotak Mahindra Bank"; }

  canHandle(sender) {
    const s = (sender || "").toUpperCase();
    return s.includes("KOTAKB") ||
      s.includes("KOTAK") ||
      /^[A-Z]{2}-KOTAKB.*$/.test(s);
  }

  extractMerchant(message, sender) {
    // "Sent Rs.X to MERCHANT on date" or "to MERCHANT@upi"
    let m = message.match(/Sent\s+Rs\.?[^a-z]+to\s+([^.\n]+?)(?:\s+on|\s+Ref|\s+UPI|@)/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);
    return super.extractMerchant(message, sender);
  }
}
