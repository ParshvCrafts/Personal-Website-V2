"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { useMotionPreference } from "@/components/providers/motion-preference";
import { buildCommands } from "@/lib/command-palette/commands";
import { rankCommands } from "@/lib/command-palette/fuzzy";
import { wrapIndex } from "@/lib/command-palette/keys";
import type { Command, CommandContext } from "@/lib/command-palette/types";
import { SOCIAL_LINKS } from "@/lib/site";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const { scrollTo } = useSmoothScroll();
  const { setTheme } = useTheme();
  const { toggle: toggleAnimations } = useMotionPreference();

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const allCommands = useMemo(() => buildCommands(), []);
  const results = useMemo(
    () => (query.trim() ? rankCommands(query, allCommands) : allCommands),
    [query, allCommands],
  );

  const ctx: CommandContext = useMemo(() => ({
    scrollTo,
    setTheme,
    toggleAnimations,
    navigateVariant: (param, value) => {
      const url = new URL(window.location.href);
      url.searchParams.set(param, value);
      window.location.href = url.toString();
    },
    copyEmail: () => {
      const done = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(SOCIAL_LINKS.email).then(done).catch(done);
      } else {
        done();
      }
    },
    openUrl: (url, external) => {
      if (external) window.open(url, "_blank", "noopener,noreferrer");
      else window.location.href = url;
    },
    close: () => onCloseRef.current(),
  }), [scrollTo, setTheme, toggleAnimations]);

  const runCommand = useCallback((cmd: Command) => { cmd.run(ctx); }, [ctx]);

  // Reset active on query change; clear everything when closed.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) { setQuery(""); setActive(0); setCopied(false); }
  }, [open]);

  // Open lifecycle: focus input, lock scroll, fade-in, Esc + Tab trap, restore focus.
  useEffect(() => {
    if (!open) return;
    registerGsap();
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";

    if (!prefersReducedMotion() && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: -8, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power2.out" },
      );
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href],button:not([disabled]),input,[tabindex]:not([tabindex='-1'])",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [open]);

  // Keep the active row in view.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => wrapIndex(i, results.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => wrapIndex(i, results.length, -1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) runCommand(cmd);
    }
  };

  const activeId = results[active] ? `cmd-${results[active].id}` : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      aria-hidden={!open}
      className={cn("fixed inset-0 z-[80]", open ? "pointer-events-auto" : "pointer-events-none invisible")}
    >
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="absolute inset-x-0 top-[12vh] mx-auto w-[min(92vw,560px)] px-4">
        <div ref={panelRef} className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border px-4">
            <span aria-hidden className="font-mono text-xs uppercase tracking-widest text-muted">⌘K</span>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls="command-palette-list"
              aria-activedescendant={activeId}
              aria-label="Search commands"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search sections, themes, links…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              className="min-h-12 flex-1 bg-transparent py-3 font-display text-lg text-heading outline-none placeholder:text-muted"
            />
          </div>
          <ul
            ref={listRef}
            id="command-palette-list"
            role="listbox"
            aria-label="Commands"
            className="max-h-[50vh] overflow-y-auto p-2"
          >
            {results.length === 0 && (
              <li role="presentation" className="px-3 py-6 text-center font-mono text-xs uppercase tracking-widest text-muted">
                No results
              </li>
            )}
            {results.map((cmd, i) => {
              const Icon = cmd.icon;
              const isActive = i === active;
              const showHeader = cmd.group !== (i > 0 ? results[i - 1].group : null);
              const showCopied = cmd.id === "link-copy-email" && copied;
              return (
                <li key={cmd.id} role="presentation">
                  {showHeader && (
                    <div role="presentation" className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                      {cmd.group}
                    </div>
                  )}
                  <button
                    type="button"
                    id={`cmd-${cmd.id}`}
                    role="option"
                    aria-selected={isActive}
                    tabIndex={-1}
                    data-active={isActive}
                    onMouseMove={() => { if (active !== i) setActive(i); }}
                    onClick={() => runCommand(cmd)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                      isActive ? "bg-accent/10 text-accent" : "text-foreground hover:bg-elevated",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{showCopied ? "Copied ✓" : cmd.label}</span>
                    {cmd.hint && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{cmd.hint}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
