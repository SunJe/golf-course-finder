import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Course } from "@/types/course";
import { getCoursesForStaticPages } from "@/lib/courseRepository";
import { buildRegionMetadata } from "@/lib/seoMetadata";
import {
  computeRegionStats,
  filterCoursesByRegion,
  getRegionLandingBySlug,
  regionLandingPages,
} from "@/lib/regionLanding";
import RegionJsonLd from "@/components/RegionJsonLd";
import RegionLandingView from "@/components/RegionLandingView";

export const revalidate = 86400;

export async function generateStaticParams() {
  return regionLandingPages.map((page) => ({ slug: page.slug }));
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
  return buildRegionMetadata(config, regionCourses);
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
  const stats = computeRegionStats(regionCourses);

  return (
    <>
      <RegionJsonLd config={config} courses={regionCourses} />
      <RegionLandingView config={config} courses={regionCourses} stats={stats} />
    </>
  );
}
