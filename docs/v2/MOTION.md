# Motion System (Phase 2 — complete)

The v2 motion foundation. Built on GSAP + ScrollTrigger + `@gsap/react` (`useGSAP`) and
Lenis smooth scroll. **Everything is reduced-motion-gated and client-only.** Demo page:
`/preview/motion` (noindex).

## Core rules (do not weaken)

- **Reduced motion is the master gate, everywhere.** Tween-based primitives gate via
  `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`; pointer/scroll primitives
  early-return on `prefersReducedMotion()`. The reduced path must leave content **fully
  visible and in place**, and must **never pin/scrub/trap scroll**.
- **Client-only.** All motion code is `"use client"` and runs inside `useGSAP`/`useEffect`.
  `registerGsap()` is a no-op on the server (`typeof window` guard). Never run GSAP in SSR.
- **Animate transform/opacity only.** `will-change` only on actively-animating elements
  (gated `motion-safe:`). `ease:"none"` for scrubbed/parallax tweens. Pointer-followers use
  `gsap.quickTo`. ScrollTrigger lives on the top-level tween; `useGSAP({ scope })` auto-cleans.
- **Motion is sparse and purposeful** (1–2 key ideas per view), per CLAUDE.md / frontend-design.

## Files

| File | Purpose |
|---|---|
| `lib/motion.ts` | `registerGsap()` (idempotent), `prefersReducedMotion()`, `frameForProgress()` (pure, unit-tested); re-exports `gsap`, `ScrollTrigger`, `useGSAP`. |
| `components/providers/smooth-scroll.tsx` | Lenis on the GSAP ticker; **skipped entirely under reduced motion** (native scroll). Wired in `app/layout.tsx`. Imports `lenis/dist/lenis.css`. |
| `components/motion/reveal.tsx` | Scroll-in fade/rise; optional `stagger` of direct children. |
| `components/motion/parallax.tsx` | Scrubbed Y drift (`amount`). |
| `components/motion/text-reveal.tsx` | Word-by-word heading reveal (manual split, overflow mask). |
| `components/motion/magnetic.tsx` | Pointer-fine magnetic pull (`quickTo`). |
| `components/motion/marquee.tsx` | CSS belt, pause-on-hover, `motion-safe` only; `repeat` copies (default 4). |
| `components/motion/count-up.tsx` | Scroll-in number count; `formatCount()` pure + tested. SSR/no-JS renders final value. |
| `components/motion/tilt-card.tsx` | Pointer-fine 3D tilt; sets `transformPerspective` for real depth. |
| `components/motion/scroll-sequence.tsx` | Reusable canvas pin+scrub engine (image + procedural modes). |

## ScrollSequence engine

Pins a section and scrubs a canvas frame-by-frame. Two modes share one ScrollTrigger:

- **Procedural** — pass `draw(ctx, frame, total, dims)`. Needs no assets (used by the current
  placeholder). Because a function prop can't cross the RSC boundary, wrap usage in a
  `"use client"` component (see `app/preview/motion/placeholder-sequence.tsx`).
- **Image** — pass `framePath` (+ `frameExt`, `pad`). Preloads all frames; scrub starts only
  once every frame has **settled (load OR error)** so one missing frame can't blank it.

Always: DPR capped at 2, `role="img"` + `alt` on the canvas, `sr-only` text alternative, and a
guaranteed **no-pin / no-trap path under reduced motion** (e2e-asserted: page advances >500px).

## Deferred to later phases (real assets / P4)

- **Real frames:** generate via Nano Banana Pro → Higgsfield → numbered WebP into
  `public/sequences/<name>/`, then swap the placeholder `draw` for `framePath` (spec §14).
- **Responsive frame set** (`mobileFrameCount`) + `<video>` fallback for mobile.
- **Throttled redraw on resize** (spec §6.4) — canvas is currently sized once on mount.
- **Image-mode test** exercising a missing frame (locks in the settle-guard).
- P3 layout shell hosts ThemeSwitcher in Nav, adds Preloader (preloads sequence frames + hero),
  CustomCursor, GrainOverlay.

## Phase-2 deviations from the plan (intentional)

- Placeholder extracted to its own `"use client"` component (function prop can't cross RSC).
- e2e uses `test.use({ contextOptions: { reducedMotion: "reduce" } })` — Playwright 1.60 exposes
  `reducedMotion` only via `contextOptions`, not as a direct test option.
- Canvas `style` duplicate-`height` key from the plan fixed to `{ width, maxWidth, height:"auto" }`.

## Gates (all green)

`npm run lint` · `npm run typecheck` · `npm test` (64 unit, incl. `frameForProgress`,
`formatCount`) · `npm run build` (emits `out/preview/motion/index.html`) · `npm run test:e2e`
(4, incl. reduced-motion no-scroll-trap).
