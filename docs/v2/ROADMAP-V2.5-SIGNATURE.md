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
| P20b | Advanced features — wave 2 | **Footer live-status widget** (availability badge + Berkeley time + status + client-fetched GitHub activity with silent degrade) + **opt-in guided tour** (first-visit prompt + ⌘K command, config-driven spotlight). See `docs/v2/STATUS-AND-TOUR.md` | done (2026-06-14) |
| P21 | Cross-cutting QA + docs | 5 sub-waves (see `docs/superpowers/specs/2026-06-14-p21-qa-hardening-design.md`): **A** e2e infra · **B** a11y + reduced-motion · **C** perf + asset/link/CSP · **D** cross-theme×breakpoint visual + parallel-work review · **E** final docs | in progress — **Waves A + B + C done** (2026-06-14) |

### P21 Wave A — e2e infrastructure (done 2026-06-14)
- e2e webServer now serves the static `out/` export via `scripts/serve-static.ts` (`npm run serve:out`); `npm run test:e2e` builds first, `test:e2e:nobuild` reuses a running server. Dev-server Turbopack panic fully sidestepped.
- WebGL "canvas mounts" assertions gated on a real `getContext('webgl2')` probe (headless WebKit has none).
- Fixed 4 stale/fragile specs (hero/showpiece default drift, status-tour pin-spacer + hydration race, command-palette focus race, shell skip-link headless-Tab artifact) — all browser-verified, product confirmed correct.
- Reliability: `workers: 2` (WebKit contention + teardown-hang mitigation). **Green:** chromium+firefox full 108/108; webkit deterministic per-project in isolation. AnimationToggle bumped 36→44px (early Wave B a11y fix).

### P21 Wave B — a11y + reduced-motion hardening (done 2026-06-14)
- **Reduced-motion toggle was broken for JS motion** (only CSS): `prefersReducedMotion()` ignored the `data-reduce-motion` attribute, and ~15 components gate via `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` (OS query only). Fix: gate honors the attribute; a pre-paint head script sets the attribute from localStorage AND overrides `window.matchMedia` for RM queries when the toggle is on (so every gsap.matchMedia gate honors it); toggling reloads. Now all GSAP/3D/Lenis quiet.
- **New real-runner RM audit** (`tests/e2e/reduced-motion.spec.ts`, 5 tests): media-query path + toggle path — palette opens instantly, Konami → pulse not expand, tour no pin, no `.pin-spacer` anywhere, toggle quiets motion after reload.
- **axe sweep of open overlays** (`tests/e2e/accessibility-overlays.spec.ts`, palette + tour ×4 themes, chromium) found + fixed two real bugs: palette `<li role="group">` was invalid ARIA (→ `<div>` listbox/group/option) and the daylight active row was 4.48:1 (`text-accent`→`text-heading`, now ≥4.5 all themes).
- Target-size: code-showcase tabs `min-h-9`→`min-h-11`.
- Verified: tsc/eslint/vitest 278/build green; e2e chromium+firefox 120/120; reviewer pass (3 test-hardening fixes accepted, 4 findings rejected with reasons — incl. a proposed lazy-init that would cause a hydration mismatch); MCP visual (palette daylight contrast, code-showcase tabs).

### P21 Wave C — perf + asset/link/CSP (done 2026-06-14)
- **CSP fix:** `vercel.json` `connect-src` now allows `https://api.github.com` (the status widget's GitHub fetch was blocked on a CSP-enforcing deploy).
- **Perf (local served build):** three/R3F **code-split off `/`** ✓ (875 KB chunk loads only via `SceneSlot`); initial JS ~982 KB uncompressed (~280 KB brotli); **CLS 0.0099**, LCP 464 ms, 0 console errors. Inkfield tiers 12k/5k/0. Budgets + the code-split invariant documented in `docs/v2/PERF-BUDGETS.md`. Lighthouse deferred to Vercel's auto-run on deploy (not installed locally; a11y/SEO/best-practices covered by axe + metadata + CSP audits).
- **Link/asset sweep:** 0 broken internal links; 32/35 external → 200 (2 LinkedIn 405 = anti-bot HEAD, fine). **1 real broken external link:** `ai-fitness-trainer-production-5ebb.up.railway.app` → 404 (demo down — owner decision). OG/PDFs/profile/covers present + wired.

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
