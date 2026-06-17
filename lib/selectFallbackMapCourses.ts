import type { Course } from "@/types/course";

/** fallback 지도에 표시할 골프장을 지역별로 샘플링 (선택 항목은 항상 포함) */
export function selectFallbackMapCourses(
  courses: Course[],
  maxMarkers: number,
  selectedCourseId?: string | null,
): Course[] {
  if (courses.length <= maxMarkers) return courses;

  const selected = selectedCourseId
    ? courses.find((c) => c.id === selectedCourseId)
    : undefined;
  const budget = Math.max(1, maxMarkers - (selected ? 1 : 0));

  const pool = courses.filter((c) => c.id !== selectedCourseId);
  const byRegion = new Map<string, Course[]>();

  for (const course of pool) {
    const list = byRegion.get(course.region) ?? [];
    list.push(course);
    byRegion.set(course.region, list);
  }

  const regions = [...byRegion.keys()];
  const picked: Course[] = [];
  let remaining = budget;

  while (remaining > 0 && regions.length > 0) {
    let addedThisRound = 0;
    for (const region of regions) {
      if (remaining <= 0) break;
      const list = byRegion.get(region);
      if (!list || list.length === 0) continue;
      picked.push(list.shift()!);
      remaining -= 1;
      addedThisRound += 1;
    }
    if (addedThisRound === 0) break;
  }

  const result = selected ? [selected, ...picked] : picked;
  return result.slice(0, maxMarkers);
}
