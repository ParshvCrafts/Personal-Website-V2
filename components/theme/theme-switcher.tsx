"use client";

import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { Moon, Sun, BookOpen, Bot } from "lucide-react";
import { THEMES, THEME_LABELS, type ThemeName } from "@/lib/theme/palettes";
import { cn } from "@/lib/utils";

const ICONS: Record<ThemeName, typeof Moon> = {
  midnight: Moon,
  daylight: Sun,
  manuscript: BookOpen,
  neon: Bot,
};

// Hydration-safe "are we on the client?" flag without a synchronous setState
// in an effect: the server snapshot is always false, the client snapshot true.
const emptySubscribe = () => () => {};

function getThemeOrigin(
  target: HTMLButtonElement | null,
  event?: { clientX?: number; clientY?: number },
): { x: number; y: number } {
  if (
    typeof event?.clientX === "number" &&
    typeof event.clientY === "number" &&
    (event.clientX !== 0 || event.clientY !== 0)
  ) {
    return { x: event.clientX, y: event.clientY };
  }

  const rect = target?.getBoundingClientRect();
  if (rect) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const buttonRefs = useRef<Record<ThemeName, HTMLButtonElement | null>>({
    midnight: null,
    daylight: null,
    manuscript: null,
    neon: null,
  });
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const currentTheme = mounted && theme && THEMES.includes(theme as ThemeName)
    ? (theme as ThemeName)
    : THEMES[0];

  function applyTheme(next: ThemeName, origin: { x: number; y: number }) {
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
    root.style.setProperty("--vt-x", `${origin.x}px`);
    root.style.setProperty("--vt-y", `${origin.y}px`);
    startVT.call(document, () => flushSync(() => setTheme(next)));
  }

  function moveTheme(current: ThemeName, direction: 1 | -1, target: HTMLButtonElement | null) {
    const currentIndex = THEMES.indexOf(current);
    const nextIndex = (currentIndex + direction + THEMES.length) % THEMES.length;
    const nextTheme = THEMES[nextIndex];
    const button = buttonRefs.current[nextTheme];
    applyTheme(nextTheme, getThemeOrigin(button ?? target));
    button?.focus();
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
          const active = currentTheme === name;
          return (
            <button
              key={name}
              ref={(node) => {
                buttonRefs.current[name] = node;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              aria-label={THEME_LABELS[name]}
              title={THEME_LABELS[name]}
              onClick={(e) => applyTheme(name, getThemeOrigin(e.currentTarget, e))}
              onKeyDown={(e) => {
                switch (e.key) {
                  case "ArrowRight":
                  case "ArrowDown":
                    e.preventDefault();
                    moveTheme(name, 1, e.currentTarget);
                    break;
                  case "ArrowLeft":
                  case "ArrowUp":
                    e.preventDefault();
                    moveTheme(name, -1, e.currentTarget);
                    break;
                  case "Home":
                    e.preventDefault();
                    applyTheme(THEMES[0], getThemeOrigin(e.currentTarget));
                    buttonRefs.current[THEMES[0]]?.focus();
                    break;
                  case "End":
                    e.preventDefault();
                    applyTheme(THEMES[THEMES.length - 1], getThemeOrigin(e.currentTarget));
                    buttonRefs.current[THEMES[THEMES.length - 1]]?.focus();
                    break;
                }
              }}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200",
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
