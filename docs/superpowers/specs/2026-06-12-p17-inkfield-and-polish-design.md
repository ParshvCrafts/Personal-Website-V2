# P17 — Inkfield hero + micro-interaction polish (design)

**Date:** 2026-06-12 · **Status:** approved by user (all sections)
**Goal:** the signature "crazy animation" first impression — a cursor-stirred, scroll-morphing
liquid-ink particle hero continuous with the Signal film — plus a unified micro-interaction
language across the site.

## User decisions

| Question | Decision |
|---|---|
| Hero concept | **Liquid Ink ("Inkfield")** — brand continuity with Signal |
| Perf posture | **Scale down, keep magic** (tiered counts; low/RM/no-WebGL = static editorial fallback) |
| Polish scope | ALL: state-aware cursor, button/card states, View-Transitions, load choreography |

## 1. Inkfield hero (Centerpiece A v2)

- `components/three/hero/inkfield-scene.tsx`, mounted via the existing `SceneSlot`/`hero-scene-mount`
  path. Becomes the new default: `HERO_3D_DEFAULT = "ink"`; `?hero=ink|restrained|bold|off` all stay
  live (`lib/hero/hero-variant.ts` gains `"ink"`).
- **Rendering:** one `<points>` (BufferGeometry) + custom `ShaderMaterial`. Vertex shader computes
  position statelessly from per-particle seed attributes + uniforms `(uTime, uScroll, uPointer,
  uPointerVel)`: curl-noise flow field for the chaotic state; each particle owns a target slot in a
  procedural lattice; `uScroll` (existing scroll-store bridge) mixes chaos → lattice. Pointer acts
  as a vortex/attractor within a radius — "stirring ink". Fragment: soft circular sprite, additive
  blending, theme accent/ink colors from `useThemePalette` (no postprocessing pass; additive reads
  as glow).
- **Tiers:** high ≈ 12k particles, mid ≈ 5k (and no pointer-velocity trail uniform); low / reduced
  motion / no-WebGL2 / Save-Data → `SceneSlot` fallback = current static editorial hero + CSS
  aurora (unchanged behavior).
- **Layering:** field sits behind the DOM name/portrait exactly like the P14 scenes (decorative,
  `aria-hidden`, content parity in DOM).
- **Pure logic TDD in `lib/hero/inkfield.ts`:** `latticeTargets(count, cols?)` (deterministic,
  centered, fits 16:9-ish hero bounds), `particleCountForTier(tier)`, `pointerToScene(clientXY,
  rect)` mapping. Shader/scene itself is not unit-tested (jsdom has no WebGL) — verified by e2e +
  browser pass.

## 2. State-aware cursor

- Upgrade existing dot+ring cursor to a small state machine driven by `data-cursor` attributes and
  interactive-element detection: `default` · `link` (ring grows) · `view` (ring grows + mono
  "VIEW" label — project cards) · `field` (crosshair — over the Inkfield canvas).
- Pure reducer `cursorStateFor(target: Element): CursorState` in `lib/cursor-state.ts` (TDD —
  attribute wins over tag heuristics; closest() walk).
- Touch devices: hidden (existing). Reduced motion: position still follows pointer (input-driven),
  but morph/scale transitions are instant (gate transitions with `motion-safe:`).

## 3. Button/card state system

- Easing + duration tokens in `app/globals.css` `@theme`: `--ease-out-expo`,
  `--ease-spring` (approx cubic-bezier), `--duration-fast: 200ms`, `--duration-slow: 400ms`.
- Primary buttons: sheen sweep (pseudo-element translate on hover, `motion-safe:`), keep magnetic.
- Cards (project, hobby, doc, course): unified hover = translate-y lift + accent border/glow via
  tokens; focus-visible parity (same affordance, never hover-only).
- Nav links: drawn underline (scale-x origin-left).
- All via theme tokens — no hardcoded hex; all four themes inherit automatically.

## 4. View-Transitions (project modal morph)

- `document.startViewTransition` feature-detected wrapper (extend the existing theme-VT helper);
  unsupported browsers (Firefox) fall back to the current open/close — zero regression.
- Card cover and modal header share a `view-transition-name` pair set just-in-time on the clicked
  card (unique names per transition; cleared after).
- Reduced motion: skip VT entirely (existing `@media (prefers-reduced-motion)` kill-switch in
  globals already neutralizes VT animations — verify it covers the new names).

## 5. Load choreography (ink-drop reveal)

- Existing preloader upgraded: a centered ink drop (CSS radial clip-path on the preloader veil)
  expands to un-veil the hero, then hands off; total ≤ 1.6s, runs once per session
  (sessionStorage guard — existing preloader pattern reused).
- Reduced motion: veil removed instantly (current behavior preserved); e2e preloader contract
  (`tests/e2e/shell.spec.ts`) must stay green.

## 6. Testing & verification

- TDD: `inkfield` lattice/count/pointer math; `cursorStateFor` reducer.
- e2e: `?hero=ink` mounts a canvas (WebGL2-probe-gated, pattern from `hero-3d.spec.ts`);
  `off`/RM → no canvas; project modal still opens/closes + focus restored in Firefox (VT no-op
  path); preloader spec stays green.
- Full gates + Playwright-MCP visual pass: 4 themes × desktop/mobile × RM; cursor states
  screenshotted over link/card/field; screenshots read and judged.

## Out of scope

Command palette / advanced features (P19); imagery integration (P18 — waiting on user-generated
Veo/NBP assets per `docs/v2/ASSET-PROMPTS.md`); any v1 changes. P14 scenes are NOT deleted.
