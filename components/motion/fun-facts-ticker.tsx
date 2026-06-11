"use client";

import { cn } from "@/lib/utils";

const FACTS = [
  "National Poetry Champion (GFWC)",
  "Amazon SWE Intern, Summer 2026",
  "Valedictorian, 4.6 GPA out of 455 students",
  "Dean's List x2, UC Berkeley CDSS",
  "Rank 1 in Indian Board Exam X out of 2.4M candidates",
  "Library Prize for Undergraduate Research, Honorable Mention",
  "4 Berkeley Literary Prizes including Leslie Lipson Essay Prize",
  "Greenhouse Scholar, <2% acceptance rate",
  "4.0 GPA through 11 Berkeley courses",
  "UC Berkeley, #1 Public University in the US",
  "2 IMO Gold Medals in Mathematics Olympiad",
  "QuestBridge Finalist, Top 1% of applicants",
  "Amazon Future Engineer Scholar",
  "First CBAADA Scholar from West Valley HS in 10 years",
  "MLT Ascend Scholar, first-gen career accelerator",
];

interface FunFactsTickerProps {
  className?: string;
}

/**
 * Infinite-scroll marquee of key achievements.
 *
 * CSS-driven animation (no JS). Duplicated content ensures seamless loop.
 * Reduced motion: slower speed. Pauses on hover for readability.
 */
export function FunFactsTicker({ className }: FunFactsTickerProps) {
  const items = FACTS;
  // Duplicate for seamless loop
  const allItems = [...items, ...items];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-border bg-surface/50 py-3",
        className,
      )}
    >
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {allItems.map((fact, i) => (
          <span
            key={`${fact}-${i}`}
            className="flex items-center gap-3 px-4 font-mono text-xs uppercase tracking-widest text-muted"
          >
            <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
            {fact}
          </span>
        ))}
      </div>
    </div>
  );
}
