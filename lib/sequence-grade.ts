export type SequenceGrade = "dark" | "light";

/**
 * Pick the baked frame grade for the active theme. Light-background themes get
 * the ink-on-paper grade; everything else — including the pre-hydration
 * `undefined` from next-themes — gets the luminous-on-black grade.
 */
export function gradeForTheme(theme: string | undefined): SequenceGrade {
  return theme === "daylight" || theme === "manuscript" ? "light" : "dark";
}
