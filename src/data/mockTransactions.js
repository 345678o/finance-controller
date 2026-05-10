import { roundUp } from "@/utils/format";

const MERCHANTS = [
  { name: "Swiggy",       category: "Food",          range: [120, 620] },
  { name: "Zomato",       category: "Food",          range: [180, 740] },
  { name: "Blinkit",      category: "Groceries",     range: [90,  1450] },
  { name: "Zepto",        category: "Groceries",     range: [80,  980] },
  { name: "BigBasket",    category: "Groceries",     range: [220, 1850] },
  { name: "Uber",         category: "Transport",     range: [55,  480] },
  { name: "Ola",          category: "Transport",     range: [60,  390] },
  { name: "Rapido",       category: "Transport",     range: [35,  180] },
  { name: "Myntra",       category: "Shopping",      range: [499, 3499] },
  { name: "Ajio",         category: "Shopping",      range: [399, 2999] },
  { name: "Nykaa",        category: "Beauty",        range: [299, 1899] },
  { name: "Amazon",       category: "Shopping",      range: [199, 4499] },
  { name: "Flipkart",     category: "Shopping",      range: [249, 5999] },
  { name: "Spotify",      category: "Subscriptions", range: [119, 119] },
  { name: "Netflix",      category: "Subscriptions", range: [199, 649] },
  { name: "YouTube Premium", category: "Subscriptions", range: [129, 189] },
  { name: "Apple Music",  category: "Subscriptions", range: [99,  99] },
  { name: "Starbucks",    category: "Cafes",         range: [220, 540] },
  { name: "Blue Tokai",   category: "Cafes",         range: [240, 480] },
  { name: "Third Wave",   category: "Cafes",         range: [180, 420] },
  { name: "Chai Point",   category: "Cafes",         range: [60,  220] },
  { name: "BookMyShow",   category: "Entertainment", range: [180, 980] },
  { name: "PVR INOX",     category: "Entertainment", range: [220, 720] },
  { name: "Decathlon",    category: "Fitness",       range: [299, 2999] },
  { name: "cult.fit",     category: "Fitness",       range: [499, 1999] },
  { name: "IRCTC",        category: "Travel",        range: [350, 2400] },
  { name: "MakeMyTrip",   category: "Travel",        range: [1200, 8400] },
  { name: "Airbnb",       category: "Travel",        range: [1800, 6500] },
  { name: "Petrol Pump",  category: "Fuel",          range: [200, 1500] },
];

const VIBES = ["calm", "flow", "spark", "burn"];
const PAYMENT_METHODS = ["UPI", "Card", "Wallet"];

// deterministic-ish RNG so the demo feels stable across reloads in dev
const seeded = (() => {
  let s = 1337;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
})();

const pick = (arr) => arr[Math.floor(seeded() * arr.length)];
const randIn = ([min, max]) => Math.round(min + seeded() * (max - min));

const buildTimestamp = (daysBack, hour) => {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(hour, Math.floor(seeded() * 60), 0, 0);
  return d.toISOString();
};

/* Skewed time distribution — most txns in the last 30 days (recency bias),
   with thinner tails reaching back 365 days so the Insights "Year" tab and
   the AR scanner's 90-day dynamic scenarios both have data to chew on. */
function pickDaysBack() {
  const r = seeded();
  if (r < 0.35) return Math.floor(seeded() * 7);          // last week (35%)
  if (r < 0.65) return Math.floor(seeded() * 30);         // last month (30%)
  if (r < 0.85) return 30 + Math.floor(seeded() * 60);    // 30-90 days (20%)
  return 90 + Math.floor(seeded() * 275);                 // 90-365 days (15%)
}

/* A handful of late-night Food/Cafe txns so InvisibleSpend has meaningful
   "Late-night food" detection in the Insights card. */
function nightHour() {
  const r = seeded();
  if (r < 0.25) return 22 + Math.floor(seeded() * 4);     // 22:00 - 01:59 (25%)
  return 8 + Math.floor(seeded() * 14);                   // 8:00 - 21:59 (75%)
}

