# Portfolio v2.5 "Signature" — Fresh-Session Kickoff (P21: Cross-Cutting QA, Hardening & Final Docs)

> Paste everything below the line into a new chat with a coding agent. Self-contained: what to read, the verified current state, the rules, the workflow, the gotchas, and the P21 scope. This is the master brief — follow it.

---

You are a senior full-stack engineer + design-quality + QA specialist continuing a multi-session, in-progress program called **"Portfolio v2.5 Signature"** — a Next.js 16 static-export portfolio being taken from polished → exceptional. **P13–P20 are complete, reviewed, verified, and committed.** Your job is **P21 — the cross-cutting QA, hardening, and final-documentation phase**: audit the whole site (especially the newer P17–P20 surfaces), hunt for bugs / regressions / a11y gaps / perf issues / missed essentials, raise everything to an **industrial, production-grade standard**, then finalize docs. **Do NOT one-shot.** Work in small, planned, reviewed, TDD'd slices, verify each in the real browser, and **pause for the user** at phase boundaries.

## 0. First actions (before touching code)

1. **Repo:** standalone repo `Personal Website V2` (`github.com/ParshvCrafts/Personal-Website-V2`), branch **`main`**, app at the **repo root** (no `v2/` subfolder). OS: **Windows** (PowerShell default; Bash also available). A shell hook rewrites some CLI calls via "rtk" (token proxy) — fine, but it sometimes swallows stdout detail (eslint/playwright/vitest counts); when you need raw output, write to a repo-local file and read it, or use `--reporter=dot`. **Run all `npm` commands from the repo root.**
2. **Read the operating context (portable memory, in-repo) — fully:** `docs/context/working-style.md`, `portfolio-v2-project.md`, `portfolio-v2.5-signature.md` (program state + every phase's gotchas — READ THIS FULLY), `reviewer-subagents-readonly.md`, `v2-e2e-flake-patterns.md`, `docs/context/README.md`.
3. **Read the roadmap + recent phase docs:** `docs/v2/ROADMAP-V2.5-SIGNATURE.md`, and the newest surfaces you'll be auditing: `docs/v2/COMMAND-PALETTE.md` (P20a), `docs/v2/STATUS-AND-TOUR.md` (P20b), `docs/v2/INTERACTION-POLISH.md` + `HERO-3D.md` (P17), `docs/v2/SHOWPIECE-VARIANTS.md` (P19), `CINEMATIC-PIPELINE.md` (P15).
4. **Read the prior master brief for rules/workflow/gotchas:** `docs/v2/HANDOFF-P20-SIGNATURE.md` (§4 rules, §5 skills, §6 MCPs, §7 cycle, §8 gotchas still apply almost verbatim).
5. **Cross-machine note:** `docs/v2/WORKING-ACROSS-MACHINES.md` — if you're on a different laptop, follow its setup + sync rules (pull before, push after, one laptop at a time). The dev-server bug is avoided by cloning to a **space-free path**.
6. **Confirm state yourself:** `git branch --show-current` = `main`; run the baseline gates (§4) and confirm green. **Heed the dev-server gotcha (§5): verify via `npm run build` + serving `out/`, not `npm run dev`.**
7. **Next 16 caveat:** read `AGENTS.md`; this is Next **16.2.7** (App Router, React 19.2.4, `output:'export'`). APIs differ from older training data — when unsure, read `node_modules/next/dist/docs/` or use **context7** MCP.

## 1. Current verified state (P0–P20 done, green)

- **Stack:** Next 16.2.7 (App Router, React 19.2.4, static export, `trailingSlash:true`, `images:{unoptimized:true}`, turbopack root pinned), TypeScript, Tailwind v4 (`@theme` CSS-var tokens), next-themes (4 themes: midnight/daylight/manuscript/neon), GSAP+ScrollTrigger+`@gsap/react`+Lenis, three 0.184 + R3F 9.6.1 + drei + postprocessing, Vitest (jsdom, `tests/unit/**`, ~270 tests across 47 files), Playwright (chromium/firefox/webkit + `@axe-core/playwright`, `tests/e2e/**`).
- **Content source of truth:** 4 JSON in repo-root `static/data/` synced into `data/` at build via `scripts/sync-data.ts`.
- **P13** R3F rig (`SceneSlot` gateway, tiering, fallbacks). **P14** scroll 3D hero variants (`?hero=`). **P15** cinematic pipeline ("Signal" ink film, frames in `public/sequences/intelligence/`, **do NOT delete**). **P16** scroll-scrubbed cinematic showpiece. **P17** **Inkfield** hero (default `?hero=ink`), state-aware cursor, interaction tokens, View-Transition modal morph, ink-drop preloader. **P18** DEFERRED imagery (a batch of real images DID land via the parallel session — awards/courses/cinematic/profile/OG under `public/images/`; OG/covers wiring may still be partial — see `docs/v2/ASSET-PROMPTS.md`). **P19** scroll-showpiece variants (`?show=keystroke|keyboard|cinematic`, **default keystroke**). **P20a** ⌘K command palette + Konami easter egg (`docs/v2/COMMAND-PALETTE.md`). **P20b** footer live-status widget + opt-in guided tour (`docs/v2/STATUS-AND-TOUR.md`).
- **A large "parallel session" body of work was committed** earlier this program: a motion system (`components/motion/scroll-reveal|click-spark|marquee-ticker`, `components/providers/motion-preference`, `components/layout/animation-toggle`, `components/ui/progressive-image`), `app/error.tsx` + `app/not-found.tsx`, the imagery batch, `vercel.json` security headers + CSP, `eslint`/`tsconfig` `docs/skills/**` ignores. It builds + tests green but **was not deeply reviewed** — treat it as in-scope for the P21 audit.
- **Gates green:** `npm run lint`, `npm run typecheck`, `npm test` (~270 unit), `npm run build` (static export). **Cross-browser e2e is NOT routinely run** — see the dev-server gotcha (§5); making the e2e suite actually runnable is a P21 task.
- **Git:** local `main` is **ahead of `origin/main` by ~17 commits** (all of P20b is local-only; origin is at the P20a-era push `3df2c7b`). Nothing is pushed automatically. **Push only when the user explicitly asks** (they did a one-time `git push` earlier; they may ask again).

## 2. What to do — P21 (Cross-cutting QA, hardening & final docs)

This phase is **audit-and-improve**, not greenfield. The user's explicit ask: run a rigorous cycle of **implement → deep code review → test → validate → check → identify mistakes/bugs/issues/things that slipped through → improve quality → make it professional / industrial-standard → add any missed essential functionality → improvements & revisions.** Apply that cycle to each area below. **Brainstorm + agree the P21 scope/sequencing with the user first** (it's large — split into sub-waves; recommend the order below).

