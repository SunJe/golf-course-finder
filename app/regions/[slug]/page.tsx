import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Course } from "@/types/course";
import { getCoursesForStaticPages } from "@/lib/courseRepository";
import { buildRegionMetadata } from "@/lib/seoMetadata";
import {
  computeRegionStats,
  filterCoursesByRegion,
  getRegionLandingBySlug,
} from "@/lib/regionLanding";
import {
  computeRegionCounts,
  getSitemapRegionSlugs,
} from "@/lib/regionIndex";
import RegionJsonLd from "@/components/RegionJsonLd";
import RegionLandingView from "@/components/RegionLandingView";

export const revalidate = 86400;

export async function generateStaticParams() {
  let courses: Course[] = [];
  try {
    courses = await getCoursesForStaticPages();
  } catch (error) {
    console.warn("[regions] generateStaticParams failed to load courses:", error);
  }

  const counts = computeRegionCounts(courses);
  return getSitemapRegionSlugs(counts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const config = getRegionLandingBySlug(params.slug);
  if (!config) {
    return { title: "지역을 찾을 수 없습니다 | GolfMap Korea", robots: { index: false } };
  }

  let courses: Course[] = [];
  try {
    courses = await getCoursesForStaticPages();
  } catch {
    // metadata fallback without course-derived city names
  }

  const regionCourses = filterCoursesByRegion(courses, config);
  return buildRegionMetadata(config, regionCourses, {
    noindex: regionCourses.length === 0,
  });
}

export default async function RegionLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const config = getRegionLandingBySlug(params.slug);
  if (!config) notFound();

  let courses: Course[] = [];
  try {
    courses = await getCoursesForStaticPages();
  } catch (error) {
    console.warn("[regions] Failed to load courses:", error);
  }

  const regionCourses = filterCoursesByRegion(courses, config);
  if (regionCourses.length === 0) notFound();

  const stats = computeRegionStats(regionCourses);

  return (
    <>
      <RegionJsonLd config={config} courses={regionCourses} />
      <RegionLandingView config={config} courses={regionCourses} stats={stats} />
    </>
  );
}
