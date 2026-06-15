"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { RotatingText } from "@/components/motion/rotating-text";
import { SplitReveal } from "@/components/motion/split-reveal";
import { GithubIcon, LinkedinIcon } from "@/components/layout/social-icons";
import { SITE, SOCIAL_LINKS, HERO_ROLES, HERO_PORTRAIT, NAV_OFFSET } from "@/lib/site";
import { Mail, ArrowUpRight } from "lucide-react";
import { DynamicGreeting } from "@/components/motion/dynamic-greeting";
import { HeroAmbient } from "./hero-ambient";
import { HeroSceneMount } from "@/components/three/hero/hero-scene-mount";
import Image from "next/image";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();
  registerGsap();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // One staggered entrance. Elements are visible by default (no-JS / RM safe);
        // we animate FROM a hidden state, so reduced motion simply skips this.
        // Note: the name (h1) entrance is owned SOLELY by <SplitReveal> (per-char
        // scroll reveal). We deliberately do NOT tween [data-hero='title'] here —
        // doing so would double-animate the element and compound opacity (the
        // parent fading to 0 hides the split chars).
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
        tl.from("[data-hero='eyebrow']", { y: 16, opacity: 0 })
          // Re-anchored off the eyebrow (the title tween that used to precede it was
          // removed): hold ~0.35s so SplitReveal's name reveal leads, then the role
          // follows, preserving the eyebrow → name → role → CTAs cadence.
          .from("[data-hero='role']", { y: 20, opacity: 0 }, "<0.35")
          .from("[data-hero='desc']", { y: 20, opacity: 0 }, "<0.1")
          // Reveal the CTA row as one block: its first child is Magnetic (its own GSAP
          // context), and a staggered `from` over `> *` stranded a sibling at opacity 0.
          .from("[data-hero='cta']", { y: 20, opacity: 0, ease: "back.out(1.4)", duration: 0.7 }, "<0.1")
          .from("[data-hero='social'] > *", { y: 12, opacity: 0, scale: 0.8, stagger: 0.08, duration: 0.5, ease: "back.out(2)" }, "<0.1")
          // Portrait reveals with an editorial left-to-right clip-path wipe
          // and subtle zoom settle for a polished entrance.
          .fromTo(
            "[data-hero='portrait']",
            { clipPath: "inset(0 100% 0 0)", scale: 1.03 },
            { clipPath: "inset(0 0% 0 0)", scale: 1, duration: 1.2, ease: "power3.inOut" },
            0.3,
          )
          // Decorative offset frame slides in from opposite direction for layered reveal.
          .from("[data-hero='frame']", { x: 20, y: -20, opacity: 0, duration: 0.8, ease: "power3.out" }, ">-0.6")
          .from("[data-hero='cue']", { y: -10, opacity: 0, duration: 0.8, ease: "power2.out" }, ">-0.2");
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="top"
      data-cursor="field"
      className="relative flex min-h-dvh items-center overflow-hidden px-6 md:px-10"
    >
      {/* Aurora ambient blobs — lowest z, behind all content & decorative gradient. */}
      <HeroAmbient />
      {/* Per-theme atmosphere (decorative). */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/cinematic/hero-bg.png"
          alt="Cinematic background"
          fill
          priority
          className="object-cover opacity-[0.85]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>
      {/* Decorative scroll-driven 3D layer (above ambient, below copy). Falls back to
          the static hero under reduced motion / no-WebGL via SceneSlot. */}
      <HeroSceneMount />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 py-24 md:grid-cols-[1.15fr_0.85fr]">
        {/* Text column */}
        <div>
          <DynamicGreeting />
          <p
            data-hero="eyebrow"
            className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-accent"
          >
            UC Berkeley · Data Science
          </p>
          <SplitReveal
            as="h1"
            unit="chars"
            data-hero="title"
            className="mt-5 font-display text-6xl tracking-tighter font-bold leading-[0.95] text-heading md:text-8xl"
          >{SITE.name}</SplitReveal>
          {/* Role rotates on its own line — no "I'm a/an" lead-in, which wouldn't
              agree with vowel-sound roles like "AI Researcher" / "ML Engineer". */}
          <p data-hero="role" className="mt-5 font-display text-2xl tracking-tight text-foreground md:text-3xl">
            <RotatingText items={HERO_ROLES} />
          </p>
          <p data-hero="desc" className="mt-6 max-w-xl text-lg text-muted">
            Building intelligent systems, turning data into products that think.
          </p>

          <div data-hero="cta" className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Button onClick={() => scrollTo("#projects", { offset: -NAV_OFFSET })}>
                Explore work
              </Button>
            </Magnetic>
            <Button variant="secondary" onClick={() => scrollTo("#contact", { offset: -NAV_OFFSET })}>
              Get in touch
            </Button>
            <a
              href="/documents/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Resume
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div data-hero="social" className="mt-8 flex items-center gap-2">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LinkedinIcon className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              aria-label="Email"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Portrait column (editorial framed; CLS-safe via intrinsic ratio). */}
        <div data-hero="portrait" className="relative mx-auto w-full max-w-sm md:max-w-none">
          <div
            data-hero="frame"
            aria-hidden
            className="absolute -right-3 -top-3 h-full w-full rounded-xl border border-accent/40"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_PORTRAIT}
            alt="Parshv Patel"
            width={1413}
            height={1785}
            fetchPriority="high"
            className="relative aspect-[1413/1785] w-full rounded-xl border border-border object-cover grayscale transition-[filter] duration-500 motion-safe:hover:grayscale-0"
          />
        </div>
      </div>

      {/* Scroll cue */}
      <button
        data-hero="cue"
        type="button"
        onClick={() => scrollTo("#about", { offset: -NAV_OFFSET })}
        className="absolute inset-x-0 bottom-8 mx-auto flex w-fit flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Scroll to content"
      >
        <span className="h-8 w-px bg-accent/50 motion-safe:animate-pulse" aria-hidden="true" />
        Scroll
      </button>
    </section>
  );
}
