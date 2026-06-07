"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";

/** Pure formatter — exported for tests. */
export function formatCount(value: number, decimals: number, suffix = ""): string {
  return `${value.toFixed(decimals)}${suffix}`;
}

interface CountUpProps {
  to: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export function CountUp({ to, decimals = 0, suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => formatCount(to, decimals, suffix));
  registerGsap();

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        setDisplay(formatCount(to, decimals, suffix));
        return;
      }
      const counter = { v: 0 };
      gsap.to(counter, {
        v: to,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        onUpdate: () => setDisplay(formatCount(counter.v, decimals, suffix)),
      });
    },
    { scope: ref, dependencies: [to, decimals, suffix] },
  );

  return (
    <span ref={ref} className={className} aria-live="polite" aria-atomic="true">
      {display}
    </span>
  );
}
