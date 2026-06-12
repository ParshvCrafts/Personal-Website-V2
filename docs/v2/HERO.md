# Hero + ScrollSequence Showpiece (Phase 4 — complete)

The home page's opening: the editorial hero and the signature pinned scroll-sequence.
All motion is reduced-motion-gated; everything is keyboard-complete and CLS-safe.

## Components

| File | Notes |
|---|---|
| `components/sections/hero.tsx` | The site's single `<h1>`. Asymmetric editorial split: mono eyebrow, oversized Fraunces name, rotating role, description, CTAs, socials, portrait, scroll cue, per-theme radial atmosphere. One `useGSAP` entrance timeline gated by `gsap.matchMedia` (RM users get everything visible/static — no `opacity:0` in SSR). Section `id="top"` (footer back-to-top target). |
| `components/motion/rotating-text.tsx` | Cycles `items` with a masked vertical slide (motion-safe only; RM → static first item). Imperative `textContent` swap inside the GSAP loop (safe: React child is the stable `items[0]`). |
| `components/sections/scroll-showpiece.tsx` | Home wrapper around `ScrollSequence` with a procedural `draw` ("data → structure") + 3 text beats. The `draw` reads `--background`/`--accent` so it matches every theme. A `"use client"` module (the `draw` fn can't cross the RSC boundary). |

## Hero anatomy (spec §7.2)
name (Fraunces, `id`-less h1) · rotating role (`RotatingText`, no "I'm a" lead-in — wouldn't agree with "AI Researcher"/"ML Engineer") · description · CTAs **Explore work** (→`#projects`, Magnetic primary), **Get in touch** (→`#contact`), **Résumé** (→`/documents/resume.pdf`, new tab, `rel=noopener`) · GitHub/LinkedIn/Email · scroll cue (→`#about`) · portrait `/images/profile.jpg` (1413×1785, grayscale + offset accent frame, `motion-safe:hover:grayscale-0`).

## Content / assets
- `lib/site.ts`: `HERO_ROLES` (rotated), `HERO_PORTRAIT` (shared by hero render + preloader warm-up), `SITE`/`SOCIAL_LINKS` (identity).
- `v2/public/images/profile.jpg` and `v2/public/documents/resume.pdf` are the **v1 originals** — drop in upgraded files at the same paths and they flow through with no code change.
- The Preloader warms `HERO_PORTRAIT` (decode) before the veil lifts.

## ScrollSequence engine notes (reinforced this phase)
- Beats are **captions, not headings** (`<p>`, not `<h3>`) — they sit between the hero `<h1>` and the first section `<h2>`, so headings would break the outline (axe `heading-order`).
- Beats use `motion-safe:absolute` → overlapping overlay under motion, stacked normal-flow list under reduced motion.
- One text alternative: the canvas `role="img"` + `aria-label` (no section `aria-label`, no `sr-only` dup).
- Never pins/traps scroll under reduced motion (e2e-asserted: page advances >600px past the home sequence).

## Deferred (real assets / later)
- Replace the procedural `draw` with `framePath` + numbered WebP frames when the real subject is produced (engine supports image mode with the load/error settle-guard).
- Upgrade the portrait to a ≥1200px editorial shot (keep the path + intrinsic ratio).
- The showpiece canvas only re-reads theme tokens when it draws (on scroll); switching theme while statically viewing it leaves stale canvas colors until the next scroll — fine for the placeholder.

## Gates (all green)
`lint` · `typecheck` · `npm test` (86 unit, incl. `nextRoleIndex` + scroll-spy boundary) · `build` (emits `out/index.html` with the hero) · `test:e2e` (50, chromium/firefox/webkit; incl. hero single-h1/portrait/résumé/showpiece + reduced-motion no-trap).

## E2E note
Cross-browser runs against the compile-on-demand dev server; `playwright.config.ts` caps `workers` + uses `retries` to absorb compile-under-load flakes (every test passes in isolation). A future QA pass may serve the static `out/` build for fully deterministic e2e.
