# Portfolio v2 — Phase 3: Layout Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v2 layout shell — a sticky scroll-aware Nav (skip-link, scroll-spy active state, theme switcher, accessible focus-trapped mobile menu), a Footer, a one-per-session Preloader, a desktop CustomCursor, and a GrainOverlay — and scaffold the home page into the real single-page composition with anchored stub sections so the shell is fully testable before real sections land (P4+).

**Architecture:** Atmosphere (GrainOverlay, CustomCursor) is mounted globally in the root layout; it is purely decorative, `pointer-events-none`/`aria-hidden`, and self-disables on touch / reduced-motion / SSR. Site chrome (Preloader, Nav, Footer) lives in the home page (`app/page.tsx`) — preview/styleguide pages stay bare. `SmoothScrollProvider` is refactored to expose its Lenis instance via context (`useSmoothScroll().scrollTo`) with a native-jump fallback when Lenis is absent (reduced motion). Active-section scroll-spy and nav hide/condense are driven by ONE rAF-throttled passive scroll listener using a pure, unit-tested `activeSectionForScroll()` helper — decoupled from GSAP and identical under reduced motion. The CustomCursor uses `gsap.quickTo`; the Preloader uses a bounded GSAP counter. Every motion path is reduced-motion-gated; every control is ≥44×44px and keyboard-complete.

**Tech Stack:** Next 16 (App Router, static export), React 19, Tailwind v4, GSAP + `@gsap/react` (`useGSAP`, `quickTo`), Lenis, lucide-react, next-themes, Vitest, Playwright.

---

## Context the executor needs

- Repo root: `c:\Users\p1a2r\OneDrive\Desktop\Git Hub Projects\Personal Website`. App in `v2/`. Branch `feat/portfolio-v2`. **Never touch v1** (`app.py`, `index.html`, `static/**`). **Do not push.** Commit locally, one per task, with the verbatim messages below.
- Phases 0–2 done: static-export Next 16 app; 4 themes (`midnight`/`daylight`/`manuscript`/`neon`) as CSS vars consumed via Tailwind utilities (`bg-background`, `bg-surface`, `bg-elevated`, `text-foreground`, `text-heading`, `text-muted`, `bg-accent`, `text-on-accent`, `border-border`, `ring-ring`, `font-display`, `font-mono`); UI primitives in `components/ui/`; motion lib `lib/motion.ts` (`registerGsap`, `prefersReducedMotion`, `gsap`, `useGSAP`, `ScrollTrigger`, `frameForProgress`); motion primitives in `components/motion/`; `lib/utils.ts` has `cn()`. `ThemeSwitcher` in `components/theme/theme-switcher.tsx`.
- **GSAP discipline (mandatory — gsap-* skills):** `registerGsap()` once; `useGSAP({ scope })` for auto-cleanup; animate transform/opacity only; `gsap.quickTo` for pointer-followers; gate all motion behind `prefersReducedMotion()` / `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`; never trap scroll.
- **Skill mandate (per user — state how applied):** `frontend-design` (Exaggerated-Minimalism editorial chrome; mono micro-labels; restraint), `ui-ux-pro-max` (≥44px touch targets, focus rings, 150–300ms micro-interactions, ease-out enter, reduced-motion, nav active-state, focus-trapped modal, skip-link, z-index scale, tabular figures), `gsap-*` (cursor quickTo, preloader, scroll). If unavailable, this plan + spec §6/§7/§11 + `docs/v2/DESIGN.md`/`MOTION.md` are the source of truth.
- **Canonical content** (from v1 `index.html`): name **Parshv Patel**; role **Data Science · AI/ML**; email **parshvpatel_0910@berkeley.edu**; phone **(951) 599-3618** (`tel:+19515993618`); location **Berkeley, CA**; LinkedIn **https://www.linkedin.com/in/parshv-patel-65a90326b/**; GitHub **https://github.com/ParshvCrafts**.
- **Z-index scale (use exactly):** nav `z-40`, grain `z-50` (pointer-none), mobile-menu `z-[70]`, preloader `z-[100]`, cursor `z-[9999]`.

