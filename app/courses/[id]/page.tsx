import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCourseById,
  getAllCourseIds,
  getNearbyCoursesForCourse,
} from "@/lib/courseRepository";
import {
  buildCourseMetadata,
  buildNotFoundCourseMetadata,
} from "@/lib/seoMetadata";
import CourseDetail from "@/components/CourseDetail";
import { toPublicCourse, toPublicCourses } from "@/lib/publicCourse";
import CourseJsonLd from "@/components/CourseJsonLd";
import { getDisplayableCourseContentEnrichment } from "@/lib/enrichment/courseContentEnrichmentStore";
import { resolveCourseVisitKoreaImages } from "@/lib/enrichment/courseVisitKoreaImages";
import RegionLinks from "@/components/RegionLinks";
import HomeBlogCarousel from "@/components/portal/HomeBlogCarousel";
import { getRelatedBlogPostsForCourse } from "@/lib/relatedBlogPosts";
import CourseSeoFaq, { CourseFaqJsonLd } from "@/components/CourseSeoFaq";
import {
  applyCoursePageOverride,
  getCoursePageOverride,
} from "@/lib/seo/coursePageOverrides";

export async function generateStaticParams() {
  const ids = await getAllCourseIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const course = await getCourseById(params.id);
  if (!course) return buildNotFoundCourseMetadata();
  return buildCourseMetadata(course);
}

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await getCourseById(params.id);
  if (!course) notFound();

  const pageOverride = getCoursePageOverride(course.id);
  const displayCourse = applyCoursePageOverride(course);

  const nearbyCourses = await getNearbyCoursesForCourse(course, 6);

  const enrichment = getDisplayableCourseContentEnrichment(course.id);
  const visitKoreaGallery = resolveCourseVisitKoreaImages(course.id, enrichment);
  const blogPosts = getRelatedBlogPostsForCourse(course, 4);

  const blogSlot =
    blogPosts.length > 0 ? (
      <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
            관련 블로그
          </h2>
          <Link
            href="/blog"
            className="shrink-0 text-sm font-medium text-stone-400 transition hover:text-brand-800"
          >
            전체보기 →
          </Link>
        </div>
        <HomeBlogCarousel posts={blogPosts} />
      </section>
    ) : null;

  return (
    <>
      <CourseJsonLd course={displayCourse} />
      {pageOverride ? (
        <CourseFaqJsonLd courseId={course.id} items={pageOverride.faq} />
      ) : null}
      <CourseDetail
        course={toPublicCourse(displayCourse)}
        nearbyCourses={toPublicCourses(nearbyCourses)}
        enrichment={enrichment}
        visitKoreaGallery={visitKoreaGallery}
        blogSlot={blogSlot}
        faqSlot={
          pageOverride ? <CourseSeoFaq items={pageOverride.faq} /> : null
        }
        regionSlot={<RegionLinks variant="card" className="mt-6" />}
      />
    </>
  );
}
