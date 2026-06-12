# Portfolio v2 — Tier-A Motion Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four taste-first, reduced-motion-safe premium animations to v2 — SplitText heading reveals (hero name + section titles), GSAP Flip transitions on the Projects filter, magnetic primary CTAs, and animated skill-proficiency bars — without changing any content or degrading accessibility/perf.

**Architecture:** Extend the existing single GSAP registration point (`v2/lib/motion.ts`) to add the SplitText + Flip plugins (both bundled-free in GSAP 3.15). Add one new reusable client primitive `SplitReveal` (mirrors the existing `Reveal` API + `gsap.matchMedia()` reduced-motion gating). Apply it and the existing `magnetic.tsx`/`Reveal` primitives at call sites. Flip wraps the Projects grid's existing filter state transition. Skill bars are a new presentational client component fed by proficiency values added to the skills content module.

**Tech Stack:** Next.js 16 (static export), TS (no `any`), Tailwind v4 semantic tokens, GSAP 3.15 + `@gsap/react` `useGSAP` + ScrollTrigger + **SplitText** (`gsap/SplitText`) + **Flip** (`gsap/Flip`), Vitest, Playwright (chromium/firefox/webkit). Every animation gated behind `(prefers-reduced-motion: no-preference)` with a static fallback.

**Open input (Task 5 only):** skill proficiency values are content the repo doesn't currently hold. Task 5 defines them in `v2/content/skills-proficiency.ts` with sensible defaults derived from existing skill grouping; the user should sanity-check the numbers before merge (flagged, non-blocking).

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `v2/lib/motion.ts` | **MODIFY** | Register SplitText + Flip alongside ScrollTrigger |
| `v2/components/motion/split-reveal.tsx` | **CREATE** | `"use client"` heading char/word reveal primitive (RM-safe) |
| `v2/tests/unit/motion-registration.test.ts` | **CREATE** | Assert plugins registered, SSR-safe |
| `v2/components/sections/hero.tsx` | **MODIFY** | Wrap hero name in `SplitReveal` |
| `v2/components/sections/*/index.tsx` (projects, hobbies, contact, about, academics, research, skills) | **MODIFY** | Section `<h2>` → `SplitReveal` (opt-in, one line each) |
| `v2/components/sections/projects/project-grid.tsx` | **MODIFY** | Capture Flip state around filter change |
| `v2/components/sections/hero.tsx` + `contact/index.tsx` | **MODIFY** | Wrap primary CTAs in existing `Magnetic` |
| `v2/content/skills-proficiency.ts` | **CREATE** | Proficiency values per skill (typed) |
| `v2/components/sections/skills/proficiency-bars.tsx` | **CREATE** | Animated on-scroll proficiency bars |
| `v2/tests/unit/skills-proficiency.test.ts` | **CREATE** | Data integrity (0–100, every skill covered) |
| `v2/tests/e2e/motion-enhancements.spec.ts` | **CREATE** | RM-static + interaction smoke (Flip count stable, bars present) |

---

## Task 1: Register SplitText + Flip plugins

**Files:**
- Modify: `v2/lib/motion.ts`
- Create: `v2/tests/unit/motion-registration.test.ts`

- [ ] **Step 1.1 — Write the failing test**

```typescript
// v2/tests/unit/motion-registration.test.ts
import { describe, it, expect, vi } from "vitest";

describe("registerGsap", () => {
  it("is SSR-safe (no window) and idempotent", async () => {
    const { registerGsap } = await import("@/lib/motion");
    // Should not throw when called repeatedly.
    expect(() => { registerGsap(); registerGsap(); }).not.toThrow();
  });

  it("re-exports SplitText and Flip", async () => {
    const mod = await import("@/lib/motion");
    expect(mod.SplitText).toBeDefined();
    expect(mod.Flip).toBeDefined();
  });
});
```

- [ ] **Step 1.2 — Run it, expect fail** (`SplitText`/`Flip` not exported yet)

```bash
cd v2 && npm test -- tests/unit/motion-registration.test.ts
```

- [ ] **Step 1.3 — Update `v2/lib/motion.ts`**

Add the imports and registration. The current file imports `gsap`, `ScrollTrigger`, `useGSAP` and registers them once. Change to:

```typescript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

let registered = false;
export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip);
  registered = true;
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
```

- [ ] **Step 1.4 — Run test (pass), typecheck, commit**

