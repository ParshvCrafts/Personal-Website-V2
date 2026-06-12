# P16 Cinematic Showpiece Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The pinned scroll-scrub section plays the real "Signal" frame sequences with the correct grade per theme, replacing the procedural placeholder.

**Architecture:** Engine (`components/motion/scroll-sequence.tsx`) is untouched. A new pure helper maps theme → grade; `ScrollShowpiece` reads `useTheme()` and remounts `ScrollSequence` (via `key={grade}`) pointing at `/sequences/intelligence/<grade>/frame_0001.webp…`. Spec: `docs/superpowers/specs/2026-06-12-p16-cinematic-showpiece-design.md`.

**Tech Stack:** Next 16 App Router client components, next-themes, existing ScrollSequence engine, Vitest, Playwright.

**Conventions:** One conventional commit per task, trailer exactly `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Explicit `git add` paths; never push.

---

### Task 1: gradeForTheme helper (TDD)

**Files:**
- Create: `lib/sequence-grade.ts`
- Test: `tests/unit/sequence-grade.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/sequence-grade.test.ts
import { describe, expect, it } from "vitest";
import { gradeForTheme } from "@/lib/sequence-grade";

describe("gradeForTheme", () => {
  it("maps light-background themes to the light grade", () => {
    expect(gradeForTheme("daylight")).toBe("light");
    expect(gradeForTheme("manuscript")).toBe("light");
  });

  it("maps dark themes to the dark grade", () => {
    expect(gradeForTheme("midnight")).toBe("dark");
    expect(gradeForTheme("neon")).toBe("dark");
  });

  it("defaults to dark for undefined (pre-hydration) and unknown values", () => {
    expect(gradeForTheme(undefined)).toBe("dark");
    expect(gradeForTheme("system")).toBe("dark");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/sequence-grade.test.ts`
Expected: FAIL — cannot resolve `@/lib/sequence-grade`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/sequence-grade.ts
export type SequenceGrade = "dark" | "light";

/**
 * Pick the baked frame grade for the active theme. Light-background themes get
 * the ink-on-paper grade; everything else — including the pre-hydration
 * `undefined` from next-themes — gets the luminous-on-black grade.
 */
export function gradeForTheme(theme: string | undefined): SequenceGrade {
  return theme === "daylight" || theme === "manuscript" ? "light" : "dark";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/sequence-grade.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/sequence-grade.ts tests/unit/sequence-grade.test.ts
git commit -m "feat(v2): gradeForTheme — theme to frame-grade mapping (TDD)"
```

---

### Task 2: Wire frames into ScrollShowpiece

**Files:**
- Modify: `components/sections/scroll-showpiece.tsx` (full replacement below — the procedural `draw` is deleted; the engine keeps its `draw` prop for other uses)

- [ ] **Step 1: Replace the file content**

```tsx
"use client";

import { useTheme } from "next-themes";
import { ScrollSequence } from "@/components/motion/scroll-sequence";
import { gradeForTheme } from "@/lib/sequence-grade";

/**
 * The signature scroll-scrubbed cinematic: 120 baked webp frames of the
 * "Signal" film (P15) scrubbed by the ScrollSequence engine. Two grades exist;
 * `key={grade}` remounts the engine on theme switch so it decodes the right
 * one (rare event — accepted cost, see P16 spec).
 */
export function ScrollShowpiece() {
  const { theme } = useTheme();
  const grade = gradeForTheme(theme);
  return (
    <ScrollSequence
      key={grade}
      framePath={`/sequences/intelligence/${grade}/frame_`}
      frameExt="webp"
      frameCount={120}
      pad={4}
      width={1280}
      height={720}
      className="border-y border-border"
      alt="Macro film of ink droplets in fluid: scattered points align into filament currents and crystallize into an ordered neural lattice as you scroll."
      textBeats={[
        { at: 0, heading: "Data, everywhere", body: "Raw, scattered, noisy." },
        { at: 0.5, heading: "Structure emerges", body: "Patterns resolve as the model learns." },
        { at: 0.92, heading: "Intelligence", body: "Systems that turn signal into decisions." },
      ]}
    />
  );
}
```

- [ ] **Step 2: Verify gates**

Run: `npm run lint && npm run typecheck && npx vitest run`
Expected: lint clean, typecheck clean, all unit tests pass (191 = 188 + 3 new).

- [ ] **Step 3: Verify the build serves frames**

Run: `npm run build`
Expected: static export succeeds; `out/sequences/intelligence/dark/frame_0001.webp` exists.

- [ ] **Step 4: Commit**

```bash
git add components/sections/scroll-showpiece.tsx
git commit -m "feat(v2): showpiece plays Signal frames — per-theme grade via remount"
```

---

### Task 3: e2e coverage

**Files:**
- Create: `tests/e2e/showpiece.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from "@playwright/test";

// The showpiece scrubs 120 baked webp frames on a plain 2D canvas (no WebGL —
// runs in all three engines). The engine decodes every frame before painting,
// so the paint assertion polls generously for slow runners.

test.describe("cinematic showpiece", () => {
  test("canvas paints a real frame after decode", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const canvas = page.locator('canvas[role="img"]');
    await canvas.scrollIntoViewIfNeeded();
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const c = document.querySelector('canvas[role="img"]') as HTMLCanvasElement | null;
            const ctx = c?.getContext("2d");
            if (!c || !ctx) return -1;
            const { data } = ctx.getImageData(0, 0, c.width, Math.min(c.height, 200));
            let lit = 0;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] > 0 && (data[i] > 8 || data[i + 1] > 8 || data[i + 2] > 8)) lit++;
            }
            return lit;
          }),
        { timeout: 30_000 },
      )
      .toBeGreaterThan(500);
  });

  test("reduced motion: all beats readable, nothing pinned", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Beat containers carry inline opacity; under reduced motion the engine
    // sets every one to 1 (visible). Playwright's toBeVisible() ignores
    // opacity, so assert computed style instead.
    await expect
      .poll(() =>
        page.evaluate(() =>
          ["Data, everywhere", "Structure emerges", "Intelligence"].map((t) => {
            const p = Array.from(document.querySelectorAll("p")).find(
              (el) => el.textContent === t,
            );
            return p ? getComputedStyle(p.parentElement as Element).opacity : "missing";
          }),
        ),
      )
      .toEqual(["1", "1", "1"]);
    // GSAP pinning wraps the trigger in .pin-spacer; reduced motion must never pin.
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Run the new spec (all three browsers)**

Run: `npx playwright test tests/e2e/showpiece.spec.ts`
Expected: 6 passed (2 tests × chromium/firefox/webkit). If a lone failure occurs under load, re-run that project in isolation before treating it as real.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/showpiece.spec.ts
git commit -m "test(v2): e2e for cinematic showpiece — frame paint + reduced-motion contract"
```

---

## Final verification (orchestrator)

1. Full gates: `npm run lint`, `npm run typecheck`, `npx vitest run`, `npm run build`, full `npm run test:e2e`.
2. Read-only reviewer pass on the git range.
3. Playwright MCP on built `out/`: all 4 themes (midnight/neon → dark grade, daylight/manuscript → light grade — visually confirm the grade actually switches), mobile 390px, reduced motion. Read the screenshots.
4. Confirm nothing pushed; no v1 changes.