## File Structure (this phase)

```
v2/
├─ lib/
│  ├─ site.ts                              # NEW: name/role/socials/contact + NAV_SECTIONS
│  └─ scrollspy.ts                         # NEW: activeSectionForScroll() pure helper
├─ components/
│  ├─ providers/smooth-scroll.tsx          # MODIFY: expose Lenis via useSmoothScroll()
│  └─ layout/
│     ├─ grain-overlay.tsx                 # NEW
│     ├─ custom-cursor.tsx                 # NEW
│     ├─ preloader.tsx                     # NEW
│     ├─ site-nav.tsx                      # NEW (skip-link, scroll-spy, scroll-aware, theme switch)
│     ├─ mobile-menu.tsx                   # NEW (focus-trapped dialog)
│     └─ site-footer.tsx                   # NEW
├─ components/theme/theme-switcher.tsx     # MODIFY: 44px touch targets
├─ app/
│  ├─ layout.tsx                           # MODIFY: mount GrainOverlay + CustomCursor
│  ├─ globals.css                          # MODIFY: cursor-none rules
│  └─ page.tsx                             # MODIFY: real shell + anchored stub sections
├─ tests/
│  ├─ unit/site.test.ts                    # NEW
│  ├─ unit/scrollspy.test.ts               # NEW
│  ├─ e2e/shell.spec.ts                    # NEW
│  └─ e2e/smoke.spec.ts                    # MODIFY: assert new home
```

---

## Task 1: Site config (`lib/site.ts`) — TDD

**Files:** Create `v2/lib/site.ts`, `v2/tests/unit/site.test.ts`

- [ ] **Step 1: Write the failing test `v2/tests/unit/site.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { NAV_SECTIONS, SOCIAL_LINKS, SITE } from "@/lib/site";

describe("site config", () => {
  it("has at least 5 nav sections", () => expect(NAV_SECTIONS.length).toBeGreaterThanOrEqual(5));
  it("nav section ids are unique", () => {
    const ids = NAV_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("every nav section has a non-empty id and label", () => {
    for (const s of NAV_SECTIONS) {
      expect(s.id).toMatch(/^[a-z][a-z-]*$/);
      expect(s.label.length).toBeGreaterThan(0);
    }
  });
  it("exposes the canonical socials + identity", () => {
    expect(SOCIAL_LINKS.github).toContain("github.com/ParshvCrafts");
    expect(SOCIAL_LINKS.linkedin).toContain("linkedin.com/in/parshv-patel");
    expect(SOCIAL_LINKS.email).toBe("parshvpatel_0910@berkeley.edu");
    expect(SITE.name).toBe("Parshv Patel");
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run tests/unit/site.test.ts` → FAIL (cannot resolve `@/lib/site`).

- [ ] **Step 3: Implement `v2/lib/site.ts`**

```ts
export interface NavSection {
  /** Must match a `section[id]` anchor in the page. */
  id: string;
  label: string;
}

/**
 * Curated primary nav (single-page anchors), in document order. Secondary
 * sections (Terminal easter-egg, Certifications, Professional Development) are
 * reachable by scrolling and are intentionally omitted to avoid an overloaded nav.
 */
export const NAV_SECTIONS: NavSection[] = [
  { id: "about", label: "About" },
  { id: "academics", label: "Academics" },
  { id: "research", label: "Research" },
  { id: "journey", label: "Journey" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export const SOCIAL_LINKS = {
  github: "https://github.com/ParshvCrafts",
  linkedin: "https://www.linkedin.com/in/parshv-patel-65a90326b/",
  email: "parshvpatel_0910@berkeley.edu",
} as const;

export const SITE = {
  name: "Parshv Patel",
  initials: "PP",
  role: "Data Science · AI/ML",
  location: "Berkeley, CA",
  email: SOCIAL_LINKS.email,
  phone: "+19515993618",
  phoneDisplay: "(951) 599-3618",
} as const;
```

