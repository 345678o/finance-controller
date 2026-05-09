import { motion } from "framer-motion";
import { ShieldCheck, Zap, Activity } from "lucide-react";

export default function StabilityMeter({ meters }) {
  const { discipline, impulseRisk, impulseRiskBand, savingsStability } = meters;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className="glass-card p-5"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-dim">
            Behavioral meter
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-ink">
            How you've been moving money
          </h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wider text-ink-muted">
          7d
        </div>
      </header>

      <div className="space-y-4">
        <Bar
          Icon={ShieldCheck}
          label="Discipline"
          value={discipline}
          accent="#00ffae"
          status={discipline >= 70 ? "Strong" : discipline >= 50 ? "Holding" : "Slipping"}
        />
        <Bar
          Icon={Zap}
          label="Impulse risk"
          value={impulseRisk}
          accent={impulseRisk < 30 ? "#00ffae" : impulseRisk < 60 ? "#ffb020" : "#ff2d92"}
          status={impulseRiskBand}
          inverted
        />
        <Bar
          Icon={Activity}
          label="Savings stability"
          value={savingsStability}
          accent="#00e5ff"
          status={savingsStability >= 70 ? "Strong" : savingsStability >= 50 ? "Even" : "Weak"}
        />
      </div>
    </motion.section>
  );
}

function Bar({ Icon, label, value, accent, status, inverted = false }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[12px]">
        <span className="flex items-center gap-1.5 text-ink-muted">
          <Icon size={13} strokeWidth={2.4} style={{ color: accent }} />
          {label}
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-ink">{safeValue}%</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: accent, background: `${accent}1a` }}
          >
            {status}
          </span>
        </span>
      </div>

      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{
            background: inverted
              ? `linear-gradient(90deg, #00ffae, ${accent})`
              : `linear-gradient(90deg, ${accent}, #ffffff20)`,
            boxShadow: `0 0 12px ${accent}80`,
          }}
        />
      </div>
    </div>
  );
}
