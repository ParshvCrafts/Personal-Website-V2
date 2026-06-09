import type { Milestone } from "@/content/journey";
import { MILESTONES } from "@/content/journey";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

function MilestoneItem({
  milestone: m,
  index: i,
}: {
  milestone: Milestone;
  index: number;
}) {
  const isRight = i % 2 === 1;
  const dt = m.year.replace(/^Summer /, "");

  return (
    <div
      className={cn(
        "relative pl-14 pb-12",
        "md:flex md:pl-0 md:pb-16",
        isRight && "md:flex-row-reverse"
      )}
    >
      {/* Content */}
      <div
        className={cn(
          "md:w-[calc(50%-1.5rem)]",
          isRight ? "md:pl-10" : "md:pr-10 md:text-right"
        )}
      >
        <time
          dateTime={dt}
          className="block font-mono text-xs uppercase tracking-widest text-accent"
        >
          {m.year}
        </time>
        <h3 className="mt-1 font-display text-xl text-heading">{m.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{m.body}</p>
        {m.status === "active" && (
          <span
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-accent",
              isRight ? "justify-start" : "md:justify-end"
            )}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Active
          </span>
        )}
      </div>

      {/* Center dot */}
      <div
        className={cn(
          "absolute left-[10px] top-1",
          "md:relative md:left-auto md:top-auto",
          "md:flex md:w-12 md:shrink-0 md:justify-center md:pt-2"
        )}
      >
        <div
          className={cn(
            "h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-background",
            m.status === "active"
              ? "bg-accent ring-accent"
              : "bg-surface ring-border"
          )}
        />
      </div>

      {/* Spacer for empty side on desktop */}
      <div className="hidden md:block md:w-[calc(50%-1.5rem)]" />
    </div>
  );
}

export function Journey() {
  return (
    <section
      id="journey"
      aria-labelledby="journey-h"
      className="scroll-mt-[88px] border-t border-border px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            My Journey
          </p>
          <h2 id="journey-h" className="mt-3 font-display text-4xl text-heading md:text-5xl">
            India → Berkeley
          </h2>
          <p className="mt-3 max-w-xl text-muted">A story of perseverance.</p>
        </Reveal>

        <div className="relative mt-20">
          {/* Vertical spine */}
          <div className="absolute inset-y-0 left-4 w-px bg-border md:left-1/2 md:-translate-x-1/2" />

          <Reveal stagger={0.08}>
            {MILESTONES.map((m, i) => (
              <MilestoneItem key={m.title} milestone={m} index={i} />
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
