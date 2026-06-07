export interface SectionTop {
  id: string;
  /** Distance from document top to the section's top, in px. */
  top: number;
}

/**
 * A section counts as crossed when its top is within this many px of the line. A
 * programmatic scroll-to lands a section ~exactly on the trigger line, and sub-pixel
 * scroll rounding (notably on WebKit) can leave it 1px short — this tolerance makes
 * the just-scrolled-to section activate reliably.
 */
const BOUNDARY_TOLERANCE_PX = 4;

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
  const line = scrollY + lineOffset + BOUNDARY_TOLERANCE_PX;
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
