import type { MetadataRoute } from "next";

// Required for `output: "export"` — emit a static robots.txt at build time.
export const dynamic = "force-static";

const BASE_URL = "https://www.portfolio.parshvpatel.com";

/**
 * Generated to out/robots.txt at build (compatible with `output: "export"`).
 * Allows all crawlers and points them at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
