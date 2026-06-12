# Layout Shell (Phase 3 — complete)

The site chrome that wraps every real section (P4+). Editorial Exaggerated-Minimalism:
mono micro-labels, Fraunces headings, single accent, restraint. Everything is
reduced-motion-gated, keyboard-complete, and ≥44×44px.

## What's mounted where

- **Root layout** (`app/layout.tsx`) — global, decorative, non-blocking:
  - `GrainOverlay` — static SVG film grain, `aria-hidden`, `pointer-events-none`, opacity 0.04.
  - `CustomCursor` — desktop dot+ring (`gsap.quickTo`, `mix-blend-difference`). Pointer-fine +
    motion-allowed only; adds `html.cursor-none` (native cursor hidden, caret kept on inputs).
    Renders nothing on touch / reduced-motion / SSR; never required for any action.
- **Home page** (`app/page.tsx`) — the single-page site composition:
  - `Preloader` → `SiteNav` → `<main id="main">` (anchored sections) → `SiteFooter`.
  - Preview/styleguide routes stay bare (no nav/footer/preloader).

## Components (`components/layout/`)

| File | Notes |
|---|---|
| `site-nav.tsx` | Sticky. Skip-link (first focusable, → `#main`). Logo, desktop links with `aria-current` active state, theme switcher, mobile hamburger. Condenses (blur/border) past 24px; hides on scroll-down / shows on scroll-up (transform `motion-reduce`-neutralized). One rAF-throttled passive scroll listener drives active + condense + hide. |
| `mobile-menu.tsx` | `role="dialog" aria-modal`, `aria-hidden` when closed. Focus moved to Close on open, full Tab/Shift+Tab trap, Esc closes, focus restored to trigger, body scroll-locked. Right-side slide-in panel + scrim. |
| `site-footer.tsx` | `role="contentinfo"`. Identity + socials, section links, contact (email/phone/location), © year, back-to-top. |
| `preloader.tsx` | One-per-session (`sessionStorage`), bounded ~1.7s, skippable (any pointer/key). Reduced-motion/seen → renders nothing. Locks scroll + `inert`s main/header/footer while up; content always lives underneath (never removed). |
| `grain-overlay.tsx`, `custom-cursor.tsx` | See "Root layout" above. |
| `social-icons.tsx` | Inline GitHub/LinkedIn brand SVGs (`currentColor`, `aria-hidden`) — lucide-react v1.x dropped brand glyphs. |

## Shared config / logic

- `lib/site.ts` — `SITE` (identity), `SOCIAL_LINKS`, `NAV_SECTIONS` (curated 7: About, Academics,
  Research, Journey, Skills, Projects, Contact), and **`NAV_OFFSET = 88`** — the single sticky-nav
  clearance used by scroll-spy's line, scroll-to offsets, footer, and section `scroll-mt-[88px]`.
- `lib/scrollspy.ts` — `activeSectionForScroll(sections, scrollY, lineOffset)` pure helper
  (unit-tested). Returns `null` until a section crosses the line (no false active over the hero).
- `components/providers/smooth-scroll.tsx` — `useSmoothScroll().scrollTo(target, { offset })`:
  Lenis when active, native jump fallback under reduced motion.

## Z-index scale
nav `z-40` · grain `z-50` (pointer-none) · mobile-menu `z-[70]` · preloader `z-[100]` · cursor `z-[9999]`.

## Notes carried to later phases
- Real sections (P4+) replace the stub `<section>` blocks — keep the same `id`s so scroll-spy/footer
  links keep working. The Hero (P4) replaces the `#top` block and owns the single `<h1>`.
- Preloader should `await` real asset decode (sequence frames + hero media) in P4 (currently a
  bounded timer). `data-cursor="hover"` is available as a bespoke cursor-grow hook (e.g. P9 cards).
- Nav set is curated; revisit if Certifications/Professional Development need top-level entries.

## Gates (all green)
`npm run lint` · `npm run typecheck` · `npm test` (75 unit, incl. `site` + `activeSectionForScroll`) ·
`npm run build` (emits `out/index.html`) · `npm run test:e2e` (9: 5 shell + smoke + 2 motion + theme).
