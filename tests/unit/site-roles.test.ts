import { describe, it, expect } from "vitest";
import { HERO_ROLES, nextRoleIndex } from "@/lib/site";

describe("hero roles", () => {
  it("has at least 3 roles, all non-empty", () => {
    expect(HERO_ROLES.length).toBeGreaterThanOrEqual(3);
    for (const r of HERO_ROLES) expect(r.trim().length).toBeGreaterThan(0);
  });
});

describe("nextRoleIndex", () => {
  it("advances by one", () => expect(nextRoleIndex(0, 4)).toBe(1));
  it("wraps at the end", () => expect(nextRoleIndex(3, 4)).toBe(0));
  it("handles a single role", () => expect(nextRoleIndex(0, 1)).toBe(0));
  it("is safe for length 0", () => expect(nextRoleIndex(0, 0)).toBe(0));
});
