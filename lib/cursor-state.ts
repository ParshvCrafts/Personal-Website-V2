export type CursorState = "default" | "link" | "view" | "field";

const INTERACTIVE = "a,button,[role='button'],input,textarea,select,[data-cursor='hover']";

/**
 * Resolve the cursor state for a hovered element. An explicit data-cursor tag wins,
 * EXCEPT when an interactive element sits deeper inside the tagged container —
 * a CTA inside the data-cursor="field" hero must still read as a link.
 */
export function cursorStateFor(target: Element | null): CursorState {
  if (!target) return "default";
  const tagged = target.closest("[data-cursor]");
  const interactive = target.closest(INTERACTIVE);
  const v = tagged?.getAttribute("data-cursor");
  if ((v === "view" || v === "field") && tagged) {
    if (interactive && tagged !== interactive && tagged.contains(interactive)) return "link";
    return v;
  }
  if (interactive) return "link";
  return "default";
}
