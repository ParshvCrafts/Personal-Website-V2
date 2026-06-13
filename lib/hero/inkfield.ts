// lib/hero/inkfield.ts
// Pure math for the Inkfield hero. No three.js imports — unit-testable in jsdom.
import type { GpuTier } from "@/lib/webgl/capabilities";

/** Scene-space half-extents of the hero field (camera at z=5, fov 45 ≈ ±3.2 × ±1.8). */
export const FIELD_X = 3.2;
export const FIELD_Y = 1.8;
const FIELD_Z = 0.4;

/**
 * Deterministic lattice target positions (Float32Array xyz triplets): a centered
 * grid spanning the hero bounds with a tiny hashed z offset so the resolved state
 * still has depth. Same count → identical output (stable across remounts).
 */
export function latticeTargets(count: number): Float32Array {
  if (count <= 0) throw new Error(`latticeTargets: non-positive count ${count}`);
  const aspect = FIELD_X / FIELD_Y;
  const rows = Math.max(1, Math.round(Math.sqrt(count / aspect)));
  const cols = Math.max(1, Math.ceil(count / rows));
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const fx = cols === 1 ? 0.5 : c / (cols - 1);
    const fy = rows === 1 ? 0.5 : r / (rows - 1);
    // deterministic hash for shallow z depth
    const h = Math.sin(i * 12.9898) * 43758.5453;
    const z = ((h - Math.floor(h)) - 0.5) * 2 * FIELD_Z;
    // Scale to (0..1) * factor so no coordinate exactly hits the boundary in float32.
    // Float32 cannot represent 3.2/1.8/0.4 exactly and rounds up; staying just inside
    // avoids a false bound violation when the test reads back through Float32Array.
    const scale = 1 - 1e-5;
    out[i * 3] = (fx - 0.5) * 2 * FIELD_X * scale;
    out[i * 3 + 1] = (fy - 0.5) * 2 * FIELD_Y * scale;
    out[i * 3 + 2] = z * scale;
  }
  return out;
}

const TIER_COUNTS: Record<string, number> = { high: 12000, mid: 5000, low: 2500, off: 0 };

/** Particle budget per GPU tier; unknown values get the conservative low budget. */
export function particleCountForTier(tier: GpuTier | "mid"): number {
  return TIER_COUNTS[tier] ?? 2500;
}

export interface SceneRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Map client pixel coords to Inkfield scene coords (x right, y up, centered). */
export function pointerToScene(clientX: number, clientY: number, rect: SceneRect): { x: number; y: number } {
  const nx = rect.width > 0 ? (clientX - rect.left) / rect.width : 0.5;
  const ny = rect.height > 0 ? (clientY - rect.top) / rect.height : 0.5;
  return { x: (nx - 0.5) * 2 * FIELD_X, y: (0.5 - ny) * 2 * FIELD_Y };
}
