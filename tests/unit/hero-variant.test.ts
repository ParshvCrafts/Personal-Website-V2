import { describe, expect, it } from "vitest";
import { parseHeroVariant, HERO_VARIANTS } from "@/lib/hero/hero-variant";

describe("parseHeroVariant", () => {
  it("reads a valid variant from the query string", () => {
    expect(parseHeroVariant("?hero=bold")).toBe("bold");
    expect(parseHeroVariant("?hero=restrained")).toBe("restrained");
    expect(parseHeroVariant("?hero=off")).toBe("off");
  });
  it("is case-insensitive and trims", () => {
    expect(parseHeroVariant("?hero=BOLD")).toBe("bold");
  });
  it("falls back to the default for junk or missing values", () => {
    expect(parseHeroVariant("?hero=sparkles")).toBe("ink");
    expect(parseHeroVariant("?foo=1")).toBe("ink");
    expect(parseHeroVariant("")).toBe("ink");
  });
  it("accepts a custom default", () => {
    expect(parseHeroVariant("", "bold")).toBe("bold");
  });
  it("exposes the canonical variant list", () => {
    expect(HERO_VARIANTS).toEqual(["ink", "restrained", "bold", "off"]);
  });
  it("accepts the ink variant", () => {
    expect(parseHeroVariant("?hero=ink")).toBe("ink");
  });
});
