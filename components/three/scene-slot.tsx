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
