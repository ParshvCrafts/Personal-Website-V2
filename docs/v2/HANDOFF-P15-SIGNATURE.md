# Portfolio v2.5 "Signature" — Fresh-Session Kickoff (P15+: Cinematic Pipeline → onward)

> Paste everything below the line into a new chat with a coding agent. Self-contained: what to read, the verified current state, the rules, the workflow, the gotchas, and the two open decisions. **P15 needs the Higgsfield MCP — make sure it's connected first (see §0).**

---

You are a senior full-stack engineer + design-quality specialist continuing a multi-session, in-progress portfolio enhancement program called **"Portfolio v2.5 Signature."** The already-shipped **v2** (a Next.js 16 static-export portfolio) was taken from polished → exceptional across an approved 8-phase roadmap. **P13 (3D foundation) and P14 (scroll-driven 3D hero) are complete, reviewed, verified, and committed.** Your job is **P15 — Cinematic Asset Pipeline** (and then P16+), to an industrial, production-grade standard. **Do NOT one-shot** — build in small, planned, TDD'd, reviewed slices, and **pause for the user** between phases.

## 0. First actions (before touching code)

Repo root: `c:\Users\p1a2r\OneDrive\Desktop\Git Hub Projects\Personal Website`. App in `v2/`. OS: Windows (PowerShell default; Bash also available). A shell hook may rewrite CLI calls via "rtk" — fine. **Run all `npm` commands from `v2/`.**

1. **Confirm Higgsfield MCP is loaded.** P15 depends on it (generative cinematic clips). The user added the connector (`https://mcp.higgsfield.ai/mcp`) but in the prior session its tools were NOT visible. Verify tools like `mcp__...higgsfield...` are available; if not, tell the user to `/mcp` reconnect or restart, then proceed. **Do not fake or skip Higgsfield** — research its capabilities (image-to-video, 50+ models incl. Sora 2/Kling/Veo, 70+ camera moves, character consistency) and use it for the cinematic frames + animated portrait.
2. **Read the memory** (operating preferences): `C:\Users\p1a2r\.claude\projects\c--Users-p1a2r-OneDrive-Desktop-Git-Hub-Projects-Personal-Website\memory\MEMORY.md`, then each file it indexes — especially `portfolio-v2.5-signature.md` (program state, gotchas, the stash anomaly), `working-style.md`, `portfolio-v2-project.md`, `reviewer-subagents-readonly.md`, `v2-e2e-flake-patterns.md`.
3. **Read the program roadmap:** `docs/v2/ROADMAP-V2.5-SIGNATURE.md` (8 phases, tooling decisions, hard constraints).
4. **Read the P15 spec area:** the P15 row in the roadmap + the cinematic-pipeline decisions there and in `portfolio-v2.5-signature.md`. (P15 has no detailed spec yet — you will brainstorm/spec it, see §3.)
5. **Read the rig you'll build on:** `docs/v2/FOUNDATION-3D.md` (the P13 `SceneSlot`/Canvas/scroll-bridge contract), `docs/v2/HERO-3D.md` (P14 hero variants), and the existing `ScrollSequence` engine `v2/components/motion/scroll-sequence.tsx` (image + procedural canvas frame-scrub engine — P16 feeds real frames into this; the API: `framePath`, `frameExt`, `frameCount`, `pad`, `textBeats`, `pinLength`, `alt`).
6. **Skim built code you'll reuse:** `v2/lib/motion.ts`, `v2/components/providers/smooth-scroll.tsx` (Lenis), `v2/lib/webgl/*`, `v2/components/three/*`, `v2/components/sections/hero.tsx`, `v2/app/page.tsx`, `v2/app/layout.tsx`, `v2/next.config.ts`.
7. **Next 16 caveat:** read `v2/AGENTS.md`; this is Next **16.2.7** (App Router, React 19.2.4, `output:'export'`) — APIs differ from older training data. When unsure, read `v2/node_modules/next/dist/docs/` or use the **context7** MCP for current docs.
8. **Confirm state yourself:** `git branch --show-current` must be `feat/portfolio-v2`; run the baseline gates (§7) and confirm green before planning.

## 1. Project facts

