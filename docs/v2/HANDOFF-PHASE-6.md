# Portfolio v2 — Fresh-Session Kickoff Prompt (Phase 6: Academics + Research)

> Paste everything below the line into a new chat with a coding agent. It is self-contained: it says what to read, the verified current state, the rules, the workflow, and the hard-won gotchas from Phases 0–5.

---

You are a senior full-stack engineer + design-quality specialist continuing a multi-session, in-progress portfolio rebuild ("**Portfolio v2**") — a from-scratch, professional, distinctive, animated, *not "vibe-coded"* front end. **Phases 0–5 are complete, reviewed, and green.** Your job is **Phase 6 — Academics + Research** to an industrial, production-grade standard. **Do NOT one-shot** — build in small, planned, tested, reviewed slices.

## 0. First action: read the context (before touching code)

Repo root: `c:\Users\p1a2r\OneDrive\Desktop\Git Hub Projects\Personal Website`. App in `v2/`. OS: Windows (PowerShell default; Bash also available). A hook may rewrite CLI calls via "rtk" — fine. Read, in this order:

1. **Memory (operating preferences):** `C:\Users\p1a2r\.claude\projects\c--Users-p1a2r-OneDrive-Desktop-Git-Hub-Projects-Personal-Website\memory\MEMORY.md`, then each file it indexes (`working-style.md`, `portfolio-v2-project.md`, `reviewer-subagents-readonly.md`).
2. **The authoritative spec:** `docs/superpowers/specs/2026-06-06-portfolio-v2-design.md` — focus on **§7.5 (Academics)**, **§7.6 (Research)**, **§10 (testing / strict-TDD mandate)**, **§11 (a11y + perf budgets)**, **§12 (skill-usage mandate)**, **§13 (phased plan — P6 row)**, **§17 (review corrections)**.
3. **The v2 operating docs:** `docs/v2/CLAUDE.md`, `PRD.md`, `FEATURES.md`, `DESIGN.md`, `MOTION.md`, `SHELL.md`, `HERO.md`, **`ABOUT.md`** (the most recent phase — mirror its quality bar + read its "Key decisions" and "Notes for later"), `ROADMAP.md`, `ROLLBACK.md`.
4. **The prior plans** (for format + quality bar — match these): `docs/superpowers/plans/2026-06-06-portfolio-v2-phase-{0,1,2,3,4,5}-*.md`. **The phase-5 (About) plan is your template**: complete code, bite-sized TDD tasks, atomic commits with verbatim messages, a self-review section.
5. **Next.js 16 caveat:** read `v2/AGENTS.md`; this is Next **16** (not 15) — APIs differ from older training data. When unsure, read `v2/node_modules/next/dist/docs/`.
6. **Skim the built code you'll reuse:** `v2/lib/` (`data.ts`, `types.ts`, `schemas.ts`, `site.ts`, `utils.ts`, `motion.ts`), `v2/components/ui/*` (`button, card, section, container, eyebrow, badge`, **`modal`**), `v2/components/motion/*` (`reveal, count-up, tilt-card, marquee, parallax, magnetic`), `v2/components/sections/about/*` (the **reference implementation** for a content section — stats, grid, modal usage, tablist), `v2/app/page.tsx` (home composition with anchored stub sections), `v2/components/layout/social-icons.tsx`.
7. **v1 content source of truth (read; never modify):** the repo-root `index.html` — **Academics = lines 539–614**, **Research = lines 615–626** (research is largely data-driven from `research.json`). Extract any hard-coded copy verbatim into typed `content/*.ts` modules (a core de-vibe-coding deliverable).
8. **Confirm the current state yourself** before planning: `git branch --show-current` (must be `feat/portfolio-v2`), and run the baseline gate sweep (see §9).

## 1. Project facts

