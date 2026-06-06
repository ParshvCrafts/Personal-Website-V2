"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds per loop. */
  speed?: number;
  reverse?: boolean;
}

export function Marquee({ children, className, speed = 28, reverse }: MarqueeProps) {
  return (
    <div
      className={cn("group relative flex overflow-hidden", className)}
      style={{ ["--marquee-duration" as string]: `${speed}s` }}
    >
      {[0, 1].map((dup) => (
        <div
          key={dup}
          aria-hidden={dup === 1}
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
