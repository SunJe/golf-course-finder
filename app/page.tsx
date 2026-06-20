import { getCourses } from "@/lib/courseRepository";
import HomeClient from "@/components/HomeClient";
import { buildHomeMetadata } from "@/lib/seoMetadata";

export const metadata = buildHomeMetadata();

export default async function HomePage() {
  const courses = await getCourses();
  return <HomeClient courses={courses} />;
}
