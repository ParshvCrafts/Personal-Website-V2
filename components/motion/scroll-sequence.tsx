"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap, prefersReducedMotion, frameForProgress } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface TextBeat {
  /** Progress in [0,1] at which this beat is active. */
  at: number;
  heading: string;
  body?: string;
}

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  total: number,
  dims: { width: number; height: number },
) => void;

export function isRenderableFrame(image: HTMLImageElement | null | undefined): boolean {
  return Boolean(image && image.complete && image.naturalWidth > 0);
}

interface ScrollSequenceProps {
  /** Total frames in the sequence (recommended 90–150 for image mode). */
  frameCount: number;
  width: number;
  height: number;
  /** Image mode: URL prefix, e.g. "/sequences/notebook/frame_". Omit for procedural mode. */
  framePath?: string;
  frameExt?: "webp" | "avif" | "jpg";
  pad?: number;
  /** Procedural mode: draw a frame yourself (used for the placeholder). */
  draw?: DrawFn;
  pinLength?: string; // e.g. "+=150%"
  textBeats?: TextBeat[];
  className?: string;
  /** Required text alternative for accessibility. */
  alt: string;
}

export function ScrollSequence({
  frameCount,
  width,
  height,
  framePath,
  frameExt = "webp",
  pad = 4,
  draw,
  pinLength = "+=150%",
  textBeats = [],
  className,
  alt,
}: ScrollSequenceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  registerGsap();

  useGSAP(
    (_context, contextSafe) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Image mode: preload + decode all frames before enabling scrub.
      const images: HTMLImageElement[] = [];
      let lastRenderableFrame = 0;
      const render = (frame: number) => {
        ctx.clearRect(0, 0, width, height);
        if (draw) {
          draw(ctx, frame, frameCount, { width, height });
        } else if (isRenderableFrame(images[frame])) {
          lastRenderableFrame = frame;
          ctx.drawImage(images[frame], 0, 0, width, height);
        } else if (isRenderableFrame(images[lastRenderableFrame])) {
          ctx.drawImage(images[lastRenderableFrame], 0, 0, width, height);
        }
      };

      const buildUrl = (i: number) =>
        `${framePath}${String(i + 1).padStart(pad, "0")}.${frameExt}`;

      let currentFrame = 0;
      const start = contextSafe!(() => {
        render(0);
        const reduce = prefersReducedMotion();
        // Show active beat for the given progress (reduced motion = first beat shown statically).
        const showBeat = (progress: number) => {
          if (!textBeats.length) return;
          let active = 0;
          textBeats.forEach((b, i) => {
            if (progress >= b.at) active = i;
          });
          beatRefs.current.forEach((el, i) =>
            el?.style.setProperty("opacity", i === active ? "1" : "0"),
          );
        };
        showBeat(0);

        if (reduce) {
          // No pin, no scrub, no scroll trap — static first frame + all beats visible.
          beatRefs.current.forEach((el) => el?.style.setProperty("opacity", "1"));
          return;
        }

        const state = { frame: 0 };
        gsap.to(state, {
          frame: frameCount - 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: pinLength,
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
              currentFrame = frameForProgress(self.progress, frameCount);
              render(currentFrame);
              showBeat(self.progress);
            },
          },
        });
      });

      if (framePath) {
        let settled = 0;
        // isMounted tracking to avoid memory leaks or setting state on unmounted component
        let isMounted = true;
        const onSettle = () => {
          if (!isMounted) return;
          settled += 1;
          if (settled === frameCount) start();
        };
        for (let i = 0; i < frameCount; i++) {
          const img = new Image();
          img.src = buildUrl(i);
          if (img.decode) {
            img.decode().then(onSettle).catch(onSettle);
          } else {
            img.onload = onSettle;
            img.onerror = onSettle;
          }
          images.push(img);
        }
        
        // Ensure resize forces a redraw of the active frame
        let resizeTimeout: ReturnType<typeof setTimeout>;
        const onResize = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            if (isMounted) {
              render(currentFrame);
            }
          }, 150);
        };
        window.addEventListener("resize", onResize);

        return () => {
          isMounted = false;
          window.removeEventListener("resize", onResize);
          clearTimeout(resizeTimeout);
        };
      } else {
        let isMounted = true;
        start(); // procedural placeholder needs no assets
        
        const onResize = () => {
          if (isMounted) {
            render(currentFrame);
          }
        };
        window.addEventListener("resize", onResize);
        
        return () => {
           isMounted = false;
           window.removeEventListener("resize", onResize);
        };
      }
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={cn("relative", className)} aria-label={alt}>
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ width, maxWidth: "100%", height: "auto" }}
          className="block"
          role="img"
          aria-label={alt}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center px-6 md:px-16">
          {textBeats.map((b, i) => (
            <div
              key={i}
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              className="absolute max-w-md motion-safe:transition-opacity motion-safe:duration-500"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <h3 className="font-display text-3xl text-heading md:text-5xl">{b.heading}</h3>
              {b.body && <p className="mt-3 text-muted">{b.body}</p>}
            </div>
          ))}
        </div>
      </div>
      {/* Static text alternative for assistive tech / no-JS. */}
      <p className="sr-only">{alt}</p>
    </section>
  );
}
