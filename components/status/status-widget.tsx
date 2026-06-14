"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { formatBerkeleyTime } from "@/lib/status/berkeley-time";
import { useGithubActivity } from "./use-github-activity";

/** Footer "currently" block: availability + Berkeley time + status + GitHub activity. */
export function StatusWidget() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const activity = useGithubActivity();
  const t = now ? formatBerkeleyTime(now) : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-border px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
      <div className="flex items-center gap-2">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent" />
        <span className="text-sm text-foreground">{SITE.availability}</span>
      </div>

      <p className="font-mono text-xs text-muted">
        {SITE.status}
        {t && (
          <>
            {" · "}
            <span suppressHydrationWarning>
              {t.time} {t.zone}
            </span>
          </>
        )}
      </p>

      {activity && (
        <a
          href={activity.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ↳ {activity.verb} {activity.repo} · {activity.relativeTime}
        </a>
      )}
    </div>
  );
}
