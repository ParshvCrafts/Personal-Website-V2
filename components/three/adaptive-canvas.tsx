"use client";

import { useState, type ComponentProps } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { clampDpr } from "@/lib/webgl/capabilities";

type CanvasOwnProps = ComponentProps<typeof Canvas>;

/**
 * fiber's `gl`/`camera` props are wide unions (renderer factory or live camera
 * instance, plus the plain-object option form). This wrapper only ever *merges*
 * a literal-object form over its defaults via spread, so it narrows both props to
 * their plain-object shapes. Both remain structurally assignable to fiber's
 * `GLProps` / `CameraProps` — no casts, no `any`.
 */
interface AdaptiveGlOptions {
  antialias?: boolean;
  alpha?: boolean;
  powerPreference?: WebGLPowerPreference;
}
interface AdaptiveCameraOptions {
  position?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
  zoom?: number;
}

interface AdaptiveCanvasProps extends Omit<CanvasOwnProps, "dpr" | "gl" | "camera"> {
  /** Upper DPR bound (lower bound is always 1). */
  maxDpr?: number;
  /** WebGL renderer options merged over the adaptive defaults. */
  gl?: AdaptiveGlOptions;
  /** Camera options merged over the adaptive defaults. */
  camera?: AdaptiveCameraOptions;
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
