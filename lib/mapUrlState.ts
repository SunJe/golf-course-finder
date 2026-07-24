import {
  EMPTY_FILTERS,
  type CourseFilters,
} from "@/types/course";
import { isCollectionSlug, type CollectionSlug } from "@/lib/collectionLanding";
import { FILTER_PRICE_OPTIONS } from "@/lib/filterChips";
import { COURSE_TYPE_OPTIONS, HOLE_OPTIONS, REGIONS, TAG_OPTIONS } from "@/lib/constants";

export type MapViewMode = "map" | "list";

export type MapUrlState = {
  filters: CourseFilters;
  regionSlug?: string;
  collectionSlug?: CollectionSlug;
  view: MapViewMode;
  sort?: string;
};

const VALID_REGIONS = new Set(
  REGIONS.filter((r) => r !== "전체") as readonly string[],
);
const VALID_HOLES = new Set(
  HOLE_OPTIONS.filter((h) => h !== "전체") as readonly string[],
);
const VALID_TYPES = new Set(
  COURSE_TYPE_OPTIONS.filter((t) => t !== "전체") as readonly string[],
);
const VALID_PRICES = new Set(FILTER_PRICE_OPTIONS);
const VALID_TAGS = new Set(TAG_OPTIONS as readonly string[]);

function splitCsv(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function firstParam(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  if (params instanceof URLSearchParams) {
    const value = params.get(key);
    return value?.trim() || undefined;
  }
  const raw = params[key];
  if (Array.isArray(raw)) return raw[0]?.trim() || undefined;
  return raw?.trim() || undefined;
}

export function parseMapUrlState(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): MapUrlState {
  const q = firstParam(params, "q") ?? "";
  const regionSlug = firstParam(params, "region");
  const collectionRaw = firstParam(params, "collection");
  const collectionSlug =
    collectionRaw && isCollectionSlug(collectionRaw)
      ? collectionRaw
      : undefined;
  const viewRaw = firstParam(params, "view");
  const view: MapViewMode = viewRaw === "list" ? "list" : "map";
  const sort = firstParam(params, "sort");

  const regions = splitCsv(firstParam(params, "region_filter")).filter((r) =>
    VALID_REGIONS.has(r),
  );
  // Prefer explicit region filter; fall back to empty (landing region handled separately)
  const holes = splitCsv(firstParam(params, "holes")).filter((h) =>
    VALID_HOLES.has(h),
  );
  const operation = splitCsv(firstParam(params, "operation")).filter((t) =>
    VALID_TYPES.has(t),
  );
  const price = splitCsv(firstParam(params, "price")).filter((p) =>
    VALID_PRICES.has(p),
  );
  const tag = splitCsv(firstParam(params, "tag")).filter((t) =>
    VALID_TAGS.has(t),
  );

  return {
    filters: {
      query: q,
      regions,
      holeCounts: holes,
      courseTypes: operation,
      priceRanges: price,
      tags: tag,
    },
    regionSlug,
    collectionSlug,
    view,
    sort,
  };
}

export function serializeMapUrlState(state: {
  filters: CourseFilters;
  regionSlug?: string | null;
  collectionSlug?: CollectionSlug | null;
  view?: MapViewMode;
  sort?: string | null;
}): string {
  const params = new URLSearchParams();
  const { filters } = state;

  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (state.regionSlug) params.set("region", state.regionSlug);
  if (state.collectionSlug) params.set("collection", state.collectionSlug);
  if (filters.regions.length) params.set("region_filter", filters.regions.join(","));
  if (filters.holeCounts.length) params.set("holes", filters.holeCounts.join(","));
  if (filters.courseTypes.length) {
    params.set("operation", filters.courseTypes.join(","));
  }
  if (filters.priceRanges.length) {
    params.set("price", filters.priceRanges.join(","));
  }
  if (filters.tags.length) params.set("tag", filters.tags.join(","));
  if (state.view && state.view !== "map") params.set("view", state.view);
  if (state.sort) params.set("sort", state.sort);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function buildMapSearchHref(query: string): string {
  const q = query.trim();
  if (!q) return "/map";
  return `/map?q=${encodeURIComponent(q)}`;
}

export function buildMapQuickFilterHref(
  kind: "near-seoul" | "budget" | "nine-hole" | "beginner",
): string {
  switch (kind) {
    case "near-seoul":
      return "/map?collection=near-seoul";
    case "budget":
      return `/map?price=${encodeURIComponent("10만원 이하")}`;
    case "nine-hole":
      return `/map?holes=${encodeURIComponent("9홀")}`;
    case "beginner":
      return "/map?collection=near-seoul-beginner";
  }
}

export function filtersFromMapUrlOrEmpty(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): CourseFilters {
  const parsed = parseMapUrlState(params);
  if (
    !parsed.filters.query &&
    parsed.filters.regions.length === 0 &&
    parsed.filters.holeCounts.length === 0 &&
    parsed.filters.courseTypes.length === 0 &&
    parsed.filters.priceRanges.length === 0 &&
    parsed.filters.tags.length === 0
  ) {
    return { ...EMPTY_FILTERS };
  }
  return parsed.filters;
}
