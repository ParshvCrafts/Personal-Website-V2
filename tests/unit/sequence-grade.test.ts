import { describe, expect, it } from "vitest";
import { gradeForTheme } from "@/lib/sequence-grade";

describe("gradeForTheme", () => {
  it("maps light-background themes to the light grade", () => {
    expect(gradeForTheme("daylight")).toBe("light");
    expect(gradeForTheme("manuscript")).toBe("light");
  });

  it("maps dark themes to the dark grade", () => {
    expect(gradeForTheme("midnight")).toBe("dark");
    expect(gradeForTheme("neon")).toBe("dark");
  });

  it("defaults to dark for undefined (pre-hydration) and unknown values", () => {
    expect(gradeForTheme(undefined)).toBe("dark");
    expect(gradeForTheme("system")).toBe("dark");
  });
});
