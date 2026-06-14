export const TOUR_SEEN_KEY = "pp-tour-seen";

/** True when the first-visit tour prompt should be shown. Never throws. */
export function shouldShowTourPrompt(storage: Pick<Storage, "getItem"> | null): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(TOUR_SEEN_KEY) === null;
  } catch {
    return false;
  }
}
