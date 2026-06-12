# Hero 3D (P14) — scroll-driven WebGL hero

Two theme-aware R3F hero scenes built on the P13 rig (`FOUNDATION-3D.md`). Decorative only —
the hero copy/portrait always live in the DOM; the 3D sits below them (`z-10` on the content)
and is `pointer-events-none` + `aria-hidden`.

## Variants & the live switch
- **`restrained` (Editorial, default)** — `editorial-scene.tsx`: a distorted accent icosahedron
  (drei `MeshDistortMaterial`) nestled behind the portrait; slow spin + scroll parallax + damped
  cursor tilt.
- **`bold` (Constellation)** — `constellation-scene.tsx`: a fibonacci node-field sphere + nearest-
  neighbour links + `@react-three/postprocessing` Bloom; scroll drives rotation/dispersion, cursor
  parallaxes. On-theme "neural" look for AI/Data Science.
- **`off`** — no canvas, the static editorial hero exactly as before.

Switch live (no rebuild) via the URL: `/?hero=restrained`, `/?hero=bold`, `/?hero=off`.
Default is `HERO_3D_DEFAULT` in `lib/site.ts`. Parsing is pure + unit-tested (`lib/hero/hero-variant.ts`).

## Files
- `lib/hero/hero-variant.ts` — `parseHeroVariant` (pure, TDD).
- `components/three/use-hero-variant.ts` — SSR-safe variant hook + `useThemePalette()` (reads
  `palettes[theme]` from next-themes → hex for three materials; theme-reactive, no CSS-var probing).
- `components/three/use-pointer.ts` — damped pointer store read in `useFrame` (pointer-fine + no-RM
  only; centred otherwise). Pure `dampedStep` is TDD'd.
- `components/three/hero/{editorial,constellation}-scene.tsx` — the two scenes.
- `components/three/hero/hero-scene-mount.tsx` — picks variant, `dynamic(ssr:false)` loads the scene,
  routes it through `SceneSlot` (`minTier` low for editorial, high for constellation).
- `components/sections/hero.tsx` — mounts `<HeroSceneMount/>` below the copy.

## Guarantees / gotchas
- Reduced-motion / no-WebGL2 / Save-Data / low-tier ⇒ `SceneSlot` fallback ⇒ no canvas (static hero).
- `three` stays code-split off the home initial JS (dynamic ssr:false; P13).
- **Canvas height:** a child Canvas using `h-full` needs every ancestor to carry height — `LazyMount`
  now sets `h-full w-full` for exactly this (a height-less wrapper collapsed the canvas to ~150px).
- Colours come from the theme palette only (no hardcoded hex in shipped hero scenes).
- Bloom only "glows" on dark themes; on light themes the field reads as subtle dots (intended).

## Status
Both variants implemented + verified (Midnight + Daylight, desktop; 0 console errors). **Pending the
user's pick of the default variant** (`HERO_3D_DEFAULT`). Next: P15 (needs Higgsfield).
