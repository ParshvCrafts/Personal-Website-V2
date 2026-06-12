# About Section (Phase 5 — complete)

The first real content section, replacing the `#about` stub. Editorial
Exaggerated-Minimalism: asymmetric bio split, a ruled stat band, a typographic
badge wall, award cards that open an accessible modal, a code-showcase tablist,
and a documents row. All content is extracted from v1 into typed modules; every
interaction is keyboard-complete and reduced-motion-safe.

## Components

| File | Notes |
|---|---|
| `components/sections/about/index.tsx` | **Server** composition. Section `id="about"` (scroll-spy target), single `<h2>`; reads build-time counts from `lib/data.ts`. Renders the intro split (bio ‖ hairline-divided facts), the **stat band** (`CountUp` islands), then the sub-sections. One decorative per-theme accent radial (`aria-hidden`). |
| `components/sections/about/badge-wall.tsx` | **Server.** 16 typographic Lucide marks in a responsive grid (8/6/4 cols). Each tile: `aria-hidden` icon + `sr-only` label + a hover tooltip. Wrapped in `Reveal` (staggered, motion-safe). |
| `components/sections/about/awards.tsx` | **Client.** 15 award cards (2-line teaser) → open the `Modal` with the full citation. `AwardMark` renders a brand logo on a white chip or an accent-tiled Lucide icon. |
| `components/sections/about/code-showcase.tsx` | **Client.** ARIA **tablist** (python/js/sql): `role=tab/tabpanel`, roving `tabIndex`, Arrow/Home/End via the pure `tabKeyToIndex`. Plain mono code in a window-chrome panel (no syntax-color contrast risk). |
| `components/sections/about/documents.tsx` | **Server.** Résumé / Transcript / LinkedIn cards (LinkedIn uses the inline brand SVG). |
| `components/ui/modal.tsx` | **Reusable** accessible modal — focus-trap, Esc, scrim (`bg-background/80`), body-scroll lock, **returns focus to the opener**, `role=dialog`/`aria-modal`. `z-[80]` (above grain `z-50`, below preloader `z-100`). Returns `null` when closed. **Reused by Projects (P9).** |
| `content/about.ts` | **Single source of truth** — `ABOUT_BIO`, `ABOUT_FACTS`, `ACHIEVEMENT_BADGES` (16), `AWARDS` (15, verbatim v1 citations), `CODE_SAMPLES` (3), `ABOUT_DOCUMENTS` (3). Edit content here. |
| `lib/about.ts` | `tabKeyToIndex` (pure, unit-tested). |

## Key decisions
- **Stat counters are data-derived** where possible: Projects = `getProjects().length`, Research = `getResearch().length`, Awards = `AWARDS.length`; GPA (4.0) + Volunteer hours (136+) are static. `CountUp` animates once on scroll-in and renders the final value under reduced motion / SSR. `data-testid="stat-*"` proves the pipeline on the page.
- **Badge wall a11y:** labels live in the accessible tree via `sr-only` (not hover-only); tiles are intentionally **non-focusable** to avoid 16 actionless tab stops. The visual tooltip is a mouse enhancement.
- **Modal + WebKit:** WebKit does not focus a `<button>` on mouse click, so consumers must focus the trigger when opening (Awards calls `e.currentTarget.focus()`) — otherwise focus-return lands on `<body>`. Keep this contract for the P9 Projects modal.
- **Award logos** sit on a neutral **white chip** (`bg-white`) so brand marks stay legible on all 4 themes (verified midnight/neon); icon-only awards use an `bg-elevated`/`text-accent` tile.
- **Heading order:** section `<h2>` + `<h3>`s only (incl. an `sr-only` "By the numbers" h3); the modal title is a `<p id>` referenced by `aria-labelledby`, never a heading — so axe `heading-order` stays clean.
- **No emoji** (v1's emoji badges/stat icons → Lucide); **no hardcoded hex** (semantic tokens only; the white logo chip is a Tailwind utility, not a token color).

## Assets (copied from v1 — originals untouched)
- `public/images/awards/{amazon,greenhouse,mlt,questbridge,caa-tla,rsm}.png`
- `public/documents/transcript.pdf` (résumé already present)

## Gates (all green)
`lint` · `typecheck` · `npm test` (**104** unit, incl. `about-content`, `tabKeyToIndex`, `Modal`, `CodeShowcase`) · `build` (emits `out/index.html` with About) · `test:e2e` (**62** cross-browser: section smoke, stat counts, award modal open/Esc/focus-return, code-tab keyboard, reduced-motion no-trap) · axe clean on `/` across all 4 themes.

## Found in verification (fixed)
- WebKit award-modal focus-return (the trigger-focus contract above).
- Hero e2e résumé locator scoped to `#top` (About adds a second "Résumé" link).
- Award card descriptions weren't clamping — `block` overrode `line-clamp-2`'s `display:-webkit-box`; removed `block`.

## Notes for later
- The `Modal` focus-trap selector matches `MobileMenu` (links + buttons). If a future modal wraps form fields, extend the selector to include `input,select,textarea,[contenteditable]`.
- Courses/certifications/professional-development counts return to the UI in P6/P8 (still validated at build).