- **Stack:** Next.js 16 (App Router, React 19, **static export** `output:'export'`, `trailingSlash:true`, `images:{unoptimized:true}`), TypeScript, Tailwind v4 (`@theme` CSS-var tokens), next-themes (4 themes: midnight/daylight/manuscript/neon), GSAP + ScrollTrigger + `@gsap/react` (`useGSAP`), Lenis, Vitest + Testing Library (jsdom, `globals:true`, `tests/setup.ts`), Playwright (chromium/firefox/webkit + `@axe-core/playwright`).
- **Branch `feat/portfolio-v2`.** Run all `npm` commands **from `v2/`**. Deploy target Vercel (root `v2/`); v1 stays live on Render. **Do NOT deploy or push** until the user approves cutover.

## 2. Current verified state (P0–P5 done, green)

- **P0–P4:** static-export foundation + Zod-validated build-time data pipeline (`scripts/sync-data.ts` copies `../static/data/*.json` → `v2/data/`, validated); design system (4 WCAG-AA themes as CSS-var tokens consumed via Tailwind utilities: `bg-background bg-surface bg-elevated text-heading text-foreground text-muted text-accent text-on-accent border-border ring-ring font-display font-mono`); motion system (reduced-motion-gated primitives + the `ScrollSequence` canvas engine); layout shell (`SiteNav` scroll-spy, focus-trapped `MobileMenu`, `SiteFooter`, `Preloader`, `CustomCursor`, `GrainOverlay`); editorial Hero + ScrollShowpiece.
- **P5 (About) — just completed:** real About section + a **reusable accessible `Modal` primitive** (`components/ui/modal.tsx`: focus-trap, Esc, scrim, body-scroll-lock, returns focus to opener, `role=dialog`/`aria-modal`, `z-[80]`, returns `null` when closed). See `docs/v2/ABOUT.md`.
- **Reuse these (do not reinvent):** `lib/data.ts` loaders (`getProjects/getCourses/getResearch/getCertifications/getProfessionalDevelopment`); UI primitives (`Section, Container, Card, Button, Eyebrow, Badge`); motion primitives (`Reveal` staggered scroll-in, `CountUp` data-counter, `TiltCard`, `Marquee`); the **`Modal`** primitive; `social-icons.tsx` (lucide-react v1.x has **no brand icons**); `lib/site.ts` (`SITE`, `SOCIAL_LINKS`, `NAV_SECTIONS`, `NAV_OFFSET=88`).
- **Gates currently green** (run from `v2/`): `npm run lint`, `npm run typecheck`, `npm test` (105 unit), `npm run build` (static export, routes `/`, `/preview`, `/preview/motion`), `npm run test:e2e` (cross-browser + axe). **Known pre-existing flake** (NOT yours, do not chase): an intermittent `firefox › /preview` axe color-contrast finding on the primary `Button` — axe samples it mid-theme-switch transition (blended ~4.04–4.43); the settled tokens pass, the home page is axe-clean in all 4 themes. It's a noindex styleguide page; flag it for the P12 QA pass, don't fix it here.

## 3. What to build — Phase 6 (Academics + Research)

Replace the home page's **`#academics`** and **`#research`** stub sections (in `app/page.tsx`) with real sections. **Keep the same `id`s** so scroll-spy + footer links keep working. Heading order: page has ONE `<h1>` (hero); each section is `<h2>`, sub-groups `<h3>` (never skip levels — axe `heading-order`).

### Academics (spec §7.5)
- **UC Berkeley header**: identity + key stats (e.g., GPA 4.0 + course count) — reuse `CountUp` (data-derive the course count from `getCourses().length`, like About derives its stats).
- **Course grid in 3 states** — **completed / currently enrolled / upcoming** — from `courses.json` via `getCourses()`, **with course images**.
- **Course shape** (`courseSchema`): `{ id, code, name, grade, semester, status: "completed"|"in-progress"|"upcoming", url, image, description, skills[], topics[], projects: { name, description, highlights?[], technologies?[], paperUrl? }[] }`.
  - **⚠️ Inspect the real data first** (`console.log(getCourses().map(c => ({code:c.code, status:c.status, semester:c.semester})))`) before designing the grouping: prior data only uses `completed` | `upcoming`, and "currently enrolled" may map to a specific semester rather than a `status` value. **Don't assume** — derive the 3 groups from the actual data, and TDD a pure `groupCoursesByState()` / sort helper.
  - Course cards: image (CLS-safe `<img width/height>`; consider a tasteful frame/`TiltCard`), `code` + `name`, `grade` chip, `semester`, `skills`/`topics` as `Badge`s. Rich courses (those with `description`/`projects`) can **expand into the reusable `Modal`** (reuse the About awards pattern, including the WebKit trigger-focus fix — see §8).

