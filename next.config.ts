import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Emit directory-style output (out/<route>/index.html) so static hosts
  // resolve clean URLs without per-route rewrites; Next 16 otherwise emits
  // out/<route>.html for nested routes.
  trailingSlash: true,
  images: { unoptimized: true }, // required for static export
  // Pin the workspace root to v2/ so Next.js does not infer a stray parent
  // lockfile (multiple package-lock.json files exist above this dir).
  turbopack: { root: import.meta.dirname },
  // viewTransition enabled in a later phase when the theme switcher lands
};

export default nextConfig;
