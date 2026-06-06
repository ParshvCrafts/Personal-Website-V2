"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { SITE } from "@/lib/site";

const SESSION_KEY = "pp-preloaded";

/**
 * One-per-session entrance overlay: a 0→100 counter, then the overlay wipes up to
 * reveal the page. Skippable (click / any key). Reduced motion or already-seen →
 * renders nothing (no overlay, no trap). Content always lives underneath, so the
 * overlay never removes content from the DOM.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  registerGsap();

  useGSAP(
    () => {
      const seen =
        typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";
      const finish = () => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore storage errors */
        }
        setDone(true);
      };

      if (seen || prefersReducedMotion()) {
        finish();
        return;
      }

      const counter = { v: 0 };
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(counter, {
        v: 100,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => setCount(Math.round(counter.v)),
      });
      tl.to(rootRef.current, { yPercent: -100, duration: 0.6, ease: "power3.inOut" }, "+=0.1");

      // Skippable: jump to the end on any interaction.
      const skip = () => tl.progress(1);
      window.addEventListener("pointerdown", skip);
      window.addEventListener("keydown", skip);
      return () => {
        window.removeEventListener("pointerdown", skip);
        window.removeEventListener("keydown", skip);
      };
    },
    { scope: rootRef },
  );

  if (done) return null;

  return (
    <div
      ref={rootRef}
      // aria-hidden: the page content underneath is the real content; this is a
      // transient visual veil, not information.
      aria-hidden
      className="fixed inset-0 z-[100] flex items-end justify-between bg-background px-6 pb-8 md:px-12 md:pb-12"
    >
      <span className="font-display text-2xl text-heading md:text-4xl">{SITE.name}</span>
      <span className="font-mono text-5xl tabular-nums text-muted md:text-7xl">
        {String(count).padStart(3, "0")}
      </span>
    </div>
  );
}
