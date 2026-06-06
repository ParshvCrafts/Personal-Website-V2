import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-mono text-xs uppercase tracking-[0.2em] text-muted",
        className,
      )}
      {...props}
    />
  );
}
