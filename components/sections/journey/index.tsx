"use client";

import { useRef } from "react";
import type { Milestone } from "@/content/journey";
import { MILESTONES } from "@/content/journey";
import { Reveal } from "@/components/motion/reveal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

function MilestoneItem({
  milestone: m,
  index: i,
}: {
  milestone: Milestone;
  index: number;
}) {
  const isRight = i % 2 === 1;
  const dt = m.year.replace(/^Summer /, "");

  return (
    <div
      data-milestone={isRight ? "right" : "left"}
      className={cn(
        "relative pl-14 pb-12",
        "md:flex md:pl-0 md:pb-16",
        isRight && "md:flex-row-reverse"
      )}
    >
      {/* Content */}
      <div
        className={cn(
          "md:w-[calc(50%-1.5rem)]",
          isRight ? "md:pl-10" : "md:pr-10 md:text-right"
        )}
      >
        <time
          dateTime={dt}
          className="block font-mono text-xs uppercase tracking-widest text-accent"
        >
          {m.year}
        </time>
        <h3 className="mt-1 font-display text-xl text-heading">{m.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{m.body}</p>
        {m.status === "active" && (
          <span
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-accent",
              isRight ? "justify-start" : "md:justify-end"
            )}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Active
          </span>
        )}
      </div>

      {/* Center dot */}
      <div
        className={cn(
          "absolute left-[10px] top-1",
          "md:relative md:left-auto md:top-auto",
          "md:flex md:w-12 md:shrink-0 md:justify-center md:pt-2"
        )}
      >
        <div
          data-milestone-dot
          className={cn(
            "h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-background",
            m.status === "active"
              ? "bg-accent ring-accent"
              : "bg-surface ring-border"
          )}
        />
      </div>

      {/* Spacer for empty side on desktop */}
      <div className="hidden md:block md:w-[calc(50%-1.5rem)]" />
    </div>
  );
}

export function Journey() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Draw the timeline line as user scrolls through
        gsap.to(lineRef.current, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 0.5,
          },
        });

        // Activate milestone dots progressively
        const dots =
          timelineRef.current!.querySelectorAll<HTMLElement>(
            "[data-milestone-dot]"
          );
        dots.forEach((dot) => {
          gsap.fromTo(
            dot,
            { scale: 1, borderColor: "var(--border)" },
            {
              scale: 1.4,
              borderColor: "var(--accent)",
              duration: 0.4,
              ease: "back.out(2)",
              scrollTrigger: {
                trigger: dot,
                start: "top 65%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        // Directional milestone entry — left items from left, right items from right
        const milestones =
          timelineRef.current!.querySelectorAll<HTMLElement>(
            "[data-milestone]"
          );
        milestones.forEach((ms) => {
          const dir = ms.dataset.milestone === "right" ? 30 : -30;
          gsap.from(ms, {
            x: dir,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ms,
              start: "top 80%",
              once: true,
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: timelineRef }
  );

  return (
    <section
      id="journey"
      aria-labelledby="journey-h"
      className="scroll-mt-[88px] border-t border-border px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            My Journey
          </p>
          <SplitReveal as="h2" id="journey-h" className="mt-3 font-display text-4xl tracking-tighter font-bold text-heading md:text-5xl">India → Berkeley</SplitReveal>
          <p className="mt-3 max-w-xl text-muted">A story of perseverance.</p>
        </Reveal>

        <div ref={timelineRef} className="relative mt-20">
          {/* Background track */}
          <div
            className="absolute inset-y-0 left-4 w-px bg-border/30 md:left-1/2 md:-translate-x-1/2"
            aria-hidden="true"
          />
          {/* Scroll-driven active line */}
          <div
            ref={lineRef}
            className="absolute inset-y-0 left-4 w-px origin-top bg-accent md:left-1/2 md:-translate-x-1/2 motion-safe:will-change-transform"
            aria-hidden="true"
            style={{ transform: "scaleY(0)" }}
          />

          <div>
            {MILESTONES.map((m, i) => (
              <MilestoneItem key={m.title} milestone={m} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
