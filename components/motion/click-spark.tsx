"use client";

import { useEffect, useCallback } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";

const PARTICLE_COUNT = 6;
const PARTICLE_SIZE = 4; // px
const SPREAD_RADIUS = 28; // px
const DURATION = 0.35; // seconds

/**
 * ClickSpark — Global micro-delight effect.
 *
 * Renders zero DOM on mount. On click of any interactive element
 * (`button`, `a`, `[role=button]`, `[data-cursor]`), spawns tiny
 * accent-colored particles that radiate outward and fade.
 *
 * - Reduced-motion safe: skipped entirely under `prefers-reduced-motion`.
 * - Performance: uses only transform + opacity (compositor-only).
 * - Cleanup: particles removed from DOM after animation completes.
 */
export function ClickSpark() {
  registerGsap();

  const handleClick = useCallback((e: MouseEvent) => {
    if (prefersReducedMotion()) return;

    const target = e.target as HTMLElement;
    // Only fire on interactive elements
    const isInteractive =
      target.closest("button, a, [role='button'], [data-cursor]") !== null;
    if (!isInteractive) return;

    const { clientX: cx, clientY: cy } = e;

    // Create a container positioned at click point
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      left: ${cx}px;
      top: ${cy}px;
      pointer-events: none;
      z-index: 9999;
    `;

    // Get the computed accent color from the theme
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#888";

    // Create particles
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement("div");
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      p.style.cssText = `
        position: absolute;
        width: ${PARTICLE_SIZE}px;
        height: ${PARTICLE_SIZE}px;
        border-radius: 50%;
        background: ${accent};
        left: -${PARTICLE_SIZE / 2}px;
        top: -${PARTICLE_SIZE / 2}px;
        opacity: 1;
      `;
      p.dataset.angle = String(angle);
      container.appendChild(p);
      particles.push(p);
    }

    document.body.appendChild(container);

    // Animate particles outward
    particles.forEach((p) => {
      const angle = parseFloat(p.dataset.angle!);
      const distance = SPREAD_RADIUS + Math.random() * 12;
      gsap.to(p, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0.2,
        duration: DURATION,
        ease: "power2.out",
        onComplete: () => {
          // Clean up after the last particle finishes
          if (container.parentNode) {
            container.remove();
          }
        },
      });
    });
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [handleClick]);

  // Renders nothing — purely behavioral
  return null;
}
