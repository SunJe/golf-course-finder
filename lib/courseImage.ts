/** 이미지 URL이 없을 때 사용하는 기본 골프장 이미지 */
export const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80";

export function getCourseImageUrl(imageUrl?: string | null): string {
  const trimmed = imageUrl?.trim();
  return trimmed ? trimmed : DEFAULT_COURSE_IMAGE;
}
