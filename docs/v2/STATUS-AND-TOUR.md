# P20b — Live Status Widget + First-Visit Guided Tour

Wave 2 of P20 "Advanced Features". A subtle footer "currently" block + an opt-in guided spotlight tour. Hand-rolled, dependency-free, WCAG 2.1 AA, reduced-motion-safe, all 4 themes, static-export clean.

Spec: `docs/superpowers/specs/2026-06-14-p20b-status-widget-guided-tour-design.md`
Plan: `docs/superpowers/plans/2026-06-14-p20b-status-widget-guided-tour.md`

## Status widget

A full-width strip in the footer (above the copyright bar), three pieces:
- **Availability** — accent dot + `SITE.availability` (you-controlled, build-time, always reliable).
- **Status + Berkeley time** — `SITE.status` + a live `Intl.DateTimeFormat(tz: America/Los_Angeles)` clock (`lib/status/berkeley-time.ts`, pure), ticking every 30s. `suppressHydrationWarning` on the time (client-only).
- **Latest GitHub activity** — `useGithubActivity()` fetches `api.github.com/users/<GITHUB_USERNAME>/events/public` client-side (no token), summarized by the pure `summarizeGithubActivity()` → "↳ pushed to *repo* · 2h ago". localStorage-cached (30-min TTL); on offline / 403 rate-limit / parse failure it keeps the last cache or **renders nothing** — never an error, never a layout-blocking spinner. AbortController on unmount.

Only `PushEvent`/`CreateEvent`/`PullRequestEvent` surface (passive star/fork events are excluded to avoid misleading external-repo links).

## Guided tour

**Opt-in, never auto-hijacks.** Two entry points, one engine:
- **First-visit prompt** (`tour-prompt.tsx`) — a non-blocking `role="region"` toast ("Take a 20-second tour", Start / Dismiss), shown once via `shouldShowTourPrompt` (localStorage `pp-tour-seen`), auto-dismissing after 8s. Reduced motion → appears without animation.
- **⌘K command** — a "Take the tour" Actions command (`startTour` injected into `CommandContext`), always re-runnable.

Both fire `requestStartTour()` on the `tour-bus` (mirrors P20a's `palette-bus`/`burst`). `GuidedTour` then:
- Resolves `TOUR_STEPS` (`lib/tour/steps.ts`) against the live DOM — `resolveVisibleSteps` drops absent targets, plus a client-rect filter drops `display:none` ones (so the desktop-only theme step is skipped on mobile → a valid shorter tour).
- Renders a **spotlight cutout** (a box at the target whose `0 0 0 9999px` `color-mix` box-shadow dims everything else) that tracks the target on scroll/resize, and a `role="dialog" aria-modal` coachmark (title, body `aria-live`, step counter, Back/Next/Skip ≥44px).
- Scrolls each target into view via the **Lenis-aware** smooth-scroll provider (not native `scrollIntoView`, which fights Lenis); instant jump under reduced motion.
- Keyboard: →/Enter next, ← back, Esc end, Tab trapped in the coachmark (catches focus on the container too); body scroll locked; focus moved to the coachmark on open and restored to the opener on end.

## Files

```
lib/status/{berkeley-time,github-activity}.ts
components/status/{use-github-activity.ts,status-widget.tsx}
lib/tour/{steps,tour-bus,tour-prompt-state}.ts
components/tour/{guided-tour,tour-prompt}.tsx
lib/site.ts                 (+GITHUB_USERNAME, SITE.status, SITE.availability)
lib/command-palette/{types,commands}.ts + command-palette.tsx  (startTour + "Take the tour")
components/layout/site-footer.tsx (mount widget) · app/layout.tsx (mount tour + prompt)
tests/unit/{berkeley-time,github-activity,tour-steps,tour-prompt-state,tour-bus}.test.ts
tests/e2e/status-and-tour.spec.ts
```

## Editing

- Status strings: `SITE.status` + `SITE.availability` in `lib/site.ts`.
- Tour stops: edit `TOUR_STEPS` in `lib/tour/steps.ts` (`{ id, target, title, body, placement }`); targets are CSS selectors resolved at runtime.

## Verification

Lint clean; `tsc` clean; **270** unit tests; static export builds. Playwright MCP visual pass: footer widget in all 4 themes (teal/blue/rust/cyan dots, AA contrast) + mobile; live GitHub row returned real data; tour prompt (desktop + mobile); spotlight steps with Lenis scroll + Back/Next/Skip + Esc end + focus restore; **mobile tour correctly runs 3 steps** (theme step dropped); 0 console errors. Reduced-motion paths gated via `prefersReducedMotion()` / the provider's RM fallback (MCP can't emulate the media query).

## Follow-ups (P21)

- `AnimationToggle` 36px target (< 44px) — pre-existing, bump in QA.
- Reduced-motion visual confirmation (needs emulated media or a real RM environment).
