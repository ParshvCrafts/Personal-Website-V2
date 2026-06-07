export interface SectionTop {
  id: string;
  /** Distance from document top to the section's top, in px. */
  top: number;
}

/**
 * Pure scroll-spy: given each section's document-top, the current scrollY, and a
 * "trigger line" offset from the viewport top (≈ sticky-nav height), return the id
 * of the last section whose top has crossed the line — or `null` when none has yet
 * (e.g. while a non-section hero fills the viewport). Decoupled from the DOM and
 * from any animation library, so it behaves identically under reduced motion.
 */
export function activeSectionForScroll(
  sections: SectionTop[],
  scrollY: number,
  lineOffset: number,
): string | null {
  const line = scrollY + lineOffset;
  let active: string | null = null;
  let bestTop = -Infinity;
  for (const s of sections) {
    if (s.top <= line && s.top >= bestTop) {
      bestTop = s.top;
      active = s.id;
    }
  }
  return active;
}
