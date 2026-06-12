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
| P16 | Centerpiece B — scroll-scrubbed cinematic showpiece | Real frames wired into the pinned scroll-scrub section (replaces placeholder). User's favorite | pending |
| P17 | Micro-interaction & transition polish | Unified cursor, button/card/link state system, easing tokens, section choreography, View-Transitions page/theme changes, loading polish. **Plus hero-3D wow redesign** — user unsatisfied with P14 aesthetic impact; rebuild/upgrade the hero scenes on the P13 rig (reuse salvageable parts elsewhere) | pending |
| P18 | Real imagery & graphic design | Hero portrait (Higgsfield-animated), project covers, course images, grain/textures, custom OG | pending |
| P19 | New advanced features | Pick 2–3 non-distracting: ⌘K command palette, subtle live widget, tasteful easter egg, first-visit tour | pending |
| P20 | Cross-cutting QA + docs | Perf budgets (3D risk), Lighthouse, 4-theme × cross-browser × mobile, a11y/reduced-motion audit, docs | pending |

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