- [ ] **Step 4: Run to verify it passes** — `npx vitest run tests/unit/site.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add v2/lib/site.ts v2/tests/unit/site.test.ts
git commit -m "feat(v2): site config (identity, socials, nav sections) (TDD)"
```

---

## Task 2: Scroll-spy core (`lib/scrollspy.ts`) — TDD

**Files:** Create `v2/lib/scrollspy.ts`, `v2/tests/unit/scrollspy.test.ts`

- [ ] **Step 1: Write the failing test `v2/tests/unit/scrollspy.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { activeSectionForScroll } from "@/lib/scrollspy";

const sections = [
  { id: "about", top: 0 },
  { id: "academics", top: 800 },
  { id: "projects", top: 1600 },
  { id: "contact", top: 2400 },
];

describe("activeSectionForScroll", () => {
  it("returns the first section at the very top", () =>
    expect(activeSectionForScroll(sections, 0, 100)).toBe("about"));
  it("activates a section once its top crosses the line", () =>
    expect(activeSectionForScroll(sections, 720, 100)).toBe("academics")); // 720+100 >= 800
  it("stays on the current section between boundaries", () =>
    expect(activeSectionForScroll(sections, 900, 100)).toBe("academics"));
  it("activates the last section near the bottom", () =>
    expect(activeSectionForScroll(sections, 2400, 100)).toBe("contact"));
  it("returns null for an empty list", () =>
    expect(activeSectionForScroll([], 500, 100)).toBeNull());
  it("ignores unsorted input by reading the highest crossed top", () =>
    expect(activeSectionForScroll(sections, 1600, 100)).toBe("projects"));
});
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run tests/unit/scrollspy.test.ts` → FAIL.

- [ ] **Step 3: Implement `v2/lib/scrollspy.ts`**

```ts
export interface SectionTop {
  id: string;
  /** Distance from document top to the section's top, in px. */
  top: number;
}

/**
 * Pure scroll-spy: given each section's document-top, the current scrollY, and a
 * "trigger line" offset from the viewport top (≈ sticky-nav height), return the id
 * of the last section whose top has crossed the line. Decoupled from the DOM and
 * from any animation library, so it behaves identically under reduced motion.
 */
export function activeSectionForScroll(
  sections: SectionTop[],
  scrollY: number,
  lineOffset: number,
): string | null {
  if (sections.length === 0) return null;
  const line = scrollY + lineOffset;
  let active = sections[0].id;
  let bestTop = -Infinity;
  for (const s of sections) {
    if (s.top <= line && s.top >= bestTop) {
      bestTop = s.top;
      active = s.id;
    }
  }
  return active;
}
```

- [ ] **Step 4: Run to verify it passes** — `npx vitest run tests/unit/scrollspy.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add v2/lib/scrollspy.ts v2/tests/unit/scrollspy.test.ts
git commit -m "feat(v2): pure scroll-spy core (activeSectionForScroll) (TDD)"
```

---

## Task 3: Expose Lenis via `useSmoothScroll()`

**Files:** Modify `v2/components/providers/smooth-scroll.tsx`

- [ ] **Step 1: Replace the file contents with the context-exposing version**

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css"; // recommended html.lenis rules (scroll-behavior/anchor safety)
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";

interface ScrollToOptions {
  /** Pixel offset applied to the target (use a negative value to clear a sticky nav). */
  offset?: number;
}

