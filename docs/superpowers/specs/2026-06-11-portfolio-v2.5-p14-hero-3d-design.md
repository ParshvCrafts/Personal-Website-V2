# P14 — Scroll-driven 3D Hero (design spec)

**Program:** Portfolio v2.5 "Signature" (`docs/v2/ROADMAP-V2.5-SIGNATURE.md`).
**Date:** 2026-06-11 · **Branch:** `feat/portfolio-v2` · Builds on the P13 rig (`docs/v2/FOUNDATION-3D.md`).

## 1. Purpose
Give the hero one unforgettable, on-brand 3D moment that says "Data Science / AI" without distracting from the copy. **Build TWO variants behind a live switch; the user picks in-browser** (user-approved direction). Everything rides the P13 `SceneSlot` gateway, so reduced-motion / no-WebGL / low-tier automatically fall back to the current editorial hero with zero 3D.

## 2. Design — two variants (both theme-aware, decorative, behind hero text)
The 3D is a decorative layer absolutely positioned inside the hero `<section>`, **below the content grid in z-order** and `aria-hidden`. The hero text + portrait stay in the DOM unchanged (content parity always). It replaces nothing; it sits above the aurora/gradient, beneath the copy.

- **`restrained` ("Editorial") — default.** A single slow-rotating icosahedron with drei `MeshDistortMaterial` (subtle wobble), rendered in the theme **accent** color at low opacity, positioned toward the right/portrait side. Motion: continuous slow rotation; **scroll** drives a gentle Y-parallax + rotation via the P13 `useScrollBridge`; **cursor** adds a small damped tilt (pointer-fine only). Restraint = 1–2 motion ideas, never overpowers the headline. A faint wireframe pass gives a "technical" read.
- **`bold` ("Constellation"). ** A points-field of ~600–1200 nodes arranged on a sphere ("neural constellation," on-theme for AI), faint additive lines between near neighbors, theme accent + heading colors. `@react-three/postprocessing` **Bloom** for glow. Motion: slow auto-rotation; **scroll** drives rotation speed + slight dispersion; **cursor** parallaxes the camera. Dim enough that hero text contrast is unaffected. This is the "screenshot" moment.

## 3. The switch (compare without rebuilds)
- Source-of-truth default constant `HERO_3D_DEFAULT: HeroVariant` in `lib/site.ts` (`"restrained" | "bold" | "off"`), default `"restrained"`.
- A client hook `useHeroVariant()` reads `?hero=` from `location.search` (`restrained|bold|off`), falling back to the default. Lets the user flip variants live: `/?hero=bold`, `/?hero=off`. Pure parse helper is TDD'd; the hook is the thin client wrapper (SSR-safe → default until mounted).
- `off` (or RM/no-WebGL via SceneSlot) ⇒ no canvas, current hero exactly as today.

## 4. Architecture (new files; reuse P13 + motion)
- `lib/hero/hero-variant.ts` (pure, TDD): `type HeroVariant`, `parseHeroVariant(search: string): HeroVariant` (defaults safely on junk).
- `components/three/use-hero-variant.ts` (client): SSR-safe hook returning `HeroVariant` (default until mounted; reads `window.location.search`).
- `components/three/use-pointer.ts` (client, TDD pure core): a damped pointer position store (`{x,y}` in [-1,1]) read inside `useFrame`; pointer-fine only; reduced-motion → static center. Same store pattern as `scroll-store` (no re-render/frame). Pure `dampedStep(current,target,factor)` is unit-tested.
- `components/three/hero/editorial-scene.tsx` (client): the restrained variant (`AdaptiveCanvas` + distorted icosahedron). Reads theme colors via a `useThemeColor` reader.
- `components/three/hero/constellation-scene.tsx` (client): the bold variant (points + lines + Bloom).
- `components/three/hero/use-theme-color.ts` (client): reads a CSS custom property (e.g. `--accent`, `--heading`) from `getComputedStyle(document.documentElement)`, re-reads on `data-theme` change (MutationObserver). Returns a hex/THREE-consumable string; SSR-safe default.
- `components/three/hero/hero-scene-mount.tsx` (client): chooses variant via `useHeroVariant()`, `dynamic(ssr:false)`-imports the chosen scene, wraps it in `SceneSlot` (`minTier="low"` for restrained, `"high"` for bold — bloom/points are heavier), `fallback={null}` (aurora already provides the non-3D atmosphere).
- Modify `components/sections/hero.tsx`: insert `<HeroSceneMount/>` as a decorative layer (absolute, `inset-0`, z below the content grid). No change to text/portrait/CTAs.

## 5. Theme + accessibility
- All colors come from CSS vars (`--accent`, `--heading`, `--background`) — **no hardcoded hex in shipped hero scenes** (the `/preview` proof scene's hex stays throwaway). Re-read on theme switch.
- Verify hero **text contrast is unaffected** in all 4 themes (the 3D is dim/behind; if any theme's accent makes text borderline, lower scene opacity for that case — verify by eye + the existing axe scan).
- Decorative layer `aria-hidden`; keyboard/focus untouched; `≥44px` targets unchanged.
- Reduced-motion / no-WebGL2 / Save-Data / low-tier (for bold) ⇒ `SceneSlot` fallback ⇒ no canvas, no scroll coupling. Cursor/scroll reactivity gated on pointer-fine + no-RM.
- **Perf:** bold variant is `minTier="high"` + DPR-capped + Bloom kept cheap; both lazy-mount; `three` already code-split (P13). Hero is above the fold, so the scene mounts on load when enabled — keep geometry light; measure FPS via PerformanceMonitor (already in AdaptiveCanvas). Confirm home initial JS still excludes `three` (dynamic ssr:false).

## 6. Testing
- **Unit (TDD):** `parseHeroVariant` (valid values, junk→default, empty); `dampedStep` clamp/convergence; `use-hero-variant` SSR default; `use-theme-color` returns default pre-mount.
- **E2E:** `/?hero=off` ⇒ no `section#top canvas`; `/?hero=restrained` (normal motion) ⇒ a canvas mounts in `#top`; reduced-motion ⇒ no canvas regardless of `?hero`. Home axe scan stays clean in 4 themes (existing `accessibility.spec.ts`).
- **Gates + Playwright MCP:** build, full e2e, then screenshot **both variants × 4 themes × desktop+mobile(390px)** and **Read** them; confirm text legibility + that the scene reads as intentional. This is how the user chooses.

## 7. Deliverables
1. Variant switch (default + `?hero=`), pure parse TDD'd.
2. Both scenes, theme-aware, behind `SceneSlot`, lazy + ssr:false.
3. Hero integration (decorative layer only; copy untouched).
4. Unit + e2e green; `three` still off the home initial JS.
5. Screenshots of both variants × 4 themes × mobile for the user to pick. Concise `docs/v2/HERO-3D.md`. Roadmap P14→done.

## 8. Cycle
Plan (`writing-plans`) → implement (inline or fresh subagent; audit commits) → read-only `reviewer` → verify (gates + Playwright MCP, both variants × 4 themes × mobile × RM) → fix → document → **report + present screenshots so the user picks the default; then STOP (P15 needs Higgsfield).** Mandated skills applied: `frontend-design` (done — elevate within the existing system), `gsap-scrolltrigger` (scroll bridge), `ui-ux-pro-max` (motion restraint, contrast, reduced-motion, pointer-fine gating).
