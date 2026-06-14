/** True when focus is in a field where our hotkeys must not fire. */
export function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/** Cmd/Ctrl+K or a bare `/` opens the palette. */
export function matchesOpenHotkey(e: { key: string; metaKey: boolean; ctrlKey: boolean }): boolean {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") return true;
  if (e.key === "/" && !e.metaKey && !e.ctrlKey) return true;
  return false;
}

/** Cyclic index step; safe for empty lists. */
export function wrapIndex(current: number, length: number, delta: number): number {
  if (length <= 0) return 0;
  return (current + delta + length) % length;
}