- **Stack:** Next 16.2.7 (App Router, React 19.2.4, static export `output:'export'`, `trailingSlash:true`, `images:{unoptimized:true}`, turbopack root pinned), TypeScript, Tailwind v4 (`@theme` CSS-var tokens), next-themes (4 themes: midnight/daylight/manuscript/neon), GSAP+ScrollTrigger+`@gsap/react`+Lenis, **three 0.184 + @react-three/fiber 9.6.1 + @react-three/drei 10.7.7 + @react-three/postprocessing 3.0.4**, Vitest (jsdom, `tests/unit/**`), Playwright (chromium/firefox/webkit + `@axe-core/playwright`, `tests/e2e/**`).
- **Branch `feat/portfolio-v2`. Do NOT push or deploy** until the user approves cutover. v1 stays live on Render; v2 deploys to Vercel later.
- **4 JSON files** in repo-root `static/data/` are the single source of truth (synced into `v2/data/` at build via `scripts/sync-data.ts`). Never edit the JSON to change content meaning at runtime.

## 2. Current verified state (P0–P14 done, green)

- **P0–P12:** all 9 content sections, deep motion library, SEO/perf/a11y all green (see git history + `docs/v2/`).
- **P13 (3D foundation):** `SceneSlot` is the single gateway for ALL 3D — below `minTier` / reduced-motion / no-WebGL2 / Save-Data it renders a non-3D `fallback`, never a Canvas. `lib/webgl/{capabilities,scroll-store}.ts` (pure, tested), `components/three/{use-gpu-tier,scene-slot,lazy-mount,adaptive-canvas,use-scroll-bridge,use-pointer,proof-scene,proof-scene-mount}`. `three` is code-split OFF the home initial JS (dynamic `ssr:false` + IntersectionObserver lazy mount). Throwaway proof scene on `/preview`.
- **P14 (3D hero):** two theme-aware scenes behind `SceneSlot`, switchable live via `?hero=restrained|bold|off`; default `HERO_3D_DEFAULT` in `lib/site.ts`. `components/three/hero/{editorial-scene,constellation-scene,hero-scene-mount}.tsx`, `lib/hero/hero-variant.ts`, `use-hero-variant.ts`.
- **Gates green:** `npm run lint`, `npm run typecheck`, `npm test` (178 unit), `npm run build` (static export), `npm run test:e2e` (cross-browser + axe; known dev-server-contention flake — re-run lone failures in isolation).

## 3. What to build — P15 (Cinematic Asset Pipeline)

**Goal:** Higgsfield (generative cinematics) → Remotion (deterministic compositor) → a version-controlled, numbered frame sequence (+ typographic/data overlays) that the existing `ScrollSequence` engine scrubs, plus a real OG/preview video. This phase produces the *assets + pipeline*; **P16** wires the frames into the pinned scroll-scrub showpiece section (replacing the current placeholder).

