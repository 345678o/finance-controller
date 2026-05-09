import { BaseIndianBankParser } from "../BaseIndianBankParser.js";

export class HDFCBankParser extends BaseIndianBankParser {
  getBankName() { return "HDFC Bank"; }

  canHandle(sender) {
    const s = (sender || "").toUpperCase();
    return s.includes("HDFCBK") ||
      s.includes("HDFC") ||
      /^[A-Z]{2}-HDFCBK.*$/.test(s) ||
      /^[A-Z]{2}-HDFC.*$/.test(s) ||
      /^HDFC-[A-Z]+$/.test(s) ||
      /^[A-Z]{2}-HDFCB.*$/.test(s);
  }

  extractMerchant(message, sender) {
    // VPA with name in parens: "VPA john@ybl (John Doe)"
    let m = message.match(/VPA\s+[^@\s]+@[^\s]+\s*\(([^)]+)\)/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    // VPA without name: "VPA john@ybl"
    m = message.match(/VPA\s+([^@\s]+)@/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    // "Info: UPI/john/blah"
    m = message.match(/Info:\s*(?:UPI\/)?([^/.\n]+?)(?:\/|$)/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    // Card spending: "at MERCHANT on 12/05/26"
    m = message.match(/at\s+([^.\n]+?)\s+on\s+\d{2}/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    // E-mandate: "To MERCHANT\n12/05/26"
    m = message.match(/To\s+([^\n]+?)\s*(?:\n|\d{2}\/\d{2})/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);

    return super.extractMerchant(message, sender);
  }

  extractAccountLast4(message) {
    let m = message.match(/deposited\s+in\s+(?:HDFC\s+Bank\s+)?A\/c\s+(?:XX+)?(\d{3,6})/i);
    if (m) return m[1].slice(-4);
    m = message.match(/from\s+(?:HDFC\s+Bank\s+)?A\/c\s+(?:XX+)?(\d{3,6})/i);
    if (m) return m[1].slice(-4);
    m = message.match(/HDFC\s+Bank\s+A\/c\s+(\d{3,6})/i);
    if (m) return m[1].slice(-4);
    m = message.match(/A\/c\s+(?:XX+)(\d{3,4})/i);
    if (m) return m[1].slice(-4);
    return super.extractAccountLast4(message);
  }
}
