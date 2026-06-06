"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  registerGsap();

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current!;
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (!fine || prefersReducedMotion()) return;

      // Without a perspective, rotationX/Y collapse to a flat (orthographic) skew.
      // Set it on the rotated element so the tilt reads as real 3D depth.
      gsap.set(el, { transformPerspective: 800 });

      const rotX = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power3" });
      const rotY = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power3" });

      const onMove = contextSafe!((e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * max * 2);
        rotX(-py * max * 2);
      });
      const onLeave = contextSafe!(() => {
        rotX(0);
        rotY(0);
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
    <div ref={ref} className={cn("[transform-style:preserve-3d]", className)}>
      {children}
    </div>
  );
}
