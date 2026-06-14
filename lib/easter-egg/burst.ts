type BurstListener = () => void;
const listeners = new Set<BurstListener>();

/** Subscribe to Konami bursts. Returns an unsubscribe fn. SSR-safe (no window at import). */
export function subscribeBurst(cb: BurstListener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function emitBurst(): void {
  listeners.forEach((l) => l());
}
