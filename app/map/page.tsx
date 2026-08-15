import MapDataLoader from "@/components/MapDataLoader";
import { buildMapMetadata } from "@/lib/seoMetadata";
import { parseMapUrlState } from "@/lib/mapUrlState";

export const metadata = buildMapMetadata();

export default function MapPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseMapUrlState(searchParams ?? {});

  return (
    <MapDataLoader
      initialRegionSlug={parsed.regionSlug}
      initialCollectionSlug={parsed.collectionSlug}
      initialFilters={parsed.filters}
      initialView={parsed.view}
    />
  );
}
