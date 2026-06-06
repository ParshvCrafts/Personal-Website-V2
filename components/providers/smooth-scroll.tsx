"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css"; // recommended html.lenis rules (scroll-behavior/anchor safety)
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGsap();

    // Reduced motion: do NOT hijack scroll. Native scrolling only.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
