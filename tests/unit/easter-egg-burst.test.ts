import { describe, expect, it, vi } from "vitest";
import { subscribeBurst, emitBurst } from "@/lib/easter-egg/burst";

describe("burst bus", () => {
  it("notifies subscribers on emit and stops after unsubscribe", () => {
    const cb = vi.fn();
    const off = subscribeBurst(cb);
    emitBurst();
    emitBurst();
    expect(cb).toHaveBeenCalledTimes(2);
    off();
    emitBurst();
    expect(cb).toHaveBeenCalledTimes(2);
  });
});
