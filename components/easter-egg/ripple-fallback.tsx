"use client";

import { useEffect, useState } from "react";
import { subscribeBurst } from "@/lib/easter-egg/burst";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./ripple-fallback.module.css";

/**
 * Renders the Konami reward when the WebGL Inkfield is NOT live (no WebGL2,
 * Save-Data, or reduced-motion → no `[data-inkfield] canvas`). When the
 * Inkfield is mounted it consumes the burst itself, so this self-suppresses.
 */
export function RippleFallback() {
  const [bursts, setBursts] = useState<number[]>([]);

  useEffect(() => subscribeBurst(() => {
    if (document.querySelector("[data-inkfield] canvas")) return; // Inkfield handles it
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, id]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1000);
  }), []);

  if (bursts.length === 0) return null;
  const reduce = prefersReducedMotion();

  return (
    <div aria-hidden className={`${styles.layer} text-accent`}>
      {bursts.map((id) => (
        <span key={id} className={reduce ? styles.pulse : styles.expand} />
      ))}
    </div>
  );
}
