"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { GrainOverlay } from "@/components/layout/grain-overlay";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a production app, we would log this to Sentry or similar.
    console.error("Runtime Exception:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center text-foreground">
      <GrainOverlay />
      
      {/* Background glow - using red for error state */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
      >
        <div className="h-[40vh] w-[40vh] rounded-full bg-red-500 blur-[120px]" />
      </div>

      <div className="relative z-10 flex max-w-xl flex-col items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-elevated shadow-xl">
          <AlertTriangle className="h-8 w-8 text-red-500" strokeWidth={1.5} />
        </div>
        
        <h1 className="font-display text-4xl font-bold tracking-tight text-heading sm:text-5xl">
          Something went wrong
        </h1>
        
        <p className="font-mono text-sm uppercase tracking-widest text-red-400">
          Runtime Error
        </p>
        
        <p className="text-lg leading-relaxed text-muted">
          An unexpected error occurred while rendering this page.
          {error.digest && <span className="block mt-2 text-sm opacity-70">Error ID: {error.digest}</span>}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <button
              onClick={() => reset()}
              className="group flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 font-mono text-sm transition-colors hover:border-red-500/40 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <RefreshCcw className="h-4 w-4 transition-transform group-hover:-rotate-90" />
              Try Again
            </button>
          </Magnetic>
          
          <Magnetic>
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 font-mono text-sm transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Magnetic>
        </div>
      </div>
    </main>
  );
}
