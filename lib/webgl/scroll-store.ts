/** Clamp a number into [0,1]; non-finite → 0. */
export function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

export interface ScrollStore {
  /** Current progress in [0,1]. Read inside useFrame — does not trigger React renders. */
  get(): number;
  /** Write progress (clamped). */
  set(v: number): void;
}

/** A tiny mutable progress holder shared between a ScrollTrigger and a 3D frame loop. */
export function createScrollStore(initial = 0): ScrollStore {
  let value = clamp01(initial);
  return {
    get: () => value,
    set: (v: number) => {
      value = clamp01(v);
    },
  };
}
