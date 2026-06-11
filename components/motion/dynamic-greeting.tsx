"use client";

import { useSyncExternalStore } from "react";

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Hello";
}

// No external mutations to subscribe to — the greeting is derived once on the
// client. An empty subscribe keeps useSyncExternalStore happy.
const subscribe = () => () => {};

/**
 * Time-aware greeting to add warmth and personality to the hero.
 *
 * Renders a static fallback server-side ("Hello") to avoid hydration mismatch,
 * then resolves to the time-appropriate greeting on the client. Using
 * useSyncExternalStore (server snapshot vs client snapshot) keeps SSR and the
 * first client render in agreement without a setState-in-effect.
 */
export function DynamicGreeting() {
  const greeting = useSyncExternalStore(
    subscribe,
    () => getGreeting(new Date().getHours()),
    () => "Hello",
  );

  return (
    <span className="block font-mono text-xs uppercase tracking-[0.25em] text-accent">
      {greeting}
    </span>
  );
}
