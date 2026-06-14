# P20b — Live Status Widget + First-Visit Guided Tour (Design Spec)

**Date:** 2026-06-14
**Phase:** P20b (second of two P20 "Advanced Features" waves; P20a = ⌘K palette + Konami egg, done)
**Status:** Approved design → ready for implementation plan
**Stack:** Next 16.2.7 (App Router, `output:'export'`), React 19.2.4, Tailwind v4 tokens, next-themes (4 themes), GSAP + Lenis.

---

## 1. Goal

Two tasteful "advanced features", both static-export clean, WCAG 2.1 AA, reduced-motion-safe, all 4 themes, no new runtime deps:

1. **Live status widget** — a subtle footer "currently" block: availability badge + Berkeley local time + a status line + latest public GitHub activity.
2. **First-visit guided tour** — an opt-in spotlight walkthrough of ~4 key spots, started from a non-blocking first-visit prompt **or** a ⌘K palette command; never auto-hijacks the page.

## 2. Non-goals

- No now-playing/Spotify (needs server token-refresh — incompatible with strict static export).
- No new npm deps (hand-rolled; no driver.js/shepherd).
- No server/serverless. GitHub data is fetched **client-side** (unauthenticated public API) and degrades gracefully.
- No changes to v1.

## 3. Chosen approach