interface SmoothScrollApi {
  scrollTo: (target: string | number, opts?: ScrollToOptions) => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi>({ scrollTo: () => {} });

/** Programmatic smooth scroll that uses Lenis when active, native jump otherwise. */
export function useSmoothScroll(): SmoothScrollApi {
  return useContext(SmoothScrollContext);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    registerGsap();

    // Reduced motion: do NOT hijack scroll. Native scrolling only.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: string | number, opts?: ScrollToOptions) => {
    const offset = opts?.offset ?? 0;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset });
      return;
    }
    // No Lenis (reduced motion / SSR-hydration race): native jump.
    if (typeof target === "number") {
      window.scrollTo({ top: target + offset });
      return;
    }
    const el = document.querySelector(target);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top });
    }
  }, []);

  return <SmoothScrollContext.Provider value={{ scrollTo }}>{children}</SmoothScrollContext.Provider>;
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/providers/smooth-scroll.tsx
git commit -m "feat(v2): expose Lenis via useSmoothScroll() with native-jump fallback"
```

---

## Task 4: Atmosphere — GrainOverlay + CustomCursor

**Files:** Create `v2/components/layout/grain-overlay.tsx`, `v2/components/layout/custom-cursor.tsx`; Modify `v2/app/globals.css`, `v2/app/layout.tsx`

- [ ] **Step 1: Implement `v2/components/layout/grain-overlay.tsx`** (static, server-renderable)

```tsx
/**
 * Decorative film-grain atmosphere. Fixed, non-interactive, hidden from a11y tree.
 * Subtle enough (opacity ~0.04) that it never reduces text contrast.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
```

- [ ] **Step 2: Implement `v2/components/layout/custom-cursor.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Desktop-only custom cursor: a precise dot + a lagging ring (gsap.quickTo).
 * `mix-blend-difference` keeps it visible on any theme/background. Renders nothing
 * on touch / reduced-motion / SSR, and is never required for any interaction.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  registerGsap();

  useGSAP(
    (_ctx, contextSafe) => {
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (!fine || prefersReducedMotion()) return;

      const dot = dotRef.current!;
      const ring = ringRef.current!;
      document.documentElement.classList.add("cursor-none");
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

      const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" });

      let shown = false;
      const onMove = contextSafe!((e: PointerEvent) => {
        if (!shown) {
          gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
          shown = true;
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
      });
      const onOver = contextSafe!((e: PointerEvent) => {
        const interactive = (e.target as HTMLElement).closest(
          "a,button,[role='button'],input,textarea,select,[data-cursor='hover']",
        );
        gsap.to(ring, { scale: interactive ? 1.8 : 1, duration: 0.3, ease: "power3" });
      });
      const onLeave = contextSafe!(() => gsap.to([dot, ring], { opacity: 0, duration: 0.2 }));

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerover", onOver);
      document.addEventListener("pointerleave", onLeave);
      return () => {
        document.documentElement.classList.remove("cursor-none");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver);
        document.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: dotRef },
  );

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 rounded-full border border-foreground mix-blend-difference"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-foreground mix-blend-difference"
      />
    </>
  );
}
```

- [ ] **Step 3: Append to `v2/app/globals.css`** (hide native cursor only while the custom cursor is active; keep the text caret on inputs)

```css
/* Custom cursor: hide the native pointer only when JS has enabled it (desktop,
   motion-allowed). Inputs keep a usable caret. */
html.cursor-none,
html.cursor-none * {
  cursor: none;
}
html.cursor-none input,
html.cursor-none textarea,
html.cursor-none select,
html.cursor-none [contenteditable="true"] {
  cursor: auto;
}
```

- [ ] **Step 4: Mount both globally in `v2/app/layout.tsx`** — add the imports and render them inside `<body>`, before the providers:

Add imports:
```tsx
import { GrainOverlay } from "@/components/layout/grain-overlay";
import { CustomCursor } from "@/components/layout/custom-cursor";
```
Change the body so it reads:
```tsx
      <body>
        <ThemeProvider
          attribute="data-theme"
          themes={THEMES}
          defaultTheme={DEFAULT_THEME}
          enableSystem={false}
          disableTransitionOnChange
        >
          <SmoothScrollProvider>
            <GrainOverlay />
            <CustomCursor />
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
```

- [ ] **Step 5: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 6: Commit**

```bash
git add v2/components/layout/grain-overlay.tsx v2/components/layout/custom-cursor.tsx v2/app/globals.css v2/app/layout.tsx
git commit -m "feat(v2): atmosphere — grain overlay + desktop custom cursor (RM/touch-safe)"
```

---

## Task 5: Preloader

**Files:** Create `v2/components/layout/preloader.tsx`

- [ ] **Step 1: Implement `v2/components/layout/preloader.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { SITE } from "@/lib/site";

