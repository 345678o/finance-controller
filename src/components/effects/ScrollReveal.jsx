import { motion, useReducedMotion } from "framer-motion";

/* ScrollReveal (React Bits-style)
   Wraps any block in a fade-up that triggers when the element enters the
   viewport. Honours `prefers-reduced-motion`. Use on dashboard sections,
   list groups, and below-the-fold cards. */

export default function ScrollReveal({
  children,
  delay = 0,
  y = 24,
  amount = 0.2,    // 0..1 — fraction visible before triggering
  once = true,
  className = "",
  as: Tag = "div",
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[Tag] || motion.div;

  if (reduced) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
