# Hero 3D (P14 + P17) — scroll-driven WebGL hero

Theme-aware R3F hero scenes built on the P13 rig (`FOUNDATION-3D.md`). Decorative only —
the hero copy/portrait always live in the DOM; the 3D sits below them (`z-10` on the content)
and is `pointer-events-none` + `aria-hidden`.

## Variants & the live switch
- **`ink` (Inkfield, default — P17)** — `inkfield-scene.tsx`: a full-bleed field of luminous ink
  particles (one `<points>` + custom GLSL `ShaderMaterial`). The vertex shader positions each
  particle statelessly from per-particle seed attributes + uniforms (`uTime` flow field, `uPointer`
  cursor vortex, `uScroll` chaos→lattice morph). Dark themes use additive blending (luminous ink on
  black); light themes use normal blending (dark ink on paper) — the Signal film's two grades, live.
  Tiered: `particleCountForTier` = 12k high / 5k low. Cursor stirs the field; scroll resolves the
  chaos into an ordered lattice (`lib/hero/inkfield.ts`, pure + TDD).
- **`restrained` (Editorial)** — `editorial-scene.tsx`: a distorted accent icosahedron
  (drei `MeshDistortMaterial`) nestled behind the portrait; slow spin + scroll parallax + damped
  cursor tilt.
- **`bold` (Constellation)** — `constellation-scene.tsx`: a fibonacci node-field sphere + nearest-
  neighbour links + `@react-three/postprocessing` Bloom; scroll drives rotation/dispersion, cursor
  parallaxes.
- **`off`** — no canvas, the static editorial hero exactly as before.

Switch live (no rebuild) via the URL: `/?hero=ink`, `/?hero=restrained`, `/?hero=bold`, `/?hero=off`.
Default is `HERO_3D_DEFAULT` in `lib/site.ts` (now `"ink"`). Parsing is pure + unit-tested
(`lib/hero/hero-variant.ts`).

## Files
- `lib/hero/hero-variant.ts` — `parseHeroVariant` (pure, TDD).
- `components/three/use-hero-variant.ts` — SSR-safe variant hook + `useThemePalette()` (reads
  `palettes[theme]` from next-themes → hex for three materials; theme-reactive, no CSS-var probing).
- `components/three/use-pointer.ts` — damped pointer store read in `useFrame` (pointer-fine + no-RM
  only; centred otherwise). Pure `dampedStep` is TDD'd.
- `lib/hero/inkfield.ts` — `latticeTargets` / `particleCountForTier` / `pointerToScene` (pure, TDD).
- `components/three/hero/{inkfield,editorial,constellation}-scene.tsx` — the three scenes. The
  Inkfield `Field` is keyed on `${accent}-${colorScheme}` so a theme switch remounts it (rebuilds
  colors + blending together — swapping a live uniforms object identity is an R3F pitfall).
- `components/three/hero/hero-scene-mount.tsx` — picks variant, `dynamic(ssr:false)` loads the scene,
  routes it through `SceneSlot` (`minTier` low for ink/editorial, high for constellation; `SceneSlot`
  passes the resolved `tier` to the ink scene for its particle budget).
- `components/sections/hero.tsx` — mounts `<HeroSceneMount/>` below the copy; carries
  `data-cursor="field"` so the custom cursor shows a crosshair over the field.

## Guarantees / gotchas
- Reduced-motion / no-WebGL2 / Save-Data / low-tier ⇒ `SceneSlot` fallback ⇒ no canvas (static hero).
- `three` stays code-split off the home initial JS (dynamic ssr:false; P13).
- **Canvas height:** a child Canvas using `h-full` needs every ancestor to carry height — `LazyMount`
  now sets `h-full w-full` for exactly this (a height-less wrapper collapsed the canvas to ~150px).
- Colours come from the theme palette only (no hardcoded hex in shipped hero scenes).
- Bloom only "glows" on dark themes; on light themes the field reads as subtle dots (intended).

## Status
All three variants implemented + verified across 4 themes + mobile + reduced-motion (0 console
errors). Default = `ink` (P17). The editorial/constellation scenes are retained behind the flag.
