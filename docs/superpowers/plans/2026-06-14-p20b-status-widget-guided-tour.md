# P20b — Live Status Widget + First-Visit Guided Tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a footer "currently" status block (availability + Berkeley time + status + client-fetched GitHub activity) and an opt-in guided spotlight tour (first-visit prompt + ⌘K command), to WCAG 2.1 AA, 4 themes, reduced-motion-safe, static-export clean, zero new deps.

**Architecture:** Pure TDD'd logic (`formatBerkeleyTime`, `summarizeGithubActivity`, `resolveVisibleSteps`, `shouldShowTourPrompt`) + thin client components. A `tour-bus` pub-sub (mirroring P20a's `palette-bus`/`burst`) lets both the first-visit prompt and a new ⌘K command start the tour. GitHub data is fetched client-side with a localStorage cache and silent degradation.

**Tech Stack:** Next 16.2.7 (`output:'export'`), React 19.2.4, Tailwind v4 tokens, GSAP+Lenis, Vitest (jsdom, pure logic only), Playwright.

**Spec:** `docs/superpowers/specs/2026-06-14-p20b-status-widget-guided-tour-design.md`

---

## Notes for the implementer

- Branch `main`. Do NOT push. Atomic commits, **explicit `git add` paths only — never `git add -A`** (gitignored `docs/skills/` + other untracked reference must never be staged). Every commit message ends with the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Windows; run from repo root. Verify via `npm run build` + serving `out/`, not `npm run dev` (Turbopack panics on the spaces-in-path).
- The `react-hooks/set-state-in-effect` ESLint rule IS real in this React-19 config. For an unconditional/synchronous `setState` inside an effect, add `// eslint-disable-next-line react-hooks/set-state-in-effect` directly above it, matching `components/providers/motion-preference.tsx`.
- `tsc --noEmit` typechecks the whole project; ignore any errors only under `docs/skills/**`.
- Theme tokens: `bg-surface`, `bg-background`, `text-heading/foreground/muted`, `bg-accent`, `text-on-accent`, `border-border`, `ring-ring`. The background CSS var for inline use is `var(--color-background)`. No hardcoded hex.

## File structure

```
lib/status/berkeley-time.ts          # formatBerkeleyTime (pure)
lib/status/github-activity.ts        # summarizeGithubActivity + relativeTimeFrom (pure)
lib/tour/steps.ts                    # TOUR_STEPS + resolveVisibleSteps (pure)
lib/tour/tour-bus.ts                 # subscribeStartTour / requestStartTour
lib/tour/tour-prompt-state.ts        # shouldShowTourPrompt + TOUR_SEEN_KEY (pure)
components/status/use-github-activity.ts
components/status/status-widget.tsx
components/tour/guided-tour.tsx
components/tour/tour-prompt.tsx
tests/unit/{berkeley-time,github-activity,tour-steps,tour-prompt-state,tour-bus}.test.ts
tests/e2e/status-and-tour.spec.ts
# edits:
lib/site.ts                                       # +GITHUB_USERNAME, SITE.status, SITE.availability
lib/command-palette/types.ts                      # +startTour in CommandContext
lib/command-palette/commands.ts                   # +"Take the tour" Actions command
components/command-palette/command-palette.tsx    # wire startTour -> requestStartTour
tests/unit/command-palette-commands.test.ts       # noopCtx gains startTour: vi.fn()
components/layout/site-footer.tsx                  # mount <StatusWidget/>
app/layout.tsx                                     # mount <GuidedTour/> + <TourPrompt/>
docs/v2/STATUS-AND-TOUR.md                         # phase doc
docs/v2/ROADMAP-V2.5-SIGNATURE.md                 # status update
```

---

## Task 1: Berkeley time formatter (pure)

