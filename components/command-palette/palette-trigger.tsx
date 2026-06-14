"use client";

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { requestOpen } from "@/lib/command-palette/palette-bus";

// Hydration-safe platform flag: server snapshot false (→ "Ctrl"), client may upgrade to mac.
const emptySubscribe = () => () => {};
function useIsMac(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}

/** Opens the palette via the bus. Desktop: ⌘K/Ctrl K chip. Mobile: search-icon tap target. */
export function PaletteTrigger() {
  const isMac = useIsMac();
  return (
    <button
      type="button"
      onClick={requestOpen}
      aria-haspopup="dialog"
      aria-label="Open command palette"
      className="flex h-11 items-center justify-center rounded-full text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:gap-1.5 md:rounded-md md:border md:border-border md:bg-surface md:px-2.5"
    >
      <Search className="h-4 w-4 md:h-3.5 md:w-3.5" aria-hidden />
      <span className="hidden items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-muted md:inline-flex">
        <kbd className="font-mono">{isMac ? "⌘" : "Ctrl"}</kbd>
        <kbd className="font-mono">K</kbd>
      </span>
    </button>
  );
}
