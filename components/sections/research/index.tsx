import { getResearch } from "@/lib/data";
import { SplitReveal } from "@/components/motion/split-reveal";
import { ResearchGrid } from "./research-grid";

export function Research() {
  const papers = getResearch();

  return (
    <section
      id="research"
      aria-labelledby="research-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 60%, color-mix(in oklab, var(--accent) 8%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Research &amp; Publications
        </p>
        <SplitReveal
          as="h2"
          id="research-h"
          className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
        >Papers</SplitReveal>
        <p className="mt-3 max-w-xl text-lg text-muted">
          Academic research across data science, computational physics, and
          applied ethics.
        </p>

        <ResearchGrid papers={papers} />
      </div>
    </section>
  );
}
