"use client";

import { useEffect, useState } from "react";
import { GITHUB_USERNAME } from "@/lib/site";
import { summarizeGithubActivity, type GithubSummary } from "@/lib/status/github-activity";

const CACHE_KEY = "pp-gh-activity";
const MAX_AGE_MS = 30 * 60 * 1000;

interface Cache {
  summary: GithubSummary | null;
  fetchedAt: number;
}

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : null;
  } catch {
    return null;
  }
}

/** Latest public GitHub activity, client-fetched + localStorage-cached. Never throws. */
export function useGithubActivity(): GithubSummary | null {
  const [summary, setSummary] = useState<GithubSummary | null>(null);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSummary(cached.summary);
      if (Date.now() - cached.fetchedAt < MAX_AGE_MS) return;
    }
    const ctrl = new AbortController();
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=20`, {
      signal: ctrl.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((events) => {
        const next = summarizeGithubActivity(events, new Date());
        setSummary(next);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ summary: next, fetchedAt: Date.now() }));
        } catch {
          /* storage full / blocked — non-fatal */
        }
      })
      .catch(() => {
        /* offline / rate-limit / abort → keep whatever cache we have */
      });
    return () => ctrl.abort();
  }, []);

  return summary;
}
