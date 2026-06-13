// Pure math for the Keystroke showpiece. No GSAP/DOM — unit-testable in jsdom.

/** Which 0-based chapter is committed at scroll progress p∈[0,1] for `count` chapters. */
export function chapterForProgress(p: number, count: number): number {
  if (count <= 0) return 0;
  const clamped = Math.min(0.999999, Math.max(0, p));
  return Math.min(count - 1, Math.floor(clamped * count));
}

/**
 * Characters revealed for a chapter, given the chapter's local progress
 * `local`∈[0,1]. Typing completes at 70% so each chapter holds fully-typed
 * before the snap to the next — the "committed keystroke" feel.
 */
export function typedCount(length: number, local: number): number {
  if (length <= 0) return 0;
  const TYPE_WINDOW = 0.7;
  const t = Math.min(1, Math.max(0, local) / TYPE_WINDOW);
  return Math.min(length, Math.round(t * length));
}
