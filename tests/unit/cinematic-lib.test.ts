import { describe, expect, it } from "vitest";
import {
  FRAME_COUNT,
  GRADES,
  GRADE_BUDGET_BYTES,
  assertWithinBudget,
  frameFileName,
  sampleIndices,
} from "../../scripts/cinematic/lib";

describe("sampleIndices", () => {
  it("returns exactly count unique, sorted, in-range indices", () => {
    const idx = sampleIndices(336, 120);
    expect(idx).toHaveLength(120);
    expect(new Set(idx).size).toBe(120);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(idx[0]).toBeGreaterThanOrEqual(0);
    expect(idx[idx.length - 1]).toBeLessThan(336);
  });

  it("is identity-like when count equals total", () => {
    expect(sampleIndices(5, 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("throws when count exceeds total or args non-positive", () => {
    expect(() => sampleIndices(10, 11)).toThrow();
    expect(() => sampleIndices(0, 1)).toThrow();
    expect(() => sampleIndices(10, 0)).toThrow();
  });
});

describe("frameFileName", () => {
  it("pads to 4 and uses webp by default", () => {
    expect(frameFileName(1)).toBe("frame_0001.webp");
    expect(frameFileName(120)).toBe("frame_0120.webp");
  });
});

describe("budget + grades", () => {
  it("accepts under-budget and rejects over-budget totals", () => {
    expect(() => assertWithinBudget("dark", GRADE_BUDGET_BYTES)).not.toThrow();
    expect(() => assertWithinBudget("dark", GRADE_BUDGET_BYTES + 1)).toThrow(/dark/);
  });
  it("defines dark and light grades with sharp-safe params", () => {
    expect(GRADES.map((g) => g.name)).toEqual(["dark", "light"]);
    for (const g of GRADES) {
      expect(g.gamma).toBeGreaterThanOrEqual(1.0);
      expect(g.gamma).toBeLessThanOrEqual(3.0);
      expect(g.brightness).toBeGreaterThan(0);
      expect(g.saturation).toBeGreaterThanOrEqual(0);
    }
    expect(FRAME_COUNT).toBe(120);
  });
});
