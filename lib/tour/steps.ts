export interface TourStep {
  id: string;
  target: string;
  title: string;
  body: string;
  placement?: "top" | "bottom";
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "palette",
    target: 'button[aria-label="Open command palette"]',
    title: "Jump anywhere",
    body: "Press ⌘K (or Ctrl K) to search sections, switch themes, and open links, fast.",
    placement: "bottom",
  },
  {
    id: "theme",
    target: '[role="radiogroup"][aria-label="Color theme"]',
    title: "Four themes",
    body: "Set the mood: Midnight, Daylight, Manuscript, or Neon. Try them all.",
    placement: "bottom",
  },
  {
    id: "projects",
    target: "#projects",
    title: "The work",
    body: "Featured builds and projects, filterable, with deep-dive case studies.",
    placement: "top",
  },
  {
    id: "contact",
    target: "#contact",
    title: "Get in touch",
    body: "Email, socials, or the form. The footer shows what I'm up to right now.",
    placement: "top",
  },
];

/** Keep only steps whose target exists in the given document. Pure. */
export function resolveVisibleSteps(steps: TourStep[], doc: Document): TourStep[] {
  return steps.filter((s) => doc.querySelector(s.target) !== null);
}
