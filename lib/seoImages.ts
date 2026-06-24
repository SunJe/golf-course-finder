import { collectionLandingPages } from "@/lib/collectionLanding";
import { regionLandingPages } from "@/lib/regionLanding";
import { absoluteUrl } from "@/lib/siteConfig";

export const SEO_IMAGE_WIDTH = 1200;
export const SEO_IMAGE_HEIGHT = 1200;

/** Bust CDN cache when SEO title images are regenerated. */
export const SEO_IMAGE_VERSION = "be754d3";

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

function withSeoImageVersion(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${SEO_IMAGE_VERSION}`;
}

export function getSeoImageAbsoluteUrl(relativePath: string): string {
  return withSeoImageVersion(absoluteUrl(relativePath));
}

export function getCollectionSeoImageUrl(siteUrl: string, slug: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return withSeoImageVersion(`${base}${getCollectionSeoImagePath(slug)}`);
}

export function getRegionSeoImageUrl(siteUrl: string, slug: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return withSeoImageVersion(`${base}${getRegionSeoImagePath(slug)}`);
}

export function getCourseSeoImageUrl(siteUrl: string, id: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return withSeoImageVersion(`${base}${getCourseSeoImagePath(id)}`);
}
