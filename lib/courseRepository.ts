import type { Course } from "@/types/course";
import type { GolfCourseRow } from "@/types/database";
import { unstable_noStore as noStore } from "next/cache";
import { mapGolfCourseRowToCourse } from "@/lib/courseMapper";
import { MOCK_COURSES } from "@/lib/mock";
import {
  assertProductionCourseDataset,
  isProductionDataMode,
  PRODUCTION_MIN_COURSE_COUNT,
  rejectMockFallback,
} from "@/lib/productionDataGuard";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

function getMockCourses(): Course[] {
  return MOCK_COURSES;
}

function warnFallback(reason: string): void {
  console.warn(`[courseRepository] ${reason}. Falling back to mock courses.`);
}

function warnRlsIfNeeded(message: string): void {
  const lower = message.toLowerCase();
  if (
    lower.includes("permission") ||
    lower.includes("rls") ||
    lower.includes("jwt") ||
    lower.includes("401")
  ) {
    console.warn(
      "[courseRepository] Supabase RLS/policy may block reads. Add a read-only public SELECT policy on public.golf_courses. Do not use service_role in the browser.",
    );
  }
}

function mapRows(rows: GolfCourseRow[]): Course[] {
  return rows.map(mapGolfCourseRowToCourse);
}

function finalizeCourses(courses: Course[], context: string): Course[] {
  if (isProductionDataMode()) {
    assertProductionCourseDataset(courses, context);
  }
  return courses;
}

function fallbackOrReject(context: string, reason: string): Course[] {
  if (isProductionDataMode()) {
    rejectMockFallback(context, reason);
  }
  warnFallback(reason);
  return getMockCourses();
}

async function fetchCoursesFromSupabase(options?: {
  static?: boolean;
}): Promise<Course[] | null> {
  if (!options?.static) {
    noStore();
  }
  const supabase = getSupabaseClient();
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("golf_courses")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    warnRlsIfNeeded(error.message);
    if (isProductionDataMode()) {
      rejectMockFallback(
        "fetchCoursesFromSupabase",
        `Supabase fetch failed: ${error.message}`,
      );
    }
    warnFallback(`Supabase fetch failed: ${error.message}`);
    return null;
  }

  if (!data || data.length === 0) {
    warnRlsIfNeeded("empty result — check RLS SELECT policy");
    if (isProductionDataMode()) {
      rejectMockFallback("fetchCoursesFromSupabase", "Supabase returned 0 rows");
    }
    warnFallback("Supabase returned 0 rows");
    return null;
  }

  console.log(`[courseRepository] Loaded ${data.length} courses from Supabase`);
  return mapRows(data as GolfCourseRow[]);
}

export async function getCourses(): Promise<Course[]> {
  const fromSupabase = await fetchCoursesFromSupabase();
  if (fromSupabase) {
    return finalizeCourses(fromSupabase, "getCourses");
  }
  return finalizeCourses(
    fallbackOrReject("getCourses", "Supabase env not configured or fetch failed"),
    "getCourses",
  );
}

/** SSG/ISR region landing 등 정적 생성용 — noStore 없이 fetch */
export async function getCoursesForStaticPages(): Promise<Course[]> {
  const fromSupabase = await fetchCoursesFromSupabase({ static: true });
  if (fromSupabase) {
    return finalizeCourses(fromSupabase, "getCoursesForStaticPages");
  }
  return finalizeCourses(
    fallbackOrReject(
      "getCoursesForStaticPages",
      "Supabase env not configured or fetch failed",
    ),
    "getCoursesForStaticPages",
  );
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  noStore();
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("golf_courses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return mapGolfCourseRowToCourse(data as GolfCourseRow);
    }

    if (error) {
      warnRlsIfNeeded(error.message);
      if (isProductionDataMode()) {
        rejectMockFallback(
          "getCourseById",
          `getCourseById("${id}") failed: ${error.message}`,
        );
      }
      warnFallback(`getCourseById("${id}") failed: ${error.message}`);
    } else if (isProductionDataMode()) {
      // Missing row is a normal 404 — do not fall back to mock.
      return undefined;
    }
  } else if (isProductionDataMode()) {
    rejectMockFallback("getCourseById", "Supabase env not configured");
  }

  return getMockCourses().find((course) => course.id === id);
}

export async function getAllCourseIds(): Promise<string[]> {
  noStore();
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("golf_courses").select("id");

    if (!error && data && data.length > 0) {
      console.log(
        `[courseRepository] Loaded ${data.length} course ids from Supabase`,
      );
      if (isProductionDataMode() && data.length < PRODUCTION_MIN_COURSE_COUNT) {
        rejectMockFallback(
          "getAllCourseIds",
          `course id count ${data.length} below production floor`,
        );
      }
      return data.map((row) => row.id as string);
    }

    if (error) {
      warnRlsIfNeeded(error.message);
      if (isProductionDataMode()) {
        rejectMockFallback(
          "getAllCourseIds",
          `getAllCourseIds failed: ${error.message}`,
        );
      }
      warnFallback(`getAllCourseIds failed: ${error.message}`);
    } else if (!data || data.length === 0) {
      warnRlsIfNeeded("empty result — check RLS SELECT policy");
      if (isProductionDataMode()) {
        rejectMockFallback("getAllCourseIds", "returned 0 rows");
      }
      warnFallback("getAllCourseIds returned 0 rows");
    }
  } else if (isProductionDataMode()) {
    rejectMockFallback("getAllCourseIds", "Supabase env not configured");
  } else {
    warnFallback("Supabase env not configured");
  }

  return getMockCourses().map((course) => course.id);
}

export interface SitemapCourseEntry {
  id: string;
  updatedAt?: string;
}

/** sitemap.xml용 course id + updated_at (Supabase 실패 시 mock fallback) */
export async function getSitemapEntries(): Promise<SitemapCourseEntry[]> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("golf_courses")
      .select("id, updated_at");

    if (!error && data && data.length > 0) {
      if (isProductionDataMode() && data.length < PRODUCTION_MIN_COURSE_COUNT) {
        rejectMockFallback(
          "getSitemapEntries",
          `course id count ${data.length} below production floor`,
        );
      }
      return data.map((row) => ({
        id: row.id as string,
        updatedAt: (row.updated_at as string | null) ?? undefined,
      }));
    }

    if (error) {
      if (isProductionDataMode()) {
        rejectMockFallback(
          "getSitemapEntries",
          `getSitemapEntries failed: ${error.message}`,
        );
      }
      warnFallback(`getSitemapEntries failed: ${error.message}`);
    }
  } else if (isProductionDataMode()) {
    rejectMockFallback("getSitemapEntries", "Supabase env not configured");
  } else {
    warnFallback("Supabase env not configured for sitemap");
  }

  return getMockCourses().map((course) => ({
    id: course.id,
    updatedAt: course.updatedAt,
  }));
}

/** Supabase row 배열을 Course[]로 변환할 때 사용 (import/seed용) */
export function mapRowsToCourses(rows: GolfCourseRow[]): Course[] {
  return mapRows(rows);
}
