# Portfolio v2.5 "Signature" — Fresh-Session Kickoff (P20: Advanced Features → onward)

> Paste everything below the line into a new chat with a coding agent. Self-contained: what to read, the verified current state, the one pending micro-task, the rules, the workflow, the gotchas, and the open decisions.

---

You are a senior full-stack engineer + design-quality specialist continuing a multi-session, in-progress portfolio enhancement program called **"Portfolio v2.5 Signature."** The shipped **v2** (a Next.js 16 static-export portfolio) is being taken from polished → exceptional across an approved roadmap. **P13–P19 are complete, reviewed, verified, and committed.** Your job is **P20 — New Advanced Features** (and a tiny pending P19 wrap-up first), to an industrial, production-grade standard. **Do NOT one-shot** — build in small, planned, TDD'd, reviewed slices, and **pause for the user** between phases.

## 0. First actions (before touching code)

1. **Repo:** standalone repo `Personal Website V2` (`github.com/ParshvCrafts/Personal-Website-V2`), branch **`main`**. App is at the **repo root** (no `v2/` subfolder). OS: **Windows** (PowerShell default; Bash also available). A shell hook rewrites some CLI calls via "rtk" — fine, but note it sometimes swallows command stdout (e.g. eslint/playwright detail); when you need raw output, write to a repo-local file or parse the rtk summary. **Run all `npm` commands from the repo root. Do NOT push or deploy** until the user approves cutover.
2. **Read the operating context (portable memory snapshot, in-repo):** `docs/context/` — `working-style.md`, `portfolio-v2-project.md`, `portfolio-v2.5-signature.md` (program state, every phase's gotchas — READ THIS FULLY), `reviewer-subagents-readonly.md`, `v2-e2e-flake-patterns.md`, `docs/context/README.md`.
3. **Read the roadmap:** `docs/v2/ROADMAP-V2.5-SIGNATURE.md` (note the 2026-06-13 reshuffle: P18 imagery deferred, P19 = scroll rethink (done), **P20 = advanced features**, P21 = QA).
4. **Read recent phase docs:** `docs/v2/SHOWPIECE-VARIANTS.md`, `docs/v2/INTERACTION-POLISH.md`, `docs/v2/HERO-3D.md`, `docs/v2/FOUNDATION-3D.md`, `docs/v2/CINEMATIC-PIPELINE.md`.
5. **Confirm state yourself:** `git branch --show-current` = `main`; run the baseline gates (§7) and confirm green (note the dev-server gotcha in §8 — verify via build + serve `out/`, not `npm run dev`).
6. **Next 16 caveat:** read `AGENTS.md`; this is Next **16.2.7** (App Router, React 19.2.4, `output:'export'`). APIs differ from older training data — when unsure, read `node_modules/next/dist/docs/` or use **context7** MCP.

## 0a. ⚠️ FIRST, finish the P19 wrap-up the previous session was interrupted mid-task

The user picked **Keystroke** as the default scroll-showpiece variant; the previous session was interrupted before applying it. Do this as task one (TDD-light, then commit):

1. In `components/sections/showpiece/use-showpiece-variant.ts`, change `const SHOWPIECE_DEFAULT: ShowpieceVariant = "cinematic"` → `"keystroke"`.
2. This changes what `/` (no `?show=`) renders. **Fix the two e2e tests** in the first `test.describe("cinematic showpiece", …)` block of `tests/e2e/showpiece.spec.ts` that navigate to `/` and assert the cinematic `canvas[role="img"]` — change those `page.goto("/")` calls to `page.goto("/?show=cinematic")` so they stay valid. (The variant-block tests already pin `?show=` explicitly.)
3. Verify: build + serve `out/` + browser-check that `/` now shows the Keystroke variant in all 4 themes + reduced motion (per §6). Then commit (conventional message + trailer per §4).

## 1. Project facts

- **Stack:** Next 16.2.7 (App Router, React 19.2.4, static export `output:'export'`, `trailingSlash:true`, `images:{unoptimized:true}`, turbopack root pinned), TypeScript, Tailwind v4 (`@theme` CSS-var tokens), next-themes (4 themes: midnight/daylight/manuscript/neon), GSAP+ScrollTrigger+`@gsap/react`+Lenis, three 0.184 + @react-three/fiber 9.6.1 + drei 10.7.7 + postprocessing 3.0.4, Vitest (jsdom, `tests/unit/**`), Playwright (chromium/firefox/webkit + `@axe-core/playwright`, `tests/e2e/**`).
- **4 JSON files** in repo-root `static/data/` are the single source of truth (synced into `data/` at build via `scripts/sync-data.ts`). Never edit JSON to change content meaning at runtime.

## 2. Current verified state (P0–P19 done, green)

- **P0–P12:** all 9 content sections, deep motion library, SEO/perf/a11y green.
- **P13:** R3F rig — `SceneSlot` is the single gateway for ALL 3D (below `minTier`/RM/no-WebGL2/Save-Data → non-3D `fallback`, never a Canvas); `three` code-split off the home initial JS. `components/three/*`, `lib/webgl/*`.
- **P14:** scroll-driven 3D hero variants (editorial/constellation) — retained behind `?hero=`.
- **P15:** Cinematic asset pipeline — "Signal" ink film. `scripts/cinematic/*` (ffmpeg-static + sharp), frames at `public/sequences/intelligence/{dark,light}/frame_0001..0120.webp`, recipe `assets/cinematic/prompts.md` (masters gitignored), Remotion preview `public/preview.mp4` (isolated `video/` package). **Do NOT delete these assets.**
- **P16:** showpiece plays Signal frames via per-theme grade (`lib/sequence-grade.ts`).
- **P17:** **Inkfield** hero (custom-GLSL particle field, cursor vortex + scroll chaos→lattice; **default `HERO_3D_DEFAULT="ink"`**), state-aware cursor (`lib/cursor-state.ts`), interaction tokens (`.card-lift`/`.btn-sheen`/`.nav-underline`), project-modal View-Transition morph (`lib/view-transition.ts`), ink-drop preloader.
- **P18:** **DEFERRED** — user keeps the portrait photo as-is (no Veo cinemagraph). Project covers / OG available later via `docs/v2/ASSET-PROMPTS.md` (user generates via Google Pro: Veo + Nano Banana Pro; drops files in `assets/incoming/` for you to review/compress/wire). Not blocking.
- **P19:** scroll-showpiece rethink — `?show=keystroke|keyboard|cinematic` (build-both pattern). `lib/showpiece/*` (TDD). Keystroke (Apple-style snap-stepped typed chapters, pure-typographic) + Keyboard (R3F instanced keycaps typing the words + caption). **User picked Keystroke as default — apply per §0a.**
- **Gates green:** `npm run lint`, `npm run typecheck`, `npm test` (~224 unit), `npm run build` (static export). Cross-browser e2e: see §8 dev-server gotcha.

## 3. What to build — P20 (New Advanced Features)

The user wants **all four** (brainstorm scope/sequencing first — this is likely 2 sub-waves, not one mega-commit; keep quality high, don't one-shot):

1. **⌘K command palette** — keyboard-driven fuzzy nav + actions: jump to any section, switch theme, switch `?hero=`/`?show=` variants, copy email, open résumé/GitHub/LinkedIn. Full keyboard + a11y (focus trap, escape, aria), theme-tokened, reduced-motion safe. Fits the site's "keyboard" motif.
2. **Tasteful easter egg** — low-risk delight (e.g. Konami code → a special Inkfield burst, or a hidden terminal command). Discreet; never traps or annoys.
3. **Live status widget** — subtle "currently" card (e.g. local time in Berkeley, latest GitHub commit, now-playing) — must be **build-time or client-only** data (static export; no server). Pick a source that degrades gracefully offline.
4. **First-visit guided tour** — brief spotlight of key sections on first load (sessionStorage-gated, skippable, reduced-motion = instant/none). Lowest priority; can be its own wave.

**Brainstorm + spec P20 first** (`superpowers:brainstorming` → `writing-plans`): decide concept, scope split, data sources for the widget, a11y/reduced-motion story for each, and which react-bits components to adapt (e.g. a command-palette / menu pattern). Get the user's approval on the spec before implementing.

## 4. Non-negotiable rules

- **Never modify v1**: repo-root `app.py`, `index.html`, `static/**` (except `static/data/` is canonical content — don't change meaning), root configs. Work in the app at the repo root (`app/`, `components/`, `lib/`, `docs/`, `tests/`, `scripts/`).
- **Do NOT push / deploy.** Commit locally, **atomic commits**, one per task, conventional-commit messages matching history, each ending with the trailer:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  **Stage explicit paths** (`git add components/...`), NEVER `git add -A` (there's a stray `nul` at root + a parallel session's uncommitted work — see §8).
- **A11y + motion mandatory:** WCAG 2.1 AA, ≥4.5:1 text contrast **in every one of the 4 themes**; single `<h1>`; visible focus; ≥44×44px targets; full keyboard; **`prefers-reduced-motion` honored everywhere** (gate GSAP with `matchMedia`; reduced path = content visible/static, never pin/trap scroll). All decorative 3D/video is `aria-hidden` with content parity in sibling DOM.
- **Design bar:** editorial Exaggerated-Minimalism — Fraunces display, Hanken body, Geist Mono labels, one accent per theme, restraint (1–2 motion ideas per view). No hardcoded hex in shipped components (use theme tokens/`color-mix`). Plain CLS-safe `<img>`, not `next/image`.
- **Static-export discipline:** no server-only features; build-time/client-only data.

## 5. Mandated skills (the user REQUIRES these — state how you applied each)

- **Process:** `superpowers:brainstorming` (HARD gate before any feature work — design + user approval before implementing), `writing-plans` (detailed TDD plan with complete code + atomic commits), `subagent-driven-development` (execute via fresh-context subagents — use **Sonnet** for mechanical implementation tasks to save tokens; orchestrator stays on the strong model for design/review), `test-driven-development` (failing test first for pure logic), `systematic-debugging` (root-cause before fixes), `requesting/receiving-code-review` + `verification-before-completion` (evidence before claiming done).
- **Frontend/animation (user is emphatic — use on every UI/motion change):** `frontend-design`, the `gsap-*` family (`gsap-core/timeline/scrolltrigger/react/performance`), **`ui-ux-pro-max`** (run its `search.py` via the resolved path — the skill's `scripts`/`data` are symlinks; real path is `…/ui-ux-pro-max/2.5.0/src/ui-ux-pro-max/scripts/search.py`), **`react-bits`** (catalog of 130+ animated components at `~/.claude/skills/react-bits/src/ts-tailwind/`; copy + retokenize, do NOT npm-install), `react-best-practices`, `remotion-best-practices` (only if baking video).
- **Token optimization (user preference):** use the strong model for planning/thinking, **Sonnet subagents** for laborious implementation; **caveman** skill keeps output terse; **firecrawl** for web search/scrape; **context-mode + rtk** to process large files/outputs without flooding context.

## 6. MCPs / tools — use them

- **21st.dev Magic MCP** — added to `~/.claude.json` (user scope) for animation/component UI ideas. **Needs a Claude Code restart/reconnect to activate** (MCP servers load at startup). If its tools aren't visible, tell the user to reconnect. Great for the ⌘K palette UI.
- **react-bits** — local catalog (`~/.claude/skills/react-bits`; also referenced under `docs/skills/react-bits` which is NOT committed). Read source directly to adapt patterns (command palette, menus, click-spark, etc.).
- **Higgsfield CLI** — `higgsfield` 0.1.40 installed (the MCP connector returns "User not found"; the CLI works). Free plan, ~8 credits, Kling plan-gated — generate sparingly only if a phase needs it.
- **Playwright MCP** (`mcp__plugin_playwright_playwright__browser_*`) — **MUST** visually verify every new visual surface. Pattern: `npm run build`, serve `out/` (PowerShell: `Start-Process -WindowStyle Hidden python -ArgumentList "-m","http.server","4321","--directory","out"`), `browser_navigate`, set theme via `browser_evaluate(()=>{localStorage.setItem('theme','neon');location.reload();})`, screenshot (jpeg), **then Read the image to actually look at it**. Screenshot **all 4 themes + mobile (390px)** + a reduced-motion context. Clean up screenshots (`.playwright-mcp/`, gitignored — delete; don't commit), stop the server, close the browser when done.
- **context7** — current Next 16 / Tailwind v4 / GSAP / R3F / Remotion docs; prefer over memory.

## 7. The implementation cycle you MUST follow (per phase)

1. **Brainstorm → spec** (`brainstorming`): explore intent, propose approaches, get user approval, write `docs/superpowers/specs/YYYY-MM-DD-...-design.md`, commit.
2. **Plan** (`writing-plans`): bite-sized TDD tasks with **complete code (no placeholders)** + atomic-commit messages; self-review against the spec; commit the plan.
3. **Implement** (`subagent-driven-development`): dispatch fresh-context **Sonnet** implementer subagent(s) with the exact task text + file list. **⚠️ After ANY subagent runs, audit with `git log/diff <base>..HEAD` — trust the diff, not the self-report.** (Earlier in this program a general-purpose implementer went rogue; subagents also sometimes "adapt" plan code — verify constants/types against reality, e.g. `GpuTier` is only `off|low|high`.)
4. **Two-stage unbiased review:** dispatch fresh **read-only `reviewer`** agents (Read/Grep/Glob/Bash only) on the git range: Stage 1 spec/a11y/design; Stage 2 code-quality/bugs/Next-16/RSC/perf/R3F-lifecycle. Scope them to your phase's files and tell them to **ignore `docs/skills/**` and any parallel uncommitted work**. Evaluate findings critically (`receiving-code-review`), fix real ones (TDD a failing test first for logic bugs).
5. **VERIFY yourself — don't trust green checks.** Run `lint`, `typecheck`, `npm test`, `build`. For e2e use the build+serve path (§8). Then drive the browser (Playwright MCP) across **4 themes + mobile + reduced motion** and **Read the screenshots**. Assume a hidden defect until the browser proves otherwise. (Prior phases caught real bugs ONLY in the visual pass — e.g. empty caret at snap boundaries, near-invisible dark keycaps, captions washed out by frames.)
6. **Hunt for problems + raise quality.** Actively look for bugs, edge cases, regressions, a11y gaps, CLS/jank, cross-theme/breakpoint inconsistency, broken links, perf budget violations, and **missed essential functionality vs the spec**. Add missing essentials; make professional revisions to an industrial standard.
7. **Document** (concise `docs/v2/<PHASE>.md`) + update `ROADMAP-V2.5-SIGNATURE.md` status + the `portfolio-v2.5-signature` memory snapshot. **Report to the user** (per-task summary + commit SHAs, real gate results, screenshots reviewed, deviations, self-review, confirmation nothing pushed / no v1 changed / no assets deleted) and **pause** before the next phase.

## 8. Environment gotchas (already paid for — heed them)

- **Dev server is flaky here:** `npm run dev` (Turbopack) panics reading `app/globals.css` under the spaces-in-path (`…/Git Hub Projects/…`). Playwright's `webServer` uses `npm run dev`, so the full `test:e2e` often times out / fails to boot. **The production build + static export are unaffected** — verify via `npm run build` + serving `out/` + Playwright MCP. If you must run the e2e webServer, kill stale/zombie `next dev` + orphaned playwright `node` procs first (they pile up and squat port 3000) — PowerShell: `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'next dev|next-server|playwright' -and $_.CommandLine -notmatch 'claude|anthropic|rtk' } | Stop-Process -Force` then free port 3000. Never mass-kill all node (the agent runs on node).
- **A parallel agent session edits this same tree.** The user runs other agents concurrently. As of this handoff the working tree has **uncommitted, non-yours** edits: react-bits adaptations (`components/motion/click-spark.tsx`, `scroll-reveal.tsx` + test, wired into ~16 files) and copied skill repos under **`docs/skills/`** (react-bits/gsap/remotion/ui-ux-pro-max — **must NOT be committed/pushed**; the user keeps them for reference; an eslint ignore for `docs/skills/**` may be present). **Do not touch, commit, or revert the parallel work.** Always `git add` explicit paths. If `git status` shows unexpected edits, they're likely the user's parallel session — confirm before assuming an anomaly. Lint errors originating under `docs/skills/` are the vendored libraries' own and are to be ignored; verify YOUR code is clean by linting your specific files/dirs.
- **Reviewer subagents must be read-only.** Verify every subagent's work against `git log/diff`, not its report.
- **Headless WebKit has no WebGL2** → the rig stays tier "off" there (no canvas). Gate any "a canvas mounts" e2e on an actual `getContext('webgl2')` probe (see `tests/e2e/hero-3d.spec.ts` / `showpiece.spec.ts`).
- **jsdom has no WebGL** — never import `@react-three/fiber`/`drei`/`three` into Vitest unit tests; unit-test only pure logic.
- **React 19 hooks lint is strict** (`react-hooks/set-state-in-effect`, `refs`, `purity`, `immutability`): no ref writes during render (lazy `useState` init); wrap effect setState in a named function; side effects (e.g. `registerGsap()`) and three-object mutation go inside the effect / `useFrame`, not the render body.
- **Canvas height:** a child `<Canvas>` using `h-full` needs every ancestor to carry height (`LazyMount` sets `h-full w-full`). Thin-strip canvas = broken height chain.
- **Playwright MCP chrome stuck profile lock:** kill only the offending process: PowerShell `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -match 'ms-playwright-mcp' } | Stop-Process -Force`.
- **rtk wrapper** sometimes swallows command stdout detail (eslint/playwright). Parse its summary, or capture to a repo-local file you then Read.

## 9. Open decisions / state to resolve

1. **(Pending, do first — §0a)** Set Keystroke as the showpiece default + fix the two cinematic e2e tests, verify, commit.
2. **P20 scope split** — confirm with the user during brainstorming whether to ship all four features in one phase or split (recommend: palette + easter egg as P20a, widget + tour as P20b — quality over cramming).
3. **`docs/skills/` + parallel edits** — the user's, uncommitted, must not be pushed; leave them. Don't let them block your atomic commits (explicit paths).

## 10. Remaining roadmap after P20

P21 cross-cutting QA + docs (perf budgets incl. 3D, Lighthouse, 4-theme × cross-browser × mobile, a11y/reduced-motion audit, broken-link sweep, final docs). Possibly fold in the deferred P18 imagery once the user supplies assets.

**Start:** confirm branch + green baseline (§0.5, build+serve path); do the P19 default wrap-up (§0a); then `brainstorming` → spec P20 → `writing-plans` → implement (Sonnet subagents) → two-stage read-only review → verify (gates + Playwright MCP, 4 themes + mobile + RM, Read the screenshots) → hunt/fix/raise-quality → document → report → **pause for the user**. Work autonomously otherwise; report only finished, verified results — no broken hand-offs.
