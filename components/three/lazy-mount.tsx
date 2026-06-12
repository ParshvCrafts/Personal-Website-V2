"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazyMountProps {
  /** How early to mount before entering the viewport. */
  rootMargin?: string;
  /** Shown until the element nears the viewport. */
  poster?: ReactNode;
  children: ReactNode;
}

/** Renders `poster` until the wrapper nears the viewport, then mounts `children` once. */
export function LazyMount({ rootMargin = "200px", poster = null, children }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  // No IntersectionObserver (older runtime / test stub) ⇒ mount immediately. This is
  // a lazy initializer, not an effect-time setState, so it stays render-safe and lint-clean.
  // LazyMount only renders client-side inside SceneSlot (tier "off" until mount; scenes are
  // ssr:false), so this never short-circuits the poster during SSR.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, visible]);

  return <div ref={ref}>{visible ? children : poster}</div>;
}
