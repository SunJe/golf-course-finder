/**
 * AI background prompts for SEO OG cards.
 * Save generated images to:
 *   public/seo-images/backgrounds/collections/{slug}.jpg
 *   public/seo-images/backgrounds/regions/{slug}.jpg
 *   public/seo-images/backgrounds/courses/_pool/{1-12}.jpg
 *
 * Then run: npm run generate:seo-images
 */

export const BACKGROUND_BASE_PROMPT =
  "Ultra realistic professional golf course photography, cinematic wide landscape, lush green fairway and manicured putting green in foreground, rolling hills or mountains in background, bright sunny day with soft white clouds, editorial travel magazine quality, shallow depth of field, no text, no logo, no watermark, no people, no buildings with readable signs";

export const COLLECTION_BACKGROUND_PROMPTS: Record<string, string> = {
  "nine-hole":
    `${BACKGROUND_BASE_PROMPT}, compact nine-hole golf course layout, shorter holes, cozy public course atmosphere`,
  par3: `${BACKGROUND_BASE_PROMPT}, par-3 executive golf course, short holes, approachable beginner-friendly course`,
  public: `${BACKGROUND_BASE_PROMPT}, Korean public golf course, open accessible fairways, welcoming atmosphere`,
  baekdori: `${BACKGROUND_BASE_PROMPT}, friendly public golf course fairway, relaxed weekend round atmosphere`,
  beginner: `${BACKGROUND_BASE_PROMPT}, gentle wide fairway suitable for beginners, soft morning light`,
  budget: `${BACKGROUND_BASE_PROMPT}, value public golf course, neat but modest clubhouse in distance`,
  "near-seoul": `${BACKGROUND_BASE_PROMPT}, golf course near Seoul with forested hills, metropolitan outskirts scenery`,
  "near-seoul-public": `${BACKGROUND_BASE_PROMPT}, public golf course near Seoul, green hills and clear sky`,
  "near-seoul-baekdori": `${BACKGROUND_BASE_PROMPT}, approachable public course near Seoul, relaxed fairway`,
  "near-seoul-beginner": `${BACKGROUND_BASE_PROMPT}, beginner-friendly course near Seoul, wide forgiving fairway`,
  "near-seoul-budget": `${BACKGROUND_BASE_PROMPT}, affordable public golf course near Seoul, neat greens`,
  "near-seoul-nine-hole": `${BACKGROUND_BASE_PROMPT}, nine-hole course near Seoul, compact scenic layout`,
  "near-seoul-par3": `${BACKGROUND_BASE_PROMPT}, par-3 course near Seoul, short scenic holes`,
};

export const REGION_BACKGROUND_PROMPTS: Record<string, string> = {
  seoul: `${BACKGROUND_BASE_PROMPT}, golf course with Seoul metropolitan hills and urban skyline hint in far distance`,
  gyeonggi: `${BACKGROUND_BASE_PROMPT}, Gyeonggi province golf course, forested hills and wide valleys`,
  incheon: `${BACKGROUND_BASE_PROMPT}, Incheon area golf course, coastal breeze atmosphere, open sky`,
  gangwon: `${BACKGROUND_BASE_PROMPT}, Gangwon province mountain golf course, dramatic alpine peaks and pine forests`,
  chungcheong: `${BACKGROUND_BASE_PROMPT}, Chungcheong region golf course, gentle rolling countryside`,
  jeolla: `${BACKGROUND_BASE_PROMPT}, Jeolla region golf course, warm southern light, lush vegetation`,
  gyeongsang: `${BACKGROUND_BASE_PROMPT}, Gyeongsang region golf course, southern coastal hills`,
  jeju: `${BACKGROUND_BASE_PROMPT}, Jeju Island golf course, volcanic hills, ocean horizon, subtropical greens`,
  busan: `${BACKGROUND_BASE_PROMPT}, Busan area golf course, coastal mountains and sea breeze atmosphere`,
};

export const COURSE_POOL_PROMPTS: string[] = Array.from({ length: 12 }, (_, i) => {
  const moods = [
    "morning mist",
    "golden hour sunset",
    "bright midday",
    "spring blossoms nearby",
    "autumn foliage",
    "ocean view horizon",
    "mountain valley",
    "pine forest edge",
    "links-style open field",
    "lake-side hazard",
    "rolling hill country",
    "classic clubhouse view",
  ];
  return `${BACKGROUND_BASE_PROMPT}, ${moods[i]}`;
});
