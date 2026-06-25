import { getCourses } from "@/lib/courseRepository";
import { toHomeCourses } from "@/lib/homeCourse";
import HomeClient from "@/components/HomeClient";
import { buildMapMetadata } from "@/lib/seoMetadata";
import { isCollectionSlug } from "@/lib/collectionLanding";

export const metadata = buildMapMetadata();

export default async function MapPage({
  searchParams,
}: {
  searchParams?: { region?: string; collection?: string };
}) {
  const courses = toHomeCourses(await getCourses());
  const collectionParam = searchParams?.collection?.trim();
  const initialCollectionSlug =
    collectionParam && isCollectionSlug(collectionParam)
      ? collectionParam
      : undefined;

  return (
    <HomeClient
      courses={courses}
      initialRegionSlug={searchParams?.region}
      initialCollectionSlug={initialCollectionSlug}
    />
  );
}
