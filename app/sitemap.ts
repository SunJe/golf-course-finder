import type { MetadataRoute } from "next";
import { getSitemapEntries, getCoursesForStaticPages } from "@/lib/courseRepository";
import { absoluteUrl } from "@/lib/siteConfig";
import {
  computeCollectionCounts,
  getCollectionSitemapPriority,
  getSitemapCollectionSlugs,
} from "@/lib/collectionIndex";
import {
  computeRegionCounts,
  getSitemapRegionSlugs,
} from "@/lib/regionIndex";

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

  let regionEntries: MetadataRoute.Sitemap = [];
  let collectionEntries: MetadataRoute.Sitemap = [];
  try {
    const courses = await getCoursesForStaticPages();
    const regionCounts = computeRegionCounts(courses);
    const indexableRegionSlugs = getSitemapRegionSlugs(regionCounts);

    regionEntries = indexableRegionSlugs.map((slug) => ({
      url: absoluteUrl(`/regions/${slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const counts = computeCollectionCounts(courses);
    const indexableSlugs = getSitemapCollectionSlugs(counts);

    collectionEntries = indexableSlugs.map((slug) => ({
      url: absoluteUrl(`/collections/${slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: getCollectionSitemapPriority(slug),
    }));
  } catch (error) {
    console.warn("[sitemap] Failed to load region/collection entries:", error);
  }

  try {
    const entries = await getSitemapEntries();
    const courseEntries: MetadataRoute.Sitemap = entries.map((entry) => ({
      url: absoluteUrl(`/courses/${entry.id}`),
      lastModified: entry.updatedAt ? new Date(entry.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [homeEntry, ...regionEntries, ...collectionEntries, ...courseEntries];
  } catch (error) {
    console.warn("[sitemap] Failed to load course entries:", error);
    return [homeEntry, ...regionEntries, ...collectionEntries];
  }
}
