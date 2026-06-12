# Portfolio v2 — Phase 2: Motion Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v2 motion foundation — Lenis smooth scroll synced to GSAP, a reduced-motion master gate, reusable motion primitives (Reveal, Parallax, TextReveal, Magnetic, Marquee, CountUp, TiltCard), and the reusable, performance-safe `ScrollSequence` engine (canvas frame-scrub with pin/release) demonstrated with a procedural placeholder — all on a `/preview/motion` page.

**Architecture:** `lib/motion.ts` centralizes GSAP plugin registration (idempotent, client-only) and exports pure helpers (`prefersReducedMotion`, `frameForProgress`). A client `SmoothScrollProvider` runs Lenis on GSAP's ticker (skipped entirely under reduced motion → native scroll, never a scroll trap) and is wired into the root layout. Every primitive is a client component that animates via `useGSAP` with a scoped ref and auto-cleanup, gating motion through `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` so the reduced-motion path leaves content fully visible and static. `ScrollSequence` pins a section and scrubs a canvas: it supports an image-frame mode (real assets later) and a procedural `draw(ctx, frame, total, dims)` mode (used now for a testable placeholder), sharing one ScrollTrigger. Pure logic (frame math) is unit-tested; behavior (no scroll-trap under reduced motion, section renders, scroll proceeds) is e2e-tested.

**Tech Stack:** GSAP + ScrollTrigger + @gsap/react (`useGSAP`), Lenis, React 19, Next 16 (App Router, static export), Vitest + @testing-library/react + jsdom, Playwright.

---

## Context the executor needs

- Repo root: `c:\Users\p1a2r\OneDrive\Desktop\Git Hub Projects\Personal Website`. App in `v2/`. Branch `feat/portfolio-v2`. **Never touch v1.** **Do not push.** Commit locally, one per task.
- Phases 0–1 done: static-export Next 16 app, validated data pipeline, design system with 4 themes (`midnight`/`daylight`/`manuscript`/`neon`), primitives, `/preview`, green gates (lint/typecheck/52+ unit tests/build/e2e). Theme tokens are CSS vars (`--accent`, `--foreground`, etc.) consumed via Tailwind utilities (`bg-accent`, `text-foreground`).
- **Next 16 caveat (`v2/AGENTS.md`):** breaking changes vs older knowledge. Before Next-specific wiring, skim `v2/node_modules/next/dist/docs/`. All GSAP code MUST be client-only (`"use client"`), never run during SSR.
- **GSAP skill rules (mandatory — use the gsap-* skills):**
  - `gsap.registerPlugin(useGSAP, ScrollTrigger)` once before use.
  - In React, use `useGSAP()` from `@gsap/react` with a `scope` ref → automatic cleanup. Do not run GSAP in SSR.
  - Animate **transform/opacity only**; `will-change` only on animating elements; use `gsap.quickTo()` for pointer-followers.
  - Reduced motion is the master gate via `gsap.matchMedia()`; the reduced path must leave content visible and must NOT pin/scrub/trap scroll.
  - ScrollTrigger on the timeline/top-level tween only; `ease: "none"` for scrubbed/container animations; `ScrollTrigger.refresh()` only on real layout change.
- **Skill mandate (per user):** consult **gsap-scrolltrigger**, **gsap-react**, **gsap-performance**, **gsap-core/timeline**, **frontend-design** (motion restraint — 1–2 key animations per view), **ui-ux-pro-max** (animation 150–300ms for micro-interactions, easing, reduced-motion). If unavailable, this plan + spec §6 + `docs/v2/DESIGN.md` are the source of truth. Motion is **purposeful and sparse**, never decorative noise.

## File Structure (this phase)

