"use client";

import dynamic from "next/dynamic";
import { SceneSlot } from "../scene-slot";
import { useHeroVariant } from "../use-hero-variant";

const EditorialScene = dynamic(() => import("./editorial-scene").then((m) => m.EditorialScene), {
  ssr: false,
});
const ConstellationScene = dynamic(
  () => import("./constellation-scene").then((m) => m.ConstellationScene),
  { ssr: false },
);
const InkfieldScene = dynamic(() => import("./inkfield-scene").then((m) => m.InkfieldScene), {
  ssr: false,
});

/**
 * Decorative hero 3D layer. Picks the variant (`?hero=` / default), lazily loads it,
 * and routes it through the SceneSlot gateway so reduced-motion / no-WebGL / low-tier
 * fall back to the static hero (fallback={null} — the aurora already provides atmosphere).
 */
export function HeroSceneMount() {
  const variant = useHeroVariant();
  if (variant === "off") return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <SceneSlot
        minTier={variant === "bold" ? "high" : "low"}
        className="h-full w-full"
        fallback={null}
        render={(tier) =>
          variant === "ink" ? (
            <InkfieldScene tier={tier} />
          ) : variant === "bold" ? (
            <ConstellationScene />
          ) : (
            <EditorialScene />
          )
        }
      />
    </div>
  );
}
