"use client";

import { useEffect, useRef, useState } from "react";

// ANIMATION CLOCK IN SECONDS THAT ONLY TICKS WHILE THE ELEMENT IS ON SCREEN.
// WITH prefers-reduced-motion IT STAYS FROZEN ON A REPRESENTATIVE FRAME (stillAt).
export function useLoopTime<T extends Element>(stillAt: number) {
  const ref = useRef<T>(null);
  const [t, setT] = useState(stillAt);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let visible = false;
    let last = performance.now();
    let acc = stillAt;
    const tick = (now: number) => {
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      setT(acc);
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stillAt]);

  return { ref, t };
}
