"use client";

import { useEffect, useState } from "react";

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Hello";
}

/**
 * Time-aware greeting to add warmth and personality to the hero.
 *
 * Renders a static fallback server-side ("Hello") to avoid hydration
 * mismatch, then hydrates to the time-appropriate greeting client-side.
 */
export function DynamicGreeting() {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  return (
    <span className="block font-mono text-xs uppercase tracking-[0.25em] text-accent">
      {greeting}
    </span>
  );
}
