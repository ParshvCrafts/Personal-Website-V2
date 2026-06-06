"use client";

import { useEffect, useRef } from "react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { NAV_SECTIONS, SOCIAL_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { X, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/layout/social-icons";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  active: string | null;
  onNavigate: (id: string) => void;
}

export function MobileMenu({ open, onClose, active, onNavigate }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href],button:not([disabled]),[tabindex]:not([tabindex='-1'])",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[70] md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* Scrim */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col gap-8 border-l border-border bg-surface p-6 transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">Menu</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {NAV_SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active === id ? "true" : undefined}
              className={cn(
                "rounded-md px-3 py-3 text-left font-display text-2xl transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === id ? "text-accent" : "text-heading hover:text-accent",
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LinkedinIcon className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              aria-label="Email"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
