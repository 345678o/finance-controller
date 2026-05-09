import { BankParser } from "./BankParser.js";

/**
 * Indian-bank base — INR currency + investment-keyword detection.
 * Most Indian banks should extend this.
 */
export class BaseIndianBankParser extends BankParser {
  getCurrency() {
    return "INR";
  }
}
