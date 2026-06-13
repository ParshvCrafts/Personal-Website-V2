"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { chapterForProgress, typedCount } from "@/lib/showpiece/keystroke";
import { cn } from "@/lib/utils";

interface Chapter {
  kicker: string;
  heading: string;
  body: string;
}

const CHAPTERS: Chapter[] = [
  { kicker: "01 — input", heading: "Data, everywhere", body: "Raw, scattered, noisy." },
  { kicker: "02 — learning", heading: "Structure emerges", body: "Patterns resolve as the model learns." },
  { kicker: "03 — output", heading: "Intelligence", body: "Systems that turn signal into decisions." },
];

/**
 * Apple-style stepped scroll sequence. Scroll snaps chapter-to-chapter; each
 * heading "types" in (scroll-driven) and commits with a keycap depress + accent
 * flash. Pure typographic — no frames. Reduced motion: all chapters shown
 * stacked, fully typed, no pin/snap (content visible, never trapped).
 */
export function KeystrokeShowpiece() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState(0);
  registerGsap();

  useGSAP(
    (_ctx, contextSafe) => {
      const reduce = prefersReducedMotion();
      if (reduce) return; // reduced path renders the static stack below

      const render = contextSafe!((progress: number) => {
        const count = CHAPTERS.length;
        const idx = chapterForProgress(progress, count);
        const local = progress * count - idx; // 0..1 within the chapter
        const chars = typedCount(CHAPTERS[idx].heading.length, local);
        setActive((prev) => (prev === idx ? prev : idx));
        setTyped(chars);
      });

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 0.6,
        // Snap to chapter CENTERS (1/6, 1/2, 5/6) — the rest state shows a
        // fully-typed heading. Snapping to boundaries (0, 1/3, …) would land on
        // local≈0 where the heading is still empty (just the caret).
        snap: { snapTo: [1 / 6, 1 / 2, 5 / 6], duration: 0.3, ease: "power2.inOut" },
        onUpdate: (self) => render(self.progress),
      });
      render(0);
      return () => st.kill();
    },
    { scope: sectionRef },
  );

  // Keycap flash when a chapter commits (active changes), motion-safe only.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !cardRef.current) return;
      gsap.fromTo(
        cardRef.current,
        { y: 6, boxShadow: "0 0 0 0 transparent" },
        {
          y: 0,
          boxShadow: "0 14px 50px -22px var(--accent)",
          duration: 0.32,
          ease: "power3.out",
        },
      );
    },
    { dependencies: [active], scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Data to intelligence — a three-step story: data is raw and scattered, structure emerges as a model learns, and the result is intelligence that turns signal into decisions."
      className="relative border-y border-border"
    >
      {/* Motion path: one pinned stage, chapters swap in place. */}
      <div className="motion-safe:flex hidden min-h-dvh items-center justify-center px-6 md:px-16">
        <div
          ref={cardRef}
          className="w-full max-w-3xl rounded-2xl border border-border bg-surface/60 p-8 md:p-12 backdrop-blur-sm"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            {CHAPTERS[active].kicker}
          </p>
          <p className="mt-5 font-display text-4xl leading-[1.05] text-heading md:text-7xl">
            <span ref={headingRef}>{CHAPTERS[active].heading.slice(0, typed)}</span>
            <span
              aria-hidden
              className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] bg-accent motion-safe:animate-[cursor-blink_1.1s_step-end_infinite]"
            />
          </p>
          <p className="mt-4 text-muted md:text-lg">{CHAPTERS[active].body}</p>
        </div>
      </div>

      {/* Reduced-motion path: all chapters stacked, fully readable, no pin. */}
      <div className={cn("motion-safe:hidden", "mx-auto max-w-3xl px-6 py-24 md:px-16")}>
        {CHAPTERS.map((c) => (
          <div key={c.heading} className="border-b border-border/50 py-8 last:border-0">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{c.kicker}</p>
            <p className="mt-3 font-display text-3xl leading-[1.05] text-heading md:text-5xl">
              {c.heading}
            </p>
            <p className="mt-3 text-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
