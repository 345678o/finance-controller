import { BaseIndianBankParser } from "../BaseIndianBankParser.js";
import { TxnType } from "../BankParser.js";

export class SBIBankParser extends BaseIndianBankParser {
  getBankName() { return "State Bank of India"; }

  canHandle(sender) {
    const s = (sender || "").toUpperCase();
    return s.includes("SBI") ||
      s.includes("SBIINB") ||
      s.includes("SBIUPI") ||
      s.includes("SBICRD") ||
      s.includes("ATMSBI") ||
      s === "SBIBK" ||
      s === "SBIBNK" ||
      s.includes("SBI CARDS") ||
      /^[A-Z]{2}-SBIBK-S$/.test(s) ||
      /^[A-Z]{2}-SBIBK-[TPG]$/.test(s) ||
      /^[A-Z]{2}-SBIBK$/.test(s) ||
      /^[A-Z]{2}-SBI$/.test(s);
  }

  parse(smsBody, sender, timestamp) {
    const normalized = smsBody.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
    const parsed = super.parse(normalized, sender, timestamp);
    if (!parsed) return null;

    if (this.#isCreditCard(sender, normalized)) {
      const cardLast4 = this.#extractCcLast4(normalized) || parsed.accountLast4;
      const limit = this.extractAvailableLimit(normalized) || parsed.creditLimit;
      const lower = normalized.toLowerCase();

      let type = TxnType.CREDIT;
      if (lower.includes("payment of") && lower.includes("credited to your sbi credit card"))
        type = TxnType.INCOME;

      let merchant = parsed.merchant;
      if (lower.includes("via bbps")) merchant = "BBPS Payment";
      else {
        const m = normalized.match(/at\s+([A-Za-z0-9\s&._-]+?)\s+on\s+\d/i);
        if (m && this.isValidMerchant(m[1])) merchant = this.cleanMerchant(m[1].trim());
      }

      return { ...parsed, accountLast4: cardLast4, type, merchant, creditLimit: limit, isFromCard: true };
    }
    return parsed;
  }

  #isCreditCard(sender, message) {
    const s = (sender || "").toUpperCase();
    return s.includes("SBICRD") || s.includes("SBI CARDS") || /credit\s+card/i.test(message);
  }

  #extractCcLast4(message) {
    let m = message.match(/ending\s+with\s+(\d{4})/i);
    if (m) return m[1];
    m = message.match(/ending\s+(\d{4})/i);
    return m ? m[1] : null;
  }

  extractAmount(message) {
    const patterns = [
      /transaction\s+number\s+\d+\s+for\s+Rs\.?\s*([0-9,]+(?:\.\d{2})?)/i,
      /payment\s+of\s+Rs\.?\s*([0-9,]+(?:\.\d{2})?)/i,
      /Rs\.?\s*([0-9,]+(?:\.\d{2})?)\s+spent/i,
      /debited\s+by\s+(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
      /credited\s+by\s+Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
      /Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:has\s+been\s+)?debited/i,
      /INR\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:has\s+been\s+)?debited/i,
      /Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:has\s+been\s+)?credited/i,
      /INR\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:has\s+been\s+)?credited/i,
      /withdrawn\s+Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /transferred\s+Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /paid\s+to\s+[\w.-]+@[\w]+\s+Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /ATM\s+withdrawal\s+of\s+Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /Yono\s+Cash\s+Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    ];
    for (const re of patterns) {
      const m = message.match(re);
      if (m) {
        const num = Number(m[1].replace(/,/g, ""));
        if (!Number.isNaN(num)) return num;
      }
    }
    return super.extractAmount(message);
  }

  extractTransactionType(message) {
    const lower = message.toLowerCase();
    if (lower.includes("withdrawn") || lower.includes("transferred") ||
        lower.includes("paid to") || lower.includes("atm withdrawal") ||
        lower.includes("by sbi debit card")) return TxnType.EXPENSE;
    return super.extractTransactionType(message);
  }

  extractMerchant(message, sender) {
    let m = message.match(/done\s+at\s+([^.\n]+?)(?:\s+on\s+|$)/i);
    if (m && this.isValidMerchant(m[1].trim())) return this.cleanMerchant(m[1].trim());
    m = message.match(/trf\s+to\s+([^.\n]+?)(?:\s+Ref|\s+ref|$)/i);
    if (m && this.isValidMerchant(m[1].trim())) return this.cleanMerchant(m[1].trim());
    m = message.match(/transfer\s+from\s+([^.\n]+?)(?:\s+Ref|\s+ref|$)/i);
    if (m && this.isValidMerchant(m[1].trim())) return this.cleanMerchant(m[1].trim());
    m = message.match(/paid\s+to\s+([\w.-]+)@[\w]+/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);
    m = message.match(/ATM\s+(?:withdrawal\s+)?(?:at\s+)?([^.\n]+?)(?:\s+on|\s+Avl)/i);
    if (m && this.isValidMerchant(m[1])) return `ATM - ${this.cleanMerchant(m[1])}`;
    m = message.match(/(?:NEFT|IMPS|RTGS)[^:]*:\s*([^.\n]+?)(?:\s+Ref|\s+on|$)/i);
    if (m && this.isValidMerchant(m[1])) return this.cleanMerchant(m[1]);
    return super.extractMerchant(message, sender);
  }
}
