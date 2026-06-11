"use client";

import { useRef, type RefObject } from "react";
import { ScrollTrigger, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { createScrollStore, type ScrollStore } from "@/lib/webgl/scroll-store";

interface BridgeOptions {
  /** Element whose scroll range drives progress. */
  trigger: RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
}

/**
 * Lenis-smoothed scroll progress [0,1] for `trigger`, readable inside useFrame via
 * the returned store's `get()` — no second RAF loop and no React re-render per frame.
 * Under reduced motion no ScrollTrigger is created; progress stays at 0 (start state).
 */
export function useScrollBridge({ trigger, start = "top bottom", end = "bottom top" }: BridgeOptions): ScrollStore {
  const storeRef = useRef<ScrollStore>(createScrollStore(0));
  registerGsap();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = ScrollTrigger.create({
        trigger: trigger.current,
        start,
        end,
        onUpdate: (self) => storeRef.current.set(self.progress),
      });
      return () => st.kill();
    },
    { scope: trigger },
  );

  return storeRef.current;
}
