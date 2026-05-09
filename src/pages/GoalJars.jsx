import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import JarCard from "@/components/jars/JarCard";
import PageHeader from "@/components/common/PageHeader";

export default function GoalJars() {
  const jars = useAuraStore((s) => s.jars);
  const contributeToJar = useAuraStore((s) => s.contributeToJar);

  return (
    <>
      <div className="fixed inset-0 bg-[#F5F1E8]" aria-hidden />

      <div className="relative space-y-4">
        <PageHeader title="Jars" />

        {/* Hero row with action */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 flex items-end justify-between gap-3"
        >
          <div className="min-w-0">
            <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
              Your jars
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#475569]">
              Drop spare change into the future you actually want.
            </p>
          </div>
          <button
            aria-label="New jar"
            className="inline-flex shrink-0 items-center gap-1 rounded-2xl border-2 border-[#0F172A] bg-[#F5C842] px-3 py-2 text-[12px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            <Plus size={14} strokeWidth={2.8} />
            New
          </button>
        </motion.section>

        {/* Jar list */}
        <ul className="space-y-3">
          {jars.map((jar, idx) => (
            <JarCard
              key={jar.id}
              jar={jar}
              idx={idx}
              onContribute={(j) => contributeToJar(j.id, 100)}
            />
          ))}
        </ul>

        <p className="text-center text-[11px] text-[#94A3B8]">
          Tap a jar to top up · long-press to edit
        </p>
      </div>
    </>
  );
}
