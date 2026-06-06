import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { palettes, THEMES, DEFAULT_THEME, type ThemeName } from "@/lib/theme/palettes";
import { contrastRatio } from "@/lib/theme/contrast";

describe("contrast util", () => {
  it("white on black is 21:1", () => {
    expect(Math.round(contrastRatio("#FFFFFF", "#000000"))).toBe(21);
  });
});

describe("every theme meets WCAG AA", () => {
  for (const name of THEMES) {
    const p = palettes[name];
    it(`${name}: foreground/background >= 4.5`, () =>
      expect(contrastRatio(p.foreground, p.background)).toBeGreaterThanOrEqual(4.5));
    it(`${name}: heading/background >= 4.5`, () =>
      expect(contrastRatio(p.heading, p.background)).toBeGreaterThanOrEqual(4.5));
    it(`${name}: muted/background >= 4.5`, () =>
      expect(contrastRatio(p.muted, p.background)).toBeGreaterThanOrEqual(4.5));
    it(`${name}: foreground/surface >= 4.5`, () =>
      expect(contrastRatio(p.foreground, p.surface)).toBeGreaterThanOrEqual(4.5));
    it(`${name}: accent/background >= 3 (UI/large)`, () =>
      expect(contrastRatio(p.accent, p.background)).toBeGreaterThanOrEqual(3));
    it(`${name}: accent2/background >= 3 (UI/large)`, () =>
      expect(contrastRatio(p.accent2, p.background)).toBeGreaterThanOrEqual(3));
    it(`${name}: on-accent/accent >= 4.5 (button labels)`, () =>
      expect(contrastRatio(p.onAccent, p.accent)).toBeGreaterThanOrEqual(4.5));
  }
  it("has 4 themes and a valid default", () => {
    expect(THEMES).toHaveLength(4);
    expect(THEMES).toContain(DEFAULT_THEME as ThemeName);
  });
});

describe("globals.css mirrors the palette source of truth", () => {
  const css = readFileSync(resolve(__dirname, "../../app/globals.css"), "utf8").toLowerCase();
  for (const name of THEMES) {
    const p = palettes[name];
    const hexes = [
      p.background, p.elevated, p.surface, p.foreground, p.heading, p.muted,
      p.accent, p.accent2, p.onAccent, p.border, p.ring,
    ].map((h) => h.toLowerCase());
    it(`${name}: every palette hex appears in globals.css`, () => {
      const missing = hexes.filter((h) => !css.includes(h));
      expect(missing).toEqual([]);
    });
  }
});
