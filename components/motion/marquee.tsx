"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds per loop. */
  speed?: number;
  reverse?: boolean;
  /**
   * How many identical copies to lay end-to-end. Each copy translates by its own
   * -100%, so the belt stays gap-free as long as (repeat - 1) copies are at least
   * as wide as the container. The default of 4 covers content narrower than the
   * viewport; bump it for very short content in very wide containers.
   */
  repeat?: number;
}

export function Marquee({ children, className, speed = 28, reverse, repeat = 4 }: MarqueeProps) {
  return (
    <div
      className={cn("group relative flex overflow-hidden", className)}
      style={{ ["--marquee-duration" as string]: `${speed}s` }}
    >
      {Array.from({ length: Math.max(2, repeat) }).map((_, copy) => (
        <div
          key={copy}
          aria-hidden={copy !== 0}
          className={cn(
            "flex shrink-0 items-center gap-8 pr-8",
            "motion-safe:animate-[marquee_var(--marquee-duration)_linear_infinite]",
            "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
