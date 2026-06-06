import { describe, it, expect } from "vitest";
import { formatCount } from "@/components/motion/count-up";

describe("formatCount", () => {
  it("formats an integer with no decimals", () => expect(formatCount(15, 0)).toBe("15"));
  it("keeps one decimal for a GPA-style value", () => expect(formatCount(4, 1)).toBe("4.0"));
  it("rounds to the given decimals", () => expect(formatCount(3.96, 1)).toBe("4.0"));
  it("adds a suffix", () => expect(formatCount(136, 0, "+")).toBe("136+"));
});
