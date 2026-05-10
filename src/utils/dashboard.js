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
// Stable = green, Risky = amber, Danger = red.
export const auraStateFor = (score) => {
  if (score >= 70) {
    return {
      key: "stable",
      label: "Stable",
      hex: "#22C55E",
      track: "#E2E8F0",
      chipClass: "chip-primary",
      caption: "Healthy spending patterns this week.",
    };
  }
  if (score >= 45) {
    return {
      key: "risky",
      label: "Risky",
      hex: "#F59E0B",
      track: "#E2E8F0",
      chipClass: "chip-warn",
      caption: "Watch impulse buys and late-night spend.",
    };
  }
  return {
    key: "danger",
    label: "Danger",
    hex: "#EF4444",
    track: "#E2E8F0",
    chipClass: "chip-danger",
    caption: "Heavy week — pause one category to reset.",
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

// Daily spend totals for the last `days` days (oldest → newest).
export const dailySpendSeries = (txns, days = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d, label: d.toLocaleDateString("en-IN", { weekday: "short" }), total: 0 };
  });
  for (const t of txns) {
    const d = new Date(t.timestamp);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - d) / 86400000);
    const idx = days - 1 - diff;
    if (idx >= 0 && idx < days) buckets[idx].total += t.amount;
  }
  return buckets;
};

