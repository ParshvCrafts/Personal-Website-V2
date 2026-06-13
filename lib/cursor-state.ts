export type CursorState = "default" | "link" | "view" | "field";

const INTERACTIVE = "a,button,[role='button'],input,textarea,select,[data-cursor='hover']";

/** Resolve the cursor state for a hovered element: explicit data-cursor wins, then tag heuristics. */
export function cursorStateFor(target: Element | null): CursorState {
  if (!target) return "default";
  const tagged = target.closest("[data-cursor]");
  const v = tagged?.getAttribute("data-cursor");
  if (v === "view" || v === "field") return v;
  if (target.closest(INTERACTIVE)) return "link";
  return "default";
}
