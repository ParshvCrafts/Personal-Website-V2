"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TOUR_STEPS, resolveVisibleSteps, type TourStep } from "@/lib/tour/steps";
import { subscribeStartTour } from "@/lib/tour/tour-bus";
import { prefersReducedMotion } from "@/lib/motion";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Opt-in spotlight tour. Starts on the tour bus; never auto-starts. */
export function GuidedTour() {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const coachRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const active = steps.length > 0;
  const step = active ? steps[Math.min(index, steps.length - 1)] : null;
  const isLast = active && index >= steps.length - 1;

  const end = useCallback(() => {
    setSteps([]);
    setIndex(0);
    setRect(null);
  }, []);
  const next = useCallback(() => setIndex((i) => (i + 1 < steps.length ? i + 1 : i)), [steps.length]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Start when the bus fires.
  useEffect(
    () =>
      subscribeStartTour(() => {
        const visible = resolveVisibleSteps(TOUR_STEPS, document);
        if (visible.length === 0) return;
        previouslyFocused.current = document.activeElement as HTMLElement | null;
        setSteps(visible);
        setIndex(0);
      }),
    [],
  );

  // Position the cutout + scroll target into view on each step.
  useEffect(() => {
    if (!step) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    let raf = 0;
    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
    };
  }, [step]);

  // Body lock + focus + keyboard while active.
  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    coachRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); end(); }
      else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); if (index >= steps.length - 1) end(); else next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
      else if (e.key === "Tab") {
        const f = coachRef.current?.querySelectorAll<HTMLElement>("button");
        if (!f || f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, index, steps.length, end, next, back]);

  // Restore focus when the tour ends.
  useEffect(() => {
    if (!active && previouslyFocused.current) {
      previouslyFocused.current.focus();
      previouslyFocused.current = null;
    }
  }, [active]);

  if (!active || !step) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="presentation">
      {/* Click catcher (transparent) — clicking outside ends the tour. */}
      <button
        type="button"
        aria-label="End tour"
        tabIndex={-1}
        onClick={end}
        className="absolute inset-0 cursor-default"
      />
      {/* Spotlight: a box at the target whose huge box-shadow dims everything else. */}
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-lg ring-2 ring-accent transition-[top,left,width,height] duration-200 motion-reduce:transition-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px color-mix(in srgb, var(--color-background) 72%, transparent)",
          }}
        />
      )}
      {/* Coachmark */}
      <div
        ref={coachRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site tour"
        tabIndex={-1}
        className="absolute bottom-8 left-1/2 w-[min(92vw,400px)] -translate-x-1/2 rounded-xl border border-border bg-surface p-5 shadow-2xl focus:outline-none"
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {index + 1} / {steps.length}
        </p>
        <h2 className="mt-1 font-display text-xl text-heading">{step.title}</h2>
        <p aria-live="polite" className="mt-2 text-sm text-foreground">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={end}
            className="min-h-11 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={back}
                className="min-h-11 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? end() : next())}
              className="min-h-11 rounded-md bg-accent px-4 text-sm text-on-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
