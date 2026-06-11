"use client";

import { useRef } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { GithubIcon } from "@/components/layout/social-icons";
import { FEATURED_BUILD } from "@/content/featured-build";

registerGsap();

export function FeaturedStory() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const beats = el.querySelectorAll<HTMLElement>(
          "[data-testid='featured-beat']",
        );

        // Start: only first beat visible
        gsap.set(beats, { opacity: 0, y: 20 });
        gsap.set(beats[0], { opacity: 1, y: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top+=80",
            end: "+=" + beats.length * 60 + "%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        });

        beats.forEach((b, i) => {
          if (i === 0) return;
          tl.to(beats[i - 1], { opacity: 0, y: -20, duration: 0.5 }).to(
            b,
            { opacity: 1, y: 0, duration: 0.5 },
            "<0.1",
          );
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      data-testid="featured-build"
      className="relative mt-24 overflow-hidden rounded-2xl border border-border bg-surface"
    >
      {/* Subtle accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 20%, color-mix(in oklab, var(--accent) 5%, transparent), transparent 70%)",
        }}
      />

      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {/* ── Image column ─────────────────────────────────────────── */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
          <Image
            src={`/images/${FEATURED_BUILD.image}`}
            alt="Interlace multimodal fashion search interface"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={false}
          />
          {/* Subtle gradient overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/20"
          />
        </div>

        {/* ── Text column ──────────────────────────────────────────── */}
        <div className="flex flex-col justify-center px-8 py-10 md:px-10 md:py-12">
          {/* Eyebrow */}
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            {FEATURED_BUILD.eyebrow}
          </p>

          {/* Title — h3 because Projects section already has h2 */}
          <h3 className="mt-3 font-display text-2xl leading-tight text-heading md:text-3xl">
            {FEATURED_BUILD.title}
          </h3>

          {/* Beat container
              — under motion-safe: beats stack via grid-area so GSAP can cross-fade
              — under reduced motion: beats are in normal vertical flow, all visible  */}
          <div
            className="
              mt-8
              motion-safe:grid
              motion-reduce:flex motion-reduce:flex-col motion-reduce:gap-6
            "
          >
            {FEATURED_BUILD.beats.map((beat) => (
              <div
                key={beat.label}
                data-testid="featured-beat"
                /* Hidden state is class-gated by motion preference (mutually
                   exclusive media queries): under motion all beats start hidden
                   and GSAP (useLayoutEffect, pre-paint) reveals/cross-fades them;
                   under reduced motion GSAP never runs, so all beats stay visible. */
                className="
                  motion-safe:[grid-area:1/1]
                  motion-safe:opacity-0
                  motion-reduce:opacity-100
                "
              >
                {/* Label chip — border-only so accent text sits on the card
                    surface background, ensuring WCAG AA contrast on all themes. */}
                <span className="inline-block rounded-full border border-accent px-3 py-0.5 font-mono text-xs uppercase tracking-wider text-accent">
                  {beat.label}
                </span>

                <p className="mt-3 text-lg font-semibold text-heading">
                  {beat.heading}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {beat.body}
                </p>
              </div>
            ))}
          </div>

          {/* ── Links ────────────────────────────────────────────────── */}
          <div className="mt-8 flex items-center gap-4">
            <a
              href={FEATURED_BUILD.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Interlace source on GitHub"
              className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-4 py-2 text-sm text-foreground transition-colors hover:border-accent/60 hover:text-accent"
            >
              <GithubIcon className="h-4 w-4" />
              Source
            </a>
            <a
              href={FEATURED_BUILD.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Interlace live demo"
              className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-4 py-2 text-sm text-foreground transition-colors hover:border-accent/60 hover:text-accent"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Live Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
