import { describe, it, expect, afterEach, vi } from "vitest";
import { prefersReducedMotion } from "@/lib/motion";

afterEach(() => {
  document.documentElement.removeAttribute("data-reduce-motion");
  vi.restoreAllMocks();
});

describe("prefersReducedMotion", () => {
  it("is true when the user toggle set data-reduce-motion (OS pref off)", () => {
    document.documentElement.setAttribute("data-reduce-motion", "");
    expect(prefersReducedMotion()).toBe(true);
  });

  it("is false when neither the attribute nor the OS media query is set", () => {
    // tests/setup.ts stubs matchMedia → matches:false
    expect(prefersReducedMotion()).toBe(false);
  });

  it("is true when the OS media query matches (no attribute)", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(),
      removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList);
    expect(prefersReducedMotion()).toBe(true);
  });
});
