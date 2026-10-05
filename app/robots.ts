import type { MetadataRoute } from "next"
import { canonicalSiteUrl } from "@/content/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Explicitly allow Facebook's link-preview scraper so OG tags are readable
        userAgent: "facebookexternalhit",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${canonicalSiteUrl}/sitemap.xml`,
  }
}
