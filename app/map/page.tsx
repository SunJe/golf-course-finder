import { getCourses } from "@/lib/courseRepository";
import { toHomeCourses } from "@/lib/homeCourse";
import HomeClient from "@/components/HomeClient";
import { buildMapMetadata } from "@/lib/seoMetadata";
import { parseMapUrlState } from "@/lib/mapUrlState";

export const metadata = buildMapMetadata();

export default async function MapPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const courses = toHomeCourses(await getCourses());
  const parsed = parseMapUrlState(searchParams ?? {});

  return (
    <HomeClient
      courses={courses}
      initialRegionSlug={parsed.regionSlug}
      initialCollectionSlug={parsed.collectionSlug}
      initialFilters={parsed.filters}
      initialView={parsed.view}
    />
  );
}
