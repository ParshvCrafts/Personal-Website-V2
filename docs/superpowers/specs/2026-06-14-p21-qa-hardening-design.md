# P21 — Cross-Cutting QA, Hardening & Final Docs (Design / Scope Spec)

**Date:** 2026-06-14 · **Branch:** `main` · **Program:** Portfolio v2.5 "Signature"
**Status:** scope approved by user (5-wave order, 2026-06-14).

## Goal

Audit the shipped v2.5 site (esp. P17–P20 surfaces + the un-deep-reviewed parallel
motion work), hunt bugs / regressions / a11y gaps / perf issues / missed essentials,
raise everything to an industrial, production-grade standard, and finalize docs.
**Audit-and-improve, not greenfield.** No one-shot — small, planned, reviewed, TDD'd
slices, each verified in a real browser; pause for the user between waves.

## Locked decisions (2026-06-14)

- **Sequencing:** the 5-wave order below; pause after each wave for user sign-off.
- **Push:** never auto-push; only on explicit user request.
- **Reserved aesthetic defaults** (P19 `SHOWPIECE_DEFAULT`, P14 hero variant) stay as
  currently coded; surfaced in-browser during Wave D for a user pick — not flipped
  unilaterally.
- **Assets:** no new art assumed; verify/wire only what already exists in `public/images`.
- **Lean:** correctness / a11y / perf fixes take priority over new "essential" features;
  minimize scope creep. New functionality only when a genuine gap is found and agreed.

## Non-negotiable rules (carry from program brief)

- Never modify v1 (`app.py`, `index.html`, `static/**` except `static/data/` meaning,
  root configs not ours). Work in `app/ components/ lib/ docs/ tests/ scripts/`.
- Atomic conventional commits, trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`;
  stage explicit paths, **never** `git add -A/./-u` (keep `docs/skills/**` uncommitted).
- WCAG 2.1 AA: single `<h1>`, visible focus, ≥44×44 targets, full keyboard,
  ≥4.5:1 text contrast **in all 4 themes**, `prefers-reduced-motion` honored everywhere
  (reduced path = content visible/static, never pin/trap scroll).
- Editorial design bar; theme tokens / `color-mix` (no hardcoded hex in shipped
  components); plain CLS-safe `<img>`, not `next/image`.
- Static-export discipline; do not delete P15 cinematic assets.

## Verification doctrine

Don't trust green checks. Each wave: `lint` + `tsc` (whole project) + `vitest` + `build`,
then drive the real browser (Playwright MCP) across **4 themes + mobile (390px)**, and
for motion changes the **real Playwright runner** with `emulateMedia({ reducedMotion })`.
Read every screenshot. Assume a hidden defect until the browser proves otherwise — in
this program, real bugs have only surfaced in the visual pass.

## Sub-waves

### Wave A — e2e infrastructure runnable + green  *(foundation; unblocks B & C audits)*
- Replace the Playwright `webServer` that uses `npm run dev` (Turbopack panics on
  `globals.css` under the spaces-in-path) with a **build + static-serve of `out/`**.
- Gate all "a canvas mounts" / WebGL assertions on a real `getContext('webgl2')` probe
  (headless WebKit has no WebGL2 → rig stays tier "off").
- Get existing specs (`hero-3d`, `showpiece`, `command-palette`, `status-and-tour`,
  section/contact specs, etc.) booting and green on chromium/firefox/webkit; quarantine
  any genuinely environment-bound case with a documented reason.
- **Exit:** `npm run test:e2e` boots without dev server and runs the full suite across
  3 browsers; pass, or documented quarantine. No product behavior changed.

### Wave B — a11y + reduced-motion hardening  *(depends on A)*
- Full `@axe-core/playwright` sweep across every section + P20a/P20b surfaces (palette,
  tour, status widget, easter-egg ripple) in **all 4 themes**: single `<h1>`, landmarks,
  focus order/visible focus, ARIA, contrast ≥4.5:1, keyboard-only, no focus traps.
- Fix known: `AnimationToggle` 36px → ≥44×44. Sweep for other sub-44px targets.
- Reduced-motion audit via real runner `emulateMedia({ reducedMotion: 'reduce' })`:
  palette opens instantly; Konami → ripple opacity-pulse (no expansion); tour
  prompt/spotlight no animation + no auto-scroll smoothing; no `.pin-spacer` anywhere;
  all content visible/static. Verify the `data-reduce-motion` toggle quiets motion sitewide.
- **Exit:** axe clean (or documented) ×4 themes; all targets ≥44px; RM paths asserted by
  passing e2e; fixes TDD'd where logic is involved.

### Wave C — performance budgets + asset/link/CSP sweep
- Measure home initial JS (three/R3F must stay code-split off the initial bundle), CLS,
  LCP, Inkfield/3D cost per tier, Save-Data/low-tier fallback. Set + document budgets.
- Lighthouse (perf/a11y/best-practices/SEO); fix regressions.
- Broken-link + asset sweep from `out/`: every internal anchor, external link,
  `/documents/resume.pdf` & `/documents/transcript.pdf`, OG image → resolve/200.
- Verify P18 imagery wiring (project covers, OG) against existing `public/images` only.
- Confirm `vercel.json` CSP `connect-src` allows `https://api.github.com` (status widget)
  and `https://api.web3forms.com` (contact form); review the rest of the CSP for breakage.
- **Exit:** documented budgets met or justified; Lighthouse scores recorded + regressions
  fixed; zero broken links/assets from `out/`; CSP verified non-breaking.

### Wave D — cross-theme × breakpoint visual sweep + parallel-work deep review
- 4 themes × mobile/tablet/desktop visual sweep of every section + new surfaces; fix
  inconsistencies (caret/keycap/halo/contrast class found in prior phases).
- Deep read-only review of the un-deep-reviewed parallel work: motion system
  (`components/motion/*`, `components/providers/motion-preference`,
  `components/ui/progressive-image`), `app/error.tsx`, `app/not-found.tsx`.
- Surface P19 showpiece + P14 hero defaults in-browser for a user pick.
- **Exit:** no cross-theme/breakpoint defects; parallel work reviewed + issues fixed;
  default picks confirmed.

### Wave E — final documentation
- Ensure every `docs/v2/*.md` phase doc is accurate; `ROADMAP-V2.5-SIGNATURE.md` reflects
  reality; add a top-level `README.md` / project overview if missing.
- Update the `portfolio-v2.5-signature` memory snapshot.
- **Exit:** docs accurate + complete; roadmap marks P21 done; memory updated.

## Per-wave cycle (each wave)

brainstorm/confirm → `writing-plans` TDD plan (complete code, atomic commits) → implement
via fresh **Sonnet** subagents (audit every diff with `git diff`, run `tsc` not just tests)
→ two-stage read-only `reviewer` agents (scope to our files, ignore `docs/skills/**`) →
triage findings critically → verify (gates + Playwright MCP 4 themes + mobile + real-runner
RM, read screenshots) → hunt/fix/raise-quality → document → report → **pause for user**.

## Out of scope

- New greenfield features beyond agreed gap-fills.
- New art/asset generation (none assumed).
- v1 changes; pushing to origin (until explicitly requested).
