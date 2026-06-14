# Portfolio v2.5 — "Signature" Program Roadmap

Goal: take the already-shipped v2 (P0–P12: all sections, deep motion lib, SEO/perf/a11y green)
from *polished* to *exceptional* — a professional, non-vibe-coded portfolio with two signature
"wow" moments, broad micro-interaction polish, real imagery, and a few advanced features.

**Approved 2026-06-10.** Branch `feat/portfolio-v2`. Do NOT push/deploy until user approves cutover.
Each phase = its own spec → plan → implement → 2-stage review → browser-verify → commit cycle.

## Phases

| # | Phase | Outcome | Status |
|---|-------|---------|--------|
| P13 | 3D + motion foundation | R3F rig: capability tiering, lazy adaptive Canvas, scroll bridge, fallback contract, perf budget, proof scene on `/preview` | done |
| P14 | Centerpiece A — scroll-driven 3D hero (WebGL) | Interactive R3F object reacting to scroll+cursor. **Build BOTH restrained + bold variants behind a flag; user picks in browser.** RM/no-WebGL → current editorial hero | done (user picked default: `restrained`) |
| P15 | Cinematic asset pipeline | Higgsfield (generative clips) → Remotion (deterministic compositor) → numbered frame sequence + OG/preview video, feeding existing `ScrollSequence` engine | done (see `docs/v2/CINEMATIC-PIPELINE.md`) |
| P16 | Centerpiece B — scroll-scrubbed cinematic showpiece | Real frames wired into the pinned scroll-scrub section (replaces placeholder). User's favorite | done (per-theme grade via `gradeForTheme` remount; caption halo fix) |
| P17 | Micro-interaction & transition polish + hero-3D wow redesign | New **Inkfield** hero (cursor-stirred GPU ink particles, scroll chaos→lattice; new default `?hero=ink`), state-aware cursor, easing tokens + card-lift/button-sheen/nav-underline, project-modal View-Transition morph, ink-drop preloader reveal | done (see `docs/v2/INTERACTION-POLISH.md` + `HERO-3D.md`) |
| P18 | Real imagery & graphic design | **Deferred by user** (2026-06-13): portrait photo kept as-is (no Veo cinemagraph); project covers + OG available later via `docs/v2/ASSET-PROMPTS.md` (user generates via Google Pro). Not blocking. | deferred |
| P19 | Scroll showpiece rethink | Two new scroll variants behind `?show=` — **Keystroke** (Apple-style snap-stepped typographic) + **Keyboard** (R3F 3D mechanical keyboard); cinematic retained behind `?show=cinematic`. See `docs/v2/SHOWPIECE-VARIANTS.md` | done (user picked default: `keystroke`) |
| P20a | Advanced features — wave 1 | **⌘K command palette** (fuzzy nav + theme/link/Labs actions, combobox a11y, 4-theme) + **Konami easter egg** (Inkfield `uBurst` burst with CSS-ripple fallback). See `docs/v2/COMMAND-PALETTE.md` | done (2026-06-13) |
| P20b | Advanced features — wave 2 | Live status widget + first-visit guided tour (build-time/client-only data; sessionStorage-gated tour) | pending |
| P21 | Cross-cutting QA + docs | Perf budgets (3D risk), Lighthouse, 4-theme × cross-browser × mobile, a11y/reduced-motion audit, docs | pending |

## Tooling decisions
- **Higgsfield AI MCP** — generative cinematics (image-to-video, 50+ models, camera moves, character
  consistency). Source of cinematic clips + animated portrait. ✅ Connected — tools visible as of
  2026-06-11 (`mcp__claude_ai_Higgsfield__*`).
- **Remotion** — programmatic React→MP4. Used as the deterministic compositor/frame-exporter that
  turns Higgsfield clips + typographic/data overlays into the version-controlled frame sequence the
  `ScrollSequence` engine scrubs, and renders OG/preview video. Complementary to Higgsfield.
- **R3F stack** — `three` + `@react-three/fiber` (v9, React-19-compatible) + `@react-three/drei`
  + `@react-three/postprocessing`. Lazy-loaded (`next/dynamic ssr:false`) so the home route's
  initial JS isn't bloated; three chunk loads only when a scene mounts.

## Hard constraints (unchanged from v2)
- Never modify v1 (`app.py`, `index.html`, `static/**`, repo-root configs). Only `v2/` + `docs/`.
- WCAG 2.1 AA across all 4 themes; single `<h1>`; visible focus; ≥44px targets; full keyboard.
- `prefers-reduced-motion` honored everywhere; 3D/heavy motion has a static, content-equivalent fallback.
- Static-export discipline (`output:'export'`); build-time data only; plain CLS-safe `<img>`.
- Atomic conventional commits, one per task, trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
