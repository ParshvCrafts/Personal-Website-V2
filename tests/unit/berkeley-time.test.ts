import { describe, expect, it } from "vitest";
import { formatBerkeleyTime } from "@/lib/status/berkeley-time";

describe("formatBerkeleyTime", () => {
  it("formats a UTC instant as Berkeley wall-clock (PDT in summer)", () => {
    // 2026-06-15T02:42:00Z = 2026-06-14 19:42 in America/Los_Angeles (UTC-7, PDT)
    const out = formatBerkeleyTime(new Date("2026-06-15T02:42:00Z"));
    expect(out.time).toBe("7:42 PM");
    expect(out.zone).toBe("PDT");
  });
  it("zero-pads minutes and handles AM (PST in winter)", () => {
    // 2026-01-15T17:05:00Z = 2026-01-15 09:05 in America/Los_Angeles (UTC-8, PST)
    const out = formatBerkeleyTime(new Date("2026-01-15T17:05:00Z"));
    expect(out.time).toBe("9:05 AM");
    expect(out.zone).toBe("PST");
  });
});
