import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Course } from "@/types/course";
import { getCoursesForStaticPages } from "@/lib/courseRepository";
import { buildCollectionMetadata } from "@/lib/seoMetadata";
import {
  COLLECTION_SLUGS,
  computeCollectionStats,
  getCollectionBySlug,
  isCollectionSlug,
} from "@/lib/collectionLanding";
import { applyCollectionFilter } from "@/lib/collectionFilters";
import CollectionJsonLd from "@/components/CollectionJsonLd";
import CollectionLandingView from "@/components/CollectionLandingView";

export const revalidate = 86400;

export async function generateStaticParams() {
  return COLLECTION_SLUGS.map((slug) => ({ slug }));
}

async function loadCollectionCourses(slug: string): Promise<Course[]> {
  if (!isCollectionSlug(slug)) return [];

  let courses: Course[] = [];
  try {
    courses = await getCoursesForStaticPages();
  } catch (error) {
    console.warn("[collections] Failed to load courses:", error);
  }

  return applyCollectionFilter(courses, slug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const config = getCollectionBySlug(params.slug);
  if (!config) {
    return {
      title: "컬렉션을 찾을 수 없습니다 | GolfMap Korea",
      robots: { index: false },
    };
  }

  const collectionCourses = await loadCollectionCourses(params.slug);

  return buildCollectionMetadata(config, {
    noindex: collectionCourses.length === 0,
    courseCount: collectionCourses.length,
  });
}

export default async function CollectionLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const config = getCollectionBySlug(params.slug);
  if (!config || !isCollectionSlug(params.slug)) notFound();

  const collectionCourses = await loadCollectionCourses(params.slug);
  const stats = computeCollectionStats(collectionCourses);

  return (
    <>
      <CollectionJsonLd config={config} courses={collectionCourses} />
      <CollectionLandingView
        config={config}
        courses={collectionCourses}
        stats={stats}
      />
    </>
  );
}
