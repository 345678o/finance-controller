import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Target, BarChart3, Sparkles, User } from "lucide-react";

const NAV = [
  { to: "/",         label: "Home",     icon: Home },
  { to: "/jars",     label: "Jars",     icon: Target },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/wrapped",  label: "Wrapped",  icon: Sparkles },
  { to: "/profile",  label: "Profile",  icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const activeIdx = Math.max(
    0,
    NAV.findIndex((n) =>
      n.to === "/" ? pathname === "/" : pathname.startsWith(n.to),
    ),
  );

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 safe-bottom z-40 pointer-events-none"
    >
      <div className="mx-auto max-w-md px-4 pb-3 pointer-events-auto">
        <div
          className="relative flex items-center justify-between gap-1 rounded-3xl border-2 px-2 py-2"
          style={{
            borderColor: "var(--t-line)",
            background: "var(--t-card)",
            boxShadow: "3px 3px 0 var(--t-line)",
          }}
        >
          <motion.span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 rounded-2xl border-2"
            style={{
              borderColor: "var(--t-line)",
              background: "var(--t-primary)",
              width: `calc((100% - 1rem) / ${NAV.length})`,
            }}
            animate={{
              left: `calc(0.5rem + ${activeIdx} * ((100% - 1rem) / ${NAV.length}))`,
            }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
          />
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="touch-target relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-extrabold"
            >
              {({ isActive }) => {
                const color = isActive ? "var(--t-ink)" : "var(--t-ink-faint)";
                return (
                  <>
                    <Icon size={19} strokeWidth={2.4} style={{ color }} />
                    <span style={{ color }}>{label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