### Research (spec §7.6)
- Papers from `research.json` via `getResearch()`.
- **Research shape** (`researchSchema`): `{ id, displayTitle, fullTitle, field, fieldColor, link, abstractSummary, fullAbstract, keyTopics[], skills[], relatedCourse: string|null }`.
  - Cards show `displayTitle`, `field` tag, `abstractSummary`, `keyTopics`/`skills` (`Badge`s), external `link`. Expand to `fullAbstract` (+ `fullTitle`, `relatedCourse`) via the **`Modal`** primitive.
  - **⚠️ `fieldColor` is a raw hex from the JSON data** — using it as text-on-color or a filled tag risks failing WCAG-AA in one or more of the 4 themes (axe can't always see it, and it's not theme-aware). Treat it as a *small* accent (a dot or left-border), not colored text on a colored fill; or map `field` → a theme-safe accent treatment. Verify contrast by eye in every theme. **Do not introduce hardcoded hex in components** — `fieldColor` is the only data-driven color and must be handled carefully.

### Assets
- Course `image` paths point at v1 assets. **Inspect the paths**, then **copy the needed images** from `static/images/...` into `v2/public/images/...` (mirror P5's award-logo copy: `chore(v2): copy v1 course images into v2/public`). v2's `.gitignore` ignores only root-level `/*.png`, so `public/images/**` is committed. If an asset is missing/low-res, STOP and ask the user via a crisp `AskUserQuestion` (offer exact specs + target path, or a Nano Banana Pro prompt) — use a tasteful placeholder meanwhile; never block.

### Content extraction
- Any Academics prose hard-coded in v1 `index.html` (header blurb, section copy) → typed `v2/content/academics.ts`. The 4 JSON files stay the single source of truth — consume the loaders, never refetch at runtime, never edit the JSON.

### Smoke/pipeline proof
- The Academics header showing `getCourses().length` (13) restores the on-page courses-count pipeline proof that left with the About stub. Consider a `data-testid` so e2e can assert it (the current smoke asserts About `stat-projects`/`stat-research`).

## 4. Non-negotiable rules

- **Never modify v1**: `app.py`, `index.html`, `static/**`, repo-root configs. Only `v2/` and `docs/`.
- **Do NOT push / deploy.** Commit locally, **atomic commits**, one per task, conventional-commit messages matching history, each ending with the trailer:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  Stage explicit paths (`git add v2/...`), never `git add -A` from repo root (there are gitignored artifacts + a stray `nul` there).
- **A11y + motion are mandatory:** WCAG 2.1 AA, ≥4.5:1 text contrast **in every theme** (CI test in `tests/unit/theme.test.ts` must stay green); single `<h1>` + correct heading order; visible focus rings; ≥44×44px targets; full keyboard support; **`prefers-reduced-motion` honored everywhere** (gate GSAP with `gsap.matchMedia()`; reduced path = content visible/static, never pin/trap scroll).
- **Design bar:** editorial Exaggerated-Minimalism — oversized Fraunces, mono micro-labels, one accent per theme, asymmetric/grid-breaking composition, **restraint (1–2 key animations per view)**. No emoji as structural icons (use lucide-react; brand glyphs via `social-icons.tsx`). Never hardcode hex — use the semantic Tailwind tokens. Plain `<img>` (CLS-safe `width`/`height`), not `next/image` optimization.
- **Static-export discipline:** no server-only features; build-time data only.

## 5. Mandated skills (use every relevant phase; STATE how you applied each)

- **`superpowers:brainstorming`** if the section composition is fuzzy (e.g., how to present the 3 course states — grouped sections vs tabs vs filters); **`writing-plans`** to produce `docs/superpowers/plans/2026-06-06-portfolio-v2-phase-6-academics-research.md` with complete code + TDD tasks (match the phase-5 plan); **`subagent-driven-development`** to execute; **`systematic-debugging`** for any test failure/bug (root cause before fixes); **`test-driven-development`** (failing test first for pure logic); **`requesting/receiving-code-review`** + **`verification-before-completion`**.
- **`frontend-design`** (distinctive editorial composition; avoid generic AI aesthetics), **`gsap-*`** (`gsap-core/timeline/scrolltrigger/react/performance` — useGSAP scoping+cleanup, transforms/opacity only, matchMedia gate, ScrollTrigger only on top-level tweens), **`ui-ux-pro-max`** (≥44px, focus rings, 150–300ms micro-interactions, modal/tablist/tooltip patterns, contrast, reduced-motion). The reusable `Modal` + `CountUp` + `Reveal` already encode much of this — reusing them *is* applying the skills.

## 6. MCPs / tools — use them

- **Playwright MCP** (`mcp__plugin_playwright_playwright__browser_*`) — **MUST** visually verify every new section in a real browser before claiming done. Pattern: `npm run build`, serve the static output (`python -m http.server 4321 --directory out` in the background, from `v2/`), `browser_navigate` to `http://localhost:4321/`, set theme via `browser_evaluate(() => { localStorage.setItem('theme','neon'); location.reload(); })`, scroll to the section, `browser_take_screenshot` (jpeg), then **Read the image to actually look at it**. Screenshot **all 4 themes + mobile (390px)** and exercise interactions (course/research modals, any tabs/filters). Add `@axe-core/playwright` coverage for the new surface (the homepage axe scan in `accessibility.spec.ts` auto-covers it across 4 themes). Clean up screenshots (don't commit them) + close the browser + stop the server.
- **context7** (`mcp__context7__*`) — current Next 16 / Tailwind v4 / GSAP docs; prefer over memory for library APIs.
- **context-mode** + **rtk** (installed) — process large outputs/files without flooding context.

## 7. The implementation cycle you MUST follow (per phase)

1. **Plan** (`writing-plans`): write the phase-6 plan doc with bite-sized, TDD, atomic-commit tasks and **complete code (no placeholders)**. Self-review it against spec §7.5/§7.6. Commit the plan.
2. **Implement via a fresh-context subagent** (`subagent-driven-development`): dispatch ONE implementer (Sonnet is fine for transcription of a complete plan) to execute task-by-task — TDD on pure logic (course grouping/sort, any filters), atomic commits with the plan's verbatim messages + trailer. **NEVER push.**
3. **Two-stage unbiased review:** dispatch TWO fresh reviewers on the git range (`<plan-sha>..HEAD`): Stage 1 spec/a11y/design compliance; Stage 2 code-quality/bugs/Next-16/RSC. **Use the read-only `reviewer` agent type** (tools: Read/Grep/Glob) so a reviewer cannot exceed its mandate — in P5 a `general-purpose` reviewer went rogue and committed unauthorized out-of-scope changes. **After ANY subagent runs, `git log <base>..HEAD` and verify the commit set is exactly what you expect**; trust the actual diff, not the subagent's self-report.
4. **VERIFY yourself — don't trust green checks.** Run the gates from `v2/`: `lint`, `typecheck`, `npm test`, `build`, and the **FULL** `test:e2e` (all 3 browsers — *not* chromium-only: in P5 the chromium-only smoke missed 4 cross-browser failures, incl. a strict-mode locator collision and a WebKit modal-focus drop). Then drive the browser (Playwright MCP) across **all 4 themes + mobile (390px)** and **Read the screenshots** — this loop has repeatedly caught defects that all tests passed through (invisible CTAs, dark-on-dark canvas text, heading-order, a 1px scroll-spy boundary, hydration races, and a `line-clamp` silently disabled by a conflicting `block` utility). Assume your slice has a hidden defect until the browser proves otherwise.
5. **Hunt for problems + raise quality.** Actively look for bugs, edge cases, regressions, a11y gaps, CLS/jank, inconsistent styling across the 4 themes/breakpoints, broken links, and **missed essential functionality vs v1 parity** (compare against `index.html` Academics/Research). Add missing essential functions, make sensible professional revisions, improve to an industrial standard. Fix every Critical/Important finding (TDD: failing test first for logic bugs) and re-verify the full sweep + browser.
6. **Document** (concise `docs/v2/ACADEMICS-RESEARCH.md` or extend a section reference) + update `ROADMAP.md` status (P6 complete; next P7).
7. **Report** to the user: per-task summary + commit SHAs, actual gate results (counts + per-browser e2e), screenshots reviewed (offer to regenerate), deviations, self-review, and confirmation **no v1 changed / nothing pushed**. Then **pause for the user** before Phase 7.

## 8. Environment gotchas + lessons (already paid for — heed them)

- **Reviewer subagents must be read-only** (`reviewer` type). Verify every subagent's work against `git log/diff`, not its report. (See `memory/reviewer-subagents-readonly.md`.)
- **Run the full cross-browser e2e**, never chromium-only. The dev server compiles on demand → e2e flakes **under load**; tests pass **in isolation** (`playwright.config.ts` caps workers + retries). Re-run a lone failure in isolation before treating it as real.
- **Scope ambiguous e2e locators to a container** (`page.locator('#research').getByRole(...)`) — section/footer labels duplicate across the page (P5's hero "Résumé" assertion collided with About's new "Résumé" link → strict-mode violation on all 3 browsers).
- **WebKit doesn't focus a `<button>` on mouse click** — when opening the `Modal` from a card, focus the trigger in `onClick` (`e.currentTarget.focus()`) so focus returns correctly on close (reuse the `awards.tsx` pattern). The `Modal` is otherwise ready to reuse.
- **`line-clamp-N` needs no conflicting `display` utility** — don't put `block` next to `line-clamp-2` (it overrides `display:-webkit-box` and silently disables clamping; only caught by eye in the browser).
- **Hydration races:** static islands attach handlers only after hydration; wrap first e2e interactions in `await expect(async () => {…}).toPass()`.
- **Reduced motion** via Playwright = `test.use({ contextOptions: { reducedMotion: "reduce" } })` (not a direct option). Under RM, `CountUp` renders the final value immediately (deterministic for assertions).
- **lucide-react v1.x has NO brand icons** — reuse `social-icons.tsx`. Verify any new lucide icon name exists (typecheck/build will fail on a bad import).
- **4 themes must stay WCAG-AA**; axe can't see `<canvas>` or judge image legibility — verify by eye in every theme (incl. the research `fieldColor` and any course images on dark themes; use a neutral chip behind any brand-mark-style image, as award logos do).
- **Next 16 + spaces in the path** triggers a Turbopack dev-server manifest bug (worked around by `app/global-error.tsx`); the **production build/static export is unaffected** — prefer verifying via `npm run build` + serving `out/`. Server Components can't pass function props to Client Components — keep icon-bearing content imported directly by the rendering component (RSC boundary; the build fails loudly if violated).
- **LF→CRLF** git warnings are cosmetic. Verification screenshots at the `v2/` root are gitignored; don't commit them.

## 9. Key commands (from `v2/`) + start here

```bash
npm run dev          # local dev (predev syncs data)
npm run build        # static export to out/ (prebuild syncs + validates data)
npm run lint
npm run typecheck
npm test             # Vitest unit
npm run test:e2e     # Playwright chromium/firefox/webkit + axe (run the FULL suite)
npm run sync:data    # copy + validate ../static/data/*.json → v2/data
```

**Start:** 1) Confirm branch + green baseline gates. 2) Read §0. 3) `console.log` the real `getCourses()`/`getResearch()` shapes + status/semester distribution, and read v1 `index.html` Academics (539–614) + Research (615–626) for parity. 4) Use `writing-plans` to produce the Phase-6 plan, then implement → two-stage review (read-only reviewers) → verify yourself (full gates + browser MCP, 4 themes + mobile) → hunt/fix → document → report → **pause for the user**. Work autonomously otherwise; report only finished, verified results — no broken hand-offs.
