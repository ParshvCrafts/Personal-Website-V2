import type { ProfessionalDevelopment } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function statusClass(status: ProfessionalDevelopment["status"]): string {
  if (status === "Active" || status === "In Progress") return "bg-accent text-on-accent";
  return "border border-border text-muted";
}

function DevCard({ item }: { item: ProfessionalDevelopment }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {item.organization} · {item.type}
          </p>
          <h4 className="mt-1 font-display text-xl leading-snug text-heading">{item.title}</h4>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 font-mono text-xs",
            statusClass(item.status),
          )}
        >
          {item.status}
        </span>
      </div>
      {item.duration && (
        <p className="mt-2 font-mono text-xs text-muted">{item.duration}</p>
      )}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{item.description}</p>
      {item.impact && (
        <p className="mt-2 font-mono text-xs text-accent">{item.impact}</p>
      )}
      {item.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {item.skills.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      )}
      {item.link && (
        <div className="mt-4 border-t border-border pt-3">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded font-mono text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Learn More →
          </a>
        </div>
      )}
    </div>
  );
}

export function DevList({ items }: { items: ProfessionalDevelopment[] }) {
  return (
    <Reveal stagger={0.06} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <DevCard key={item.id} item={item} />
      ))}
    </Reveal>
  );
}
