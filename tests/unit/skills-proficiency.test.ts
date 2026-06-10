import { describe, it, expect } from "vitest";
import { SKILL_PROFICIENCY } from "@/content/skills-proficiency";

describe("skill proficiency", () => {
  it("every level is within 0–100", () => {
    expect(SKILL_PROFICIENCY.every((s) => s.level >= 0 && s.level <= 100)).toBe(true);
  });
  it("has at least 8 skills with unique names", () => {
    const names = SKILL_PROFICIENCY.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBeGreaterThanOrEqual(8);
  });
});
