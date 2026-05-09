import { BaseIndianBankParser } from "../BaseIndianBankParser.js";

export class AxisBankParser extends BaseIndianBankParser {
  getBankName() { return "Axis Bank"; }

  canHandle(sender) {
    const s = (sender || "").toUpperCase();
    return s.includes("AXISBK") ||
      s.includes("AXIS") ||
      /^[A-Z]{2}-AXISBK.*$/.test(s);
  }

  extractMerchant(message, sender) {
    // "for txn at MERCHANT on 12-05-26"
    let m = message.match(/(?:txn|transaction)\s+at\s+([^.\n]+?)\s+on\s+\d{2}/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    // "UPI/john@ybl/..."
    m = message.match(/UPI\/([^/@\s]+?)(?:@|\/)/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    return super.extractMerchant(message, sender);
  }
}
