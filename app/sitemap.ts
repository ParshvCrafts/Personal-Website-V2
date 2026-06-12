import type { MetadataRoute } from "next";

// Required for `output: "export"` — emit a static sitemap.xml at build time.
export const dynamic = "force-static";

const BASE_URL = "https://www.portfolio.parshvpatel.com";

/**
 * Single-page portfolio — one canonical URL. Generated to out/sitemap.xml at
 * build (compatible with `output: "export"`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
