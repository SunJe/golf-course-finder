/** 이미지 URL이 없을 때 사용하는 기본 골프장 placeholder 목록 */
export const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80";

const PLACEHOLDER_IMAGES = [
  DEFAULT_COURSE_IMAGE,
  "https://images.unsplash.com/photo-1592919505786-3039701c8c8c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1587174486073-ae32a2295736?auto=format&fit=crop&w=1200&q=80",
] as const;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCourseImageUrl(
  imageUrl?: string | null,
  seed?: string,
): string {
  const trimmed = imageUrl?.trim();
  if (trimmed) return trimmed;
  if (seed) {
    return PLACEHOLDER_IMAGES[hashSeed(seed) % PLACEHOLDER_IMAGES.length];
  }
  return DEFAULT_COURSE_IMAGE;
}