```
v2/
├─ lib/motion.ts                         # NEW: gsap registration + pure helpers
├─ components/
│  ├─ providers/smooth-scroll.tsx        # NEW: Lenis + GSAP ticker (RM-gated)
│  └─ motion/
│     ├─ reveal.tsx                       # NEW
│     ├─ parallax.tsx                     # NEW
│     ├─ text-reveal.tsx                  # NEW
│     ├─ magnetic.tsx                     # NEW
│     ├─ marquee.tsx                      # NEW
│     ├─ count-up.tsx                     # NEW
│     ├─ tilt-card.tsx                    # NEW
│     └─ scroll-sequence.tsx              # NEW: canvas frame-scrub engine
├─ app/
│  ├─ layout.tsx                          # MODIFY: wrap children in SmoothScrollProvider
│  └─ preview/motion/page.tsx             # NEW: motion styleguide + placeholder sequence
├─ tests/
│  ├─ unit/motion.test.ts                 # NEW: frameForProgress + helpers (TDD)
│  ├─ unit/count-up.test.ts               # NEW: number formatting
│  └─ e2e/motion.spec.ts                  # NEW: reduced-motion no-trap + section present
```

---

## Task 1: GSAP/Lenis deps + `lib/motion.ts` helpers (TDD on pure logic)

**Files:** install deps; Create `v2/lib/motion.ts`, `v2/tests/unit/motion.test.ts`

- [ ] **Step 1: Install (from `v2/`)**

```bash
npm install gsap @gsap/react lenis
```

- [ ] **Step 2: Write the failing test `v2/tests/unit/motion.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { frameForProgress } from "@/lib/motion";

describe("frameForProgress", () => {
  it("maps 0 → first frame", () => expect(frameForProgress(0, 120)).toBe(0));
  it("maps 1 → last frame", () => expect(frameForProgress(1, 120)).toBe(119));
  it("maps 0.5 → middle frame", () => expect(frameForProgress(0.5, 121)).toBe(60));
  it("clamps below 0", () => expect(frameForProgress(-0.2, 50)).toBe(0));
  it("clamps above 1", () => expect(frameForProgress(1.5, 50)).toBe(49));
  it("single-frame sequence is always 0", () => expect(frameForProgress(0.7, 1)).toBe(0));
  it("rounds to nearest frame", () => expect(frameForProgress(0.51, 11)).toBe(5));
});
```

- [ ] **Step 3: Run to verify it fails**

Run (from `v2/`): `npx vitest run tests/unit/motion.test.ts`
Expected: FAIL — cannot resolve `@/lib/motion`.

- [ ] **Step 4: Implement `v2/lib/motion.ts`**

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Register GSAP plugins exactly once, client-only. Safe to call from any client component. */
export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  registered = true;
}

/** True when the user asked for reduced motion. Always false on the server. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Map a scroll progress in [0,1] to a frame index in [0, frameCount-1]. Pure + clamped. */
export function frameForProgress(progress: number, frameCount: number): number {
  if (frameCount <= 1) return 0;
  const idx = Math.round(progress * (frameCount - 1));
  return Math.min(frameCount - 1, Math.max(0, idx));
}

export { gsap, ScrollTrigger, useGSAP };
```

- [ ] **Step 5: Run to verify it passes**

Run (from `v2/`): `npx vitest run tests/unit/motion.test.ts`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add v2/lib/motion.ts v2/tests/unit/motion.test.ts v2/package.json v2/package-lock.json
git commit -m "feat(v2): GSAP/Lenis deps + motion helpers (frameForProgress, RM gate) (TDD)"
```

---

## Task 2: SmoothScrollProvider (Lenis + GSAP, reduced-motion gated)

**Files:** Create `v2/components/providers/smooth-scroll.tsx`; Modify `v2/app/layout.tsx`

