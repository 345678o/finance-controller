import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./TextCursor.css";

/* TextCursor — adapted from React Bits.
   Default💵s to a 🪙 coin trail; pass any string (emoji, glyph, word) via
   the `text` prop. Listens to document mousemove and computes coordinates
   relative to its container, so the overlay stays click-through (the
   container is pointer-events: none) and only emits trail items when the
   cursor is over the parent element.                                       */

export default function TextCursor({
  text = "💵",
  spacing = 80,
  followMouseDirection = true,
  randomFloat = true,
  exitDuration = 0.5,
  removalInterval = 30,
  maxPoints = 6,
}) {
  const [trail, setTrail] = useState([]);
  const containerRef = useRef(null);
  const lastMoveTimeRef = useRef(Date.now());
  const idCounter = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Skip emission entirely when the cursor is outside the parent — keeps
      // the trail bounded to the area we're decorating.
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      const createRandomData = () =>
        randomFloat
          ? {
              randomX: Math.random() * 10 - 5,
              randomY: Math.random() * 10 - 5,
              randomRotate: Math.random() * 10 - 5,
            }
          : {};

      setTrail((prev) => {
        const next = [...prev];
        if (next.length === 0) {
          next.push({
            id: idCounter.current++,
            x,
            y,
            angle: 0,
            ...createRandomData(),
          });
        } else {
          const last = next[next.length - 1];
          const dx = x - last.x;
          const dy = y - last.y;
          const distance = Math.hypot(dx, dy);
          if (distance >= spacing) {
            const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const angle = followMouseDirection ? rawAngle : 0;
            const steps = Math.floor(distance / spacing);
            for (let i = 1; i <= steps; i++) {
              const t = (spacing * i) / distance;
              next.push({
                id: idCounter.current++,
                x: last.x + dx * t,
                y: last.y + dy * t,
                angle,
                ...createRandomData(),
              });
            }
          }
        }
        return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
      });

      lastMoveTimeRef.current = Date.now();
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTimeRef.current > 100) {
        setTrail((prev) => (prev.length > 0 ? prev.slice(1) : prev));
      }
    }, removalInterval);
    return () => clearInterval(interval);
  }, [removalInterval]);

  return (
    <div ref={containerRef} className="text-cursor-container" aria-hidden>
      <div className="text-cursor-inner">
        <AnimatePresence>
          {trail.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.85, rotate: item.angle }}
              animate={{
                opacity: 1,
                scale: 1,
                x: randomFloat ? [0, item.randomX || 0, 0] : 0,
                y: randomFloat ? [0, item.randomY || 0, 0] : 0,
                rotate: randomFloat
                  ? [item.angle, item.angle + (item.randomRotate || 0), item.angle]
                  : item.angle,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: exitDuration, ease: "easeOut" },
                scale:   { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                ...(randomFloat && {
                  x:      { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
                  y:      { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
                  rotate: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
                }),
              }}
              className="text-cursor-item"
              style={{ left: item.x, top: item.y }}
            >
              {text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
