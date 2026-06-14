import { describe, expect, it, vi } from "vitest";
import { shouldShowTourPrompt, TOUR_SEEN_KEY } from "@/lib/tour/tour-prompt-state";

const store = (val: string | null) => ({ getItem: vi.fn(() => val) });

describe("shouldShowTourPrompt", () => {
  it("shows when the seen key is unset", () => {
    expect(shouldShowTourPrompt(store(null))).toBe(true);
  });
  it("hides when the seen key is set", () => {
    expect(shouldShowTourPrompt(store("1"))).toBe(false);
  });
  it("hides when storage is null (SSR)", () => {
    expect(shouldShowTourPrompt(null)).toBe(false);
  });
  it("hides (never crashes) when getItem throws", () => {
    expect(shouldShowTourPrompt({ getItem: () => { throw new Error("blocked"); } })).toBe(false);
  });
  it("exports a stable key", () => {
    expect(TOUR_SEEN_KEY).toBe("pp-tour-seen");
  });
});
