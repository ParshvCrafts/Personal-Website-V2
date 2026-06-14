"use client";

import { useEffect, useState } from "react";
import { isEditableTarget, matchesOpenHotkey } from "@/lib/command-palette/keys";
import { subscribeOpenRequest } from "@/lib/command-palette/palette-bus";

/** Owns palette open state; opens on Cmd/Ctrl+K, `/`, or a bus request. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if (matchesOpenHotkey(e)) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    const unsub = subscribeOpenRequest(() => setOpen(true));
    return () => { window.removeEventListener("keydown", onKey); unsub(); };
  }, []);
  return { open, setOpen };
}
