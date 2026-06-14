export const KONAMI_SEQUENCE = [
  "arrowup", "arrowup", "arrowdown", "arrowdown",
  "arrowleft", "arrowright", "arrowleft", "arrowright",
  "b", "a",
] as const;

/** Stateful sequence detector. `push(key)` returns true on completing the code. */
export function createKonamiMatcher(): { push: (key: string) => boolean } {
  let idx = 0;
  return {
    push(key: string): boolean {
      const k = key.toLowerCase();
      if (k === KONAMI_SEQUENCE[idx]) {
        idx += 1;
        if (idx === KONAMI_SEQUENCE.length) { idx = 0; return true; }
        return false;
      }
      // Mismatch: restart; allow this key to seed a fresh attempt.
      idx = k === KONAMI_SEQUENCE[0] ? 1 : 0;
      return false;
    },
  };
}
