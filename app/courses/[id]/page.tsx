import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseById, getAllCourseIds, getCourses } from "@/lib/courseRepository";
import { getNearbyCourses } from "@/lib/nearbyCourses";
import {
  buildCourseMetadata,
  buildNotFoundCourseMetadata,
} from "@/lib/seoMetadata";
import CourseDetail from "@/components/CourseDetail";
import CourseJsonLd from "@/components/CourseJsonLd";
import RegionLinks from "@/components/RegionLinks";

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

  const allCourses = await getCourses();
  const nearbyCourses = getNearbyCourses(allCourses, course, 6);

  return (
    <>
      <CourseJsonLd course={course} />
      <CourseDetail course={course} nearbyCourses={nearbyCourses} />
      <div className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 md:max-w-4xl">
        <RegionLinks />
      </div>
    </>
  );
}
