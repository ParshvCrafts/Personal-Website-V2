import { describe, it, expect } from "vitest";
import { NAV_SECTIONS, SOCIAL_LINKS, SITE } from "@/lib/site";

describe("site config", () => {
  it("has at least 5 nav sections", () => expect(NAV_SECTIONS.length).toBeGreaterThanOrEqual(5));
  it("nav section ids are unique", () => {
    const ids = NAV_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("every nav section has a non-empty id and label", () => {
    for (const s of NAV_SECTIONS) {
      expect(s.id).toMatch(/^[a-z][a-z-]*$/);
      expect(s.label.length).toBeGreaterThan(0);
    }
  });
  it("exposes the canonical socials + identity", () => {
    expect(SOCIAL_LINKS.github).toContain("github.com/ParshvCrafts");
    expect(SOCIAL_LINKS.linkedin).toContain("linkedin.com/in/parshv-patel");
    expect(SOCIAL_LINKS.email).toBe("parshvpatel_0910@berkeley.edu");
    expect(SITE.name).toBe("Parshv Patel");
  });
});
