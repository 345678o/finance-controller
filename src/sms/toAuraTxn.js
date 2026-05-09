import { roundUp } from "@/utils/format";
import { TxnType } from "./BankParser.js";

/**
 * Map merchant fragment → AuraLoop category.
 * Order matters: more-specific patterns first.
 */
const CATEGORY_RULES = [
  { match: /swiggy|zomato|kfc|mcdonald|domino|pizza|biryani/i, cat: "Food" },
  { match: /blinkit|zepto|bigbasket|grofers|dmart|reliance fresh/i, cat: "Groceries" },
  { match: /uber|ola|rapido|namma yatri|metro/i, cat: "Transport" },
  { match: /irctc|makemytrip|goibibo|airbnb|cleartrip|easemytrip|indigo|spicejet|vistara|akasa/i, cat: "Travel" },
  { match: /myntra|ajio|amazon|flipkart|meesho|nykaa fashion|tata cliq/i, cat: "Shopping" },
  { match: /nykaa|sephora|forest essentials|kama ayurveda/i, cat: "Beauty" },
  { match: /netflix|spotify|youtube|prime|hotstar|sony liv|zee5|apple music|jiosaavn/i, cat: "Subscriptions" },
  { match: /starbucks|blue tokai|third wave|chaayos|chai point|cafe|coffee/i, cat: "Cafes" },
  { match: /bookmyshow|pvr|inox|cinemax|paytm insider/i, cat: "Entertainment" },
  { match: /decathlon|cult\.?fit|gym|yoga/i, cat: "Fitness" },
  { match: /petrol|hp\b|iocl|bpcl|reliance petrol|shell|fuel/i, cat: "Fuel" },
  { match: /electricity|water|gas bill|broadband|airtel|jio|vi\b|bsnl|recharge/i, cat: "Utilities" },
  { match: /hospital|pharmacy|apollo|medplus|1mg|pharmeasy|tata 1mg/i, cat: "Health" },
];

export function guessCategory(merchant) {
  if (!merchant) return "Other";
  for (const rule of CATEGORY_RULES) if (rule.match.test(merchant)) return rule.cat;
  return "Other";
}

function paymentMethodFor(parsed) {
  if (parsed.isFromCard) return "Card";
  if (/upi|@/i.test(parsed.smsBody)) return "UPI";
  return "Wallet";
}

function vibeFor(parsed) {
  const h = new Date(parsed.timestamp).getHours();
  if (h >= 22 || h < 4) return "burn";
  if (parsed.amount >= 1000) return "spark";
  if (parsed.amount >= 250) return "flow";
  return "calm";
}

/**
 * Convert a ParsedTransaction (from the bank parser) into an AuraLoop transaction.
 * Returns null for non-expense types (income/investment/credit-payment) so we
 * don't pollute the round-up loop with credits.
 */
export function toAuraTxn(parsed, idx = 0) {
  if (parsed.type !== TxnType.EXPENSE && parsed.type !== TxnType.CREDIT) return null;

  const merchant = parsed.merchant || parsed.bankName || "Unknown";
  const amount = Math.round(parsed.amount * 100) / 100;
  const savedAmount = roundUp(amount, 10);

  return {
    id: `sms_${parsed.timestamp}_${idx}`,
    merchant,
    category: guessCategory(merchant),
    amount,
    currency: parsed.currency || "INR",
    timestamp: new Date(parsed.timestamp).toISOString(),
    paymentMethod: paymentMethodFor(parsed),
    vibe: vibeFor(parsed),
    roundedUp: true,
    savedAmount,
    note: parsed.bankName,
    source: "sms",
  };
}
