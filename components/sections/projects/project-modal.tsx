"use client";

import { ExternalLink, Play } from "lucide-react";
import type { Project } from "@/lib/types";
import { GithubIcon } from "@/components/layout/social-icons";
import { Badge } from "@/components/ui/badge";

interface ProjectModalContentProps {
  project: Project;
  titleId: string;
}

export function ProjectModalContent({ project, titleId }: ProjectModalContentProps) {
  return (
    <div className="pr-10">
      <div className="flex flex-wrap gap-1 mb-2">
        {project.categories.filter((c) => c !== "all").map((cat) => (
          <span key={cat} className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {cat}
          </span>
        ))}
      </div>

      <p id={titleId} className="font-display text-xl text-heading md:text-2xl leading-snug">
        {project.title}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

      {project.highlights.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            Highlights
          </p>
          <ul className="space-y-2">
            {project.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {project.technologies.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-1">
            {project.technologies.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {(project.githubUrl || project.liveUrl || project.presentationUrl) && (
        <div className="mt-6 border-t border-border pt-4 flex flex-wrap gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Live Demo
            </a>
          )}
          {project.presentationUrl && (
            <a
              href={project.presentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Demo Video
            </a>
          )}
        </div>
      )}
    </div>
  );
}
