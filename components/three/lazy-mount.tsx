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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
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
