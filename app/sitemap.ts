import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/courseRepository";
import { regionLandingPages } from "@/lib/regionLanding";
import { absoluteUrl } from "@/lib/siteConfig";

/** Supabase course 목록 기준 — 24시간마다 재생성 */
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/"),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
  };

  const regionEntries: MetadataRoute.Sitemap = regionLandingPages.map((page) => ({
    url: absoluteUrl(`/regions/${page.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  try {
    const entries = await getSitemapEntries();
    const courseEntries: MetadataRoute.Sitemap = entries.map((entry) => ({
      url: absoluteUrl(`/courses/${entry.id}`),
      lastModified: entry.updatedAt ? new Date(entry.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [homeEntry, ...regionEntries, ...courseEntries];
  } catch (error) {
    console.warn("[sitemap] Failed to load course entries:", error);
    return [homeEntry, ...regionEntries];
  }
}
