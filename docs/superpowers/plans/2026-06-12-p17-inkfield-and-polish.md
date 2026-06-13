# P17 Inkfield Hero + Micro-Interaction Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cursor-stirred, scroll-morphing liquid-ink particle hero (new default) + unified cursor/button/card/View-Transition/load polish.

**Architecture:** New `InkfieldScene` (one `<points>` + custom ShaderMaterial; stateless GPU field from seed/time/scroll/pointer uniforms) rides the existing P13 rig (`SceneSlot` passes `tier` to `render`). Pure logic (lattice targets, tier counts, pointer mapping, cursor state reducer) is TDD'd in `lib/`. Polish layers on existing components (cursor, preloader, modal, globals tokens). Spec: `docs/superpowers/specs/2026-06-12-p17-inkfield-and-polish-design.md`.

**Tech Stack:** R3F 9 + three 0.184 (custom GLSL), GSAP, next-themes palettes, Tailwind v4 `@theme` tokens, Vitest, Playwright.

**Conventions:** One conventional commit per task, trailer exactly `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Explicit `git add` paths. Never push. Never import R3F/drei in Vitest tests (jsdom has no WebGL).

---

### Task 1: Inkfield pure logic (TDD)

**Files:**
- Create: `lib/hero/inkfield.ts`
- Test: `tests/unit/inkfield.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/inkfield.test.ts
import { describe, expect, it } from "vitest";
import {
  latticeTargets,
  particleCountForTier,
  pointerToScene,
} from "@/lib/hero/inkfield";

describe("latticeTargets", () => {
  it("returns count*3 floats, deterministic, centered, within bounds", () => {
    const a = latticeTargets(500);
    const b = latticeTargets(500);
    expect(a).toHaveLength(1500);
    expect(Array.from(a)).toEqual(Array.from(b)); // deterministic
    let sx = 0;
    for (let i = 0; i < a.length; i += 3) {
      sx += a[i];
      expect(Math.abs(a[i])).toBeLessThanOrEqual(3.2); // x bound
      expect(Math.abs(a[i + 1])).toBeLessThanOrEqual(1.8); // y bound
      expect(Math.abs(a[i + 2])).toBeLessThanOrEqual(0.4); // shallow z
    }
    expect(Math.abs(sx / (a.length / 3))).toBeLessThan(0.2); // roughly centered
  });

  it("throws on non-positive count", () => {
    expect(() => latticeTargets(0)).toThrow();
  });
});

describe("particleCountForTier", () => {
  it("maps tiers to counts with a safe default", () => {
    expect(particleCountForTier("high")).toBe(12000);
    expect(particleCountForTier("mid")).toBe(5000);
    expect(particleCountForTier("low")).toBe(2500);
    expect(particleCountForTier("off")).toBe(0);
    // @ts-expect-error unknown tier falls back safely
    expect(particleCountForTier("weird")).toBe(2500);
  });
});

describe("pointerToScene", () => {
  it("maps client coords to scene coords within the hero rect", () => {
    const rect = { left: 0, top: 0, width: 1000, height: 500 };
    expect(pointerToScene(500, 250, rect)).toEqual({ x: 0, y: 0 });
    const p = pointerToScene(1000, 0, rect);
    expect(p.x).toBeCloseTo(3.2);
    expect(p.y).toBeCloseTo(1.8);
  });
});
```

- [ ] **Step 2: Run to verify FAIL** — `npx vitest run tests/unit/inkfield.test.ts` → cannot resolve module.

- [ ] **Step 3: Implement**

```ts
// lib/hero/inkfield.ts
// Pure math for the Inkfield hero. No three.js imports — unit-testable in jsdom.
import type { GpuTier } from "@/lib/webgl/capabilities";

/** Scene-space half-extents of the hero field (camera at z=5, fov 45 ≈ ±3.2 × ±1.8). */
export const FIELD_X = 3.2;
export const FIELD_Y = 1.8;
const FIELD_Z = 0.4;

/**
 * Deterministic lattice target positions (Float32Array xyz triplets): a centered
 * grid spanning the hero bounds with a tiny hashed z offset so the resolved state
 * still has depth. Same count → identical output (stable across remounts).
 */
