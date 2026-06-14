type OpenListener = () => void;
const openListeners = new Set<OpenListener>();

/** Decouples the nav trigger from the dialog island. Returns an unsubscribe fn. */
export function subscribeOpenRequest(cb: OpenListener): () => void {
  openListeners.add(cb);
  return () => { openListeners.delete(cb); };
}

export function requestOpen(): void {
  openListeners.forEach((l) => l());
}
