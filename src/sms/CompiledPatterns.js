/**
 * Shared regex patterns for SMS parsing.
 * Ported from PennyWise (MIT) — github.com/sarim2000/pennywiseai-tracker.
 * Kotlin Regex → JS RegExp with the `i` flag where the original used IGNORE_CASE.
 */

const Amount = {
  // Order: INR first (less likely to appear in "Avl Bal Rs.X"), then ₹, then Rs.
  // Allow "Rs.X", "Rs X", "Rs:X" — Union Bank and others use the colon variant.
  INR: /INR[.:\s]*([0-9,]+(?:\.\d{2})?)/i,
  RUPEE: /₹\s*([0-9,]+(?:\.\d{2})?)/,
  RS: /Rs[.:\s]*([0-9,]+(?:\.\d{2})?)/i,
};
Amount.ALL = [Amount.INR, Amount.RUPEE, Amount.RS];

const Reference = {
  GENERIC: /(?:Ref|Reference|Txn|Transaction)(?:\s+No)?[:\s]+([A-Z0-9]+)/i,
  UPI: /UPI[:\s]+([0-9]+)/i,
  REF_NUMBER: /Reference\s+Number[:\s]+([A-Z0-9]+)/i,
};
Reference.ALL = [Reference.GENERIC, Reference.UPI, Reference.REF_NUMBER];

const Account = {
  AC_WITH_MASK: /(?:A\/c|Account|Acct)(?:\s+No)?\.?\s+(\S+)/i,
  CARD_WITH_MASK: /Card\s+(\S+)/i,
  ENDING: /(?:ending|ends with|ending with)\s+(\d{4})/i,
  AC_NO_SLASH: /(?<![/])AC\s+(\S+)/i,
  DEBIT_CREDIT_CARD: /(?:debit|credit)\s+card\s+(\S+)/i,
  YOUR_ACCOUNT: /Your\s+(?:a\/c|account|acct|card|#)\s*(\S+)/i,
  LINKED_ACCOUNT: /linked\s+(?:a\/c|account|acct)\s+(\S+)/i,
};
Account.ALL = [
  Account.AC_WITH_MASK,
  Account.CARD_WITH_MASK,
  Account.ENDING,
  Account.AC_NO_SLASH,
  Account.DEBIT_CREDIT_CARD,
  Account.YOUR_ACCOUNT,
  Account.LINKED_ACCOUNT,
];

const Balance = {
  AVL_RS:
    /(?:Bal|Balance|Avl Bal|Available Balance)[:\s]+Rs[.:\s]*([0-9,]+(?:\.\d{2})?)/i,
  AVL_INR:
    /(?:Bal|Balance|Avl Bal|Available Balance)[:\s]+INR[.:\s]*([0-9,]+(?:\.\d{2})?)/i,
  AVL_RUPEE:
    /(?:Bal|Balance|Avl Bal|Available Balance)[:\s]+₹\s*([0-9,]+(?:\.\d{2})?)/i,
  AVL_NO_CCY:
    /(?:Bal|Balance|Avl Bal|Available Balance)[:\s]+([0-9,]+(?:\.\d{2})?)/i,
  UPDATED_RS:
    /(?:Updated Balance|Remaining Balance)[:\s]+Rs[.:\s]*([0-9,]+(?:\.\d{2})?)/i,
  UPDATED_INR:
    /(?:Updated Balance|Remaining Balance)[:\s]+INR[.:\s]*([0-9,]+(?:\.\d{2})?)/i,
};
Balance.ALL = [
  Balance.AVL_RS,
  Balance.AVL_INR,
  Balance.AVL_RUPEE,
  Balance.AVL_NO_CCY,
  Balance.UPDATED_RS,
  Balance.UPDATED_INR,
];

const Merchant = {
  TO: /to\s+([^.\n]+?)(?:\s+on|\s+at|\s+Ref|\s+UPI)/i,
  FOR: /for\s+([A-Za-z0-9 &._-]+?)(?:\.|\s+on|\s+at|\s+Ref|\s+Avl|\s+UPI|$)/i,
  AT: /at\s+([A-Za-z0-9 &._-]+?)(?:\.|\s+on|\s+Ref|\s+Avl|\s+UPI|$)/i,
  FROM: /from\s+([^.\n]+?)(?:\s+on|\s+at|\s+Ref|\s+UPI)/i,
};
// Order matters: TO/FOR/AT capture merchant; FROM is last because it often captures account.
Merchant.ALL = [Merchant.TO, Merchant.FOR, Merchant.AT, Merchant.FROM];

const Cleaning = {
  TRAILING_PARENS: /\s*\(.*?\)\s*$/,
  REF_SUFFIX: /\s+Ref\s+No.*/i,
  DATE_SUFFIX: /\s+on\s+\d{2}.*/,
  UPI_SUFFIX: /\s+UPI.*/i,
  TIME_SUFFIX: /\s+at\s+\d{2}:\d{2}.*/,
  TRAILING_DASH: /\s*-\s*$/,
  PVT_LTD: /(\s+PVT\.?\s*LTD\.?|\s+PRIVATE\s+LIMITED)$/i,
  LTD: /(\s+LTD\.?|\s+LIMITED)$/i,
};

export { Amount, Reference, Account, Balance, Merchant, Cleaning };
