import { describe, it, expect } from "vitest";
import { activeSectionForScroll } from "@/lib/scrollspy";

const sections = [
  { id: "about", top: 0 },
  { id: "academics", top: 800 },
  { id: "projects", top: 1600 },
  { id: "contact", top: 2400 },
];

describe("activeSectionForScroll", () => {
  it("returns the first section at the very top", () =>
    expect(activeSectionForScroll(sections, 0, 100)).toBe("about"));
  it("activates a section once its top crosses the line", () =>
    expect(activeSectionForScroll(sections, 720, 100)).toBe("academics")); // 720+100 >= 800
  it("stays on the current section between boundaries", () =>
    expect(activeSectionForScroll(sections, 900, 100)).toBe("academics"));
  it("activates the last section near the bottom", () =>
    expect(activeSectionForScroll(sections, 2400, 100)).toBe("contact"));
  it("returns null for an empty list", () =>
    expect(activeSectionForScroll([], 500, 100)).toBeNull());
  it("returns null before any section crosses the line (hero in view)", () => {
    const below = [
      { id: "about", top: 900 },
      { id: "projects", top: 1700 },
    ];
    expect(activeSectionForScroll(below, 0, 88)).toBeNull(); // 0+88 < 900
  });
  it("activates a section whose top sits a pixel past the raw line (scroll rounding)", () => {
    // scroll-to lands #b ~on the line; webkit rounds scrollY down so b.top is 1px
    // above the raw line (700+100=800). The boundary tolerance still activates it.
    const items = [
      { id: "a", top: 0 },
      { id: "b", top: 801 },
    ];
    expect(activeSectionForScroll(items, 700, 100)).toBe("b");
  });
  it("ignores unsorted input by reading the highest crossed top", () =>
    expect(activeSectionForScroll(sections, 1600, 100)).toBe("projects"));
});