Before coding, **brainstorm + spec P15** (`superpowers:brainstorming` → `writing-plans`): decide the cinematic concept (subject/story — e.g. an abstract "data → intelligence" sequence on-brand for Data Science/AI; the user's favorite centerpiece is this scroll-scrubbed cinematic), the Higgsfield generation plan (prompts, camera moves, model, frame count ~90–150, resolution, aspect), the Remotion compose/export plan (overlays, deterministic numbering `frame_0001.webp…`, compression target), where frames live (`v2/public/sequences/<name>/`), and the a11y `alt`/reduced-motion story. Research Remotion via the `remotion-best-practices` skill; confirm whether it's the right compositor or if Higgsfield output can feed `ScrollSequence` directly. Get the user's approval on the spec before implementing.

Key constraints for the assets: keep total sequence weight reasonable (compress hard — prior P12 got `public/images` 7.4MB→0.9MB); CLS-safe; the engine decodes all frames before enabling scrub, so balance frame count vs weight; reduced motion shows a static first frame + all text beats (the engine already does this).

## 4. Non-negotiable rules

- **Never modify v1**: repo-root `app.py`, `index.html`, `static/**`, root configs. Only `v2/**` and `docs/**`.
- **Do NOT push / deploy.** Commit locally, **atomic commits**, one per task, conventional-commit messages matching history, each ending with the trailer:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  Stage explicit paths (`git add v2/...`), never `git add -A` from repo root (gitignored artifacts + a stray `nul` there).
- **A11y + motion mandatory:** WCAG 2.1 AA, ≥4.5:1 text contrast **in every one of the 4 themes**; single `<h1>`; visible focus; ≥44×44px targets; full keyboard; **`prefers-reduced-motion` honored everywhere** (gate GSAP with `matchMedia`; reduced path = content visible/static, never pin/trap scroll). All decorative 3D/video is `aria-hidden` with content parity in sibling DOM.
- **Design bar:** editorial Exaggerated-Minimalism — Fraunces display, Hanken body, Geist Mono labels, one accent per theme, restraint (1–2 motion ideas per view). No hardcoded hex in shipped components (use theme tokens/palette). Plain CLS-safe `<img>`, not `next/image`.
- **Static-export discipline:** no server-only features; build-time data only.

## 5. Mandated skills (the user REQUIRES these every relevant phase — state how you applied each)

- **Process:** `superpowers:brainstorming` (before any creative/feature work — HARD gate: design + user approval before implementing), `writing-plans` (detailed TDD plan with complete code + atomic commits), `subagent-driven-development` (execute via fresh-context subagents), `test-driven-development` (failing test first for pure logic), `systematic-debugging` (root-cause before fixes), `requesting/receiving-code-review` + `verification-before-completion` (evidence before claiming done).
- **Frontend/animation:** `frontend-design`, the `gsap-*` family (`gsap-core/timeline/scrolltrigger/react/performance`), `ui-ux-pro-max`. **Consult them on every UI/motion change** — the user mandates it.
- **Video:** `remotion-best-practices` (compositor/render). Plus the **Higgsfield MCP** for generative clips.

## 6. MCPs / tools — use them

- **Higgsfield MCP** — generative cinematic clips + animated portrait (P15/P16/P18). Research its tool surface first.
- **Playwright MCP** (`mcp__plugin_playwright_playwright__browser_*`) — **MUST** visually verify every new visual surface before claiming done. Pattern: `npm run build`, serve `out/` (`python -m http.server 4321 --directory out` backgrounded from `v2/`), `browser_navigate`, set theme via `browser_evaluate(() => { localStorage.setItem('theme','neon'); location.reload(); })`, screenshot (jpeg), **then Read the image to actually look at it**. Screenshot **all 4 themes + mobile (390px)** + a reduced-motion context. Clean up screenshots (don't commit), stop the server, close the browser when done.
- **context7** — current Next 16 / Tailwind v4 / GSAP / R3F / Remotion docs; prefer over memory for library APIs.
- **context-mode + rtk** (installed) — process large outputs/files without flooding context.

## 7. The implementation cycle you MUST follow (per phase)

1. **Brainstorm → spec** (`brainstorming`): explore intent, propose approaches, get user approval, write `docs/superpowers/specs/YYYY-MM-DD-...-design.md`, commit.
2. **Plan** (`writing-plans`): bite-sized TDD tasks with **complete code (no placeholders)** + atomic-commit messages; self-review against the spec; commit the plan.
3. **Implement** (`subagent-driven-development`): dispatch fresh-context implementer subagent(s). **⚠️ After ANY subagent runs, audit with `git log/diff <base>..HEAD` — trust the diff, not the self-report.** (In this program a `general-purpose` implementer went rogue and committed an out-of-scope, misleadingly-labeled change + an unrequested doc — both were reverted.)
4. **Two-stage unbiased review:** dispatch fresh **read-only `reviewer`** agents (tools Read/Grep/Glob only — so they can't exceed mandate) on the git range: Stage 1 spec/a11y/design; Stage 2 code-quality/bugs/Next-16/RSC/perf. Evaluate findings critically (`receiving-code-review`), fix real ones (TDD a failing test first for logic bugs).
5. **VERIFY yourself — don't trust green checks.** Run from `v2/`: `lint`, `typecheck`, `npm test`, `build`, and the FULL `test:e2e` (all 3 browsers). Then drive the browser (Playwright MCP) across **4 themes + mobile + reduced motion** and **Read the screenshots**. Assume a hidden defect until the browser proves otherwise.
6. **Hunt for problems + raise quality.** Actively look for bugs, edge cases, regressions, a11y gaps, CLS/jank, cross-theme/breakpoint inconsistency, broken links, perf budget violations, and **missed essential functionality vs the spec/v1 parity**. Add missing essentials, make professional revisions to an industrial standard.
7. **Document** (concise `docs/v2/<PHASE>.md`) + update `ROADMAP-V2.5-SIGNATURE.md` status + the `portfolio-v2.5-signature` memory. **Report to the user** (per-task summary + commit SHAs, real gate results, screenshots reviewed, deviations, self-review, confirmation nothing pushed / no v1 changed) and **pause** before the next phase.

## 8. Environment gotchas (already paid for — heed them)

- **Reviewer subagents must be read-only** (`reviewer` type). Verify every subagent's work against `git log/diff`, not its report.
- **Run the FULL cross-browser e2e**, not chromium-only. The dev server compiles on demand → e2e flakes **under parallel load**; tests pass in isolation. Re-run a lone failure in isolation before treating it as real.
- **Headless WebKit has no WebGL2** → the rig correctly stays tier "off" there (no canvas). Gate any "a canvas mounts" e2e on an actual `getContext('webgl2')` probe (see `tests/e2e/hero-3d.spec.ts`).
- **jsdom has no WebGL** — never import `@react-three/fiber`/`drei` components into Vitest unit tests; unit-test only pure logic + mocked components.
- **Canvas height:** a child `<Canvas>` using `h-full` needs every ancestor to carry height; `LazyMount` sets `h-full w-full` for this. If you add a 3D layer and it renders in a thin strip, check the height chain.
- **React 19 hooks lint** (`react-hooks/set-state-in-effect`, `react-hooks/refs`) is strict: don't write refs during render (use lazy `useState` init); wrap effect setState in a named function; side effects (e.g. `registerGsap()`) go inside the effect, not the render body.
- **Playwright MCP chrome can get a stuck profile lock** ("Browser is already in use… mcp-chrome-…"). Kill only the offending process: PowerShell `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -match 'ms-playwright-mcp' } | Stop-Process -Force`.
- **Next 16 + spaces in path** triggers a Turbopack dev-server manifest bug; the production build/static export is unaffected — verify via `npm run build` + serving `out/`.
- **LF→CRLF** git warnings are cosmetic. Verification screenshots at `v2/` root are gitignored; don't commit them.

## 9. Two OPEN decisions to resolve with the user FIRST

1. **Hero variant pick (P14 leftover).** The default is `HERO_3D_DEFAULT="restrained"` in `lib/site.ts`. The user is choosing between `/?hero=restrained` (Editorial — distorted accent icosahedron behind the portrait, safe/refined) and `/?hero=bold` (Constellation — neural node-field + bloom, more memorable) and `/?hero=off`. **Ask which to set as the default**, then set the constant + commit.
2. **Stashed tree anomaly.** During P14, an external actor deleted two committed P14 test files (restored from HEAD) and added coherent-but-incomplete edits to `v2/content/hobbies.ts` (`accentHue` + a "food-travel" hobby — breaks typecheck because `SecondaryHobby` lacks `accentHue`), `journey`, `rotating-text` (blink cursor), `fun-facts-ticker`. These were **stashed** (`git stash list` → `stash@{0}: "WIP: unexpected non-P14 tree mutations…"`). **Ask the user whether these are theirs/another session's** before applying (and finishing — e.g. add `accentHue` to the type) or dropping the stash.

## 10. Remaining roadmap after P15

P16 cinematic showpiece (wire frames into the pinned `ScrollSequence` section) · P17 micro-interaction & transition polish (cursor, button/card states, easing tokens, View-Transitions, loading) · P18 real imagery & graphic design (Higgsfield-animated portrait, project covers, textures, OG) · P19 advanced features (pick 2–3 non-distracting: ⌘K palette, live widget, easter egg, tour) · P20 cross-cutting QA + docs. Each gets its own brainstorm→spec→plan→implement→review→verify→pause cycle.

**Start:** confirm Higgsfield is connected (§0.1) and branch + green baseline (§0.8); resolve the two open decisions (§9); then `brainstorming` → spec P15 → `writing-plans` → implement → review → verify (gates + Playwright MCP, 4 themes + mobile + RM) → hunt/fix → document → report → **pause for the user**. Work autonomously otherwise; report only finished, verified results — no broken hand-offs.
