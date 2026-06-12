import { describe, expect, it } from "vitest";
import { dampedStep } from "@/components/three/use-pointer";

describe("dampedStep", () => {
  it("moves current toward target by the damping factor", () => {
    expect(dampedStep(0, 1, 0.25)).toBeCloseTo(0.25, 5);
  });
  it("converges (repeated steps approach the target)", () => {
    let v = 0;
    for (let i = 0; i < 50; i++) v = dampedStep(v, 1, 0.2);
    expect(v).toBeCloseTo(1, 2);
  });
  it("clamps the factor to [0,1]", () => {
    expect(dampedStep(0, 10, 5)).toBe(10); // factor>1 clamped to 1 → jumps to target
    expect(dampedStep(3, 10, -1)).toBe(3); // factor<0 clamped to 0 → no move
  });
  it("returns current for non-finite target", () => {
    expect(dampedStep(2, Number.NaN, 0.5)).toBe(2);
  });
});