Candidate work items (confirm + prioritize with the user during brainstorming):

1. **Make the e2e suite runnable + green** across chromium/firefox/webkit. The Playwright `webServer` uses `npm run dev` (Turbopack) which **panics on `app/globals.css` under the spaces-in-path**. Options: point the e2e `webServer` at `npm run build && serve out/` (a static server) instead of dev; or fix the Turbopack/path issue. Then get all existing specs (`hero-3d`, `showpiece`, `command-palette`, `status-and-tour`, etc.) passing cross-browser, gating WebGL assertions on a real `getContext('webgl2')` probe (headless WebKit has none).
2. **Full a11y audit** with `@axe-core/playwright` across every section + the new P20a/P20b surfaces (palette, tour, status widget, easter-egg ripple) in **all 4 themes**: single `<h1>`, landmark structure, focus order/visible focus, ≥44×44 targets (KNOWN: `AnimationToggle` is 36px — fix), ARIA correctness, color contrast ≥4.5:1 every theme, keyboard-only operability, no focus traps.
3. **Reduced-motion audit (the gap):** P20a/P20b RM paths are gated in code but were **never visually confirmed** (Playwright MCP can't emulate the RM media query). Use real e2e with `page.emulateMedia({ reducedMotion: 'reduce' })` to assert: palette opens instantly, Konami → ripple opacity-pulse (no expansion), tour prompt/spotlight no animation + no auto-scroll smoothing, no `.pin-spacer` anywhere, all content visible/static. Also verify the `data-reduce-motion` toggle (the motion-preference feature) actually quiets motion site-wide.
4. **Performance budgets + Lighthouse:** measure the home initial JS (three/R3F must stay code-split off the initial bundle), CLS (plain `<img>` not `next/image`), LCP, the 3D/Inkfield cost (FPS, particle counts per tier), and Save-Data/low-tier fallbacks. Set + document budgets. Run Lighthouse (perf/a11y/best-practices/SEO) and fix regressions.
5. **Broken-link + asset sweep:** every internal anchor + external link + the `/documents/resume.pdf` & `/documents/transcript.pdf` + OG image path resolve/200 from `out/`. Verify the P18 imagery is actually wired (project covers, OG) or finish wiring it if the user supplies assets via `docs/v2/ASSET-PROMPTS.md`.
6. **Review the un-deep-reviewed parallel work** (the motion system, error/not-found pages, `vercel.json` CSP — confirm the CSP doesn't break the GitHub `fetch` in the status widget or any inline needs, web3forms `connect-src`, etc.).
7. **Cross-theme × cross-breakpoint visual sweep** (4 themes × mobile/tablet/desktop) of every section + the new surfaces; fix inconsistencies.
8. **Final documentation pass:** ensure every phase doc is accurate, the roadmap reflects reality, and add a top-level README / project overview if missing.

## 3. Non-negotiable rules

- **Never modify v1:** repo-root `app.py`, `index.html`, `static/**` (except `static/data/` is canonical content — don't change meaning), root configs you don't own. Work in `app/`, `components/`, `lib/`, `docs/`, `tests/`, `scripts/`.
- **Commits:** atomic, one per logical change, conventional-commit messages matching history, each ending with the trailer:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  **Stage explicit paths** (`git add components/...`), **NEVER `git add -A`/`.`/`-u`** (`docs/skills/` is gitignored vendored reference; keep it that way). **Do NOT push unless the user asks.**
- **A11y + motion mandatory:** WCAG 2.1 AA, ≥4.5:1 text contrast **in every one of the 4 themes**; single `<h1>`; visible focus; ≥44×44 targets; full keyboard; **`prefers-reduced-motion` honored everywhere** (gate GSAP via `matchMedia`/`prefersReducedMotion()`; reduced path = content visible/static, never pin/trap scroll). Decorative 3D/video is `aria-hidden` with content parity in sibling DOM.
- **Design bar:** editorial Exaggerated-Minimalism — Fraunces display, Hanken body, Geist Mono labels, one accent per theme, restraint. No hardcoded hex in shipped components (theme tokens / `color-mix`). Plain CLS-safe `<img>`, not `next/image`.
- **Static-export discipline:** no server-only features; build-time/client-only data. Don't delete P15 cinematic assets.

## 4. Baseline gates (run first; must stay green)

```
npx tsc --noEmit -p tsconfig.json          # whole-project typecheck (ignore docs/skills/** errors only)
npx eslint <files you touch>               # lint your files (lint errors under docs/skills are vendored — ignore)
npx vitest run --reporter=dot              # ~270 unit tests (jsdom; pure logic only)
npm run build                              # static export to out/
```

## 5. Environment gotchas (already paid for — heed them)

- **Dev server is broken here:** `npm run dev` (Turbopack) panics reading `app/globals.css` under the spaces-in-path (`…/Git Hub Projects/…`). Playwright's default `webServer` uses `npm run dev` → e2e fails to boot. **Verify everything via `npm run build` + serving `out/`** (PowerShell: `Start-Process -WindowStyle Hidden python -ArgumentList "-m","http.server","4321","--directory","out"`). Fixing/replacing this for e2e is P21 item #1. If you must kill stale procs: PowerShell `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'next dev|next-server|playwright|http.server 4321' -and $_.CommandLine -notmatch 'claude|anthropic|rtk' } | Stop-Process -Force`. **Never mass-kill all node** (the agent runs on node). Note: a server-kill command can self-match the shell that runs it (harmless exit 255).
- **jsdom has no WebGL** — never import `@react-three/fiber`/`drei`/`three` into Vitest unit tests; unit-test only pure logic. **Headless WebKit has no WebGL2** → the rig stays tier "off" there; gate "a canvas mounts" e2e on a real `getContext('webgl2')` probe.
- **vitest doesn't typecheck** — a test that passes `vitest run` can still break `tsc`/`build` (this bit P20 twice: a `readonly`-tuple arg). Always run `tsc` after a subagent, not just the tests.
- **React 19 hooks lint is strict** (`react-hooks/set-state-in-effect`, `exhaustive-deps`, refs, purity): no ref writes during render (lazy `useState` init); wrap unconditional effect `setState` with `// eslint-disable-next-line react-hooks/set-state-in-effect` (the rule IS real here); side effects go inside effects/handlers.
- **Playwright MCP cannot emulate `prefers-reduced-motion`** (no `emulateMedia`) — RM must be verified via the real Playwright runner's `page.emulateMedia({ reducedMotion: 'reduce' })`. The MCP `browser_snapshot` can exceed the token limit on this page — prefer `browser_take_screenshot` (jpeg) + Read, or targeted `browser_evaluate`.
- **Theme token for inline styles:** background CSS var is `var(--color-background)` (Tailwind v4 maps per-theme `--background`). `#projects`/`#contact` are stable section anchors; the showpiece has no stable id and is dynamically mounted (don't target it by id).
- **Parallel-session risk is largely resolved** (that work is now committed), but if `git status` shows unexpected edits, confirm before assuming — always `git add` explicit paths.

## 6. Mandated skills & MCPs (the user REQUIRES these — state how you applied each)

- **Process:** `superpowers:brainstorming` (HARD gate before any new feature/UX work or design decision — agree scope + design with the user, write a spec, commit), `writing-plans` (detailed TDD plan with complete code + atomic commits), `subagent-driven-development` (execute via fresh-context **Sonnet** subagents for mechanical work; **orchestrator audits every subagent diff with `git log/diff` — trust the diff, not the report**), `test-driven-development` (failing test first for pure logic), `systematic-debugging` (root-cause before fixes), `requesting/receiving-code-review` + `verification-before-completion` (evidence before claiming done; triage review findings critically — reject the wrong ones, fix the real ones).
- **Frontend/animation (use on every UI/motion change):** `frontend-design`, the `gsap-*` family, **`ui-ux-pro-max`** (run its `search.py` at the resolved real path under `…/ui-ux-pro-max/2.5.0/src/ui-ux-pro-max/scripts/search.py`), **`react-bits`** (catalog at `~/.claude/skills/react-bits/src/ts-tailwind/`; copy + retokenize, do NOT npm-install), `react-best-practices`.
- **MCPs:** **Playwright MCP** (`mcp__plugin_playwright_playwright__browser_*`) — MUST visually verify every visual change; build → serve `out/` → `browser_navigate` → set theme via `browser_evaluate(()=>{localStorage.setItem('theme','neon');location.reload()})` → `browser_take_screenshot` (jpeg) → **Read the image**. Screenshot **all 4 themes + mobile (390px)**; clean up `.playwright-mcp/` (gitignored) + stop the server + close the browser when done. **context7** for current Next 16 / Tailwind v4 / GSAP / R3F docs. **firecrawl** for web. **21st.dev Magic** for component/UI ideas.
- **Token optimization (user preference):** strong model for planning/review, **Sonnet subagents** for laborious implementation; **caveman** keeps output terse; **context-mode + rtk** to process large files/outputs without flooding context. The user runs other agents concurrently sometimes and wants this kept token-lean.

## 7. The cycle you MUST follow (per sub-wave)

1. **Brainstorm → spec** (`brainstorming`): for any change involving design/UX judgment or new functionality, agree scope + approach with the user, write `docs/superpowers/specs/YYYY-MM-DD-...-design.md`, commit. (Pure bug-fixes/audits with an obvious correct answer can skip straight to a plan, but still get user sign-off on scope for a big audit wave.)
2. **Plan** (`writing-plans`): bite-sized TDD tasks with **complete code (no placeholders)** + atomic-commit messages; self-review vs the spec; commit the plan.
3. **Implement** (`subagent-driven-development`): dispatch fresh **Sonnet** implementer subagent(s) with exact task text + file list + the HARD RULES (explicit `git add`, trailer, no config edits, ignore `docs/skills`). **Audit every diff yourself** (`git diff <base>..HEAD`), run `tsc` (not just tests), confirm scope.
4. **Two-stage read-only review:** dispatch fresh **`reviewer`** agents (Read/Grep/Glob only) on the git range — Stage 1 spec/a11y/design; Stage 2 code-quality/bugs/Next-16/RSC/perf/R3F-lifecycle. Scope to your files; tell them to **ignore `docs/skills/**`**. Triage findings critically (`receiving-code-review`): reject the off-base ones with reasons, fix the real ones (TDD a failing test first for logic bugs).
5. **VERIFY yourself — don't trust green checks.** `lint`, `tsc`, `npm test`, `build`. e2e via the build+serve path. Then drive the browser (Playwright MCP) across **4 themes + mobile + (real-runner) reduced motion** and **Read the screenshots**. Assume a hidden defect until the browser proves otherwise — **real bugs in this program have only surfaced in the visual pass** (empty carets at snap boundaries, near-invisible dark keycaps, a mobile tour step pointing at a `display:none` element). Hunt for them.
6. **Hunt + raise quality.** Actively look for bugs, edge cases, regressions, a11y gaps, CLS/jank, cross-theme/breakpoint inconsistency, broken links, perf-budget violations, and **missed essential functionality**. Add missing essentials; make professional revisions to an industrial standard.
7. **Document + report.** Update the relevant `docs/v2/*.md` + `ROADMAP-V2.5-SIGNATURE.md` + the `portfolio-v2.5-signature` memory snapshot. Report per-sub-wave: summary + commit SHAs, real gate results, screenshots reviewed, deviations, self-review, confirmation nothing pushed (unless asked) / no v1 changed / no P15 assets deleted. **Pause for the user** between sub-waves.

## 8. Known follow-ups already logged (fold into P21)

- `AnimationToggle` (`components/layout/animation-toggle.tsx`) uses a **36px target** — under the 44px rule; bump to ≥44px.
- **Reduced-motion visual confirmation** for P20a/P20b (and ideally the whole site) via the real e2e runner with `emulateMedia`.
- Verify **P18 imagery wiring** (project covers / OG) is complete; finish if the user provides assets via `docs/v2/ASSET-PROMPTS.md`.
- Confirm **`vercel.json` CSP** `connect-src` allows the status widget's `https://api.github.com` and the contact form's `https://api.web3forms.com` (web3forms is already listed; verify GitHub is too).

**Start:** confirm branch + green baseline (build+serve path); read the context docs + the P20 handoff for rules/workflow; then `brainstorming` to agree the P21 scope/sequencing with the user → spec → `writing-plans` → implement (Sonnet subagents) → two-stage read-only review → verify (gates + Playwright MCP, 4 themes + mobile + real-runner RM, Read screenshots) → hunt/fix/raise-quality → document → report → **pause for the user**. Work autonomously within a sub-wave; report only finished, verified results — no broken hand-offs.
