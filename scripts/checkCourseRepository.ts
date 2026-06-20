import { loadEnvLocal } from "./lib/envUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

async function main(): Promise<void> {
  const env = loadEnvLocal(getProjectRoot());
  process.env.NEXT_PUBLIC_SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { getCourseById, getCourses } = await import("../lib/courseRepository");
  const course = await getCourseById("gc-1f14d0ca89b4");
  console.log("getCourseById:", course?.name, course?.phone, course?.homepageUrl);

  const all = await getCourses();
  const match = all.find((c) => c.id === "gc-1f14d0ca89b4");
  console.log("getCourses match:", match?.name, match?.phone, match?.homepageUrl);
  console.log("total courses:", all.length);
}

main();
