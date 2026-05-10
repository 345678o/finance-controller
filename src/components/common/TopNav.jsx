import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Target,
  ScanLine,
  BarChart3,
  Sparkles,
  Bell,
  Palette,
  Check,
  TrendingUp,
  AlertTriangle,
  Flame,
  PiggyBank,
  CheckCheck,
} from "lucide-react";
import { useThemeStore, THEMES } from "@/store/useThemeStore";
import { useAuraStore } from "@/store/useAuraStore";
import { inr, inrCompact } from "@/utils/format";

const NAV = [
  { to: "/",         label: "Home",     icon: Home },
  { to: "/jars",     label: "Saved",    icon: Target },
  { to: "/scan",     label: "Scan",     icon: ScanLine },
  { to: "/insights", label: "Spent",    icon: BarChart3 },
  { to: "/wrapped",  label: "Goals",    icon: Sparkles },
];


export default function TopNav() {
  const { pathname } = useLocation();
  const profile = useAuraStore((s) => s.profile);
  const activeIdx = Math.max(
    0,
    NAV.findIndex((n) =>
      n.to === "/" ? pathname === "/" : pathname.startsWith(n.to),
    ),
  );

  return (
    <header className="sticky top-0 z-40 hidden md:block safe-top">
      <div
        className="border-b-2"
        style={{
          borderColor: "var(--t-line)",
          backgroundColor: "rgba(var(--t-glow), 0.0)",
          backdropFilter: "saturate(140%) blur(8px)",
        }}
      >
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--t-bg)", opacity: 0.92 }}
        />
        <div className="mx-auto flex h-[68px] max-w-app items-center justify-between gap-6 px-6 lg:px-10">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:flex">
            <div
              className="relative flex items-center gap-1 rounded-full border-2 p-1"
              style={{ borderColor: "var(--t-line)", background: "var(--t-card)" }}
            >
              {NAV.map(({ to, label, icon: Icon }, i) => {
                const isActive = i === activeIdx;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className="relative z-10 px-4 py-2"
                  >
                    <span className="relative z-10 flex items-center gap-2 text-[13px] font-extrabold">
                      <Icon size={15} strokeWidth={2.6} />
                      {label}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="topnav-pill"
                        className="absolute inset-0 rounded-full border-2"
                        style={{
                          borderColor: "var(--t-line)",
                          background: "var(--t-primary)",
                        }}
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <NotificationsBell />
            <NavLink
              to="/profile"
              aria-label="Profile"
              className="touch-target grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border-2 text-[20px]"
              style={{
                borderColor: "var(--t-line)",
                background: profile.avatarImage ? "transparent" : "var(--t-accent)",
                boxShadow: "3px 3px 0 var(--t-line)",
                color: "var(--t-ink)",
              }}
            >
              {profile.avatarImage ? (
                <img
                  src={profile.avatarImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.avatarEmoji
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <NavLink to="/" className="flex items-center gap-2.5">
      <span
        className="grid h-10 w-10 place-items-center rounded-2xl border-2"
        style={{
          borderColor: "var(--t-line)",
          background: "var(--t-primary)",
          boxShadow: "3px 3px 0 var(--t-line)",
        }}
      >
        <Sparkles size={18} strokeWidth={2.6} className="text-[var(--t-ink)]" />
      </span>
      <div className="leading-none">
        <p className="text-[16px] font-extrabold tracking-tight">
          Aura<span style={{ color: "var(--t-ink-dim)" }}>Loop</span>
        </p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--t-ink-faint)]">
          Round-up · Save · Glow
        </p>
      </div>
    </NavLink>
  );
}

function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="relative">
      <button
        aria-label="Switch theme"
        onClick={() => setOpen((o) => !o)}
        className="touch-target grid h-11 w-11 place-items-center rounded-2xl border-2"
        style={{
          borderColor: "var(--t-line)",
          background: "var(--t-secondary)",
          boxShadow: "3px 3px 0 var(--t-line)",
        }}
      >
        <Palette size={17} strokeWidth={2.4} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              aria-label="Close theme menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 rounded-2xl border-2 p-2"
              style={{
                borderColor: "var(--t-line)",
                background: "var(--t-card)",
                boxShadow: "5px 5px 0 var(--t-line)",
              }}
            >
              <p className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--t-ink-muted)]">
                Theme palette
              </p>
              <ul className="mt-1 space-y-1">
                {THEMES.map((t) => {
                  const active = t.id === themeId;
                  return (
                    <li key={t.id}>
                      <button
                        role="menuitemradio"
                        aria-checked={active}
                        onClick={() => {
                          setTheme(t.id);
                          setOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-[13px] font-bold transition-colors hover:bg-[var(--t-bg-soft)]"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-5 w-5 rounded-md border-2"
                            style={{
                              borderColor: "var(--t-line)",
                              background: t.swatch,
                            }}
                          />
                          {t.label}
                        </span>
                        {active && <Check size={14} strokeWidth={3} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── Notifications ───────── */

const SEVERITY_META = {
  good: { Icon: TrendingUp,    bg: "var(--t-secondary)" },
  warn: { Icon: AlertTriangle, bg: "var(--t-accent)" },
  info: { Icon: Sparkles,      bg: "var(--t-lilac)" },
};

function relTime(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function buildNotifications(insights, jars, transactions, streak) {
  const now = Date.now();
  const items = [];

  // Static, copy-driven insights from the store.
  insights.forEach((ins, i) => {
    items.push({
      id: ins.id,
      severity: ins.severity || "info",
      title: ins.title,
      body: ins.body,
      timestamp: now - (i + 1) * 36 * 60 * 1000,
      to: "/insights",
    });
  });

  // Dynamic alert: jar nearing target
  const closest = [...(jars || [])]
    .map((j) => ({ ...j, pct: j.target ? j.saved / j.target : 0 }))
    .sort((a, b) => b.pct - a.pct)[0];
  if (closest && closest.pct >= 0.5 && closest.pct < 1) {
    items.push({
      id: `jar_${closest.id}`,
      severity: "good",
      Icon: PiggyBank,
      title: `${closest.name} is ${Math.round(closest.pct * 100)}% full`,
      body: `${inr(closest.target - closest.saved)} to go — keep stacking round-ups.`,
      timestamp: now - 12 * 60 * 1000,
      to: "/jars",
    });
  }

  // Dynamic alert: large recent spend
  const big = (transactions || []).find((t) => t.amount >= 1500);
  if (big) {
    items.push({
      id: `big_${big.id}`,
      severity: "warn",
      title: `Heads-up: ${inr(big.amount)} at ${big.merchant}`,
      body: `That's a chunky one — round-up of ${inr(big.savedAmount || 0)} stacked into your jar.`,
      timestamp: big.timestamp || now - 90 * 60 * 1000,
      to: "/insights",
    });
  }

  // Streak milestone
  if (streak && streak >= 7) {
    items.push({
      id: `streak_${streak}`,
      severity: "good",
      Icon: Flame,
      title: `${streak}-day saving streak`,
      body: "Your aura's holding steady — don't break the loop today.",
      timestamp: now - 4 * 60 * 60 * 1000,
      to: "/wrapped",
    });
  }

  return items.sort((a, b) => b.timestamp - a.timestamp);
}

function NotificationsBell() {
  const navigate = useNavigate();
  const insights     = useAuraStore((s) => s.insights);
  const jars         = useAuraStore((s) => s.jars);
  const transactions = useAuraStore((s) => s.transactions);
  const streak       = useAuraStore((s) => s.streak);

  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());

  const items = useMemo(
    () => buildNotifications(insights, jars, transactions, streak),
    [insights, jars, transactions, streak],
  );
  const unread = items.filter((n) => !readIds.has(n.id)).length;

  function markAll() {
    setReadIds(new Set(items.map((n) => n.id)));
  }

  function handleClick(item) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
    setOpen(false);
    if (item.to) navigate(item.to);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="touch-target relative grid h-11 w-11 place-items-center rounded-2xl border-2"
        style={{
          borderColor: "var(--t-line)",
          background: "var(--t-card)",
          boxShadow: "3px 3px 0 var(--t-line)",
        }}
      >
        <Bell size={17} strokeWidth={2.4} />
        {unread > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 px-1 text-[10px] font-extrabold leading-none"
            style={{
              borderColor: "var(--t-line)",
              background: "var(--t-danger)",
              color: "#fff",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              aria-label="Close notifications"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(92vw,360px)] rounded-2xl border-2"
              style={{
                borderColor: "var(--t-line)",
                background: "var(--t-card)",
                boxShadow: "5px 5px 0 var(--t-line)",
              }}
            >
              <div className="flex items-center justify-between border-b-2 px-4 py-3"
                style={{ borderColor: "var(--t-line-soft)" }}
              >
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--t-ink-muted)]">
                    Notifications
                  </p>
                  <p className="mt-0.5 text-[14px] font-extrabold text-[var(--t-ink)]">
                    {unread > 0 ? `${unread} new` : "All caught up"}
                  </p>
                </div>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={markAll}
                    className="inline-flex items-center gap-1 rounded-xl border-2 px-2.5 py-1.5 text-[11px] font-extrabold transition-transform active:translate-y-[1px]"
                    style={{
                      borderColor: "var(--t-line)",
                      background: "var(--t-card-soft)",
                    }}
                  >
                    <CheckCheck size={12} strokeWidth={2.6} />
                    Mark all
                  </button>
                )}
              </div>

              <ul className="max-h-[60vh] overflow-y-auto p-2">
                {items.length === 0 && (
                  <li className="px-3 py-8 text-center text-[12px] text-[var(--t-ink-dim)]">
                    Nothing yet — your money's quiet.
                  </li>
                )}
                {items.map((n) => {
                  const meta = SEVERITY_META[n.severity] || SEVERITY_META.info;
                  const Icon = n.Icon || meta.Icon;
                  const isRead = readIds.has(n.id);
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleClick(n)}
                        className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[var(--t-bg-soft)]"
                      >
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2"
                          style={{
                            borderColor: "var(--t-line)",
                            background: meta.bg,
                          }}
                        >
                          <Icon size={15} strokeWidth={2.4} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span
                              className="truncate text-[13px] font-extrabold text-[var(--t-ink)]"
                              style={{ opacity: isRead ? 0.6 : 1 }}
                            >
                              {n.title}
                            </span>
                            {!isRead && (
                              <span
                                aria-hidden
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ background: "var(--t-danger)" }}
                              />
                            )}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] leading-relaxed text-[var(--t-ink-dim)]">
                            {n.body}
                          </span>
                          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--t-ink-faint)]">
                            {relTime(n.timestamp)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div
                className="border-t-2 px-3 py-2"
                style={{ borderColor: "var(--t-line-soft)" }}
              >
                <button
                  type="button"
                  onClick={() => { setOpen(false); navigate("/settings"); }}
                  className="w-full rounded-xl px-2 py-2 text-[12px] font-extrabold text-[var(--t-ink-dim)] hover:bg-[var(--t-bg-soft)] hover:text-[var(--t-ink)]"
                >
                  Manage notification settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