**Files:** Create `lib/status/berkeley-time.ts`; Test `tests/unit/berkeley-time.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { formatBerkeleyTime } from "@/lib/status/berkeley-time";

describe("formatBerkeleyTime", () => {
  it("formats a UTC instant as Berkeley wall-clock (PDT in summer)", () => {
    // 2026-06-15T02:42:00Z = 2026-06-14 19:42 in America/Los_Angeles (UTC-7, PDT)
    const out = formatBerkeleyTime(new Date("2026-06-15T02:42:00Z"));
    expect(out.time).toBe("7:42 PM");
    expect(out.zone).toBe("PDT");
  });
  it("zero-pads minutes and handles AM (PST in winter)", () => {
    // 2026-01-15T17:05:00Z = 2026-01-15 09:05 in America/Los_Angeles (UTC-8, PST)
    const out = formatBerkeleyTime(new Date("2026-01-15T17:05:00Z"));
    expect(out.time).toBe("9:05 AM");
    expect(out.zone).toBe("PST");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/berkeley-time.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `lib/status/berkeley-time.ts`**

```ts
export interface BerkeleyTime {
  time: string;
  zone: string;
}

/** Format an instant as Berkeley (America/Los_Angeles) wall-clock time. Pure. */
export function formatBerkeleyTime(date: Date): BerkeleyTime {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  const zone =
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName")?.value ?? "PT";
  return { time, zone };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/berkeley-time.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/status/berkeley-time.ts tests/unit/berkeley-time.test.ts
git commit -m "feat(v2): Berkeley time formatter (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: GitHub activity parser (pure)

**Files:** Create `lib/status/github-activity.ts`; Test `tests/unit/github-activity.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { summarizeGithubActivity, relativeTimeFrom } from "@/lib/status/github-activity";

const now = new Date("2026-06-14T12:00:00Z");

describe("relativeTimeFrom", () => {
  it("buckets seconds/minutes/hours/days", () => {
    expect(relativeTimeFrom(new Date("2026-06-14T11:59:30Z"), now)).toBe("just now");
    expect(relativeTimeFrom(new Date("2026-06-14T11:45:00Z"), now)).toBe("15m ago");
    expect(relativeTimeFrom(new Date("2026-06-14T09:00:00Z"), now)).toBe("3h ago");
    expect(relativeTimeFrom(new Date("2026-06-12T12:00:00Z"), now)).toBe("2d ago");
  });
});

describe("summarizeGithubActivity", () => {
  it("summarizes the first recognized event (PushEvent)", () => {
    const events = [
      { type: "PushEvent", repo: { name: "ParshvCrafts/Personal-Website-V2" }, created_at: "2026-06-14T10:00:00Z" },
    ];
    expect(summarizeGithubActivity(events, now)).toEqual({
      verb: "pushed to",
      repo: "Personal-Website-V2",
      repoUrl: "https://github.com/ParshvCrafts/Personal-Website-V2",
      relativeTime: "2h ago",
    });
  });
  it("skips unrecognized events and finds the next recognized one", () => {
    const events = [
      { type: "MemberEvent", repo: { name: "a/b" }, created_at: "2026-06-14T11:00:00Z" },
      { type: "CreateEvent", repo: { name: "ParshvCrafts/foo" }, created_at: "2026-06-14T11:30:00Z" },
    ];
    expect(summarizeGithubActivity(events, now)?.verb).toBe("created");
    expect(summarizeGithubActivity(events, now)?.repo).toBe("foo");
  });
  it("returns null for empty or all-unrecognized", () => {
    expect(summarizeGithubActivity([], now)).toBeNull();
    expect(summarizeGithubActivity([{ type: "MemberEvent", repo: { name: "a/b" }, created_at: now.toISOString() }], now)).toBeNull();
  });
  it("returns null for non-array input", () => {
    // @ts-expect-error testing defensive guard
    expect(summarizeGithubActivity(null, now)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/github-activity.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `lib/status/github-activity.ts`**

```ts
export interface GithubEvent {
  type: string;
  repo?: { name?: string };
  created_at?: string;
}

export interface GithubSummary {
  verb: string;
  repo: string;
  repoUrl: string;
  relativeTime: string;
}

const VERBS: Record<string, string> = {
  PushEvent: "pushed to",
  CreateEvent: "created",
  PullRequestEvent: "opened a PR in",
  WatchEvent: "starred",
  ForkEvent: "forked",
};

/** Human relative time from a past instant. Pure. */
export function relativeTimeFrom(then: Date, now: Date): string {
  const s = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Reduce a GitHub public-events array to one concise summary, or null. Pure. */
export function summarizeGithubActivity(events: GithubEvent[], now: Date): GithubSummary | null {
  if (!Array.isArray(events)) return null;
  for (const ev of events) {
    const verb = VERBS[ev.type];
    const full = ev.repo?.name;
    if (!verb || !full || !ev.created_at) continue;
    const then = new Date(ev.created_at);
    if (Number.isNaN(then.getTime())) continue;
    return {
      verb,
      repo: full.split("/").pop() ?? full,
      repoUrl: `https://github.com/${full}`,
      relativeTime: relativeTimeFrom(then, now),
    };
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/github-activity.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/status/github-activity.ts tests/unit/github-activity.test.ts
git commit -m "feat(v2): GitHub public-activity summarizer (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Tour steps + visibility resolver (pure)

**Files:** Create `lib/tour/steps.ts`; Test `tests/unit/tour-steps.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { TOUR_STEPS, resolveVisibleSteps } from "@/lib/tour/steps";

describe("TOUR_STEPS", () => {
  it("has unique ids and non-empty targets/copy", () => {
    const ids = TOUR_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of TOUR_STEPS) {
      expect(s.target.length).toBeGreaterThan(0);
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(0);
    }
  });
});

describe("resolveVisibleSteps", () => {
  it("keeps only steps whose target is in the document", () => {
    document.body.innerHTML = `<button aria-label="Open command palette"></button><div id="contact"></div>`;
    const visible = resolveVisibleSteps(TOUR_STEPS, document);
    const ids = visible.map((s) => s.id);
    expect(ids).toContain("palette");
    expect(ids).toContain("contact");
    expect(ids).not.toContain("theme"); // radiogroup not present
  });
  it("returns empty when no targets present", () => {
    document.body.innerHTML = `<div></div>`;
    expect(resolveVisibleSteps(TOUR_STEPS, document)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/tour-steps.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `lib/tour/steps.ts`**

```ts
export interface TourStep {
  id: string;
  target: string;
  title: string;
  body: string;
  placement?: "top" | "bottom";
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "palette",
    target: 'button[aria-label="Open command palette"]',
    title: "Jump anywhere",
    body: "Press ⌘K (or Ctrl K) to search sections, switch themes, and open links — fast.",
    placement: "bottom",
  },
  {
    id: "theme",
    target: '[role="radiogroup"][aria-label="Color theme"]',
    title: "Four themes",
    body: "Set the mood — Midnight, Daylight, Manuscript, or Neon. Try them all.",
    placement: "bottom",
  },
  {
    id: "projects",
    target: "#projects",
    title: "The work",
    body: "Featured builds and projects — filterable, with deep-dive case studies.",
    placement: "top",
  },
  {
    id: "contact",
    target: "#contact",
    title: "Get in touch",
    body: "Email, socials, or the form. The footer shows what I'm up to right now.",
    placement: "top",
  },
];

/** Keep only steps whose target exists in the given document. Pure. */
export function resolveVisibleSteps(steps: TourStep[], doc: Document): TourStep[] {
  return steps.filter((s) => doc.querySelector(s.target) !== null);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/tour-steps.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/tour/steps.ts tests/unit/tour-steps.test.ts
git commit -m "feat(v2): guided-tour step config + visibility resolver (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Tour prompt gating + bus

**Files:** Create `lib/tour/tour-prompt-state.ts`, `lib/tour/tour-bus.ts`; Test `tests/unit/tour-prompt-state.test.ts`, `tests/unit/tour-bus.test.ts`

- [ ] **Step 1: Write the failing tests**

`tests/unit/tour-prompt-state.test.ts`:
```ts
import { describe, expect, it, vi } from "vitest";
import { shouldShowTourPrompt, TOUR_SEEN_KEY } from "@/lib/tour/tour-prompt-state";

const store = (val: string | null) => ({ getItem: vi.fn(() => val) });

describe("shouldShowTourPrompt", () => {
  it("shows when the seen key is unset", () => {
    expect(shouldShowTourPrompt(store(null))).toBe(true);
  });
  it("hides when the seen key is set", () => {
    expect(shouldShowTourPrompt(store("1"))).toBe(false);
  });
  it("hides when storage is null (SSR)", () => {
    expect(shouldShowTourPrompt(null)).toBe(false);
  });
  it("hides (never crashes) when getItem throws", () => {
    expect(shouldShowTourPrompt({ getItem: () => { throw new Error("blocked"); } })).toBe(false);
  });
  it("exports a stable key", () => {
    expect(TOUR_SEEN_KEY).toBe("pp-tour-seen");
  });
});
```

`tests/unit/tour-bus.test.ts`:
```ts
import { describe, expect, it, vi } from "vitest";
import { subscribeStartTour, requestStartTour } from "@/lib/tour/tour-bus";

describe("tour bus", () => {
  it("notifies subscribers and stops after unsubscribe", () => {
    const cb = vi.fn();
    const off = subscribeStartTour(cb);
    requestStartTour();
    expect(cb).toHaveBeenCalledTimes(1);
    off();
    requestStartTour();
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/tour-prompt-state.test.ts tests/unit/tour-bus.test.ts`
Expected: FAIL (modules missing).

- [ ] **Step 3: Implement both modules**

`lib/tour/tour-prompt-state.ts`:
```ts
export const TOUR_SEEN_KEY = "pp-tour-seen";

/** True when the first-visit tour prompt should be shown. Never throws. */
export function shouldShowTourPrompt(storage: Pick<Storage, "getItem"> | null): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(TOUR_SEEN_KEY) === null;
  } catch {
    return false;
  }
}
```

`lib/tour/tour-bus.ts`:
```ts
type Listener = () => void;
const listeners = new Set<Listener>();

/** Subscribe to tour-start requests. Returns an unsubscribe fn. SSR-safe. */
export function subscribeStartTour(cb: Listener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function requestStartTour(): void {
  listeners.forEach((l) => l());
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/tour-prompt-state.test.ts tests/unit/tour-bus.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/tour/tour-prompt-state.ts lib/tour/tour-bus.ts tests/unit/tour-prompt-state.test.ts tests/unit/tour-bus.test.ts
git commit -m "feat(v2): tour prompt gating + start bus (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Site config — username + status strings

**Files:** Modify `lib/site.ts`

- [ ] **Step 1: Add the config**

In `lib/site.ts`, add `GITHUB_USERNAME` near `SOCIAL_LINKS`:
```ts
/** GitHub handle (matches SOCIAL_LINKS.github) — used by the live status widget. */
export const GITHUB_USERNAME = "ParshvCrafts";
```
And add two fields to the `SITE` object (after `location`):
```ts
  /** You-controlled one-liner shown in the footer status widget. */
  status: "Building agentic systems",
  /** You-controlled availability shown with a status dot. */
  availability: "Open to Summer 2027 internships",
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: `No errors found`.

- [ ] **Step 3: Commit**

```bash
git add lib/site.ts
git commit -m "feat(v2): add GitHub username + status/availability strings to site config

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: GitHub activity hook (client)

**Files:** Create `components/status/use-github-activity.ts`

No unit test (network/effect; the parser it uses is already tested). Verified by typecheck + e2e + visual.

- [ ] **Step 1: Implement**

```ts
"use client";

import { useEffect, useState } from "react";
import { GITHUB_USERNAME } from "@/lib/site";
import { summarizeGithubActivity, type GithubSummary } from "@/lib/status/github-activity";

const CACHE_KEY = "pp-gh-activity";
const MAX_AGE_MS = 30 * 60 * 1000;

interface Cache {
  summary: GithubSummary | null;
  fetchedAt: number;
}

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : null;
  } catch {
    return null;
  }
}

/** Latest public GitHub activity, client-fetched + localStorage-cached. Never throws. */
export function useGithubActivity(): GithubSummary | null {
  const [summary, setSummary] = useState<GithubSummary | null>(null);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSummary(cached.summary);
      if (Date.now() - cached.fetchedAt < MAX_AGE_MS) return;
    }
    const ctrl = new AbortController();
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=20`, {
      signal: ctrl.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((events) => {
        const next = summarizeGithubActivity(events, new Date());
        setSummary(next);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ summary: next, fetchedAt: Date.now() }));
        } catch {
          /* storage full / blocked — non-fatal */
        }
      })
      .catch(() => {
        /* offline / rate-limit / abort → keep whatever cache we have */
      });
    return () => ctrl.abort();
  }, []);

  return summary;
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint components/status/use-github-activity.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/status/use-github-activity.ts
git commit -m "feat(v2): client GitHub-activity hook (cached, silent degrade)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Status widget component

**Files:** Create `components/status/status-widget.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { formatBerkeleyTime } from "@/lib/status/berkeley-time";
import { useGithubActivity } from "./use-github-activity";

/** Footer "currently" block: availability + Berkeley time + status + GitHub activity. */
export function StatusWidget() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const activity = useGithubActivity();
  const t = now ? formatBerkeleyTime(now) : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-border px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
      <div className="flex items-center gap-2">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent" />
        <span className="text-sm text-foreground">{SITE.availability}</span>
      </div>

      <p className="font-mono text-xs text-muted">
        {SITE.status}
        {t && (
          <>
            {" · "}
            <span suppressHydrationWarning>
              {t.time} {t.zone}
            </span>
          </>
        )}
      </p>

      {activity && (
        <a
          href={activity.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ↳ {activity.verb} {activity.repo} · {activity.relativeTime}
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint components/status/status-widget.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/status/status-widget.tsx
git commit -m "feat(v2): footer status widget (availability + Berkeley time + GitHub)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Guided tour component

**Files:** Create `components/tour/guided-tour.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TOUR_STEPS, resolveVisibleSteps, type TourStep } from "@/lib/tour/steps";
import { subscribeStartTour } from "@/lib/tour/tour-bus";
import { prefersReducedMotion } from "@/lib/motion";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Opt-in spotlight tour. Starts on the tour bus; never auto-starts. */
export function GuidedTour() {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const coachRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const active = steps.length > 0;
  const step = active ? steps[Math.min(index, steps.length - 1)] : null;
  const isLast = active && index >= steps.length - 1;

  const end = useCallback(() => {
    setSteps([]);
    setIndex(0);
    setRect(null);
  }, []);
  const next = useCallback(() => setIndex((i) => (i + 1 < steps.length ? i + 1 : i)), [steps.length]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Start when the bus fires.
  useEffect(
    () =>
      subscribeStartTour(() => {
        const visible = resolveVisibleSteps(TOUR_STEPS, document);
        if (visible.length === 0) return;
        previouslyFocused.current = document.activeElement as HTMLElement | null;
        setSteps(visible);
        setIndex(0);
      }),
    [],
  );

  // Position the cutout + scroll target into view on each step.
  useEffect(() => {
    if (!step) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    let raf = 0;
    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
    };
  }, [step]);

  // Body lock + focus + keyboard while active.
  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    coachRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); end(); }
      else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); if (index >= steps.length - 1) end(); else next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
      else if (e.key === "Tab") {
        const f = coachRef.current?.querySelectorAll<HTMLElement>("button");
        if (!f || f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, index, steps.length, end, next, back]);

  // Restore focus when the tour ends.
  useEffect(() => {
    if (!active && previouslyFocused.current) {
      previouslyFocused.current.focus();
      previouslyFocused.current = null;
    }
  }, [active]);

  if (!active || !step) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="presentation">
      {/* Click catcher (transparent) — clicking outside ends the tour. */}
      <button
        type="button"
        aria-label="End tour"
        tabIndex={-1}
        onClick={end}
        className="absolute inset-0 cursor-default"
      />
      {/* Spotlight: a box at the target whose huge box-shadow dims everything else. */}
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-lg ring-2 ring-accent transition-[top,left,width,height] duration-200 motion-reduce:transition-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px color-mix(in srgb, var(--color-background) 72%, transparent)",
          }}
        />
      )}
      {/* Coachmark */}
      <div
        ref={coachRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site tour"
        tabIndex={-1}
        className="absolute bottom-8 left-1/2 w-[min(92vw,400px)] -translate-x-1/2 rounded-xl border border-border bg-surface p-5 shadow-2xl focus:outline-none"
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {index + 1} / {steps.length}
        </p>
        <h2 className="mt-1 font-display text-xl text-heading">{step.title}</h2>
        <p aria-live="polite" className="mt-2 text-sm text-foreground">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={end}
            className="min-h-11 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={back}
                className="min-h-11 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? end() : next())}
              className="min-h-11 rounded-md bg-accent px-4 text-sm text-on-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint components/tour/guided-tour.tsx`
Expected: no errors. (If `react-hooks/exhaustive-deps` flags the step-position effect, the deps are intentional — add a one-line `eslint-disable-next-line react-hooks/exhaustive-deps` with reason, matching `inkfield-scene.tsx`.)

- [ ] **Step 3: Commit**

```bash
git add components/tour/guided-tour.tsx
git commit -m "feat(v2): guided-tour spotlight (cutout, coachmark, keyboard, RM-safe)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: First-visit tour prompt

**Files:** Create `components/tour/tour-prompt.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useEffect, useState } from "react";
import { requestStartTour } from "@/lib/tour/tour-bus";
import { shouldShowTourPrompt, TOUR_SEEN_KEY } from "@/lib/tour/tour-prompt-state";

/** Non-blocking first-visit toast offering the tour. Shows once (localStorage-gated). */
export function TourPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldShowTourPrompt(window.localStorage)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
    const id = window.setTimeout(() => dismiss(), 8000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markSeen() {
    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, "1");
    } catch {
      /* private mode — non-fatal */
    }
  }
  function dismiss() {
    markSeen();
    setOpen(false);
  }
  function start() {
    markSeen();
    setOpen(false);
    requestStartTour();
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Take a tour"
      className="fixed bottom-4 left-4 z-[75] w-[min(92vw,320px)] rounded-xl border border-border bg-surface p-4 shadow-2xl"
    >
      <p className="text-sm text-foreground">New here? Take a 20-second tour.</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={start}
          className="min-h-11 rounded-md bg-accent px-4 text-sm text-on-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="min-h-11 rounded-md px-3 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint components/tour/tour-prompt.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/tour/tour-prompt.tsx
git commit -m "feat(v2): first-visit tour prompt (opt-in, localStorage-gated)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Palette "Take the tour" command

**Files:** Modify `lib/command-palette/types.ts`, `lib/command-palette/commands.ts`, `components/command-palette/command-palette.tsx`, `tests/unit/command-palette-commands.test.ts`

- [ ] **Step 1: Update the failing test first**

In `tests/unit/command-palette-commands.test.ts`, add `startTour: vi.fn()` to the `noopCtx` object literal (so the type matches), then add a test:
```ts
  it("includes a 'Take the tour' command that calls startTour and closes", () => {
    const ctx = noopCtx();
    const cmd = cmds.find((c) => c.id === "action-tour");
    expect(cmd).toBeTruthy();
    cmd!.run(ctx);
    expect(ctx.startTour).toHaveBeenCalled();
    expect(ctx.close).toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/command-palette-commands.test.ts`
Expected: FAIL (no `action-tour`; `startTour` missing on type).

- [ ] **Step 3: Implement**

In `lib/command-palette/types.ts`, add to `CommandContext` (after `toggleAnimations`):
```ts
  startTour: () => void;
```

In `lib/command-palette/commands.ts`, import the icon and add the command to the `actions` array:
```ts
// add `Compass` to the existing lucide import
```
and:
```ts
    { id: "action-tour", group: "Actions", label: "Take the tour", keywords: ["guide", "walkthrough", "help"], icon: Compass, run: (c) => { c.startTour(); c.close(); } },
```

In `components/command-palette/command-palette.tsx`, import the bus and add `startTour` to the `ctx` object:
```ts
import { requestStartTour } from "@/lib/tour/tour-bus";
// inside the ctx useMemo object:
    startTour: () => requestStartTour(),
```
(Leave the `ctx` useMemo deps as they are — `requestStartTour` is a stable module import.)

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/unit/command-palette-commands.test.ts && npx tsc --noEmit -p tsconfig.json`
Expected: PASS; typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add lib/command-palette/types.ts lib/command-palette/commands.ts components/command-palette/command-palette.tsx tests/unit/command-palette-commands.test.ts
git commit -m "feat(v2): add 'Take the tour' command to the ⌘K palette

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Mount the widget + tour

**Files:** Modify `components/layout/site-footer.tsx`, `app/layout.tsx`

- [ ] **Step 1: Mount the status widget in the footer**

In `components/layout/site-footer.tsx`, add the import:
```tsx
import { StatusWidget } from "@/components/status/status-widget";
```
Place `<StatusWidget />` between the closing `</div>` of the 3-column grid (the `</div>` after the Contact column block, i.e. the one closing `<div className="mx-auto grid max-w-6xl …">`) and the bottom `<Reveal …>` copyright row:
```tsx
      </div>

      <StatusWidget />

      <Reveal className="mx-auto flex max-w-6xl items-center justify-between px-6 pb-10 md:px-10">
```

- [ ] **Step 2: Mount the tour + prompt in the shell**

In `app/layout.tsx`, add imports:
```tsx
import { GuidedTour } from "@/components/tour/guided-tour";
import { TourPrompt } from "@/components/tour/tour-prompt";
```
Add them beside the palette island inside `<SmoothScrollProvider>`:
```tsx
              <CommandPaletteIsland />
              <RippleFallback />
              <GuidedTour />
              <TourPrompt />
```

- [ ] **Step 3: Typecheck + lint + build**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint components/layout/site-footer.tsx app/layout.tsx && npm run build`
Expected: no errors; build succeeds (static export).

- [ ] **Step 4: Commit**

```bash
git add components/layout/site-footer.tsx app/layout.tsx
git commit -m "feat(v2): mount status widget (footer) + guided tour & prompt (shell)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: E2E spec

**Files:** Create `tests/e2e/status-and-tour.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from "@playwright/test";

test.describe("status widget + guided tour", () => {
  test("footer shows availability + Berkeley time", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(page.getByText(/Open to|Building/i).first()).toBeVisible();
    // Berkeley time renders a PT/PST/PDT zone label.
    await expect(page.getByText(/P[SD]?T/).first()).toBeVisible({ timeout: 5000 });
  });

  test("first-visit prompt appears, starts the tour, and does not reappear", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const prompt = page.getByRole("dialog", { name: "Take a tour" });
    await expect(prompt).toBeVisible({ timeout: 5000 });
    await prompt.getByRole("button", { name: "Start" }).click();
    await expect(page.getByRole("dialog", { name: "Site tour" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Site tour" })).toBeHidden();
    // Reload → prompt gone (seen persisted).
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog", { name: "Take a tour" })).toBeHidden();
  });

  test("the ⌘K 'Take the tour' command starts the tour", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox", { name: "Search commands" });
    await input.fill("tour");
    await input.press("Enter");
    await expect(page.getByRole("dialog", { name: "Site tour" })).toBeVisible();
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Note on running**

The dev webServer is flaky here; verify primarily via `npm run build` + serving `out/` + the Playwright MCP pass. Do not block the commit on a flaky webServer.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/status-and-tour.spec.ts
git commit -m "test(v2): status widget + guided tour e2e

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: Docs + roadmap

**Files:** Create `docs/v2/STATUS-AND-TOUR.md`; Modify `docs/v2/ROADMAP-V2.5-SIGNATURE.md`

- [ ] **Step 1: Write `docs/v2/STATUS-AND-TOUR.md`**

Concise phase doc (mirror `docs/v2/COMMAND-PALETTE.md` tone): what shipped (footer status block with the three data rows + graceful GitHub degrade; opt-in tour via prompt + ⌘K command; the `tour-bus`), a11y/RM/4-theme contract, files, and how to edit (`SITE.status`/`availability`, `TOUR_STEPS`).

- [ ] **Step 2: Update the roadmap**

In `docs/v2/ROADMAP-V2.5-SIGNATURE.md`, change the P20b row status from `pending` to `done (2026-06-14)` and reference `docs/v2/STATUS-AND-TOUR.md`.

- [ ] **Step 3: Commit**

```bash
git add docs/v2/STATUS-AND-TOUR.md docs/v2/ROADMAP-V2.5-SIGNATURE.md
git commit -m "docs(v2): P20b status widget + guided tour doc; roadmap update

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final verification (after Task 13, before reporting)

1. `npx eslint <all new/changed files>` — clean (ignore `docs/skills/**`).
2. `npx tsc --noEmit -p tsconfig.json` — clean.
3. `npm test` — full unit suite green (existing 252 + new berkeley/github/tour/tour-bus/prompt-state + the palette command test).
4. `npm run build` — static export succeeds.
5. **Playwright MCP visual + interaction pass** (the authority — Read every screenshot):
   - Build + serve `out/` on 4321.
   - Footer status widget in all 4 themes + mobile (390px): availability dot + text, Berkeley time, GitHub row (if the network served it) — contrast, layout, no overflow.
   - First-visit prompt visible; click Start → spotlight tour; step through Next/Back; verify the cutout tracks the target and the coachmark is readable in all 4 themes + mobile; Esc ends + focus restored.
   - Reduced-motion context: prompt + tour appear without animation; no auto-scroll smoothing; no scroll trap.
   - Clear `localStorage` between first-visit checks (`localStorage.clear()` via evaluate). Clean up `.playwright-mcp/`, stop server, close browser.
6. **Hunt + raise quality:** GitHub 403/offline (row hidden, no error), localStorage blocked (no crash, prompt still safe), mobile tour (theme step dropped → valid shorter tour), tour target off-screen (scrolls into view, no Lenis fight, no pin), focus restore, ≥44px controls, 4-theme contrast on the dim + coachmark + dot.
7. **Two-stage read-only reviewer pass** on the P20b range (Stage 1 spec/a11y/design; Stage 2 code-quality/bugs/Next-16/RSC/perf), scoped to P20b files, told to ignore `docs/skills/**`.

## Self-review (plan vs spec)

- **Spec §4.1 config** → Task 5. ✓
- **Spec §4.2 widget** (berkeley-time, github parser, hook w/ cache+degrade, footer block) → Tasks 1, 2, 6, 7 + mount Task 11. ✓
- **Spec §4.3 tour** (steps+resolveVisible, bus, spotlight+coachmark+keyboard+RM, first-visit prompt gated, palette command via `startTour` ctx) → Tasks 3, 4, 8, 9, 10. ✓
- **Spec §4.4 mount** → Task 11. ✓
- **Spec §6 testing** → unit Tasks 1–4 + 10; e2e Task 12; visual in Final verification. ✓
- **Spec §5 a11y/motion** → enforced in Tasks 7/8/9 + verified in Final verification. ✓
- **Type consistency:** `GithubSummary` shape identical across github-activity.ts (Task 2), the hook (Task 6), the widget (Task 7). `CommandContext.startTour` added in Task 10 matches the `command-palette.tsx` wiring + the registry `run` + the test `noopCtx`. `subscribeStartTour`/`requestStartTour`, `resolveVisibleSteps`, `shouldShowTourPrompt`, `formatBerkeleyTime` names consistent across producers/consumers. ✓
- **No placeholders:** every code step is complete. The `SITE.status`/`availability` strings are real defaults the user can edit. The only "verify-then-adjust" notes are the two optional eslint-disable hints (real rule). ✓
- **No dirty-file dependency:** unlike P20a, all integration files (`site-footer.tsx`, `app/layout.tsx`, palette files) are committed/clean now — Task 11 + 10 edit them directly. ✓
```
