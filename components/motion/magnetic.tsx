"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Magnetic({
  children,
  strength = 0.4,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  registerGsap();

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current!;
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (!fine || prefersReducedMotion()) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

      const onMove = contextSafe!((e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      const onLeave = contextSafe!(() => {
        xTo(0);
        yTo(0);
      });

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {children}
    </span>
  );
}
