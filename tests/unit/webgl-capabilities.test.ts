import { describe, expect, it } from "vitest";
import { resolveGpuTier, tierMeets, clampDpr, type CapabilityInputs } from "@/lib/webgl/capabilities";

const base: CapabilityInputs = {
  reducedMotion: false,
  webgl2: true,
  deviceMemory: 8,
  hardwareConcurrency: 8,
  saveData: false,
  coarsePointer: false,
};

describe("resolveGpuTier", () => {
  it("returns 'high' for a capable desktop", () => {
    expect(resolveGpuTier(base)).toBe("high");
  });
  it("returns 'off' when reduced motion is requested", () => {
    expect(resolveGpuTier({ ...base, reducedMotion: true })).toBe("off");
  });
  it("returns 'off' when WebGL2 is unavailable", () => {
    expect(resolveGpuTier({ ...base, webgl2: false })).toBe("off");
  });
  it("returns 'off' under Save-Data", () => {
    expect(resolveGpuTier({ ...base, saveData: true })).toBe("off");
  });
  it("returns 'low' for low memory", () => {
    expect(resolveGpuTier({ ...base, deviceMemory: 4 })).toBe("low");
  });
  it("returns 'low' for few cores", () => {
    expect(resolveGpuTier({ ...base, hardwareConcurrency: 4 })).toBe("low");
  });
  it("returns 'low' for a coarse pointer (touch)", () => {
    expect(resolveGpuTier({ ...base, coarsePointer: true })).toBe("low");
  });
  it("ignores undefined optional signals (stays 'high')", () => {
    expect(resolveGpuTier({ reducedMotion: false, webgl2: true })).toBe("high");
  });
});

describe("tierMeets", () => {
  it("high meets low and high", () => {
    expect(tierMeets("high", "low")).toBe(true);
    expect(tierMeets("high", "high")).toBe(true);
  });
  it("low does not meet high", () => {
    expect(tierMeets("low", "high")).toBe(false);
  });
  it("off meets nothing above off", () => {
    expect(tierMeets("off", "low")).toBe(false);
  });
});

describe("clampDpr", () => {
  it("caps at max (default 2)", () => {
    expect(clampDpr(3)).toBe(2);
  });
  it("floors at 1", () => {
    expect(clampDpr(0.5)).toBe(1);
  });
  it("respects a custom max", () => {
    expect(clampDpr(2.5, 1.5)).toBe(1.5);
  });
  it("returns 1 for non-finite input", () => {
    expect(clampDpr(Number.NaN)).toBe(1);
  });
});
