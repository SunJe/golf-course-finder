import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseById, getAllCourseIds } from "@/lib/courseRepository";
import { getCourseDescription } from "@/lib/courseDisplay";
import CourseDetail from "@/components/CourseDetail";

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
  if (!course) return { title: "골프장을 찾을 수 없습니다 — GolfMap Korea" };
  return {
    title: `${course.name} — GolfMap Korea`,
    description: course.description ?? getCourseDescription(course),
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await getCourseById(params.id);
  if (!course) notFound();
  return <CourseDetail course={course} />;
}
