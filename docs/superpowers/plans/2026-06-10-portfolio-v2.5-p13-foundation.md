# P13 — 3D + Motion Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a reusable, accessibility-safe WebGL/3D rig (capability tiering, lazy adaptive Canvas, Lenis-smoothed scroll bridge, the `SceneSlot` fallback contract) and prove it end-to-end with a throwaway scene on `/preview` — with **zero new 3D on the home page**.

**Architecture:** Pure logic in `lib/webgl/` (TDD'd: tier resolution, scroll store, dpr clamp). Client components in `components/three/` compose them: `useGpuTier` (SSR-safe device probe) → `SceneSlot` (the single gateway: renders a non-3D `fallback` below `minTier`, else lazy-mounts the scene) → `LazyMount` (IntersectionObserver gate) → `AdaptiveCanvas` (drei `PerformanceMonitor` DPR scaling) + `useScrollBridge` (ScrollTrigger writes progress into a mutable store read inside `useFrame`, no second RAF, no re-render/frame). All decorative 3D is `aria-hidden`; textual content always lives in sibling DOM.

**Tech Stack:** Next 16.2.7 (App Router, static export), React 19.2.4, three 0.184.0, @react-three/fiber 9.6.1, @react-three/drei 10.7.7, @react-three/postprocessing 3.0.4, GSAP+ScrollTrigger (existing `lib/motion.ts`), Lenis (existing `smooth-scroll.tsx`), Vitest (jsdom), Playwright.

**Spec:** `docs/superpowers/specs/2026-06-10-portfolio-v2.5-p13-foundation-design.md`. **Run all commands from `v2/`.** Next 16 ≠ training data — consult `node_modules/next/dist/docs/` when unsure. **Do NOT push.** Atomic commits, one per task, trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## File map
- Create `lib/webgl/capabilities.ts` — `GpuTier`, `resolveGpuTier`, `tierMeets`, `clampDpr` (pure).
- Create `lib/webgl/scroll-store.ts` — `ScrollStore`, `createScrollStore`, `clamp01` (pure).
- Create `components/three/use-gpu-tier.ts` — SSR-safe device→tier hook.
- Create `components/three/lazy-mount.tsx` — IntersectionObserver near-viewport gate.
- Create `components/three/scene-slot.tsx` — the fallback contract / 3D gateway.
- Create `components/three/adaptive-canvas.tsx` — drei Canvas + PerformanceMonitor DPR scaling.
- Create `components/three/use-scroll-bridge.ts` — ScrollTrigger progress → `ScrollStore`.
- Create `components/three/proof-scene.tsx` — throwaway R3F scene (client, never SSR).
- Create `components/three/proof-scene-mount.tsx` — `"use client"` dynamic(ssr:false) + `SceneSlot` wrapper.
- Modify `app/preview/page.tsx` — add a "3D Foundation" section rendering the proof mount.
- Create tests under `tests/unit/` and one `tests/e2e/three-foundation.spec.ts`.
- Create `docs/v2/FOUNDATION-3D.md`; update `docs/v2/ROADMAP-V2.5-SIGNATURE.md`.

**Deferred to later phases (do NOT do here):** preloader upgrade & page transitions → P17; any home-page 3D → P14; Higgsfield/Remotion → P15.

---

### Task 0: Add the R3F dependency stack

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install pinned versions**

Run (from `v2/`):
```bash
npm install three@0.184.0 @react-three/fiber@9.6.1 @react-three/drei@10.7.7 @react-three/postprocessing@3.0.4
npm install -D @types/three@0.184.1
```

- [ ] **Step 2: Verify install + no peer conflicts**

Run: `npm ls @react-three/fiber three react`
Expected: fiber 9.6.1, three 0.184.0, react 19.2.4, no `UNMET PEER DEPENDENCY`. (fiber peer is `react >=19 <19.3`; 19.2.4 satisfies it.)

- [ ] **Step 3: Confirm the build is still green with deps present but unused**

Run: `npm run build`
Expected: static export succeeds, routes `/`, `/preview`, `/preview/motion` emit. (three is not imported anywhere yet, so it must NOT appear in any chunk.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build(v2): add three + react-three-fiber/drei/postprocessing for P13 3D rig

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 1: `resolveGpuTier` + `tierMeets` + `clampDpr` (pure, TDD)

**Files:** Create `lib/webgl/capabilities.ts`, Test `tests/unit/webgl-capabilities.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { resolveGpuTier, tierMeets, clampDpr, type CapabilityInputs } from "@/lib/webgl/capabilities";

const base: CapabilityInputs = {
  reducedMotion: false,
  webgl2: true,
  deviceMemory: 8,
  hardwareConcurrency: 8,
  saveData: false,
  coarsePointer: false,
};

describe("resolveGpuTier", () => {
  it("returns 'high' for a capable desktop", () => {
    expect(resolveGpuTier(base)).toBe("high");
  });
  it("returns 'off' when reduced motion is requested", () => {
    expect(resolveGpuTier({ ...base, reducedMotion: true })).toBe("off");
  });
  it("returns 'off' when WebGL2 is unavailable", () => {
    expect(resolveGpuTier({ ...base, webgl2: false })).toBe("off");
  });
  it("returns 'off' under Save-Data", () => {
    expect(resolveGpuTier({ ...base, saveData: true })).toBe("off");
  });
  it("returns 'low' for low memory", () => {
    expect(resolveGpuTier({ ...base, deviceMemory: 4 })).toBe("low");
  });
  it("returns 'low' for few cores", () => {
    expect(resolveGpuTier({ ...base, hardwareConcurrency: 4 })).toBe("low");
  });
  it("returns 'low' for a coarse pointer (touch)", () => {
    expect(resolveGpuTier({ ...base, coarsePointer: true })).toBe("low");
  });
  it("ignores undefined optional signals (stays 'high')", () => {
    expect(resolveGpuTier({ reducedMotion: false, webgl2: true })).toBe("high");
  });
});

describe("tierMeets", () => {
  it("high meets low and high", () => {
    expect(tierMeets("high", "low")).toBe(true);
    expect(tierMeets("high", "high")).toBe(true);
  });
  it("low does not meet high", () => {
    expect(tierMeets("low", "high")).toBe(false);
  });
  it("off meets nothing above off", () => {
    expect(tierMeets("off", "low")).toBe(false);
  });
});

describe("clampDpr", () => {
  it("caps at max (default 2)", () => {
    expect(clampDpr(3)).toBe(2);
  });
  it("floors at 1", () => {
    expect(clampDpr(0.5)).toBe(1);
  });
  it("respects a custom max", () => {
    expect(clampDpr(2.5, 1.5)).toBe(1.5);
  });
  it("returns 1 for non-finite input", () => {
    expect(clampDpr(Number.NaN)).toBe(1);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run tests/unit/webgl-capabilities.test.ts`
Expected: FAIL — cannot resolve `@/lib/webgl/capabilities`.

- [ ] **Step 3: Implement**

```ts
// lib/webgl/capabilities.ts
export type GpuTier = "off" | "low" | "high";

export interface CapabilityInputs {
  /** prefers-reduced-motion is active. */
  reducedMotion: boolean;
  /** A WebGL2 context could be created. */
  webgl2: boolean;
  /** navigator.deviceMemory in GB (may be undefined). */
  deviceMemory?: number;
  /** navigator.hardwareConcurrency (may be undefined). */
  hardwareConcurrency?: number;
  /** navigator.connection.saveData. */
  saveData?: boolean;
  /** Touch-first / coarse pointer device. */
  coarsePointer?: boolean;
}

const RANK: Record<GpuTier, number> = { off: 0, low: 1, high: 2 };

/** Resolve a render tier from injected device signals. Pure — no window/navigator access. */
export function resolveGpuTier(i: CapabilityInputs): GpuTier {
  if (i.reducedMotion || !i.webgl2 || i.saveData) return "off";
  const lowMemory = i.deviceMemory !== undefined && i.deviceMemory <= 4;
  const lowCores = i.hardwareConcurrency !== undefined && i.hardwareConcurrency <= 4;
  if (lowMemory || lowCores || i.coarsePointer) return "low";
  return "high";
}

/** True when `tier` is at least `min`. */
export function tierMeets(tier: GpuTier, min: GpuTier): boolean {
  return RANK[tier] >= RANK[min];
}

/** Clamp a device pixel ratio into [1, max]; non-finite → 1. */
export function clampDpr(raw: number, max = 2): number {
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(raw, max);
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run tests/unit/webgl-capabilities.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add lib/webgl/capabilities.ts tests/unit/webgl-capabilities.test.ts
git commit -m "feat(v2): GPU capability tiering (resolveGpuTier/tierMeets/clampDpr)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `createScrollStore` + `clamp01` (pure, TDD)

**Files:** Create `lib/webgl/scroll-store.ts`, Test `tests/unit/scroll-store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createScrollStore, clamp01 } from "@/lib/webgl/scroll-store";

describe("clamp01", () => {
  it("clamps below 0", () => expect(clamp01(-0.5)).toBe(0));
  it("clamps above 1", () => expect(clamp01(1.4)).toBe(1));
  it("passes through in-range", () => expect(clamp01(0.42)).toBe(0.42));
  it("returns 0 for non-finite", () => expect(clamp01(Number.NaN)).toBe(0));
});

describe("createScrollStore", () => {
  it("starts at the clamped initial value", () => {
    expect(createScrollStore(2).get()).toBe(1);
  });
  it("defaults to 0", () => {
    expect(createScrollStore().get()).toBe(0);
  });
  it("set clamps and updates get", () => {
    const s = createScrollStore();
    s.set(0.7);
    expect(s.get()).toBe(0.7);
    s.set(5);
    expect(s.get()).toBe(1);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run tests/unit/scroll-store.test.ts`
Expected: FAIL — cannot resolve module.

- [ ] **Step 3: Implement**

```ts
// lib/webgl/scroll-store.ts
/** Clamp a number into [0,1]; non-finite → 0. */
export function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

export interface ScrollStore {
  /** Current progress in [0,1]. Read inside useFrame — does not trigger React renders. */
  get(): number;
  /** Write progress (clamped). */
  set(v: number): void;
}

/** A tiny mutable progress holder shared between a ScrollTrigger and a 3D frame loop. */
export function createScrollStore(initial = 0): ScrollStore {
  let value = clamp01(initial);
  return {
    get: () => value,
    set: (v: number) => {
      value = clamp01(v);
    },
  };
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run tests/unit/scroll-store.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/webgl/scroll-store.ts tests/unit/scroll-store.test.ts
git commit -m "feat(v2): scroll-progress store bridging ScrollTrigger and useFrame

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `useGpuTier` SSR-safe hook (TDD)

**Files:** Create `components/three/use-gpu-tier.ts`, Test `tests/unit/use-gpu-tier.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useGpuTier } from "@/components/three/use-gpu-tier";

function Probe() {
  return <span data-testid="tier">{useGpuTier()}</span>;
}

// Helper: install matchMedia + a webgl2-capable canvas getContext.
function installEnv({ reduce = false, webgl2 = true, coarse = false }) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: (q.includes("reduced-motion") && reduce) || (q.includes("coarse") && coarse),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (id: string) => (id === "webgl2" && webgl2 ? ({} as never) : null),
  );
}

beforeEach(() => {
  // 8 cores, 8GB by default so the heuristic yields "high".
  Object.defineProperty(navigator, "hardwareConcurrency", { value: 8, configurable: true });
  (navigator as unknown as { deviceMemory?: number }).deviceMemory = 8;
});
afterEach(() => vi.restoreAllMocks());

describe("useGpuTier", () => {
  it("resolves to 'high' on a capable device after mount", async () => {
    installEnv({});
    render(<Probe />);
    expect(await screen.findByText("high")).toBeInTheDocument();
  });
  it("resolves to 'off' under reduced motion", async () => {
    installEnv({ reduce: true });
    render(<Probe />);
    expect(await screen.findByText("off")).toBeInTheDocument();
  });
  it("resolves to 'off' when WebGL2 is unavailable", async () => {
    installEnv({ webgl2: false });
    render(<Probe />);
    expect(await screen.findByText("off")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run tests/unit/use-gpu-tier.test.tsx`
Expected: FAIL — cannot resolve `@/components/three/use-gpu-tier`.

- [ ] **Step 3: Implement**

```ts
// components/three/use-gpu-tier.ts
"use client";

import { useEffect, useState } from "react";
import { resolveGpuTier, type GpuTier, type CapabilityInputs } from "@/lib/webgl/capabilities";

function probeWebgl2(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

function readInputs(): CapabilityInputs {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    webgl2: probeWebgl2(),
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
    saveData: nav.connection?.saveData,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
  };
}

/**
 * SSR-safe GPU render tier. Returns "off" until mounted (so SSR/first paint always
 * renders the non-3D fallback), then resolves from the live device. Re-resolves when
 * the OS reduced-motion preference toggles.
 */
export function useGpuTier(): GpuTier {
  const [tier, setTier] = useState<GpuTier>("off");

  useEffect(() => {
    const update = () => setTier(resolveGpuTier(readInputs()));
    update();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return tier;
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run tests/unit/use-gpu-tier.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/three/use-gpu-tier.ts tests/unit/use-gpu-tier.test.tsx
git commit -m "feat(v2): SSR-safe useGpuTier device-capability hook

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: `LazyMount` IntersectionObserver gate (TDD)

**Files:** Create `components/three/lazy-mount.tsx`, Test `tests/unit/lazy-mount.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LazyMount } from "@/components/three/lazy-mount";

afterEach(() => vi.restoreAllMocks());

describe("LazyMount", () => {
  it("mounts children immediately when IntersectionObserver is unavailable", () => {
    const orig = globalThis.IntersectionObserver;
    // @ts-expect-error force the no-IO branch
    globalThis.IntersectionObserver = undefined;
    render(
      <LazyMount poster={<span data-testid="poster" />}>
        <span data-testid="child" />
      </LazyMount>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    globalThis.IntersectionObserver = orig;
  });

  it("shows poster first, then mounts children when intersecting", () => {
    let trigger: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {};
    class FakeIO {
      constructor(cb: (e: IntersectionObserverEntry[]) => void) {
        trigger = cb as never;
      }
      observe() {}
      disconnect() {}
    }
    // @ts-expect-error test double
    globalThis.IntersectionObserver = FakeIO;
    render(
      <LazyMount poster={<span data-testid="poster" />}>
        <span data-testid="child" />
      </LazyMount>,
    );
    expect(screen.getByTestId("poster")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeNull();
    trigger([{ isIntersecting: true }]);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run tests/unit/lazy-mount.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
// components/three/lazy-mount.tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazyMountProps {
  /** How early to mount before entering the viewport. */
  rootMargin?: string;
  /** Shown until the element nears the viewport. */
  poster?: ReactNode;
  children: ReactNode;
}

/** Renders `poster` until the wrapper nears the viewport, then mounts `children` once. */
export function LazyMount({ rootMargin = "200px", poster = null, children }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, visible]);

  return <div ref={ref}>{visible ? children : poster}</div>;
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run tests/unit/lazy-mount.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/three/lazy-mount.tsx tests/unit/lazy-mount.test.tsx
git commit -m "feat(v2): LazyMount IntersectionObserver near-viewport gate

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: `SceneSlot` fallback contract (TDD)

**Files:** Create `components/three/scene-slot.tsx`, Test `tests/unit/scene-slot.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { GpuTier } from "@/lib/webgl/capabilities";

let mockTier: GpuTier = "off";
vi.mock("@/components/three/use-gpu-tier", () => ({
  useGpuTier: () => mockTier,
}));
// Avoid IntersectionObserver gating in this test: mount children immediately.
vi.mock("@/components/three/lazy-mount", () => ({
  LazyMount: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { SceneSlot } from "@/components/three/scene-slot";

beforeEach(() => {
  mockTier = "off";
});

describe("SceneSlot", () => {
  it("renders only the fallback below minTier and never calls render()", () => {
    mockTier = "off";
    const renderScene = vi.fn(() => <span data-testid="scene" />);
    render(<SceneSlot minTier="low" fallback={<span data-testid="fallback" />} render={renderScene} />);
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("scene")).toBeNull();
    expect(renderScene).not.toHaveBeenCalled();
  });

  it("renders the scene when the tier meets minTier", () => {
    mockTier = "high";
    render(
      <SceneSlot minTier="low" fallback={<span data-testid="fallback" />} render={() => <span data-testid="scene" />} />,
    );
    expect(screen.getByTestId("scene")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run tests/unit/scene-slot.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
// components/three/scene-slot.tsx
"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { tierMeets, type GpuTier } from "@/lib/webgl/capabilities";
import { useGpuTier } from "./use-gpu-tier";
import { LazyMount } from "./lazy-mount";

interface SceneSlotProps {
  /**
   * Non-3D, content-equivalent visual. Rendered when the device is below `minTier`
   * AND used as the poster while the scene lazy-loads. (Real textual content lives
   * in sibling DOM, not here — this slot wraps only the decorative 3D layer.)
   */
  fallback: ReactNode;
  /** Minimum tier required to mount the scene. Default "low". */
  minTier?: GpuTier;
  /** IntersectionObserver pre-mount margin. */
  rootMargin?: string;
  className?: string;
  /** The 3D scene. Should be a `next/dynamic(..., { ssr:false })` component. */
  render: (tier: GpuTier) => ReactNode;
}

/**
 * The single gateway for all decorative 3D. Guarantees reduced-motion / no-WebGL
 * parity: below `minTier` it renders `fallback` only (no Canvas, no JS-3D). The
 * whole slot is aria-hidden because it is decorative.
 */
export function SceneSlot({ fallback, minTier = "low", rootMargin, className, render }: SceneSlotProps) {
  const tier = useGpuTier();

  if (!tierMeets(tier, minTier)) {
    return (
      <div className={className} aria-hidden>
        {fallback}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} aria-hidden>
      <LazyMount rootMargin={rootMargin} poster={fallback}>
        {render(tier)}
      </LazyMount>
    </div>
  );
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run tests/unit/scene-slot.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/three/scene-slot.tsx tests/unit/scene-slot.test.tsx
git commit -m "feat(v2): SceneSlot — the single gateway + fallback contract for 3D

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: `AdaptiveCanvas` (build-verified; no jsdom unit test)

**Files:** Create `components/three/adaptive-canvas.tsx`

> R3F's `<Canvas>` needs a real WebGL context, which jsdom lacks. This component is verified by `npm run build` (typecheck + bundling) and the Playwright pass in Task 9 — **do not** import it in a Vitest unit test.

- [ ] **Step 1: Implement**

```tsx
// components/three/adaptive-canvas.tsx
"use client";

import { useState, type ComponentProps } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { clampDpr } from "@/lib/webgl/capabilities";

type CanvasOwnProps = ComponentProps<typeof Canvas>;

interface AdaptiveCanvasProps extends Omit<CanvasOwnProps, "dpr"> {
  /** Upper DPR bound (lower bound is always 1). */
  maxDpr?: number;
}

/**
 * A drei <Canvas> that auto-scales device pixel ratio under sustained low FPS
 * (PerformanceMonitor) and caps it in [1, maxDpr]. Transparent (themes own the bg).
 */
export function AdaptiveCanvas({ children, maxDpr = 2, gl, camera, ...rest }: AdaptiveCanvasProps) {
  const [dpr, setDpr] = useState(() =>
    clampDpr(typeof window !== "undefined" ? window.devicePixelRatio : 1, maxDpr),
  );

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", ...gl }}
      camera={{ position: [0, 0, 5], fov: 45, ...camera }}
      {...rest}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => clampDpr(d - 0.5, maxDpr))}
        onIncline={() => setDpr((d) => clampDpr(d + 0.5, maxDpr))}
      />
      {children}
    </Canvas>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no type errors). If `ComponentProps<typeof Canvas>` rejects `gl`/`camera` spread, consult `node_modules/@react-three/fiber/dist/` types and adjust the prop names — do not `any`-cast.

- [ ] **Step 3: Commit**

```bash
git add components/three/adaptive-canvas.tsx
git commit -m "feat(v2): AdaptiveCanvas with PerformanceMonitor DPR scaling

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: `useScrollBridge` ScrollTrigger→store (build-verified)

**Files:** Create `components/three/use-scroll-bridge.ts`

> This wires a real ScrollTrigger; jsdom can't scroll, so it is build- + Playwright-verified. The pure store it writes to is already covered by Task 2.

- [ ] **Step 1: Implement**

```ts
// components/three/use-scroll-bridge.ts
"use client";

import { useRef, type RefObject } from "react";
import { ScrollTrigger, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { createScrollStore, type ScrollStore } from "@/lib/webgl/scroll-store";

interface BridgeOptions {
  /** Element whose scroll range drives progress. */
  trigger: RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
}

/**
 * Lenis-smoothed scroll progress [0,1] for `trigger`, readable inside useFrame via
 * the returned store's `get()` — no second RAF loop and no React re-render per frame.
 * Under reduced motion no ScrollTrigger is created; progress stays at 0 (start state).
 */
export function useScrollBridge({ trigger, start = "top bottom", end = "bottom top" }: BridgeOptions): ScrollStore {
  const storeRef = useRef<ScrollStore>(createScrollStore(0));
  registerGsap();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = ScrollTrigger.create({
        trigger: trigger.current,
        start,
        end,
        onUpdate: (self) => storeRef.current.set(self.progress),
      });
      return () => st.kill();
    },
    { scope: trigger },
  );

  return storeRef.current;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/three/use-scroll-bridge.ts
git commit -m "feat(v2): useScrollBridge — Lenis-smoothed scroll progress into a frame-loop store

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Proof scene + `/preview` integration (build- & browser-verified)

**Files:** Create `components/three/proof-scene.tsx`, Create `components/three/proof-scene-mount.tsx`, Modify `app/preview/page.tsx`

- [ ] **Step 1: Implement the proof scene**

```tsx
// components/three/proof-scene.tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { AdaptiveCanvas } from "./adaptive-canvas";
import { useScrollBridge } from "./use-scroll-bridge";
import type { ScrollStore } from "@/lib/webgl/scroll-store";

function Knot({ progress }: { progress: ScrollStore }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    m.rotation.x += delta * 0.2;
    m.rotation.y += delta * 0.25;
    // Scroll nudges the tilt — proves the Lenis→3D bridge works.
    m.rotation.z = progress.get() * Math.PI * 0.5;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1, 0.32, 160, 32]} />
      <meshStandardMaterial color="#00E5FF" wireframe metalness={0.2} roughness={0.5} />
    </mesh>
  );
}

/** Throwaway end-to-end proof of the P13 rig. Lives only on /preview. */
export function ProofScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollBridge({ trigger: wrap, start: "top bottom", end: "bottom top" });
  return (
    <div ref={wrap} className="relative h-[60vh] w-full">
      <AdaptiveCanvas>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <Knot progress={progress} />
      </AdaptiveCanvas>
    </div>
  );
}
```

> The `#00E5FF` here is the Neon-theme accent, used **only** in this throwaway `/preview` proof (never shipped on the home page). If the reviewer flags it, swap to a value read from the `--color-accent` CSS var via `getComputedStyle` — acceptable to leave as-is for the proof.

- [ ] **Step 2: Implement the client mount (dynamic, ssr:false) + SceneSlot**

```tsx
// components/three/proof-scene-mount.tsx
"use client";

import dynamic from "next/dynamic";
import { SceneSlot } from "./scene-slot";

const ProofScene = dynamic(() => import("./proof-scene").then((m) => m.ProofScene), {
  ssr: false,
});

/** Mounts the proof scene through the real SceneSlot gateway (tier + lazy gating). */
export function ProofSceneMount() {
  return (
    <SceneSlot
      minTier="low"
      className="h-[60vh] w-full overflow-hidden rounded-xl border border-border bg-surface"
      fallback={
        <div className="grid h-full place-items-center px-6 text-center font-mono text-sm text-muted">
          3D disabled (reduced motion, Save-Data, or no WebGL2) — content stays fully accessible.
        </div>
      }
      render={() => <ProofScene />}
    />
  );
}
```

- [ ] **Step 3: Add a section to the preview page**

In `app/preview/page.tsx`: add the import at the top with the other imports:
```tsx
import { ProofSceneMount } from "@/components/three/proof-scene-mount";
```
Then add this `<Section>` immediately before the closing `</main>` (match the existing `<Section eyebrow=... heading=...>` usage on the page):
```tsx
      <Section eyebrow="3D Foundation" heading="WebGL rig proof (P13)">
        <p className="mb-6 max-w-prose text-muted">
          Decorative scene mounted through the SceneSlot gateway: lazy-loaded, DPR-scaled,
          scroll-bridged, and replaced by an accessible fallback under reduced motion / no WebGL.
        </p>
        <ProofSceneMount />
      </Section>
```

- [ ] **Step 4: Build — confirm static export + code-splitting**

Run: `npm run build`
Expected: PASS. In the build output, the `three`/R3F code must appear in a **separate lazily-loaded chunk**, NOT in the shared/home route's first-load JS. Record the home route First Load JS number (Task 10 uses it).

- [ ] **Step 5: Commit**

```bash
git add components/three/proof-scene.tsx components/three/proof-scene-mount.tsx app/preview/page.tsx
git commit -m "feat(v2): P13 proof scene on /preview through the SceneSlot rig

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: E2E — proof scene mounts; reduced motion shows fallback

**Files:** Create `tests/e2e/three-foundation.spec.ts`

- [ ] **Step 1: Write the test**

```ts
import { test, expect } from "@playwright/test";

test.describe("P13 3D foundation (/preview)", () => {
  test("mounts a WebGL canvas after scrolling to the proof section", async ({ page }) => {
    await page.goto("/preview/");
    const heading = page.getByRole("heading", { name: "WebGL rig proof (P13)" });
    await heading.scrollIntoViewIfNeeded();
    // The scene lazy-mounts; poll until the canvas appears (or the fallback if no WebGL in this browser).
    await expect(async () => {
      const canvas = await page.locator("#main, main").locator("canvas").count();
      const fallback = await page.getByText("3D disabled", { exact: false }).count();
      expect(canvas + fallback).toBeGreaterThan(0);
    }).toPass({ timeout: 10_000 });
  });

  test("reduced motion renders the accessible fallback and no canvas", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/preview/");
    await page.getByRole("heading", { name: "WebGL rig proof (P13)" }).scrollIntoViewIfNeeded();
    await expect(page.getByText("3D disabled", { exact: false })).toBeVisible();
    await expect(page.locator("main canvas")).toHaveCount(0);
    await context.close();
  });
});
```

> Note: headless Chromium/Firefox/WebKit WebGL support varies in CI. The first test passes if **either** a canvas or the fallback is present (the rig behaved correctly for that environment). The second test is the meaningful guarantee: reduced motion ⇒ fallback, never a canvas.

- [ ] **Step 2: Run the e2e (full cross-browser)**

Run: `npm run test:e2e -- three-foundation`
Expected: PASS on chromium/firefox/webkit. If a lone failure looks load-related, re-run that one in isolation before treating it as real (known dev-server-contention flake pattern).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/three-foundation.spec.ts
git commit -m "test(v2): e2e for P13 3D rig — lazy mount + reduced-motion fallback

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: Perf-budget evidence, docs, roadmap update

**Files:** Create `docs/v2/FOUNDATION-3D.md`, Modify `docs/v2/ROADMAP-V2.5-SIGNATURE.md`

- [ ] **Step 1: Capture the perf-budget evidence**

Run: `npm run build`
Confirm: home route (`/`) First Load JS is **unchanged vs the Task 0 baseline** (three only loads in the `/preview` proof chunk). Note both numbers for the report.

- [ ] **Step 2: Write `docs/v2/FOUNDATION-3D.md`**

```markdown
# 3D Foundation (P13) — the WebGL rig contract

Reusable, a11y-safe 3D rig for P14+ (built on existing Lenis + GSAP ScrollTrigger). No home-page 3D yet.

## How to add a 3D scene (the only sanctioned path)
Wrap the decorative 3D layer in `SceneSlot`. Real textual content stays in sibling DOM, always present.

\`\`\`tsx
"use client";
import dynamic from "next/dynamic";
import { SceneSlot } from "@/components/three/scene-slot";
const MyScene = dynamic(() => import("./my-scene").then((m) => m.MyScene), { ssr: false });

<SceneSlot
  minTier="low"                       // won't mount below this device tier
  fallback={<StaticPoster />}         // shown under reduced motion / no WebGL / while loading
  render={() => <MyScene />}
/>;
\`\`\`

## Pieces
- `lib/webgl/capabilities.ts` — `resolveGpuTier` (off/low/high), `tierMeets`, `clampDpr`. Pure, tested.
- `components/three/use-gpu-tier.ts` — SSR-safe device probe; "off" until mounted; re-resolves on RM toggle.
- `components/three/scene-slot.tsx` — the gateway + fallback contract; aria-hidden (decorative).
- `components/three/lazy-mount.tsx` — IntersectionObserver gate (three chunk loads only near viewport).
- `components/three/adaptive-canvas.tsx` — drei Canvas + PerformanceMonitor DPR scaling, capped [1,2].
- `components/three/use-scroll-bridge.ts` + `lib/webgl/scroll-store.ts` — ScrollTrigger progress → a
  mutable store read inside `useFrame` (no extra RAF, no re-render/frame). RM ⇒ progress fixed at 0.

## Guarantees
- Reduced motion / Save-Data / no-WebGL2 ⇒ tier "off" ⇒ fallback only, no Canvas, no scroll trap.
- `three` stays out of the home route's first-load JS (dynamic ssr:false + lazy mount).
- DPR clamped to [1,2] and stepped down under sustained low FPS.

## Verify
`npm run build` (static export + code-split), `npm test` (pure logic), `npm run test:e2e -- three-foundation`,
then Playwright MCP on `/preview` across 4 themes + mobile + a reduced-motion context.
```

- [ ] **Step 3: Update the roadmap status**

In `docs/v2/ROADMAP-V2.5-SIGNATURE.md`, change the P13 row Status from `spec'd` to `done`, and the P14 row from `pending` to `next`.

- [ ] **Step 4: Full gate sweep**

Run, from `v2/`:
```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```
Expected: all green (unit suite includes the 5 new files; e2e includes the new spec; the known firefox `/preview` axe flake is pre-existing — not introduced here).

- [ ] **Step 5: Commit**

```bash
git add docs/v2/FOUNDATION-3D.md docs/v2/ROADMAP-V2.5-SIGNATURE.md
git commit -m "docs(v2): P13 3D foundation contract + roadmap status

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-review (completed by plan author)

**Spec coverage:** §3 deps→T0; §4.1 capabilities→T1; §4.2 use-gpu-tier→T3; §4.3 SceneSlot→T5; §4.4 AdaptiveCanvas→T6; §4.5 LazyMount→T4; §4.6 scroll bridge→T2(store)+T7; §4.7 preloader→**explicitly deferred to P17** (noted in file map; YAGNI — wired where used); §4.8 proof scene→T8; §5 perf budget→T8 step4 + T10; §6 a11y/RM→T5 (aria-hidden + fallback), T9 (RM e2e); §7 testing→T1–T5,T9; §9 deliverables→all; docs→T10.

**Placeholder scan:** none — every code step has complete code; commands have expected output.

**Type consistency:** `GpuTier`/`CapabilityInputs` (T1) reused in T3/T5; `ScrollStore`/`createScrollStore` (T2) reused in T7/T8; `tierMeets`/`clampDpr` (T1) reused in T5/T6; `useGpuTier` (T3) consumed in T5; `SceneSlot` (T5) consumed in T8; `LazyMount` (T4) consumed in T5; `AdaptiveCanvas`/`useScrollBridge` (T6/T7) consumed in T8. Consistent.

**Deviation from spec:** preloader (§4.7) deferred to P17 to avoid touching `preloader.tsx` with unused code (YAGNI) — flagged for the user in the spec's "light touch / deferrable" clause.
