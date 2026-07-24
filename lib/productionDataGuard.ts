import type { Course } from "@/types/course";

/** Fail-fast when Cloudflare/Vercel production-like builds must not ship mock data. */
export const PRODUCTION_DATA_MODE = "production";

/** Soft floor — allows growth; do not hardcode exact production count. */
export const PRODUCTION_MIN_COURSE_COUNT = 500;

/** Known production course IDs (must exist when GOLFMAP_DATA_MODE=production). */
export const PRODUCTION_KNOWN_COURSE_IDS = [
  "gc-9d709ff43c33", // 몽베르
  "gc-437ea8156737", // 파인비치
] as const;

/** Known production course name markers. */
export const PRODUCTION_KNOWN_COURSE_NAMES = ["인천그랜드CC"] as const;

/**
 * Names that appear only in mock/fallback seeds (lib/mock).
 * Presence in a production-mode dataset means fallback was used incorrectly.
 */
export const FALLBACK_ONLY_COURSE_NAMES = [
  "강남 센트럴 골프클럽",
  "경기 광주CC",
  "한강 컨트리클럽",
  "북한산 시티 골프장",
] as const;

export function isProductionDataMode(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.GOLFMAP_DATA_MODE?.trim() === PRODUCTION_DATA_MODE;
}

export function assertProductionCourseDataset(
  courses: Course[],
  context: string,
): void {
  const errors: string[] = [];

  if (courses.length < PRODUCTION_MIN_COURSE_COUNT) {
    errors.push(
      `course count ${courses.length} < minimum ${PRODUCTION_MIN_COURSE_COUNT}`,
    );
  }

  const byId = new Map(courses.map((course) => [course.id, course]));
  for (const id of PRODUCTION_KNOWN_COURSE_IDS) {
    if (!byId.has(id)) {
      errors.push(`missing known production course id: ${id}`);
    }
  }

  const names = new Set(courses.map((course) => course.name.trim()));
  for (const name of PRODUCTION_KNOWN_COURSE_NAMES) {
    if (![...names].some((n) => n.includes(name) || name.includes(n))) {
      errors.push(`missing known production course name marker: ${name}`);
    }
  }

  for (const name of FALLBACK_ONLY_COURSE_NAMES) {
    if (names.has(name)) {
      errors.push(`fallback-only course name present: ${name}`);
    }
  }

  const mockLikeIds = courses.filter((course) => !course.id.startsWith("gc-"));
  if (mockLikeIds.length > 0 && courses.length < PRODUCTION_MIN_COURSE_COUNT) {
    errors.push(
      `non-gc course ids present while below production floor (${mockLikeIds.length})`,
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `[productionDataGuard] ${context}: production data parity failed:\n- ${errors.join("\n- ")}`,
    );
  }
}

export function rejectMockFallback(context: string, reason: string): never {
  throw new Error(
    `[productionDataGuard] ${context}: GOLFMAP_DATA_MODE=${PRODUCTION_DATA_MODE} forbids mock/fallback (${reason})`,
  );
}
