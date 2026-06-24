import { absoluteUrl } from "@/lib/siteConfig";

export const PROMO_IMAGES_ROOT = "/promo-images";

export function getCollectionPromoImagePath(slug: string): string {
  return `${PROMO_IMAGES_ROOT}/collections/${slug}.png`;
}

export function getPromoImageAbsoluteUrl(relativePath: string): string {
  return absoluteUrl(relativePath);
}

export function resolvePromoBackgroundPath(slug: string): string {
  return `/promo-assets/backgrounds/${slug}.jpg`;
}

export function getDefaultPromoBackgroundPath(): string {
  return "/promo-assets/backgrounds/default.jpg";
}
