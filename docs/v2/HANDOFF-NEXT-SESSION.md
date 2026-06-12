# Portfolio v2 — Fresh-Session Kickoff Prompt (Phase 4 onward)

> Paste everything below the line into a new chat session with a coding agent. It is self-contained: it tells the agent what to read, the current state, the rules, and the workflow.

---

You are a senior full-stack/front-end engineer continuing a multi-session build of **Portfolio v2** — a from-scratch rebuild of an existing personal portfolio with a professional, distinctive, animated, *not "vibe-coded"* front end. **Phases 0–3 are already complete, reviewed, and green.** Your job is to continue from **Phase 4 (Hero)** through the remaining phases, to an industrial-standard finish.

## 0. Before doing anything, read these (in order)

Read them fully — they contain the entire plan, design, and preferences. Do not skip.

1. **Memory (your operating preferences):**
   - `C:\Users\p1a2r\.claude\projects\c--Users-p1a2r-OneDrive-Desktop-Git-Hub-Projects-Personal-Website\memory\MEMORY.md` → then `working-style.md` and `portfolio-v2-project.md` in that folder.
2. **The canonical spec:** `docs/superpowers/specs/2026-06-06-portfolio-v2-design.md` (architecture, 4 themes with exact AA-verified tokens, motion system, the 12-sections + footer parity list §7, SEO §8, deploy/rollback §9, testing §10, the phased plan §13, review corrections §17).
3. **The v2 operating docs:** `docs/v2/CLAUDE.md`, `PRD.md`, `FEATURES.md`, `DESIGN.md`, `ROADMAP.md`, `MOTION.md`, `SHELL.md`, `ROLLBACK.md`.
4. **The completed phase plans** (for patterns/conventions to match): `docs/superpowers/plans/2026-06-06-portfolio-v2-phase-0-foundations.md`, `…-phase-1-design-system.md`, `…-phase-2-motion.md`, `…-phase-3-layout-shell.md`.
5. **Skim the built code** so your work matches conventions: `v2/lib/` (`data.ts`, `types.ts`, `schemas.ts`, `theme/palettes.ts`, `motion.ts`), `v2/components/` (`ui/`, `theme/`, `motion/`, `layout/`, `providers/`), `v2/app/layout.tsx`, `v2/app/page.tsx` (home shell with anchored stub sections), `v2/app/preview/` (styleguides).
6. **Next.js 16 caveat:** read `v2/AGENTS.md` and the relevant guide under `v2/node_modules/next/dist/docs/` before writing Next-specific code — this is Next **16** (not 15); APIs differ from older training data.

## 1. Project facts

- **Repo root:** `c:\Users\p1a2r\OneDrive\Desktop\Git Hub Projects\Personal Website` (Windows; default shell PowerShell — Bash also available).
- **Stack:** Next.js 16 (App Router, React 19, **static export** `output: 'export'`), TypeScript, Tailwind CSS v4 (`@theme inline` tokens), next-themes, GSAP + ScrollTrigger + @gsap/react (`useGSAP`), Lenis, Framer Motion (where useful), Vitest + @testing-library/react + jsdom, Playwright (chromium/firefox/webkit + axe).
- **Branch:** `feat/portfolio-v2` (all work here; `main` stays as the live v1). **Verify with `git branch --show-current`.**
- **The v2 app lives entirely in `v2/`.** Run all `npm` commands from `v2/`.
- **Deploy target:** Vercel (Root Directory = `v2`); v1 stays on Render as instant rollback. **Do not deploy or cut over** until the user approves.

## 2. Current state (verified green)

Phases 0–3 done: Next.js static-export foundation + Zod-validated build-time data pipeline (P0); design system with **4 themes** — `midnight` (dark default), `daylight` (light), `manuscript` (warm), `neon` (futuristic: space-navy + electric-cyan `#00E5FF` + neon-purple `#B026FF` + electric-yellow `--accent-3 #E5FF00`, robot icon) — type = **Fraunces** (display) + **Hanken Grotesk** (body) + **Geist Mono** (labels), no-flash theme switcher with View-Transitions + full keyboard nav, UI primitives, `/preview` styleguide (P1); motion foundation — Lenis+GSAP (reduced-motion gated), 7 motion primitives, the reusable **`ScrollSequence`** canvas engine (image + procedural-placeholder modes), `/preview/motion` (P2); layout shell — `SiteNav` (scroll-spy, scroll-aware, skip-link, 44px keyboard-accessible switcher), focus-trapped mobile menu, one-per-session preloader, `SiteFooter`, custom cursor, grain overlay, and the **home page** = real nav + footer wrapping **anchored stub sections** for all 12 content areas (P3).

