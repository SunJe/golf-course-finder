/**
 * 블로그 썸네일 생성·관리 규칙
 *
 * 신규 생성 성공 기준:
 * - public/promo-assets/blog/source/*.png 원본이 1:1 정사각형 (1024+ 권장 1200)
 * - crop으로 정사각형을 만든 비정사각형 원본은 실패
 * - Cursor GenerateImage는 1536×1024만 반환 → 네이티브 정사각형은 DALL·E 3 등 size 지정 API 사용
 *   (npm run generate:blog-thumbnail-sources, OPENAI_API_KEY 필요)
 *
 * final: public/promo-assets/blog/*.png — source가 1:1일 때만 resize(1200×1200, fill)
 */

export const BLOG_THUMBNAIL_DIR = "/promo-assets/blog";
export const BLOG_THUMBNAIL_SOURCE_DIR = "/promo-assets/blog/source";

export const BLOG_THUMBNAIL_SIZE = 1200;
export const BLOG_THUMBNAIL_MIN_SIZE = 1024;

/** AI 생성 프롬프트 공통 접두어 */
export const BLOG_THUMBNAIL_PROMPT_PREFIX = `Create a square 1:1 blog thumbnail image.
The original generated image must be square.
Use a square canvas, 1024x1024 or 1200x1200.
Do not create a wide banner.
Do not create a 16:9 landscape image.
Do not create a vertical portrait image.
Do not rely on cropping after generation.
No text, no logo, no watermark.
`;

export const BLOG_THUMBNAIL_FILE_BY_SLUG: Record<string, string> = {
  "seoul-beginner-golf-best-5": "seoul-beginner-golf.png",
  "seoul-par3-golf-top-5": "seoul-par3-golf.png",
  "seoul-budget-golf-best-5": "seoul-budget-golf.png",
  "incheon-golf-top-5": "incheon-golf-top5.png",
  "gapyeong-golf-best-6": "gapyeong-golf.png",
  "beginner-golf-ball-top-5": "beginner-golf-ball.png",
  "value-driver-buying-guide": "value-driver.png",
  "beginner-iron-top-5": "beginner-iron.png",
  "beginner-golf-essentials-checklist": "golf-essentials.png",
};

export const CANONICAL_BLOG_THUMBNAIL_FILES = Object.values(
  BLOG_THUMBNAIL_FILE_BY_SLUG,
);

export const BLOG_THUMBNAIL_PROMPTS: Record<string, string> = {
  "seoul-beginner-golf.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: beginner-friendly golf courses near Seoul.
Bright friendly golf course, beginner golfer, relaxed fairway, clear sky, approachable public course mood.`,

  "seoul-par3-golf.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: Par 3 golf courses near Seoul.
Compact short golf course, green, flagstick, golfer preparing a short iron or wedge approach shot. Bright, clean, friendly.`,

  "seoul-budget-golf.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: affordable golf courses near Seoul.
Practical public golf course, clean fairway, golf cart path, golf bag, relaxed value-for-money mood. No luxury resort feeling.`,

  "incheon-golf-top5.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: best golf courses in Incheon.
Open golf course with wide sky, breezy west-coast feeling, bright fairway, clean regional guide mood.`,

  "gapyeong-golf.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: best golf courses in Gapyeong near Seoul.
Mountain valley golf course, river and forest scenery, bright fairway, Seoul day-trip golf mood.`,

  "beginner-golf-ball.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: beginner golf balls.
Several clean golf balls on green grass, golf tee, product-focused composition, blurred golf green background. Golf balls are the clear main subject. No brand logos.`,

  "value-driver.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: value-for-money golf drivers.
Close-up of a golf driver head and shaft on a tee area or practice range. The driver must be the main subject. No brand logos.`,

  "beginner-iron.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: beginner golf irons.
Several iron clubs arranged neatly, or a beginner golfer preparing an iron shot on a practice mat or fairway. Friendly equipment guide mood.`,

  "golf-essentials.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: beginner golf round essentials.
Golf bag, glove, golf balls, tees, rangefinder, cap arranged neatly like a clean flat lay. Friendly beginner checklist mood.`,
};

export const BLOG_THUMBNAIL_ALT_BY_SLUG: Record<string, string> = {
  "seoul-beginner-golf-best-5": "서울 근교 초보자 골프장 추천",
  "seoul-par3-golf-top-5": "서울 근교 파3 골프장 추천",
  "seoul-budget-golf-best-5": "서울 근교 가성비 골프장 추천",
  "incheon-golf-top-5": "인천 골프장 추천",
  "gapyeong-golf-best-6": "가평 골프장 추천",
  "beginner-golf-ball-top-5": "초보자용 골프공 추천",
  "value-driver-buying-guide": "가성비 드라이버 추천",
  "beginner-iron-top-5": "초보자용 아이언 추천",
  "beginner-golf-essentials-checklist": "초보 골퍼 라운드 준비물",
};

export function blogThumbnailPath(slug: string): string {
  const file = BLOG_THUMBNAIL_FILE_BY_SLUG[slug];
  if (!file) {
    throw new Error(`Unknown blog slug for thumbnail: ${slug}`);
  }
  return `${BLOG_THUMBNAIL_SOURCE_DIR}/${file}`;
}

export function blogThumbnailAlt(slug: string): string {
  const alt = BLOG_THUMBNAIL_ALT_BY_SLUG[slug];
  if (!alt) {
    throw new Error(`Unknown blog slug for thumbnail alt: ${slug}`);
  }
  return alt;
}

export function blogThumbnailSourcePath(fileName: string): string {
  return `${BLOG_THUMBNAIL_SOURCE_DIR}/${fileName}`;
}

export const BLOG_THUMBNAIL_DEFAULT = `${BLOG_THUMBNAIL_DIR}/default.png`;
