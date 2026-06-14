import { describe, expect, it } from "vitest";
import { TOUR_STEPS, resolveVisibleSteps } from "@/lib/tour/steps";

describe("TOUR_STEPS", () => {
  it("has unique ids and non-empty targets/copy", () => {
    const ids = TOUR_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of TOUR_STEPS) {
      expect(s.target.length).toBeGreaterThan(0);
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(0);
    }
  });
});

describe("resolveVisibleSteps", () => {
  it("keeps only steps whose target is in the document", () => {
    document.body.innerHTML = `<button aria-label="Open command palette"></button><div id="contact"></div>`;
    const visible = resolveVisibleSteps(TOUR_STEPS, document);
    const ids = visible.map((s) => s.id);
    expect(ids).toContain("palette");
    expect(ids).toContain("contact");
    expect(ids).not.toContain("theme"); // radiogroup not present
  });
  it("returns empty when no targets present", () => {
    document.body.innerHTML = `<div></div>`;
    expect(resolveVisibleSteps(TOUR_STEPS, document)).toEqual([]);
  });
});