export function latticeTargets(count: number): Float32Array {
  if (count <= 0) throw new Error(`latticeTargets: non-positive count ${count}`);
  const aspect = FIELD_X / FIELD_Y;
  const rows = Math.max(1, Math.round(Math.sqrt(count / aspect)));
  const cols = Math.max(1, Math.ceil(count / rows));
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const fx = cols === 1 ? 0.5 : c / (cols - 1);
    const fy = rows === 1 ? 0.5 : r / (rows - 1);
    // deterministic hash for shallow z depth
    const h = Math.sin(i * 12.9898) * 43758.5453;
    const z = ((h - Math.floor(h)) - 0.5) * 2 * FIELD_Z;
    out[i * 3] = (fx - 0.5) * 2 * FIELD_X;
    out[i * 3 + 1] = (fy - 0.5) * 2 * FIELD_Y;
    out[i * 3 + 2] = z;
  }
  return out;
}

const TIER_COUNTS: Record<string, number> = { high: 12000, mid: 5000, low: 2500, off: 0 };

/** Particle budget per GPU tier; unknown values get the conservative low budget. */
export function particleCountForTier(tier: GpuTier): number {
  return TIER_COUNTS[tier] ?? 2500;
}

export interface SceneRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Map client pixel coords to Inkfield scene coords (x right, y up, centered). */
export function pointerToScene(clientX: number, clientY: number, rect: SceneRect): { x: number; y: number } {
  const nx = rect.width > 0 ? (clientX - rect.left) / rect.width : 0.5;
  const ny = rect.height > 0 ? (clientY - rect.top) / rect.height : 0.5;
  return { x: (nx - 0.5) * 2 * FIELD_X, y: (0.5 - ny) * 2 * FIELD_Y };
}
```

- [ ] **Step 4: Run to verify PASS** — `npx vitest run tests/unit/inkfield.test.ts` (5 tests).
- [ ] **Step 5: Commit**

```bash
git add lib/hero/inkfield.ts tests/unit/inkfield.test.ts
git commit -m "feat(v2): inkfield pure math — lattice targets, tier budgets, pointer mapping (TDD)"
```

---

### Task 2: `ink` variant + new default (TDD on existing suite)

**Files:**
- Modify: `lib/hero/hero-variant.ts`
- Modify: `lib/site.ts` (the `HERO_3D_DEFAULT` line)
- Test: `tests/unit/hero-variant.test.ts` (extend existing)

- [ ] **Step 1: Extend the existing test file** — add inside its describe block:

```ts
it("accepts the ink variant", () => {
  expect(parseHeroVariant("?hero=ink")).toBe("ink");
});
```

Also update any existing assertion that lists variants/defaults if it conflicts (read the file first; keep its existing style and default-fallback assertions intact — the fallback param default changes to "ink").

- [ ] **Step 2: Run to verify FAIL** — `npx vitest run tests/unit/hero-variant.test.ts`.

- [ ] **Step 3: Implement** — in `lib/hero/hero-variant.ts`:

```ts
export const HERO_VARIANTS = ["ink", "restrained", "bold", "off"] as const;
```

and change the parse fallback default:

```ts
export function parseHeroVariant(search: string, fallback: HeroVariant = "ink"): HeroVariant {
```

In `lib/site.ts` change the constant line to:

```ts
export const HERO_3D_DEFAULT: import("./hero/hero-variant").HeroVariant = "ink";
```

- [ ] **Step 4: Run FULL unit suite** — `npx vitest run` (catches any test pinned to the old default). Fix only assertions that hardcode `"restrained"` as the expected default.
- [ ] **Step 5: Commit**

```bash
git add lib/hero/hero-variant.ts lib/site.ts tests/unit/hero-variant.test.ts
git commit -m "feat(v2): ink hero variant becomes the default (?hero= flag keeps all variants live)"
```

---

### Task 3: InkfieldScene (shader) + mount routing

**Files:**
- Create: `components/three/hero/inkfield-scene.tsx`
- Modify: `components/three/hero/hero-scene-mount.tsx`

- [ ] **Step 1: Create the scene**

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AdaptiveCanvas } from "../adaptive-canvas";
import { useScrollBridge } from "../use-scroll-bridge";
import { useThemePalette } from "../use-hero-variant";
import { latticeTargets, particleCountForTier } from "@/lib/hero/inkfield";
import type { GpuTier } from "@/lib/webgl/capabilities";

const VERT = /* glsl */ `
  attribute vec3 aSeed;
  attribute vec3 aTarget;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform float uDpr;
  varying float vMix;

  // Cheap organic flow field: layered sines stand in for curl noise.
  vec3 flowField(vec3 p, float t) {
    return vec3(
      sin(p.y * 1.7 + t * 0.6) + sin(p.z * 1.3 + t * 0.4),
      sin(p.z * 1.5 + t * 0.5) + sin(p.x * 1.1 + t * 0.7),
      sin(p.x * 1.9 + t * 0.3) + sin(p.y * 1.2 + t * 0.5)
    ) * 0.35;
  }

  void main() {
    vec3 pos = aSeed + flowField(aSeed * 1.6, uTime);

    // Cursor vortex: tangential swirl + slight pull inside the influence radius.
    vec2 d = pos.xy - uPointer;
    float r = length(d);
    float infl = smoothstep(1.6, 0.0, r);
    pos.xy += vec2(-d.y, d.x) * infl * 0.55;
    pos.xy -= d * infl * 0.18;

    // Scroll resolves chaos into the lattice, staggered per particle.
    float m = smoothstep(0.0, 1.0, clamp((uScroll - fract(aSeed.x * 7.31) * 0.25) / 0.75, 0.0, 1.0));
    pos = mix(pos, aTarget, m);
    vMix = m;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.2 + 1.4 * fract(aSeed.y * 5.17)) * uDpr * (5.0 / max(0.5, -mv.z));
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vMix;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.08, d) * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(mix(uColorA, uColorB, vMix), alpha);
  }
