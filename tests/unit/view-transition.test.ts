import { describe, expect, it, vi } from "vitest";
import { withViewTransition } from "@/lib/view-transition";

describe("withViewTransition", () => {
  it("runs the callback directly when startViewTransition is unsupported", () => {
    const cb = vi.fn();
    // jsdom has no startViewTransition — must call through synchronously
    withViewTransition(cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("uses document.startViewTransition when available", () => {
    const cb = vi.fn();
    const start = vi.fn((fn: () => void) => fn());
    (document as unknown as { startViewTransition: typeof start }).startViewTransition = start;
    withViewTransition(cb);
    expect(start).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledTimes(1);
    delete (document as unknown as { startViewTransition?: typeof start }).startViewTransition;
  });
});
