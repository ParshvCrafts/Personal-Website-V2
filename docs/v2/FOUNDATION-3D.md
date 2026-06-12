# 3D Foundation (P13) — the WebGL rig contract

Reusable, a11y-safe 3D rig for P14+ (built on existing Lenis + GSAP ScrollTrigger). No home-page 3D yet.

## How to add a 3D scene (the only sanctioned path)
Wrap the decorative 3D layer in `SceneSlot`. Real textual content stays in sibling DOM, always present.

```tsx
"use client";
import dynamic from "next/dynamic";
import { SceneSlot } from "@/components/three/scene-slot";
const MyScene = dynamic(() => import("./my-scene").then((m) => m.MyScene), { ssr: false });

<SceneSlot
  minTier="low"                       // won't mount below this device tier
  fallback={<StaticPoster />}         // shown under reduced motion / no WebGL / while loading
  render={() => <MyScene />}
/>;
```

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
