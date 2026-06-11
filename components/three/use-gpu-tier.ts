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