```bash
cd v2 && npm test -- tests/unit/motion-registration.test.ts && npm run typecheck
git add v2/lib/motion.ts v2/tests/unit/motion-registration.test.ts
git commit -m "feat(v2): register GSAP SplitText + Flip plugins

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `SplitReveal` heading primitive

**Files:**
- Create: `v2/components/motion/split-reveal.tsx`

Mirrors `Reveal`'s API and RM gating. Splits the heading into words/chars and staggers them in on scroll; under reduced motion the heading renders normally (no split, fully visible).

- [ ] **Step 2.1 — Create `split-reveal.tsx`**

```tsx
// v2/components/motion/split-reveal.tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, SplitText } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SplitRevealProps {
  /** The heading text. Kept as a single string so SplitText can re-split safely. */
  children: string;
  className?: string;
  /** "words" (default) or "chars". */
  unit?: "words" | "chars";
  /** Render element. Default h2. */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** id passed through for aria-labelledby wiring. */
  id?: string;
  stagger?: number;
}

export function SplitReveal({
  children,
  className,
  unit = "words",
  as: Tag = "h2",
  id,
  stagger = 0.08,
}: SplitRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = new SplitText(el, { type: unit, aria: "auto" });
        const targets = unit === "chars" ? split.chars : split.words;
        gsap.from(targets, {
          opacity: 0,
          yPercent: 120,
          duration: 0.7,
          ease: "power3.out",
          stagger,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
        return () => split.revert(); // restore original DOM (and a11y text)
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  // The full text is always in the DOM for screen readers (SplitText aria:"auto"
  // keeps an accessible copy; under reduced motion nothing splits at all).
  return (
    <Tag ref={ref as never} id={id} className={cn(className)}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2.2 — Typecheck + commit**

```bash
cd v2 && npm run typecheck && npm run lint
git add v2/components/motion/split-reveal.tsx
git commit -m "feat(v2): SplitReveal heading primitive (RM-safe word/char reveal)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Apply SplitText to hero name + section titles

**Files:**
- Modify: `v2/components/sections/hero.tsx` (hero name only — per user decision "SplitText name reveal only")
- Modify: each section `index.tsx` `<h2>` → `SplitReveal` (about, academics, research, skills, projects, hobbies, contact)

- [ ] **Step 3.1 — Hero name**

In `hero.tsx`, locate the hero name heading (the `<h1>`/display name). Replace its text node with `SplitReveal` using `as="h1"`, `unit="chars"`, preserving existing classes and any `id`. Keep the rotating-role line unchanged. (Read the file first; match its exact class string.)

- [ ] **Step 3.2 — Section titles**

For each section shell, the title is `<h2 id="<sec>-h" className="mt-4 font-display text-4xl ... md:text-6xl">Title</h2>`. Replace with:

```tsx
<SplitReveal as="h2" id="<sec>-h" unit="words" className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl">
  Title
</SplitReveal>
```

Keep the exact `id` (scroll-spy + `aria-labelledby` depend on it) and the exact class string per section. Do NOT change eyebrow/`<p>` elements.

- [ ] **Step 3.3 — Verify a11y unchanged (heading levels + ids intact), typecheck, build**

```bash
cd v2 && npm run typecheck && npm run lint && npm run build
```

- [ ] **Step 3.4 — Commit**

```bash
git add v2/components/sections/hero.tsx v2/components/sections/*/index.tsx
git commit -m "feat(v2): SplitText reveal on hero name + section titles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> **Reviewer note:** confirm each section `<h2>` keeps its `id` and the same heading level; axe heading-order must stay clean (run accessibility.spec).

---

## Task 4: Projects filter Flip transition

**Files:**
- Modify: `v2/components/sections/projects/project-grid.tsx`

Today filtering swaps `activeFilter` inside `startTransition` and the grid opacity-blinks. Add Flip so surviving cards smoothly translate/scale to their new positions when the filtered set changes. Reduced motion → instant (skip Flip).

- [ ] **Step 4.1 — Capture + animate Flip state around filter change**

In `project-grid.tsx`, import `Flip, gsap, registerGsap` from `@/lib/motion` and `useRef`. Get a ref to the grid element. Change `handleFilter` to capture Flip state before the state update and play it after commit:

```tsx
import { useState, useTransition, useId, useRef } from "react";
import { gsap, Flip, registerGsap } from "@/lib/motion";
// ...
const gridRef = useRef<HTMLDivElement>(null);
registerGsap();

function handleFilter(key: FilterKey) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !gridRef.current) {
    startTransition(() => setActiveFilter(key));
    return;
  }
  const state = Flip.getState(gridRef.current.querySelectorAll("[data-testid^='project-card-']"));
  startTransition(() => setActiveFilter(key));
  // Play after React commits the new card set.
  requestAnimationFrame(() => {
    Flip.from(state, {
      duration: 0.5,
      ease: "power2.inOut",
      scale: true,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.3 }),
    });
  });
}
```

Attach `ref={gridRef}` to the `Reveal` grid (it forwards `...rest`, so `ref`? — note: `Reveal` does not forward `ref`. Instead keep the grid as a plain element OR add a stable inner wrapper ref). **Implementation choice:** wrap the `<Reveal>` grid's cards query via a `ref` on a parent the component owns. Simplest: put `ref={gridRef}` on an outer `<div>` that contains the `<Reveal>` grid, and query cards within it. Verify the existing `data-testid="projects-grid"` stays on the grid element for e2e.

- [ ] **Step 4.2 — Typecheck, build, and run existing projects e2e (filter count must stay 12/filtered)**

```bash
cd v2 && npm run typecheck && npm run build && npm run test:e2e -- projects.spec.ts --workers=1
```

Expected: all projects tests still pass (Flip must not change card counts or testids).

- [ ] **Step 4.3 — Commit**

```bash
git add v2/components/sections/projects/project-grid.tsx
git commit -m "feat(v2): GSAP Flip transition on Projects filter (RM-safe)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Animated skill proficiency bars

**Files:**
- Create: `v2/content/skills-proficiency.ts`
- Create: `v2/components/sections/skills/proficiency-bars.tsx`
- Create: `v2/tests/unit/skills-proficiency.test.ts`
- Modify: `v2/components/sections/skills/index.tsx` (render bars alongside or in place of one badge cluster — keep badges; add bars as a "Proficiency" subsection)

> **Content note:** proficiency values below are reasonable defaults grouped by familiarity; the user should confirm. They are intentionally conservative (no 100s) to read credible.

- [ ] **Step 5.1 — Create proficiency data**

```typescript
// v2/content/skills-proficiency.ts
export interface SkillProficiency {
  name: string;
  /** 0–100 */
  level: number;
  category: "languages" | "data" | "ml" | "tools";
}

export const SKILL_PROFICIENCY: SkillProficiency[] = [
  { name: "Python", level: 92, category: "languages" },
  { name: "SQL", level: 85, category: "data" },
  { name: "JavaScript/TypeScript", level: 80, category: "languages" },
  { name: "Pandas / NumPy", level: 90, category: "data" },
  { name: "scikit-learn", level: 85, category: "ml" },
  { name: "PyTorch", level: 78, category: "ml" },
  { name: "Computer Vision (OpenCV)", level: 82, category: "ml" },
  { name: "LangChain / LLMs", level: 80, category: "ml" },
  { name: "React / Next.js", level: 75, category: "tools" },
  { name: "Git / CI", level: 85, category: "tools" },
];
```

- [ ] **Step 5.2 — Failing unit test**

```typescript
// v2/tests/unit/skills-proficiency.test.ts
import { describe, it, expect } from "vitest";
import { SKILL_PROFICIENCY } from "@/content/skills-proficiency";

describe("skill proficiency", () => {
  it("every level is within 0–100", () => {
    expect(SKILL_PROFICIENCY.every((s) => s.level >= 0 && s.level <= 100)).toBe(true);
  });
  it("has at least 8 skills with unique names", () => {
    const names = SKILL_PROFICIENCY.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBeGreaterThanOrEqual(8);
  });
});
```

```bash
cd v2 && npm test -- tests/unit/skills-proficiency.test.ts
```

- [ ] **Step 5.3 — Create `proficiency-bars.tsx`**

```tsx
// v2/components/sections/skills/proficiency-bars.tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { SKILL_PROFICIENCY } from "@/content/skills-proficiency";

export function ProficiencyBars() {
  const ref = useRef<HTMLUListElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const fills = el.querySelectorAll<HTMLElement>("[data-bar-fill]");
        gsap.from(fills, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <ul ref={ref} className="mt-8 grid gap-4 sm:grid-cols-2">
      {SKILL_PROFICIENCY.map((s) => (
        <li key={s.name}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm text-heading">{s.name}</span>
            <span className="font-mono text-xs text-muted">{s.level}%</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-elevated"
            role="meter"
            aria-valuenow={s.level}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${s.name} proficiency`}
          >
            <div
              data-bar-fill
              className="h-full rounded-full bg-accent"
              style={{ width: `${s.level}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5.4 — Render in skills section** (add a "Proficiency" subsection above/below the badge clusters; keep clusters). Use a `<h3>` to preserve heading order under the Skills `<h2>`.

- [ ] **Step 5.5 — typecheck, lint, build, commit**

```bash
cd v2 && npm run typecheck && npm run lint && npm run build
git add v2/content/skills-proficiency.ts v2/components/sections/skills/proficiency-bars.tsx v2/components/sections/skills/index.tsx v2/tests/unit/skills-proficiency.test.ts
git commit -m "feat(v2): animated skill proficiency bars (RM-safe, role=meter)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Magnetic primary CTAs

**Files:**
- Modify: `v2/components/sections/hero.tsx` (primary CTA), `v2/components/sections/contact/contact-form.tsx` or `contact/index.tsx` (submit/social)

Use the existing `v2/components/motion/magnetic.tsx` primitive (pointer-fine only; it should already no-op on touch/reduced-motion — verify). Wrap only the 1–2 primary CTAs, not every button (restraint).

- [ ] **Step 6.1 — Read `magnetic.tsx`** to confirm its API + RM/touch gating before applying.
- [ ] **Step 6.2 — Wrap hero primary CTA + contact submit** in `<Magnetic>`.
- [ ] **Step 6.3 — typecheck, lint, build, commit**

```bash
cd v2 && npm run typecheck && npm run lint && npm run build
git add v2/components/sections/hero.tsx v2/components/sections/contact/
git commit -m "feat(v2): magnetic primary CTAs (hero + contact, pointer-fine only)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: E2E + full regression

**Files:**
- Create: `v2/tests/e2e/motion-enhancements.spec.ts`

- [ ] **Step 7.1 — Spec (reduced-motion: content present + static, no traps)**

```typescript
// v2/tests/e2e/motion-enhancements.spec.ts
import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("motion enhancements (reduced motion)", () => {
  test("hero name + section titles render full text", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#projects").getByRole("heading", { level: 2 })).toHaveText("Projects");
    await expect(page.locator("#contact").getByRole("heading", { level: 2 })).toHaveText("Contact");
  });

  test("proficiency bars render with meter semantics", async ({ page }) => {
    await page.goto("/");
    const meters = page.locator("#skills [role='meter']");
    expect(await meters.count()).toBeGreaterThanOrEqual(8);
  });

  test("filtering keeps 12→subset→12 card counts (Flip safe)", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    const cards = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']");
    await expect(cards).toHaveCount(12);
    await section.getByRole("tab", { name: /computer vision/i }).click();
    expect(await cards.count()).toBeLessThan(12);
    await section.getByRole("tab", { name: /all projects/i }).click();
    await expect(cards).toHaveCount(12);
  });
});
```

- [ ] **Step 7.2 — Run new spec, then full suite (workers=1 to avoid dev-server flake)**

```bash
cd v2 && npm run test:e2e -- motion-enhancements.spec.ts --workers=1
cd v2 && npm run lint && npm run typecheck && npm test && npm run test:e2e -- --workers=1
```

Expected: all green. If a failure is a firefox/webkit `page.goto` timeout, re-run that test in isolation (known dev-server contention; test logic is deterministic).

- [ ] **Step 7.3 — Visual check (serve `out/`, screenshot 4 themes)** and confirm: titles reveal, filter morphs smoothly, bars animate, magnetic CTAs respond, nothing janky/distracting.

- [ ] **Step 7.4 — Commit + update ROADMAP/ENHANCEMENTS**

```bash
git add v2/tests/e2e/motion-enhancements.spec.ts docs/v2/ENHANCEMENTS.md docs/v2/ROADMAP.md
git commit -m "test(v2): e2e for Tier-A motion enhancements + docs update

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

| Requirement (user decisions) | Task |
|---|---|
| SplitText hero **name** reveal | Task 3.1 |
| SplitText section titles (Tier-A polish) | Task 3.2 |
| Project-filter **Flip** | Task 4 |
| Magnetic CTAs | Task 6 |
| Animated **skill proficiency bars** | Task 5 |
| Reduced-motion safe everywhere | matchMedia gating in every task |
| No content change / no a11y regression | Tasks 3 (ids/heading-order), 5 (role=meter), 7 (axe via full suite) |
| No `any`, semantic tokens | enforced throughout |

**Open item:** Task 5 proficiency numbers need a user sanity-check (flagged).
**Risk:** Flip + `Reveal` ref interplay (Task 4.1) — the plan calls for an owned wrapper ref since `Reveal` doesn't forward `ref`; reviewer must confirm `data-testid="projects-grid"` stays intact.
