"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export interface ProgressiveImageProps extends ImageProps {
  /** Optional fallback background class while loading (e.g., "bg-muted/20") */
  fallbackClassName?: string;
  /** Whether to animate the blur-up effect. Default: true */
  blurUp?: boolean;
}

/**
 * ProgressiveImage wrapper for next/image.
 *
 * Implements a smooth blur-up/fade-in animation when the image fully loads.
 * Falls back gracefully if `prefers-reduced-motion` is active.
 */
export function ProgressiveImage({
  className,
  fallbackClassName = "bg-muted/10",
  blurUp = true,
  alt,
  ...props
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Intelligently swap to the generated WebP format for optimized delivery
  let optimizedSrc = props.src;
  if (typeof optimizedSrc === "string" && /\\.(jpg|jpeg|png)$/i.test(optimizedSrc)) {
    optimizedSrc = optimizedSrc.replace(/\\.(jpg|jpeg|png)$/i, ".webp");
  }


  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fallbackClassName,
        className
      )}
    >
      <Image
        alt={alt || ""}
        className={cn(
          "h-full w-full object-cover transition-all duration-500 ease-in-out motion-reduce:transition-none",
          isLoading
            ? blurUp
              ? "scale-[1.02] blur-xl grayscale"
              : "opacity-0"
            : "scale-100 blur-0 grayscale-0 opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        {...props}
        src={optimizedSrc}
      />
    </div>
  );
}
