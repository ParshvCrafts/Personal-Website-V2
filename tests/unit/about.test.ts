import { describe, it, expect } from "vitest";
import { tabKeyToIndex } from "@/lib/about";

describe("tabKeyToIndex", () => {
  it("advances right and wraps at the end", () => {
    expect(tabKeyToIndex("ArrowRight", 0, 3)).toBe(1);
    expect(tabKeyToIndex("ArrowRight", 2, 3)).toBe(0);
  });
  it("moves left and wraps at the start", () => {
    expect(tabKeyToIndex("ArrowLeft", 0, 3)).toBe(2);
    expect(tabKeyToIndex("ArrowLeft", 2, 3)).toBe(1);
  });
  it("jumps to Home and End", () => {
    expect(tabKeyToIndex("Home", 2, 3)).toBe(0);
    expect(tabKeyToIndex("End", 0, 3)).toBe(2);
  });
  it("returns the current index for unrelated keys", () => {
    expect(tabKeyToIndex("Enter", 1, 3)).toBe(1);
  });
  it("is safe for an empty list", () => {
    expect(tabKeyToIndex("ArrowRight", 0, 0)).toBe(0);
  });
});
