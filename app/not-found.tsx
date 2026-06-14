"use client";

import Link from "next/link";
import { ArrowRight, TerminalSquare } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { GrainOverlay } from "@/components/layout/grain-overlay";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center text-foreground">
      <GrainOverlay />
      
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40"
      >
        <div className="h-[40vh] w-[40vh] rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="relative z-10 flex max-w-xl flex-col items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-elevated shadow-xl">
          <TerminalSquare className="h-8 w-8 text-accent" strokeWidth={1.5} />
        </div>
        
        <h1 className="font-display text-5xl font-bold tracking-tight text-heading sm:text-7xl">
          404
        </h1>
        
        <p className="font-mono text-sm uppercase tracking-widest text-accent">
          Page Not Found
        </p>
        
        <p className="text-lg leading-relaxed text-muted">
          The requested URL was not found on this server. It might have been moved, deleted, or perhaps you just typed it wrong.
        </p>

        <div className="mt-4">
          <Magnetic>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 font-mono text-sm transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Return Home
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>
        </div>
      </div>
    </main>
  );
}
