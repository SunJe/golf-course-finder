import type { Course } from "@/types/course";
import enrichmentFile from "@/data/course-content-enrichment.json";
import type {
  CourseContentEnrichment,
  CourseContentEnrichmentFile,
} from "@/lib/enrichment/courseContentEnrichmentTypes";
import { isDisplayableEnrichment } from "@/lib/enrichment/courseContentEnrichmentTypes";

const store = enrichmentFile as CourseContentEnrichmentFile;

export function getCourseContentEnrichmentStore(): CourseContentEnrichmentFile {
  return store;
}

export function getCourseContentEnrichment(
  courseId: string,
): CourseContentEnrichment | null {
  return store.items[courseId] ?? null;
}

export function getDisplayableCourseContentEnrichment(
  courseId: string,
): CourseContentEnrichment | null {
  const enrichment = getCourseContentEnrichment(courseId);
  return isDisplayableEnrichment(enrichment) ? enrichment : null;
}

export function getEnrichedCourseIds(): string[] {
  return Object.values(store.items)
    .filter(isDisplayableEnrichment)
    .map((item) => item.courseId);
}

export function countEnrichmentByStatus(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of Object.values(store.items)) {
    counts[item.enrichmentStatus] = (counts[item.enrichmentStatus] ?? 0) + 1;
  }
  return counts;
}

export function enrichmentAppliesToCourse(
  course: Course,
  enrichment: CourseContentEnrichment | null | undefined,
): enrichment is CourseContentEnrichment {
  return Boolean(
    enrichment &&
      enrichment.courseId === course.id &&
      isDisplayableEnrichment(enrichment),
  );
}
