export interface GithubEvent {
  type: string;
  repo?: { name?: string };
  created_at?: string;
}

export interface GithubSummary {
  verb: string;
  repo: string;
  repoUrl: string;
  relativeTime: string;
}

const VERBS: Record<string, string> = {
  PushEvent: "pushed to",
  CreateEvent: "created",
  PullRequestEvent: "opened a PR in",
  WatchEvent: "starred",
  ForkEvent: "forked",
};

/** Human relative time from a past instant. Pure. */
export function relativeTimeFrom(then: Date, now: Date): string {
  const s = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Reduce a GitHub public-events array to one concise summary, or null. Pure. */
export function summarizeGithubActivity(events: GithubEvent[], now: Date): GithubSummary | null {
  if (!Array.isArray(events)) return null;
  for (const ev of events) {
    const verb = VERBS[ev.type];
    const full = ev.repo?.name;
    if (!verb || !full || !ev.created_at) continue;
    const then = new Date(ev.created_at);
    if (Number.isNaN(then.getTime())) continue;
    return {
      verb,
      repo: full.split("/").pop() ?? full,
      repoUrl: `https://github.com/${full}`,
      relativeTime: relativeTimeFrom(then, now),
    };
  }
  return null;
}