- [ ] **Step 1: Implement `v2/components/providers/smooth-scroll.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGsap();

    // Reduced motion: do NOT hijack scroll. Native scrolling only.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 2: Wrap children in `v2/app/layout.tsx`**

Inside the existing `ThemeProvider`, wrap `{children}` with `SmoothScrollProvider`. Add the import and change the body:

```tsx
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
```
```tsx
        <ThemeProvider
          attribute="data-theme"
          themes={THEMES}
          defaultTheme={DEFAULT_THEME}
          enableSystem={false}
          disableTransitionOnChange
        >
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </ThemeProvider>
```

- [ ] **Step 3: Build + typecheck (from `v2/`)**

Run: `npm run typecheck && npm run build`
Expected: both succeed; no SSR errors (Lenis/GSAP only run in the client effect).

- [ ] **Step 4: Commit**

```bash
git add v2/components/providers/smooth-scroll.tsx v2/app/layout.tsx
git commit -m "feat(v2): Lenis smooth scroll synced to GSAP ticker, reduced-motion gated"
```

---

## Task 3: Reveal + Parallax primitives

**Files:** Create `v2/components/motion/reveal.tsx`, `v2/components/motion/parallax.tsx`

- [ ] **Step 1: Implement `v2/components/motion/reveal.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  /** Stagger direct children instead of revealing the wrapper as one block. */
  stagger?: number;
}

