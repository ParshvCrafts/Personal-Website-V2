# P13 — 3D + Motion Foundation (design spec)

**Program:** Portfolio v2.5 "Signature" (see `docs/v2/ROADMAP-V2.5-SIGNATURE.md`).
**Date:** 2026-06-10 · **Branch:** `feat/portfolio-v2` · **Status:** awaiting user review.

## 1. Purpose & non-goals

**Purpose:** stand up the reusable WebGL/3D rig that P14 (3D hero) and any future 3D ride on —
**with zero new visible "wow" on the home page.** This phase is the safety harness: capability
detection, a lazy adaptive `<Canvas>`, a scroll→3D bridge built on the *existing* Lenis+ScrollTrigger,
a hard reduced-motion/no-WebGL fallback contract, and a measured perf budget. It ends with a throwaway
proof scene on the `/preview` styleguide route so we *prove the rig works* in the real static-export
build + browser before we attach anything to the hero.

**Non-goals (explicitly deferred):**
- No 3D on the home page (that's P14).
- **Page/route transitions move to P17 polish** — the site is effectively single-page (`/` + `/preview`),
  so View-Transitions belong with the cohesion pass, not the 3D foundation. Keeps P13 cohesive.
- No Higgsfield/Remotion work (P15).

## 2. Current foundation we build on (do not reinvent)
- `lib/motion.ts` — `registerGsap()` (ScrollTrigger/SplitText/Flip, once), `prefersReducedMotion()`,
  `frameForProgress()`. **Add to this module, don't fork it.**
- `components/providers/smooth-scroll.tsx` — Lenis, RM-gated, wired to `gsap.ticker` +
  `ScrollTrigger.update`. The scroll bridge MUST read from this, not start a second RAF loop.
- `components/motion/scroll-sequence.tsx` — canvas engine; reference for the DPR cap (`min(dpr,2)`),
  RM gating, resize throttling, and `useGSAP` scoping/cleanup conventions. Mirror its discipline.
- `app/layout.tsx` nests `ThemeProvider → SmoothScrollProvider → {GrainOverlay, CustomCursor,
  ScrollProgress, children}`. New global providers (if any) nest *inside* SmoothScrollProvider.
- Next 16.2.7, React 19.2.4, `output:'export'`, `trailingSlash:true`, `images:{unoptimized:true}`,
  `turbopack.root` pinned. **Next 16 ≠ training data — read `node_modules/next/dist/docs/` when unsure.**

## 3. Dependencies to add
- `three`, `@react-three/fiber` (v9.x — React 19 compatible), `@react-three/drei` (latest compatible),
  `@react-three/postprocessing` + `postprocessing`, `@types/three` (dev).
- **Verify exact compatible versions at plan time via context7 / npm** (R3F v9 ↔ React 19 ↔ three r17x).
  Pin them. The build (`npm run build` static export) is the gate, not assumptions.

## 4. Architecture — modules & contracts

All new code under `lib/webgl/` (pure logic) and `components/three/` (client components). Each unit
has one job, a small interface, and is testable/understandable in isolation.

### 4.1 `lib/webgl/capabilities.ts` (pure, TDD)
Single deep function with a tiny interface:
```ts
export type GpuTier = "off" | "low" | "high";
export interface CapabilityInputs {
  reducedMotion: boolean;
  webgl2: boolean;            // canvas.getContext('webgl2') probe result (injected, not read here)
  deviceMemory?: number;      // navigator.deviceMemory (GB), may be undefined
  hardwareConcurrency?: number;
  saveData?: boolean;         // navigator.connection.saveData
  coarsePointer?: boolean;    // touch-first device
}
export function resolveGpuTier(i: CapabilityInputs): GpuTier;
```
Rules (TDD each): `reducedMotion || !webgl2 || saveData` → `"off"`. Then a heuristic:
low memory (`deviceMemory <= 4`) or low cores (`hardwareConcurrency <= 4`) or coarse pointer → `"low"`;
else `"high"`. Pure: all inputs injected, **no `window`/`navigator` access inside** — that lives in the hook.

### 4.2 `components/three/use-gpu-tier.ts` (client hook)
SSR-safe wrapper: returns `"off"` until mounted (avoids hydration mismatch), then probes
`navigator`/WebGL2 once on mount and returns the resolved `GpuTier`. Memoized; re-reads `prefers-reduced-motion`
via a media-query listener so toggling OS reduced-motion downgrades to `"off"` live.

### 4.3 `components/three/scene-slot.tsx` (the fallback contract — the key abstraction)
The single way any 3D enters the page. Deep module, simple interface:
```tsx
<SceneSlot
  fallback={<EditorialHero />}        // always-rendered non-3D equivalent (content parity)
  minTier="low"                       // scene won't mount below this tier
  render={(tier) => <LazyHeroScene tier={tier} />}
/>
```
Behavior: if `useGpuTier() < minTier` (or `"off"`) → render `fallback` only. Else render `fallback`
as static poster underneath + lazily mount the scene over it (so there's never a blank gap during the
dynamic import). Consumers never touch capability logic — they pass a scene and a fallback. This *is*
how reduced-motion/no-WebGL parity is guaranteed system-wide.

### 4.4 `components/three/adaptive-canvas.tsx` (client)
Wraps drei `<Canvas>`:
- `dpr={[1, 2]}` (matches existing engine cap), `gl={{ antialias, powerPreference:'high-performance',
  alpha:true }}`, drei `PerformanceMonitor` → step DPR down (and signal quality down) on sustained low FPS,
  back up when headroom returns. Optional `frameloop="demand"` for static-ish scenes.
- `flat`/color-management defaults sane for the theme tokens; transparent background (themes own the bg).
- No global leaks: scene disposal handled by R3F; verify no orphaned WebGL contexts on unmount.

### 4.5 `components/three/lazy-scene.tsx` (client)
`next/dynamic(() => import(scene), { ssr:false })` + an IntersectionObserver gate so the heavy `three`
chunk only fetches/mounts when the slot is near the viewport (`rootMargin` ~200px). Suspense fallback =
the slot's poster. Verifies static-export compatibility of `ssr:false` dynamic import.

### 4.6 `components/three/use-scroll-bridge.ts` (client hook)
Exposes Lenis-smoothed scroll progress for a given trigger element to R3F **without a second RAF loop or
a re-render per frame**: a `useGSAP` ScrollTrigger (scrub) writes progress into a mutable ref / tiny store
that the scene reads inside `useFrame`. RM path: progress is static (start state). Reuses `registerGsap()`;
never double-registers. Cleans up its ScrollTrigger on unmount (`useGSAP` scope).

### 4.7 Honest preloader tweak (`components/layout/preloader.tsx`, light touch)
Expose a `ready` signal hook so the preloader can *optionally* wait for first-scene readiness, **with a
hard timeout cap (e.g. 1200ms)** so it never hangs and never fakes delay. RM path unchanged (instant).
Minimal — full loading-animation polish is P17. If integration risk is high, ship only the hook + timeout
and leave visuals to P17.

### 4.8 Proof scene (`/preview` only, throwaway-quality but correct)
A minimal `ProofScene` (slow-rotating wireframe knot/icosahedron, theme-accent material) mounted via
`SceneSlot`+`AdaptiveCanvas`+`useScrollBridge` on the existing `/preview` styleguide route (noindex).
Proves end-to-end: dynamic import, lazy mount on scroll, perf scaling, RM/no-WebGL fallback poster,
disposal on unmount. **Not** added to the home page. Removed or kept behind `/preview` per review.

## 5. Performance budget (the real risk)
- `three` must NOT enter the home route's initial JS. Gate: measure `out/` route JS before/after;
  the home page initial bundle must be **unchanged** (three only in a lazily-fetched chunk).
- Target ≥50 FPS on `"high"`, graceful DPR step-down on `"low"`; never block main thread > long-task
  budget on mount. `PerformanceMonitor` thresholds tuned in plan.
- Mobile/coarse-pointer defaults to `"low"` (capped DPR, simpler scene) — set expectations for P14.

## 6. Accessibility & motion safety
- `SceneSlot` fallback guarantees content parity with zero WebGL/JS-3D.
- Reduced motion → tier `"off"` → fallback only, no Canvas mounted, no scroll trap, no autoplay motion.
- Canvas is decorative: `aria-hidden` on the `<Canvas>` wrapper; all meaning lives in the DOM fallback/poster.
- Respect `Save-Data`. Keyboard/focus unaffected (Canvas is non-interactive in P13).

## 7. Testing (TDD where it pays)
- **Unit (Vitest):** `resolveGpuTier` truth table (every branch: off via RM / no-webgl2 / save-data;
  low via memory/cores/coarse; high otherwise). DPR-clamp helper. `use-gpu-tier` SSR default = `"off"`
  (render in jsdom, assert pre-mount value).
- **Unit:** `SceneSlot` renders fallback (not the scene) when tier `"off"`; renders scene wrapper when `"high"`
  (mock `useGpuTier`). No real WebGL in jsdom.
- **E2E (Playwright):** (a) home page **regression** — builds, renders, no Canvas above the fold, axe-clean
  in all 4 themes (existing scan covers it). (b) `/preview` proof scene: under normal motion a `<canvas>`
  appears after scroll-into-view; under `test.use({ reducedMotion:'reduce' })` **no canvas**, poster visible.
  (c) Real 3D visual correctness deferred to P14 Playwright pass (no meaningful 3D to assert yet).
- **Gates (from `v2/`):** `lint`, `typecheck`, `npm test`, `npm run build` (static export must succeed),
  full `test:e2e` (chromium/firefox/webkit + axe). Then Playwright MCP: `/preview` proof scene in all 4
  themes + mobile 390px + a reduced-motion context; **Read the screenshots**.

## 8. Risks & mitigations
- **R3F v9 ↔ React 19 ↔ Next 16 static export** incompatibility → pin verified versions; build is the gate;
  if `ssr:false` dynamic import misbehaves under export, fall back to a client-only mount guard. Research via context7.
- **Bundle bloat** → enforce the §5 budget; fail the phase if home initial JS regresses.
- **Turbopack dev manifest bug with spaces-in-path** (known) → verify via `npm run build` + serving `out/`,
  not dev, per prior phases.
- **Hydration mismatch** from capability probing → hook returns `"off"` until mounted; SSR renders fallback.

## 9. Deliverables checklist
1. Deps added + pinned; static build green.
2. `lib/webgl/capabilities.ts` (+ tests). `components/three/{use-gpu-tier, scene-slot, adaptive-canvas,
   lazy-scene, use-scroll-bridge}.tsx` (+ tests where logic is pure/mockable).
3. Honest preloader `ready` hook + timeout (or deferred-with-note).
4. `ProofScene` on `/preview` via the harness.
5. Perf-budget evidence (route JS before/after). Full gate sweep green. Browser screenshots reviewed.
6. Concise `docs/v2/FOUNDATION-3D.md` (the rig's contract, for P14+). ROADMAP P13 → done, next P14.

## 10. Implementation cycle (per working-style)
Plan (`writing-plans`, complete code + TDD tasks, atomic commits) → implement (subagent, fresh context) →
2-stage read-only `reviewer` review on the git range → verify myself (full gates + Playwright MCP, 4
themes + mobile + RM) → hunt/fix → document → report + **pause for user** before P14.
Mandated skills applied every relevant step: `frontend-design`, `gsap-*`, `ui-ux-pro-max`,
`test-driven-development`, `systematic-debugging`, `requesting/receiving-code-review`,
`verification-before-completion`.
