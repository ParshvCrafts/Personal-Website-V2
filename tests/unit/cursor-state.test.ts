import { describe, expect, it } from "vitest";
import { cursorStateFor } from "@/lib/cursor-state";

function el(html: string): Element {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root.querySelector("[data-probe]")!;
}

describe("cursorStateFor", () => {
  it("returns view for data-cursor=view ancestors", () => {
    expect(cursorStateFor(el(`<article data-cursor="view"><h3 data-probe>x</h3></article>`))).toBe("view");
  });
  it("returns field for the hero field layer", () => {
    expect(cursorStateFor(el(`<div data-cursor="field"><canvas data-probe></canvas></div>`))).toBe("field");
  });
  it("returns link for interactive elements", () => {
    expect(cursorStateFor(el(`<a href="#" data-probe>x</a>`))).toBe("link");
    expect(cursorStateFor(el(`<button data-probe>x</button>`))).toBe("link");
    expect(cursorStateFor(el(`<div role="button" data-probe>x</div>`))).toBe("link");
  });
  it("data-cursor wins over tag heuristics", () => {
    expect(cursorStateFor(el(`<a href="#" data-cursor="view" data-probe>x</a>`))).toBe("view");
  });
  it("an interactive element nested INSIDE a tagged container wins over the container", () => {
    // e.g. the hero section is data-cursor=field, but its CTA links must read as links
    expect(
      cursorStateFor(el(`<section data-cursor="field"><a href="#" data-probe>cta</a></section>`)),
    ).toBe("link");
  });
  it("returns default otherwise and for null", () => {
    expect(cursorStateFor(el(`<p data-probe>x</p>`))).toBe("default");
    expect(cursorStateFor(null)).toBe("default");
  });
});
