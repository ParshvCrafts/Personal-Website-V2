"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { SKILL_PROFICIENCY } from "@/content/skills-proficiency";

export function ProficiencyBars() {
  const ref = useRef<HTMLUListElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const fills = el.querySelectorAll<HTMLElement>("[data-bar-fill]");
        gsap.from(fills, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <ul ref={ref} className="mt-8 grid gap-4 sm:grid-cols-2">
      {SKILL_PROFICIENCY.map((s) => (
        <li key={s.name}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm text-heading">{s.name}</span>
            <span className="font-mono text-xs text-muted">{s.level}%</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-elevated"
            role="meter"
            aria-valuenow={s.level}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${s.name} proficiency`}
          >
            <div
              data-bar-fill
              className="h-full rounded-full bg-accent"
              style={{ width: `${s.level}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