export function Reveal({ children, className, y = 24, delay = 0, stagger }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? ref.current!.children : ref.current;
        gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.8,
          ease: "power3.out",
          delay,
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
      // Reduced motion: no tween → children remain visible and in place.
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Implement `v2/components/motion/parallax.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /** Pixels of travel across the scroll range (positive = moves down slower). */
  amount?: number;
}

export function Parallax({ children, className, amount = 60 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current,
          { y: -amount },
          {
            y: amount,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + build (from `v2/`)**

Run: `npm run typecheck && npm run build`
Expected: succeed.

- [ ] **Step 4: Commit**

```bash
git add v2/components/motion/reveal.tsx v2/components/motion/parallax.tsx
git commit -m "feat(v2): Reveal + Parallax motion primitives (RM-gated, transform/opacity only)"
```

---

## Task 4: TextReveal + Magnetic primitives

**Files:** Create `v2/components/motion/text-reveal.tsx`, `v2/components/motion/magnetic.tsx`

- [ ] **Step 1: Implement `v2/components/motion/text-reveal.tsx`** (manual word split — no plugin dependency)

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}

export function TextReveal({ text, className, as: Tag = "h2" }: TextRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  registerGsap();
  const words = text.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current!.querySelectorAll("[data-word]"), {
          yPercent: 120,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span data-word className="inline-block">
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
```

- [ ] **Step 2: Implement `v2/components/motion/magnetic.tsx`** (desktop pointer only; `quickTo`)

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";

export function Magnetic({
  children,
  strength = 0.4,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  registerGsap();

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current!;
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (!fine || prefersReducedMotion()) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

      const onMove = contextSafe!((e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      const onLeave = contextSafe!(() => {
        xTo(0);
        yTo(0);
      });

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Typecheck + build (from `v2/`)**

Run: `npm run typecheck && npm run build`
Expected: succeed.

- [ ] **Step 4: Commit**

```bash
git add v2/components/motion/text-reveal.tsx v2/components/motion/magnetic.tsx
git commit -m "feat(v2): TextReveal (word stagger) + Magnetic (pointer-fine, quickTo) primitives"
```

---

## Task 5: Marquee + CountUp primitives (+ formatter test)

**Files:** Create `v2/components/motion/marquee.tsx`, `v2/components/motion/count-up.tsx`, `v2/tests/unit/count-up.test.ts`

- [ ] **Step 1: Write the failing test `v2/tests/unit/count-up.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { formatCount } from "@/components/motion/count-up";

describe("formatCount", () => {
  it("formats an integer with no decimals", () => expect(formatCount(15, 0)).toBe("15"));
  it("keeps one decimal for a GPA-style value", () => expect(formatCount(4, 1)).toBe("4.0"));
  it("rounds to the given decimals", () => expect(formatCount(3.96, 1)).toBe("4.0"));
  it("adds a suffix", () => expect(formatCount(136, 0, "+")).toBe("136+"));
});
```

- [ ] **Step 2: Run to verify it fails**

Run (from `v2/`): `npx vitest run tests/unit/count-up.test.ts`
Expected: FAIL — `formatCount` not exported.

- [ ] **Step 3: Implement `v2/components/motion/count-up.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";

/** Pure formatter — exported for tests. */
export function formatCount(value: number, decimals: number, suffix = ""): string {
  return `${value.toFixed(decimals)}${suffix}`;
}

interface CountUpProps {
  to: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export function CountUp({ to, decimals = 0, suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => formatCount(to, decimals, suffix));
  registerGsap();

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        setDisplay(formatCount(to, decimals, suffix));
        return;
      }
      const counter = { v: 0 };
      gsap.to(counter, {
        v: to,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        onUpdate: () => setDisplay(formatCount(counter.v, decimals, suffix)),
      });
    },
    { scope: ref, dependencies: [to, decimals, suffix] },
  );

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
```

Note: initial `display` is the final value so it is correct without JS (static export / no-JS) and under reduced motion; the tween (when allowed) starts from 0 on scroll-in.

- [ ] **Step 4: Run the formatter test**

Run (from `v2/`): `npx vitest run tests/unit/count-up.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement `v2/components/motion/marquee.tsx`** (CSS-driven; pauses on hover; RM → static)

```tsx
"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds per loop. */
  speed?: number;
  reverse?: boolean;
}

export function Marquee({ children, className, speed = 28, reverse }: MarqueeProps) {
  return (
    <div
      className={cn("group relative flex overflow-hidden", className)}
      style={{ ["--marquee-duration" as string]: `${speed}s` }}
    >
      {[0, 1].map((dup) => (
        <div
          key={dup}
          aria-hidden={dup === 1}
          className={cn(
            "flex shrink-0 items-center gap-8 pr-8",
            "motion-safe:animate-[marquee_var(--marquee-duration)_linear_infinite]",
            "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Add the marquee keyframe to `v2/app/globals.css`** (append inside the file, after the view-transition block)

```css
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
```

- [ ] **Step 7: Build (from `v2/`)**

Run: `npm run build`
Expected: succeed.

- [ ] **Step 8: Commit**

```bash
git add v2/components/motion/marquee.tsx v2/components/motion/count-up.tsx v2/tests/unit/count-up.test.ts v2/app/globals.css
git commit -m "feat(v2): Marquee (CSS, pause-on-hover, motion-safe) + CountUp primitives (TDD formatter)"
```

---

## Task 6: TiltCard primitive

**Files:** Create `v2/components/motion/tilt-card.tsx`

- [ ] **Step 1: Implement `v2/components/motion/tilt-card.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  registerGsap();

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current!;
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (!fine || prefersReducedMotion()) return;

      const rotX = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power3" });
      const rotY = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power3" });

      const onMove = contextSafe!((e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * max * 2);
        rotX(-py * max * 2);
      });
      const onLeave = contextSafe!(() => {
        rotX(0);
        rotY(0);
      });

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("[transform-style:preserve-3d]", className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build (from `v2/`)**

Run: `npm run typecheck && npm run build`
Expected: succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/motion/tilt-card.tsx
git commit -m "feat(v2): TiltCard 3D hover primitive (pointer-fine, RM-safe, quickTo)"
```

---

## Task 7: ScrollSequence engine (procedural + image modes)

**Files:** Create `v2/components/motion/scroll-sequence.tsx`

- [ ] **Step 1: Implement `v2/components/motion/scroll-sequence.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion, frameForProgress } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface TextBeat {
  /** Progress in [0,1] at which this beat is active. */
  at: number;
  heading: string;
  body?: string;
}

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  total: number,
  dims: { width: number; height: number },
) => void;

interface ScrollSequenceProps {
  /** Total frames in the sequence (recommended 90–150 for image mode). */
  frameCount: number;
  width: number;
  height: number;
  /** Image mode: URL prefix, e.g. "/sequences/notebook/frame_". Omit for procedural mode. */
  framePath?: string;
  frameExt?: "webp" | "avif" | "jpg";
  pad?: number;
  /** Procedural mode: draw a frame yourself (used for the placeholder). */
  draw?: DrawFn;
  pinLength?: string; // e.g. "+=150%"
  textBeats?: TextBeat[];
  className?: string;
  /** Required text alternative for accessibility. */
  alt: string;
}

export function ScrollSequence({
  frameCount,
  width,
  height,
  framePath,
  frameExt = "webp",
  pad = 4,
  draw,
  pinLength = "+=150%",
  textBeats = [],
  className,
  alt,
}: ScrollSequenceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  registerGsap();

  useGSAP(
    () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Image mode: preload + decode all frames before enabling scrub.
      const images: HTMLImageElement[] = [];
      const render = (frame: number) => {
        ctx.clearRect(0, 0, width, height);
        if (draw) {
          draw(ctx, frame, frameCount, { width, height });
        } else if (images[frame]?.complete) {
          ctx.drawImage(images[frame], 0, 0, width, height);
        }
      };

      const buildUrl = (i: number) =>
        `${framePath}${String(i + 1).padStart(pad, "0")}.${frameExt}`;

      const start = () => {
        render(0);
        const reduce = prefersReducedMotion();
        // Show active beat for the given progress (reduced motion = first beat shown statically).
        const showBeat = (progress: number) => {
          if (!textBeats.length) return;
          let active = 0;
          textBeats.forEach((b, i) => {
            if (progress >= b.at) active = i;
          });
          beatRefs.current.forEach((el, i) =>
            el?.style.setProperty("opacity", i === active ? "1" : "0"),
          );
        };
        showBeat(0);

        if (reduce) {
          // No pin, no scrub, no scroll trap — static first frame + all beats visible.
          beatRefs.current.forEach((el) => el?.style.setProperty("opacity", "1"));
          return;
        }

        const state = { frame: 0 };
        gsap.to(state, {
          frame: frameCount - 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: pinLength,
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
              render(frameForProgress(self.progress, frameCount));
              showBeat(self.progress);
            },
          },
        });
      };

      if (framePath) {
        let loaded = 0;
        for (let i = 0; i < frameCount; i++) {
          const img = new Image();
          img.src = buildUrl(i);
          img.decode?.().catch(() => {});
          img.onload = () => {
            loaded += 1;
            if (loaded === frameCount) start();
          };
          images.push(img);
        }
      } else {
        start(); // procedural placeholder needs no assets
      }
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={cn("relative", className)} aria-label={alt}>
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ width, height, maxWidth: "100%", height: "auto" }}
          className="block"
          role="img"
          aria-label={alt}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center px-6 md:px-16">
          {textBeats.map((b, i) => (
            <div
              key={i}
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              className="absolute max-w-md transition-opacity duration-500"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <h3 className="font-display text-3xl text-heading md:text-5xl">{b.heading}</h3>
              {b.body && <p className="mt-3 text-muted">{b.body}</p>}
            </div>
          ))}
        </div>
      </div>
      {/* Static text alternative for assistive tech / no-JS. */}
      <p className="sr-only">{alt}</p>
    </section>
  );
}
```

Notes: the engine never traps scroll under reduced motion (returns before creating the pinned ScrollTrigger). Image mode caps DPR at 2 and waits for all frames before scrubbing. The procedural `draw` path needs no assets and is what the placeholder uses.

- [ ] **Step 2: Typecheck + build (from `v2/`)**

Run: `npm run typecheck && npm run build`
Expected: succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/motion/scroll-sequence.tsx
git commit -m "feat(v2): reusable ScrollSequence engine (canvas pin+scrub, image+procedural, RM-safe)"
```

---

## Task 8: Motion preview page (demos + placeholder sequence)

**Files:** Create `v2/app/preview/motion/page.tsx`

- [ ] **Step 1: Implement `v2/app/preview/motion/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { CountUp } from "@/components/motion/count-up";
import { TiltCard } from "@/components/motion/tilt-card";
import { ScrollSequence } from "@/components/motion/scroll-sequence";

export const metadata: Metadata = {
  title: "Motion — Preview",
  robots: { index: false, follow: false },
};

// Procedural placeholder: a wireframe grid that "assembles" with progress + frame readout.
const placeholderDraw = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  total: number,
  { width, height }: { width: number; height: number },
) => {
  const p = total > 1 ? frame / (total - 1) : 0;
  ctx.fillStyle = "#0A0F1E";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#00E5FF";
  ctx.globalAlpha = 0.5;
  const cells = 12;
  const spread = 1 - p; // converges as it progresses
  for (let i = 0; i <= cells; i++) {
    const x = (width / cells) * i + Math.sin(i + p * 6) * 30 * spread;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#E5FF00";
  ctx.font = "600 28px monospace";
  ctx.fillText(`FRAME ${frame + 1} / ${total}`, 32, 48);
};

export default function MotionPreviewPage() {
  return (
    <main className="bg-background text-foreground">
      <Section eyebrow="Motion" heading="Primitives in motion">
        <div className="space-y-12">
          <Reveal stagger={0.08} className="grid gap-4 md:grid-cols-3">
            <Card>Reveal A</Card>
            <Card>Reveal B</Card>
            <Card>Reveal C</Card>
          </Reveal>

          <TextReveal as="h3" text="Headlines reveal word by word" className="font-display text-4xl text-heading md:text-6xl" />

          <div className="flex flex-wrap items-center gap-6">
            <Magnetic>
              <Button>Magnetic button</Button>
            </Magnetic>
            <p className="text-4xl font-display text-heading">
              <CountUp to={4} decimals={1} /> GPA
            </p>
            <p className="text-4xl font-display text-heading">
              <CountUp to={136} suffix="+" /> hrs
            </p>
          </div>

          <Marquee className="border-y border-border py-4">
            {["Python", "PyTorch", "FastAPI", "Next.js", "GSAP", "SQL"].map((s) => (
              <span key={s} className="font-mono text-sm uppercase tracking-widest text-muted">
                {s}
              </span>
            ))}
          </Marquee>

          <TiltCard className="mx-auto max-w-sm">
            <Card className="text-center">Tilt me (desktop)</Card>
          </TiltCard>
        </div>
      </Section>

      <ScrollSequence
        frameCount={90}
        width={1280}
        height={720}
        draw={placeholderDraw}
        alt="Placeholder scroll sequence: a wireframe grid assembling as you scroll. Real frames are dropped in later."
        textBeats={[
          { at: 0, heading: "Scroll to scrub", body: "The section pins and the canvas advances frame-by-frame." },
          { at: 0.5, heading: "Synced beats", body: "Text changes at progress thresholds." },
          { at: 0.95, heading: "Then releases", body: "At the last frame, normal scrolling resumes." },
        ]}
      />

      <Section eyebrow="Parallax" heading="Depth on scroll">
        <Parallax amount={80}>
          <Container>
            <Card className="mx-auto max-w-md text-center">I drift on scroll</Card>
          </Container>
        </Parallax>
      </Section>
    </main>
  );
}
```

- [ ] **Step 2: Build (from `v2/`)**

Run: `npm run build`
Expected: succeed; `out/preview/motion/index.html` exists.

- [ ] **Step 3: Commit**

```bash
git add v2/app/preview/motion/page.tsx
git commit -m "feat(v2): /preview/motion styleguide demoing primitives + placeholder ScrollSequence"
```

---

## Task 9: E2E motion smoke + full gate sweep

**Files:** Create `v2/tests/e2e/motion.spec.ts`

- [ ] **Step 1: Implement `v2/tests/e2e/motion.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("motion page renders the sequence and primitives", async ({ page }) => {
  await page.goto("/preview/motion");
  await expect(page.getByRole("heading", { name: /Primitives in motion/i })).toBeVisible();
  // Canvas-based scroll sequence is present with its text alternative.
  await expect(page.getByRole("img", { name: /Placeholder scroll sequence/i })).toBeVisible();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("does not trap scrolling on the sequence", async ({ page }) => {
    await page.goto("/preview/motion");
    const beforeY = await page.evaluate(() => window.scrollY);
    // Scroll well past the pinned section height.
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(300);
    const afterY = await page.evaluate(() => window.scrollY);
    expect(afterY).toBeGreaterThan(beforeY + 500); // page advanced; not pinned/trapped
  });
});
```

- [ ] **Step 2: Run e2e (from `v2/`)**

Run: `npm run test:e2e`
Expected: all e2e pass (P0 smoke + theme + the 2 motion tests). The reduced-motion test confirms the sequence never pins/traps scroll.

- [ ] **Step 3: Full gate sweep (from `v2/`)**

Run each; all green:
```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

- [ ] **Step 4: Commit**

```bash
git add v2/tests/e2e/motion.spec.ts
git commit -m "test(v2): e2e motion smoke + reduced-motion no-scroll-trap guard"
```

- [ ] **Step 5: Phase 2 checkpoint (report; do NOT push)**

Report green gates and that the motion foundation + ScrollSequence engine work with the placeholder. The controller will visually verify (screenshots / scroll) before Phase 3.

---

## Self-Review (against spec §6, ROADMAP Session 3)

- **§6.1 foundation (Lenis+GSAP ticker sync, `useGSAP` client-only, reduced-motion master gate, transform/opacity, refresh discipline)** → Tasks 1,2; every primitive uses `useGSAP`+`matchMedia`; Lenis skipped under reduced motion. ✔
- **§6.2 primitives (Reveal, Parallax, TextReveal, Magnetic, Marquee, CountUp, TiltCard)** → Tasks 3–6. ✔
- **§6.4 ScrollSequence (config-driven, canvas pin+scrub, decode-before-scrub, DPR cap, mobile/reduced-motion fallback never traps scroll, text alternative, placeholder-first)** → Task 7 + placeholder in Task 8. Image mode + procedural mode share one ScrollTrigger; `frameForProgress` unit-tested in Task 1. ✔
- **§6.3 micro-features:** preloader/custom-cursor/grain are P3 (layout shell), correctly out of scope here; View-Transitions theme switch already shipped in P1. ✔
- **ROADMAP Session 3 (GSAP+ScrollTrigger infra, reduced-motion gating, reusable primitives, prototype the scroll-sequence engine)** → fully covered. ✔
- **Placeholder scan:** every step has complete code; no TBD. ✔
- **Type consistency:** `registerGsap`, `prefersReducedMotion`, `frameForProgress`, `gsap`, `ScrollTrigger`, `useGSAP` exported from `lib/motion.ts` and imported consistently; `formatCount` exported from `count-up.tsx` and tested; `ScrollSequenceProps`/`TextBeat`/`DrawFn` consistent. ✔

## Notes carried to later phases
- `mobileFrameCount` (smaller mobile frame set) and `<video>` fallback are real-asset concerns — wire when actual frames arrive (the engine already degrades to a static first frame on reduced motion; add a responsive frame set in the section that uses it).
- Real ScrollSequence subject + frames: user generates via Nano Banana Pro → Higgsfield → numbered WebP into `public/sequences/<name>/` (spec §14); then swap the placeholder `draw` for `framePath`.
- P3 (layout shell) adds Nav (hosting the ThemeSwitcher), Footer, Preloader (preloads sequence frames + hero), CustomCursor, GrainOverlay; reconsider the 36px switcher touch target there.
- If SplitText (now free in GSAP 3.13+) is preferred over the manual word split, swap inside `TextReveal` without changing its public API.
