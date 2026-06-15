"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MarqueeTickerProps {
  /** Array of text items to scroll */
  items: readonly string[];
  /** Scroll speed in pixels per second. Default: 30 */
  speed?: number;
  /** Separator character between items. Default: "·" */
  separator?: string;
  className?: string;
}

/**
 * MarqueeTicker — Continuous infinite-scroll text marquee.
 *
 * Uses GSAP for buttery-smooth, GPU-composited scrolling.
 * Duplicates the content strip so there's never a gap.
 * Pauses on hover for readability.
 * Disabled under prefers-reduced-motion (shows static centered text instead).
 */
export function MarqueeTicker({
  items,
  speed = 30,
  separator = "·",
  className,
}: MarqueeTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  registerGsap();

  // Reduced motion (OS pref or the on-page toggle): render a static, centered,
  // readable line instead of the scrolling track. SSR/first render = false so
  // hydration matches; the effect swaps to the static form after mount.
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion());
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        if (!track) return;

        // Each "half" is identical — we animate the first half's width
        // then reset, creating seamless looping.
        const firstHalf = track.querySelector<HTMLElement>("[data-marquee-half]");
        if (!firstHalf) return;

        const w = firstHalf.offsetWidth;
        if (!w) return; // not laid out yet (e.g. hidden) — avoid a zero-duration tween
        const duration = w / speed;

        const tween = gsap.to(track, {
          x: -w,
          duration,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize((x: number) => x % w === 0 ? 0 : x % -w),
          },
        });

        // Pause on hover
        const container = containerRef.current!;
        const pause = () => gsap.to(tween, { timeScale: 0, duration: 0.4 });
        const resume = () => gsap.to(tween, { timeScale: 1, duration: 0.4 });
        container.addEventListener("mouseenter", pause);
        container.addEventListener("mouseleave", resume);

        return () => {
          container.removeEventListener("mouseenter", pause);
          container.removeEventListener("mouseleave", resume);
          tween.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: containerRef },
  );

  // Build the repeated item string
  const content = items.map((item, i) => (
    <span key={i} className="flex items-center gap-3">
      <span className="whitespace-nowrap text-muted">{item}</span>
      <span aria-hidden="true" className="text-accent/40">{separator}</span>
    </span>
  ));

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        className,
      )}
      aria-label={`Fun facts: ${items.join(", ")}`}
    >
      {/* Fade edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"
      />

      {/* Track — two copies for a seamless loop. Reduced motion swaps to a static,
          centered, readable line (no scroll, no clipping). */}
      {reduced ? (
        <p className="px-4 text-center font-mono text-xs text-muted">
          {items.join(` ${separator} `)}
        </p>
      ) : (
        <div
          ref={trackRef}
          className="flex w-max motion-safe:will-change-transform"
        >
          <div data-marquee-half className="flex items-center gap-3 pr-3 font-mono text-xs">
            {content}
          </div>
          {/* Duplicate for seamless wrap */}
          <div aria-hidden="true" className="flex items-center gap-3 pr-3 font-mono text-xs">
            {content}
          </div>
        </div>
      )}

      {/* Reduced motion fallback — static centered text */}
      <noscript>
        <p className="text-center font-mono text-xs text-muted">
          {items.join(` ${separator} `)}
        </p>
      </noscript>
    </div>
  );
}
