import { getProjects } from "@/lib/data";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Parallax } from "@/components/motion/parallax";
import { ProjectGrid } from "./project-grid";
import { JarvisPanel } from "./jarvis-panel";
import { FeaturedStory } from "./featured-story";

export function Projects() {
  const projects = getProjects();

  return (
    <section
      id="projects"
      aria-labelledby="projects-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <Parallax
        amount={36}
        className="pointer-events-none absolute -inset-y-24 inset-x-0 -z-10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 15% 80%, color-mix(in oklab, var(--accent) 6%, transparent), transparent 70%)",
          }}
        />
      </Parallax>
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Selected Work
        </p>
        <SplitReveal
          as="h2"
          id="projects-h"
          className="mt-4 font-display text-4xl tracking-tighter font-bold leading-[1.05] text-heading md:text-6xl"
        >Projects</SplitReveal>
        <p className="mt-3 max-w-xl text-sm text-muted">
          <span data-testid="stat-projects-section">{projects.length}</span>{" "}
          projects spanning machine learning, computer vision, full-stack deployment, and data analytics.
        </p>

        <ProjectGrid projects={projects} />
        <FeaturedStory />
        <JarvisPanel />
      </div>
    </section>
  );
}
