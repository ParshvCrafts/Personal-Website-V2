"use client";

import { useState, useTransition, useId } from "react";
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
  const titleId = `${uid}-project-title`;
  const gridId = `${uid}-project-grid`;

  const filtered =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(activeFilter));

  function handleFilter(key: FilterKey) {
    startTransition(() => setActiveFilter(key));
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

      {/* Bento grid */}
      <div
        id={gridId}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${activeFilter}`}
        data-testid="projects-grid"
        className={`mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <Reveal stagger={0.05}>
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              featured={project.featured === true}
              onOpen={setSelected}
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
