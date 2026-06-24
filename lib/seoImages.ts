import { collectionLandingPages } from "@/lib/collectionLanding";
import { regionLandingPages } from "@/lib/regionLanding";
import { absoluteUrl } from "@/lib/siteConfig";

export const SEO_IMAGE_WIDTH = 1200;
export const SEO_IMAGE_HEIGHT = 1200;

const SEO_IMAGES_ROOT = "/seo-images";

export const COLLECTION_SEO_SLUGS = collectionLandingPages.map(
  (page) => page.slug,
);

export const REGION_SEO_SLUGS = regionLandingPages.map((page) => page.slug);

export function getCollectionSeoImagePath(slug: string): string {
  return `${SEO_IMAGES_ROOT}/collections/${slug}.png`;
}

export function getRegionSeoImagePath(slug: string): string {
  return `${SEO_IMAGES_ROOT}/regions/${slug}.png`;
}

export function getCourseSeoImagePath(id: string): string {
  return `${SEO_IMAGES_ROOT}/courses/${id}.png`;
}

export function getSeoImageAbsoluteUrl(relativePath: string): string {
  return absoluteUrl(relativePath);
}
