import { getProjects } from "@/lib/data";
import { SplitReveal } from "@/components/motion/split-reveal";
import { ProjectGrid } from "./project-grid";
import { JarvisPanel } from "./jarvis-panel";

export function Projects() {
  const projects = getProjects();

  return (
    <section
      id="projects"
      aria-labelledby="projects-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 80%, color-mix(in oklab, var(--accent) 6%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Selected Work
        </p>
        <SplitReveal
          as="h2"
          id="projects-h"
          className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
        >Projects</SplitReveal>
        <p className="mt-3 max-w-xl text-sm text-muted">
          <span data-testid="stat-projects-section">{projects.length}</span>{" "}
          projects spanning machine learning, computer vision, full-stack deployment, and data analytics.
        </p>

        <ProjectGrid projects={projects} />
        <JarvisPanel />
      </div>
    </section>
  );
}
