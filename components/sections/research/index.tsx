import { getResearch } from "@/lib/data";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Parallax } from "@/components/motion/parallax";
import { ResearchGrid } from "./research-grid";
import Image from "next/image";

export function Research() {
  const papers = getResearch();

  return (
    <section
      id="research"
      aria-labelledby="research-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <Parallax
        amount={36}
        className="pointer-events-none absolute -inset-y-24 inset-x-0 -z-10"
      >
        <div className="absolute inset-0 opacity-25">
          <Image
            src="/images/cinematic/data-science.png"
            alt="Data Science AI"
            fill
            className="object-cover object-center mix-blend-screen"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
        </div>
      </Parallax>
      <div className="mx-auto max-w-6xl">
        <Parallax amount={-6}>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Research &amp; Publications
          </p>
        </Parallax>
        <SplitReveal
          as="h2"
          id="research-h"
          className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
        >Papers</SplitReveal>
        <Parallax amount={4}>
          <p className="mt-3 max-w-xl text-lg text-muted">
            Academic research across data science, computational physics, and
            applied ethics.
          </p>
        </Parallax>

        <ResearchGrid papers={papers} />
      </div>
    </section>
  );
}