`;

function Field({ tier, progressRef }: { tier: GpuTier; progressRef: { get(): number } }) {
  const palette = useThemePalette();
  const dark = palette.colorScheme === "dark";
  const points = useRef<THREE.Points>(null);
  const { gl, viewport } = useThree();
  const count = particleCountForTier(tier);

  const { seeds, targets } = useMemo(() => {
    const s = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // deterministic spread across the field bounds
      const h1 = Math.sin(i * 12.9898) * 43758.5453;
      const h2 = Math.sin(i * 78.233) * 12543.853;
      const h3 = Math.sin(i * 39.425) * 26781.213;
      s[i * 3] = ((h1 - Math.floor(h1)) - 0.5) * 6.4;
      s[i * 3 + 1] = ((h2 - Math.floor(h2)) - 0.5) * 3.6;
      s[i * 3 + 2] = ((h3 - Math.floor(h3)) - 0.5) * 1.2;
    }
    return { seeds: s, targets: latticeTargets(count) };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(99, 99) }, // far away until first move
      uDpr: { value: Math.min(gl.getPixelRatio(), 2) },
      uColorA: { value: new THREE.Color(dark ? palette.accent : palette.heading) },
      uColorB: { value: new THREE.Color(dark ? palette.accent2 : palette.accent) },
      uOpacity: { value: dark ? 0.85 : 0.55 },
    }),
    // palette/dark changes rebuild colors; gl stable per canvas
    [gl, dark, palette.accent, palette.accent2, palette.heading],
  );

  useFrame((state, delta) => {
    const u = uniforms;
    u.uTime.value += delta;
    u.uScroll.value = progressRef.get();
    // pointer in scene space from r3f's normalized pointer (-1..1)
    u.uPointer.value.set(state.pointer.x * 3.2, state.pointer.y * 1.8);
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[seeds, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[targets, 3]} />
      </bufferGeometry>
      {/* key forces a clean material rebuild on theme change — swapping a live
          uniforms object identity mid-flight is an R3F pitfall */}
      <shaderMaterial
        key={`${palette.accent}-${dark}`}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/**
 * "Inkfield" hero — luminous ink particles in an organic flow field; the cursor
 * stirs them (vortex), scroll resolves chaos into an ordered lattice. Dark themes:
 * additive luminous ink. Light themes: normal-blended dark ink on paper (the
 * Signal film's two grades, live). Decorative only — parent mount is aria-hidden.
 */
export function InkfieldScene({ tier }: { tier: GpuTier }) {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollBridge({ trigger: wrap, start: "top top", end: "bottom top" });

  return (
    <div ref={wrap} className="h-full w-full">
      <AdaptiveCanvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Field tier={tier} progressRef={progress} />
      </AdaptiveCanvas>
    </div>
  );
}
```

