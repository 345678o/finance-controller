import { HDFCBankParser } from "./banks/HDFCBankParser.js";
import { SBIBankParser } from "./banks/SBIBankParser.js";
import { ICICIBankParser } from "./banks/ICICIBankParser.js";
import { AxisBankParser } from "./banks/AxisBankParser.js";
import { KotakBankParser } from "./banks/KotakBankParser.js";
import { BaseIndianBankParser } from "./BaseIndianBankParser.js";

class GenericIndianBankParser extends BaseIndianBankParser {
  getBankName() { return "Other / Generic Indian Bank"; }
  canHandle() { return true; }
}

const PARSERS = [
  new HDFCBankParser(),
  new SBIBankParser(),
  new ICICIBankParser(),
  new AxisBankParser(),
  new KotakBankParser(),
];

const FALLBACK = new GenericIndianBankParser();

export function getParser(sender) {
  return PARSERS.find((p) => p.canHandle(sender)) || null;
}

export function getAllParsers() {
  return PARSERS;
}

/**
 * Try the bank-specific parser; if none matches, try the generic fallback.
 * Returns null if message can't be parsed at all.
 */
export function parseSms(smsBody, sender, timestamp) {
  const parser = getParser(sender) || FALLBACK;
  return parser.parse(smsBody, sender, timestamp);
}
