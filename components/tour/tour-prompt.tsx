"use client";

import { useCallback, useEffect, useState } from "react";
import { requestStartTour } from "@/lib/tour/tour-bus";
import { shouldShowTourPrompt, TOUR_SEEN_KEY } from "@/lib/tour/tour-prompt-state";

/** Non-blocking first-visit region offering the tour. Shows once (localStorage-gated). */
export function TourPrompt() {
  const [open, setOpen] = useState(false);

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, "1");
    } catch {
      /* private mode — non-fatal */
    }
  }, []);
  const dismiss = useCallback(() => {
    markSeen();
    setOpen(false);
  }, [markSeen]);
  const start = useCallback(() => {
    markSeen();
    setOpen(false);
    requestStartTour();
  }, [markSeen]);

  // First visit only: show, then auto-dismiss after 8s.
  useEffect(() => {
    if (!shouldShowTourPrompt(window.localStorage)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
    const id = window.setTimeout(dismiss, 8000);
    return () => window.clearTimeout(id);
  }, [dismiss]);

  if (!open) return null;

  return (
    <div
      role="region"
      aria-label="Take a tour"
      className="fixed bottom-4 left-4 z-[75] w-[min(92vw,320px)] rounded-xl border border-border bg-surface p-4 shadow-2xl"
    >
      <p className="text-sm text-foreground">New here? Take a 20-second tour.</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={start}
          className="min-h-11 rounded-md bg-accent px-4 text-sm text-on-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="min-h-11 rounded-md px-3 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