Note: `pointerToScene` stays exported from the lib (unit-tested contract) even though the scene reads r3f's normalized `state.pointer` directly.

- [ ] **Step 2: Route the mount** — `components/three/hero/hero-scene-mount.tsx` becomes:

```tsx
"use client";

import dynamic from "next/dynamic";
import { SceneSlot } from "../scene-slot";
import { useHeroVariant } from "../use-hero-variant";

const EditorialScene = dynamic(() => import("./editorial-scene").then((m) => m.EditorialScene), {
  ssr: false,
});
const ConstellationScene = dynamic(
  () => import("./constellation-scene").then((m) => m.ConstellationScene),
  { ssr: false },
);
const InkfieldScene = dynamic(() => import("./inkfield-scene").then((m) => m.InkfieldScene), {
  ssr: false,
});

/**
 * Decorative hero 3D layer. Picks the variant (`?hero=` / default), lazily loads it,
 * and routes it through the SceneSlot gateway so reduced-motion / no-WebGL / low-tier
 * fall back to the static hero (fallback={null} — the aurora already provides atmosphere).
 */
export function HeroSceneMount() {
  const variant = useHeroVariant();
  if (variant === "off") return null;

  return (
    <div aria-hidden data-cursor="field" className="pointer-events-none absolute inset-0 z-0">
      <SceneSlot
        minTier={variant === "bold" ? "high" : "low"}
        className="h-full w-full"
        fallback={null}
        render={(tier) =>
          variant === "ink" ? (
            <InkfieldScene tier={tier} />
          ) : variant === "bold" ? (
            <ConstellationScene />
          ) : (
            <EditorialScene />
          )
        }
      />
    </div>
  );
}
```

- [ ] **Step 3: Gates** — `npm run lint && npm run typecheck && npx vitest run && npm run build`. All green (scene is never imported by unit tests).
- [ ] **Step 4: Manual smoke (implementer)** — `npm run build` then serve `out/` and confirm `/?hero=ink` shows a particle field in a real browser if available; otherwise note for orchestrator visual pass.
- [ ] **Step 5: Commit**

```bash
git add components/three/hero/inkfield-scene.tsx components/three/hero/hero-scene-mount.tsx
git commit -m "feat(v2): Inkfield hero scene — cursor-stirred ink particles resolving to lattice on scroll"
```

---

### Task 4: Cursor state machine (TDD) + cursor upgrade

**Files:**
- Create: `lib/cursor-state.ts`
- Test: `tests/unit/cursor-state.test.ts`
- Modify: `components/layout/custom-cursor.tsx`

- [ ] **Step 1: Failing test**

```ts
// tests/unit/cursor-state.test.ts
import { describe, expect, it } from "vitest";
import { cursorStateFor } from "@/lib/cursor-state";

function el(html: string): Element {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root.querySelector("[data-probe]")!;
}

describe("cursorStateFor", () => {
  it("returns view for data-cursor=view ancestors", () => {
    expect(cursorStateFor(el(`<article data-cursor="view"><h3 data-probe>x</h3></article>`))).toBe("view");
  });
  it("returns field for the hero field layer", () => {
    expect(cursorStateFor(el(`<div data-cursor="field"><canvas data-probe></canvas></div>`))).toBe("field");
  });
  it("returns link for interactive elements", () => {
    expect(cursorStateFor(el(`<a href="#" data-probe>x</a>`))).toBe("link");
    expect(cursorStateFor(el(`<button data-probe>x</button>`))).toBe("link");
    expect(cursorStateFor(el(`<div role="button" data-probe>x</div>`))).toBe("link");
  });
  it("data-cursor wins over tag heuristics", () => {
    expect(cursorStateFor(el(`<a href="#" data-cursor="view" data-probe>x</a>`))).toBe("view");
  });
  it("returns default otherwise and for null", () => {
    expect(cursorStateFor(el(`<p data-probe>x</p>`))).toBe("default");
    expect(cursorStateFor(null)).toBe("default");
  });
});
```

