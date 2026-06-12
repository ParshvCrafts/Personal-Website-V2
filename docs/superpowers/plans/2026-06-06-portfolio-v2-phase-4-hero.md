# Portfolio v2 — Phase 4: Hero + ScrollSequence Showpiece Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's `#top` placeholder with a real editorial **Hero** (the single `<h1>`, oversized Fraunces name, a reduced-motion-safe rotating role line, portrait, CTAs incl. résumé, socials, scroll cue, per-theme atmosphere, one staggered GSAP entrance), and wire the reusable **ScrollSequence** engine into the home page as the pinned showpiece right after the hero (refined procedural placeholder + on-brand beats). The Preloader warms the real hero portrait before reveal.

**Architecture:** `Hero` is a client component (it choreographs one `useGSAP` entrance timeline gated by `gsap.matchMedia`, and hosts the `RotatingText` primitive). It composes existing primitives (`Button`, `Magnetic`, `social-icons`, `useSmoothScroll`). The showpiece is a thin client wrapper (`ScrollShowpiece`) around the existing `ScrollSequence` (a `draw` function prop can't cross the RSC boundary, so it lives in a `"use client"` module, mirroring `app/preview/motion/placeholder-sequence.tsx`). The home page (`app/page.tsx`, a Server Component) renders `<Hero/>` then `<ScrollShowpiece/>` then the existing stub sections. All motion is reduced-motion-gated; the showpiece never pins/traps scroll under reduced motion (the engine already guarantees this).

**Tech Stack:** Next 16 (App Router, static export, `images: { unoptimized: true }`), React 19, Tailwind v4, GSAP + `@gsap/react` (`useGSAP`, timeline, `matchMedia`), Lenis, Vitest, Playwright.

---

## Context the executor needs

- Repo root: `c:\Users\p1a2r\OneDrive\Desktop\Git Hub Projects\Personal Website`. App in `v2/`. Branch `feat/portfolio-v2`. **Never touch v1.** **Do not push.** Commit locally, one per task, verbatim messages below.
- Assets already copied into v2: `v2/public/images/profile.jpg` (**1413×1785**, portrait) and `v2/public/documents/resume.pdf`. Use these. (Higher-res portrait will replace it later — keep the path stable.)
- Existing APIs to reuse (do not reinvent): `lib/motion.ts` → `gsap`, `useGSAP`, `registerGsap`, `prefersReducedMotion`; `components/ui/button.tsx` → `Button` (variants); `components/motion/magnetic.tsx` → `Magnetic`; `components/layout/social-icons.tsx` → `GithubIcon`, `LinkedinIcon`; `lucide-react` → `Mail`, `ArrowDown`, `ArrowUpRight`; `components/providers/smooth-scroll.tsx` → `useSmoothScroll`; `lib/site.ts` → `SITE`, `SOCIAL_LINKS`, `NAV_OFFSET`; `components/motion/scroll-sequence.tsx` → `ScrollSequence`. Theme tokens via Tailwind utilities (`bg-background`,`text-heading`,`text-foreground`,`text-muted`,`text-accent`,`bg-accent`,`text-on-accent`,`border-border`,`font-display`,`font-mono`, `ring-ring`).
- **GSAP discipline (gsap-* skills):** `registerGsap()` once; one `useGSAP({ scope })` per component for auto-cleanup; sequence with a single `gsap.timeline` + position params + `defaults`; animate transform/opacity only; gate ALL motion behind `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` so the reduced path leaves everything visible/static; never trap scroll.
- **Skill mandate (state how applied):** frontend-design (editorial Exaggerated-Minimalism: asymmetric split, oversized Fraunces, mono micro-labels, single accent, per-theme atmosphere, restraint — ONE entrance + ONE rotating line + ONE scroll cue), ui-ux-pro-max (single h1 + heading order, CLS-safe portrait via intrinsic width/height, ≥44px CTAs, focus-visible rings, 150–300ms micro-interactions, reduced-motion, `aria-hidden` on decorative atmosphere), gsap-timeline/core (entrance choreography, matchMedia).
- **Hero content (from v1, redesigned):** name **Parshv Patel**; eyebrow **"UC Berkeley · Data Science"**; rotating roles (below); description **"Building intelligent systems — turning data into products that think."**; CTAs **Explore Work** (→ `#projects`), **Get in touch** (→ `#contact`), **Résumé** (→ `/documents/resume.pdf`, new tab); socials GitHub/LinkedIn/Email; portrait `/images/profile.jpg`; scroll cue → first section after the showpiece.

## File Structure (this phase)

```
v2/
├─ lib/site.ts                              # MODIFY: add HERO_ROLES + nextRoleIndex()
├─ components/
│  ├─ motion/rotating-text.tsx              # NEW: reduced-motion-safe word rotator
│  └─ sections/
│     ├─ hero.tsx                           # NEW: the hero (single h1, entrance timeline)
│     └─ scroll-showpiece.tsx               # NEW: client wrapper around ScrollSequence
├─ components/layout/preloader.tsx          # MODIFY: warm the hero portrait
├─ app/page.tsx                             # MODIFY: <Hero/> + <ScrollShowpiece/> replace #top
├─ tests/
│  ├─ unit/site-roles.test.ts               # NEW: nextRoleIndex (TDD)
│  └─ e2e/hero.spec.ts                      # NEW: hero + showpiece + reduced-motion no-trap
```

---

## Task 1: Hero roles + rotation logic (`lib/site.ts`) — TDD

**Files:** Modify `v2/lib/site.ts`; Create `v2/tests/unit/site-roles.test.ts`

- [ ] **Step 1: Write the failing test `v2/tests/unit/site-roles.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { HERO_ROLES, nextRoleIndex } from "@/lib/site";

describe("hero roles", () => {
  it("has at least 3 roles, all non-empty", () => {
    expect(HERO_ROLES.length).toBeGreaterThanOrEqual(3);
    for (const r of HERO_ROLES) expect(r.trim().length).toBeGreaterThan(0);
  });
});

describe("nextRoleIndex", () => {
  it("advances by one", () => expect(nextRoleIndex(0, 4)).toBe(1));
  it("wraps at the end", () => expect(nextRoleIndex(3, 4)).toBe(0));
  it("handles a single role", () => expect(nextRoleIndex(0, 1)).toBe(0));
  it("is safe for length 0", () => expect(nextRoleIndex(0, 0)).toBe(0));
});
```

- [ ] **Step 2: Run to verify it fails** — from `v2/`: `npx vitest run tests/unit/site-roles.test.ts` → FAIL (`HERO_ROLES`/`nextRoleIndex` not exported).

- [ ] **Step 3: Append to `v2/lib/site.ts`** (after the existing `SITE` export)

```ts
/** Roles cycled in the hero's rotating line (motion-safe; static first role under RM). */
export const HERO_ROLES = [
  "Data Scientist",
  "ML Engineer",
  "Full-Stack Builder",
  "AI Researcher",
] as const;

/** Next index in a cyclic list; safe for empty lists. Pure (unit-tested). */
export function nextRoleIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}
```

- [ ] **Step 4: Run to verify it passes** — `npx vitest run tests/unit/site-roles.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add v2/lib/site.ts v2/tests/unit/site-roles.test.ts
git commit -m "feat(v2): hero roles + cyclic nextRoleIndex helper (TDD)"
```

---

## Task 2: RotatingText primitive

**Files:** Create `v2/components/motion/rotating-text.tsx`

- [ ] **Step 1: Implement `v2/components/motion/rotating-text.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { nextRoleIndex } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Cycles through `items` with a vertical slide+fade. Motion-safe only — under
 * reduced motion the first item is shown statically (no animation, no interval).
 * The visible word is masked by an overflow-hidden wrapper so it slides cleanly.
 */
export function RotatingText({
  items,
  className,
  hold = 1.8,
}: {
  items: readonly string[];
  className?: string;
  /** Seconds each word stays before rotating. */
  hold?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || items.length < 2) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let i = 0;
        const tl = gsap.timeline({ repeat: -1 });
        // one full cycle per item: hold → slide current out → swap → slide next in
        items.forEach(() => {
          tl.to(el, { yPercent: -120, opacity: 0, duration: 0.4, ease: "power2.in", delay: hold })
            .add(() => {
              i = nextRoleIndex(i, items.length);
              el.textContent = items[i];
            })
            .fromTo(
              el,
              { yPercent: 120, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
            );
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span className="inline-flex overflow-hidden align-bottom leading-[1.15]">
      <span ref={ref} className={cn("inline-block", className)}>
        {items[0]}
      </span>
    </span>
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/motion/rotating-text.tsx
git commit -m "feat(v2): RotatingText primitive (vertical cycle, reduced-motion-safe)"
```

---

## Task 3: Hero section

**Files:** Create `v2/components/sections/hero.tsx`

- [ ] **Step 1: Implement `v2/components/sections/hero.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { RotatingText } from "@/components/motion/rotating-text";
import { GithubIcon, LinkedinIcon } from "@/components/layout/social-icons";
import { SITE, SOCIAL_LINKS, HERO_ROLES, NAV_OFFSET } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Mail, ArrowDown, ArrowUpRight } from "lucide-react";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();
  registerGsap();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // One staggered entrance. Elements are visible by default (no-JS / RM safe);
        // we animate FROM a hidden state, so reduced motion simply skips this.
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
        tl.from("[data-hero='eyebrow']", { y: 16, opacity: 0 })
          .from("[data-hero='title']", { y: 28, opacity: 0 }, "<0.1")
          .from("[data-hero='role']", { y: 20, opacity: 0 }, "<0.15")
          .from("[data-hero='desc']", { y: 20, opacity: 0 }, "<0.1")
          .from("[data-hero='cta'] > *", { y: 16, opacity: 0, stagger: 0.08 }, "<0.1")
          .from("[data-hero='social'] > *", { y: 12, opacity: 0, stagger: 0.06 }, "<0.1")
          .from("[data-hero='portrait']", { scale: 1.04, opacity: 0, duration: 1 }, 0.2)
          .from("[data-hero='cue']", { opacity: 0, duration: 0.6 }, "<0.4");
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-dvh items-center overflow-hidden px-6 md:px-10"
    >
      {/* Per-theme atmosphere (decorative). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 15%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 py-24 md:grid-cols-[1.15fr_0.85fr]">
        {/* Text column */}
        <div>
          <p
            data-hero="eyebrow"
            className="font-mono text-xs uppercase tracking-[0.25em] text-accent"
          >
            UC Berkeley · Data Science
          </p>
          <h1
            data-hero="title"
            className="mt-5 font-display text-6xl leading-[0.95] text-heading md:text-8xl"
          >
            {SITE.name}
          </h1>
          <p
            data-hero="role"
            className="mt-6 flex flex-wrap items-baseline gap-x-3 font-display text-2xl text-muted md:text-3xl"
          >
            <span aria-hidden>I&apos;m a</span>
            <RotatingText items={HERO_ROLES} className="text-foreground" />
          </p>
          <p data-hero="desc" className="mt-6 max-w-xl text-lg text-muted">
            Building intelligent systems — turning data into products that think.
          </p>

          <div data-hero="cta" className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Button onClick={() => scrollTo("#projects", { offset: -NAV_OFFSET })}>
                Explore work
              </Button>
            </Magnetic>
            <Button variant="secondary" onClick={() => scrollTo("#contact", { offset: -NAV_OFFSET })}>
              Get in touch
            </Button>
            <a
              href="/documents/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Résumé
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div data-hero="social" className="mt-8 flex items-center gap-2">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LinkedinIcon className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              aria-label="Email"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Portrait column (editorial framed; CLS-safe via intrinsic ratio). */}
        <div data-hero="portrait" className="relative mx-auto w-full max-w-sm md:max-w-none">
          <div
            aria-hidden
            className="absolute -right-3 -top-3 h-full w-full rounded-xl border border-accent/40"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/profile.jpg"
            alt="Parshv Patel"
            width={1413}
            height={1785}
            fetchPriority="high"
            className="relative aspect-[1413/1785] w-full rounded-xl border border-border object-cover grayscale transition-[filter] duration-500 motion-safe:hover:grayscale-0"
          />
        </div>
      </div>

      {/* Scroll cue */}
      <button
        data-hero="cue"
        type="button"
        onClick={() => scrollTo("#about", { offset: -NAV_OFFSET })}
        className="absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Scroll to content"
      >
        Scroll
        <ArrowDown className={cn("h-4 w-4 motion-safe:animate-bounce")} aria-hidden="true" />
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed. (If `Button` has no `variant="secondary"`, check `components/ui/button.tsx` for the correct variant name and use it; do not invent one.)

- [ ] **Step 3: Commit**

```bash
git add v2/components/sections/hero.tsx
git commit -m "feat(v2): editorial Hero — single h1, rotating role, CTAs, portrait, entrance timeline"
```

---

## Task 4: ScrollShowpiece (home wrapper around the engine)

**Files:** Create `v2/components/sections/scroll-showpiece.tsx`

- [ ] **Step 1: Implement `v2/components/sections/scroll-showpiece.tsx`** (a `draw` fn can't cross the RSC boundary, so this `"use client"` wrapper holds it)

```tsx
"use client";

import { ScrollSequence } from "@/components/motion/scroll-sequence";

/**
 * Refined procedural placeholder for the signature scroll-sequence. Draws a
 * field of points that converge into an ordered lattice as you scroll — "data
 * resolving into structure". Real frames replace `draw` with `framePath` later.
 */
const draw = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  total: number,
  { width, height }: { width: number; height: number },
) => {
  const p = total > 1 ? frame / (total - 1) : 0;
  ctx.fillStyle = "#0A0F1E";
  ctx.fillRect(0, 0, width, height);

  const cols = 26;
  const rows = 16;
  const gx = width / (cols + 1);
  const gy = height / (rows + 1);
  ctx.fillStyle = "#00E5FF";
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      // each point eases from a scattered start toward its lattice position
      const seed = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
      const jitter = seed - Math.floor(seed); // 0..1
      const spread = 1 - p;
      const ox = (jitter - 0.5) * width * 0.5 * spread;
      const oy = (((seed * 0.5) % 1) - 0.5) * height * 0.5 * spread;
      const x = gx * c + ox;
      const y = gy * r + oy;
      ctx.globalAlpha = 0.25 + 0.6 * p;
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
};

