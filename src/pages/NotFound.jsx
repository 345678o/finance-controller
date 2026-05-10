import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Home,
  Target,
  ScanLine,
  BarChart3,
  Sparkles,
} from "lucide-react";
import SplitText from "@/components/effects/SplitText";

const QUICK_NAV = [
  { to: "/",         label: "Home",     Icon: Home,      bg: "var(--t-primary)"   },
  { to: "/jars",     label: "Jars",     Icon: Target,    bg: "var(--t-secondary)" },
  { to: "/scan",     label: "AR scan",  Icon: ScanLine,  bg: "var(--t-lilac)"     },
  { to: "/insights", label: "Insights", Icon: BarChart3, bg: "var(--t-accent)"    },
  { to: "/wrapped",  label: "Wrapped",  Icon: Sparkles,  bg: "var(--t-bg-soft)"   },
];

export default function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: "var(--t-bg)" }}
    >
      <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-12">
        {/* Animated 404 mark */}
        <motion.div
          initial={{ opacity: 0, y: -10, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-[#0F172A] shadow-[5px_5px_0_#0F172A]"
          style={{ background: "var(--t-primary)" }}
        >
          <span className="num text-[36px] font-extrabold tracking-tight text-[#0F172A]">
            404
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
          <SplitText delay={0.15} stagger={0.05}>Off the loop</SplitText>
        </h1>
        <p className="mt-3 text-center text-[13.5px] leading-relaxed text-[#475569]">
          That route doesn't exist yet — your aura's still intact though.
        </p>

        {/* Attempted path chip */}
        {pathname && pathname !== "/" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F172A] bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#475569] shadow-[2px_2px_0_#0F172A]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
            You tried: <span className="num text-[#0F172A]">{pathname}</span>
          </motion.div>
        )}

        {/* Quick nav grid */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <p className="text-center text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[#475569]">
            Jump back in
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {QUICK_NAV.map(({ to, label, Icon, bg }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-2 rounded-2xl border-2 border-[#0F172A] bg-white p-3 text-left transition-transform hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[2px_2px_0_#0F172A]"
                style={{ boxShadow: "3px 3px 0 #0F172A" }}
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[#0F172A]"
                  style={{ background: bg }}
                >
                  <Icon size={14} strokeWidth={2.4} className="text-[#0F172A]" />
                </span>
                <span className="truncate text-[13px] font-extrabold text-[#0F172A]">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Back action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.85 }}
          className="mt-6 text-center"
        >
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#475569] underline-offset-2 hover:text-[#0F172A] hover:underline"
          >
            <ArrowLeft size={12} strokeWidth={2.6} />
            Go back to where you were
          </button>
        </motion.div>
      </div>
    </div>
  );
}