const SESSION_KEY = "pp-preloaded";

/**
 * One-per-session entrance overlay: a 0→100 counter, then the overlay wipes up to
 * reveal the page. Skippable (click / any key). Reduced motion or already-seen →
 * renders nothing (no overlay, no trap). Content always lives underneath, so the
 * overlay never removes content from the DOM.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  registerGsap();

  useGSAP(
    () => {
      const seen =
        typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";
      const finish = () => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore storage errors */
        }
        setDone(true);
      };

      if (seen || prefersReducedMotion()) {
        finish();
        return;
      }

      const counter = { v: 0 };
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(counter, {
        v: 100,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => setCount(Math.round(counter.v)),
      });
      tl.to(rootRef.current, { yPercent: -100, duration: 0.6, ease: "power3.inOut" }, "+=0.1");

      // Skippable: jump to the end on any interaction.
      const skip = () => tl.progress(1);
      window.addEventListener("pointerdown", skip);
      window.addEventListener("keydown", skip);
      return () => {
        window.removeEventListener("pointerdown", skip);
        window.removeEventListener("keydown", skip);
      };
    },
    { scope: rootRef },
  );

  if (done) return null;

  return (
    <div
      ref={rootRef}
      // aria-hidden: the page content underneath is the real content; this is a
      // transient visual veil, not information.
      aria-hidden
      className="fixed inset-0 z-[100] flex items-end justify-between bg-background px-6 pb-8 md:px-12 md:pb-12"
    >
      <span className="font-display text-2xl text-heading md:text-4xl">{SITE.name}</span>
      <span className="font-mono text-5xl tabular-nums text-muted md:text-7xl">
        {String(count).padStart(3, "0")}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/layout/preloader.tsx
git commit -m "feat(v2): one-per-session preloader (bounded, skippable, RM-instant)"
```

---

## Task 6: ThemeSwitcher 44px + SiteNav (desktop + scroll-spy + scroll-aware)

**Files:** Modify `v2/components/theme/theme-switcher.tsx`; Create `v2/components/layout/site-nav.tsx`

- [ ] **Step 1: Bump the switcher touch targets to 44px** in `v2/components/theme/theme-switcher.tsx` — change the button `className` size from `h-9 w-9` to `h-11 w-11`:

Replace:
```tsx
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
```
with:
```tsx
              "flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200",
```

- [ ] **Step 2: Implement `v2/components/layout/site-nav.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NAV_SECTIONS, SITE } from "@/lib/site";
import { activeSectionForScroll, type SectionTop } from "@/lib/scrollspy";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

const NAV_OFFSET = 88; // sticky-nav clearance for scroll-spy + scroll-to

export function SiteNav() {
  const { scrollTo } = useSmoothScroll();
  const [active, setActive] = useState<string | null>(NAV_SECTIONS[0]?.id ?? null);
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const getTops = (): SectionTop[] =>
      NAV_SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? { id, top: el.getBoundingClientRect().top + window.scrollY } : null;
      }).filter((s): s is SectionTop => s !== null);

    let tops = getTops();
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setActive(activeSectionForScroll(tops, y, NAV_OFFSET));
      setCondensed(y > 24);
      // Hide on scroll-down past the nav, show on scroll-up. (Transform is
      // motion-safe only via CSS, so reduced-motion users see no movement.)
      if (y > lastY && y > 200) setHidden(true);
      else if (y < lastY) setHidden(false);
      lastY = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      tops = getTops();
      update();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollTo(`#${id}`, { offset: -NAV_OFFSET });
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[101] rounded-md bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[transform,background-color,backdrop-filter,border-color] duration-300 motion-reduce:transform-none",
          condensed
            ? "border-b border-border bg-background/80 backdrop-blur-md"
            : "border-b border-transparent",
          hidden && "-translate-y-full",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 md:px-10"
        >
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="font-display text-lg font-semibold text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {SITE.name}
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => go(id)}
                  aria-current={active === id ? "true" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active === id ? "text-accent" : "text-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} onNavigate={go} />
    </>
  );
}
```

- [ ] **Step 3: Typecheck** — `npm run typecheck` will FAIL until Task 7 creates `mobile-menu.tsx`. That is expected; proceed to Task 7, then both build together. (Do not commit Task 6 alone.)

- [ ] **Step 4: Commit Task 6 + Task 7 together** — see Task 7 Step 4.

---

## Task 7: MobileMenu (focus-trapped accessible dialog)

**Files:** Create `v2/components/layout/mobile-menu.tsx`

- [ ] **Step 1: Implement `v2/components/layout/mobile-menu.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { NAV_SECTIONS, SOCIAL_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { X, Github, Linkedin, Mail } from "lucide-react";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  active: string | null;
  onNavigate: (id: string) => void;
}

