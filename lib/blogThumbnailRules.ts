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
  "seoul-beginner-golf-best-5": "seoul-beginner-golf-alt.png",
  "seoul-par3-golf-top-5": "seoul-par3-golf.png",
  "seoul-par3-practice-range-top-10": "seoul-par3-alt.png",
  "seoul-nine-hole-beginner-golf-top-5": "seoul-9hole-alt.png",
  "seoul-budget-golf-best-5": "seoul-budget-golf.png",
  "incheon-golf-top-5": "incheon-golf-top5.png",
  "gapyeong-golf-best-6": "gapyeong-golf.png",
  "goyang-golf-best-5": "seoul-beginner-golf.png",
  "pocheon-golf-best-7": "pocheon-golf-best-7.png",
  "yongin-golf-best-10": "yongin-golf-best-10.png",
  "hwaseong-golf-best-7": "hwaseong-golf-best-7.png",
  "golf-ball-type-guide": "golf-ball-type-guide.png",
  "pro-tour-driver-brands-men": "pro-driver-men.png",
  "pro-tour-driver-brands-women": "pro-driver-women.png",
  "beginner-iron-top-5": "beginner-iron.png",
  "beginner-iron-men": "beginner-iron-men.png",
  "beginner-iron-women": "beginner-iron-women.png",
  "beginner-golf-essentials-checklist": "golf-essentials.png",
  "first-golf-round-checklist": "first-golf-round-checklist.png",
  "beginner-driver-men": "beginner-driver-men.png",
  "beginner-driver-women": "beginner-driver-women.png",
  "driver-loft-shaft-guide-men": "driver-loft-men-alt.png",
  "driver-loft-shaft-guide-women": "driver-loft-women-alt.png",
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

  "pocheon-golf-best-7.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: Pocheon regional golf course comparison guide.
Mountain lake and forest edge in northern Gyeonggi, calm public golf fairway, gentle hills, cool morning atmosphere, golf flag and cart path, not a real course, no identifiable clubhouse branding.`,

  "golf-ball-type-guide.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: golf balls by type.
Several clean white golf balls on bright green grass with a tee, blurred golf green background. Golf balls are the clear main subject. No driver, no club, no text, no logos.`,

  "beginner-golf-ball.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: beginner golf balls.
Several clean golf balls on green grass, golf tee, product-focused composition, blurred golf green background. Golf balls are the clear main subject. No brand logos.`,

  "value-driver.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: value-for-money golf drivers.
Close-up of a golf driver head and shaft on a tee area or practice range. The driver must be the main subject. No brand logos.`,

  "pro-driver-men.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: PGA Tour professional golf drivers for men.
Several premium golf drivers on a tee box, masculine tour practice range mood, clean fairway background. No brand logos, no text.`,

  "pro-driver-women.png": `${BLOG_THUMBNAIL_PROMPT_PREFIX}
Topic: LPGA Tour professional golf drivers for women.
Elegant golf driver and golf bag on a sunny course, women's tour equipment mood, bright and clean. No brand logos, no text.`,

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
  "seoul-par3-practice-range-top-10": "서울 근교 파3 연습장 추천",
  "seoul-nine-hole-beginner-golf-top-5": "서울 근교 초보자 9홀 골프장 추천",
  "seoul-budget-golf-best-5": "서울 근교 가성비 골프장 추천",
  "incheon-golf-top-5": "인천 골프장 추천",
  "gapyeong-golf-best-6": "가평 골프장 추천",
  "goyang-golf-best-5": "고양시 골프장 추천",
  "pocheon-golf-best-7": "포천 골프장 7곳 비교 대표 이미지",
  "yongin-golf-best-10": "용인 골프장 10곳 비교 대표 이미지",
  "hwaseong-golf-best-7": "화성 골프장 7곳 비교 대표 이미지",
  "golf-ball-type-guide": "골프공 종류별 추천 가이드",
  "pro-tour-driver-brands-men": "프로 드라이버 브랜드 남자편",
  "pro-tour-driver-brands-women": "프로 드라이버 브랜드 여자편",
  "beginner-iron-top-5": "초보자용 아이언 추천",
  "beginner-iron-men": "남자 입문용 아이언 추천 골프채",
  "beginner-iron-women": "여자 입문용 아이언 추천 여성 골프채",
  "beginner-golf-essentials-checklist": "초보 골퍼 라운드 준비물",
  "first-golf-round-checklist": "첫 골프장 준비물 체크리스트",
  "beginner-driver-men": "남자 입문용 드라이버 추천",
  "beginner-driver-women": "여자 입문용 드라이버 추천",
  "driver-loft-shaft-guide-men": "남자 드라이버 로프트 샤프트 선택 가이드",
  "driver-loft-shaft-guide-women": "여자 드라이버 로프트 샤프트 선택 가이드",
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

/** Next Image Optimization 우회 — Production에서 /_next/image 402 방지 */
export function isBlogSourceThumbnailPath(src: string): boolean {
  return src.startsWith(`${BLOG_THUMBNAIL_SOURCE_DIR}/`);
}

export const BLOG_THUMBNAIL_DEFAULT = `${BLOG_THUMBNAIL_DIR}/default.png`;
