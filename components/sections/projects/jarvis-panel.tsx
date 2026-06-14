import { Rocket, BookOpen, Target, Zap } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import {
  CURRENTLY_BUILDING,
  CURRENTLY_LEARNING,
  LEARNING_GOAL,
} from "@/content/projects";

export function JarvisPanel() {
  return (
    <Reveal>
      <div className="mt-16 rounded-3xl border border-border bg-surface overflow-hidden border-l-2 border-l-accent">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-widest text-heading">
              What I&apos;m Working On
            </span>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
              aria-hidden="true"
            />
            Active
          </span>
        </div>

        {/* Two panels */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Building */}
          <div className="p-6 md:border-r md:border-border">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Currently Building
              </span>
            </div>
            <p className="font-display text-lg text-heading leading-snug">
              {CURRENTLY_BUILDING.name}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {CURRENTLY_BUILDING.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1">
              {CURRENTLY_BUILDING.tech.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>

          {/* Learning */}
          <div className="p-6 border-t border-border md:border-t-0">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Currently Learning
              </span>
            </div>
            <ul className="space-y-2">
              {CURRENTLY_LEARNING.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/50 bg-elevated px-3 py-2">
              <Target className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span className="font-mono text-xs text-muted">{LEARNING_GOAL}</span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