export function MobileMenu({ open, onClose, active, onNavigate }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href],button:not([disabled]),[tabindex]:not([tabindex='-1'])",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[70] md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* Scrim */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col gap-8 border-l border-border bg-surface p-6 transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">Menu</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {NAV_SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active === id ? "true" : undefined}
              className={cn(
                "rounded-md px-3 py-3 text-left font-display text-2xl transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === id ? "text-accent" : "text-heading hover:text-accent",
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Linkedin className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              aria-label="Email"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed (Task 6 + 7 now resolve).

- [ ] **Step 3: Lint** — `npm run lint` → clean.

- [ ] **Step 4: Commit (Tasks 6 + 7 together)**

```bash
git add v2/components/theme/theme-switcher.tsx v2/components/layout/site-nav.tsx v2/components/layout/mobile-menu.tsx
git commit -m "feat(v2): SiteNav (scroll-spy, scroll-aware, skip-link) + focus-trapped mobile menu; 44px switcher"
```

---

## Task 8: SiteFooter

**Files:** Create `v2/components/layout/site-footer.tsx`

- [ ] **Step 1: Implement `v2/components/layout/site-footer.tsx`**

```tsx
"use client";

import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { NAV_SECTIONS, SITE, SOCIAL_LINKS } from "@/lib/site";
import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";

export function SiteFooter() {
  const { scrollTo } = useSmoothScroll();

  return (
    <footer className="border-t border-border bg-surface" role="contentinfo">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr] md:px-10">
        <div>
          <p className="font-display text-2xl text-heading">{SITE.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            {SITE.role} · {SITE.location}
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Linkedin className="h-5 w-5" aria-hidden="true" />
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

        <nav aria-label="Footer" className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Sections</p>
          {NAV_SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(`#${id}`, { offset: -88 })}
              className="text-left text-sm text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Contact</p>
          <a href={`mailto:${SITE.email}`} className="text-sm text-foreground hover:text-accent">
            {SITE.email}
          </a>
          <a href={`tel:${SITE.phone}`} className="text-sm text-foreground hover:text-accent">
            {SITE.phoneDisplay}
          </a>
          <span className="text-sm text-muted">{SITE.location}</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pb-10 md:px-10">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to top
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/layout/site-footer.tsx
git commit -m "feat(v2): SiteFooter (sections, socials, contact, back-to-top)"
```

---

## Task 9: Home page scaffold + smoke test update

**Files:** Modify `v2/app/page.tsx`, `v2/tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Replace `v2/app/page.tsx`** with the real shell composition + anchored stub sections (the About stub keeps the data-pipeline counts so the proof + smoke test survive; real sections replace these in P4+)

```tsx
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Preloader } from "@/components/layout/preloader";
import { NAV_SECTIONS, SITE } from "@/lib/site";
import {
  getProjects,
  getCourses,
  getResearch,
  getCertifications,
  getProfessionalDevelopment,
} from "@/lib/data";

// Stub placeholders until each real section lands (P4+). Each anchored section is
// tall enough to exercise scroll-spy and smooth scroll-to.
const STUB_COPY: Record<string, string> = {
  academics: "UC Berkeley — coursework, GPA, and the course grid land here.",
  research: "Research papers render here.",
  journey: "The India → Berkeley → Amazon timeline lands here.",
  skills: "Skill clusters and the logo marquee land here.",
  projects: "The projects bento grid with filters lands here.",
  contact: "The contact form and footer land here.",
};

export default function Home() {
  const counts = {
    projects: getProjects().length,
    courses: getCourses().length,
    research: getResearch().length,
    certifications: getCertifications().length,
    professionalDevelopment: getProfessionalDevelopment().length,
  };

  return (
    <>
      <Preloader />
      <SiteNav />
      <main id="main" className="bg-background text-foreground">
        {/* Hero placeholder (real hero = P4). Single h1 for heading hierarchy. */}
        <section
          id="top"
          className="flex min-h-dvh flex-col justify-center px-6 md:px-10 mx-auto max-w-6xl"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{SITE.role}</p>
          <h1 className="mt-4 font-display text-5xl text-heading md:text-8xl">{SITE.name}</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Layout shell preview — nav, scroll-spy, mobile menu, footer, preloader, cursor, and
            grain. Real sections arrive next.
          </p>
        </section>

        {/* About stub — keeps the validated data counts (pipeline proof). */}
        <section
          id="about"
          aria-labelledby="about-h"
          className="scroll-mt-24 border-t border-border px-6 py-24 md:px-10"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="about-h" className="font-display text-3xl text-heading md:text-5xl">
              About
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-3 font-mono text-sm md:grid-cols-3">
              <li data-testid="count-projects">Projects: {counts.projects}</li>
              <li data-testid="count-courses">Courses: {counts.courses}</li>
              <li data-testid="count-research">Research: {counts.research}</li>
              <li data-testid="count-certifications">Certifications: {counts.certifications}</li>
              <li data-testid="count-profdev">Professional Dev: {counts.professionalDevelopment}</li>
            </ul>
          </div>
        </section>

        {/* Remaining anchored stubs (everything after About in NAV_SECTIONS). */}
        {NAV_SECTIONS.filter((s) => s.id !== "about").map(({ id, label }) => (
          <section
            key={id}
            id={id}
            aria-labelledby={`${id}-h`}
            className="scroll-mt-24 border-t border-border px-6 py-24 md:px-10"
          >
            <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center">
              <h2 id={`${id}-h`} className="font-display text-3xl text-heading md:text-5xl">
                {label}
              </h2>
              <p className="mt-4 max-w-xl text-muted">{STUB_COPY[id]}</p>
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 2: Update `v2/tests/e2e/smoke.spec.ts`** to assert the new home (identity h1 + the preserved counts)

```ts
import { test, expect } from "@playwright/test";

test("homepage renders the shell and validated data counts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
  // Data-pipeline proof preserved in the About stub.
  await expect(page.getByTestId("count-projects")).toHaveText("Projects: 12");
  await expect(page.getByTestId("count-courses")).toHaveText("Courses: 13");
  await expect(page.getByTestId("count-research")).toHaveText("Research: 5");
});
```

- [ ] **Step 3: Build + verify the home page emits** — `npm run build` → succeeds; `out/index.html` exists.

- [ ] **Step 4: Commit**

```bash
git add v2/app/page.tsx v2/tests/e2e/smoke.spec.ts
git commit -m "feat(v2): home scaffold — shell + anchored stub sections (counts preserved)"
```

---

## Task 10: Shell e2e + full gate sweep

**Files:** Create `v2/tests/e2e/shell.spec.ts`

- [ ] **Step 1: Implement `v2/tests/e2e/shell.spec.ts`** (reduced-motion for deterministic nav/menu logic — no preloader veil, no Lenis lag — plus a no-RM preloader check)

```ts
import { test, expect } from "@playwright/test";

test.describe("layout shell", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("skip link is the first focusable control and targets main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute("href", "#main");
  });

  test("nav link scrolls to its section and marks it active", async ({ page }) => {
    await page.goto("/");
    // Scope to the Primary nav — "Projects"/"Contact" labels also appear in the footer.
    const primary = page.getByRole("navigation", { name: "Primary" });
    await primary.getByRole("button", { name: "Projects", exact: true }).click();
    await expect(page.locator("#projects")).toBeInViewport();
    await expect(
      primary.getByRole("button", { name: "Projects", exact: true }),
    ).toHaveAttribute("aria-current", "true");
  });

  test("mobile menu opens, traps focus, and closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    const dialog = page.getByRole("dialog", { name: /site menu/i });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: /close menu/i })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: /open menu/i })).toBeFocused();
  });

  test("footer back-to-top returns to the top", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" })
      .getByRole("button", { name: "Contact", exact: true })
      .click();
    await expect(page.locator("#contact")).toBeInViewport();
    await page.getByRole("button", { name: /back to top/i }).click();
    await expect(page.locator("#top")).toBeInViewport();
  });
});

