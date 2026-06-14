"use client";

import { useEffect, useState } from "react";

/**
 * Fixed top scroll-progress bar.
 *
 * Uses transform: scaleX for GPU-composited updates. The bar is informational
 * (not decorative motion), so it stays visible under reduced-motion.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const p = docHeight > 0 ? scrollTop / docHeight : 0;
        setProgress(Math.min(1, Math.max(0, p)));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
    >
      {/* Glow layer — accent color blurred behind the bar for a premium neon feel */}
      <div
        className="absolute inset-0 h-[6px] -top-[1px] origin-left will-change-transform"
        style={{
          transform: `scaleX(${progress})`,
          background: "var(--accent)",
          opacity: 0.4,
          filter: "blur(6px)",
        }}
      />
      {/* Solid bar */}
      <div
        className="h-full bg-accent origin-left will-change-transform"
        style={{ transform: `scaleX(${progress})` }}
      />
      {/* Leading-edge bright dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 will-change-transform"
        style={{
          left: `${progress * 100}%`,
          opacity: progress > 0.01 ? 1 : 0,
        }}
      >
        <div className="h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
      </div>
    </div>
  );
}
