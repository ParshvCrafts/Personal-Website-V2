# P19 — Scroll Showpiece Rethink (design)

**Date:** 2026-06-13 · **Status:** approved by user (design + Keystroke=pure-typographic)
**Goal:** replace the "good but not mind-blowing" continuous frame-scrub with a cooler scroll
interaction. Build **two** new variants behind a live flag (the proven P14 "build both, pick in
browser" pattern); keep the current cinematic as a third option. User picks the default after seeing
them. **Do not delete any P15/P16 assets** — they remain in use (cinematic variant + a possible
Keystroke option later).

## Variants (live switch: `?show=keystroke|keyboard|cinematic`)

Default until chosen = `cinematic` (current behavior, zero regression). Parsing is pure + unit-tested
(`lib/showpiece/showpiece-variant.ts`, mirrors `lib/hero/hero-variant.ts`). The home section
(`components/sections/scroll-showpiece.tsx`) reads the variant (SSR-safe hook like
`use-hero-variant`) and renders the chosen sub-component.

### A — "Keystroke" (Apple-style stepped sequence, pure-typographic)
- Pinned section; scroll advances through **3 committed chapters** (Data → Structure → Intelligence)
  with GSAP ScrollTrigger **snap** (discrete beats, not continuous scrub) — each chapter "commits"
  like a keypress: the heading types in character-by-character, a keycap-style depress + accent
  flash punctuates the commit, the previous chapter lifts away.
- Pure typographic: bold editorial Fraunces headings + Geist Mono sublabels on a clean themed field
  (no Signal frames). One accent per theme; restraint (the type + one keycap motion are the only
  ideas). Adapt react-bits `TextType` (typing) for the heading reveal — copied + retokenized, not
  installed.
- Pure logic TDD'd in `lib/showpiece/keystroke.ts`: `chapterForProgress(p, count)` (which chapter is
  committed at scroll progress, with snap thresholds), `typedSlice(text, charProgress)` (how many
  chars revealed). No GSAP/DOM in the unit tests.
- **Reduced motion / no-JS:** ScrollTrigger gated by `matchMedia`; reduced path = all 3 chapters
  rendered stacked, fully typed, static, no pin, no snap, no scroll trap.

### B — "Keyboard" (R3F 3D mechanical keyboard)
- Runs on the P13 `SceneSlot` rig (`minTier` low). A floating mechanical keyboard (instanced
  keycaps); scroll drives a timeline where keys depress in sequence to "type" the three words. Theme
  accent keycaps (`useThemePalette`), soft depth, slow idle float; cursor parallax via `usePointer`.
- Reuses the existing scroll bridge (`useScrollBridge`) for progress; key-press schedule is pure +
  TDD'd in `lib/showpiece/keyboard-timeline.ts`: `keyPressAt(progress, layout)` → which keycaps are
  down at a given progress. Geometry is instanced (one `InstancedMesh`) for perf.
- **Fallback (below minTier / RM / no-WebGL2 / Save-Data):** `SceneSlot` renders a static
  typographic panel showing the three words — content parity, no canvas. Decorative 3D is
  `aria-hidden`; the words also live in sibling DOM for assistive tech.

## Shared / unchanged
- The pinned section keeps a single accessible text alternative describing the data→intelligence
  story (current `alt`/beats contract). Headings here are display captions, not document headings
  (no `<h1>`/outline break) — same rule the current engine follows.
- The existing `ScrollSequence` engine + `cinematic` variant are untouched; `scroll-showpiece.tsx`
  becomes a thin switch that renders one of: `<CinematicShowpiece/>` (today's component, extracted),
  `<KeystrokeShowpiece/>`, `<KeyboardShowpiece/>`.
- Section height/pin budget stays CLS-safe; never traps scroll.

## Skills / tools applied
- `ui-ux-pro-max` (animation rules: ease-out/in, ≤2 ideas per view, snap must respect reduced-motion,
  no scroll-jacking nausea), `gsap-scrolltrigger` (snap), `react-best-practices`, `react-bits`
  (`TextType`/`DecryptedText` for typing; keycap motion ideas), Magic MCP (keyboard-UI references)
  once reconnected. `remotion-best-practices` only if we later bake a keystroke promo (out of scope
  here).

## Testing & verification
- Unit (TDD, jsdom — no R3F imports): `showpiece-variant` parse, `keystroke` chapter+typed math,
  `keyboard-timeline` key-press schedule.
- e2e (`tests/e2e/showpiece.spec.ts` extended, WebGL2-probe pattern): `?show=keystroke` → typed
  chapters present, reduced-motion shows all 3 words + no pin; `?show=keyboard` → canvas mounts when
  WebGL2 present, fallback words otherwise; `?show=cinematic` unchanged.
- Full gates + Playwright-MCP visual pass: both variants × 4 themes × desktop/mobile × reduced
  motion; read screenshots; judge which is the stronger default and recommend.

## Out of scope (later)
P20 advanced features (⌘K palette, easter egg, live widget, tour). OG/portrait video (dropped per
user). Deleting any assets.
