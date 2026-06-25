import { resolveCourseThumbnailPath } from "@/lib/courseSeoImage";
import {
  BLOG_THUMBNAIL_DEFAULT,
  BLOG_THUMBNAIL_DIR,
} from "@/lib/blogThumbnailRules";

const RECOMMENDED_BASE = "/promo-assets/recommended";

/** 홈 추천 캐러셀 전용 썸네일 (브랜드 시리즈) */
export const HOME_RECOMMENDED_THUMBNAILS: Record<string, string> = {
  "gc-60319bf1693c": `${RECOMMENDED_BASE}/incheon-grand.png`,
  "gc-81f36c789316": `${RECOMMENDED_BASE}/grand-cc.png`,
  "gc-81ecacc0ae41": `${RECOMMENDED_BASE}/lassa.png`,
  "gc-41b5c15f44da": `${RECOMMENDED_BASE}/ilsan-springhills.png`,
  "gc-18640b625b94": `${RECOMMENDED_BASE}/olympic.png`,
  "gc-81becbdb274e": `${RECOMMENDED_BASE}/paju-j-public.png`,
  "gc-fb2e8a3b34d8": `${RECOMMENDED_BASE}/best-valley.png`,
  "gc-29fa36946d15": `${RECOMMENDED_BASE}/namyangju.png`,
  "gc-3d63d3179c0f": `${RECOMMENDED_BASE}/taekwang-public.png`,
  "gc-27324df1736a": `${RECOMMENDED_BASE}/seoul-hanyang.png`,
};

/** @deprecated BlogPost.thumbnail 필드를 우선 사용하세요 */
export const HOME_BLOG_THUMBNAILS: Record<string, string> = {
  "seoul-beginner-golf-best-5": `${BLOG_THUMBNAIL_DIR}/seoul-beginner-golf-best-5.png`,
  "seoul-par3-golf-top-5": `${BLOG_THUMBNAIL_DIR}/seoul-par3-golf-top-5.png`,
  "seoul-budget-golf-best-5": `${BLOG_THUMBNAIL_DIR}/seoul-budget-golf-best-5.png`,
  "incheon-golf-top-5": `${BLOG_THUMBNAIL_DIR}/incheon-golf-top-5.png`,
  "beginner-golf-ball-top-5": `${BLOG_THUMBNAIL_DIR}/beginner-golf-ball-top-5.png`,
  "value-driver-buying-guide": `${BLOG_THUMBNAIL_DIR}/value-driver-buying-guide.png`,
  "beginner-iron-top-5": `${BLOG_THUMBNAIL_DIR}/beginner-iron-top-5.png`,
  "beginner-golf-essentials-checklist": `${BLOG_THUMBNAIL_DIR}/beginner-golf-essentials-checklist.png`,
};

export function resolveHomeRecommendedThumbnail(courseId: string): string {
  return (
    HOME_RECOMMENDED_THUMBNAILS[courseId] ??
    resolveCourseThumbnailPath(courseId)
  );
}

/** @deprecated BlogPost.thumbnail 사용 */
export function resolveHomeBlogThumbnail(slug: string): string {
  return HOME_BLOG_THUMBNAILS[slug] ?? BLOG_THUMBNAIL_DEFAULT;
}
