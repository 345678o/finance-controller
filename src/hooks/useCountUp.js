import { useEffect, useState } from "react";
import { animate } from "framer-motion";

/**
 * Animates a number from 0 → `to` over `duration` seconds.
 * Returns a rounded integer suitable for display.
 */
export default function useCountUp(to, duration = 1.4, deps = []) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (to === 0) {
      setVal(0);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1], // expo-out — feels premium
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, duration, ...deps]);
  return val;
}
