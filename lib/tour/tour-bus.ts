type Listener = () => void;
const listeners = new Set<Listener>();

/** Subscribe to tour-start requests. Returns an unsubscribe fn. SSR-safe. */
export function subscribeStartTour(cb: Listener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function requestStartTour(): void {
  listeners.forEach((l) => l());
}
