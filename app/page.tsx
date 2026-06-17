import { getCourses } from "@/lib/courseRepository";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const courses = await getCourses();
  return <HomeClient courses={courses} />;
}
