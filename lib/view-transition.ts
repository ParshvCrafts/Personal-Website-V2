import { prefersReducedMotion } from "@/lib/motion";

/**
 * Run a DOM mutation inside a same-document View Transition when the browser
 * supports it (and motion is allowed); otherwise just run it. Never throws on
 * unsupported browsers — Firefox et al. get the plain mutation.
 */
export function withViewTransition(mutate: () => void): void {
  const start = (document as Document & { startViewTransition?: (cb: () => void) => unknown })
    .startViewTransition;
  if (typeof start !== "function" || prefersReducedMotion()) {
    mutate();
    return;
  }
  start.call(document, mutate);
}
