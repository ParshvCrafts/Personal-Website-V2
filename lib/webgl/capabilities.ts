export type GpuTier = "off" | "low" | "high";

export interface CapabilityInputs {
  /** prefers-reduced-motion is active. */
  reducedMotion: boolean;
  /** A WebGL2 context could be created. */
  webgl2: boolean;
  /** navigator.deviceMemory in GB (may be undefined). */
  deviceMemory?: number;
  /** navigator.hardwareConcurrency (may be undefined). */
  hardwareConcurrency?: number;
  /** navigator.connection.saveData. */
  saveData?: boolean;
  /** Touch-first / coarse pointer device. */
  coarsePointer?: boolean;
}

const RANK: Record<GpuTier, number> = { off: 0, low: 1, high: 2 };

/** Resolve a render tier from injected device signals. Pure — no window/navigator access. */
export function resolveGpuTier(i: CapabilityInputs): GpuTier {
  if (i.reducedMotion || !i.webgl2 || i.saveData) return "off";
  const lowMemory = i.deviceMemory !== undefined && i.deviceMemory <= 4;
  const lowCores = i.hardwareConcurrency !== undefined && i.hardwareConcurrency <= 4;
  if (lowMemory || lowCores || i.coarsePointer) return "low";
  return "high";
}

/** True when `tier` is at least `min`. */
export function tierMeets(tier: GpuTier, min: GpuTier): boolean {
  return RANK[tier] >= RANK[min];
}

/** Clamp a device pixel ratio into [1, max]; non-finite → 1. */
export function clampDpr(raw: number, max = 2): number {
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(raw, max);
}
