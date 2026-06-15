"use client";

import { useRef, useState } from "react";
import { CODE_SAMPLES } from "@/content/about";
import { tabKeyToIndex } from "@/lib/about";
import { cn } from "@/lib/utils";
import { SyntaxHighlight } from "@/components/ui/syntax-highlight";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";

const NAV_KEYS = ["ArrowRight", "ArrowLeft", "Home", "End"];

export function CodeShowcase() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  registerGsap();

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!containerRef.current) return;
      const activePanel = containerRef.current.querySelector<HTMLElement>(
        `[role="tabpanel"]:not([hidden])`
      );
      if (!activePanel) return;

      const lines = activePanel.querySelectorAll<HTMLElement>("[data-code-line]");
      
      // Setup initial state
      gsap.set(lines, { clipPath: "inset(0 100% 0 0)" });
      
      // Typewriter wipe animation
      gsap.to(lines, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.inOut",
      });
    });
    return () => mm.revert();
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!NAV_KEYS.includes(e.key)) return;
    e.preventDefault();
    const next = tabKeyToIndex(e.key, active, CODE_SAMPLES.length);
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <div ref={containerRef}>
      <h3 className="font-display text-2xl text-heading md:text-3xl">Code Samples</h3>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-3 border-b border-border bg-elevated px-4 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-muted/30" />
            <span className="h-3 w-3 rounded-full bg-muted/30" />
            <span className="h-3 w-3 rounded-full bg-muted/30" />
          </span>
          <div role="tablist" aria-label="Code samples" className="flex gap-1">
            {CODE_SAMPLES.map((sample, i) => (
              <button
                key={sample.id}
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
                role="tab"
                id={`code-tab-${sample.id}`}
                aria-selected={active === i}
                aria-controls={`code-panel-${sample.id}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={onKeyDown}
                className={cn(
                  "min-h-11 rounded-md px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active === i ? "bg-surface text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {sample.filename}
              </button>
            ))}
          </div>
        </div>
        {CODE_SAMPLES.map((sample, i) => (
          <div
            key={sample.id}
            role="tabpanel"
            id={`code-panel-${sample.id}`}
            aria-labelledby={`code-tab-${sample.id}`}
            tabIndex={0}
            hidden={active !== i}
            className="min-h-[12rem] overflow-x-auto p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <SyntaxHighlight code={sample.code} lang={sample.lang} />
          </div>
        ))}
      </div>
    </div>
  );
}
