import { getCourses } from "@/lib/courseRepository";
import HomeClient from "@/components/HomeClient";
import RegionLinks from "@/components/RegionLinks";
import { buildHomeMetadata } from "@/lib/seoMetadata";

export const metadata = buildHomeMetadata();

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { region?: string };
}) {
  const courses = await getCourses();
  return (
    <>
      <HomeClient
        courses={courses}
        initialRegionSlug={searchParams?.region}
      />
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <RegionLinks className="max-w-5xl" />
      </div>
    </>
  );
}
