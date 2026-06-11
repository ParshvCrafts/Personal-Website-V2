"use client";

import { CountUp } from "@/components/motion/count-up";
import { GraduationCap, Award, Calendar } from "lucide-react";

/**
 * Prominent GPA showcase card — visual anchor for the Academics section.
 *
 * Large animated counter, contextual badges, and major details.
 * Complements the stats band without duplicating it.
 */
export function GpaCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-8 md:p-10">
      {/* Subtle accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5 blur-2xl"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left: big GPA */}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-7xl tabular-nums leading-none text-heading md:text-8xl">
            <CountUp to={4.0} decimals={2} suffix="" />
          </span>
          <span className="font-mono text-lg text-muted">/ 4.00</span>
        </div>

        {/* Right: context */}
        <div className="flex flex-col gap-3 md:items-end">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Cumulative GPA
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 font-mono text-xs text-muted">
              <GraduationCap className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              First Year Complete
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 font-mono text-xs text-muted">
              <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              2025 – 2026
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 font-mono text-xs text-accent">
              <Award className="h-3.5 w-3.5" aria-hidden="true" />
              Dean&apos;s List × 2
            </span>
          </div>

          <div className="text-sm text-muted">
            <p>
              <span className="text-heading">Major:</span> Data Science
            </p>
            <p>
              <span className="text-heading">Domain:</span> Business & Industrial Analytics
            </p>
            <p>
              <span className="text-heading">Focus:</span> Machine Learning & AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
