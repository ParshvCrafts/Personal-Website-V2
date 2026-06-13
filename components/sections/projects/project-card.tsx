"use client";

import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import type { Project } from "@/lib/types";
import { GithubIcon } from "@/components/layout/social-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  featured: boolean;
  onOpen: (p: Project) => void;
}

export function ProjectCard({ project, featured, onOpen }: ProjectCardProps) {
  return (
    <div
      className={cn(
        "card-lift group relative flex flex-col rounded-2xl border border-border bg-surface transition-colors hover:border-accent/40",
        featured ? "sm:col-span-2" : "",
      )}
      data-cursor="view"
      data-testid={`project-card-${project.id}`}
    >
      {featured && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-elevated">
          <Image
            src={`/images/${project.image}`}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpen(project)}
            aria-haspopup="dialog"
            aria-label={`${project.title} — open project details`}
            className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
          >
            {featured && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                Featured
              </span>
            )}
            <h3 className={cn(
              "font-display leading-snug text-heading",
              featured ? "text-xl mt-0.5" : "text-lg",
            )}>
              {project.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted">
              {project.description}
            </p>
          </button>
        </div>

        {project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.tags.slice(0, featured ? 5 : 3).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`GitHub repository for ${project.title} (opens in new tab)`}
              className="flex items-center gap-1 rounded font-mono text-xs text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Live demo for ${project.title} (opens in new tab)`}
              className="flex items-center gap-1 rounded font-mono text-xs text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Live</span>
            </a>
          )}
          {project.presentationUrl && (
            <a
              href={project.presentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Demo video for ${project.title} (opens in new tab)`}
              className="flex items-center gap-1 rounded font-mono text-xs text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Demo</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="ml-auto font-mono text-xs text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
          >
            Details →
          </button>
        </div>
      </div>
    </div>
  );
}
