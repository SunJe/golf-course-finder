import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/admin", "/api/admin/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