- [ ] **Step 2: Run to FAIL**, then **Step 3: implement**

```ts
// lib/cursor-state.ts
export type CursorState = "default" | "link" | "view" | "field";

const INTERACTIVE = "a,button,[role='button'],input,textarea,select,[data-cursor='hover']";

/** Resolve the cursor state for a hovered element: explicit data-cursor wins, then tag heuristics. */
export function cursorStateFor(target: Element | null): CursorState {
  if (!target) return "default";
  const tagged = target.closest("[data-cursor]");
  const v = tagged?.getAttribute("data-cursor");
  if (v === "view" || v === "field") return v;
  if (target.closest(INTERACTIVE)) return "link";
  return "default";
}
```

- [ ] **Step 4: PASS**, then **Step 5: upgrade the cursor component** — replace the `onOver` handler block and ring markup in `components/layout/custom-cursor.tsx`:

Replace the import line to add the reducer:

```ts
import { cursorStateFor, type CursorState } from "@/lib/cursor-state";
```

Replace the existing `onOver` with:

```ts
let state: CursorState = "default";
const label = ring.querySelector<HTMLElement>("[data-cursor-label]")!;
const onOver = contextSafe!((e: PointerEvent) => {
  const next = cursorStateFor(e.target as Element);
  if (next === state) return;
  state = next;
  const scale = next === "view" ? 2.6 : next === "link" ? 1.8 : next === "field" ? 1.2 : 1;
  gsap.to(ring, { scale, duration: 0.3, ease: "power3" });
  gsap.to(label, { opacity: next === "view" ? 1 : 0, duration: 0.2 });
  ring.classList.toggle("cursor-crosshair", next === "field");
});
```

Replace the returned ring `<div>` with (dot unchanged):

```tsx
<div
  ref={ringRef}
  aria-hidden
  className="pointer-events-none fixed left-0 top-0 z-[9999] flex h-8 w-8 items-center justify-center rounded-full border border-foreground mix-blend-difference [&.cursor-crosshair]:border-dashed"
>
  <span
    data-cursor-label
    className="font-mono text-[8px] uppercase tracking-widest text-foreground opacity-0"
  >
    View
  </span>
</div>
```

Add `data-cursor="view"` to the project card root element (find it in `components/sections/projects/` — the clickable card wrapper; one attribute, no other changes). The hero field layer already got `data-cursor="field"` in Task 3.

- [ ] **Step 6: Gates** — `npm run lint && npm run typecheck && npx vitest run` (cursor reducer suite green; full suite green).
- [ ] **Step 7: Commit**

```bash
git add lib/cursor-state.ts tests/unit/cursor-state.test.ts components/layout/custom-cursor.tsx components/sections/projects
git commit -m "feat(v2): state-aware cursor — view label on cards, crosshair over inkfield (TDD reducer)"
```

---

### Task 5: Easing tokens + button/card/nav states

**Files:**
- Modify: `app/globals.css` (add to the `@theme` block + utilities)
- Modify: `components/ui/button.tsx` (sheen — read it first, add the pseudo-element classes to the primary variant)
- Modify: card components: project card, `components/sections/hobbies/index.tsx` cards, docs/credential cards in About (locate via `rounded-2xl border border-border bg-surface` pattern)
- Modify: `components/layout/site-nav.tsx` (underline)

- [ ] **Step 1: Tokens** — inside the existing `@theme` block in `app/globals.css` add:

```css
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 200ms;
  --duration-slow: 400ms;
```

After the `@theme` block add the shared state utilities:

