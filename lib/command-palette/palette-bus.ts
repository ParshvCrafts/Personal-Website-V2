type Listener = () => void;

const openRequestListeners = new Set<Listener>();
export function subscribeOpenRequest(cb: Listener): () => void {
  openRequestListeners.add(cb);
  return () => { openRequestListeners.delete(cb); };
}
export function requestOpen(): void {
  openRequestListeners.forEach((l) => l());
}

let paletteOpen = false;
const stateListeners = new Set<Listener>();
export function getPaletteOpen(): boolean {
  return paletteOpen;
}
export function setPaletteOpen(value: boolean): void {
  if (paletteOpen === value) return;
  paletteOpen = value;
  stateListeners.forEach((l) => l());
}
export function subscribePaletteState(cb: Listener): () => void {
  stateListeners.add(cb);
  return () => { stateListeners.delete(cb); };
}