const generate = (count = 120) => {
  const txns = [];
  for (let i = 0; i < count; i++) {
    const m = pick(MERCHANTS);
    const amount = randIn(m.range);
    const savedAmount = roundUp(amount, 10);
    const daysBack = pickDaysBack();
    const hour = nightHour();
    /* Mark ~20% as SMS-imported so they survive the migration that strips
       generic demo data — gives the import surfaces a populated baseline. */
    const fromSms = seeded() < 0.2;
    txns.push({
      id: `txn_${Date.now().toString(36)}_${i}`,
      merchant: m.name,
      category: m.category,
      amount,
      currency: "INR",
      timestamp: buildTimestamp(daysBack, hour),
      paymentMethod: pick(PAYMENT_METHODS),
      vibe: pick(VIBES),
      roundedUp: true,
      savedAmount,
      note: null,
      ...(fromSms ? { source: "sms" } : {}),
    });
  }
  return txns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/* A few withdrawal-style transactions so the demo shows what "Spent it"
   looks like in the activity feed, the spend deltas, and the meme rotation. */
const buildWithdrawals = () => {
  const now = Date.now();
  return [
    {
      id: "txn_wd_demo_1",
      merchant: "Starbucks",
      category: "Cafes",
      amount: 480,
      currency: "INR",
      timestamp: new Date(now - 2 * 86400000).toISOString(),
      paymentMethod: "Jar",
      vibe: "burn",
      roundedUp: false,
      savedAmount: 0,
      jarId: "jar_goa",
      withdrawal: true,
      note: "from Goa Trip",
    },
    {
      id: "txn_wd_demo_2",
      merchant: "Blinkit",
      category: "Groceries",
      amount: 720,
      currency: "INR",
      timestamp: new Date(now - 5 * 86400000).toISOString(),
      paymentMethod: "Jar",
      vibe: "burn",
      roundedUp: false,
      savedAmount: 0,
      jarId: "jar_emergency",
      withdrawal: true,
      note: "from Emergency Fund",
    },
    {
      id: "txn_wd_demo_3",
      merchant: "MakeMyTrip",
      category: "Travel",
      amount: 1850,
      currency: "INR",
      timestamp: new Date(now - 9 * 86400000).toISOString(),
      paymentMethod: "Jar",
      vibe: "burn",
      roundedUp: false,
      savedAmount: 0,
      jarId: "jar_macbook",
      withdrawal: true,
      note: "from MacBook Fund",
    },
  ];
};

export const mockTransactions = [...buildWithdrawals(), ...generate(120)]
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

export const mockJars = [
  {
    id: "jar_goa",
    name: "Goa Trip",
    emoji: "🌴",
    iconKey: "palm",
    target: 40000,
    saved: 18420,
    color: "#22C55E",
    monthsLeft: 2,
  },
  {
    id: "jar_macbook",
    name: "MacBook Fund",
    emoji: "💻",
    iconKey: "laptop",
    target: 120000,
    saved: 52800,
    color: "#EC4899",
    monthsLeft: 5,
  },
  {
    id: "jar_emergency",
    name: "Emergency Fund",
    emoji: "🛡️",
    iconKey: "shield",
    target: 50000,
    saved: 25600,
    color: "#06B6D4",
    monthsLeft: 3,
  },
  {
    id: "jar_bike",
    name: "Bike Upgrade",
    emoji: "🏍️",
    iconKey: "bike",
    target: 35000,
    saved: 12750,
    color: "#A855F7",
    monthsLeft: 4,
  },
  /* Funded jar — surfaces the "✓ Funded" pill, confetti burst, and the
     locked-out state on the goal card. */
  {
    id: "jar_concert",
    name: "Concert Tickets",
    emoji: "🎟️",
    iconKey: "ticket",
    target: 8000,
    saved: 8000,
    color: "#F59E0B",
    monthsLeft: 0,
  },
  /* Brand-new low-progress jar — shows the early-stage empty visual. */
  {
    id: "jar_tokyo",
    name: "Tokyo Trip",
    emoji: "🗼",
    iconKey: "star",
    target: 180000,
    saved: 4200,
    color: "#06B6D4",
    monthsLeft: 14,
  },
];

/* Pre-linked UPI for the demo so the Profile/Settings flows show the
   linked-app summary, autoDebit toggle, and "On" pill out of the box. */
export const mockUpi = {
  linked: true,
  appId: "gpay",
  vpa: "anamika@oksbi",
  autoDebit: true,
  syncTxns: true,
  linkedAt: Date.now() - 7 * 86400000,
};

/* Demo profile so the avatar, name, and email are populated everywhere. */
export const mockProfile = {
  displayName: "Anamika",
  handle: "anamika.aura",
  email: "anamika@auraloop.app",
  avatarEmoji: "🌅",
  avatarImage: null,
  joinedAt: Date.now() - 30 * 86400000,
};

/* Richer insight feed for the bell dropdown. */
export const mockInsights = [
  {
    id: "ins_concert_funded",
    title: "Concert Tickets jar is funded 🎉",
    body: "8000 / 8000 — go book those tickets, future-you said yes.",
    severity: "good",
  },
  {
    id: "ins_food_spike",
    title: "Food spend spiked 32% this week",
    body: "Late-night Swiggy orders are quietly running the show.",
    severity: "warn",
  },
  {
    id: "ins_streak",
    title: "You round-up saved 7 days in a row",
    body: "That's ₹248 in invisible savings. Keep the loop going.",
    severity: "good",
  },
];

/* Demo settings — exercises every toggle so the Settings page isn't all
   default. Round-up bumped to 20 (above the default 10), one notification
   off, exclude-subscriptions on so the toggle visibly varies. */
export const mockSettings = {
  roundUpStep: 20,
  autoSave: true,
  notifyDailyDigest: true,
  notifyInvisibleSpend: true,
  notifyJarMilestones: true,
  excludeSubscriptions: true,
};

/* Pre-computed weekly story for the Wrapped page so it shows a baseline
   recap even before the user imports anything fresh. The page recomputes
   from live transactions when present, but this gives it a stored fallback. */
export const mockWrapped = {
  generatedAt: Date.now(),
  topCategory: "Food",
  topMerchant: "Swiggy",
  totalSpent: 18420,
  totalSaved: 1247,
  vibe: "spark",
};
