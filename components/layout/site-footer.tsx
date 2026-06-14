"use client";

import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { NAV_SECTIONS, SITE, SOCIAL_LINKS, NAV_OFFSET } from "@/lib/site";
import { StatusWidget } from "@/components/status/status-widget";
import { GithubIcon, LinkedinIcon } from "@/components/layout/social-icons";
import { Mail, ArrowUp } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";

export function SiteFooter() {
  const { scrollTo } = useSmoothScroll();

  return (
    <footer className="border-t border-border bg-surface" role="contentinfo">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr] md:px-10">
        <ScrollReveal variant="fade-rise">
        <div>
          <p className="font-display text-2xl text-heading">{SITE.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            {SITE.role} · {SITE.location}
          </p>
          <Reveal stagger={0.08} className="mt-5 flex items-center gap-2">
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
          </Reveal>
        </div>
        </ScrollReveal>

        <ScrollReveal variant="stagger-cascade" stagger={0.06}>
        <nav aria-label="Footer" className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Sections</p>
          {NAV_SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(`#${id}`, { offset: -NAV_OFFSET })}
              className="min-h-11 py-2 text-left text-sm text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </button>
          ))}
        </nav>
        </ScrollReveal>

        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Contact</p>
          <a
            href={`mailto:${SITE.email}`}
            className="min-h-11 text-sm text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SITE.email}
          </a>
          <a
            href={`tel:${SITE.phone}`}
            className="min-h-11 text-sm text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SITE.phoneDisplay}
          </a>
          <span className="text-sm text-muted">{SITE.location}</span>
        </div>
      </div>

      <StatusWidget />

      <Reveal className="mx-auto flex max-w-6xl items-center justify-between px-6 pb-10 md:px-10">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <Magnetic>
        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to top
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
        </Magnetic>
      </Reveal>
    </footer>
  );
}
