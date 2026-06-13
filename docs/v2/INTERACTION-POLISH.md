# Micro-interaction & transition polish (P17)

A unified interaction language layered onto the existing components. All motion is gated with
`prefers-reduced-motion: no-preference`; focus-visible parity mirrors every hover affordance.

## State-aware cursor
- `lib/cursor-state.ts` — pure `cursorStateFor(el)` reducer (TDD). Resolves `default | link | view |
  field`. Explicit `data-cursor` wins, **except** an interactive element nested inside a tagged
  container wins (a CTA inside the `data-cursor="field"` hero still reads as a link).
- `components/layout/custom-cursor.tsx` — dot + ring; ring scales per state (view 2.6 + "VIEW"
  label, link 1.8, field 1.2 + dashed crosshair). Desktop pointer-fine only; hidden on touch / RM.
- Tags in markup: hero `<section data-cursor="field">`; project card root `data-cursor="view"`.

## Interaction tokens + states (`app/globals.css`)
- Tokens: `--ease-out-expo`, `--ease-spring`, `--duration-fast` (200ms), `--duration-slow` (400ms).
- `.card-lift` — translateY(-4px) + accent border + glow on hover/focus-within (project, hobby,
  about doc cards). `.btn-sheen` — diagonal sheen sweep on the primary button only.
  `.nav-underline` — scale-x underline on desktop nav (also for `[aria-current]`).
- All colors via `color-mix(... var(--color-accent)/--color-border/--color-on-accent)` — no hardcoded
  hex; all four themes inherit automatically.

## View-Transition project modal (`lib/view-transition.ts`)
- `withViewTransition(mutate)` — runs the mutation inside `document.startViewTransition` when
  supported AND motion allowed; otherwise runs it plainly (Firefox path — zero regression). TDD.
- The clicked card root + the open modal panel share `view-transition-name: project-hero` so the
  card morphs into the dialog. The name is set on the card just before the transition and cleared on
  the next `requestAnimationFrame`. Reduced motion: the existing `::view-transition-*` kill block in
  globals neutralizes it (extended to cover `project-hero`).

## Load choreography (`components/layout/preloader.tsx`)
- The one-per-session veil now exits as a collapsing ink drop: `clip-path: circle(150%→0% at 50%
  50%)` un-veiling the hero. Counter, skip handler, inert/scroll-lock, session key, and the
  reduced-motion instant-skip are all unchanged.

## Verification
- TDD units: `inkfield`, `cursor-state`, `view-transition`, `hero-variant`. e2e: `hero-3d.spec.ts`
  (ink mounts a canvas, WebGL2-gated), `projects.spec.ts` (modal open/close + focus restore, incl.
  Firefox no-VT path), `shell.spec.ts` (preloader contract). Visual pass: 4 themes × desktop/mobile ×
  reduced-motion; cursor states; modal morph; preloader drop. RM mobile confirmed 0 canvases.
