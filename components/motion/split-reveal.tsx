"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, SplitText } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SplitRevealProps {
  /** The heading text. Kept as a single string so SplitText can re-split safely. */
  children: string;
  className?: string;
  /** "words" (default) or "chars". */
  unit?: "words" | "chars";
  /** Render element. Default h2. */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** id passed through for aria-labelledby wiring. */
  id?: string;
  stagger?: number;
}

export function SplitReveal({
  children,
  className,
  unit = "words",
  as: Tag = "h2",
  id,
  stagger = 0.08,
}: SplitRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = new SplitText(el, { type: unit, aria: "auto" });
        const targets = unit === "chars" ? split.chars : split.words;
        gsap.from(targets, {
          opacity: 0,
          yPercent: 120,
          duration: 0.7,
          ease: "power3.out",
          stagger,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as never} id={id} className={cn(className)}>
      {children}
    </Tag>
  );
}
