import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Target,
  BarChart3,
  Sparkles,
  Bell,
  Palette,
  Check,
} from "lucide-react";
import { useThemeStore, THEMES } from "@/store/useThemeStore";

const NAV = [
  { to: "/",         label: "Home",     icon: Home },
  { to: "/jars",     label: "Saved",    icon: Target },
  { to: "/insights", label: "Spent",    icon: BarChart3 },
  { to: "/wrapped",  label: "Goals",    icon: Sparkles },
];

const USER = { initial: "A", name: "Anamika" };

export default function TopNav() {
  const { pathname } = useLocation();
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
            <button
              aria-label="Notifications"
              className="touch-target relative grid h-11 w-11 place-items-center rounded-2xl border-2"
              style={{
                borderColor: "var(--t-line)",
                background: "var(--t-card)",
                boxShadow: "3px 3px 0 var(--t-line)",
              }}
            >
              <Bell size={17} strokeWidth={2.4} />
              <span
                className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2"
                style={{ borderColor: "var(--t-line)", background: "var(--t-danger)" }}
              />
            </button>
            <NavLink
              to="/profile"
              aria-label="Profile"
              className="touch-target grid h-11 w-11 place-items-center rounded-2xl border-2 text-[14px] font-extrabold"
              style={{
                borderColor: "var(--t-line)",
                background: "var(--t-accent)",
                boxShadow: "3px 3px 0 var(--t-line)",
                color: "var(--t-ink)",
              }}
            >
              {USER.initial}
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
