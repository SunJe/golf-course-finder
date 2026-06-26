import type { PublicCourse } from "@/lib/publicCourse";
import { resolveCourseRegionSlug } from "@/lib/regionNormalize";
import { hasPrice } from "@/lib/priceFormat";
import type { CollectionSlug } from "@/lib/collectionLanding";

export type GuideLink = {
  href: string;
  label: string;
};

/** FAQ·컬렉션 공통 요금 안내 */
export const PRICE_FAQ_ANSWER =
  "아닙니다. 표시되는 요금은 네이버 예약/홈페이지 참고 요금이며, 실제 요금은 날짜, 시간대, 예약 조건에 따라 달라질 수 있습니다.";

export const REPORT_ISSUE_ANSWER =
  "문의하기 페이지 또는 골프장 상세 페이지의 '정보가 틀렸나요?' 링크로 알려 주시면 검토하겠습니다.";

export const DATA_SOURCE_NOTE =
  "공공 데이터와 자체 정리 데이터를 함께 참고해 정보를 제공합니다.";

const BLOG_GUIDES: Record<string, GuideLink> = {
  "seoul-beginner-golf-best-5": {
    href: "/blog/seoul-beginner-golf-best-5",
    label: "서울 근교 초보자 골프장 추천",
  },
  "seoul-par3-practice-range-top-10": {
    href: "/blog/seoul-par3-practice-range-top-10",
    label: "서울 근교 파3 연습장 추천",
  },
  "seoul-budget-golf-best-5": {
    href: "/blog/seoul-budget-golf-best-5",
    label: "서울 근교 가성비 골프장 추천",
  },
  "incheon-golf-top-5": {
    href: "/blog/incheon-golf-top-5",
    label: "인천 골프장 추천",
  },
  "gapyeong-golf-best-6": {
    href: "/blog/gapyeong-golf-best-6",
    label: "가평 골프장 추천",
  },
  "goyang-golf-best-5": {
    href: "/blog/goyang-golf-best-5",
    label: "고양시 골프장 추천",
  },
  "seoul-nine-hole-beginner-golf-top-5": {
    href: "/blog/seoul-nine-hole-beginner-golf-top-5",
    label: "서울 근교 9홀 골프장 추천",
  },
  "beginner-golf-essentials-checklist": {
    href: "/blog/beginner-golf-essentials-checklist",
    label: "초보 골퍼 라운드 준비물",
  },
  "golf-ball-type-guide": {
    href: "/blog/golf-ball-type-guide",
    label: "골프공 종류별 추천 가이드",
  },
};

const DEFAULT_BLOG_GUIDES: GuideLink[] = [
  BLOG_GUIDES["seoul-beginner-golf-best-5"],
  BLOG_GUIDES["seoul-par3-practice-range-top-10"],
  BLOG_GUIDES["seoul-budget-golf-best-5"],
  BLOG_GUIDES["beginner-golf-essentials-checklist"],
];

const COLLECTION_BLOG_MAP: Partial<Record<CollectionSlug, string[]>> = {
  "near-seoul": [
    "seoul-beginner-golf-best-5",
    "seoul-budget-golf-best-5",
    "seoul-nine-hole-beginner-golf-top-5",
  ],
  "near-seoul-budget": [
    "seoul-budget-golf-best-5",
    "seoul-beginner-golf-best-5",
    "goyang-golf-best-5",
  ],
  "near-seoul-beginner": [
    "seoul-beginner-golf-best-5",
    "seoul-nine-hole-beginner-golf-top-5",
    "beginner-golf-essentials-checklist",
  ],
  "near-seoul-par3": [
    "seoul-par3-practice-range-top-10",
    "seoul-beginner-golf-best-5",
  ],
  "near-seoul-nine-hole": [
    "seoul-nine-hole-beginner-golf-top-5",
    "seoul-beginner-golf-best-5",
  ],
  "near-seoul-baekdori": [
    "seoul-beginner-golf-best-5",
    "seoul-budget-golf-best-5",
  ],
  "near-seoul-public": [
    "seoul-beginner-golf-best-5",
    "seoul-budget-golf-best-5",
  ],
  par3: ["seoul-par3-practice-range-top-10", "seoul-beginner-golf-best-5"],
  beginner: [
    "seoul-beginner-golf-best-5",
    "beginner-golf-essentials-checklist",
    "golf-ball-type-guide",
  ],
  budget: ["seoul-budget-golf-best-5", "goyang-golf-best-5"],
  "nine-hole": [
    "seoul-nine-hole-beginner-golf-top-5",
    "seoul-beginner-golf-best-5",
  ],
};

const REGION_BLOG_MAP: Record<string, string[]> = {
  seoul: [
    "seoul-beginner-golf-best-5",
    "seoul-budget-golf-best-5",
    "seoul-par3-practice-range-top-10",
  ],
  gyeonggi: [
    "gapyeong-golf-best-6",
    "goyang-golf-best-5",
    "seoul-beginner-golf-best-5",
  ],
  incheon: ["incheon-golf-top-5", "seoul-budget-golf-best-5"],
  gangwon: ["gapyeong-golf-best-6", "seoul-budget-golf-best-5"],
};

