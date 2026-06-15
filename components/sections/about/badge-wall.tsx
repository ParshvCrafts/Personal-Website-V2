import { Reveal } from "@/components/motion/reveal";
import { ACHIEVEMENT_BADGES } from "@/content/about";

export function BadgeWall() {
  return (
    <div>
      <h3 className="font-display text-2xl text-heading md:text-3xl">Achievement Badges</h3>
      <p className="mt-2 max-w-xl text-sm text-muted">
        A wall of recognitions. Hover any mark for its title.
      </p>
      <Reveal stagger={0.03} className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {ACHIEVEMENT_BADGES.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className="group relative flex aspect-square items-center justify-center rounded-xl border border-border bg-surface transition-colors hover:border-accent/40"
            >
              <Icon
                className="h-6 w-6 text-muted transition-colors group-hover:text-accent"
                aria-hidden="true"
              />
              <span className="sr-only">{badge.label}</span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-elevated px-2 py-1 font-mono text-[10px] text-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}
