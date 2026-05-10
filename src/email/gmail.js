import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { parseEmail } from "./index.js";

/**
 * Gmail API helper.
 *  - signIn() returns an access token for the gmail.readonly scope
 *  - fetchFamAppMessages(token) returns parsed FamApp transactions
 *
 * Web uses Google Identity Services (GIS) directly — modern, COOP-safe.
 * Native uses the codetrix-studio plugin which talks to the system flow.
 */

const CLIENT_ID =
  "168214481129-5r32bltirol79r05uhm8psl92k1a12au.apps.googleusercontent.com";
const SCOPES =
  "profile email https://www.googleapis.com/auth/gmail.readonly";

function isWeb() {
  return Capacitor.getPlatform() === "web";
}

function waitForGis(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function tick() {
      if (window.google?.accounts?.oauth2) return resolve();
      if (Date.now() - start > timeoutMs)
        return reject(new Error("Google Identity Services script didn't load"));
      setTimeout(tick, 80);
    })();
  });
}

async function signInWeb(log) {
  log("waiting for GIS…");
  await waitForGis();
  return new Promise((resolve, reject) => {
    log("requesting access token…");
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp?.error) {
          reject(new Error(resp.error_description || resp.error));
          return;
        }
        if (!resp?.access_token) {
          reject(new Error("no access_token in response"));
          return;
        }
        log(`token acquired (expires in ${resp.expires_in}s)`);
        resolve({ accessToken: resp.access_token, profile: null });
      },
      error_callback: (err) => {
        reject(new Error(err?.message || err?.type || "GIS error"));
      },
    });
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

async function signInNative(log) {
  await GoogleAuth.initialize({
    clientId: CLIENT_ID,
    scopes: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"],
    grantOfflineAccess: true,
  });
  log("calling GoogleAuth.signIn()…");
  const user = await GoogleAuth.signIn();
  log(`signed in as ${user?.email || "?"}`);
  const accessToken =
    user?.authentication?.accessToken || user?.accessToken || null;
  if (!accessToken) {
    throw new Error("Sign-in succeeded but no access token returned");
  }
  return { accessToken, profile: user };
}

/**
 * Trigger the Google sign-in flow. Returns { accessToken, profile }.
 */
export async function signIn(log = () => {}) {
  return isWeb() ? signInWeb(log) : signInNative(log);
}

export async function signOut() {
  if (isWeb()) return; // GIS tokens are short-lived; no global sign-out needed.
  try { await GoogleAuth.signOut(); } catch {}
}

/**
 * Fetch + parse FamApp transaction emails.
 *
 * @param  {string}   accessToken  Bearer token from signIn()
 * @param  {object}   opts
 * @param  {number}   opts.maxCount  cap on messages to fetch (default 50)
 * @param  {function} opts.log       diagnostic logger
 * @returns {Promise<{transactions: Array, stats: object}>}
 */
export async function fetchFamAppMessages(accessToken, { maxCount = 50, log = () => {} } = {}) {
  const auth = { Authorization: `Bearer ${accessToken}` };
  const query = encodeURIComponent("from:(no-reply@famapp.in OR no-reply@fampay.in OR noreply@fampay.in)");
  log("listing message IDs…");

  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=${maxCount}`;
  const listRes = await fetch(listUrl, { headers: auth });
  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(`Gmail list failed (${listRes.status}): ${text.slice(0, 200)}`);
  }
  const listJson = await listRes.json();
  const ids = (listJson.messages || []).map((m) => m.id);
  log(`found ${ids.length} matching messages`);

  // Fetch each message in parallel — Gmail is happy with this for <100 calls.
  const results = await Promise.all(
    ids.map(async (id) => {
      const r = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        { headers: auth },
      );
      if (!r.ok) return null;
      return r.json();
    }),
  );

  const transactions = [];
  let parsedOk = 0;
  for (const msg of results) {
    if (!msg) continue;
    const headers = msg.payload?.headers || [];
    const get = (name) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
    const from = get("From");
    const subject = get("Subject");
    const ts = Number(msg.internalDate || Date.now());
    const body = extractBody(msg.payload);

    const parsed = parseEmail({ from, subject, body, timestamp: ts });
    if (parsed) {
      parsedOk++;
      transactions.push(parsed);
    }
  }
  log(`parsed ${parsedOk}/${results.length} messages successfully`);

  // Dedupe + sort newest first
  const seen = new Set();
  const deduped = transactions
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((t) => {
      const key = `${t.timestamp}|${t.amount}|${t.merchant || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return {
    transactions: deduped,
    stats: { listed: ids.length, parsed: parsedOk, unique: deduped.length },
  };
}

/**
 * Walk a Gmail payload tree and return the best plain-text body we can find.
 * Falls back to text/html with stripping in the email parser.
 */
function extractBody(part) {
  if (!part) return "";
  const mime = part.mimeType || "";
  if (part.body?.data) {
    const decoded = decodeBase64Url(part.body.data);
    return decoded;
  }
  if (Array.isArray(part.parts) && part.parts.length) {
    // Prefer text/plain → text/html → first
    const plain = part.parts.find((p) => p.mimeType === "text/plain");
    const html = part.parts.find((p) => p.mimeType === "text/html");
    return extractBody(plain || html || part.parts[0]);
  }
  return "";
}

function decodeBase64Url(data) {
  try {
    const padded = data.replace(/-/g, "+").replace(/_/g, "/");
    if (typeof atob === "function") {
      const bin = atob(padded);
      // Decode as UTF-8
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder("utf-8").decode(bytes);
    }
    return Buffer.from(padded, "base64").toString("utf-8");
  } catch (e) {
    return "";
  }
}
