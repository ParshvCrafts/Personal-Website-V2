import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-elevated px-3 py-1 font-mono text-xs text-muted transition-all duration-200 ease-out hover:border-accent/40 hover:bg-accent/5 hover:text-foreground motion-safe:hover:scale-105",
        className,
      )}
      {...props}
    />
  );
}