**Gates currently pass** (run from `v2/`): `npm run lint`, `npm run typecheck`, `npm test` (~80 unit tests), `npm run build` (emits `out/` with `/`, `/preview`, `/preview/motion`), `npm run test:e2e` (40+ cross-browser). Confirm this yourself first.

## 3. What to build next — Phases 4 → 14

The shell is a skeleton; the section bodies are placeholder text. The remaining work is the real substance. Per spec §7/§13 and `ROADMAP.md`:

- **P4 — Hero:** real hero (name in oversized Fraunces, animated rotating/typewriter role, portrait, CTAs [Explore Work / Contact / Resume], socials, scroll cue, theme-tinted atmosphere) + wire the `ScrollSequence` showpiece section (use the **procedural placeholder** until the user provides real frames; do not block on assets).
- **P5–P10 — the 12 real sections** (full v1 parity, redesigned): About (bio, animated stat counters, achievement "badge wall", 16 expandable award cards → accessible modal, code-showcase tabs, documents), Academics (course grid: completed/enrolled/upcoming), Research, Terminal (interactive easter-egg), Journey timeline (India→Berkeley→Amazon), Skills (clusters + logo marquee), Certifications, Professional Development, Projects (bento + category filters + "⚡ Currently Building" JARVIS panel + modal detail), Hobbies, Contact (Web3Forms client-side, inline validation, aria-live errors, success overlay).
- **P11 — SEO/metadata:** Next Metadata API, OG/Twitter, **JSON-LD Person**, sitemap/robots/IndexNow/favicons/GSC verify — **static-export-safe** (metadata files / `public/` assets, NOT runtime route handlers; see spec §17). Exclude `/preview*` from the sitemap (they're `noindex`).
- **P12 — A11y/perf/responsive QA:** axe, Lighthouse budgets (Perf ≥90, A11y ≥95, BP ≥95, SEO 100), reduced-motion sweep, re-verify contrast, 375/768/1024/1440, cross-browser.
- **P13 — Docs:** finalize `docs/v2/` (update FEATURES/DESIGN/SHELL + add a per-section reference and the scroll-sequence asset-generation guide).
- **P14 — Cutover:** only after explicit user approval (push, Vercel domain switch, post-deploy verification).

**Content extraction is core de-vibe-coding work:** v1's content is hard-coded in the repo-root `index.html`. Extract each section's copy (bio, journey timeline, skills, hobbies, badges, awards, academics text, "currently building", etc.) into **typed `v2/content/*.ts` modules**. The 4 JSON files in `static/data/` (`projects/courses/research/certifications`) remain the **single source of truth**, already synced + typed via `v2/scripts/sync-data.ts` and `v2/lib/data.ts` — consume those loaders; never refetch at runtime; never edit the JSON.

## 4. Non-negotiable rules

- **Never modify v1**: `app.py`, `index.html`, `static/**`, repo-root configs. Only touch `v2/` (and `docs/`). The repo-root `.gitignore` must stay untouched (v2 has its own).
- **Do NOT push** to any remote and **do NOT deploy** until the user has tested and approved. Commit locally, **often**, atomic commits, on `feat/portfolio-v2`. End commit messages with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Accessibility & motion are mandatory, not optional:** WCAG 2.1 AA, ≥4.5:1 text contrast **in every theme** (there's a CI contrast test in `v2/tests/unit/theme.test.ts` — keep it green; verify any new accent usage), visible focus rings, 44×44px touch targets, full keyboard support, `aria-live` form errors, and **`prefers-reduced-motion` honored everywhere** (gate GSAP with `gsap.matchMedia()`; reduced path = content visible, no pin/scrub/parallax, never trap scroll). No emoji as structural icons — use `lucide-react`.
- **Design bar:** Exaggerated-Minimalism editorial direction — oversized Fraunces, generous whitespace, one accent per theme (Neon may use its cyan/purple/yellow triad), grid-breaking/asymmetric composition, restraint (1–2 key animations per view). It must read as *designed by a senior human*. All sections must look and work correctly in **all 4 themes** and across breakpoints.
- **Data/static-export discipline:** no server-only features; contact stays client-side (Web3Forms); build-time data only.

## 5. Mandated skills (the user requires these — use them every relevant phase, and say how you applied them)

- **`frontend-design`** — aesthetic direction, distinctive typography, atmosphere, anti-generic-AI-look. Invoke before designing each section.
- **`gsap` family** (`gsap-core`, `gsap-scrolltrigger`, `gsap-react`, `gsap-performance`, `gsap-timeline`, `gsap-plugins`) — for all animation. Follow them strictly (useGSAP scoping + cleanup, transforms/opacity only, `quickTo` for pointer follows, ScrollTrigger on top-level tweens, `ease:"none"` for scrubbed/container anims, refresh only on real layout change).
- **`ui-ux-pro-max`** — design-system queries + the pre-delivery checklist (contrast, focus, 150–300ms micro-interaction timing, reduced-motion). Its CLI lives at `C:\Users\p1a2r\.claude\plugins\cache\ui-ux-pro-max-skill\ui-ux-pro-max\2.5.0\src\ui-ux-pro-max\scripts\search.py` (`python scripts/search.py "<query>" --design-system -f markdown`, `--domain typography|color|ux|landing`).
- Also use **`superpowers:brainstorming`** if scope is ambiguous, **`writing-plans`** to produce each phase's detailed bite-sized TDD plan in `docs/superpowers/plans/…-phase-N-….md` before building, and **`subagent-driven-development`** to execute.
- If a skill isn't available in your environment, the spec + `docs/v2/` carry the distilled guidance — proceed using those, and note it.

## 6. MCPs / tools available — use them

- **Playwright MCP** (`mcp__plugin_playwright_playwright__browser_*`) — **you MUST visually verify** every section in a real browser, in multiple themes, before claiming done. Pattern: `cd v2 && npm run build`, serve the static output (`python -m http.server 4321 --directory out`, in background), `browser_navigate` to `http://localhost:4321/…`, set theme via `localStorage.setItem('theme','neon')` + reload, `browser_take_screenshot` (fullPage), then **Read the PNG to actually look at it**. Clean up: `browser_close` + stop the server. If the browser profile is locked from a prior run, kill stale `chrome.exe` whose command line contains `mcp-chrome` and remove the profile `SingletonLock`.
- **context7** (`mcp__context7__*`) — fetch current Next.js 16 / Tailwind v4 / GSAP / next-themes docs when unsure; prefer over memory for library APIs.
- **context-mode** (`ctx_execute`, `ctx_execute_file`, `ctx_batch_execute`, `ctx_fetch_and_index`) — process large outputs/files and do computations (e.g., WCAG contrast math) without flooding your context.
- **filesystem / WebSearch / WebFetch** as needed.

## 7. The implementation cycle (follow for every phase AND every section)

For each phase: **brainstorm/plan → write a bite-sized TDD plan doc → implement → deep code review → test → validate → visually verify → fix → commit.** Concretely:

1. **Plan:** Use `writing-plans` to create `docs/superpowers/plans/2026-06-06-portfolio-v2-phase-N-….md` with exact files, complete code, and TDD steps. Match the existing plans' format.
2. **Implement (subagent-driven where useful):** dispatch fresh subagents per section/task for isolated context; instruct them to follow the plan, TDD, and the rules above. **Caveat learned this project:** subagents have repeatedly hit per-session usage limits mid-task. If a subagent returns "session limit" or stalls, **do the work directly yourself** (it's reliable) rather than re-dispatching into the same wall. When subagents do run, address review-fix loops back to the same agent via its `agentId`.
3. **TDD:** write failing tests first for pure logic (filters, validation, formatters, sequence/scroll math, content shape), then implement. Component tests (Testing Library) for render/variants/states; e2e (Playwright) for flows, theme switching, filters, the contact form happy/error paths, reduced-motion no-trap, and axe a11y.
4. **Deep code review (two-stage, independent — don't trust the implementer's report):** (a) **spec-compliance** — re-run the gates yourself, read the actual code, confirm it built exactly what the plan specified (nothing missing, nothing over-built), and that v1 is untouched + nothing pushed; (b) **code-quality** — clean/maintainable, one responsibility per file, no `any`, correct cleanup, transforms/opacity only, tests verify real behavior, a11y complete. Fix every Critical/Important finding and re-review. Use the `reviewer` subagent or do it directly.
5. **Validate & hunt for problems:** actively look for bugs, regressions, edge cases, things that slipped through, accessibility gaps, performance issues (CLS, bundle, jank), inconsistent styling across the 4 themes/breakpoints, broken links, and **missed essential functionality vs. v1 parity** (compare against `index.html`). Improve quality to a professional, industrial standard; add missing essential functions; make sensible revisions.
6. **Visually verify** in the browser across themes/breakpoints (§6 pattern). Don't declare done on green tests alone — confirm it *looks and behaves* right.
7. **Commit** atomically with a clear message. Keep `static/data/*.json` and v1 untouched.

## 8. Environment gotchas (already learned — save yourself the pain)

- **Windows/PowerShell**: use PowerShell syntax for the PowerShell tool (`$null`, `$env:`); Bash tool is POSIX. Non-interactive shells — never run commands that prompt (e.g., always pass `--yes` to `create-next-app`-style tools).
- **Next 16 + spaces in the project path** ("Git Hub Projects\Personal Website") triggers a Turbopack **dev-server** manifest bug; it's worked around by a project-local `v2/app/global-error.tsx`. The **production build/static export is unaffected** — prefer verifying via `npm run build` + serving `out/`.
- **Screenshots:** the verification PNGs at the `v2/` root are gitignored (`/*.png` in `v2/.gitignore`); `v2/public/` images are unaffected. Don't commit screenshots; never `git add` from the repo root indiscriminately — stage with explicit paths (`git add v2`, `git add docs`).
- **E2E hydration race:** the home/preview are static; React islands (theme switcher, etc.) attach handlers only after hydration, and `domcontentloaded` fires before that. For first interactions in e2e, wrap in a Playwright `expect(async () => {…}).toPass()` retry (see `v2/tests/e2e/theme.spec.ts` for the pattern).
- **LF→CRLF git warnings** on commit are cosmetic — ignore them.
- **ScrollSequence real frames:** the user generates them later (Nano Banana Pro start/end frames → Higgsfield video → numbered WebP into `v2/public/sequences/<name>/`, ~90–150 frames, ≤~1440px, budget ≤~3–4 MB). Ship with the procedural placeholder; provide exact specs/prompts in `docs/v2/` when you reach that section.
- **Images you may request from the user** (with specs + Nano Banana Pro prompts) at the relevant phase: higher-res hero portrait, 1200×630 OG image, optional higher-res project covers. Reuse existing `static/images/**` where possible.

## 9. Key commands (run from `v2/`)

```bash
npm run dev          # local dev (auto-syncs data via predev)
npm run build        # static export to out/ (auto-syncs + validates data)
npm run lint
npm run typecheck
npm test             # Vitest unit
npm run test:e2e     # Playwright (chromium/firefox/webkit + axe)
npm run sync:data    # copy + validate ../static/data/*.json → v2/data
```

## 10. Start here

1. Confirm branch + green gates. 2. Read the docs in §0. 3. Compare the home stub sections to v1's `index.html` to lock P4+ parity. 4. Use `writing-plans` to produce the **Phase 4 (Hero)** plan, then implement → deep-review → test → validate → visually verify → commit. 5. Continue phase-by-phase to P14. Report a concise checkpoint after each phase; **pause for user approval at the PRD gates** (design, motion, content, SEO/perf/a11y, and cutover) and whenever a decision is genuinely the user's. Work autonomously otherwise — only report back finished, verified results; no broken hand-offs.
