"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { Moon, Sun, BookOpen } from "lucide-react";
import { THEMES, THEME_LABELS, type ThemeName } from "@/lib/theme/palettes";
import { cn } from "@/lib/utils";

const ICONS: Record<ThemeName, typeof Moon> = {
  midnight: Moon,
  daylight: Sun,
  manuscript: BookOpen,
};

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function applyTheme(next: ThemeName, e: React.MouseEvent) {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Feature-detect native View Transitions; fall back to instant change.
    const startVT = (document as Document & {
      startViewTransition?: (cb: () => void) => void;
    }).startViewTransition;
    if (!startVT || reduce) {
      setTheme(next);
      return;
    }
    root.style.setProperty("--vt-x", `${e.clientX}px`);
    root.style.setProperty("--vt-y", `${e.clientY}px`);
    startVT.call(document, () => flushSync(() => setTheme(next)));
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1",
        className,
      )}
    >
      {THEMES.map((name) => {
        const Icon = ICONS[name];
        const active = mounted && theme === name;
        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={THEME_LABELS[name]}
            title={THEME_LABELS[name]}
            onClick={(e) => applyTheme(name, e)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-accent text-on-accent"
                : "text-muted hover:bg-elevated hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