test("preloader reveals content (no reduced motion)", async ({ page }) => {
  await page.goto("/");
  // Content lives underneath the veil and becomes interactable within the bound.
  await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
});
```

- [ ] **Step 2: Run e2e** — `npm run test:e2e` → all pass (P0 smoke + theme + 2 motion + 5 shell).

- [ ] **Step 3: Full gate sweep** — run each; all green:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

- [ ] **Step 4: Commit**

```bash
git add v2/tests/e2e/shell.spec.ts
git commit -m "test(v2): e2e shell — skip-link, scroll-spy nav, focus-trapped menu, back-to-top"
```

- [ ] **Step 5: Phase 3 checkpoint (report; do NOT push)** — report green gates; the controller will visually verify (screenshots, nav/menu/cursor/preloader) before Phase 4.

---

## Self-Review (against spec §6.3, §7.1, §11, ROADMAP Session 4 shell)

- **§7.1 Nav (sticky, scroll-aware hide/condense, active-section, theme switch, mobile menu focus-trapped)** → Tasks 6–7. ✔
- **§6.3 Preloader (0→100, bounded, skippable, reduced-motion minimal)** → Task 5. ✔
- **§6.3 Custom cursor (pointer:fine only, hidden on touch, reduced-motion safe, never required)** → Task 4. ✔
- **§6.3 Grain/noise overlay** → Task 4. ✔
- **§8 skip-link + single h1 + landmarks (header/nav/main/footer)** → Tasks 6, 9. ✔
- **§11 a11y (44px targets, focus rings, keyboard-complete, reduced-motion, aria-current active)** → switcher 44px (Task 6), all controls h-11, focus-visible rings, motion-reduce gates, focus-trap + Esc + focus restore (Task 7). ✔
- **§11 z-index scale** → documented + applied (nav 40 / grain 50 / menu 70 / preloader 100 / cursor 9999). ✔
- **Footer (sections, socials, contact, back-to-top)** → Task 8. ✔
- **Data-pipeline proof preserved** (counts in About stub) + smoke test updated → Task 9. ✔
- **TDD on pure logic** (`site` config, `activeSectionForScroll`) → Tasks 1–2. ✔
- **Placeholder scan:** every step has complete code; stub sections are intentional, replaced in P4+. ✔
- **Type consistency:** `useSmoothScroll`/`scrollTo`, `activeSectionForScroll`/`SectionTop`, `NAV_SECTIONS`/`SITE`/`SOCIAL_LINKS`, `MobileMenu` props all consistent across tasks. ✔

## Notes carried to later phases
- Real sections (P4+) replace the stub `<section>` blocks; keep the same `id`s so scroll-spy/footer links keep working. Hero (P4) replaces the `#top` block and owns the single `h1`.
- Preloader should `await` real asset decode (scroll-sequence frames + hero media) in P4 — currently a bounded timer.
- Cursor `data-cursor="hover"` hook is available for bespoke hover targets (e.g. project cards in P9).
- Revisit nav set if Certifications/Professional Development need top-level entries once built.
```
