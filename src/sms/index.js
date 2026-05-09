import { Capacitor } from "@capacitor/core";
import { SMSInboxReader } from "capacitor-sms-inbox";
import { parseSms } from "./BankParserFactory.js";
export { parseSms } from "./BankParserFactory.js";
export { TxnType } from "./BankParser.js";

/* ──────────────────────────────────────────────────────────────────
   Static-imported capacitor-sms-inbox plugin. The plugin's
   `registerPlugin` handles native↔web branching internally, so a
   static import is safe in both builds. (We avoided dynamic import
   because the WebView cannot reliably fetch dynamic chunks from
   https://localhost/assets/…)
   ────────────────────────────────────────────────────────────────── */

const noop = () => {};

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

function getPlugin(log = noop) {
  if (!SMSInboxReader) throw new Error("SMSInboxReader not exported");
  log(`plugin ready (checkPermissions=${typeof SMSInboxReader.checkPermissions === "function"} ` +
      `requestPermissions=${typeof SMSInboxReader.requestPermissions === "function"} ` +
      `getSMSList=${typeof SMSInboxReader.getSMSList === "function"})`);
  return SMSInboxReader;
}

export function isAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

/**
 * Request READ_SMS permission. Returns true if granted.
 * @param log  optional (msg)=>void — used by UI to show progress
 */
export async function requestSmsPermission(log = noop) {
  if (!isAndroid()) return false;
  const plugin = getPlugin(log);
  if (!plugin) return false;

  // Try checkPermissions with timeout. If it hangs, skip and go to request.
  let status = null;
  try {
    log("plugin.checkPermissions()…");
    status = await withTimeout(plugin.checkPermissions(), 4000, "checkPermissions");
    log(`checkPermissions → ${JSON.stringify(status)}`);
  } catch (e) {
    log(`checkPermissions failed: ${e.message}`);
  }

  if (status?.sms === "granted") return true;

  // requestPermissions — this is what shows the system dialog.
  try {
    log("plugin.requestPermissions()… (system dialog should appear)");
    const ask = await withTimeout(plugin.requestPermissions(), 30000, "requestPermissions");
    log(`requestPermissions → ${JSON.stringify(ask)}`);
    return ask?.sms === "granted";
  } catch (e) {
    log(`requestPermissions failed: ${e.message}`);
    return false;
  }
}

/**
 * Read the SMS inbox and parse each message into a transaction.
 */
export async function scanInbox(opts = {}, log = noop) {
  const { maxCount = 500, sinceDays = 180 } = opts;
  if (!isAndroid()) return mockScan();

  const plugin = getPlugin(log);
  if (!plugin) throw new Error("SMS plugin failed to load");

  const minDate = Date.now() - sinceDays * 86400000;
  log(`getSMSList({maxCount:${maxCount}, sinceDays:${sinceDays}})…`);
  const res = await withTimeout(
    plugin.getSMSList({ filter: { maxCount, minDate } }),
    20000,
    "getSMSList",
  );
  const messages = res?.smsList || res?.messages || [];
  log(`getSMSList → ${messages.length} raw messages`);

  const parsed = [];
  for (const msg of messages) {
    const body = msg.body || "";
    const sender = msg.address || "";
    const ts = Number(msg.date || Date.now());
    if (!body || !sender) continue;
    const txn = parseSms(body, sender, ts);
    if (txn) parsed.push(txn);
  }
  log(`parsed → ${parsed.length} transactions matched`);

  // Newest first + dedupe by (timestamp + amount + merchant)
  const seen = new Set();
  return parsed
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((t) => {
      const key = `${t.timestamp}|${t.amount}|${t.merchant || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * Open the Android system app-settings page so the user can grant the
 * SMS permission manually if the in-app dialog won't appear.
 */
// Open-settings stub removed — Capacitor doesn't expose a clean API for it.

/* ── Web/dev mock — lets the UI flow be tested in-browser. ─────────── */
function mockScan() {
  const now = Date.now();
  return [
    parseSms("Sent Rs.149 from HDFC Bank A/c XX1234 to Swiggy@ybl on 09/05/26. Ref 123456789012", "JK-HDFCBK-S", now - 3600000),
    parseSms("Your A/c XX5678 debited by 245.00 on 08-05-26 trf to Zomato Ref no 987654321 -SBI", "VK-SBIBK-S", now - 7200000),
    parseSms("Rs.79 spent on ICICI Bank Card XX9090 on 07-MAY-26 at Blinkit. Avl Lmt Rs.49,921.00", "BP-ICICIB-S", now - 9000000),
    parseSms("INR 1250 debited from A/c XX2345 on 06-05-26 for Amazon. Avl Bal Rs.18432.50 -Axis Bank", "JD-AXISBK-S", now - 14400000),
    parseSms("Sent Rs.520 to john.doe@upi from Kotak A/c XX7799 on 05-05-26. Avl Bal Rs.12345.00", "AD-KOTAKB-S", now - 86400000),
  ].filter(Boolean);
}
