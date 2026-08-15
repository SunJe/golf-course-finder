import { NextResponse } from "next/server";
import { getMapCourses } from "@/lib/courseRepository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const courses = await getMapCourses();
    return NextResponse.json(courses, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[api/map/courses] Failed to load courses", error);
    return NextResponse.json(
      { error: "Failed to load map courses" },
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
        },
      },
    );
  }
}
