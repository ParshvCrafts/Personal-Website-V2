"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Variant = "fade-rise" | "clip-up" | "clip-left" | "blur-in" | "stagger-cascade";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation variant. Default: 'fade-rise' (same as existing Reveal). */
  variant?: Variant;
  /** Animation duration in seconds. Default: 0.8 */
  duration?: number;
  /** Delay before animation starts. Default: 0 */
  delay?: number;
  /** Stagger amount for 'stagger-cascade' variant or when staggering children. */
  stagger?: number;
  /** Whether to stagger direct children (like Reveal's stagger prop). */
  staggerChildren?: boolean;
}

export function ScrollReveal({
  children,
  className,
  variant = "fade-rise",
  duration,
  delay = 0,
  stagger = 0.1,
  staggerChildren = false,
  ...rest
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        };

        switch (variant) {
          case "fade-rise": {
            const dur = duration ?? 0.8;
            const targets =
              staggerChildren ? ref.current!.children : ref.current;
            gsap.from(targets, {
              opacity: 0,
              y: 24,
              duration: dur,
              ease: "power3.out",
              delay,
              stagger: staggerChildren ? stagger : 0,
              scrollTrigger: trigger,
            });
            break;
          }

          case "clip-up": {
            const dur = duration ?? 0.9;
            gsap.fromTo(
              ref.current,
              { clipPath: "inset(100% 0 0 0)" },
              {
                clipPath: "inset(0 0 0 0)",
                duration: dur,
                ease: "power3.inOut",
                delay,
                scrollTrigger: trigger,
              },
            );
            break;
          }

          case "clip-left": {
            const dur = duration ?? 0.9;
            gsap.fromTo(
              ref.current,
              { clipPath: "inset(0 100% 0 0)" },
              {
                clipPath: "inset(0 0 0 0)",
                duration: dur,
                ease: "power3.inOut",
                delay,
                scrollTrigger: trigger,
              },
            );
            break;
          }

          case "blur-in": {
            const dur = duration ?? 0.7;
            gsap.fromTo(
              ref.current,
              { opacity: 0, filter: "blur(8px)" },
              {
                opacity: 1,
                filter: "blur(0px)",
                duration: dur,
                ease: "power2.out",
                delay,
                scrollTrigger: trigger,
              },
            );
            break;
          }

          case "stagger-cascade": {
            const dur = duration ?? 0.8;
            const kids = ref.current!.children;
            gsap.fromTo(
              kids,
              {
                opacity: 0,
                y: 20,
                x: (i: number) => Math.max(0, 12 - i * 4),
              },
              {
                opacity: 1,
                y: 0,
                x: 0,
                duration: dur,
                ease: "power3.out",
                delay,
                stagger: stagger,
                scrollTrigger: trigger,
              },
            );
            break;
          }
        }
      });
      // Reduced motion: no tween → children remain visible and in place.
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className={cn("motion-safe:will-change-transform", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
