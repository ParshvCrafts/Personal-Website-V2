"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  /** Stagger direct children instead of revealing the wrapper as one block. */
  stagger?: number;
}

export function Reveal({ children, className, y = 24, delay = 0, stagger }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? ref.current!.children : ref.current;
        gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.8,
          ease: "power3.out",
          delay,
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
      // Reduced motion: no tween → children remain visible and in place.
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
