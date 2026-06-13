import { describe, expect, it } from "vitest";
import {
  latticeTargets,
  particleCountForTier,
  pointerToScene,
} from "@/lib/hero/inkfield";

describe("latticeTargets", () => {
  it("returns count*3 floats, deterministic, centered, within bounds", () => {
    const a = latticeTargets(500);
    const b = latticeTargets(500);
    expect(a).toHaveLength(1500);
    expect(Array.from(a)).toEqual(Array.from(b)); // deterministic
    let sx = 0;
    for (let i = 0; i < a.length; i += 3) {
      sx += a[i];
      expect(Math.abs(a[i])).toBeLessThanOrEqual(3.2); // x bound
      expect(Math.abs(a[i + 1])).toBeLessThanOrEqual(1.8); // y bound
      expect(Math.abs(a[i + 2])).toBeLessThanOrEqual(0.4); // shallow z
    }
    expect(Math.abs(sx / (a.length / 3))).toBeLessThan(0.2); // roughly centered
  });

  it("throws on non-positive count", () => {
    expect(() => latticeTargets(0)).toThrow();
  });
});

describe("particleCountForTier", () => {
  it("maps tiers to counts with a safe default", () => {
    expect(particleCountForTier("high")).toBe(12000);
    expect(particleCountForTier("low")).toBe(5000);
    expect(particleCountForTier("off")).toBe(0);
    // @ts-expect-error unknown tier falls back safely
    expect(particleCountForTier("weird")).toBe(5000);
  });
});

describe("pointerToScene", () => {
  it("maps client coords to scene coords within the hero rect", () => {
    const rect = { left: 0, top: 0, width: 1000, height: 500 };
    expect(pointerToScene(500, 250, rect)).toEqual({ x: 0, y: 0 });
    const p = pointerToScene(1000, 0, rect);
    expect(p.x).toBeCloseTo(3.2);
    expect(p.y).toBeCloseTo(1.8);
  });
});
