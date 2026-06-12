"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

export interface Pointer {
  /** Damped pointer X in [-1, 1] (0 = center). */
  x: number;
  /** Damped pointer Y in [-1, 1] (0 = center). */
  y: number;
}

/**
 * Move `current` toward `target` by `factor` (clamped to [0,1]). Pure; used to
 * critically-damp pointer motion inside useFrame so the scene eases, never snaps.
 */
export function dampedStep(current: number, target: number, factor: number): number {
  if (!Number.isFinite(target)) return current;
  const f = Math.min(1, Math.max(0, factor));
  return current + (target - current) * f;
}

interface PointerStore {
  /** Latest damped pointer. Read inside useFrame — no React re-render per frame. */
  readonly value: Pointer;
  /** Call once per frame with the frame delta to advance damping. */
  step(delta: number): void;
}

/**
 * A pointer store that tracks the cursor (pointer-fine only) and exposes a damped
 * position for 3D parallax. Under reduced motion / coarse pointer it stays centered.
 * No re-render per frame: the scene reads `store.value` inside useFrame and calls
 * `store.step(delta)` to advance the easing.
 */
export function usePointer(): PointerStore {
  const storeRef = useRef<{ value: Pointer; target: Pointer; step: (d: number) => void }>(null);
  if (storeRef.current === null) {
    const value: Pointer = { x: 0, y: 0 };
    const target: Pointer = { x: 0, y: 0 };
    storeRef.current = {
      value,
      target,
      step(delta: number) {
        // ~12/s convergence, frame-rate independent.
        const f = 1 - Math.exp(-12 * delta);
        value.x = dampedStep(value.x, target.x, f);
        value.y = dampedStep(value.y, target.y, f);
      },
    };
  }

  useEffect(() => {
    const store = storeRef.current!;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (prefersReducedMotion() || !fine) return; // stays centered

    const onMove = (e: PointerEvent) => {
      store.target.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return storeRef.current;
}
