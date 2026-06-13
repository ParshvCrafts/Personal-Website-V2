import { describe, expect, it } from "vitest";
import { parseShowpieceVariant, SHOWPIECE_VARIANTS } from "@/lib/showpiece/showpiece-variant";

describe("parseShowpieceVariant", () => {
  it("lists the three variants", () => {
    expect(SHOWPIECE_VARIANTS).toEqual(["cinematic", "keystroke", "keyboard"]);
  });
  it("reads ?show= and normalizes case/space", () => {
    expect(parseShowpieceVariant("?show=keystroke")).toBe("keystroke");
    expect(parseShowpieceVariant("?show=KEYBOARD")).toBe("keyboard");
    expect(parseShowpieceVariant("?show=%20cinematic%20")).toBe("cinematic");
  });
  it("falls back to cinematic for missing/unknown", () => {
    expect(parseShowpieceVariant("")).toBe("cinematic");
    expect(parseShowpieceVariant("?show=bogus")).toBe("cinematic");
    expect(parseShowpieceVariant("?x=1")).toBe("cinematic");
  });
  it("honors an explicit fallback arg", () => {
    expect(parseShowpieceVariant("", "keystroke")).toBe("keystroke");
  });
});
