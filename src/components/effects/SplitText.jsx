import { motion } from "framer-motion";

/* SplitText (React Bits-style)
   Splits a string into per-word or per-character spans and staggers them in
   with a soft fade-up + blur. Inline by default so it nests inside larger
   headlines without breaking layout. */

const VARIANTS = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function SplitText({
  children,
  by = "word",                 // "word" | "char"
  delay = 0,
  stagger = 0.06,
  className = "",
  as: Tag = "span",
}) {
  const text = String(children ?? "");
  const tokens = by === "char" ? Array.from(text) : text.split(/(\s+)/);

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: delay, staggerChildren: stagger }}
      className={className}
      style={{ display: "inline-block" }}
    >
      {tokens.map((t, i) => {
        const isSpace = /^\s+$/.test(t);
        if (isSpace) return <span key={i}>{t}</span>;
        return (
          <motion.span
            key={i}
            variants={VARIANTS}
            style={{
              display: "inline-block",
              willChange: "transform, opacity, filter",
            }}
          >
            {t}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
