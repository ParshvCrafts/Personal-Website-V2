// lib/showpiece/keyboard-timeline.ts
// Pure scheduling for the 3D Keyboard showpiece. No three.js — jsdom-safe.

export const WORDS = ["DATA", "STRUCTURE", "INTELLIGENCE"] as const;

/** Which word index is active at overall scroll progress p∈[0,1]. */
export function wordForProgress(p: number): number {
  const n = WORDS.length;
  const clamped = Math.min(0.999999, Math.max(0, p));
  return Math.min(n - 1, Math.floor(clamped * n));
}

/**
 * Depress amount [0,1] for the key at `keyIndex` within a word of length
 * `wordLen`, given the word's local progress `local`∈[0,1]. Keys press in
 * sequence: key i peaks (fully down) as `local` passes (i+0.5)/wordLen, easing
 * back to rest outside its press window. Out-of-range keys return 0.
 */
export function keyDepth(keyIndex: number, wordLen: number, local: number): number {
  if (wordLen <= 0 || keyIndex < 0 || keyIndex >= wordLen) return 0;
  const center = (keyIndex + 0.5) / wordLen;
  const half = 0.5 / wordLen;
  const d = Math.abs(Math.min(1, Math.max(0, local)) - center);
  return Math.max(0, 1 - d / half);
}
