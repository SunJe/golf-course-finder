import type { Course } from "@/types/course";
import {
  CLUSTER_MAX_DISPLAYED_COUNT,
  CLUSTER_MIN_LEVEL,
} from "@/lib/constants";

export interface ClusterGroup {
  courseIds: string[];
  lat: number;
  lng: number;
}

export interface ClusterDisplayOptions {
  level: number;
  displayedCount: number;
  hasSearchKeyword: boolean;
  forceIndividualIds?: ReadonlySet<string>;
}

/** Kakao level: 숫자가 클수록 줌아웃 — grid step (위도/경도 도 단위) */
export function getClusterGridStep(level: number): number {
  if (level >= 12) return 1.1;
  if (level >= 11) return 0.55;
  return 0.22;
}

export interface ResolvedClusterDisplay {
  clusters: ClusterGroup[];
  pinGroupSizeMap: Map<string, number>;
  clusteringEnabled: boolean;
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

function groupHasForceIndividual(
  group: ClusterGroup,
  forceIndividualIds?: ReadonlySet<string>,
): boolean {
  if (!forceIndividualIds?.size) return false;
  return group.courseIds.some((id) => forceIndividualIds.has(id));
}

/** 첫 화면~확대 2단계(level >= CLUSTER_MIN_LEVEL)에서만 cluster zone */
export function isClusterLevelAllowed(level: number): boolean {
  return level >= CLUSTER_MIN_LEVEL;
}

/**
 * 클러스터 사용 여부 (단순화)
 * - 검색어 있음 → 해제
 * - displayed <= 30 → 해제
 * - level < CLUSTER_MIN_LEVEL (확대 3단계~) → 해제
 */
export function isClusteringEnabled(options: ClusterDisplayOptions): boolean {
  if (options.hasSearchKeyword) return false;
  if (options.displayedCount <= CLUSTER_MAX_DISPLAYED_COUNT) return false;
  if (!isClusterLevelAllowed(options.level)) return false;
  return true;
}

/** clusteringEnabled일 때 count >= 2이면 cluster badge */
export function shouldGroupRenderAsCluster(group: ClusterGroup): boolean {
  return group.courseIds.length >= 2;
}

export function resolveClusterDisplay(
  courses: Course[],
  options: ClusterDisplayOptions,
): ResolvedClusterDisplay {
  const pinGroupSizeMap = new Map<string, number>();
  const clusters: ClusterGroup[] = [];
  const clusteringEnabled = isClusteringEnabled(options);

  if (courses.length === 0) {
    return { clusters, pinGroupSizeMap, clusteringEnabled };
  }

  if (!clusteringEnabled) {
    for (const course of courses) {
      pinGroupSizeMap.set(course.id, 1);
    }
    return { clusters, pinGroupSizeMap, clusteringEnabled };
  }

  const gridGroups = computeClusterGroups(courses, options.level);

  for (const group of gridGroups) {
    if (
      groupHasForceIndividual(group, options.forceIndividualIds) ||
      !shouldGroupRenderAsCluster(group)
    ) {
      for (const id of group.courseIds) {
        pinGroupSizeMap.set(id, 1);
      }
      continue;
    }

    clusters.push(group);
    for (const id of group.courseIds) {
      pinGroupSizeMap.set(id, group.courseIds.length);
    }
  }

  return { clusters, pinGroupSizeMap, clusteringEnabled };
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
