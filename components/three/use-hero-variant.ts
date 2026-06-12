"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { parseHeroVariant, type HeroVariant } from "@/lib/hero/hero-variant";
import { HERO_3D_DEFAULT } from "@/lib/site";
import { palettes, DEFAULT_THEME, type Palette, type ThemeName } from "@/lib/theme/palettes";

/**
 * SSR-safe hero variant. Returns the configured default until mounted, then reads a
 * `?hero=restrained|bold|off` override from the URL so the user can A/B live.
 */
export function useHeroVariant(): HeroVariant {
  const [variant, setVariant] = useState<HeroVariant>(HERO_3D_DEFAULT);
  useEffect(() => {
    const read = () => setVariant(parseHeroVariant(window.location.search, HERO_3D_DEFAULT));
    read();
  }, []);
  return variant;
}

/** Current theme palette (hex values), consumable directly by three.js materials. */
export function useThemePalette(): Palette {
  const { theme } = useTheme();
  const name = (theme && theme in palettes ? theme : DEFAULT_THEME) as ThemeName;
  return palettes[name];
}
