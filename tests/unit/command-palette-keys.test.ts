import { describe, expect, it } from "vitest";
import { matchesOpenHotkey, wrapIndex } from "@/lib/command-palette/keys";

describe("matchesOpenHotkey", () => {
  it("matches Cmd/Ctrl+K", () => {
    expect(matchesOpenHotkey({ key: "k", metaKey: true, ctrlKey: false })).toBe(true);
    expect(matchesOpenHotkey({ key: "K", metaKey: false, ctrlKey: true })).toBe(true);
  });
  it("matches bare slash", () => {
    expect(matchesOpenHotkey({ key: "/", metaKey: false, ctrlKey: false })).toBe(true);
  });
  it("ignores plain k and modified slash", () => {
    expect(matchesOpenHotkey({ key: "k", metaKey: false, ctrlKey: false })).toBe(false);
    expect(matchesOpenHotkey({ key: "/", metaKey: true, ctrlKey: false })).toBe(false);
  });
});

describe("wrapIndex", () => {
  it("wraps forward and backward", () => {
    expect(wrapIndex(2, 3, 1)).toBe(0);
    expect(wrapIndex(0, 3, -1)).toBe(2);
    expect(wrapIndex(1, 3, 1)).toBe(2);
  });
  it("returns 0 for empty length", () => {
    expect(wrapIndex(0, 0, 1)).toBe(0);
  });
});
