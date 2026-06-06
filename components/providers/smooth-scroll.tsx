"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css"; // recommended html.lenis rules (scroll-behavior/anchor safety)
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";

interface ScrollToOptions {
  /** Pixel offset applied to the target (use a negative value to clear a sticky nav). */
  offset?: number;
}

interface SmoothScrollApi {
  scrollTo: (target: string | number, opts?: ScrollToOptions) => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi>({ scrollTo: () => {} });

/** Programmatic smooth scroll that uses Lenis when active, native jump otherwise. */
export function useSmoothScroll(): SmoothScrollApi {
  return useContext(SmoothScrollContext);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    registerGsap();

    // Reduced motion: do NOT hijack scroll. Native scrolling only.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: string | number, opts?: ScrollToOptions) => {
    const offset = opts?.offset ?? 0;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset });
      return;
    }
    // No Lenis (reduced motion / SSR-hydration race): native jump.
    if (typeof target === "number") {
      window.scrollTo({ top: target + offset });
      return;
    }
    const el = document.querySelector(target);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top });
    }
  }, []);

  return <SmoothScrollContext.Provider value={{ scrollTo }}>{children}</SmoothScrollContext.Provider>;
}
