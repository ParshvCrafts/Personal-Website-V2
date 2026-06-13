export const HERO_VARIANTS = ["ink", "restrained", "bold", "off"] as const;
export type HeroVariant = (typeof HERO_VARIANTS)[number];

function isHeroVariant(v: string): v is HeroVariant {
  return (HERO_VARIANTS as readonly string[]).includes(v);
}

/**
 * Resolve the hero 3D variant from a `location.search` string (`?hero=bold`).
 * Unknown/missing values fall back to `fallback`. Pure — safe on the server.
 */
export function parseHeroVariant(search: string, fallback: HeroVariant = "ink"): HeroVariant {
  const raw = new URLSearchParams(search).get("hero");
  if (!raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  return isHeroVariant(normalized) ? normalized : fallback;
}
