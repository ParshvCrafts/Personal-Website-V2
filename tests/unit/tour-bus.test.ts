import { describe, expect, it, vi } from "vitest";
import { subscribeStartTour, requestStartTour } from "@/lib/tour/tour-bus";

describe("tour bus", () => {
  it("notifies subscribers and stops after unsubscribe", () => {
    const cb = vi.fn();
    const off = subscribeStartTour(cb);
    requestStartTour();
    expect(cb).toHaveBeenCalledTimes(1);
    off();
    requestStartTour();
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