Hand-rolled, dependency-free: pure formatters/parsers (TDD'd) + thin client components. Tour start events ride a tiny pub-sub bus mirroring P20a's `palette-bus`/`burst`. `ui-ux-pro-max` + `react-bits` consulted during implementation for craft, not vendored.

## 4. Architecture & components

### 4.1 Config — `lib/site.ts` (extend)
Add, alongside the existing `SITE`/`SOCIAL_LINKS`:
```ts
export const GITHUB_USERNAME = "ParshvCrafts"; // derived from SOCIAL_LINKS.github
// in SITE:
//   status: "Building agentic systems",        // you-controlled one-liner
//   availability: "Open to Summer 2027 roles", // you-controlled availability string
```
(Exact strings are the user's to set; the spec wires whatever is in `SITE`.)

### 4.2 Status widget
- **`lib/status/berkeley-time.ts` (pure):** `formatBerkeleyTime(date: Date): { time: string; zone: string }` using `Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit" })` → e.g. `{ time: "9:42 PM", zone: "PT" }`. Pure (Date injected) → unit-testable with a fixed instant.
- **`lib/status/github-activity.ts` (pure):** `summarizeGithubActivity(events: GithubEvent[], now: Date): GithubSummary | null`. Picks the most recent relevant event (PushEvent/CreateEvent/PullRequestEvent), returns `{ verb, repo, relativeTime }` (e.g. `{ verb: "pushed to", repo: "Personal-Website-V2", relativeTime: "2h ago" }`); `null` when none/unrecognized. Relative-time formatter is pure. TDD: push event, create event, empty array, unknown type, future/zero diff.
- **`components/status/use-github-activity.ts` (client hook):** on mount, read a localStorage cache (`pp-gh-activity`, `{ summary, fetchedAt }`); if older than ~30 min (or absent), `fetch("https://api.github.com/users/<GITHUB_USERNAME>/events/public?per_page=20")`, run `summarizeGithubActivity`, write cache. Returns `{ summary, loading }`. On any failure (offline, 403 rate-limit, parse) → keep last cache or `null`; **never throws, never shows an error**. AbortController on unmount.
- **`components/status/status-widget.tsx` (client):** a full-width strip rendered in `site-footer.tsx` between the 3-col grid and the copyright bar (`border-t border-border`). Rows:
  - Availability: a `≤8px` dot (accent-tinted) + `SITE.availability`.
  - `SITE.status` + Berkeley time ("· 9:42 PM PT", ticking every 30s via `setInterval`; cleared on unmount; time updates aren't "motion" so they run under reduced-motion too).
  - GitHub activity row: "↳ pushed to *repo* · 2h ago" — **only rendered when `summary` is non-null** (silent when unavailable). Repo links to the repo URL (`noopener,noreferrer`).
  - Tokened (`text-muted`/`text-foreground`/`bg-surface`/`border-border`), no hardcoded hex, `font-mono` labels. `aria-live="off"` (not an alert). Decorative dot `aria-hidden`.

### 4.3 Guided tour
- **`lib/tour/steps.ts` (pure data):** `TOUR_STEPS: TourStep[]`, each `{ id, target: string (CSS selector), title: string, body: string, placement?: "top"|"bottom"|"left"|"right" }`. ~4 stops: the ⌘K trigger (`button[aria-label="Open command palette"]`), the theme switcher (`[role="radiogroup"][aria-label="Color theme"]`), the showpiece section, the contact section. A pure `resolveVisibleSteps(steps, doc)` drops steps whose target isn't in the DOM (e.g. theme switcher is desktop-only) so the tour stays valid on mobile. TDD: all-present, some-missing, none-present.
- **`lib/tour/tour-bus.ts`:** `subscribeStartTour(cb)/requestStartTour()` (module-level Set; SSR-safe), mirroring `palette-bus`.
- **`components/tour/guided-tour.tsx` (client):** listens on the bus. When started: compute visible steps; render a dimmed full-screen overlay (`bg-background/70`) with a **highlight cutout** around the current target (a positioned ring via `getBoundingClientRect`, recomputed on resize/scroll) + a `role="dialog" aria-modal aria-label="Site tour"` coachmark (title, body, step "2 / 4", Back/Next/Skip ≥44px). Scrolls the target into view (`scrollIntoView`, respects reduced motion → `behavior:"auto"`). Keyboard: →/Enter = next, ← = back, Esc = end, Tab trapped in the coachmark; focus moves to the coachmark on each step and is restored to the opener on end. Ends on last "Done". Body scroll locked while active. **Reduced motion:** no animated dim/cutout transitions — instant step changes; the coachmark appears without slide.
- **`components/tour/tour-prompt.tsx` (client):** first-visit only, gated by a pure `shouldShowTourPrompt(storage): boolean` (true unless `localStorage["pp-tour-seen"]` set). A small non-blocking bottom toast "New here? Take a 20-second tour" with **Start** (→ `requestStartTour()` + set seen) and **Dismiss** (set seen). Auto-dismisses after ~8s (also sets seen). Reduced motion → appears instantly (no slide/fade). `role="dialog"`/region, fully keyboard-operable, ≥44px controls.
- **Palette integration:** keep the registry pure by adding `startTour: () => void` to `CommandContext` (`lib/command-palette/types.ts`), wired in `command-palette.tsx` to `requestStartTour`. Add one command to `lib/command-palette/commands.ts` — group **Actions**, `id: "action-tour"`, label "Take the tour", `run: (c) => { c.startTour(); c.close(); }`. The tour is always re-runnable here regardless of the seen flag. (The `command-palette-commands.test.ts` `noopCtx` helper must gain a `startTour: vi.fn()` field.)

### 4.4 Mount
Mount `<GuidedTour/>` + `<TourPrompt/>` once in the app shell (`app/layout.tsx`, within the existing providers, beside `<CommandPaletteIsland/>`). `<StatusWidget/>` is placed inside `site-footer.tsx`. All client/build-time; no SSR data.

## 5. Accessibility & motion contract

- Single `<h1>` unchanged. Full keyboard: tour and prompt fully operable; Esc ends tour; focus trapped in coachmark + prompt and restored on close; ≥44×44 controls; visible `ring-ring` focus.
- Tour coachmark `role="dialog" aria-modal`, `aria-live` step text; spotlighted element conveyed via the cutout + the coachmark reference (not color alone).
- ≥4.5:1 contrast for all widget + tour text in every theme (verified in the visual pass).
- `prefers-reduced-motion`: prompt + tour appear instantly, no dim/cutout/slide animation, no auto-scroll smoothing; the tour never pins or traps scroll; status time still ticks (not decorative motion).
- Status widget degrades silently (GitHub row hidden on failure); decorative dot `aria-hidden`.
- Tour overlay is `aria-hidden` to AT only where appropriate; the coachmark remains the focused, announced surface.

## 6. Testing strategy

**Unit (Vitest, jsdom — pure logic only):**
- `berkeley-time`: fixed instant → expected time/zone; minute padding; AM/PM.
- `github-activity`: push/create/PR summaries, relative-time buckets (s/m/h/d), empty + unknown → null.
- `tour/steps`: `resolveVisibleSteps` all/some/none present.
- `tour-prompt` gating: `shouldShowTourPrompt` true when unset, false when seen.

**E2E (Playwright, build+serve `out/`):**
- Footer status widget renders (availability + time); GitHub row optional (don't assert network).
- First visit → prompt appears; Start launches the tour (coachmark visible); reload → prompt does **not** reappear (seen persisted).
- ⌘K "Take the tour" command starts the tour even after seen; Esc ends it; focus restored; no `.pin-spacer`.
- Gate canvas-y assertions on real probes where relevant.

**Visual (Playwright MCP — Read every screenshot):**
- Footer widget in all 4 themes + mobile (390px) — contrast, dot, layout.
- Tour prompt + an active spotlight step in all 4 themes + mobile + a reduced-motion context.

## 7. Verification gates
`npm run lint` (my files), `tsc`, `npm test`, `npm run build`, then the Playwright MCP visual sweep. Hunt edge cases (GitHub 403/offline, no localStorage, mobile-hidden tour targets, RM, focus restore, scroll-into-view under Lenis) and raise to industrial quality before documenting.

## 8. Files

```
lib/site.ts                                 (+GITHUB_USERNAME, SITE.status, SITE.availability)
lib/status/berkeley-time.ts
lib/status/github-activity.ts
components/status/use-github-activity.ts
components/status/status-widget.tsx
lib/tour/steps.ts
lib/tour/tour-bus.ts
lib/tour/tour-prompt-state.ts               (pure shouldShowTourPrompt + seen keys)
components/tour/guided-tour.tsx
components/tour/tour-prompt.tsx
tests/unit/berkeley-time.test.ts
tests/unit/github-activity.test.ts
tests/unit/tour-steps.test.ts
tests/unit/tour-prompt-state.test.ts
tests/e2e/status-and-tour.spec.ts
# edits:
components/layout/site-footer.tsx           (mount <StatusWidget/>)
app/layout.tsx                              (mount <GuidedTour/> + <TourPrompt/>)
lib/command-palette/types.ts                (+startTour in CommandContext)
lib/command-palette/commands.ts             (+"Take the tour" Actions command)
components/command-palette/command-palette.tsx (wire startTour → requestStartTour)
docs/v2/STATUS-AND-TOUR.md                  (phase doc)
docs/v2/ROADMAP-V2.5-SIGNATURE.md           (status update)
```

## 9. Risks / watch-items
- **GitHub rate-limit (403):** unauthenticated API is 60/hr/IP; the localStorage cache + silent degrade keep it from ever erroring or flashing. Never expose a token (static export → would be public).
- **Tour targets vary by breakpoint:** the theme switcher is desktop-only; `resolveVisibleSteps` must drop missing targets so mobile gets a valid shorter tour.
- **Lenis + scrollIntoView:** stepping to an off-screen target must use the smooth-scroll provider or a reduced-motion-safe jump; verify no fight with Lenis/pinned sections; tour must never trap scroll.
- **Cutout recompute:** reposition the highlight on resize/scroll (throttled rAF) so it tracks the target; tear down listeners on end.
- **localStorage unavailable** (private mode): `shouldShowTourPrompt` + cache guards must treat throws as "show prompt / no cache", never crash.
- **CommandContext purity:** add `startTour` like the other injected deps so `buildCommands()` stays pure/testable.
