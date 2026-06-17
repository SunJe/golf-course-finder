import { getCourses } from "@/lib/data";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const courses = await getCourses();
  return <HomeClient courses={courses} />;
}
