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

/** 지역 종속 course-guide 글의 geographic scope (구조화 metadata 보완용 중앙 mapping) */
export type BlogGeographicScope =
  | { type: "national" }
  | { type: "regional"; regions: string[]; cities?: string[] };

/**
 * 19개 글 규모에서 관리 가능한 slug 기반 geographicScope.
 * relatedRegionSlug / blogRegionLabel이 있으면 그쪽을 우선하고,
 * 서울 근교·예산 등 라벨만 있는 글은 여기 mapping으로 다른 권역 fallback을 막는다.
 */
export const BLOG_GEOGRAPHIC_SCOPE_BY_SLUG: Record<string, BlogGeographicScope> = {
  "seoul-beginner-golf-best-5": {
    type: "regional",
    regions: ["서울", "경기"],
    cities: ["서울"],
  },
  "seoul-budget-golf-best-5": {
    type: "regional",
    regions: ["서울", "경기"],
    cities: ["서울"],
  },
  "incheon-golf-top-5": {
    type: "regional",
    regions: ["인천"],
    cities: ["인천"],
  },
  "gapyeong-golf-best-6": {
    type: "regional",
    regions: ["경기"],
    cities: ["가평"],
  },
  "goyang-golf-best-5": {
    type: "regional",
    regions: ["경기"],
    cities: ["고양"],
  },
  "seoul-nine-hole-beginner-golf-top-5": {
    type: "regional",
    regions: ["서울", "경기"],
    cities: ["서울"],
  },
  "seoul-par3-practice-range-top-10": {
    type: "regional",
    regions: ["서울", "경기"],
    cities: ["서울"],
  },
};

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "");
}

