import { describe, expect, it } from "vitest";
import { createKonamiMatcher, KONAMI_SEQUENCE } from "@/lib/easter-egg/konami";

const feed = (keys: readonly string[]) => {
  const m = createKonamiMatcher();
  return keys.map((k) => m.push(k));
};

describe("createKonamiMatcher", () => {
  it("returns true only on the final key of the full sequence", () => {
    const out = feed(KONAMI_SEQUENCE);
    expect(out.slice(0, -1).every((x) => x === false)).toBe(true);
    expect(out.at(-1)).toBe(true);
  });
  it("is case-insensitive for b/a", () => {
    const seq = [...KONAMI_SEQUENCE.slice(0, 8), "B", "A"];
    expect(feed(seq).at(-1)).toBe(true);
  });
  it("recovers when a wrong key interrupts then the sequence restarts", () => {
    const m = createKonamiMatcher();
    m.push("ArrowUp");
    m.push("x"); // reset
    KONAMI_SEQUENCE.forEach((k) => m.push(k));
    // after a full clean run post-reset, the last push returned true:
    const m2 = createKonamiMatcher();
    m2.push("ArrowUp"); m2.push("x");
    const out = KONAMI_SEQUENCE.map((k) => m2.push(k));
    expect(out.at(-1)).toBe(true);
  });
  it("treats a wrong key that equals the first key as a fresh start", () => {
    const m = createKonamiMatcher();
    expect(m.push("ArrowDown")).toBe(false); // wrong (expected ArrowUp), but ArrowDown !== ArrowUp → idx 0
    const out = KONAMI_SEQUENCE.map((k) => m.push(k));
    expect(out.at(-1)).toBe(true);
  });
});
