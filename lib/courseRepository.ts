import type { Course } from "@/types/course";
import type { GolfCourseRow } from "@/types/database";
import { unstable_noStore as noStore } from "next/cache";
import { mapGolfCourseRowToCourse } from "@/lib/courseMapper";
import { MOCK_COURSES } from "@/lib/mock";
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

async function fetchCoursesFromSupabase(): Promise<Course[] | null> {
  noStore();
  const supabase = getSupabaseClient();
  if (!isSupabaseConfigured || !supabase) {
    warnFallback("Supabase env not configured");
    return null;
  }

  const { data, error } = await supabase
    .from("golf_courses")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    warnFallback(`Supabase fetch failed: ${error.message}`);
    warnRlsIfNeeded(error.message);
    return null;
  }

  if (!data || data.length === 0) {
    warnFallback("Supabase returned 0 rows");
    warnRlsIfNeeded("empty result — check RLS SELECT policy");
    return null;
  }

  console.log(`[courseRepository] Loaded ${data.length} courses from Supabase`);
  return mapRows(data as GolfCourseRow[]);
}

export async function getCourses(): Promise<Course[]> {
  const fromSupabase = await fetchCoursesFromSupabase();
  return fromSupabase ?? getMockCourses();
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
      warnFallback(`getCourseById("${id}") failed: ${error.message}`);
      warnRlsIfNeeded(error.message);
    }
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
      return data.map((row) => row.id as string);
    }

    if (error) {
      warnFallback(`getAllCourseIds failed: ${error.message}`);
      warnRlsIfNeeded(error.message);
    } else if (!data || data.length === 0) {
      warnFallback("getAllCourseIds returned 0 rows");
      warnRlsIfNeeded("empty result — check RLS SELECT policy");
    }
  } else {
    warnFallback("Supabase env not configured");
  }

  return getMockCourses().map((course) => course.id);
}

/** Supabase row 배열을 Course[]로 변환할 때 사용 (import/seed용) */
export function mapRowsToCourses(rows: GolfCourseRow[]): Course[] {
  return mapRows(rows);
}
