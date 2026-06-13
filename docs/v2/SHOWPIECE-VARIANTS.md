# Scroll Showpiece Variants (P19)

The pinned scroll-showpiece section is live-switchable between three variants via `?show=`. The
section component `components/sections/scroll-showpiece.tsx` is a thin switch; each variant is its
own component under `components/sections/showpiece/`.

## Variants (`?show=cinematic|keystroke|keyboard`)

- **`cinematic` (default)** — `cinematic-showpiece.tsx`: the P15/P16 Signal film, 120 baked webp
  frames scrubbed by the `ScrollSequence` engine, per-theme grade. Unchanged from P16.
- **`keystroke`** — `keystroke-showpiece.tsx`: Apple-style stepped sequence. One pinned stage;
  GSAP ScrollTrigger **snap** advances 3 committed chapters (Data → Structure → Intelligence); each
  heading types in (scroll-driven) and commits with a keycap depress + accent flash. Pure
  typographic (no frames).
- **`keyboard`** — `keyboard-showpiece.tsx`: R3F 3D mechanical keyboard on the P13 `SceneSlot` rig;
  one `InstancedMesh` of keycaps depresses in sequence to "type" DATA → STRUCTURE → INTELLIGENCE as
  you scroll. Theme-accent keycaps, idle float, cursor parallax.

Default lives in `SHOWPIECE_DEFAULT` in `components/sections/showpiece/use-showpiece-variant.ts`.
To change it after the user picks, edit that constant. Parsing is pure + unit-tested
(`lib/showpiece/showpiece-variant.ts`).

## Pure logic (TDD, jsdom-safe — no GSAP/three)
- `lib/showpiece/showpiece-variant.ts` — `parseShowpieceVariant`.
- `lib/showpiece/keystroke.ts` — `chapterForProgress(p, count)`, `typedCount(length, local)` (typing
  completes at 70% of each chapter so it holds fully-typed before the snap).
- `lib/showpiece/keyboard-timeline.ts` — `WORDS`, `wordForProgress(p)`, `keyDepth(keyIndex, wordLen,
  local)` (per-key depress amount; keys peak in sequence).

## A11y / reduced-motion contract
- **Keystroke:** two render paths switched purely by CSS — `motion-safe:flex hidden` shows the
  pinned typing stage only when motion is allowed; `motion-safe:hidden` shows all 3 chapters stacked,
  fully typed, static (no pin, no snap, no scroll trap) under reduced motion. Section carries an
  `aria-label` with the full story.
- **Keyboard:** decorative canvas is `aria-hidden`; below `minTier`/RM/no-WebGL2/Save-Data the
  `SceneSlot` renders `KeyboardFallback` (the three words as static type). An `sr-only` sibling
  carries the words for assistive tech regardless.
- Both keep the data→intelligence story available as text; nothing is conveyed by motion alone.

## Assets
No P15/P16 assets were removed — the cinematic variant still uses the full Signal frame sequences.

## e2e
`tests/e2e/showpiece.spec.ts` covers all three: keystroke (reduced motion shows all chapters, no
pin), keyboard (canvas mounts with WebGL2 else fallback words), cinematic (frame canvas paints).
