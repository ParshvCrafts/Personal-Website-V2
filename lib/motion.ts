import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Register GSAP plugins exactly once, client-only. Safe to call from any client component. */
export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip);
  registered = true;
}

/**
 * True when the user asked for reduced motion — either the OS
 * `prefers-reduced-motion: reduce` media query, OR the on-page toggle, which
 * sets `data-reduce-motion` on <html> (applied before paint by the head script
 * in app/layout.tsx). Always false on the server.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (document.documentElement.hasAttribute("data-reduce-motion")) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Map a scroll progress in [0,1] to a frame index in [0, frameCount-1]. Pure + clamped. */
export function frameForProgress(progress: number, frameCount: number): number {
  if (frameCount <= 1) return 0;
  const idx = Math.round(progress * (frameCount - 1));
  return Math.min(frameCount - 1, Math.max(0, idx));
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
