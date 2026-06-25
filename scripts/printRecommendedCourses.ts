import fs from "fs";
import path from "path";
import type { Course, CourseType } from "../types/course";
import { getCoursesForStaticPages } from "../lib/courseRepository";
import { selectRecommendedCourses } from "../lib/recommendedCourses";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

function loadCoursesFromFullSetCsv(): Course[] {
  const csvPath = path.join(
    process.cwd(),
    "data/enrichment/golf_courses_full_set.csv",
  );
  const lines = fs.readFileSync(csvPath, "utf8").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]).map((header) => header.replace(/^\uFEFF/, ""));
  const index = (name: string) => headers.indexOf(name);

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const get = (field: string) => cols[index(field)] ?? "";
    const num = (field: string) => {
      const parsed = Number(get(field));
      return Number.isFinite(parsed) ? parsed : undefined;
    };
    return {
      id: get("id"),
      name: get("name"),
      changeNameTo: get("change_name_to") || undefined,
      region: get("region"),
      city: get("city"),
      address: get("address"),
      latitude: num("latitude") ?? 0,
      longitude: num("longitude") ?? 0,
      phone: get("phone") || undefined,
      homepageUrl: get("website") || undefined,
      holeCount: num("hole_count"),
      courseType: (get("courseType") || "기타") as CourseType,
      priceMin: num("price_min"),
      priceMax: num("price_max"),
      tags: [],
      source: "public_data",
      updatedAt: get("updatedAt") || new Date().toISOString(),
    } satisfies Course;
  });
}

async function main() {
  loadEnvLocal();
  let courses = await getCoursesForStaticPages();
  if (courses.length < 100) {
    courses = loadCoursesFromFullSetCsv();
    console.log(`[fallback] Loaded ${courses.length} courses from full_set CSV`);
  }
  const recommended = selectRecommendedCourses(courses);
  console.log(`Recommended count: ${recommended.length}`);
  recommended.forEach((meta, index) => {
    console.log(`${index + 1}. ${meta.course.name} (${meta.course.id})`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
