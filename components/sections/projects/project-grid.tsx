"use client";

import { useState, useTransition, useId, useRef } from "react";
import { gsap, Flip, registerGsap } from "@/lib/motion";
import { withViewTransition } from "@/lib/view-transition";
import type { Project } from "@/lib/types";
import { FILTER_KEYS, FILTER_LABELS, type FilterKey } from "@/content/projects";
import { Reveal } from "@/components/motion/reveal";
import { Modal } from "@/components/ui/modal";
import { ProjectCard } from "./project-card";
import { ProjectModalContent } from "./project-modal";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [isPending, startTransition] = useTransition();
  const uid = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  registerGsap();
  const titleId = `${uid}-project-title`;
  const gridId = `${uid}-project-grid`;

  const filtered =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(activeFilter));

  /** Open the modal via a View Transition so the card morphs into the dialog. */
  function openProject(project: Project, cardEl: HTMLElement) {
    cardEl.style.viewTransitionName = "project-hero";
    withViewTransition(() => setSelected(project));
    // Clear the name in the next frame so it doesn't persist after the transition.
    requestAnimationFrame(() => {
      cardEl.style.viewTransitionName = "";
    });
  }

  function handleFilter(key: FilterKey) {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !gridRef.current) {
      startTransition(() => setActiveFilter(key));
      return;
    }
    const cards = gridRef.current.querySelectorAll("[data-testid^='project-card-']");
    const state = Flip.getState(cards);
    startTransition(() => setActiveFilter(key));
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.5,
        ease: "power2.inOut",
        scale: true,
        absolute: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.3 }),
      });
    });
  }

  function onTabKeyDown(e: React.KeyboardEvent, index: number) {
    const last = FILTER_KEYS.length - 1;
    let next = index;
    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    const key = FILTER_KEYS[next];
    handleFilter(key);
    document.getElementById(`${uid}-tab-${key}`)?.focus();
  }

  return (
    <div>
      {/* Filter bar */}
      <div
        role="tablist"
        aria-label="Filter projects by category"
        className="mt-10 flex flex-wrap gap-2"
      >
        {FILTER_KEYS.map((key, i) => (
          <button
            key={key}
            id={`${uid}-tab-${key}`}
            role="tab"
            aria-selected={activeFilter === key}
            aria-controls={gridId}
            tabIndex={activeFilter === key ? 0 : -1}
            onClick={() => handleFilter(key)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
            className={
              activeFilter === key
                ? "rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-widest bg-accent text-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "rounded-full border border-border px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            {FILTER_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Bento grid — Reveal IS the grid so the stagger animates the cards
          directly and each card's grid placement (featured = col-span-2) holds.
          Outer div is layout-neutral; used only for GSAP Flip card querying. */}
      <div ref={gridRef}>
        <Reveal
          stagger={0.05}
          id={gridId}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${activeFilter}`}
          data-testid="projects-grid"
          className={`mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ${isPending ? "opacity-50" : "opacity-100"}`}
        >
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              featured={project.featured === true}
              onOpen={openProject}
            />
          ))}
        </Reveal>
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        labelledBy={titleId}
      >
        {selected && (
          <ProjectModalContent project={selected} titleId={titleId} />
        )}
      </Modal>
    </div>
  );
}
