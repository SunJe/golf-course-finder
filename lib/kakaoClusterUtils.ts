import type { Course } from "@/types/course";

export interface ClusterGroup {
  courseIds: string[];
  lat: number;
  lng: number;
}

/** Kakao level: 숫자가 클수록 줌아웃 — grid step (위도/경도 도 단위) */
export function getClusterGridStep(level: number): number {
  if (level >= 11) return 1.1;
  if (level >= 10) return 0.55;
  if (level >= 9) return 0.28;
  if (level >= 8) return 0.18;
  if (level >= 7) return 0.05;
  return 0.02;
}

/** level 7에서 '매우 가까움' 판정 — 약 1.3km 이내 */
const LEVEL7_CLUSTER_MAX_SPAN_DEG = 0.012;

export interface ResolvedClusterDisplay {
  /** cluster badge로 표시할 그룹 */
  clusters: ClusterGroup[];
  /** 1=개별 pin, >=2=cluster badge에 포함 (selected/hover 제외 pin 숨김) */
  pinGroupSizeMap: Map<string, number>;
}

/** bounds 안 courses를 grid 기준으로 클러스터 그룹화 */
export function computeClusterGroups(
  courses: Course[],
  level: number,
): ClusterGroup[] {
  if (courses.length === 0) return [];

  const step = getClusterGridStep(level);
  const buckets = new Map<string, Course[]>();

  for (const course of courses) {
    const gridLat = Math.floor(course.latitude / step);
    const gridLng = Math.floor(course.longitude / step);
    const key = `${gridLat}:${gridLng}`;
    const list = buckets.get(key);
    if (list) {
      list.push(course);
    } else {
      buckets.set(key, [course]);
    }
  }

  return Array.from(buckets.values()).map((groupCourses) => {
    const count = groupCourses.length;
    const lat =
      groupCourses.reduce((sum, c) => sum + c.latitude, 0) / count;
    const lng =
      groupCourses.reduce((sum, c) => sum + c.longitude, 0) / count;

    return {
      courseIds: groupCourses.map((c) => c.id),
      lat,
      lng,
    };
  });
}

function getCoursesInGroup(group: ClusterGroup, courses: Course[]): Course[] {
  const idSet = new Set(group.courseIds);
  return courses.filter((c) => idSet.has(c.id));
}

function areCoursesVeryClose(group: ClusterGroup, courses: Course[]): boolean {
  const groupCourses = getCoursesInGroup(group, courses);
  if (groupCourses.length < 2) return false;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const c of groupCourses) {
    minLat = Math.min(minLat, c.latitude);
    maxLat = Math.max(maxLat, c.latitude);
    minLng = Math.min(minLng, c.longitude);
    maxLng = Math.max(maxLng, c.longitude);
  }

  return (
    maxLat - minLat <= LEVEL7_CLUSTER_MAX_SPAN_DEG &&
    maxLng - minLng <= LEVEL7_CLUSTER_MAX_SPAN_DEG
  );
}

/**
 * 줌 레벨별 cluster badge 생성 여부
 * - level >= 10: count >= 2
 * - level 8~9: count >= 3
 * - level 7: count >= 4 + 매우 가까움
 * - level <= 6: cluster 없음
 */
export function shouldGroupRenderAsCluster(
  group: ClusterGroup,
  courses: Course[],
  level: number,
): boolean {
  const count = group.courseIds.length;
  if (count < 2 || level <= 6) return false;
  if (level >= 10) return true;
  if (level >= 8) return count >= 3;
  if (level === 7) {
    return count >= 4 && areCoursesVeryClose(group, courses);
  }
  return false;
}

/** grid 그룹 + 줌 정책으로 cluster/pin 표현 결정 */
export function resolveClusterDisplay(
  courses: Course[],
  level: number,
): ResolvedClusterDisplay {
  const pinGroupSizeMap = new Map<string, number>();
  const clusters: ClusterGroup[] = [];

  if (courses.length === 0) {
    return { clusters, pinGroupSizeMap };
  }

  if (level <= 6) {
    for (const course of courses) {
      pinGroupSizeMap.set(course.id, 1);
    }
    return { clusters, pinGroupSizeMap };
  }

  const gridGroups = computeClusterGroups(courses, level);

  for (const group of gridGroups) {
    if (shouldGroupRenderAsCluster(group, courses, level)) {
      clusters.push(group);
      for (const id of group.courseIds) {
        pinGroupSizeMap.set(id, group.courseIds.length);
      }
    } else {
      for (const id of group.courseIds) {
        pinGroupSizeMap.set(id, 1);
      }
    }
  }

  return { clusters, pinGroupSizeMap };
}

export function buildCourseGroupSizeMap(
  groups: ClusterGroup[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const group of groups) {
    for (const id of group.courseIds) {
      map.set(id, group.courseIds.length);
    }
  }
  return map;
}

/** cluster badge에 포함되거나 개별 pin(1)으로 표현 — selected/hover는 항상 pin */
export function shouldShowPinForGroup(
  level: number,
  effectiveGroupSize: number,
  isSelected: boolean,
  isHovered: boolean,
): boolean {
  if (isSelected || isHovered) return true;
  if (effectiveGroupSize >= 2) return false;
  if (level >= 10) return false;
  return true;
}

export function countVisualizedCourses(
  clusters: ClusterGroup[],
  pinGroupSizeMap: Map<string, number>,
): number {
  let clustered = 0;
  for (const group of clusters) {
    clustered += group.courseIds.length;
  }
  let individual = 0;
  pinGroupSizeMap.forEach((size) => {
    if (size === 1) individual += 1;
  });
  return clustered + individual;
}

export function isVisualizedCountConsistent(
  visibleCount: number,
  clusters: ClusterGroup[],
  pinGroupSizeMap: Map<string, number>,
): boolean {
  return countVisualizedCourses(clusters, pinGroupSizeMap) === visibleCount;
}

function clusterBadgeStyle(count: number): string {
  const base =
    "border:3px solid #ffffff;color:#ffffff;text-align:center;font-weight:bold;" +
    "box-shadow:0 2px 8px rgba(0,0,0,0.22);font-family:inherit;cursor:pointer;" +
    "pointer-events:auto;touch-action:manipulation;padding:0;line-height:1;";

  if (count >= 50) {
    return (
      base +
      "width:58px;height:58px;line-height:52px;font-size:14px;" +
      "background:rgba(194,65,12,0.96);border-radius:29px;"
    );
  }
  if (count >= 15) {
    return (
      base +
      "width:50px;height:50px;line-height:44px;font-size:13px;" +
      "background:rgba(234,88,12,0.94);border-radius:25px;"
    );
  }
  return (
    base +
    "width:42px;height:42px;line-height:36px;font-size:12px;" +
    "background:rgba(249,115,22,0.92);border-radius:21px;"
  );
}

/** 클릭 가능한 cluster badge DOM */
export function createClusterBadgeElement(count: number): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = String(count);
  btn.setAttribute("aria-label", `골프장 ${count}곳 묶음`);
  btn.style.cssText = clusterBadgeStyle(count);
  return btn;
}

export function updateClusterBadgeElement(
  btn: HTMLButtonElement,
  count: number,
): void {
  btn.textContent = String(count);
  btn.style.cssText = clusterBadgeStyle(count);
}

export function clusterGroupKey(courseIds: string[]): string {
  return [...courseIds].sort().join("|");
}
