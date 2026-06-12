import { describe, expect, it } from "vitest";
import { FEATURED_HOBBIES, SECONDARY_HOBBIES } from "@/content/hobbies";

describe("hobbies content", () => {
  it("has unique ids across featured + secondary hobbies", () => {
    const ids = [...FEATURED_HOBBIES, ...SECONDARY_HOBBIES].map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes the food-travel secondary hobby", () => {
    const ft = SECONDARY_HOBBIES.find((h) => h.id === "food-travel");
    expect(ft).toBeDefined();
    expect(ft?.title.length).toBeGreaterThan(0);
    expect(ft?.description.length).toBeGreaterThan(0);
  });

  it("gives every secondary hobby a valid accentHue (0–360)", () => {
    for (const h of SECONDARY_HOBBIES) {
      expect(h.accentHue, `${h.id} accentHue`).toBeTypeOf("number");
      expect(h.accentHue).toBeGreaterThanOrEqual(0);
      expect(h.accentHue).toBeLessThan(360);
    }
  });

  it("keeps non-empty copy on every hobby", () => {
    for (const h of [...FEATURED_HOBBIES, ...SECONDARY_HOBBIES]) {
      expect(h.title.trim().length).toBeGreaterThan(0);
      expect(h.role.trim().length).toBeGreaterThan(0);
      expect(h.description.trim().length).toBeGreaterThan(0);
      expect(h.iconName.trim().length).toBeGreaterThan(0);
    }
  });
});
