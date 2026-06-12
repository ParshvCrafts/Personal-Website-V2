import type { CSSProperties } from "react";
import {
  Trophy,
  Star,
  TrendingUp,
  Dumbbell,
  Mountain,
  Headphones,
  Tv,
  UtensilsCrossed,
  Feather,
  Medal,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { FEATURED_HOBBIES, SECONDARY_HOBBIES, type FeaturedHobby, type SecondaryHobby } from "@/content/hobbies";

const TIER_ICON: Record<"gold" | "silver" | "bronze", LucideIcon> = {
  gold: Trophy,
  silver: Star,
  bronze: TrendingUp,
};

const TIER_CLASS: Record<"gold" | "silver" | "bronze", string> = {
  gold: "text-accent",
  silver: "text-muted",
  bronze: "text-muted/70",
};

// Map string icon names to lucide components
const SECONDARY_ICONS: Record<string, LucideIcon> = {
  Dumbbell,
  Mountain,
  Headphones,
  Tv,
  UtensilsCrossed,
};

// Featured-hobby header icons keyed by each hobby's `iconName`.
const FEATURED_ICONS: Record<string, LucideIcon> = {
  Medal,
  Feather,
};

function FeaturedCard({ hobby }: { hobby: FeaturedHobby }) {
  const Icon = FEATURED_ICONS[hobby.iconName] ?? Feather;
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-6">
      {/* National winner banner for poetry */}
      {hobby.poetryData && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
          <Crown className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="font-mono text-xs uppercase tracking-wider text-accent">
            National 1st Place Winner
          </span>
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-elevated">
          <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-xl text-heading leading-snug">{hobby.title}</h3>
          <p className="font-mono text-xs text-muted mt-0.5">{hobby.role}</p>
        </div>
      </div>

      {hobby.poetryData && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted" aria-label="Competition journey">
            {hobby.poetryData.journeySteps.map((step, i) => (
              <span key={step} className="flex items-center gap-1.5">
                <span className={
                  i === hobby.poetryData!.journeySteps.length - 1
                    ? "rounded-full bg-accent px-2 py-0.5 text-on-accent text-[10px] uppercase tracking-wider"
                    : "text-[11px]"
                }>
                  {step}
                </span>
                {i < hobby.poetryData!.journeySteps.length - 1 && (
                  <span aria-hidden="true">→</span>
                )}
              </span>
            ))}
          </div>
          <blockquote className="mt-4 rounded-lg border border-border/50 bg-elevated px-4 py-3">
            <p className="font-display text-base italic text-heading">
              {hobby.poetryData.poemTitle}
            </p>
            <p className="mt-1 text-xs text-muted">{hobby.poetryData.poemSubject}</p>
            <p className="mt-1 font-mono text-[11px] text-accent">{hobby.poetryData.poemRecognition}</p>
          </blockquote>
        </div>
      )}

      {!hobby.poetryData && (
        <p className="mt-4 text-sm leading-relaxed text-muted">{hobby.description}</p>
      )}

      {hobby.awards.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            Awards &amp; Recognition
          </p>
          {hobby.awards.map((award) => {
            const Icon = TIER_ICON[award.tier];
            return (
              <div key={award.name} className="flex gap-3 rounded-lg border border-border/50 bg-elevated px-3 py-2.5">
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${TIER_CLASS[award.tier]}`} aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-heading">{award.name}</p>
                  {award.detail && (
                    <p className="mt-0.5 text-xs text-muted">{award.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hobby.poetryData && (
        <div className="mt-5 border-t border-border pt-4">
          <a
            href={hobby.poetryData.link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded font-mono text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Published Poem →
          </a>
        </div>
      )}
    </div>
  );
}

function SecondaryCard({ hobby }: { hobby: SecondaryHobby }) {
  const Icon = SECONDARY_ICONS[hobby.iconName] ?? Dumbbell;
  return (
    <div
      className="flex flex-col rounded-2xl border border-border bg-surface p-5 relative overflow-hidden"
      style={{ "--hobby-hue": hobby.accentHue } as CSSProperties}
    >
      {/* Decorative per-hobby tinted top border (content-driven hue, like fieldColor) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 bg-[oklch(0.68_0.13_var(--hobby-hue)/0.45)]"
      />
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-elevated">
          <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-display text-base text-heading leading-snug">{hobby.title}</h3>
          <p className="font-mono text-[10px] text-muted">{hobby.role}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted">{hobby.description}</p>
    </div>
  );
}

export function Hobbies() {
  return (
    <section
      id="hobbies"
      aria-labelledby="hobbies-h"
      className="scroll-mt-[88px] border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Life Beyond Tech
        </p>
        <SplitReveal
          as="h2"
          id="hobbies-h"
          className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
        >Beyond the Code</SplitReveal>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Passions, achievements, and what makes me who I am outside of software.
        </p>

        {/* Featured hobbies */}
        <Reveal stagger={0.08} className="mt-12 grid gap-6 md:grid-cols-2">
          {FEATURED_HOBBIES.map((hobby) => (
            <FeaturedCard key={hobby.id} hobby={hobby} />
          ))}
        </Reveal>

        {/* Secondary hobbies */}
        <Reveal stagger={0.06} className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {SECONDARY_HOBBIES.map((hobby) => (
            <SecondaryCard key={hobby.id} hobby={hobby} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