export function ScrollShowpiece() {
  return (
    <ScrollSequence
      frameCount={90}
      width={1280}
      height={720}
      draw={draw}
      className="border-y border-border"
      alt="Scattered data points converging into an ordered lattice as you scroll — a placeholder for the signature sequence; real frames are dropped in later."
      textBeats={[
        { at: 0, heading: "Data, everywhere", body: "Raw, scattered, noisy." },
        { at: 0.5, heading: "Structure emerges", body: "Patterns resolve as the model learns." },
        { at: 0.92, heading: "Intelligence", body: "Systems that turn signal into decisions." },
      ]}
    />
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/sections/scroll-showpiece.tsx
git commit -m "feat(v2): ScrollShowpiece — home wrapper for the pinned sequence (procedural, RM-safe)"
```

---

## Task 5: Preloader warms the hero portrait

**Files:** Modify `v2/components/layout/preloader.tsx`

- [ ] **Step 1:** In the animated branch of the `useGSAP` effect (the `if (seen || prefersReducedMotion()) { finish(); return; }` guard is followed by `lock();` then the timeline) — immediately after `lock();`, add a portrait warm-up so it is cached before the reveal. Insert this line:

```tsx
      // Warm the hero portrait so it's decoded before the veil lifts (bounded by the
      // timeline; we never block on it).
      const heroImg = new Image();
      heroImg.src = "/images/profile.jpg";
      heroImg.decode?.().catch(() => {});
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/layout/preloader.tsx
git commit -m "feat(v2): preloader warms the hero portrait before reveal"
```

---

## Task 6: Wire Hero + ScrollShowpiece into the home page

**Files:** Modify `v2/app/page.tsx`

- [ ] **Step 1:** Replace the imports + the `#top` placeholder section in `v2/app/page.tsx`.

Add imports at the top (with the existing imports):
```tsx
import { Hero } from "@/components/sections/hero";
import { ScrollShowpiece } from "@/components/sections/scroll-showpiece";
```
Remove the `import { SITE } from "@/lib/site";`-based `#top` placeholder `<section>` (the whole `<section id="top">…</section>` block that renders the old eyebrow/h1/paragraph) and replace it with:
```tsx
        <Hero />
        <ScrollShowpiece />
```
Keep `NAV_SECTIONS` (still used for the stub sections) and the data-count `getX()` imports. The `SITE` import may become unused in `page.tsx` — if so, remove it to keep lint clean. The single `<h1>` now lives in `Hero`; the stub sections keep their `<h2>`s. The About stub (with the count `data-testid`s) and the remaining stub sections are unchanged.

- [ ] **Step 2: Build + verify** — `npm run build` → succeeds; `out/index.html` exists and contains `Parshv Patel`. `npm run lint && npm run typecheck` → clean.

- [ ] **Step 3: Commit**

```bash
git add v2/app/page.tsx
git commit -m "feat(v2): home — Hero + ScrollShowpiece replace the #top placeholder"
```

---

## Task 7: E2E + full gate sweep

**Files:** Create `v2/tests/e2e/hero.spec.ts`

- [ ] **Step 1: Implement `v2/tests/e2e/hero.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("hero + showpiece", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("renders the hero (single h1, portrait, résumé, CTAs)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("img", { name: "Parshv Patel" })).toBeVisible();
    await expect(page.getByRole("link", { name: /r[ée]sum[ée]/i })).toHaveAttribute(
      "href",
      "/documents/resume.pdf",
    );
    await expect(page.getByRole("button", { name: /explore work/i })).toBeVisible();
  });

  test("the scroll showpiece is present with its text alternative", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("img", { name: /converging into an ordered lattice/i })).toBeVisible();
  });

  test("reduced motion does not trap scrolling on the home sequence", async ({ page }) => {
    await page.goto("/");
    const beforeY = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 6000);
    await page.waitForTimeout(300);
    const afterY = await page.evaluate(() => window.scrollY);
    expect(afterY).toBeGreaterThan(beforeY + 600); // page advanced past the (non-pinned) sequence
  });
});
```

- [ ] **Step 2: Run e2e** — `npm run test:e2e` → all pass (prior suites + the 3 hero tests across chromium/firefox/webkit).

- [ ] **Step 3: Full gate sweep** — all green:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

- [ ] **Step 4: Commit**

```bash
git add v2/tests/e2e/hero.spec.ts
git commit -m "test(v2): e2e hero — single h1, portrait, résumé, showpiece, reduced-motion no-trap"
```

- [ ] **Step 5: Phase 4 checkpoint (report; do NOT push)** — report green gates; the controller will visually verify (hero across 4 themes + mobile, entrance, rotating role, showpiece scrub) before Phase 5.

---

## Self-Review (against spec §7.2 hero, §6.4 sequence, §11, ROADMAP Session 4)

- **§7.2 Hero (name Fraunces oversized, animated role, portrait, CTAs Explore/Contact/Résumé, socials, scroll cue, per-theme atmosphere)** → Task 3. ✔
- **§6.4 ScrollSequence wired as the showpiece after the hero, placeholder-first, RM never traps** → Tasks 4, 6 (engine already RM-safe; e2e asserts no-trap in Task 7). ✔
- **§6.3 preloader preloads hero media** → Task 5. ✔
- **§8/§11 single h1 + heading order, CLS-safe portrait (intrinsic 1413×1785), ≥44px CTAs, focus rings, reduced-motion full coverage** → Tasks 3, 7. ✔
- **TDD on pure logic (`nextRoleIndex`)** → Task 1. ✔
- **Restraint (frontend-design): one entrance + one rotating line + one scroll cue; transforms/opacity only** → Task 3. ✔
- **Placeholder scan:** every step has complete code; the procedural showpiece is intentional (real frames later). ✔
- **Type consistency:** `HERO_ROLES`/`nextRoleIndex`, `RotatingText` props, `Hero`, `ScrollShowpiece`, `useSmoothScroll`/`NAV_OFFSET` all consistent. ✔

## Notes carried to later phases
- Replace `/images/profile.jpg` with a higher-res editorial portrait (≥1200px) when provided — keep the path + intrinsic ratio (or update width/height) to stay CLS-safe.
- Swap the showpiece `draw` for `framePath` + numbered WebP frames when the real sequence subject is produced (engine already supports image mode with the settle-guard).
- Verify `Button` variant names against `components/ui/button.tsx` during Task 3 (use the real secondary/outline variant; don't invent).
```
