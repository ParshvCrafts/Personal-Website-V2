"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of an element inside `children` that labels the dialog. */
  labelledBy?: string;
  /** Fallback accessible name when there is no visible title to reference. */
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible modal: focus-trapped, Esc/scrim to close, body-scroll locked,
 * focus restored to the opener on close (mirrors MobileMenu). One motion-safe
 * entrance; reduced motion leaves the panel fully visible. Returns null when
 * closed (no aria-hidden subtree for axe to walk). z-[80] sits above grain
 * (z-50) and below the preloader (z-100).
 */
export function Modal({ open, onClose, labelledBy, ariaLabel, children, className }: ModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  registerGsap();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus trap + scroll lock + Esc + focus restore.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
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
  }, [open]);

  // Motion-safe entrance; reduced motion skips it (panel stays visible).
  useGSAP(
    () => {
      if (!open) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(rootRef.current, { opacity: 0, duration: 0.2, ease: "power2.out" });
        gsap.from(panelRef.current, { y: 12, scale: 0.98, duration: 0.3, ease: "power3.out" });
      });
      return () => mm.revert();
    },
    { dependencies: [open] },
  );

  if (!open) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        data-testid="modal-scrim"
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        className={cn(
          "relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl",
          className,
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}
