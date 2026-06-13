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
  it("types in over the first third of a chapter, then holds full", () => {
    // Typing completes by 1/3 in, so the snap rest point (chapter center, local≈0.5)
    // always shows a fully-typed heading — never an empty caret.
    expect(typedCount(9, 0)).toBe(0);
    expect(typedCount(9, 1 / 6)).toBe(5); // ~halfway through the typing window (~0.167)
    expect(typedCount(9, 1 / 3)).toBe(9); // fully typed by a third in
    expect(typedCount(9, 0.5)).toBe(9); // holds full at the snap-rest center
    expect(typedCount(9, 1)).toBe(9);
  });
  it("never exceeds length or returns negatives", () => {
    expect(typedCount(4, 2)).toBe(4);
    expect(typedCount(4, -1)).toBe(0);
    expect(typedCount(0, 0.5)).toBe(0);
  });
});
