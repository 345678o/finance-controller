// ── Greeting ──────────────────────────────────────────────────────────
export const greetingFor = (date = new Date()) => {
  const h = date.getHours();
  if (h < 5)  return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Wind down";
};

// ── Aura state ────────────────────────────────────────────────────────
// Maps a numeric Aura Score (0–100) to a state used across the dashboard.
export const auraStateFor = (score) => {
  if (score >= 70) {
    return {
      key: "stable",
      label: "Stable",
      verb: "stable spending",
      hex: "#00ffae",
      hexSoft: "rgba(0,255,174,0.55)",
      textShadow: "0 0 24px rgba(0,255,174,0.45)",
      ringClass: "ring-neon-green/60",
      glowClass: "shadow-glow-green",
    };
  }
  if (score >= 45) {
    return {
      key: "focused",
      label: "Focused",
      verb: "watchful flow",
      hex: "#00e5ff",
      hexSoft: "rgba(0,229,255,0.55)",
      textShadow: "0 0 24px rgba(0,229,255,0.45)",
      ringClass: "ring-neon-cyan/60",
      glowClass: "shadow-glow-cyan",
    };
  }
  return {
    key: "risk",
    label: "Risk Zone",
    verb: "emotional spend",
    hex: "#ff2d92",
    hexSoft: "rgba(255,45,146,0.55)",
    textShadow: "0 0 24px rgba(255,45,146,0.45)",
    ringClass: "ring-neon-pink/60",
    glowClass: "shadow-glow-pink",
  };
};

// ── Time helpers ──────────────────────────────────────────────────────
const startOfMonth = (d = new Date()) => {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
};

const startOfWeek = (d = new Date()) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const isThisMonth = (iso) => new Date(iso) >= startOfMonth();
export const isThisWeek  = (iso) => new Date(iso) >= startOfWeek();

// ── Aggregations ──────────────────────────────────────────────────────
export const sumBy = (arr, fn) => arr.reduce((acc, x) => acc + (fn(x) || 0), 0);

export const groupSpendByCategory = (txns) => {
  const map = new Map();
  for (const t of txns) {
    map.set(t.category, (map.get(t.category) || 0) + (t.amount || 0));
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

// "Invisible" spend = small daily drains that add up: subscriptions + cafés + late-night food.
export const computeInvisibleSpend = (txns) => {
  const week = txns.filter((t) => isThisWeek(t.timestamp));
  const isLateNight = (t) => {
    const h = new Date(t.timestamp).getHours();
    return (h >= 22 || h < 4) && (t.category === "Food" || t.category === "Cafes");
  };
  const subscriptions = sumBy(
    week.filter((t) => t.category === "Subscriptions"),
    (t) => t.amount,
  );
  const cafes = sumBy(week.filter((t) => t.category === "Cafes"), (t) => t.amount);
  const lateNight = sumBy(week.filter(isLateNight), (t) => t.amount);
  const microBuys = sumBy(week.filter((t) => t.amount <= 250), (t) => t.amount);
  const total = subscriptions + cafes + lateNight + Math.round(microBuys * 0.4);
  return {
    total,
    breakdown: [
      { label: "Subscriptions",   amount: subscriptions },
      { label: "Café drip",       amount: cafes },
      { label: "Late-night food", amount: lateNight },
      { label: "Micro-buys",      amount: Math.round(microBuys * 0.4) },
    ].filter((b) => b.amount > 0),
  };
};

// Pretty timestamp like "2:14 pm"
export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

// "Today", "Yesterday", "Mon"
export const formatDay = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((today - d) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short" });
};
