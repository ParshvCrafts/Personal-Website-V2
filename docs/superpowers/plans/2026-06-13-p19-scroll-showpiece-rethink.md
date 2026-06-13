# P19 Scroll Showpiece Rethink Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two new scroll-showpiece variants — "Keystroke" (Apple-style stepped typographic sequence) and "Keyboard" (R3F 3D mechanical keyboard) — selectable live via `?show=`, with the current cinematic retained as default.

**Architecture:** `scroll-showpiece.tsx` becomes a thin switch reading a `?show=` variant (pure parser, mirrors `hero-variant`). The current frame-scrub moves verbatim into `CinematicShowpiece`. Keystroke = GSAP ScrollTrigger snap + scroll-driven typed headings (pure `keystroke.ts`). Keyboard = R3F instanced keycaps on the P13 `SceneSlot` rig, scroll-driven key-press timeline (pure `keyboard-timeline.ts`), with a static typographic fallback. Spec: `docs/superpowers/specs/2026-06-13-p19-scroll-showpiece-rethink-design.md`.

**Tech Stack:** Next 16 / React 19, GSAP + ScrollTrigger (`@/lib/motion`), three 0.184 + R3F 9 (`AdaptiveCanvas`, `SceneSlot`, `useScrollBridge`, `usePointer`, `useThemePalette`), Tailwind v4 tokens, Vitest, Playwright.

**Conventions:** One conventional commit per task, trailer exactly `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Explicit `git add` paths. Never push. Never import R3F/three into Vitest unit tests (jsdom has no WebGL).

---

### Task 1: Variant parser (TDD)

**Files:**
- Create: `lib/showpiece/showpiece-variant.ts`
- Test: `tests/unit/showpiece-variant.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/showpiece-variant.test.ts
import { describe, expect, it } from "vitest";
import { parseShowpieceVariant, SHOWPIECE_VARIANTS } from "@/lib/showpiece/showpiece-variant";

describe("parseShowpieceVariant", () => {
  it("lists the three variants", () => {
    expect(SHOWPIECE_VARIANTS).toEqual(["cinematic", "keystroke", "keyboard"]);
  });
  it("reads ?show= and normalizes case/space", () => {
    expect(parseShowpieceVariant("?show=keystroke")).toBe("keystroke");
    expect(parseShowpieceVariant("?show=KEYBOARD")).toBe("keyboard");
    expect(parseShowpieceVariant("?show=%20cinematic%20")).toBe("cinematic");
  });
  it("falls back to cinematic for missing/unknown", () => {
    expect(parseShowpieceVariant("")).toBe("cinematic");
    expect(parseShowpieceVariant("?show=bogus")).toBe("cinematic");
    expect(parseShowpieceVariant("?x=1")).toBe("cinematic");
  });
  it("honors an explicit fallback arg", () => {
    expect(parseShowpieceVariant("", "keystroke")).toBe("keystroke");
  });
});
```

- [ ] **Step 2: Run to verify FAIL** — `npx vitest run tests/unit/showpiece-variant.test.ts` → module not found.

- [ ] **Step 3: Implement**

```ts
// lib/showpiece/showpiece-variant.ts
export const SHOWPIECE_VARIANTS = ["cinematic", "keystroke", "keyboard"] as const;
export type ShowpieceVariant = (typeof SHOWPIECE_VARIANTS)[number];

function isShowpieceVariant(v: string): v is ShowpieceVariant {
  return (SHOWPIECE_VARIANTS as readonly string[]).includes(v);
}

/**
 * Resolve the scroll-showpiece variant from a `location.search` string
 * (`?show=keystroke`). Unknown/missing → `fallback`. Pure; safe on the server.
 */
