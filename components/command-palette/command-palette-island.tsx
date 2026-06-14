"use client";

import { useEffect } from "react";
import { useCommandPalette } from "@/lib/command-palette/use-command-palette";
import { CommandPalette } from "./command-palette";
import { createKonamiMatcher } from "@/lib/easter-egg/konami";
import { emitBurst } from "@/lib/easter-egg/burst";
import { isEditableTarget } from "@/lib/command-palette/keys";

/** Single client island: owns the palette dialog + the global Konami listener. */
export function CommandPaletteIsland() {
  const { open, setOpen } = useCommandPalette();

  useEffect(() => {
    const matcher = createKonamiMatcher();
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if (matcher.push(e.key)) emitBurst();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <CommandPalette open={open} onClose={() => setOpen(false)} />;
}
