"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { isEditableTarget, matchesOpenHotkey } from "@/lib/command-palette/keys";
import {
  subscribeOpenRequest,
  subscribePaletteState,
  getPaletteOpen,
  setPaletteOpen,
} from "@/lib/command-palette/palette-bus";

/** Owns palette open state (shared store); opens on Cmd/Ctrl+K, `/`, or a bus request. */
export function useCommandPalette() {
  const open = useSyncExternalStore(subscribePaletteState, getPaletteOpen, () => false);
  const setOpen = useCallback((value: boolean) => setPaletteOpen(value), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if (matchesOpenHotkey(e)) { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    const unsub = subscribeOpenRequest(() => setPaletteOpen(true));
    return () => { window.removeEventListener("keydown", onKey); unsub(); };
  }, []);
  return { open, setOpen };
}
