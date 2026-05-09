import { motion } from "framer-motion";

export default function StatCard({
  label,
  big,
  bigSuffix,
  bigColor = "#0F172A",
  sub,
  illustration,
  illustrationAlign = "right", // "right" | "center"
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-[178px] flex-col rounded-2xl border-2 border-[#0F172A] bg-white p-4 shadow-[4px_4px_0_#0F172A]"
    >
      <p className="text-[12px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
        {label}
      </p>

      <p
        className="num mt-2 text-[26px] font-extrabold leading-none tracking-tight"
        style={{ color: bigColor }}
      >
        {big}
        {bigSuffix && (
          <span className="ml-1 text-[15px] font-extrabold text-[#475569]">
            {bigSuffix}
          </span>
        )}
      </p>

      {sub && (
        <p className="mt-1 text-[12px] leading-snug text-[#64748B]">{sub}</p>
      )}

      {illustration && (
        <div
          className={
            "pointer-events-none mt-auto flex " +
            (illustrationAlign === "center" ? "justify-center" : "justify-end")
          }
        >
          {illustration}
        </div>
      )}
    </motion.div>
  );
}