const COLLECTION_TIPS: Partial<Record<CollectionSlug, string[]>> = {
  "near-seoul-budget": [
    "단순 최저가만 보기보다 이동 거리, 홀 수, 대중제 여부, 예약 가능 시간대를 함께 비교하는 것이 좋습니다.",
    "참고 요금이 있는 골프장 위주로 정리했으며, 실제 요금은 날짜·시간대·예약 조건에 따라 달라질 수 있습니다.",
    "방문 전 골프장 공식 홈페이지나 예약 페이지에서 최신 요금을 확인해 주세요.",
  ],
  "near-seoul": [
    "서울시청 기준 직선 거리와 지역 정보를 함께 보며, 당일 왕복이 가능한 코스를 고르기 쉽습니다.",
    "대중제·회원제, 홀 수, 참고 요금을 상세 페이지에서 비교해 보세요.",
  ],
  par3: [
    "짧은 홀 구성으로 연습·입문·가벼운 라운드에 활용되는 코스가 많습니다.",
    "드라이버 사용 가능 여부와 홀 길이는 골프장마다 다르니 상세 정보를 확인해 주세요.",
  ],
  public: [
    "회원권 없이 이용할 수 있는 대중제·퍼블릭 골프장 위주로 정리했습니다.",
    "운영 형태와 예약 방식은 골프장마다 다를 수 있습니다.",
  ],
  beginner: [
    "홀 수, 운영 형태, 참고 요금을 함께 보며 첫 라운드에 부담이 적은 코스를 골라보세요.",
    "짧은 9홀·파3 코스부터 시작하는 것도 좋은 방법입니다.",
  ],
};

const DEFAULT_COLLECTION_TIPS = [
  "표시된 요금은 참고용이며, 실제 예약·내장 가격은 골프장 공식 채널에서 확인하는 것이 가장 정확합니다.",
  "전화번호, 홈페이지, 지도 링크를 미리 확인해 두면 방문 전 준비가 수월합니다.",
  "GolfMap은 골프장 정보를 비교하기 쉽게 제공하는 서비스이며, 예약은 공식 홈페이지·네이버 예약·지도 서비스를 통해 진행해 주세요.",
];

function slugsToLinks(slugs: string[]): GuideLink[] {
  return slugs
    .map((slug) => BLOG_GUIDES[slug])
    .filter((link): link is GuideLink => Boolean(link));
}

export function getRelatedBlogGuidesForCollection(
  slug: CollectionSlug,
): GuideLink[] {
  const keys = COLLECTION_BLOG_MAP[slug];
  if (keys?.length) return slugsToLinks(keys);
  return DEFAULT_BLOG_GUIDES;
}

export function getRelatedBlogGuidesForRegion(regionSlug: string): GuideLink[] {
  const keys = REGION_BLOG_MAP[regionSlug];
  if (keys?.length) return slugsToLinks(keys);
  return DEFAULT_BLOG_GUIDES;
}

export function getCollectionTips(slug: CollectionSlug): string[] {
  return COLLECTION_TIPS[slug] ?? DEFAULT_COLLECTION_TIPS;
}

export function getCourseInternalLinks(course: PublicCourse): GuideLink[] {
  const regionSlug = resolveCourseRegionSlug(course);
  const links: GuideLink[] = [
    {
      href: `/map?focus=${course.id}`,
      label: "주변 골프장 비교하기",
    },
  ];

  if (regionSlug) {
    links.push({
      href: `/regions/${regionSlug}`,
      label: "같은 지역 골프장 더 보기",
    });
  }

  if (hasPrice(course)) {
    links.push({
      href: "/collections/near-seoul-budget",
      label: "비슷한 요금대 골프장 보기",
    });
  }

  links.push({
    href: "/collections/near-seoul",
    label: "서울 근교 골프장 모아보기",
  });

  const regionKey = regionSlug ?? "gyeonggi";
  const blogSlug = REGION_BLOG_MAP[regionKey]?.[0];
  if (blogSlug && BLOG_GUIDES[blogSlug]) {
    links.push(BLOG_GUIDES[blogSlug]);
  }

  return links;
}

export const COLLECTION_RELATED_LINKS: Partial<
  Record<CollectionSlug, GuideLink[]>
> = {
  "near-seoul-budget": [
    { href: "/collections/near-seoul", label: "서울 근교 골프장 전체" },
    { href: "/collections/near-seoul-public", label: "서울 근교 대중제 골프장" },
    { href: "/collections/beginner", label: "초보자 골프장" },
  ],
  "near-seoul": [
    { href: "/collections/near-seoul-budget", label: "서울 근교 저렴한 골프장" },
    { href: "/collections/near-seoul-beginner", label: "서울 근교 초보자 골프장" },
    { href: "/collections/par3", label: "파3 골프장" },
  ],
  par3: [
    { href: "/collections/near-seoul-par3", label: "서울 근교 파3 골프장" },
    { href: "/collections/beginner", label: "초보자 골프장" },
  ],
};

export function getRelatedCollectionLinks(
  slug: CollectionSlug,
): GuideLink[] {
  return COLLECTION_RELATED_LINKS[slug] ?? [
    { href: "/collections/near-seoul", label: "서울 근교 골프장" },
    { href: "/collections/public", label: "대중제 골프장" },
    { href: "/map", label: "전국 골프장 지도" },
  ];
}

export function getRelatedBlogGuidesFromSlugs(slugs: string[]): GuideLink[] {
  const links = slugsToLinks(slugs);
  return links.length > 0 ? links : DEFAULT_BLOG_GUIDES;
}
