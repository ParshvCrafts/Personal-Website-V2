import { Reveal } from "@/components/motion/reveal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { CountUp } from "@/components/motion/count-up";
import { BadgeWall } from "@/components/sections/about/badge-wall";
import { Awards } from "@/components/sections/about/awards";
import { CodeShowcase } from "@/components/sections/about/code-showcase";
import { AboutDocuments } from "@/components/sections/about/documents";
import { ABOUT_BIO, ABOUT_FACTS, AWARDS } from "@/content/about";
import { getProjects, getResearch } from "@/lib/data";

export function About() {
  // Stats tie to real data where possible (projects/research from loaders, awards
  // from the content array); GPA + volunteer hours are static. testids prove the
  // build-time data pipeline on the page.
  const stats = [
    { id: "gpa", label: "GPA", value: 4.0, decimals: 1, suffix: "" },
    { id: "projects", label: "Projects", value: getProjects().length, decimals: 0, suffix: "" },
    { id: "research", label: "Research Papers", value: getResearch().length, decimals: 0, suffix: "" },
    { id: "awards", label: "Awards", value: AWARDS.length, decimals: 0, suffix: "" },
    { id: "volunteer", label: "Volunteer Hours", value: 136, decimals: 0, suffix: "+" },
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      {/* Decorative per-theme atmosphere. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 12% 25%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl">
        {/* Intro: asymmetric editorial split */}
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">About</p>
            <SplitReveal
              as="h2"
              id="about-h"
              className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
            >{"Hello — I'm Parshv."}</SplitReveal>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
              {ABOUT_BIO.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Key facts — hairline-divided list */}
          <dl className="grid grid-cols-1 gap-px self-start overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 md:grid-cols-1">
            {ABOUT_FACTS.map((fact) => (
              <div key={fact.label} className="bg-surface px-5 py-4">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  {fact.label}
                </dt>
                <dd className="mt-1 break-words text-foreground">
                  {fact.href ? (
                    <a
                      href={fact.href}
                      className="underline-offset-2 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {fact.value}
                    </a>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Stats band */}
        <h3 className="sr-only">By the numbers</h3>
        <Reveal
          stagger={0.08}
          className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-border py-10 sm:grid-cols-3 md:mt-20 md:grid-cols-5"
        >
          {stats.map((s) => (
            <div key={s.id} className="flex flex-col gap-1">
              <span
                data-testid={`stat-${s.id}`}
                className="font-display text-4xl tabular-nums text-heading md:text-5xl"
              >
                <CountUp to={s.value} decimals={s.decimals} suffix={s.suffix} />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                {s.label}
              </span>
            </div>
          ))}
        </Reveal>

        <div className="mt-16 md:mt-24">
          <BadgeWall />
        </div>
        <div className="mt-16 md:mt-24">
          <Awards />
        </div>
        <div className="mt-16 md:mt-24">
          <CodeShowcase />
        </div>
        <div className="mt-16 md:mt-24">
          <AboutDocuments />
        </div>
      </div>
    </section>
  );
}
