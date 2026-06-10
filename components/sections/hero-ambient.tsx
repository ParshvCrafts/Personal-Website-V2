/** Decorative ambient aurora — pure CSS, no JS, no canvas, no WebGL.
 *
 * Server component: no "use client" needed (static markup only).
 * Rendered as the first child inside the hero <section> so it sits
 * behind all other content at the lowest z-index level.
 * aria-hidden + pointer-events-none: fully transparent to a11y / input.
 */
export function HeroAmbient() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Blob A — top-left, accent colour, largest */}
      <div className="hero-aurora hero-aurora--a" />
      {/* Blob B — bottom-right, accent-2 colour */}
      <div className="hero-aurora hero-aurora--b" />
      {/* Blob C — centre-right, accent colour, smallest + faintest */}
      <div className="hero-aurora hero-aurora--c" />
    </div>
  );
}
