import { describe, it, expect } from "vitest";

describe("registerGsap", () => {
  it("is SSR-safe (no window) and idempotent", async () => {
    const { registerGsap } = await import("@/lib/motion");
    expect(() => { registerGsap(); registerGsap(); }).not.toThrow();
  });

  it("re-exports SplitText and Flip", async () => {
    const mod = await import("@/lib/motion");
    expect(mod.SplitText).toBeDefined();
    expect(mod.Flip).toBeDefined();
  });
});
