import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Target, Sparkles, Activity, Compass } from "lucide-react";

const NAV = [
  { to: "/",         label: "Home",     icon: Home },
  { to: "/jars",     label: "Jars",     icon: Target },
  { to: "/wrapped",  label: "Wrapped",  icon: Sparkles },
  { to: "/insights", label: "Insights", icon: Activity },
  { to: "/future",   label: "Future",   icon: Compass },
];

export default function AppShell() {
  const { pathname } = useLocation();
  const activeIdx = Math.max(
    0,
    NAV.findIndex((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to))),
  );

  return (
    <div className="min-h-[100svh] flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-md safe-top px-5 pt-6 pb-28">
        <Outlet />
      </main>

      <nav
        aria-label="Primary"
        className="fixed bottom-0 inset-x-0 safe-bottom z-40 pointer-events-none"
      >
        <div className="mx-auto max-w-md px-4 pb-3 pointer-events-auto">
          <div className="glass-card-strong relative flex items-center justify-between px-2 py-2">
            {/* sliding active indicator */}
            <motion.span
              aria-hidden
              className="absolute top-1.5 bottom-1.5 rounded-2xl"
              style={{
                width: `calc((100% - 1rem) / ${NAV.length})`,
                background:
                  "linear-gradient(135deg, rgba(0,255,174,0.16), rgba(0,229,255,0.10))",
                boxShadow:
                  "inset 0 0 0 1px rgba(0,255,174,0.35), 0 0 18px rgba(0,255,174,0.18)",
              }}
              animate={{ left: `calc(0.5rem + ${activeIdx} * ((100% - 1rem) / ${NAV.length}))` }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            />

            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className="relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-medium"
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      strokeWidth={2.2}
                      className={
                        isActive
                          ? "text-neon-green drop-shadow-[0_0_10px_rgba(0,255,174,0.7)] transition-colors"
                          : "text-ink-muted transition-colors"
                      }
                    />
                    <span className={isActive ? "text-neon-green" : "text-ink-muted"}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
