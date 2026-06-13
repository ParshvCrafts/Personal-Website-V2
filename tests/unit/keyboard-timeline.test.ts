import { describe, expect, it } from "vitest";
import { keyDepth, WORDS, wordForProgress } from "@/lib/showpiece/keyboard-timeline";

describe("wordForProgress", () => {
  it("walks the three words across scroll", () => {
    expect(WORDS).toEqual(["DATA", "STRUCTURE", "INTELLIGENCE"]);
    expect(wordForProgress(0)).toBe(0);
    expect(wordForProgress(0.5)).toBe(1);
    expect(wordForProgress(0.99)).toBe(2);
  });
});

describe("keyDepth", () => {
  it("peaks near its scheduled press time, rests away from it", () => {
    // key index 1 in a 4-key word is centered at local (1+0.5)/4 = 0.375
    expect(keyDepth(1, 4, 0.375)).toBeGreaterThan(0.8);
    expect(keyDepth(1, 4, 0.9)).toBeLessThan(0.2);
  });
  it("clamps to [0,1] and rejects out-of-range keys", () => {
    expect(keyDepth(99, 4, 0.3)).toBe(0);
    expect(keyDepth(-1, 4, 0.3)).toBe(0);
    expect(keyDepth(0, 0, 0.3)).toBe(0);
    const v = keyDepth(0, 4, 0);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
  });
});
