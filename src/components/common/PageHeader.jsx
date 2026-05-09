import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import Sidebar from "@/components/common/Sidebar";

const USER = { initial: "A" };

// Reusable cream-outlined top bar — mustard menu (opens sidebar) · centered title · coral avatar.
export default function PageHeader({ title, onProfile }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="md:hidden flex items-center justify-between"
      >
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-[#0F172A] bg-[#F5C842] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
        >
          <LayoutGrid size={20} strokeWidth={2.6} className="text-[#0F172A]" />
        </button>

        <h1 className="text-[15px] font-extrabold tracking-tight text-[#0F172A]">
          {title}
        </h1>

        <button onClick={onProfile} aria-label="Profile" className="relative">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-[#0F172A] bg-[#FF8C7A] shadow-[3px_3px_0_#0F172A]">
            <span className="text-[14px] font-extrabold text-[#0F172A]">
              {USER.initial}
            </span>
          </div>
          <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-[#0F172A] bg-[#EF4444]">
            <span className="h-1 w-1 rounded-full bg-white" />
          </span>
        </button>
      </motion.header>

      <Sidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
}
