# P20a — ⌘K Command Palette + Konami Easter Egg

Wave 1 of P20 "Advanced Features". Keyboard-native command palette + a discreet Konami reward, built dependency-free, WCAG 2.1 AA, reduced-motion-safe, across all 4 themes, static-export clean.

Spec: `docs/superpowers/specs/2026-06-13-p20a-command-palette-easter-egg-design.md`
Plan: `docs/superpowers/plans/2026-06-13-p20a-command-palette-easter-egg.md`

## Command palette

Open with **⌘K / Ctrl+K / `/`** (suppressed while typing in a field) or the **nav trigger** — a `⌘K`/`Ctrl K` chip on desktop, a search-icon tap target on mobile (the only entry on phones). Platform glyph is hydration-safe via `useSyncExternalStore` (`navigator.userAgentData`).

A `role="combobox"` input drives a `role="listbox"` of `role="group"`-wrapped `role="option"` rows; the active option is tracked by `aria-activedescendant` (DOM focus stays on the input). ↑/↓ wrap, Enter runs, Esc closes, Tab is trapped, focus is restored to the opener on close, body scroll is locked, and the dialog is `inert` + `aria-hidden` when closed. Open fade is GSAP, gated by `prefersReducedMotion()`.

**Command groups** (`lib/command-palette/commands.ts`, a pure builder; side effects injected via `CommandContext`):
- **Navigate** — every section + Top (`useSmoothScroll`).
- **Theme** — the 4 themes (`next-themes`).
- **Links** — copy email (clipboard, success-only confirmation), email, GitHub, LinkedIn (real brand SVGs), résumé + transcript PDFs.
- **Actions** — toggle animations (`useMotionPreference`).
- **Labs** — hero (`?hero=`) + showpiece (`?show=`) variant switches, each hinted "reloads".

Filtering/ranking is a pure subsequence matcher `fuzzyScore` + `rankCommands` (`lib/command-palette/fuzzy.ts`); empty query shows registry order.

## Konami easter egg

`↑↑↓↓←→←→BA` (pure, unit-tested `createKonamiMatcher`, input-guarded) emits on a tiny pub-sub bus (`lib/easter-egg/burst.ts`). The hero **Inkfield** consumes it via a decaying `uBurst` uniform — a one-shot outward particle shove (`BURST_DECAY_SECONDS`). When the WebGL Inkfield isn't live (no WebGL2 / Save-Data / reduced motion → no `[data-inkfield] canvas`), `RippleFallback` instead plays a single accent ripple (expand on motion-safe; opacity-pulse under reduced motion), self-suppressing when the canvas is present.

## Decoupling

Two module-level pub-sub buses keep components independent: `palette-bus` (open-state external store + open requests; lets the nav trigger and the island share `open` without prop-drilling across the nav↔layout boundary) and `burst` (Konami → Inkfield/ripple). Both return unsubscribe fns used as effect cleanups.

## Files

```
lib/command-palette/{types,fuzzy,keys,commands,palette-bus,use-command-palette}.ts
lib/easter-egg/{konami,burst}.ts
components/command-palette/{command-palette,command-palette-island,palette-trigger}.tsx
components/easter-egg/{ripple-fallback.tsx,ripple-fallback.module.css}
components/three/hero/inkfield-scene.tsx   (+uBurst, burst subscribe, data-inkfield)
app/layout.tsx (mount island + ripple) · components/layout/site-nav.tsx (trigger)
tests/unit/{command-palette-fuzzy,command-palette-keys,konami,easter-egg-burst,command-palette-commands}.test.ts
tests/e2e/command-palette.spec.ts
```

## Extending

Add a command by pushing to the relevant group array in `buildCommands()` with an `icon` (any `ComponentType<{className?}>`), `label`, optional `keywords`/`hint`, and a `run(ctx)` that uses the injected `CommandContext`. No wiring elsewhere.

## Verification

Lint clean; `tsc` clean; **252** unit tests; static export builds. Playwright MCP visual pass: palette open in all 4 themes (teal/blue/rust/cyan accents, AA contrast) + mobile 390px + fuzzy filter + Esc/`inert`/focus-restore + Konami fires with the Inkfield canvas live; 0 console errors. Reduced-motion palette/ripple paths are gated via `prefersReducedMotion()` (MCP can't emulate the media query).

## Follow-ups

- `AnimationToggle` (parallel-session component) uses a 36px target — under the 44px rule; worth bumping in P21 QA.
- Reduced-motion visual confirmation deferred to P21 (requires emulated media or a real RM environment).