export function parseShowpieceVariant(
  search: string,
  fallback: ShowpieceVariant = "cinematic",
): ShowpieceVariant {
  const raw = new URLSearchParams(search).get("show");
  if (!raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  return isShowpieceVariant(normalized) ? normalized : fallback;
}
```

- [ ] **Step 4: Run to verify PASS** (4 tests).
- [ ] **Step 5: Commit**

```bash
git add lib/showpiece/showpiece-variant.ts tests/unit/showpiece-variant.test.ts
git commit -m "feat(v2): showpiece variant parser — ?show=cinematic|keystroke|keyboard (TDD)"
```

---

### Task 2: Extract CinematicShowpiece + variant switch (no behavior change)

**Files:**
- Create: `components/sections/showpiece/cinematic-showpiece.tsx`
- Create: `components/sections/showpiece/use-showpiece-variant.ts`
- Rewrite: `components/sections/scroll-showpiece.tsx` (becomes the switch)

- [ ] **Step 1: Move the current cinematic verbatim** into `components/sections/showpiece/cinematic-showpiece.tsx`, renamed export `CinematicShowpiece` (body identical to today's `ScrollShowpiece` — the `ScrollSequence` with the Signal frames, grade logic, beats, alt):

```tsx
"use client";

import { useTheme } from "next-themes";
import { ScrollSequence } from "@/components/motion/scroll-sequence";
import { gradeForTheme } from "@/lib/sequence-grade";

/** P15/P16 signature cinematic: 120 baked Signal frames scrubbed by ScrollSequence. */
export function CinematicShowpiece() {
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

- [ ] **Step 2: SSR-safe variant hook** (mirror `components/three/use-hero-variant.ts`):

```ts
// components/sections/showpiece/use-showpiece-variant.ts
"use client";

import { useEffect, useState } from "react";
import { parseShowpieceVariant, type ShowpieceVariant } from "@/lib/showpiece/showpiece-variant";

const SHOWPIECE_DEFAULT: ShowpieceVariant = "cinematic";

/** Returns the configured default until mounted, then the `?show=` override. */
export function useShowpieceVariant(): ShowpieceVariant {
  const [variant, setVariant] = useState<ShowpieceVariant>(SHOWPIECE_DEFAULT);
  useEffect(() => {
    setVariant(parseShowpieceVariant(window.location.search, SHOWPIECE_DEFAULT));
  }, []);
  return variant;
}
```

- [ ] **Step 3: Rewrite `scroll-showpiece.tsx` as the switch** (lazy-load the heavy variants so they stay off the initial bundle):

```tsx
"use client";

import dynamic from "next/dynamic";
import { useShowpieceVariant } from "./showpiece/use-showpiece-variant";
import { CinematicShowpiece } from "./showpiece/cinematic-showpiece";

const KeystrokeShowpiece = dynamic(
  () => import("./showpiece/keystroke-showpiece").then((m) => m.KeystrokeShowpiece),
  { ssr: false },
);
const KeyboardShowpiece = dynamic(
  () => import("./showpiece/keyboard-showpiece").then((m) => m.KeyboardShowpiece),
  { ssr: false },
);

/** Scroll showpiece: live-switchable via `?show=cinematic|keystroke|keyboard`. */
export function ScrollShowpiece() {
  const variant = useShowpieceVariant();
  if (variant === "keystroke") return <KeystrokeShowpiece />;
  if (variant === "keyboard") return <KeyboardShowpiece />;
  return <CinematicShowpiece />;
}
```

- [ ] **Step 4:** Create temporary stubs so the build passes before Tasks 4/6 land. Create `components/sections/showpiece/keystroke-showpiece.tsx` and `keyboard-showpiece.tsx` each exporting a minimal placeholder that renders the cinematic (so `?show=` resolves to something real until implemented):

```tsx
// components/sections/showpiece/keystroke-showpiece.tsx  (TEMP — replaced in Task 4)
"use client";
import { CinematicShowpiece } from "./cinematic-showpiece";
export function KeystrokeShowpiece() {
  return <CinematicShowpiece />;
}
```

```tsx
// components/sections/showpiece/keyboard-showpiece.tsx  (TEMP — replaced in Task 6)
"use client";
import { CinematicShowpiece } from "./cinematic-showpiece";
export function KeyboardShowpiece() {
  return <CinematicShowpiece />;
}
```

- [ ] **Step 5: Gates** — `npm run lint && npm run typecheck && npx vitest run && npm run build`. All green; `?show=cinematic` and default render exactly as before.
- [ ] **Step 6: Commit**

```bash
git add components/sections/scroll-showpiece.tsx components/sections/showpiece
git commit -m "refactor(v2): showpiece becomes a ?show= switch; cinematic extracted, keystroke/keyboard stubbed"
```

---

### Task 3: Keystroke pure logic (TDD)

**Files:**
- Create: `lib/showpiece/keystroke.ts`
- Test: `tests/unit/keystroke.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/keystroke.test.ts
import { describe, expect, it } from "vitest";
import { chapterForProgress, typedCount } from "@/lib/showpiece/keystroke";

describe("chapterForProgress", () => {
  it("maps [0,1) progress to evenly sized chapters", () => {
    expect(chapterForProgress(0, 3)).toBe(0);
    expect(chapterForProgress(0.2, 3)).toBe(0);
    expect(chapterForProgress(0.34, 3)).toBe(1);
    expect(chapterForProgress(0.67, 3)).toBe(2);
    expect(chapterForProgress(1, 3)).toBe(2); // clamps to last
  });
  it("guards bad input", () => {
    expect(chapterForProgress(-1, 3)).toBe(0);
    expect(chapterForProgress(0.5, 0)).toBe(0);
  });
});

describe("typedCount", () => {
  it("reveals characters across the first ~70% of a chapter, then holds full", () => {
    expect(typedCount(10, 0)).toBe(0);
    expect(typedCount(10, 0.35)).toBe(5); // halfway through the typing window
    expect(typedCount(10, 0.7)).toBe(10); // fully typed by 70% in
    expect(typedCount(10, 1)).toBe(10);
  });
  it("never exceeds length or returns negatives", () => {
    expect(typedCount(4, 2)).toBe(4);
    expect(typedCount(4, -1)).toBe(0);
    expect(typedCount(0, 0.5)).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify FAIL.**

- [ ] **Step 3: Implement**

```ts
// lib/showpiece/keystroke.ts
// Pure math for the Keystroke showpiece. No GSAP/DOM — unit-testable in jsdom.

/** Which 0-based chapter is committed at scroll progress p∈[0,1] for `count` chapters. */
export function chapterForProgress(p: number, count: number): number {
  if (count <= 0) return 0;
  const clamped = Math.min(0.999999, Math.max(0, p));
  return Math.min(count - 1, Math.floor(clamped * count));
}

/**
 * Characters revealed for a chapter, given the chapter's local progress
 * `local`∈[0,1]. Typing completes at 70% so each chapter holds fully-typed
 * before the snap to the next — the "committed keystroke" feel.
 */
export function typedCount(length: number, local: number): number {
  if (length <= 0) return 0;
  const TYPE_WINDOW = 0.7;
  const t = Math.min(1, Math.max(0, local) / TYPE_WINDOW);
  return Math.min(length, Math.round(t * length));
}
```

- [ ] **Step 4: Run to verify PASS** (4 tests).
- [ ] **Step 5: Commit**

```bash
git add lib/showpiece/keystroke.ts tests/unit/keystroke.test.ts
git commit -m "feat(v2): keystroke pure logic — chapter + typed-char math (TDD)"
```

---

### Task 4: KeystrokeShowpiece component

**Files:**
- Rewrite: `components/sections/showpiece/keystroke-showpiece.tsx` (replaces the Task 2 stub)

Consult `gsap-scrolltrigger` (snap) and `react-best-practices` (effect cleanup, no setState-in-render). The chapters/copy match the cinematic beats.

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { chapterForProgress, typedCount } from "@/lib/showpiece/keystroke";
import { cn } from "@/lib/utils";

interface Chapter {
  kicker: string;
  heading: string;
  body: string;
}

const CHAPTERS: Chapter[] = [
  { kicker: "01 — input", heading: "Data, everywhere", body: "Raw, scattered, noisy." },
  { kicker: "02 — learning", heading: "Structure emerges", body: "Patterns resolve as the model learns." },
  { kicker: "03 — output", heading: "Intelligence", body: "Systems that turn signal into decisions." },
];

/**
 * Apple-style stepped scroll sequence. Scroll snaps chapter-to-chapter; each
 * heading "types" in (scroll-driven) and commits with a keycap depress + accent
 * flash. Pure typographic — no frames. Reduced motion: all chapters shown
 * stacked, fully typed, no pin/snap (content visible, never trapped).
 */
export function KeystrokeShowpiece() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState(0);
  registerGsap();

  useGSAP(
    (_ctx, contextSafe) => {
      const reduce = prefersReducedMotion();
      if (reduce) return; // reduced path renders the static stack below

      const render = contextSafe!((progress: number) => {
        const count = CHAPTERS.length;
        const idx = chapterForProgress(progress, count);
        const local = progress * count - idx; // 0..1 within the chapter
        const chars = typedCount(CHAPTERS[idx].heading.length, local);
        setActive((prev) => (prev === idx ? prev : idx));
        setTyped(chars);
      });

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 0.6,
        snap: { snapTo: [0, 1 / 3, 2 / 3, 1], duration: 0.3, ease: "power2.inOut" },
        onUpdate: (self) => render(self.progress),
      });
      render(0);
      return () => st.kill();
    },
    { scope: sectionRef },
  );

  // Keycap flash when a chapter commits (active changes), motion-safe only.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !cardRef.current) return;
      gsap.fromTo(
        cardRef.current,
        { y: 6, boxShadow: "0 0 0 0 transparent" },
        {
          y: 0,
          boxShadow: "0 14px 50px -22px var(--accent)",
          duration: 0.32,
          ease: "power3.out",
        },
      );
    },
    { dependencies: [active], scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Data to intelligence — a three-step story: data is raw and scattered, structure emerges as a model learns, and the result is intelligence that turns signal into decisions."
      className="relative border-y border-border"
    >
      {/* Motion path: one pinned stage, chapters swap in place. */}
      <div className="motion-safe:flex hidden min-h-dvh items-center justify-center px-6 md:px-16">
        <div
          ref={cardRef}
          className="w-full max-w-3xl rounded-2xl border border-border bg-surface/60 p-8 md:p-12 backdrop-blur-sm"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            {CHAPTERS[active].kicker}
          </p>
          <p className="mt-5 font-display text-4xl leading-[1.05] text-heading md:text-7xl">
            <span ref={headingRef}>{CHAPTERS[active].heading.slice(0, typed)}</span>
            <span
              aria-hidden
              className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] bg-accent motion-safe:animate-[cursor-blink_1.1s_step-end_infinite]"
            />
          </p>
          <p className="mt-4 text-muted md:text-lg">{CHAPTERS[active].body}</p>
        </div>
      </div>

      {/* Reduced-motion path: all chapters stacked, fully readable, no pin. */}
      <div className={cn("motion-safe:hidden", "mx-auto max-w-3xl px-6 py-24 md:px-16")}>
        {CHAPTERS.map((c) => (
          <div key={c.heading} className="border-b border-border/50 py-8 last:border-0">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{c.kicker}</p>
            <p className="mt-3 font-display text-3xl leading-[1.05] text-heading md:text-5xl">
              {c.heading}
            </p>
            <p className="mt-3 text-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Note: the two render paths are switched purely by CSS (`motion-safe:flex hidden` shows the pinned stage only when motion is allowed; `motion-safe:hidden` shows the stacked static chapters only under reduced motion) — no JS branch needed, so both always render in the DOM and the reduced path needs no ScrollTrigger.

- [ ] **Step 2: Gates** — `npm run lint && npm run typecheck && npx vitest run && npm run build`. Green.
- [ ] **Step 3: Commit**

```bash
git add components/sections/showpiece/keystroke-showpiece.tsx
git commit -m "feat(v2): Keystroke showpiece — snap-stepped chapters that type in and commit"
```

---

### Task 5: Keyboard timeline pure logic (TDD)

**Files:**
- Create: `lib/showpiece/keyboard-timeline.ts`
- Test: `tests/unit/keyboard-timeline.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/keyboard-timeline.test.ts
import { describe, expect, it } from "vitest";
import { keyDepth, WORDS, wordForProgress } from "@/lib/showpiece/keyboard-timeline";

describe("wordForProgress", () => {
  it("walks the three words across scroll", () => {
    expect(WORDS).toEqual(["DATA", "STRUCTURE", "INTELLIGENCE"]);
    expect(wordForProgress(0)).toBe(0);
    expect(wordForProgress(0.5)).toBe(1);
    expect(wordForProgress(0.99)).toBe(2);
  });
});

describe("keyDepth", () => {
  it("peaks near its scheduled press time, rests away from it", () => {
    // key index 1 in a 4-key word is centered at local (1+0.5)/4 = 0.375
    expect(keyDepth(1, 4, 0.375)).toBeGreaterThan(0.8);
    expect(keyDepth(1, 4, 0.9)).toBeLessThan(0.2);
  });
  it("clamps to [0,1] and rejects out-of-range keys", () => {
    expect(keyDepth(99, 4, 0.3)).toBe(0);
    expect(keyDepth(-1, 4, 0.3)).toBe(0);
    expect(keyDepth(0, 0, 0.3)).toBe(0);
    const v = keyDepth(0, 4, 0);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run to verify FAIL.**

- [ ] **Step 3: Implement**

```ts
// lib/showpiece/keyboard-timeline.ts
// Pure scheduling for the 3D Keyboard showpiece. No three.js — jsdom-safe.

export const WORDS = ["DATA", "STRUCTURE", "INTELLIGENCE"] as const;

/** Which word index is active at overall scroll progress p∈[0,1]. */
export function wordForProgress(p: number): number {
  const n = WORDS.length;
  const clamped = Math.min(0.999999, Math.max(0, p));
  return Math.min(n - 1, Math.floor(clamped * n));
}

/**
 * Depress amount [0,1] for the key at `keyIndex` within a word of length
 * `wordLen`, given the word's local progress `local`∈[0,1]. Keys press in
 * sequence: key i peaks (fully down) as `local` passes (i+0.5)/wordLen, easing
 * back to rest outside its press window. Out-of-range keys return 0.
 */
export function keyDepth(keyIndex: number, wordLen: number, local: number): number {
  if (wordLen <= 0 || keyIndex < 0 || keyIndex >= wordLen) return 0;
  const center = (keyIndex + 0.5) / wordLen;
  const half = 0.5 / wordLen;
  const d = Math.abs(Math.min(1, Math.max(0, local)) - center);
  return Math.max(0, 1 - d / half);
}
```

- [ ] **Step 4: Run to verify PASS** (3 tests).
- [ ] **Step 5: Commit**

```bash
git add lib/showpiece/keyboard-timeline.ts tests/unit/keyboard-timeline.test.ts
git commit -m "feat(v2): keyboard-timeline pure logic — word + per-key depress schedule (TDD)"
```

---

### Task 6: KeyboardShowpiece R3F scene + fallback

**Files:**
- Rewrite: `components/sections/showpiece/keyboard-showpiece.tsx` (replaces the Task 2 stub)

Consult `react-best-practices`. Geometry is one `InstancedMesh` of keycaps; scroll drives per-instance Y depress via `keyDepth`. Decorative canvas is `aria-hidden`; the words live in sibling DOM. Below `minTier`/RM/no-WebGL2 → `SceneSlot` fallback renders the static word panel.

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AdaptiveCanvas } from "@/components/three/adaptive-canvas";
import { SceneSlot } from "@/components/three/scene-slot";
import { useScrollBridge } from "@/components/three/use-scroll-bridge";
import { usePointer } from "@/components/three/use-pointer";
import { useThemePalette } from "@/components/three/use-hero-variant";
import { WORDS, wordForProgress, keyDepth } from "@/lib/showpiece/keyboard-timeline";
import type { ScrollStore } from "@/lib/webgl/scroll-store";

const MAX_KEYS = Math.max(...WORDS.map((w) => w.length)); // 12 (INTELLIGENCE)
const GAP = 0.62;

function Keyboard({
  progress,
  pointer,
  accent,
  base,
}: {
  progress: ScrollStore;
  pointer: { value: { x: number; y: number }; step(d: number): void };
  accent: string;
  base: string;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);
  const baseColor = useMemo(() => new THREE.Color(base), [base]);
  const t = useRef(0);

  useFrame((_, delta) => {
    pointer.step(delta);
    t.current += delta;
    const im = mesh.current;
    const g = group.current;
    if (!im || !g) return;

    const p = progress.get();
    const wordIdx = wordForProgress(p);
    const word = WORDS[wordIdx];
    const local = p * WORDS.length - wordIdx; // 0..1 within the active word
    const offset = -((word.length - 1) * GAP) / 2;

    for (let i = 0; i < MAX_KEYS; i++) {
      const inWord = i < word.length;
      const depth = inWord ? keyDepth(i, word.length, local) : 0;
      dummy.position.set(inWord ? offset + i * GAP : (i - MAX_KEYS / 2) * GAP, -depth * 0.18, 0);
      dummy.scale.setScalar(inWord ? 0.52 : 0.0001); // hide unused keys
      dummy.rotation.set(-0.32, 0, 0);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      im.setColorAt(i, depth > 0.5 ? accentColor : baseColor);
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;

    // gentle idle float + cursor parallax tilt
    g.rotation.x = -0.62 + Math.sin(t.current * 0.4) * 0.03 + pointer.value.y * 0.12;
    g.rotation.y = pointer.value.x * 0.2;
    g.position.y = Math.sin(t.current * 0.5) * 0.05;
  });

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <instancedMesh ref={mesh} args={[undefined, undefined, MAX_KEYS]} frustumCulled={false}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial roughness={0.45} metalness={0.15} />
      </instancedMesh>
    </group>
  );
}

function KeyboardScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollBridge({ trigger: wrap, start: "top top", end: "bottom top" });
  const pointer = usePointer();
  const palette = useThemePalette();
  return (
    <div ref={wrap} className="h-full w-full">
      <AdaptiveCanvas camera={{ position: [0, 0.6, 6], fov: 42 }}>
        <Keyboard progress={progress} pointer={pointer} accent={palette.accent} base={palette.elevated} />
      </AdaptiveCanvas>
    </div>
  );
}

/** Static, content-equivalent fallback (no WebGL): the three words as type. */
function KeyboardFallback() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-24 md:px-16">
      {WORDS.map((w) => (
        <p key={w} className="font-display text-4xl tracking-tight text-heading md:text-6xl">
          {w}
        </p>
      ))}
    </div>
  );
}

/**
 * 3D mechanical-keyboard showpiece: scroll "types" DATA → STRUCTURE →
 * INTELLIGENCE by depressing keycaps in sequence. Pinned for the scroll range.
 * Decorative canvas is aria-hidden; the words live in the sibling DOM (and the
 * fallback) for assistive tech and reduced motion.
 */
export function KeyboardShowpiece() {
  return (
    <section
      aria-label="Data to intelligence: scrolling types the words data, structure, and intelligence on a mechanical keyboard."
      className="relative min-h-dvh border-y border-border"
    >
      <div aria-hidden className="absolute inset-0">
        <SceneSlot minTier="low" className="h-full w-full" fallback={<KeyboardFallback />} render={() => <KeyboardScene />} />
      </div>
      {/* DOM word parity for AT (visually hidden; canvas carries the show). */}
      <p className="sr-only">{WORDS.join(" · ")}</p>
    </section>
  );
}
```

- [ ] **Step 2: Gates** — `npm run lint && npm run typecheck && npx vitest run && npm run build`. Green. If R3F `instancedMesh`/`bufferGeometry` types complain under @react-three/fiber 9.6.1, adapt minimally and note it.
- [ ] **Step 3: Commit**

```bash
git add components/sections/showpiece/keyboard-showpiece.tsx
git commit -m "feat(v2): Keyboard showpiece — 3D instanced keycaps type the story on scroll, static fallback"
```

---

### Task 7: e2e coverage

**Files:**
- Modify: `tests/e2e/showpiece.spec.ts` (extend; read it first, mirror its existing helpers)

- [ ] **Step 1: Add tests**

```ts
test.describe("showpiece variants", () => {
  test("keystroke: chapters present + reduced motion shows all, no pin", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?show=keystroke", { waitUntil: "domcontentloaded" });
    for (const h of ["Data, everywhere", "Structure emerges", "Intelligence"]) {
      await expect(page.getByText(h, { exact: true })).toBeVisible();
    }
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });

  test("keyboard: canvas mounts with WebGL2, else fallback words show", async ({ page }) => {
    await page.goto("/?show=keyboard", { waitUntil: "domcontentloaded" });
    const hasWebgl2 = await page.evaluate(
      () => !!document.createElement("canvas").getContext("webgl2"),
    );
    if (hasWebgl2) {
      await expect(page.locator("section canvas").first()).toBeVisible({ timeout: 15_000 });
    } else {
      await expect(page.getByText("INTELLIGENCE", { exact: true })).toBeVisible();
    }
  });

  test("cinematic (default) still renders the frame canvas", async ({ page }) => {
    await page.goto("/?show=cinematic", { waitUntil: "domcontentloaded" });
    await expect(page.locator('canvas[role="img"]')).toBeVisible({ timeout: 20_000 });
  });
});
```

- [ ] **Step 2: Run** — `npx playwright test tests/e2e/showpiece.spec.ts` (3 browsers; re-run a lone contention failure in isolation).
- [ ] **Step 3: Commit**

```bash
git add tests/e2e/showpiece.spec.ts
git commit -m "test(v2): e2e for showpiece variants — keystroke RM, keyboard canvas/fallback, cinematic"
```

---

### Task 8: Docs

**Files:**
- Create: `docs/v2/SHOWPIECE-VARIANTS.md`
- Modify: `docs/v2/ROADMAP-V2.5-SIGNATURE.md` (P19 row when verified)

- [ ] **Step 1: Write the doc** — variants, `?show=` flag, where pure logic lives, fallback/RM contract, how to set the default after the user picks (a `SHOWPIECE_DEFAULT` const in `use-showpiece-variant.ts`).
- [ ] **Step 2: Commit**

```bash
git add docs/v2/SHOWPIECE-VARIANTS.md docs/v2/ROADMAP-V2.5-SIGNATURE.md
git commit -m "docs(v2): scroll showpiece variants doc"
```

---

## Final verification (orchestrator)
1. Full gates: lint, typecheck, vitest, build, full `test:e2e` (re-run lone failures in isolation).
2. Two-stage read-only reviewer pass over the range (spec/a11y + quality; watch R3F instance disposal, ScrollTrigger cleanup, reduced-motion paths, snap not trapping scroll).
3. Playwright-MCP visual pass on built `out/`: `?show=keystroke` and `?show=keyboard` across 4 themes + mobile + reduced motion; read screenshots; recommend the stronger default.
4. Report + pause for the user's default pick. Confirm nothing pushed, no v1 changed, no assets deleted.
