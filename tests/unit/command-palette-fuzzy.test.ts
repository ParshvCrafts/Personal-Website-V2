import { describe, expect, it } from "vitest";
import { fuzzyScore, rankCommands } from "@/lib/command-palette/fuzzy";
import type { Command } from "@/lib/command-palette/types";

const cmd = (id: string, label: string, keywords?: string[]): Command =>
  ({ id, group: "Navigate", label, keywords, icon: (() => null) as never, run: () => {} });

describe("fuzzyScore", () => {
  it("returns null when query is not a subsequence", () => {
    expect(fuzzyScore("xyz", "Projects")).toBeNull();
  });
  it("returns 0 for an empty query", () => {
    expect(fuzzyScore("", "Projects")).toBe(0);
  });
  it("is case-insensitive and order-sensitive subsequence", () => {
    expect(fuzzyScore("prj", "Projects")).not.toBeNull();
    expect(fuzzyScore("jpr", "Projects")).toBeNull();
  });
  it("scores a start-anchored match higher than a mid-string match of the same query", () => {
    expect(fuzzyScore("re", "Research")!).toBeGreaterThan(fuzzyScore("re", "Career")!);
  });
  it("scores contiguous higher than scattered for the same query", () => {
    expect(fuzzyScore("con", "Contact")!).toBeGreaterThan(fuzzyScore("cnt", "Contact")!);
  });
});

describe("rankCommands", () => {
  const all = [cmd("a", "About"), cmd("p", "Projects"), cmd("c", "Contact", ["email"])];
  it("returns registry order for an empty query", () => {
    expect(rankCommands("", all).map((c) => c.id)).toEqual(["a", "p", "c"]);
  });
  it("filters out non-matches and ranks best first", () => {
    const r = rankCommands("con", all).map((c) => c.id);
    expect(r).toEqual(["c"]);
  });
  it("matches against keywords too", () => {
    expect(rankCommands("email", all).map((c) => c.id)).toEqual(["c"]);
  });
});
