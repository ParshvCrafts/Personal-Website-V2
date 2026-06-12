// Pure logic for the P15 cinematic pipeline. No I/O here — keep it unit-testable.

export interface GradeSpec {
  name: "dark" | "light";
  /** Invert luminance (light grade turns bright ink on black into dark ink on paper). */
  negate: boolean;
  /** sharp .gamma() — valid range 1.0–3.0; 1.0 means "skip". */
  gamma: number;
  /** sharp .modulate() params. */
  brightness: number;
  saturation: number;
}

export const GRADES: GradeSpec[] = [
  { name: "dark", negate: false, gamma: 1.0, brightness: 1.0, saturation: 1.05 },
  { name: "light", negate: true, gamma: 1.05, brightness: 1.04, saturation: 0.9 },
];

export const SEQUENCE_ID = "intelligence";
export const FRAME_COUNT = 120;
export const FRAME_WIDTH = 1280;
export const FRAME_HEIGHT = 720;
export const FRAME_PAD = 4;
/** Hard per-grade weight ceiling from the spec (≈20 KB/frame × 120). */
export const GRADE_BUDGET_BYTES = 2.5 * 1024 * 1024;

/**
 * Evenly sample `count` indices from [0, total). Centered sampling — frame i
 * represents the middle of its time bucket, avoiding first/last-frame bias.
 */
export function sampleIndices(total: number, count: number): number[] {
  if (total <= 0 || count <= 0) throw new Error(`sampleIndices: non-positive args ${total}/${count}`);
  if (count > total) throw new Error(`sampleIndices: count ${count} exceeds total ${total}`);
  return Array.from({ length: count }, (_, i) =>
    Math.min(total - 1, Math.floor(((i + 0.5) * total) / count)),
  );
}

export function frameFileName(oneBasedIndex: number, pad = FRAME_PAD, ext = "webp"): string {
  return `frame_${String(oneBasedIndex).padStart(pad, "0")}.${ext}`;
}

export function assertWithinBudget(
  name: string,
  totalBytes: number,
  budget = GRADE_BUDGET_BYTES,
): void {
  if (totalBytes > budget) {
    throw new Error(
      `${name} grade is ${totalBytes} bytes — exceeds budget ${budget}. Lower SEQ_QUALITY and re-run grade.`,
    );
  }
}