```css
/* P17 unified interaction states (motion-safe; focus parity mirrors hover) */
@media (prefers-reduced-motion: no-preference) {
  .card-lift {
    transition:
      transform var(--duration-fast) var(--ease-out-expo),
      border-color var(--duration-fast) var(--ease-out-expo),
      box-shadow var(--duration-slow) var(--ease-out-expo);
  }
}
.card-lift:hover,
.card-lift:focus-within {
  transform: translateY(-4px);
  border-color: color-mix(in oklab, var(--accent) 45%, var(--border));
  box-shadow: 0 12px 40px -18px color-mix(in oklab, var(--accent) 35%, transparent);
}

.btn-sheen {
  position: relative;
  overflow: hidden;
}
.btn-sheen::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-120%) skewX(-18deg);
  background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--on-accent) 30%, transparent), transparent);
  pointer-events: none;
}
@media (prefers-reduced-motion: no-preference) {
  .btn-sheen:hover::after,
  .btn-sheen:focus-visible::after {
    transform: translateX(120%) skewX(-18deg);
    transition: transform 0.7s var(--ease-out-expo);
  }
}

.nav-underline {
  position: relative;
}
.nav-underline::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 1px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
}
@media (prefers-reduced-motion: no-preference) {
  .nav-underline::after {
    transition: transform var(--duration-fast) var(--ease-out-expo);
  }
}
.nav-underline:hover::after,
.nav-underline:focus-visible::after,
.nav-underline[aria-current]::after {
  transform: scaleX(1);
}
```

Note: if the `@theme` tokens `--on-accent` / `--accent` / `--border` have different custom-property names in this globals.css, match the existing names (check the `:root`/theme blocks) — do not invent new ones.

- [ ] **Step 2: Apply classes** — add `card-lift` to: project card root, `SecondaryCard`/`FeaturedCard` roots in hobbies, the Documents & Credentials cards in About. Add `btn-sheen` to the primary Button variant only. Add `nav-underline` to desktop nav links in `site-nav.tsx` (replace any existing ad-hoc underline hover if present — one language). Keep every existing class.
- [ ] **Step 3: Gates + visual sanity** — lint/typecheck/unit/build green.
- [ ] **Step 4: Commit**

```bash
git add app/globals.css components/ui/button.tsx components/sections/hobbies/index.tsx components/layout/site-nav.tsx components/sections/projects
git commit -m "feat(v2): unified interaction language — easing tokens, card lift, button sheen, nav underline"
```

(Adjust staged paths to the actual card files touched.)

---

### Task 6: Project modal View-Transition morph

**Files:**
- Create: `lib/view-transition.ts`
- Test: `tests/unit/view-transition.test.ts`
- Modify: `components/ui/modal.tsx` + the project card click site (read both first)

- [ ] **Step 1: Failing test**

```ts
// tests/unit/view-transition.test.ts
import { describe, expect, it, vi } from "vitest";
import { withViewTransition } from "@/lib/view-transition";

describe("withViewTransition", () => {
  it("runs the callback directly when startViewTransition is unsupported", () => {
    const cb = vi.fn();
    // jsdom has no startViewTransition — must call through synchronously
    withViewTransition(cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("uses document.startViewTransition when available", () => {
    const cb = vi.fn();
    const start = vi.fn((fn: () => void) => fn());
    (document as unknown as { startViewTransition: typeof start }).startViewTransition = start;
    withViewTransition(cb);
    expect(start).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledTimes(1);
    delete (document as unknown as { startViewTransition?: typeof start }).startViewTransition;
  });
});
```

- [ ] **Step 2: FAIL**, **Step 3: implement**

```ts
// lib/view-transition.ts
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Run a DOM mutation inside a same-document View Transition when the browser
 * supports it (and motion is allowed); otherwise just run it. Never throws on
 * unsupported browsers — Firefox et al. get the plain mutation.
 */
export function withViewTransition(mutate: () => void): void {
  const start = (document as Document & { startViewTransition?: (cb: () => void) => unknown })
    .startViewTransition;
  if (typeof start !== "function" || prefersReducedMotion()) {
    mutate();
    return;
  }
  start.call(document, mutate);
}
```