function normalizeCity(city: string): string {
  return normalize(city.replace(/(특별시|광역시|특별자치시|시|군|구)$/g, ""));
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

/** 서울 근교 스코프 글과 호환되는 코스 (서울·경기만, 인천·충청 등 제외) */
function isCompatibleWithNearSeoulScope(course: Course): boolean {
  const region = course.region?.trim();
  if (region !== "서울" && region !== "경기") return false;
  return isNearSeoul(course);
}

export function postMentionsCourse(post: BlogPost, course: Course): boolean {
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

function getBlogGeographicScope(post: BlogPost): BlogGeographicScope {
  const mapped = BLOG_GEOGRAPHIC_SCOPE_BY_SLUG[post.slug];
  if (mapped) return mapped;

  if (post.category === "beginner-guide" || post.category === "gear-guide") {
    return { type: "national" };
  }

  const cities: string[] = [];
  const regions: string[] = [];
  if (post.blogRegionLabel?.trim()) {
    const label = post.blogRegionLabel.trim();
    // "서울 근교" 등은 권역으로 취급
    if (label.includes("서울")) {
      regions.push("서울", "경기");
      cities.push("서울");
    } else if (label.includes("인천")) {
      regions.push("인천");
      cities.push("인천");
    } else if (label.includes("가평")) {
      regions.push("경기");
      cities.push("가평");
    } else if (label.includes("고양")) {
      regions.push("경기");
      cities.push("고양");
    } else {
      cities.push(label);
    }
  }

  if (post.relatedRegionSlug) {
    const slugToRegion: Record<string, string> = {
      seoul: "서울",
      gyeonggi: "경기",
      incheon: "인천",
      gangwon: "강원",
      chungcheong: "충청",
      jeolla: "전라",
      gyeongsang: "경상",
      jeju: "제주",
      busan: "부산",
    };
    const region = slugToRegion[post.relatedRegionSlug];
    if (region) regions.push(region);
  }

  if (regions.length > 0 || cities.length > 0) {
    return {
      type: "regional",
      regions: [...new Set(regions)],
      cities: cities.length > 0 ? [...new Set(cities)] : undefined,
    };
  }

  // course-guide인데 지역 신호가 없으면 보수적으로 national 취급하지 않고
  // collection 기반 near-seoul만 지역 스코프로 본다.
  if (post.relatedCollectionSlug?.includes("near-seoul")) {
    return { type: "regional", regions: ["서울", "경기"], cities: ["서울"] };
  }

  if (post.category === "course-guide") {
    // 명시적 지역 없는 course-guide는 다른 권역에 무조건 붙이지 않음
    return { type: "regional", regions: [], cities: [] };
  }

  return { type: "national" };
}

function courseCityNorm(course: Course): string | undefined {
  const city = course.city?.trim();
  if (!city) return undefined;
  const n = normalizeCity(city);
  return n.length >= 2 ? n : undefined;
}

export function postMatchesCity(post: BlogPost, course: Course): boolean {
  const cityNorm = courseCityNorm(course);
  if (!cityNorm) return false;

  const scope = getBlogGeographicScope(post);
  if (scope.type === "regional" && scope.cities?.length) {
    if (scope.cities.some((c) => normalizeCity(c) === cityNorm)) return true;
  }

  if (post.blogRegionLabel && normalize(post.blogRegionLabel).includes(cityNorm)) {
    return true;
  }
  if (normalize(post.title).includes(cityNorm)) return true;
  return false;
}

export function postMatchesRegion(post: BlogPost, course: Course): boolean {
  const region = course.region?.trim();
  if (!region) return false;
  const regionNorm = normalize(region);
  const scope = getBlogGeographicScope(post);

  if (scope.type === "regional" && scope.regions.length > 0) {
    if (scope.regions.some((r) => normalize(r) === regionNorm)) {
      // 경기 권역이어도 시군 전용 글(고양/가평)은 같은 city일 때만 region match로 취급
      if (scope.cities?.length) {
        return postMatchesCity(post, course);
      }
      return true;
    }
  }

  const regionAliases: Record<string, string[]> = {
    경기: ["gyeonggi", "경기"],
    인천: ["incheon", "인천"],
    서울: ["seoul", "서울"],
    충청: ["chungcheong", "충청"],
    강원: ["gangwon", "강원"],
    경상: ["gyeongsang", "경상"],
    전라: ["jeolla", "전라"],
    제주: ["jeju", "제주"],
  };

  const aliases = regionAliases[region] ?? [regionNorm];
  const haystacks = [
    post.relatedRegionSlug ?? "",
    post.blogRegionLabel ?? "",
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

export function postMatchesCourseTraits(post: BlogPost, course: Course): boolean {
  const slug = post.relatedCollectionSlug;
  if (!slug) return false;
  // near-seoul 계열은 지역 스코프이므로 trait-only 점수에 쓰지 않음
  if (slug.includes("near-seoul")) return false;
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

export function isNationalGuidePost(post: BlogPost): boolean {
  const scope = getBlogGeographicScope(post);
  if (scope.type === "national") return true;
  if (post.category === "beginner-guide" || post.category === "gear-guide") {
    return true;
  }
  if (post.category === "course-guide") return false;
  const haystack = `${post.title} ${post.description}`;
  return GUIDE_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

/**
 * 다른 지역 전용 글인지.
 * 직접 코스를 포함한 경우는 지역이 달라도 허용한다.
 */
export function isForeignRegionalPost(post: BlogPost, course: Course): boolean {
  if (postMentionsCourse(post, course)) return false;
  const scope = getBlogGeographicScope(post);
  if (scope.type !== "regional") return false;

  const region = course.region?.trim();
  const cityNorm = courseCityNorm(course);

  if (scope.cities?.length) {
    if (cityNorm && scope.cities.some((c) => normalizeCity(c) === cityNorm)) {
      return false;
    }
    // 서울 근교 스코프 글은 서울·경기 근교 코스에만 허용 (인천·충주 등은 제외)
    const isSeoulScope = scope.cities.some(
      (c) => normalizeCity(c) === "서울",
    );
    if (isSeoulScope && isCompatibleWithNearSeoulScope(course)) {
      return false;
    }
    // 시군 전용 글인데 다른 시군이면 foreign
    return true;
  }

  if (scope.regions.length === 0) {
    // 지역 신호가 비어 있는 regional course-guide → 코스를 직접 언급하지 않으면 제외
    return true;
  }

  if (region && scope.regions.some((r) => normalize(r) === normalize(region))) {
    return false;
  }

  return true;
}

export type RelatedBlogRank = {
  post: BlogPost;
  score: number;
  reasons: string[];
};

export function scorePostForCourse(
  post: BlogPost,
  course: Course,
): RelatedBlogRank {
  const reasons: string[] = [];
  let score = 0;

  if (postMentionsCourse(post, course)) {
    score += 100;
    reasons.push("mentions-course");
  }

  if (isForeignRegionalPost(post, course)) {
    return { post, score: 0, reasons: ["foreign-regional"] };
  }

  if (postMatchesCity(post, course)) {
    score += 60;
    reasons.push("same-city");
  }
  if (postMatchesRegion(post, course)) {
    score += 35;
    reasons.push("same-region");
  }

  // 시군 전용은 아니지만 권역/근교 스코프가 호환되는 글 (예: 서울 근교 ↔ 파주)
  if (score === 0 || (!postMatchesCity(post, course) && !postMatchesRegion(post, course))) {
    const scope = getBlogGeographicScope(post);
    if (scope.type === "regional" && scope.cities?.some((c) => normalizeCity(c) === "서울")) {
      if (isCompatibleWithNearSeoulScope(course)) {
        score += 40;
        reasons.push("near-seoul-scope");
      }
    } else if (
      scope.type === "regional" &&
      scope.regions.length > 0 &&
      !scope.cities?.length &&
      course.region?.trim() &&
      scope.regions.some((r) => normalize(r) === normalize(course.region))
    ) {
      score += 35;
      reasons.push("compatible-region-scope");
    }
  }

  if (postMatchesCourseTraits(post, course)) {
    score += 25;
    reasons.push("traits");
  }
  if (isNationalGuidePost(post)) {
    score += 12;
    reasons.push("national-guide");
  }
  if (score > 0 && post.date) {
    score += Math.min(5, Number(post.date.slice(0, 4)) - 2020);
  }

  return { post, score, reasons };
}

/**
 * 골프장 상세용 관련 블로그.
 * 다른 지역 전용 글로는 개수를 채우지 않는다.
 */
export function getRelatedBlogPostsForCourse(
  course: Course,
  limit = 4,
  allPosts: BlogPost[] = getAllBlogPosts(),
): BlogPost[] {
  const ranked = allPosts
    .map((post) => scorePostForCourse(post, course))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.post.date.localeCompare(a.post.date);
    });

  return ranked.slice(0, limit).map((entry) => entry.post);
}
