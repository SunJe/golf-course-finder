import type { Course } from "@/types/course";
import type { BlogPost } from "@/lib/blogPosts";
import { getAllBlogPosts } from "@/lib/blogPosts";
import {
  getDistanceKm,
  hasValidPrice,
  isNineHoleCourse,
  isPar3Course,
  isPublicCourse,
  SEOUL_CITY_HALL,
} from "@/lib/collectionFilters";

const GUIDE_KEYWORDS = [
  "준비",
  "체크리스트",
  "에티켓",
  "복장",
  "예약",
  "장비",
  "드라이버",
  "아이언",
  "골프공",
  "로프트",
] as const;

const NEAR_SEOUL_KM = 80;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "");
}

function isNearSeoul(course: Course): boolean {
  if (
    !Number.isFinite(course.latitude) ||
    !Number.isFinite(course.longitude) ||
    course.latitude === 0 ||
    course.longitude === 0
  ) {
    return false;
  }
  const km = getDistanceKm(
    SEOUL_CITY_HALL.lat,
    SEOUL_CITY_HALL.lng,
    course.latitude,
    course.longitude,
  );
  return km <= NEAR_SEOUL_KM;
}

function postMentionsCourse(post: BlogPost, course: Course): boolean {
  const courseId = course.id;
  const name = normalize(course.name);
  if (!name) return false;

  for (const section of post.sections) {
    for (const item of section.items ?? []) {
      if (item.relatedCourseId === courseId) return true;
      const itemTitle = normalize(item.title);
      if (itemTitle && (itemTitle.includes(name) || name.includes(itemTitle))) {
        return true;
      }
    }
    for (const paragraph of section.body) {
      if (normalize(paragraph).includes(name)) return true;
    }
  }
  return false;
}

function postMatchesCity(post: BlogPost, course: Course): boolean {
  const city = course.city?.trim();
  if (!city) return false;
  const cityNorm = normalize(city.replace(/(시|군|구)$/, ""));
  if (!cityNorm || cityNorm.length < 2) return false;

  if (post.blogRegionLabel && normalize(post.blogRegionLabel).includes(cityNorm)) {
    return true;
  }
  if (normalize(post.title).includes(cityNorm)) return true;
  if (normalize(post.description).includes(cityNorm)) return true;
  return false;
}

function postMatchesRegion(post: BlogPost, course: Course): boolean {
  const region = course.region?.trim();
  if (!region) return false;
  const regionNorm = normalize(region);

  // 광역 라벨 → 관련 region slug / 블로그 지역 라벨
  const regionAliases: Record<string, string[]> = {
    경기: ["gyeonggi", "경기", "고양", "가평", "남양주", "용인"],
    인천: ["incheon", "인천"],
    서울: ["seoul", "서울"],
    충청: ["chungcheong", "충청", "충주", "천안"],
    강원: ["gangwon", "강원"],
    경상: ["gyeongsang", "경상"],
    전라: ["jeolla", "전라"],
    제주: ["jeju", "제주"],
  };

  const aliases = regionAliases[region] ?? [regionNorm];
  const haystacks = [
    post.relatedRegionSlug ?? "",
    post.blogRegionLabel ?? "",
    post.title,
    post.description,
  ].map(normalize);

  return aliases.some((alias) => {
    const a = normalize(alias);
    return haystacks.some((h) => h.includes(a));
  });
}

function safeTrait(
  predicate: (course: Course) => boolean,
  course: Course,
): boolean {
  try {
    return predicate(course);
  } catch {
    return false;
  }
}

function postMatchesCourseTraits(post: BlogPost, course: Course): boolean {
  const slug = post.relatedCollectionSlug;
  if (!slug) return false;
  if (slug.includes("near-seoul") && isNearSeoul(course)) return true;
  if (slug.includes("nine-hole") && safeTrait(isNineHoleCourse, course)) return true;
  if (slug.includes("par3") && safeTrait(isPar3Course, course)) return true;
  if (slug.includes("budget") && hasValidPrice(course)) return true;
  if (slug.includes("public") && safeTrait(isPublicCourse, course)) return true;
  if (
    (slug.includes("beginner") || slug.includes("baekdori")) &&
    (safeTrait(isNineHoleCourse, course) ||
      safeTrait(isPar3Course, course) ||
      safeTrait(isPublicCourse, course))
  ) {
    return true;
  }
  return false;
}

function isNationalGuidePost(post: BlogPost): boolean {
  if (post.category === "beginner-guide" || post.category === "gear-guide") {
    return true;
  }
  const haystack = `${post.title} ${post.description}`;
  return GUIDE_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function scorePostForCourse(post: BlogPost, course: Course): number {
  let score = 0;
  if (postMentionsCourse(post, course)) score += 100;
  if (postMatchesCity(post, course)) score += 60;
  if (postMatchesRegion(post, course)) score += 35;
  if (postMatchesCourseTraits(post, course)) score += 25;
  if (isNationalGuidePost(post)) score += 12;
  if (post.date) score += Math.min(5, Number(post.date.slice(0, 4)) - 2020);
  return score;
}

/**
 * 골프장 상세용 관련 블로그.
 * 서울 고정 fallback 없이 코스 연관성 우선.
 */
export function getRelatedBlogPostsForCourse(
  course: Course,
  limit = 4,
  allPosts: BlogPost[] = getAllBlogPosts(),
): BlogPost[] {
  const ranked = allPosts
    .map((post) => ({ post, score: scorePostForCourse(post, course) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.post.date.localeCompare(a.post.date);
    });

  const selected: BlogPost[] = [];
  for (const entry of ranked) {
    if (entry.score <= 0 && selected.length > 0) continue;
    selected.push(entry.post);
    if (selected.length >= limit) break;
  }

  if (selected.length < limit) {
    for (const entry of ranked) {
      if (selected.some((post) => post.slug === entry.post.slug)) continue;
      selected.push(entry.post);
      if (selected.length >= limit) break;
    }
  }

  return selected.slice(0, limit);
}
