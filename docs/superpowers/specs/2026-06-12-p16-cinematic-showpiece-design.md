# P16 — Cinematic Showpiece (design)

**Date:** 2026-06-12 · **Status:** approved by user
**Goal:** the pinned scroll-scrub section plays the real "Signal" frames (P15 assets) instead of
the procedural placeholder, with the correct grade per theme.

## Decisions

- **Engine untouched.** `components/motion/scroll-sequence.tsx` already provides decode-all-then-
  scrub, reduced-motion (no pin, static first frame, all beats visible), CLS-safe canvas,
  `role="img"` + `alt`. P16 only changes the consumer.
- **Per-theme grade by remount.** `ScrollShowpiece` reads `useTheme()` (same pattern as
  `components/three/use-hero-variant.ts`) and renders `<ScrollSequence key={grade} …>`.
  Theme switch remounts the engine and decodes the other grade (~2.5 MB, rare event — accepted).
- **Pure helper** `lib/sequence-grade.ts`: `gradeForTheme(theme: string | undefined): "dark" | "light"`.
  `daylight` and `manuscript` → `light`; everything else, including `undefined`
  (pre-hydration) and unknown values → `dark`. TDD.
- **Props:** `framePath="/sequences/intelligence/<grade>/frame_"`, `frameExt="webp"`,
  `frameCount={120}`, `pad={4}`, `width={1280}`, `height={720}`, existing `textBeats`
  (Data, everywhere → Structure emerges → Intelligence), `className="border-y border-border"`,
  updated `alt` describing the ink film (no longer "placeholder").
- The procedural `draw` function is deleted from `scroll-showpiece.tsx`; the engine keeps its
  `draw` prop (other tests/uses).

## Rejected alternatives

- Engine-level live grade crossfade — YAGNI; theme switches are rare.
- Procedural placeholder while frames decode — extra engine mode for a sub-second window.

## Testing

- Unit: `gradeForTheme` for all 4 themes + `undefined` + unknown string.
- e2e (`tests/e2e/showpiece.spec.ts`): canvas paints non-blank pixels after decode
  (chromium/firefox; WebKit fine too — plain 2D canvas, no WebGL); reduced motion shows all
  3 beat headings and does not pin.
- Orchestrator visual pass (Playwright MCP, built `out/`): 4 themes (dark grade on
  midnight/neon, light on daylight/manuscript) + mobile 390px + reduced motion.

## Out of scope

OG image (P18), hero redesign (P17), any engine changes.
