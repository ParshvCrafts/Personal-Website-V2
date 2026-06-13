"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { cursorStateFor, type CursorState } from "@/lib/cursor-state";

/**
 * Desktop-only custom cursor: a precise dot + a lagging ring (gsap.quickTo).
 * `mix-blend-difference` keeps it visible on any theme/background. Renders nothing
 * on touch / reduced-motion / SSR, and is never required for any interaction.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  registerGsap();

  useGSAP(
    (_ctx, contextSafe) => {
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (!fine || prefersReducedMotion()) return;

      const dot = dotRef.current!;
      const ring = ringRef.current!;
      document.documentElement.classList.add("cursor-none");
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

      const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" });

      let shown = false;
      const onMove = contextSafe!((e: PointerEvent) => {
        if (!shown) {
          gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
          shown = true;
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
      });
      let state: CursorState = "default";
      const label = ring.querySelector<HTMLElement>("[data-cursor-label]")!;
      const onOver = contextSafe!((e: PointerEvent) => {
        const next = cursorStateFor(e.target as Element);
        if (next === state) return;
        state = next;
        const scale = next === "view" ? 2.6 : next === "link" ? 1.8 : next === "field" ? 1.2 : 1;
        gsap.to(ring, { scale, duration: 0.3, ease: "power3" });
        gsap.to(label, { opacity: next === "view" ? 1 : 0, duration: 0.2 });
        ring.classList.toggle("cursor-crosshair", next === "field");
      });
      const onLeave = contextSafe!(() => gsap.to([dot, ring], { opacity: 0, duration: 0.2 }));

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerover", onOver);
      document.addEventListener("pointerleave", onLeave);
      return () => {
        document.documentElement.classList.remove("cursor-none");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver);
        document.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: dotRef },
  );

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] flex h-8 w-8 items-center justify-center rounded-full border border-foreground mix-blend-difference [&.cursor-crosshair]:border-dashed"
      >
        <span
          data-cursor-label
          className="font-mono text-[8px] uppercase tracking-widest text-foreground opacity-0"
        >
          View
        </span>
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-foreground mix-blend-difference"
      />
    </>
  );
}
