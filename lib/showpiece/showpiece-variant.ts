export const SHOWPIECE_VARIANTS = ["cinematic", "keystroke", "keyboard"] as const;
export type ShowpieceVariant = (typeof SHOWPIECE_VARIANTS)[number];

function isShowpieceVariant(v: string): v is ShowpieceVariant {
  return (SHOWPIECE_VARIANTS as readonly string[]).includes(v);
}

/**
 * Resolve the scroll-showpiece variant from a `location.search` string
 * (`?show=keystroke`). Unknown/missing → `fallback`. Pure; safe on the server.
 */
export function parseShowpieceVariant(
  search: string,
  fallback: ShowpieceVariant = "cinematic",
): ShowpieceVariant {
  const raw = new URLSearchParams(search).get("show");
  if (!raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  return isShowpieceVariant(normalized) ? normalized : fallback;
}
