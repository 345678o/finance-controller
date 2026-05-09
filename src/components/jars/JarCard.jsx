import { motion } from "framer-motion";
import JarIllustration from "./JarIllustration";
import { inr } from "@/utils/format";

export default function JarCard({ jar, idx, onContribute }) {
  const pct = Math.min(100, Math.round((jar.saved / jar.target) * 100));

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.05 + idx * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={() => onContribute?.(jar)}
      className="flex cursor-pointer items-center gap-4 rounded-3xl border-2 border-[#0F172A] bg-white p-4 shadow-[4px_4px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-[2px_2px_0_#0F172A]"
    >
      <JarIllustration color={jar.color} fillPct={pct} iconKey={jar.iconKey} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[17px] font-extrabold tracking-tight text-[#0F172A]">
            {jar.name}
          </h3>
          <span className="shrink-0 text-base">{jar.emoji}</span>
        </div>

        <p className="num mt-1 text-[13.5px]">
          <span className="font-extrabold text-[#0F172A]">{inr(jar.saved)}</span>
          <span className="text-[#94A3B8]"> / {inr(jar.target)}</span>
        </p>

        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full border-2 border-[#0F172A] bg-white">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: 1.1,
                delay: 0.2 + idx * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
              style={{ background: jar.color }}
            />
          </div>
          <span className="num shrink-0 text-[13px] font-extrabold text-[#0F172A]">
            {pct}%
          </span>
        </div>

        <p className="mt-1.5 text-[12px] text-[#64748B]">
          {jar.monthsLeft} months left
        </p>
      </div>
    </motion.li>
  );
}
