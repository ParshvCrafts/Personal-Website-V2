import { describe, it, expect } from "vitest";
import { frameForProgress } from "@/lib/motion";

describe("frameForProgress", () => {
  it("maps 0 → first frame", () => expect(frameForProgress(0, 120)).toBe(0));
  it("maps 1 → last frame", () => expect(frameForProgress(1, 120)).toBe(119));
  it("maps 0.5 → middle frame", () => expect(frameForProgress(0.5, 121)).toBe(60));
  it("clamps below 0", () => expect(frameForProgress(-0.2, 50)).toBe(0));
  it("clamps above 1", () => expect(frameForProgress(1.5, 50)).toBe(49));
  it("single-frame sequence is always 0", () => expect(frameForProgress(0.7, 1)).toBe(0));
  it("rounds to nearest frame", () => expect(frameForProgress(0.51, 11)).toBe(5));
});
