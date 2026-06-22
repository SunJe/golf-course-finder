import { getCourses } from "@/lib/courseRepository";
import { toHomeCourses } from "@/lib/homeCourse";
import HomeClient from "@/components/HomeClient";
import HomeIntro from "@/components/HomeIntro";
import RegionLinks from "@/components/RegionLinks";
import CollectionLinks from "@/components/CollectionLinks";
import { buildHomeMetadata } from "@/lib/seoMetadata";

export const metadata = buildHomeMetadata();

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { region?: string };
}) {
  const courses = toHomeCourses(await getCourses());
  return (
    <>
      <HomeClient
        courses={courses}
        initialRegionSlug={searchParams?.region}
      />
      <HomeIntro />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <CollectionLinks className="max-w-5xl" />
        <RegionLinks className="mt-8 max-w-5xl" />
      </div>
    </>
  );
}
