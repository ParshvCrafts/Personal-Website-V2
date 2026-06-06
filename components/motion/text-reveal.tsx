"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}

export function TextReveal({ text, className, as: Tag = "h2" }: TextRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  registerGsap();
  const words = text.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current!.querySelectorAll("[data-word]"), {
          yPercent: 120,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom">
            <span data-word className="inline-block">
              {word}
            </span>
          </span>
          {/* Real, breaking space OUTSIDE the overflow-hidden mask so it is never
              clipped/trimmed (trailing whitespace inside an inline-block collapses)
              and the heading can still wrap across lines. */}
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
