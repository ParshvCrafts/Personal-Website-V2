import { describe, expect, it } from "vitest";
import { createScrollStore, clamp01 } from "@/lib/webgl/scroll-store";

describe("clamp01", () => {
  it("clamps below 0", () => expect(clamp01(-0.5)).toBe(0));
  it("clamps above 1", () => expect(clamp01(1.4)).toBe(1));
  it("passes through in-range", () => expect(clamp01(0.42)).toBe(0.42));
  it("returns 0 for non-finite", () => expect(clamp01(Number.NaN)).toBe(0));
});

describe("createScrollStore", () => {
  it("starts at the clamped initial value", () => {
    expect(createScrollStore(2).get()).toBe(1);
  });
  it("defaults to 0", () => {
    expect(createScrollStore().get()).toBe(0);
  });
  it("set clamps and updates get", () => {
    const s = createScrollStore();
    s.set(0.7);
    expect(s.get()).toBe(0.7);
    s.set(5);
    expect(s.get()).toBe(1);
  });
});