// Spend totals for this week vs last week (Monday-based).
export const weekOverWeek = (txns) => {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monThis = new Date(now);
  monThis.setDate(now.getDate() - day);
  monThis.setHours(0, 0, 0, 0);
  const monLast = new Date(monThis);
  monLast.setDate(monThis.getDate() - 7);

  let thisWk = 0;
  let lastWk = 0;
  for (const t of txns) {
    const d = new Date(t.timestamp);
    if (d >= monThis) thisWk += t.amount;
    else if (d >= monLast) lastWk += t.amount;
  }
  const delta = lastWk ? Math.round(((thisWk - lastWk) / lastWk) * 100) : 0;
  return { thisWk, lastWk, delta };
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

/* Period-aware insights — drives the Insights page so the timeline tabs
   ("This week" / "Last week" / "Month" / "Year") actually swap the data,
   not just the visual indicator. Returns one stable shape across periods. */
export const computeInsightsForPeriod = (txns, period) => {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;             // Mon = 0
  const monThis = new Date(now);
  monThis.setDate(now.getDate() - day);
  monThis.setHours(0, 0, 0, 0);

  const monLast = new Date(monThis);
  monLast.setDate(monThis.getDate() - 7);
  const monPrior = new Date(monLast);             // for last-week's prior
  monPrior.setDate(monLast.getDate() - 7);

  const startOfMo = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfYr = new Date(now.getFullYear(), 0, 1);
  const startOfPrevYr = new Date(now.getFullYear() - 1, 0, 1);

  let curStart, curEnd, priorStart, priorEnd, copy;

  switch (period) {
    case "Last week":
      curStart   = monLast;
      curEnd     = monThis;
      priorStart = monPrior;
      priorEnd   = monLast;
      copy = {
        title:        "Patterns last week",
        currentLabel: "Last week",
        priorLabel:   "Two weeks ago",
        invisibleSub: "disappeared last week",
        spread:       "spent across 7 days",
      };
      break;
    case "Month":
      curStart   = startOfMo;
      curEnd     = now;
      priorStart = startOfPrevMo;
      priorEnd   = startOfMo;
      copy = {
        title:        "Patterns this month",
        currentLabel: "This month",
        priorLabel:   "Last month",
        invisibleSub: "disappeared this month",
        spread:       `spent in ${now.toLocaleDateString("en-IN", { month: "long" })}`,
      };
      break;
    case "Year":
      curStart   = startOfYr;
      curEnd     = now;
      priorStart = startOfPrevYr;
      priorEnd   = startOfYr;
      copy = {
        title:        "Patterns this year",
        currentLabel: "This year",
        priorLabel:   "Last year",
        invisibleSub: "disappeared this year",
        spread:       `spent in ${now.getFullYear()}`,
      };
      break;
    default: // "This week"
      curStart   = monThis;
      curEnd     = now;
      priorStart = monLast;
      priorEnd   = monThis;
      copy = {
        title:        "Patterns this week",
        currentLabel: "This week",
        priorLabel:   "Last week",
        invisibleSub: "disappeared this week",
        spread:       "spent across 7 days",
      };
  }

  const inRange = (iso, s, e) => {
    const d = new Date(iso);
    return d >= s && d < e;
  };

  const current = txns.filter((t) => inRange(t.timestamp, curStart, curEnd));
  const prior   = txns.filter((t) => inRange(t.timestamp, priorStart, priorEnd));

  const totalCurrent = sumBy(current, (t) => t.amount);
  const totalPrior   = sumBy(prior,   (t) => t.amount);
  const delta = totalPrior ? Math.round(((totalCurrent - totalPrior) / totalPrior) * 100) : 0;

  // Bar series — bucketing depends on period so chart density stays sane.
  const series = bucketSeries(current, period, curStart, curEnd);

  // Category breakdown — same shape as groupSpendByCategory.
  const breakdown = groupSpendByCategory(current).slice(0, 4);

  // Invisible spend, scoped to the period.
  const invisible = computeInvisibleForRange(current);

  // Behavioral meters — recomputed against the period's transactions.
  const impulseBuys = current.filter(
    (t) => t.amount > 800 && (t.category === "Shopping" || t.category === "Beauty"),
  ).length;
  const discipline      = Math.max(40, Math.min(95, 100 - impulseBuys * 4));
  const impulseRiskRaw  = Math.min(100, impulseBuys * 12);
  const impulseRiskBand = impulseRiskRaw < 30 ? "Low" : impulseRiskRaw < 60 ? "Medium" : "High";
  // Stability scales with how many days had at least one transaction.
  const activeDays = new Set(
    current.map((t) => new Date(t.timestamp).toDateString()),
  ).size;
  const savingsStability = Math.min(96, 50 + Math.min(46, activeDays * 4));

  return {
    period,
    copy,
    totalCurrent,
    totalPrior,
    delta,
    series,
    breakdown,
    invisible,
    meters: {
      discipline,
      impulseRisk: impulseRiskRaw,
      impulseRiskBand,
      savingsStability,
    },
  };
};

function bucketSeries(txns, period, start, end) {
  // 7 daily buckets for week, 4 weekly for month, 12 monthly for year.
  const buckets = [];
  if (period === "Year") {
    for (let m = 0; m < 12; m++) {
      const bStart = new Date(start.getFullYear(), m, 1);
      const bEnd   = new Date(start.getFullYear(), m + 1, 1);
      buckets.push({ start: bStart, end: bEnd, total: 0, label: bStart.toLocaleDateString("en-IN", { month: "short" }) });
    }
  } else if (period === "Month") {
    const cursor = new Date(start);
    let weekIdx = 1;
    while (cursor < end) {
      const bStart = new Date(cursor);
      cursor.setDate(cursor.getDate() + 7);
      const bEnd = new Date(Math.min(cursor.getTime(), end.getTime()));
      buckets.push({ start: bStart, end: bEnd, total: 0, label: `W${weekIdx}` });
      weekIdx++;
    }
  } else {
    // Week views — 7 daily buckets aligned to the period start.
    for (let i = 0; i < 7; i++) {
      const bStart = new Date(start);
      bStart.setDate(start.getDate() + i);
      bStart.setHours(0, 0, 0, 0);
      const bEnd = new Date(bStart);
      bEnd.setDate(bStart.getDate() + 1);
      buckets.push({
        start: bStart,
        end: bEnd,
        total: 0,
        label: bStart.toLocaleDateString("en-IN", { weekday: "short" }),
      });
    }
  }
  for (const t of txns) {
    const d = new Date(t.timestamp);
    const b = buckets.find((b) => d >= b.start && d < b.end);
    if (b) b.total += t.amount;
  }
  return buckets;
}

function computeInvisibleForRange(txns) {
  const isLateNight = (t) => {
    const h = new Date(t.timestamp).getHours();
    return (h >= 22 || h < 4) && (t.category === "Food" || t.category === "Cafes");
  };
  const subscriptions = sumBy(txns.filter((t) => t.category === "Subscriptions"), (t) => t.amount);
  const cafes         = sumBy(txns.filter((t) => t.category === "Cafes"),         (t) => t.amount);
  const lateNight     = sumBy(txns.filter(isLateNight),                            (t) => t.amount);
  const microBuys     = sumBy(txns.filter((t) => t.amount <= 250),                 (t) => t.amount);
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
}
