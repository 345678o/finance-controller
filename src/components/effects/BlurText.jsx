import { motion } from "framer-motion";

/* BlurText (React Bits-style)
   Single fade-in with a blur-out → blur-in transition. Use it on subheads
   or short copy where SplitText's word-by-word would feel busy. */

export default function BlurText({
  children,
  delay = 0,
  duration = 0.85,
  className = "",
}) {
  return (
    <motion.span
      initial={{ opacity: 0, filter: "blur(10px)", y: 4 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ delay, duration, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={{ display: "inline-block", willChange: "filter, opacity" }}
    >
      {children}
    </motion.span>
  );
}
