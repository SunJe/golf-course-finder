import type { Course } from "@/types/course";
import { getDistanceKm } from "@/lib/geoUtils";
import { isValidCourseCoordinates } from "@/lib/focusCourse";

export const NEARBY_COURSES_LIMIT = 6;
export const NEARBY_COURSES_PREFERRED_RADIUS_KM = 50;
export const NEARBY_COURSES_SEARCH_RADII_KM = [50, 100, 200, 400, 800] as const;

const EARTH_RADIUS_KM = 6371;
const DISTANCE_EPSILON_KM = 1e-9;

export interface NearbyCourseEntry {
  course: Course;
  distanceKm: number;
}

export interface LongitudeRange {
  min: number;
  max: number;
}

export interface SphericalBoundingBox {
  minLatitude: number;
  maxLatitude: number;
  longitudeRanges: LongitudeRange[];
}

export interface NearbyCourseSearchDiagnostics {
  queryCount: number;
  candidateRows: number[];
  completedRadiusKm: number | null;
  usedGlobalFallback: boolean;
}

export interface NearbyCourseSearchResult {
  courses: Course[];
  diagnostics: NearbyCourseSearchDiagnostics;
}

export interface NearbyCourseCandidateLoader {
  fetchWithinBounds(bounds: SphericalBoundingBox): Promise<Course[]>;
  fetchAll(): Promise<Course[]>;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function normalizeLongitude(longitude: number): number {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

/** Exact spherical bounding box around a coordinate, including antimeridian splits. */
export function getSphericalBoundingBox(
  latitude: number,
  longitude: number,
  radiusKm: number,
): SphericalBoundingBox {
  const angularRadius = radiusKm / EARTH_RADIUS_KM;
  const latitudeRadians = toRadians(latitude);
  const minLatitudeRadians = Math.max(
    -Math.PI / 2,
    latitudeRadians - angularRadius,
  );
  const maxLatitudeRadians = Math.min(
    Math.PI / 2,
    latitudeRadians + angularRadius,
  );
  const minLatitude = toDegrees(minLatitudeRadians);
  const maxLatitude = toDegrees(maxLatitudeRadians);

  if (
    minLatitudeRadians <= -Math.PI / 2 ||
    maxLatitudeRadians >= Math.PI / 2
  ) {
    return {
      minLatitude,
      maxLatitude,
      longitudeRanges: [{ min: -180, max: 180 }],
    };
  }

  const longitudeDelta = toDegrees(
    Math.asin(
      Math.min(1, Math.sin(angularRadius) / Math.cos(latitudeRadians)),
    ),
  );
  const minLongitude = normalizeLongitude(longitude - longitudeDelta);
  const maxLongitude = normalizeLongitude(longitude + longitudeDelta);

  return {
    minLatitude,
    maxLatitude,
    longitudeRanges:
      minLongitude <= maxLongitude
        ? [{ min: minLongitude, max: maxLongitude }]
        : [
            { min: -180, max: maxLongitude },
            { min: minLongitude, max: 180 },
          ],
  };
}

/**
 * 현재 골프장 기준 Haversine 직선거리순 근처 골프장.
 * 50km 이내 우선, 6개 미만이면 거리순으로 보충.
 */
export function getNearbyCoursesWithDistance(
  courses: Course[],
  current: Course,
  limit = NEARBY_COURSES_LIMIT,
  preferredRadiusKm = NEARBY_COURSES_PREFERRED_RADIUS_KM,
): NearbyCourseEntry[] {
  if (!isValidCourseCoordinates(current)) return [];

  const ranked = courses
    .filter((c) => c.id !== current.id && isValidCourseCoordinates(c))
    .map((candidate) => {
      const distanceKm = getDistanceKm(current, candidate);
      if (distanceKm == null) return null;
      return { course: candidate, distanceKm };
    })
    .filter((entry): entry is NearbyCourseEntry => entry != null)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const withinRadius = ranked.filter(
    (entry) => entry.distanceKm <= preferredRadiusKm,
  );

  if (withinRadius.length >= limit) {
    return withinRadius.slice(0, limit);
  }

  return ranked.slice(0, limit);
}

/** 거리순 근처 골프장 course 배열 (상세 리스트·지도 marker 공용) */
export function getNearbyCourses(
  courses: Course[],
  current: Course,
  limit = NEARBY_COURSES_LIMIT,
): Course[] {
  return getNearbyCoursesWithDistance(courses, current, limit).map(
    (entry) => entry.course,
  );
}

/**
 * Expands an exact spherical search window until the sixth actual Haversine
 * distance proves that no closer course can exist outside the current radius.
 */
export async function searchNearbyCoursesAdaptive(
  current: Course,
  loader: NearbyCourseCandidateLoader,
  limit = NEARBY_COURSES_LIMIT,
  radiiKm: readonly number[] = NEARBY_COURSES_SEARCH_RADII_KM,
): Promise<NearbyCourseSearchResult> {
  const diagnostics: NearbyCourseSearchDiagnostics = {
    queryCount: 0,
    candidateRows: [],
    completedRadiusKm: null,
    usedGlobalFallback: false,
  };

  if (!isValidCourseCoordinates(current) || limit <= 0) {
    return { courses: [], diagnostics };
  }

  for (const radiusKm of radiiKm) {
    const bounds = getSphericalBoundingBox(
      current.latitude,
      current.longitude,
      radiusKm,
    );
    const candidates = await loader.fetchWithinBounds(bounds);
    diagnostics.queryCount += 1;
    diagnostics.candidateRows.push(candidates.length);

    const ranked = getNearbyCoursesWithDistance(
      candidates,
      current,
      limit,
      Number.POSITIVE_INFINITY,
    );
    const sixthDistanceKm = ranked[limit - 1]?.distanceKm;
    if (
      sixthDistanceKm != null &&
      sixthDistanceKm <= radiusKm + DISTANCE_EPSILON_KM
    ) {
      diagnostics.completedRadiusKm = radiusKm;
      return {
        courses: ranked.map((entry) => entry.course),
        diagnostics,
      };
    }
  }

  const allCandidates = await loader.fetchAll();
  diagnostics.queryCount += 1;
  diagnostics.candidateRows.push(allCandidates.length);
  diagnostics.usedGlobalFallback = true;

  return {
    courses: getNearbyCourses(allCandidates, current, limit),
    diagnostics,
  };
}
