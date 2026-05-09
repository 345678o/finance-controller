import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Target, BarChart3, Sparkles, User } from "lucide-react";

const NAV = [
  { to: "/",         label: "Home",     icon: Home },
  { to: "/jars",     label: "Jars",     icon: Target },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/wrapped",  label: "Wrapped",  icon: Sparkles },
  { to: "/profile",  label: "Profile",  icon: User },
];

export default function AppShell() {
  const { pathname } = useLocation();
  const activeIdx = Math.max(
    0,
    NAV.findIndex((n) =>
      n.to === "/" ? pathname === "/" : pathname.startsWith(n.to),
    ),
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
          <div className="relative flex items-center justify-between gap-1 rounded-3xl border-2 border-[#0F172A] bg-white px-2 py-2 shadow-[3px_3px_0_#0F172A]">
            {/* sliding active pill — outlined mustard */}
            <motion.span
              aria-hidden
              className="absolute top-1.5 bottom-1.5 rounded-2xl border-2 border-[#0F172A] bg-[#F5C842]"
              style={{
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
                className="relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-extrabold"
              >
                {({ isActive }) => {
                  const cls = isActive ? "text-[#0F172A]" : "text-[#94A3B8]";
                  return (
                    <>
                      <Icon size={19} strokeWidth={2.4} className={cls + " transition-colors"} />
                      <span className={cls}>{label}</span>
                    </>
                  );
                }}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
