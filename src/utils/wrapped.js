// Wrapped helpers — week story + light brand color map for the merchant tile.

const startOfWeek = (d = new Date()) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};

const startOfYear = (d = new Date()) => {
  const x = new Date(d);
  x.setMonth(0, 1);
  x.setHours(0, 0, 0, 0);
  return x;
};

// ── Year recap (kept around for any other surface that may need it) ──────
export const computeWrapped = (transactions) => {
  const ytd = transactions.filter((t) => new Date(t.timestamp) >= startOfYear());
  const totalSaved = ytd.reduce((acc, t) => acc + (t.savedAmount || 0), 0);
  const totalSpent = ytd.reduce((acc, t) => acc + (t.amount || 0), 0);
  return { totalSaved, totalSpent, txnCount: ytd.length };
};

// ── This-week story used by the redesigned Wrapped page ─────────────────
export const computeWeeklyStory = (transactions, streak) => {
  const week = transactions.filter((t) => new Date(t.timestamp) >= startOfWeek());

  // Food + cafés spend
  const foodSpend = week
    .filter((t) => t.category === "Food" || t.category === "Cafes")
    .reduce((acc, t) => acc + t.amount, 0);

  // Total spend
  const totalSpend = week.reduce((acc, t) => acc + t.amount, 0);

  // Total round-up savings
  const totalSaved = week.reduce((acc, t) => acc + (t.savedAmount || 0), 0);

  // Most "dangerous" hour (highest spend volume)
  const hourBuckets = new Map();
  for (const t of week) {
    const h = new Date(t.timestamp).getHours();
    hourBuckets.set(h, (hourBuckets.get(h) || 0) + t.amount);
  }
  let dangerHour = 22;
  let dangerMinute = 48;
  if (hourBuckets.size) {
    const sorted = [...hourBuckets.entries()].sort((a, b) => b[1] - a[1]);
    dangerHour = sorted[0][0];
    // pick a representative minute from a transaction in that hour
    const rep = week.find((t) => new Date(t.timestamp).getHours() === dangerHour);
    if (rep) dangerMinute = new Date(rep.timestamp).getMinutes();
  }

  // Top merchant (by transaction count)
  const merchantCounts = new Map();
  for (const t of week) {
    merchantCounts.set(t.merchant, (merchantCounts.get(t.merchant) || 0) + 1);
  }
  const topMerchantEntry = [...merchantCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topMerchant = topMerchantEntry
    ? { name: topMerchantEntry[0], count: topMerchantEntry[1] }
    : { name: "—", count: 0 };

  // Impulse buys (Shopping + Beauty over ₹600)
  const impulseTxns = week.filter(
    (t) => (t.category === "Shopping" || t.category === "Beauty") && t.amount > 600,
  );
  const impulseSpend = impulseTxns.reduce((acc, t) => acc + t.amount, 0);
  const impulsePct = totalSpend ? Math.round((impulseSpend / totalSpend) * 100) : 0;

  return {
    foodSpend,
    totalSpend,
    totalSaved,
    dangerHour,
    dangerMinute,
    topMerchant,
    impulseSpend,
    impulsePct,
    streak,
  };
};

// 7-day daily round-up savings (oldest → newest) for the streak sparkline.
export const dailySavingsSeries = (transactions, days = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: days }, () => 0);
  for (const t of transactions) {
    const d = new Date(t.timestamp);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - d) / 86400000);
    const idx = days - 1 - diff;
    if (idx >= 0 && idx < days) buckets[idx] += t.savedAmount || 0;
  }
  return buckets;
};

// 12-hour formatter — returns parts so the period can be styled smaller.
export const format12h = (hour, minute) => {
  const period = hour >= 12 ? "PM" : "AM";
  let h12 = hour % 12;
  if (h12 === 0) h12 = 12;
  return { time: `${h12}:${String(minute).padStart(2, "0")}`, period };
};

// ── Merchant brand colors for the Top Merchant tile ──────────────────────
const MERCHANT_COLORS = {
  Swiggy:        { bg: "#FC8019", fg: "#FFFFFF" },
  Zomato:        { bg: "#E23744", fg: "#FFFFFF" },
  Uber:          { bg: "#0F0F0F", fg: "#FFFFFF" },
  Ola:           { bg: "#FFC42E", fg: "#0F172A" },
  Rapido:        { bg: "#F4D000", fg: "#0F172A" },
  Blinkit:       { bg: "#F8CB46", fg: "#0F172A" },
  Zepto:         { bg: "#7B3FE4", fg: "#FFFFFF" },
  BigBasket:     { bg: "#84B348", fg: "#FFFFFF" },
  Myntra:        { bg: "#FF3F6C", fg: "#FFFFFF" },
  Ajio:          { bg: "#0F172A", fg: "#FFFFFF" },
  Nykaa:         { bg: "#FC2779", fg: "#FFFFFF" },
  Amazon:        { bg: "#FF9900", fg: "#0F172A" },
  Flipkart:      { bg: "#2874F0", fg: "#FFFFFF" },
  Spotify:       { bg: "#1DB954", fg: "#FFFFFF" },
  Netflix:       { bg: "#E50914", fg: "#FFFFFF" },
  "YouTube Premium": { bg: "#FF0000", fg: "#FFFFFF" },
  "Apple Music": { bg: "#FA243C", fg: "#FFFFFF" },
  Starbucks:     { bg: "#006241", fg: "#FFFFFF" },
  "Blue Tokai":  { bg: "#1E3A5F", fg: "#FFFFFF" },
  "Third Wave":  { bg: "#6B4423", fg: "#FFFFFF" },
  "Chai Point":  { bg: "#D8472B", fg: "#FFFFFF" },
  BookMyShow:    { bg: "#C4242C", fg: "#FFFFFF" },
  "PVR INOX":    { bg: "#7A1B25", fg: "#FFFFFF" },
  Decathlon:     { bg: "#0082C3", fg: "#FFFFFF" },
  "cult.fit":    { bg: "#FFC100", fg: "#0F172A" },
  IRCTC:         { bg: "#F37021", fg: "#FFFFFF" },
  MakeMyTrip:    { bg: "#EB2026", fg: "#FFFFFF" },
  Airbnb:        { bg: "#FF5A5F", fg: "#FFFFFF" },
  "Petrol Pump": { bg: "#475569", fg: "#FFFFFF" },
};

export const merchantBrand = (name) =>
  MERCHANT_COLORS[name] || { bg: "#6366F1", fg: "#FFFFFF" };
