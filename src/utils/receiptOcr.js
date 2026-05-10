/* Receipt OCR — captures a frame from the live camera <video> and runs
   Tesseract on it. tesseract.js is dynamic-imported so the ~2MB worker
   bundle only downloads when the user actually taps "Scan receipt".

   Returns { amount, merchant, raw } on success, or throws.                */

const MAX_DIM = 960; // downscale before OCR for speed (≈3× faster on phones)

/** Snap the current video frame onto a canvas, downscaled. */
export function captureVideoToCanvas(video) {
  if (!video || video.readyState < 2 || !video.videoWidth) {
    throw new Error("Camera isn't ready yet.");
  }
  const ratio = Math.min(1, MAX_DIM / Math.max(video.videoWidth, video.videoHeight));
  const w = Math.round(video.videoWidth * ratio);
  const h = Math.round(video.videoHeight * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);
  return canvas;
}

/** Pick the most-likely "total" from raw OCR text. Returns a number. */
export function parseAmount(text) {
  if (!text) return null;
  const lines = text.split(/\n+/);

  // 1. Strong signal — labelled totals come first.
  const labelRegex =
    /(?:^|[\s:])(?:grand\s*total|total\s*amount|total|amount|net|payable|balance|sub[-\s]?total|to\s*pay|due)[\s:.\-₹rs.inr]*([\d,]+(?:\.\d{1,2})?)/i;
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(labelRegex);
    if (m) {
      const n = Number(m[1].replace(/,/g, ""));
      if (Number.isFinite(n) && n > 0) return n;
    }
  }

  // 2. Currency-prefixed numbers (₹, Rs, INR).
  const currencyMatches = [
    ...text.matchAll(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/gi),
  ]
    .map((m) => Number(m[1].replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (currencyMatches.length) {
    return Math.max(...currencyMatches);
  }

  // 3. Last-resort — biggest plausible decimal in the text.
  const allNumbers = [...text.matchAll(/(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/g)]
    .map((m) => Number(m[1].replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n >= 5 && n <= 1_000_000);
  if (allNumbers.length) {
    return Math.max(...allNumbers);
  }

  return null;
}

/** Pick a likely merchant name — usually one of the first non-empty lines. */
export function parseMerchant(text) {
  if (!text) return null;
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  // Skip lines that look like dates, amounts, or all-numeric.
  const skip = /^(?:date|time|bill|invoice|receipt|gst|tin|cin|address|tel|phone|order|table)\b/i;
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const l = lines[i];
    if (l.length < 3 || l.length > 40) continue;
    if (skip.test(l)) continue;
    if (/^\d/.test(l) && !/[a-z]/i.test(l)) continue;
    if (!/[a-z]/i.test(l)) continue;
    // Title-case it lightly so SHOUTY RECEIPTS read clean.
    return l
      .replace(/[^\w\s&.'-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .slice(0, 4)
      .map((w) =>
        w.length > 2
          ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
          : w.toUpperCase(),
      )
      .join(" ");
  }
  return null;
}

/** Run Tesseract on a canvas. `onProgress` receives 0..1.
    Returns { amount, merchant, raw }. */
export async function runReceiptOcr(canvas, onProgress = () => {}) {
  // Dynamic import keeps tesseract out of the main bundle.
  const Tesseract = await import("tesseract.js");
  const { data } = await Tesseract.recognize(canvas, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress(m.progress);
      }
    },
  });
  const raw = data?.text || "";
  const amount = parseAmount(raw);
  const merchant = parseMerchant(raw);
  if (!amount) {
    const err = new Error("No amount found on the receipt.");
    err.raw = raw;
    throw err;
  }
  return { amount, merchant, raw };
}
