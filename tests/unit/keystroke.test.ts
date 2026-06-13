import { describe, expect, it } from "vitest";
import { chapterForProgress, typedCount } from "@/lib/showpiece/keystroke";

describe("chapterForProgress", () => {
  it("maps [0,1) progress to evenly sized chapters", () => {
    expect(chapterForProgress(0, 3)).toBe(0);
    expect(chapterForProgress(0.2, 3)).toBe(0);
    expect(chapterForProgress(0.34, 3)).toBe(1);
    expect(chapterForProgress(0.67, 3)).toBe(2);
    expect(chapterForProgress(1, 3)).toBe(2); // clamps to last
  });
  it("guards bad input", () => {
    expect(chapterForProgress(-1, 3)).toBe(0);
    expect(chapterForProgress(0.5, 0)).toBe(0);
  });
});

describe("typedCount", () => {
  it("reveals characters across the first ~70% of a chapter, then holds full", () => {
    expect(typedCount(10, 0)).toBe(0);
    expect(typedCount(10, 0.35)).toBe(5); // halfway through the typing window
    expect(typedCount(10, 0.7)).toBe(10); // fully typed by 70% in
    expect(typedCount(10, 1)).toBe(10);
  });
  it("never exceeds length or returns negatives", () => {
    expect(typedCount(4, 2)).toBe(4);
    expect(typedCount(4, -1)).toBe(0);
    expect(typedCount(0, 0.5)).toBe(0);
  });
});
