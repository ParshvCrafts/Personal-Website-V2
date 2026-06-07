"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { nextRoleIndex } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Cycles through `items` with a vertical slide+fade. Motion-safe only — under
 * reduced motion the first item is shown statically (no animation, no interval).
 * The visible word is masked by an overflow-hidden wrapper so it slides cleanly.
 */
export function RotatingText({
  items,
  className,
  hold = 1.8,
}: {
  items: readonly string[];
  className?: string;
  /** Seconds each word stays before rotating. */
  hold?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || items.length < 2) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let i = 0;
        const tl = gsap.timeline({ repeat: -1 });
        // one full cycle per item: hold → slide current out → swap → slide next in
        items.forEach(() => {
          tl.to(el, { yPercent: -120, opacity: 0, duration: 0.4, ease: "power2.in", delay: hold })
            .add(() => {
              i = nextRoleIndex(i, items.length);
              el.textContent = items[i];
            })
            .fromTo(
              el,
              { yPercent: 120, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
            );
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span className="inline-flex overflow-hidden align-bottom leading-[1.15]">
      <span ref={ref} className={cn("inline-block", className)}>
        {items[0]}
      </span>
    </span>
  );
}