(If `lib/motion.ts`'s `prefersReducedMotion` touches `window` at import time, import it lazily inside the function — check first; the theme-switcher already uses a VT pattern, mirror it.)

- [ ] **Step 4: PASS**, **Step 5: wire the modal** — read `components/ui/modal.tsx` and the project card open/close call sites. On open: set `style.viewTransitionName = "project-hero"` on the clicked card's cover element, call `withViewTransition(openStateMutation)`, then clear the name after the transition (next frame). Give the modal's header image/title block `[view-transition-name:project-hero]` while open. On close: reverse. Keep focus management exactly as-is (the existing Escape/restore-focus e2e must stay green). Add to `globals.css` reduced-motion kill block (it already neutralizes `::view-transition-*` animations — extend if it targets specific names only).
- [ ] **Step 6: Gates** — lint/typecheck/unit + `npx playwright test tests/e2e/projects.spec.ts` (all 3 browsers — Firefox exercises the no-VT path).
- [ ] **Step 7: Commit**

```bash
git add lib/view-transition.ts tests/unit/view-transition.test.ts components/ui/modal.tsx components/sections/projects app/globals.css
git commit -m "feat(v2): project modal opens via View Transition morph with graceful non-VT fallback"
```

---

### Task 7: Ink-drop preloader reveal

**Files:**
- Modify: `components/layout/preloader.tsx` (timeline only — session/RM/inert/skip contracts unchanged)

- [ ] **Step 1: Replace the exit animation** — in the GSAP timeline, replace the `yPercent: -100` wipe line with an expanding-circle clip-path reveal:

```ts
tl.set(rootRef.current, { clipPath: "circle(150% at 50% 50%)" });
tl.to(
  rootRef.current,
  {
    clipPath: "circle(0% at 50% 50%)",
    duration: 0.7,
    ease: "power3.inOut",
  },
  "+=0.1",
);
```

(The veil shrinks into a vanishing ink drop at center, un-veiling the hero beneath. Counter timing, skip handler, inert/unlock logic, session key: all unchanged.)

- [ ] **Step 2: Verify the preloader e2e contract** — `npx playwright test tests/e2e/shell.spec.ts` (3 browsers; webkit clip-path support is fine). Re-run a lone failure in isolation.
- [ ] **Step 3: Commit**

```bash
git add components/layout/preloader.tsx
git commit -m "feat(v2): preloader exits as a collapsing ink drop (clip-path reveal)"
```

---

### Task 8: e2e for the ink hero

**Files:**
- Modify: `tests/e2e/hero-3d.spec.ts` (extend, following its existing WebGL2-probe pattern)

- [ ] **Step 1: Add tests** (mirror the existing file's helpers/style exactly — read it first):

```ts
test("ink (default) mounts a canvas when WebGL2 is available", async ({ page }) => {
  await page.goto("/?hero=ink");
  const hasWebgl2 = await page.evaluate(
    () => !!document.createElement("canvas").getContext("webgl2"),
  );
  test.skip(!hasWebgl2, "no WebGL2 in this browser context");
  await expect(page.locator("#top canvas").first()).toBeVisible({ timeout: 15_000 });
});
```

Also verify the existing `?hero=off` / reduced-motion no-canvas tests still pass unchanged (the default change must not break them — they pin `?hero=` explicitly).

- [ ] **Step 2: Run** — `npx playwright test tests/e2e/hero-3d.spec.ts` (3 browsers; WebKit skips via probe).
- [ ] **Step 3: Commit**

```bash
git add tests/e2e/hero-3d.spec.ts
git commit -m "test(v2): e2e — ink hero mounts canvas (WebGL2-gated), variant flags intact"
```

---

## Final verification (orchestrator)

1. Full gates: lint, typecheck, vitest, build, FULL `test:e2e` (re-run lone failures in isolation).
2. Read-only reviewer pass over the whole range (spec/a11y + quality).
3. Playwright-MCP visual pass on built `out/`: hero ink field in 4 themes (verify light themes show dark ink, not washed-out additive), scroll morph to lattice, cursor states (link/view/field), card lift + sheen + nav underline, modal morph (chromium) + fallback (firefox), preloader ink-drop (fresh session), mobile 390, reduced motion (static hero fallback, no canvas, no preloader animation). Read all screenshots.
4. Perf sanity: devtools-style check that the hero holds ~60fps on the dev machine (no long tasks from the shader); initial JS unchanged (scene stays behind dynamic import).
5. Docs: `docs/v2/HERO-3D.md` update (ink variant contract) + roadmap P17 status + memory snapshot; report + pause.
