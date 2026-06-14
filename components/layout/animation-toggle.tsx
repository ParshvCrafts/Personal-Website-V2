"use client";

import { useMotionPreference } from "@/components/providers/motion-preference";
import { Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnimationToggle({ className }: { className?: string }) {
  const { pref, toggle } = useMotionPreference();
  const isReduced = pref === "reduce";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isReduced ? "Enable animations" : "Disable animations"}
      title={isReduced ? "Enable animations" : "Disable animations"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {isReduced ? (
        <Activity className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
