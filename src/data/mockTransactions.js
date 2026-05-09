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

const generate = (count = 60) => {
  const txns = [];
  for (let i = 0; i < count; i++) {
    const m = pick(MERCHANTS);
    const amount = randIn(m.range);
    const savedAmount = roundUp(amount, 10);
    const daysBack = Math.floor(seeded() * 45);
    const hour = 7 + Math.floor(seeded() * 16);
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
    });
  }
  return txns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const mockTransactions = generate(60);

export const mockJars = [
  { id: "jar_trip",    name: "Goa Trip",        emoji: "🏝️", target: 25000, saved: 8420,  color: "#00ffae" },
  { id: "jar_iphone",  name: "iPhone Upgrade",  emoji: "📱", target: 80000, saved: 12750, color: "#00e5ff" },
  { id: "jar_concert", name: "Coldplay Tickets", emoji: "🎤", target: 12000, saved: 11400, color: "#ff2d92" },
  { id: "jar_emergency", name: "Emergency Fund", emoji: "🛡️", target: 50000, saved: 6200,  color: "#8b5cf6" },
];
