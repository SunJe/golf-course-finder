import { blogThumbnailAlt, blogThumbnailPath } from "@/lib/blogThumbnailRules";
import { VISIT_KOREA_IMAGE_CREDIT } from "@/lib/visitKoreaAttribution";

export type BlogPostCategory = "course-guide" | "gear-guide" | "beginner-guide";

export type BlogPostComparisonTable = {
  caption?: string;
  columns: string[];
  rows: string[][];
};

export type BlogPostSection = {
  heading: string;
  body: string[];
  /** 본문 섹션 상단 이미지 (h2 직전) */
  image?: string;
  imageAlt?: string;
  /** 제품·코스 비교 표 (items 위에 노출) */
  table?: BlogPostComparisonTable;
  items?: {
    title: string;
    description: string;
    /** 카드 하단 '이 코스를 추천하는 이유' 또는 장비 가이드 장점 목록 */
    recommendationReasons?: string[];
    /** 장비 가이드 단점·주의점 */
    cons?: string[];
    /** 장비 카드 이미지 alt */
    imageAlt?: string;
    /** 본문 카드용 이미지 (Visit Korea 등) */
    image?: string;
    /** 두 번째 카드 이미지 (하위 호환) */
    image2?: string;
    /** Visit Korea API 전체 이미지 (가로 스크롤 갤러리) */
    images?: string[];
    /** 예: 출처 : ⓒ한국관광콘텐츠랩 */
    imageCredit?: string;
    /** TourAPI linkedview 등 출처 페이지 */
    imageSourcePage?: string;
    /** 이미지별 출처 페이지 (다를 때) */
    imageSourcePages?: string[];
    /** 이미지별 alt */
    imageAlts?: string[];
    /** Visit Korea 메타 key (courseId 없을 때 이미지 매칭) */
    visitKoreaKey?: string;
    relatedCourseId?: string;
    relatedPostSlug?: string;
    relatedCollectionSlug?: string;
    relatedRegionSlug?: string;
    address?: string;
    phone?: string;
    homepage?: string;
    regionLabel?: string;
    holeCount?: number;
    priceLabel?: string;
    operatingInfo?: string;
    courseType?: string;
    /** 서울시청 기준 직선 거리(km) */
    distanceFromSeoulKm?: number;
  }[];
};

export type BlogPostReference = {
  title: string;
  publisher?: string;
  url?: string;
  checkedAt?: string;
  note?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: BlogPostCategory;
  categoryLabel: string;
  date: string;
  /** blog list / home preview용 1:1 image */
  thumbnail: string;
  thumbnailAlt: string;
  relatedCollectionSlug?: string;
  relatedRegionSlug?: string;
  /** 포스팅 하단 관련 글 */
  relatedPostSlugs?: string[];
  /** 도입부 아래 '빠른 결론' 박스 */
  quickConclusion?: {
    title: string;
    items: string[];
  };
  /** Visit Korea 메타·이미지 폴더 (public/promo-assets/blog/{dir}) */
  visitKoreaMetaDir?: string;
  /** 카드 alt·추천 문구용 지역 라벨 (예: 가평, 인천) */
  blogRegionLabel?: string;
  /** 통계·추천 기준일 (YYYY-MM-DD) */
  dataCheckedAt?: string;
  /** 참고 자료 (가짜 URL 금지 — 확인된 항목만) */
  references?: BlogPostReference[];
  sections: BlogPostSection[];
};

export const HOME_BLOG_SLUGS = [
  "seoul-beginner-golf-best-5",
  "seoul-par3-practice-range-top-10",
  "golf-ball-type-guide",
  "pro-tour-driver-brands-men",
] as const;

const CATEGORY_LABELS: Record<BlogPostCategory, string> = {
  "course-guide": "코스 가이드",
  "gear-guide": "장비 가이드",
  "beginner-guide": "초보 가이드",
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "seoul-beginner-golf-best-5",
    title: "서울 근교 백돌이 골프장 BEST 5",
    description:
      "첫 라운드·입문 단계에 부담을 줄이기 위해 서울에서 이동하기 좋고, 대중제·짧은 홀 구성 등 백돌이에게 비교적 수월한 조건의 골프장 5곳을 정리했습니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-05-12",
    thumbnail: blogThumbnailPath("seoul-beginner-golf-best-5"),
    thumbnailAlt: blogThumbnailAlt("seoul-beginner-golf-best-5"),
    relatedCollectionSlug: "near-seoul-baekdori",
    sections: [
      {
        heading: "서울 근교에서 백돌이가 코스를 고를 때",
        body: [
          "백돌이(100타 전후) 골퍼에게 첫 필드 라운드는 코스 난이도만큼 이동 거리와 라운드 시간, 예약·문의 정보의 명확성이 중요합니다. 서울 시청 기준 80km 이내에서 대중제·퍼블릭 위주로 접근성이 좋은 코스를 골라보면 첫 경험의 부담을 줄일 수 있습니다.",
          "연락처, 홈페이지, 참고 요금 정보를 바탕으로 비교 포인트를 정리했습니다. 아래 목록은 조건별로 살펴볼 만한 후보입니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "필드 라운드가 처음이거나, 스크린·연습장 위주로만 연습해 온 분",
          "18홀 풀코스보다 짧은 라운드로 경험을 쌓고 싶은 분",
          "서울·수도권에서 당일 왕복이 가능한 코스를 찾는 분",
        ],
      },
      {
        heading: "골프장을 고를 때 확인할 기준",
        body: [
          "서울 기준 이동 거리와 대중교통·자가용 접근성",
          "대중제·퍼블릭 등 회원권 없이 이용 가능한 운영 형태",
          "홀 수(9홀·6홀 등 짧은 구성 여부)와 코스 길이",
          "전화번호·홈페이지·참고 요금 등 기본 정보 완성도",
        ],
      },
      {
        heading: "서울 근교 백돌이 친화 골프장 BEST 5",
        body: [
          "아래 5곳은 GolfMap 데이터 기준으로 서울 근교에서 비교해볼 만한 후보입니다. 실제 난이도와 그린피는 시즌·요일·티타임에 따라 달라질 수 있으니 방문 전 공식 채널을 확인해 주세요.",
        ],
        items: [
          {
            title: "파주제이퍼블릭골프클럽",
            description:
              "포스코 계열이 운영하는 6홀 퍼블릭으로, 같은 코스를 두 바퀴 도는 12홀 운영이 특징입니다. 파3 한 홀과 파4 네 홀, 파5 한 홀이 섞여 있어 짧은 라운드이지만 드라이버부터 퍼터까지 실전 클럽을 고르게 써 볼 수 있습니다. 서울 서북부에서 1시간 내 접근이 가능하고 12홀 기준 그린피가 부담 적은 편이라 백돌이 첫 필드 연습용으로 자주 추천됩니다.",
            recommendationReasons: [
              "6홀×2회로 2~3시간 안에 라운드 종료",
              "파5 홀 포함으로 풀스윙 감각 유지",
              "대기업 운영으로 코스·클럽하우스 관리가 안정적",
              "일부 홀에서 북한산 조망 등 짧은 코스치고 경관이 좋음",
            ],
            relatedCourseId: "gc-81becbdb274e",
          },
          {
            title: "올림픽 골프장",
            description:
              "고양시 덕양구에 있는 9홀 대중제 코스입니다. 18홀 풀코스보다 시간과 비용 부담이 적어 백돌이가 필드 매너와 진행 흐름을 익히기 좋습니다. 서울 서북부·일산권에서 당일 이동이 수월하고 홈페이지·연락처 정보가 잘 갖춰져 있어 예약 전 확인이 편합니다. 후기를 보면 그린이 다소 까다롭다는 의견도 있지만, 전체 난이도가 입문자에게 과도하게 어렵지는 않은 편입니다.",
            recommendationReasons: [
              "9홀 단일 라운드로 첫 필드 부담 완화",
              "수도권 서북부 접근성",
              "대중제라 회원권 없이 이용 가능",
              "연락처·홈페이지 등 예약 정보가 명확함",
            ],
            relatedCourseId: "gc-18640b625b94",
          },
          {
            title: "라싸GC",
            description:
              "포천 이동면에 있는 2020년 개장 27홀 퍼블릭 골프장입니다. 마운틴·레이크·밸리 세 코스가 각각 다른 지형 콘셉트로 조성되어 있어, 같은 날에도 코스 분위기를 바꿔 가며 라운드할 수 있습니다. 노캐디 선택이 가능해 캐디피 부담을 줄일 수 있고, 키오스크 셀프 체크인 등 시설이 비교적 현대적입니다. 산악형 코스라 언듈레이션이 있지만 페어웨이 경사는 설계상 완만한 편이라, 9홀 연습 후 한 단계 올라가 보고 싶은 백돌이에게 좋은 다음 코스입니다.",
            recommendationReasons: [
              "노캐디 선택으로 비용 조절",
              "3코스 조합으로 난이도·풍경 선택",
              "포천 산속에서 서울 더위를 피하기 좋음",
              "잔디·그린 관리에 대한 긍정 후기가 꾸준함",
            ],
            relatedCourseId: "gc-81ecacc0ae41",
          },
          {
            title: "남양주CC",
            description:
              "남양주 오남읍에 있는 9홀 대중제 코스입니다. 18홀보다 짧아 첫 라운드 시간·체력 부담을 줄이기 좋고, 서울 동북부·경기 북동부에서 접근성이 좋습니다. GolfMap에 참고 요금이 등록되어 있어 다른 코스와 비용 비교가 수월합니다. 짧은 코스이지만 티샷·어프로치·퍼팅 흐름을 모두 경험할 수 있어 백돌이 실전 연습용으로 자주 검색됩니다.",
            recommendationReasons: [
              "9홀 단일 라운드로 부담 완화",
              "서울 동북·남양주 방향 당일 이동 용이",
              "참고 요금·연락처 정보 비교 수월",
              "18홀 도전 전 필드 감각 익히기 좋음",
            ],
            relatedCourseId: "gc-29fa36946d15",
          },
          {
            title: "서울 근교 백돌이 컬렉션",
            description:
              "GolfMap에서 서울 근교·백돌이 조건으로 필터링한 코스 목록입니다. 아래 후보 외에도 비슷한 조건의 골프장을 더 넓게 비교해 볼 수 있습니다.",
            relatedCollectionSlug: "near-seoul-baekdori",
          },
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "서울 근교 골프장",
            description: "수도권 접근성 기준 전체 목록",
            relatedCollectionSlug: "near-seoul",
          },
          {
            title: "대중제 골프장",
            description: "퍼블릭·대중제 위주로 비교",
            relatedCollectionSlug: "public",
          },
          {
            title: "9홀 골프장",
            description: "짧은 라운드 목적의 코스 모음",
            relatedCollectionSlug: "nine-hole",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "백돌이에게 중요한 것은 무리하지 않는 코스 선택과 충분한 사전 확인입니다. 그린피·티타임·캐디 유무·복장 규정은 코스마다 다르므로, 예약 전 공식 홈페이지와 예약 채널에서 최신 정보를 꼭 확인해 주세요.",
        ],
      },
    ],
    relatedPostSlugs: [
      "first-golf-round-checklist",
      "beginner-golf-essentials-checklist",
      "golf-ball-type-guide",
      "seoul-par3-practice-range-top-10",
    ],
  },
  {
    slug: "seoul-budget-golf-best-5",
    title: "서울 근교 참고 요금이 비교적 낮은 골프장 4곳 비교",
    description:
      "GolfMap에 등록된 참고 최저가·홀 수·서울 기준 거리를 기준으로, 서울 근교에서 비교해볼 만한 대중제 골프장 4곳을 정리했습니다. 6·9·18홀 요금은 같은 조건이 아닙니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-05-05",
    dataCheckedAt: "2026-05-05",
    thumbnail: blogThumbnailPath("seoul-budget-golf-best-5"),
    thumbnailAlt: blogThumbnailAlt("seoul-budget-golf-best-5"),
    relatedCollectionSlug: "near-seoul-budget",
    relatedPostSlugs: [
      "first-golf-round-checklist",
      "golf-ball-type-guide",
      "seoul-beginner-golf-best-5",
      "seoul-par3-practice-range-top-10",
    ],
    quickConclusion: {
      title: "표시 요금 ≠ 최종 결제 금액",
      items: [
        "등록된 참고 최저가는 홀 수·요일·패키지 조건이 서로 다를 수 있습니다",
        "6홀·9홀·18홀 요금을 같은 ‘저렴함’으로 직접 비교하지 마세요",
        "카트비·캐디피는 별도인 경우가 많아 1인 총액으로 확인하세요",
        "실제 예약가는 시즌·티타임·채널에 따라 달라질 수 있습니다",
      ],
    },
    sections: [
      {
        heading: "선정 기준 (GolfMap 데이터)",
        body: [
          "이 글의 후보 4곳은 아래 GolfMap 등록 데이터만으로 골랐습니다. 후기·경관·난이도 같은 주관 평가는 선정 기준에 넣지 않았습니다.",
          "1) 참고 최저가(price_min)가 등록되어 있을 것",
          "2) 서울시청 기준 직선거리 약 80km 이내(near-seoul) 범위",
          "3) 대중제(퍼블릭)로 등록되어 있을 것",
          "4) 홀 수(6·9·18)를 구분해 설명 — 동일 홀 수끼리만 요금 순위를 주장하지 않음",
          "5) 데이터 확인일: 2026-05-05 (이후 예약가는 변동될 수 있음)",
        ],
      },
      {
        heading: "이런 분께 비교용으로 적합합니다",
        body: [
          "첫 필드 전 비용을 줄일 후보를 데이터 기준으로 좁히고 싶은 분",
          "평일·짧은 코스 위주로 당일 이동 가능한 서울 근교 후보를 보는 분",
          "전국 저렴한 골프장 컬렉션에 들어가기 전에 샘플 후보를 보고 싶은 분",
        ],
      },
      {
        heading: "비교해볼 만한 4곳",
        body: [
          "아래는 BEST 순위가 아니라, 등록된 참고 요금·홀 수·위치가 서로 다른 비교 샘플입니다. 주말·성수기에는 요금이 크게 오를 수 있습니다.",
        ],
        items: [
          {
            title: "파주제이퍼블릭골프클럽",
            description:
              "6홀 대중제 코스로, 같은 코스를 반복해 짧게 라운드하는 구조입니다. 18홀 풀코스 요금과 직접 비교하면 안 되며, 시간·체력·비용을 줄인 연습형 라운드 후보로 등록되어 있습니다. 서울 서북부에서 당일 이동이 가능한 편입니다.",
            recommendationReasons: [
              "등록 홀 수 6홀 — 짧은 라운드 후보",
              "대중제로 등록",
              "서울 서북부 접근권에서 비교하기 쉬운 위치",
            ],
            relatedCourseId: "gc-81becbdb274e",
            holeCount: 6,
            courseType: "대중제",
          },
          {
            title: "남양주CC",
            description:
              "9홀 대중제 코스로, 18홀보다 라운드 시간이 짧은 편입니다. 6홀·18홀과 같은 가격 축으로 비교하지 말고, 9홀 일정·이동비용까지 묶어서 보세요. 서울 동북부·남양주권 접근권이 후보로 등록되어 있습니다.",
            recommendationReasons: [
              "등록 홀 수 9홀",
              "대중제로 등록",
              "서울 동북부·남양주권 당일 이동 후보",
            ],
            relatedCourseId: "gc-29fa36946d15",
            holeCount: 9,
            courseType: "대중제",
          },
          {
            title: "골프존카운티 송도",
            description:
              "인천 연수구 18홀 대중제 코스입니다. 등록된 참고 요금 하한이 비교적 낮은 편에 속하지만, 이는 6·9홀 가격과 동일하지 않습니다. 서울 남부·인천권에서 이동 시간을 줄이며 18홀 후보를 볼 때 비교용으로 적합합니다.",
            recommendationReasons: [
              "등록 홀 수 18홀",
              "등록 참고 최저가가 비교 샘플 중 낮은 편",
              "인천·서울 남부 접근권",
            ],
            relatedCourseId: "gc-4005648f63d2",
            holeCount: 18,
            courseType: "대중제",
          },
          {
            title: "일산스프링힐스 컨트리클럽",
            description:
              "고양시 9홀 대중제 코스입니다. 일산·서울 서북부에서 이동 거리가 짧은 편이고 9홀 중심으로 등록되어 있습니다. 예약 전 18홀 운영 방식, 카트비·캐디피 포함 여부는 공식 채널에서 확인하세요.",
            recommendationReasons: [
              "등록 홀 수 9홀",
              "고양·일산권에서 이동 거리가 짧은 편",
              "대중제로 등록",
            ],
            relatedCourseId: "gc-41b5c15f44da",
            holeCount: 9,
            courseType: "대중제",
          },
        ],
      },
      {
        heading: "더 넓은 목록이 필요할 때",
        body: [
          "위 4곳은 대표 샘플입니다. 참고 요금이 등록된 서울 근교 골프장을 가격순으로 더 보려면 아래 컬렉션을 이용하세요.",
        ],
        items: [
          {
            title: "서울 근교 저렴한 골프장 컬렉션",
            description:
              "near-seoul + 참고 최저가 존재 조건으로 정렬·필터링한 목록입니다. 홀 수·요금 조건이 섞여 있으므로 상세 페이지에서 다시 확인하세요.",
            relatedCollectionSlug: "near-seoul-budget",
          },
          {
            title: "저렴한 골프장 전국",
            description: "수도권 외 지역까지 참고 요금이 있는 목록",
            relatedCollectionSlug: "budget",
          },
          {
            title: "대중제 골프장",
            description: "퍼블릭·대중제 위주 목록",
            relatedCollectionSlug: "public",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "GolfMap의 요금은 결제 가격을 보장하지 않는 참고 정보입니다. 최종 예약 전 공식 홈페이지와 예약 사이트에서 홀 수·요일·카트·캐디 조건을 다시 확인해 주세요.",
        ],
      },
    ],
  },
  {
    slug: "incheon-golf-top-5",
    title: "인천 골프장 BEST 6 추천",
    description:
      "인천에서 라운드를 계획하는 분들을 위해 접근성, 코스 분위기, 연락처와 예약 참고 정보를 함께 정리했습니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-06-25",
    thumbnail: blogThumbnailPath("incheon-golf-top-5"),
    thumbnailAlt: blogThumbnailAlt("incheon-golf-top-5"),
    relatedRegionSlug: "incheon",
    visitKoreaMetaDir: "incheon",
    blogRegionLabel: "인천",
    relatedPostSlugs: [
      "seoul-beginner-golf-best-5",
      "seoul-par3-practice-range-top-10",
      "seoul-budget-golf-best-5",
      "beginner-golf-essentials-checklist",
      "golf-ball-type-guide",
    ],
    sections: [
      {
        heading: "인천 골프장을 고를 때",
        body: [
          "인천은 서구·연수구·중구·영종도·강화 등 권역이 넓어, 거주지와 이동 경로에 따라 적합한 코스가 달라집니다. 이번 글에서는 인천을 대표하는 골프장 6곳을 정리했습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "서울 서부·인천·김포 방향에서 라운드 계획을 세우는 분",
          "공항·영종도 일정과 연계해 골프를 고려하는 분",
          "인천 지역 대표 코스를 한 번에 비교하고 싶은 분",
        ],
      },
      {
        heading: "인천 골프장 BEST 6",
        body: [],
        items: [
          {
            title: "인천그랜드CC",
            description:
              "서인천IC 인근 18홀 대중제 코스로, 서울에서 30분대 접근이 가능한 수도권 서부 대표 퍼블릭입니다. 2026년 4월부터 골퍼가 탑승 가능한 승용 카트를 도입해, 예전에는 캐디백만 싣고 걸어 다니던 도보 라운드보다 체력 부담이 크게 줄었습니다. 전 홀 라이트 시설이 있어 일몰 후 야간 라운드도 가능하고, 공공하수 재활용 중수로 조경 용수를 쓰는 친환경 운영으로도 알려져 있습니다.",
            recommendationReasons: [
              "서울·인천 서부에서 30분대 접근 가능",
              "2026년 4월부터 승용 카트 도입으로 라운드 피로 감소",
              "18홀 전 구간 야간 라운드 가능",
              "비교적 플랫한 코스로 백돌이도 부담 적음",
            ],
            relatedCourseId: "gc-60319bf1693c",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "드림파크CC",
            description:
              "인천 서구 매립지 상부에 조성된 36홀 대중제 골프장입니다. 인위적 조경을 최소화하고 매립지 지형을 살린 친환경 코스로, 드림·파크 두 코스가 각각 다른 성격을 갖습니다. 드림코스는 넓은 페어웨이와 완만한 언듈레이션으로 100타 전후 골퍼에게 편하고, 파크코스는 벙커·폰드가 많아 전략 플레이를 즐기기 좋습니다. 인천·서구·김포 거주자 할인이 커 가성비 후기가 많습니다.",
            recommendationReasons: [
              "36홀로 코스 선택 폭이 넓음",
              "평탄한 지형과 넓은 페어웨이",
              "인천·서구·김포 지역주민 할인으로 가격 경쟁력",
              "아시안게임 개최 이력 등 코스 관리 신뢰도",
            ],
            relatedCourseId: "gc-fa86c43067e7",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "베어즈베스트청라GC",
            description:
              "잭 니클라우스가 설계에 참여한 청라 신도시 인근 27홀 대중제 코스입니다. 세계 각지의 시그니처 홀을 엄선해 구성했다는 점에서 ‘명장의 코스’를 경험하고 싶은 골퍼에게 인기가 많습니다. 챔피언십 규격의 긴 홀 구성과 넓은 페어웨이·짧은 홀의 대비가 뚜렷해, 드라이버 샷의 쾌감과 정교한 숏게임을 동시에 요구합니다. 수도권에서 40~50분 내 접근 가능합니다.",
            recommendationReasons: [
              "니클라우스 설계 시그니처 홀",
              "27홀 챔피언십 스케일",
              "청라·서구 생활권 접근성",
              "전략과 거리감을 함께 즐기고 싶은 중급 이상에게 적합",
            ],
            relatedCourseId: "gc-fa55dbc73e9b",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "송도골프클럽",
            description:
              "인천 연수구 송도에 있는 8홀(Par 32) 대중제 코스입니다. 1991년 유원지 매립지를 활용해 조성된 친환경 짧은 코스로, 평일 약 1시간 40분·주말 2시간 내외로 라운드가 끝나 부담이 적습니다. 인천 시민은 신분증 지참 시 할인 요금이 적용되어 지역 거주자에게 특히 가성비가 좋습니다. 18홀은 부담스럽지만 필드 감각을 익히고 싶은 분에게 중간 단계로 적합합니다.",
            recommendationReasons: [
              "8홀·Par 32로 짧은 라운드",
              "송도 생활권 도보·차량 접근 용이",
              "인천 시민 할인",
              "천연잔디 짧은 코스로 입문·연습에 적합",
            ],
            relatedCourseId: "gc-68bd427a4957",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "오렌지듄스 영종골프클럽",
            description:
              "영종도에 위치한 18홀 대중제 코스로, 국내 최초로 송도에 듄스 코스를 선보인 오렌지 골프클럽이 운영하는 해안·모래언덕 지형의 도전적인 코스입니다. 바다와 내륙 사이 모래언덕을 활용해 전략적 공략이 필요하고, 해안 특성상 바람 변수가 큽니다. 인천공항·영종도 일정과 연계해 라운드 계획을 세우기 좋습니다.",
            recommendationReasons: [
              "듄스 코스의 전략적 재미",
              "영종도·공항 인근 위치",
              "해안 뷰와 독특한 지형",
              "실력 향상을 노리는 중급 이상에게 매력적",
            ],
            relatedCourseId: "gc-496303f3c77c",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "잭니클라우스GC코리아",
            description:
              "송도 국제도시에 위치한 18홀 대중제 코스로, 잭 니클라우스 설계와 세계적 대회 개최 이력으로 프리미엄 퍼블릭 이미지가 강합니다. 토너먼트 티 기준 7,400야드가 넘는 장대 코스라 거리와 정확도를 모두 요구하며, 난이도가 비교적 높게 평가됩니다. 코스 공략법을 미리 숙지하고 방문하는 것이 좋다는 후기가 많습니다.",
            recommendationReasons: [
              "세계적 명장 설계 코스",
              "대회 개최 이력으로 코스 퀄리티 신뢰",
              "송도·수도권 남부 접근성",
              "도전적인 라운드를 원하는 실력자에게 적합",
            ],
            relatedCourseId: "gc-3f766167d45e",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "인천 지역 골프장 전체",
            description: "GolfMap 인천 지역 페이지에서 더 많은 코스를 비교할 수 있습니다.",
            relatedRegionSlug: "incheon",
          },
          {
            title: "경기 골프장",
            description: "인천과 인접한 경기 서부·북부 코스",
            relatedRegionSlug: "gyeonggi",
          },
          {
            title: "서울 근교 골프장",
            description: "수도권 전체 접근성 기준",
            relatedCollectionSlug: "near-seoul",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "인천 지역은 해안·섬 코스 특성상 날씨·바람 변수가 클 수 있습니다. 운영 시간, 그린피, 예약 가능 여부는 수시로 변동되므로 방문 전 공식 홈페이지 확인을 권장합니다.",
        ],
      },
    ],
  },
  {
    slug: "gapyeong-golf-best-6",
    title: "가평 골프장 BEST 6 추천",
    description:
      "서울에서 1시간 내외로 닿기 좋은 가평 골프장 6곳의 위치, 홀 수, 참고 요금, 연락처를 비교해 정리했습니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-06-26",
    thumbnail: blogThumbnailPath("gapyeong-golf-best-6"),
    thumbnailAlt: blogThumbnailAlt("gapyeong-golf-best-6"),
    relatedRegionSlug: "gyeonggi",
    visitKoreaMetaDir: "gapyeong",
    blogRegionLabel: "가평",
    relatedPostSlugs: [
      "incheon-golf-top-5",
      "seoul-beginner-golf-best-5",
      "seoul-par3-practice-range-top-10",
      "seoul-budget-golf-best-5",
      "beginner-golf-essentials-checklist",
    ],
    sections: [
      {
        heading: "가평 골프장을 고를 때",
        body: [
          "가평은 북한강·청평호·설악면 일대로 골프장 밀도가 높은 서울 근교 권역입니다. 주말 라운드 계획을 세울 때는 이동 동선, 홀 수, 운영 형태(대중제·회원제)를 함께 비교하는 것이 좋습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "서울·수도권에서 당일 또는 1박 2일 라운드 여행을 계획하는 분",
          "자연 경관이 좋은 코스를 찾는 분",
          "가평 지역 골프장을 한 번에 비교하고 싶은 분",
        ],
      },
      {
        heading: "가평 골프장 BEST 6",
        body: [],
        items: [
          {
            title: "썬힐GC",
            description:
              "가평 조종면 운악산 자락에 있는 36홀 대중제 골프장입니다. 썬·밸리·파인·힐 네 코스로 나뉘어 있어 같은 날에도 코스 분위기를 바꿔 가며 라운드할 수 있고, 썬 9번·파인 4번 홀에는 핑크 샌드 벙커가 있어 색다른 연출로 유명합니다. 구리-포천 고속도로 접근이 좋아 서울에서 1시간 30분 내외 이동이 가능하고, 골프빌리지가 있어 1박 2일 라운드 여행에도 자주 쓰입니다.",
            recommendationReasons: [
              "36홀 4코스로 선택 폭이 넓음",
              "운악산 조망·자연 경관",
              "서울 근교 접근성과 가성비 균형",
              "코스별 난이도 차이로 동반 라운드에 유리",
            ],
            relatedCourseId: "gc-d14f87b6bb30",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "리앤리CC",
            description:
              "가평 조종면 운악청계 인근 27홀 대중제 코스입니다. 운악산 기암괴석과 야생화가 어우러진 자연 친화적 경관이 특징이고, 레이크·하이랜드·스카이 코스로 나뉘어 각 9홀마다 다른 분위기를 줍니다. 썬힐과 인접해 동선을 묶어 비교하기 좋고, 난이도 차이가 있어 초보·중급이 함께 라운드하기에도 무난합니다.",
            recommendationReasons: [
              "운악산 절경 배경",
              "27홀 3코스 다양성",
              "대중제 퍼블릭으로 예약 부담 적음",
              "썬힐과 함께 가평 북부 라운드 계획에 적합",
            ],
            relatedCourseId: "gc-8503021b2f0d",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "베뉴지CC",
            description:
              "가평읍에 있는 27홀 대중제 골프장으로, 365일 마르지 않는 계곡과 샘을 살린 천혜의 지형이 강점입니다. G·HUE·HILL 세 코스가 각각 다른 거리와 난이도를 갖고 있어, 겉보기엔 쉬워 보여도 정교한 샷을 요구하는 홀이 많다는 후기가 있습니다. 가평 시내와 가까워 식사·숙박 동선을 짜기 편합니다.",
            recommendationReasons: [
              "계곡·숲 지형의 자연 친화 코스",
              "27홀로 코스 선택 다양",
              "가평 시내 인접으로 동선 편리",
              "역동적인 홀 구성으로 재미와 도전감",
            ],
            relatedCourseId: "gc-068617149ff3",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "가평 베네스트GC",
            description:
              "가평 상면에 조성된 27홀 골프장으로, 수도권매립지관리공사가 운영합니다. 잭 니클라우스 설계 철학이 반영된 메이플·파인·버치 코스가 사계절 산세와 구름 조망을 함께 즐길 수 있게 배치되어 있습니다. 넓은 페어웨이와 벙커·워터 해저드가 도전 의욕을 불러일으키는 편입니다.",
            recommendationReasons: [
              "니클라우스 설계 3코스",
              "가평 북부 산세·조망",
              "공공 운영 시설 신뢰도",
              "다양한 해저드로 전략 플레이",
            ],
            relatedCourseId: "gc-a8d0095f2145",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "크리스탈밸리CC",
            description:
              "가평 상면 대보간선로 인근 18홀 코스로, 산세와 계곡 지형을 훼손하지 않고 조성한 자연주의 골프장입니다. 홀마다 난이도를 달리한 페어웨이와 워터 해저드, 메디칼 케어·웰빙 식단 등 부대시설 서비스가 강점으로 소개됩니다. 가평 서북부 라운드 후보로 꾸준히 검색됩니다.",
            recommendationReasons: [
              "계곡 지형 활용 코스",
              "홀별 난이도 변화",
              "클럽하우스·스파 등 부대시설",
              "사계절 경관 변화 감상",
            ],
            relatedCourseId: "gc-f0e079a5a368",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "마이다스밸리 청평 골프클럽",
            description:
              "가평 설악면 청평 일대, 북한강 청정 지역에 위치한 18홀 코스입니다. 1~9홀 밸리코스는 자연 지형을 살린 구성이고, 10~18홀 마이다스 코스는 고대 그리스 테마로 연출된 독특한 분위기가 특징입니다. 청평호·설악 인근 자연과 함께 라운드 계획을 세우기 좋습니다.",
            recommendationReasons: [
              "북한강·청평호 경관",
              "밸리·마이다스 2코스 대비",
              "가평 동부 1박 2일 여행과 연계 용이",
              "테마 연출이 돋보이는 후반 코스",
            ],
            relatedCourseId: "gc-14a40331e62c",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "경기 지역 골프장 전체",
            description: "GolfMap 경기 지역 페이지에서 더 많은 코스를 비교할 수 있습니다.",
            relatedRegionSlug: "gyeonggi",
          },
          {
            title: "서울 근교 골프장",
            description: "수도권 접근성 기준 컬렉션",
            relatedCollectionSlug: "near-seoul",
          },
          {
            title: "인천 골프장 BEST 6",
            description: "서울 서부·인천권 라운드 후보",
            relatedRegionSlug: "incheon",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "가평은 주말 교통·날씨 변수가 큰 편입니다. 그린피와 티타임은 수시로 변동되므로 방문 전 공식 홈페이지와 예약 채널에서 최신 정보를 확인하세요.",
        ],
      },
    ],
  },
  {
    slug: "goyang-golf-best-5",
    title: "고양 골프장 5곳 비교: 고양CC, 한양파인CC, 스프링힐스, 123골프클럽, 올림픽CC",
    description:
      "고양시에서 라운드 후보를 좁힐 때 비교할 수 있는 대중제 골프장 5곳의 위치, 등록 홀 수, 예약 전 확인 포인트를 GolfMap 데이터 기준으로 정리했습니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-06-29",
    dataCheckedAt: "2026-06-29",
    thumbnail: "/promo-assets/blog/goyang/goyang-cc.jpg",
    thumbnailAlt: blogThumbnailAlt("goyang-golf-best-5"),
    relatedRegionSlug: "gyeonggi",
    visitKoreaMetaDir: "goyang",
    blogRegionLabel: "고양",
    relatedPostSlugs: [
      "gapyeong-golf-best-6",
      "incheon-golf-top-5",
      "first-golf-round-checklist",
      "seoul-beginner-golf-best-5",
    ],
    quickConclusion: {
      title: "빠른 정리",
      items: [
        "서울 서북권 접근을 우선하면: 고양CC, 한양파인CC",
        "9홀 일정을 원하면: 일산스프링힐스, 한양파인CC",
        "6홀 짧은 일정을 원하면: 123골프클럽",
        "9홀 운영·예약 방식을 함께 보려면: 올림픽CC",
        "고양권은 6·9홀 코스가 많아 18홀 운영 여부와 예약 채널을 꼭 확인하세요",
      ],
    },
    sections: [
      {
        heading: "고양 골프장을 고를 때",
        body: [
          "고양시는 서울 서북권(은평·마포·강서·일산권)에서 당일 이동을 계획하기 쉬운 위치에 있습니다. GolfMap에 등록된 고양권 후보 중에는 6홀·9홀 대중제 코스가 많아, 18홀 정규 라운드와는 일정·요금 조건이 다릅니다.",
          "이 글은 순위(BEST)가 아니라 비교 샘플입니다. 선정에 넣은 객관 항목은 ① 고양시 위치, ② 등록 홀 수, ③ 대중제(퍼블릭) 등록, ④ 공식 홈페이지·연락처 확인 가능 여부입니다. 난이도·잔디·경관 등 주관 평가는 넣지 않았습니다.",
        ],
      },
      {
        heading: "비교해볼 만한 5곳",
        body: [
          "아래 설명은 GolfMap 등록 정보와 공식 안내에서 확인 가능한 사실만 담았습니다. 요금·티타임·야간 운영은 시즌에 따라 달라질 수 있으니 예약 전 공식 채널을 확인하세요.",
        ],
        items: [
          {
            title: "고양CC",
            description:
              "고양시 덕양구에 있는 대중제 골프장입니다. 등록 홀 수는 9홀이며, 공식 홈페이지에서 골프장·연습장 이용 안내를 함께 확인할 수 있습니다. 서울 서북권에서 이동을 줄이며 9홀 일정을 비교할 때 후보가 됩니다.",
            recommendationReasons: [
              "고양시 덕양구 · 대중제 등록",
              "등록 홀 수 9홀",
              "공식 홈페이지에서 연습장 이용 안내 확인 가능",
            ],
            relatedCourseId: "gc-8fbc2ee961a0",
            holeCount: 9,
            courseType: "대중제",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "한양파인CC",
            description:
              "고양시 덕양구의 9홀 대중제 골프장입니다. 공식 홈페이지에 예약·코스·연습장 안내가 구분되어 있어 방문 전 정보 확인이 비교적 쉽습니다. 고양CC와 함께 덕양구권 9홀 후보로 비교하기 좋습니다.",
            recommendationReasons: [
              "등록 홀 수 9홀 · 대중제",
              "공식 홈페이지 예약·코스 안내 구성",
              "고양권 다른 9홀 코스와 비교하기 쉬운 위치",
            ],
            relatedCourseId: "gc-1faa083d0616",
            holeCount: 9,
            courseType: "대중제",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "일산스프링힐스CC",
            description:
              "고양시 덕양구에 있는 9홀 대중제 골프장입니다. 공개 정보 기준 9홀/36파로 안내되며, 공식 홈페이지에서 예약·이용 안내를 확인할 수 있습니다. 일산·서북권에서 9홀 일정을 볼 때 비교 후보입니다.",
            recommendationReasons: [
              "등록 홀 수 9홀 · 대중제",
              "공식 홈페이지 예약 안내 확인 가능",
              "일산·고양 서북권 일정용 비교 후보",
            ],
            relatedCourseId: "gc-41b5c15f44da",
            holeCount: 9,
            courseType: "대중제",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "123골프클럽",
            description:
              "고양시 덕양구 통일로 인근의 6홀 대중제 골프장입니다. 정규 18홀과 다른 짧은 일정용 코스로, 공식 홈페이지에서 6홀 경기 기준 시간과 코스 안내를 확인할 수 있습니다. 홀 수가 적어 연습·단축 라운드 목적과 맞는지 먼저 확인하는 것이 좋습니다.",
            recommendationReasons: [
              "등록 홀 수 6홀 · 대중제",
              "공식 홈페이지에서 6홀 운영 안내 확인 가능",
              "짧은 일정·연습형 라운드 비교용",
            ],
            relatedCourseId: "gc-a80360466b97",
            holeCount: 6,
            courseType: "대중제",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "올림픽CC",
            description:
              "고양시 덕양구 벽제동에 있는 대중제 골프장입니다. 공개 정보 기준 9홀/36파로 안내됩니다. 강북·일산권에서 이동을 고려할 때 9홀 운영·예약 방식을 공식 채널에서 확인한 뒤 다른 고양권 9홀과 비교하면 됩니다.",
            recommendationReasons: [
              "고양 벽제권 · 대중제 등록",
              "공개 정보 기준 9홀 규모",
              "강북·일산권 이동을 고려한 비교 후보",
            ],
            relatedCourseId: "gc-18640b625b94",
            holeCount: 9,
            courseType: "대중제",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
        ],
      },
      {
        heading: "고를 때 보는 객관 기준",
        body: [
          "① 홀 수: 고양권은 6홀·9홀이 많아 원하는 라운드 길이와 맞는지 먼저 확인하세요.",
          "② 위치: 은평·마포·강서·일산권은 이동이 짧은 편이지만, 출퇴근 시간대 체증은 별도입니다.",
          "③ 예약 방식: 홈페이지·전화·조인 등 채널이 다를 수 있으니 첫 방문 전 공식 안내를 확인하세요.",
          "④ 요금 조건: 홀 수·요일·카트·캐디 포함 여부가 다르면 ‘저렴함’을 같은 축으로 비교하지 마세요.",
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "경기 지역 골프장 전체",
            description: "GolfMap 경기 지역 페이지에서 더 많은 코스를 비교할 수 있습니다.",
            relatedRegionSlug: "gyeonggi",
          },
          {
            title: "서울 근교 골프장",
            description: "수도권 접근성 기준 컬렉션",
            relatedCollectionSlug: "near-seoul",
          },
          {
            title: "나인홀 골프장",
            description: "등록 홀 수 9홀 위주 목록",
            relatedCollectionSlug: "nine-hole",
          },
        ],
      },
      {
        heading: "결론",
        body: [
          "고양권은 6·9홀 대중제 코스가 많아 서울 서북권에서 짧은 일정을 짜기 쉬운 편입니다. 고양CC·한양파인CC는 덕양구 9홀 비교 후보, 일산스프링힐스는 9홀 일정 후보, 123골프클럽은 6홀 단축 일정 후보, 올림픽CC는 벽제권 9홀 후보로 구분하면 됩니다.",
          "그린피·티타임·운영 방식은 시즌별로 달라질 수 있으니 방문 전 공식 홈페이지와 예약 채널에서 최신 정보를 확인해 주세요.",
        ],
      },
    ],
  },
  {
    slug: "pocheon-golf-best-7",
    title: "포천 골프장 7곳 비교: 몽베르·아도니스·포레스트힐 등",
    description:
      "포천시 대중제 골프장 7곳의 참고 요금·홀 수·예약 전 확인 사항을 GolfMap 데이터로 비교했습니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-07-09",
    dataCheckedAt: "2026-07-09",
    thumbnail: blogThumbnailPath("pocheon-golf-best-7"),
    thumbnailAlt: blogThumbnailAlt("pocheon-golf-best-7"),
    relatedRegionSlug: "gyeonggi",
    blogRegionLabel: "포천",
    relatedPostSlugs: [
      "gapyeong-golf-best-6",
      "seoul-beginner-golf-best-5",
      "first-golf-round-checklist",
      "beginner-golf-essentials-checklist",
    ],
    quickConclusion: {
      title: "빠른 정리",
      items: [
        "9홀 단축 라운드: 포천아도니스 퍼블릭",
        "18홀 대중제 비교: 몽베르CC(퍼블릭), 샴발라CC",
        "24~27홀 이상: 포레스트힐CC, 포천힐스CC, 필로스GC",
        "36홀 대형 코스: 베어크리크GC",
        "요금 편차가 큰 후보: 포레스트힐CC — 실제 예약 티타임 기준으로 다시 확인",
        "예약 전 공통 확인: 그린피, 카트비, 캐디피, 취소 규정, 2인·3인 가능 여부",
      ],
    },
    sections: [
      {
        heading: "포천 골프장을 고를 때",
        body: [
          "포천은 경기 북부에서 골프장 후보가 많은 지역입니다. 의정부·양주·구리·남양주 쪽에서 북쪽으로 이동해 당일 라운드를 계획하는 경우가 많고, 9홀 단축 라운드부터 18홀, 24홀, 27홀, 36홀 대형 코스까지 선택지가 넓습니다.",
          "이 글은 순위(BEST)가 아니라 비교 샘플입니다. 선정에 넣은 객관 항목은 ① 포천시 위치, ② 등록 홀 수, ③ 대중제(퍼블릭) 등록, ④ 공식 홈페이지·연락처·참고 요금 확인 가능 여부입니다. 난이도·경관·잔디 등 주관 평가는 넣지 않았습니다.",
          "참고 요금은 시기·요일·티타임·예약 채널에 따라 달라질 수 있으므로, 예약 전에는 반드시 각 골프장의 공식 홈페이지나 예약 채널에서 최신 요금과 운영 방식을 확인하세요.",
        ],
      },
      {
        heading: "비교해볼 만한 7곳",
        body: [
          "아래 설명은 GolfMap 등록 정보와 공식 안내에서 확인 가능한 사실만 담았습니다.",
        ],
        table: {
          caption: "포천 골프장 7곳 비교표",
          columns: ["골프장", "홀 수", "운영 형태", "참고 요금", "비교 포인트"],
          rows: [
            ["몽베르CC(퍼블릭)", "18홀", "대중제", "11~22만원", "18홀 대중제 기본 후보"],
            ["포천아도니스 퍼블릭", "9홀", "대중제", "9~13만원", "단축 라운드 후보"],
            ["포레스트힐CC", "24홀", "대중제", "3.9~15.8만원", "요금 범위 확인 필요"],
            ["샴발라CC", "18홀", "대중제", "10~16만원", "18홀 대중제 비교"],
            ["포천힐스CC", "27홀", "대중제", "14~24만원", "27홀 규모 후보"],
            ["필로스GC", "27홀", "대중제", "12~16만원", "27홀 대중제 비교"],
            ["베어크리크GC", "36홀", "대중제", "14~25만원", "36홀 대형 코스"],
          ],
        },
        items: [
          {
            title: "몽베르CC(퍼블릭)",
            description:
              "포천시 영북면 권역의 18홀 대중제 후보입니다. GolfMap 등록 데이터 기준 참고 요금은 11~22만원 범위입니다. 18홀 대중제 코스를 우선 비교하고 싶은 경우 후보에 넣어볼 수 있습니다.",
            recommendationReasons: [
              "18홀 대중제 · 포천 북부권",
              "공식 홈페이지·예약 채널 확인 가능",
              "18홀 대중제 비교의 기준점으로 활용 가능",
            ],
            relatedCourseId: "gc-9d709ff43c33",
            holeCount: 18,
            courseType: "대중제",
            priceLabel: "11~22만원",
          },
          {
            title: "포천아도니스 퍼블릭",
            description:
              "9홀 대중제 코스입니다. GolfMap 등록 데이터 기준 참고 요금은 9~13만원 범위입니다. 긴 18홀 일정보다 짧은 라운드나 단축 일정 후보를 찾는 경우 비교하기 좋은 타입입니다.",
            recommendationReasons: [
              "9홀 · 대중제 등록",
              "공식 페이지에서 퍼블릭 코스 안내 확인 가능",
              "18홀보다 짧은 일정 비교용",
            ],
            relatedCourseId: "gc-e2614722e86e",
            holeCount: 9,
            courseType: "대중제",
            priceLabel: "9~13만원",
          },
          {
            title: "포레스트힐CC",
            description:
              "GolfMap 등록 데이터 기준 24홀 대중제 후보입니다. 참고 요금은 3.9~15.8만원으로 폭이 큰 편입니다. 최저·최고 범위 차이가 큰 코스는 실제 예약 날짜와 시간대에 따라 체감 비용이 크게 달라질 수 있습니다.",
            recommendationReasons: [
              "24홀 규모 · 대중제",
              "참고 요금 범위가 넓어 시간대별 확인 필요",
              "9홀·18홀과 다른 선택지",
            ],
            relatedCourseId: "gc-b7fd5ee009ca",
            holeCount: 24,
            courseType: "대중제",
            priceLabel: "3.9~15.8만원",
          },
          {
            title: "샴발라CC",
            description:
              "포천시 18홀 대중제 후보입니다. GolfMap 등록 데이터 기준 참고 요금은 10~16만원 범위입니다. 몽베르CC와 함께 포천권 18홀 대중제 후보를 비교할 때 함께 볼 수 있습니다.",
            recommendationReasons: [
              "18홀 대중제 · 포천권",
              "공식 홈페이지 예약·요금 안내 확인 가능",
              "18홀 후보 2~3곳 비교용",
            ],
            relatedCourseId: "gc-7c76a7546834",
            holeCount: 18,
            courseType: "대중제",
            priceLabel: "10~16만원",
          },
          {
            title: "포천힐스CC",
            description:
              "27홀 대중제 골프장입니다. GolfMap 등록 데이터 기준 참고 요금은 14~24만원 범위입니다. 같은 지역의 18홀 후보보다 선택지가 넓은 편입니다.",
            recommendationReasons: [
              "27홀 규모 · 대중제",
              "공식 사이트 코스·이용요금 안내 확인 가능",
              "규모 있는 대중제 코스 비교용",
            ],
            relatedCourseId: "gc-564e2ae6067a",
            holeCount: 27,
            courseType: "대중제",
            priceLabel: "14~24만원",
          },
          {
            title: "필로스GC",
            description:
              "GolfMap 등록 데이터 기준 27홀 대중제 후보입니다. 참고 요금은 12~16만원 범위입니다. 포천권에서 27홀 규모 코스를 비교할 때 포천힐스CC와 함께 볼 수 있는 후보입니다.",
            recommendationReasons: [
              "27홀 대중제 · 포천권",
              "공식 홈페이지 실시간 예약·요금 안내 확인 가능",
              "18홀보다 선택지가 많은 코스 비교용",
            ],
            relatedCourseId: "gc-b46ed64b80b6",
            holeCount: 27,
            courseType: "대중제",
            priceLabel: "12~16만원",
          },
          {
            title: "베어크리크GC",
            description:
              "GolfMap 등록 데이터 기준 36홀 대중제 후보입니다. 참고 요금은 14~25만원 범위입니다. 포천에서 36홀 규모의 대형 코스를 찾는 경우 비교 대상에 넣을 수 있습니다.",
            recommendationReasons: [
              "36홀 규모 · 대중제",
              "18홀 후보와 비교 시 코스 폭이 넓음",
              "포천권 대형 코스 비교용",
            ],
            relatedCourseId: "gc-fb0d61e3914d",
            holeCount: 36,
            courseType: "대중제",
            priceLabel: "14~25만원",
          },
        ],
      },
      {
        heading: "고를 때 보는 객관 기준",
        body: [
          "① 홀 수: 9홀·18홀·27홀·36홀은 라운드 시간과 비용 체감이 다릅니다. 짧은 일정이면 9홀, 일반 하루 라운드면 18홀, 선택지를 넓게 보려면 27홀 이상을 먼저 구분하세요.",
          "② 참고 요금: GolfMap 참고 요금은 비교용입니다. 실제 예약 화면에서는 날짜·시간대·요일·시즌에 따라 달라질 수 있으며, 포레스트힐CC처럼 범위가 넓은 경우 실제 예약 가능 티타임 기준으로 다시 확인하세요.",
          "③ 대중제 여부: 같은 브랜드 안에 회원제와 퍼블릭이 함께 있는 경우가 있으므로, 예약하려는 코스가 대중제인지 확인하세요.",
          "④ 캐디피·카트비: 그린피만 보고 예산을 잡으면 실제 비용과 차이가 날 수 있습니다. 카트비·캐디피·취소 수수료까지 예약 전 확인하세요.",
          "⑤ 이동 동선: 포천은 의정부·양주·구리·남양주 쪽에서 접근하기 편한 편입니다. 출발지에 따라 체감 이동 시간이 달라지므로 지도 앱으로 실제 예상 시간을 확인하세요.",
        ],
      },
      {
        heading: "추가로 볼 만한 후보",
        body: [
          "이번 글에서는 제목 숫자와 본문 코스 수를 맞추기 위해 7곳만 핵심 후보로 정리했습니다. GolfMap에는 다른 포천 골프장도 등록되어 있습니다.",
          "라싸GC는 기존 초보자 추천 글에서 이미 다룬 후보이므로 핵심 7곳에서는 제외했습니다. 참밸리CC는 대중제 후보이나 이번 7곳에는 포함하지 않았습니다. 일동레이크 퍼블릭, 푸른솔 포천, 힐마루 포천은 요금 정보 보강 후 별도 비교에 넣는 것이 안전합니다. 회원제 엔트리는 이번 대중제 중심 비교에서 제외했습니다.",
        ],
        items: [
          {
            title: "서울 근교 초보자에게 좋은 골프장",
            description: "라싸GC 등 초보자 후보가 포함된 기존 가이드",
            relatedPostSlug: "seoul-beginner-golf-best-5",
          },
          {
            title: "가평 골프장 BEST 6 추천",
            description: "포천과 인접한 가평권 코스 비교",
            relatedPostSlug: "gapyeong-golf-best-6",
          },
        ],
      },
      {
        heading: "자주 묻는 질문",
        body: [
          "포천 골프장은 초보자가 가기 좋은가요? — 특정 지역보다 코스 운영 방식, 홀 수, 티타임, 동반자 구성이 더 중요합니다. 9홀 후보부터 18홀 이상 후보까지 선택지가 있으므로, 처음이라면 9홀 또는 일정이 단순한 코스부터 확인하는 것이 좋습니다.",
          "9홀 골프장도 첫 라운드 후보가 될 수 있나요? — 가능합니다. 정규 18홀 경험을 원한다면 18홀 코스를, 부담을 낮추고 싶다면 9홀 후보를 볼 수 있습니다.",
          "참고 요금만 보고 예약해도 되나요? — 아니요. 참고 요금은 비교용입니다. 예약 전 공식 홈페이지나 예약 채널에서 최종 금액을 확인해야 합니다.",
          "캐디피와 카트비는 포함인가요? — 골프장마다 다릅니다. 많은 경우 그린피와 별도로 발생할 수 있으므로 예약 전 총 비용을 확인하세요.",
          "포천 골프장을 고를 때 가장 먼저 볼 것은? — 먼저 홀 수를 보세요. 그다음 대중제 여부, 참고 요금, 공식 예약 가능 여부를 함께 보면 됩니다.",
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "경기 지역 골프장 전체",
            description: "GolfMap 경기 지역 페이지에서 더 많은 코스를 비교할 수 있습니다.",
            relatedRegionSlug: "gyeonggi",
          },
          {
            title: "서울 근교 골프장",
            description: "수도권 접근성 기준 컬렉션",
            relatedCollectionSlug: "near-seoul",
          },
          {
            title: "첫 골프장 준비물 체크리스트",
            description: "첫 라운드 전 준비물 확인",
            relatedPostSlug: "first-golf-round-checklist",
          },
        ],
      },
      {
        heading: "결론",
        body: [
          "포천은 경기 북부에서 대중제 골프장 후보가 많은 지역입니다. 9홀 단축 라운드를 원하면 포천아도니스 퍼블릭, 18홀 대중제를 비교하고 싶으면 몽베르CC와 샴발라CC, 27홀 이상 규모를 보고 싶으면 포레스트힐CC·포천힐스CC·필로스GC·베어크리크GC를 함께 보면 좋습니다.",
          "골프장 요금과 운영 방식은 자주 바뀝니다. 실제 예약 전에는 각 골프장의 공식 채널에서 최신 그린피, 카트비, 캐디피, 취소 규정, 예약 가능 시간을 확인하세요.",
        ],
      },
    ],
  },
  {
    slug: "yongin-golf-best-10",
    title: "용인 골프장 10곳 비교: 레이크사이드·한림용인·써닝포인트",
    description:
      "용인 대중제 골프장 10곳을 홀 수, GolfMap 참고 최저가, 위치, 예약 전 확인사항으로 비교했습니다. 18홀 이상 코스와 9홀 라운드 후보를 한눈에 확인하세요.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-07-10",
    dataCheckedAt: "2026-07-10",
    thumbnail: blogThumbnailPath("yongin-golf-best-10"),
    thumbnailAlt: blogThumbnailAlt("yongin-golf-best-10"),
    relatedRegionSlug: "gyeonggi",
    blogRegionLabel: "용인",
    relatedPostSlugs: [
      "pocheon-golf-best-7",
      "seoul-nine-hole-beginner-golf-top-5",
      "seoul-beginner-golf-best-5",
      "first-golf-round-checklist",
    ],
    quickConclusion: {
      title: "빠른 정리",
      items: [
        "36홀: 레이크사이드CC(퍼블릭)",
        "27홀: 한림용인CC, 해솔리아 컨트리클럽, 양지파인골프클럽",
        "18홀: 써닝포인트 컨트리클럽, 세현CC",
        "공식 총 18홀: 용인CC(용인 9홀+석천 9홀)",
        "9홀 중심: 지산퍼블릭, 코리아퍼블릭CC, 블루원용인CC(퍼블릭)",
        "9홀과 18홀 이상 참고 요금은 같은 조건이 아님 — 예약 화면에서 최종 확인",
      ],
    },
    sections: [
      {
        heading: "용인 골프장을 고를 때",
        body: [
          "용인은 서울 남부와 경기 남부에서 함께 비교하는 골프 지역이지만, 같은 용인시 안에서도 기흥구·모현읍·남사읍·이동읍·양지면·원삼면·백암면처럼 위치가 넓게 나뉩니다. 골프장 이름만 보고 고르기보다 출발지에서의 이동 경로, 홀 수, 예약 단위, 참고 요금을 함께 보는 편이 좋습니다.",
          "이 글은 특정 골프장의 순위를 매기거나 한 곳을 일괄 추천하는 글이 아닙니다. GolfMap에 등록된 용인 대중제 골프장 가운데 비교 가치가 있는 10곳을 골라 객관적인 항목으로 정리한 비교 샘플입니다.",
          "아래 금액은 GolfMap에 등록된 참고 최저가입니다. 실제 그린피는 날짜, 시간대, 요일, 예약 채널, 프로모션, 9홀·18홀 이용 단위에 따라 달라집니다. 카트비와 캐디피가 포함되지 않을 수 있으므로 예약 전 공식 홈페이지에서 최종 금액을 확인하세요.",
        ],
      },
      {
        heading: "이번 비교에서 확인한 기준",
        body: [
          "용인시에 위치한 대중제 코스인가",
          "36홀·27홀·18홀·9홀 중 어떤 규모인가",
          "GolfMap에 등록된 참고 최저가는 얼마인가",
          "기흥구와 처인구의 어느 권역에 있는가",
          "9홀 코스의 경우 실제 예약 단위가 9홀인지 18홀인지",
          "공식 홈페이지와 전화번호를 확인할 수 있는가",
        ],
      },
      {
        heading: "비교해볼 만한 10곳",
        body: [
          "표의 금액은 서로 동일한 조건이 아닙니다. 9홀과 18홀 이상 코스는 이용 홀 수와 카트·캐디 운영 방식이 다를 수 있으므로 가격만으로 순위를 정하지 않습니다.",
        ],
        table: {
          caption: "용인 골프장 10곳 비교표",
          columns: ["골프장", "위치", "운영·홀 수", "참고 최저가", "예약 전 확인할 점"],
          rows: [
            ["레이크사이드CC(퍼블릭)", "모현읍", "대중제 36홀", "20만원~", "실제 배정 코스와 최종 요금"],
            ["한림용인CC", "남사읍", "대중제 27홀", "10만원~", "티타임별 그린피와 코스 배정"],
            ["해솔리아 컨트리클럽", "이동읍", "대중제 27홀", "10만원~", "날짜별 요금과 예약 가능 시간"],
            ["양지파인골프클럽", "양지면", "대중제 27홀", "6만원~", "참고 최저가 적용 조건"],
            ["써닝포인트 컨트리클럽", "백암면", "대중제 18홀", "12만원~", "티타임과 요금 구성"],
            ["세현CC", "이동읍", "대중제 18홀", "12만원~", "인접 코스와 이동 경로 비교"],
            ["용인CC", "백암면", "공식 총 18홀", "10만원~", "용인 9홀+석천 9홀 운영 구조"],
            ["지산퍼블릭", "원삼면", "대중제 9홀", "4만원~", "9홀·18홀 예약, 셀프 운영 조건"],
            ["코리아퍼블릭CC", "기흥구", "대중제 9홀", "6만원~", "9홀 이용 단위와 운영 시간"],
            ["블루원용인CC(퍼블릭)", "원삼면", "퍼블릭 동코스 9홀", "15만원~", "18홀 상품의 9홀 2회 운영 여부"],
          ],
        },
        items: [
          {
            title: "레이크사이드CC(퍼블릭)",
            description:
              "처인구 모현읍에 있는 대중제 36홀 코스입니다. 이번 비교 대상 중 홀 수가 가장 많습니다. GolfMap 참고 최저가는 20만원~이며, 같은 시설의 회원제 등록 항목과 혼동하지 않도록 퍼블릭 여부를 예약 단계에서 확인하세요.",
            recommendationReasons: [
              "36홀 규모 · 모현읍",
              "10곳 중 홀 수가 가장 많은 대중제 코스",
              "실제 배정 코스와 최종 요금 확인 필요",
            ],
            relatedCourseId: "gc-e684f84c8fa4",
            holeCount: 36,
            courseType: "대중제",
            priceLabel: "20만원~",
            regionLabel: "모현읍",
          },
          {
            title: "한림용인CC",
            description:
              "처인구 남사읍의 27홀 대중제 코스입니다. GolfMap 참고 최저가는 10만원~입니다. 출발지가 동탄·오산 등 경기 남부라면 처인구 동부권 후보와 실제 차량 경로를 비교할 가치가 있습니다.",
            recommendationReasons: [
              "27홀 · 남사읍",
              "용인 남부권 27홀 대중제",
              "티타임별 그린피와 코스 배정 확인",
            ],
            relatedCourseId: "gc-8b59a320f132",
            holeCount: 27,
            courseType: "대중제",
            priceLabel: "10만원~",
            regionLabel: "남사읍",
          },
          {
            title: "해솔리아 컨트리클럽",
            description:
              "이동읍에 있는 27홀 대중제 코스입니다. GolfMap 참고 최저가는 10만원~입니다. 같은 이동읍의 세현CC와 가까워 날짜별 티타임과 실제 요금을 함께 비교하기 좋습니다.",
            recommendationReasons: [
              "27홀 · 이동읍",
              "세현CC와 같은 권역에서 비교 가능",
              "날짜·시간대별 그린피 확인 필요",
            ],
            relatedCourseId: "gc-f4bb9638f567",
            holeCount: 27,
            courseType: "대중제",
            priceLabel: "10만원~",
            regionLabel: "이동읍",
          },
          {
            title: "양지파인골프클럽",
            description:
              "양지면의 27홀 대중제 코스입니다. GolfMap 참고 최저가는 6만원~로 표시됩니다. 이 값은 특정 날짜나 시간대의 최저 조건일 수 있으므로 일반적인 18홀 비용으로 단정해서는 안 됩니다.",
            recommendationReasons: [
              "27홀 · 양지면",
              "참고 최저가 적용 날짜·홀 수·예약 조건 확인 필요",
              "지산퍼블릭과 인접 권역",
            ],
            relatedCourseId: "gc-897c73dbf41b",
            holeCount: 27,
            courseType: "대중제",
            priceLabel: "6만원~",
            regionLabel: "양지면",
          },
          {
            title: "써닝포인트 컨트리클럽",
            description:
              "백암면의 18홀 대중제 코스입니다. GolfMap 참고 최저가는 12만원~입니다. 27홀 이상 규모보다 단일 18홀 코스를 기준으로 비교하려는 경우 세현CC와 함께 확인할 수 있습니다.",
            recommendationReasons: [
              "18홀 · 백암면",
              "용인CC와 같은 백암권",
              "예약 시간에 따른 실제 요금 확인",
            ],
            relatedCourseId: "gc-c45d3f5d316d",
            holeCount: 18,
            courseType: "대중제",
            priceLabel: "12만원~",
            regionLabel: "백암면",
          },
          {
            title: "세현CC",
            description:
              "이동읍의 18홀 대중제 코스입니다. GolfMap 참고 최저가는 12만원~입니다. 해솔리아 컨트리클럽과 가까운 권역이므로 같은 날짜의 예약 가능 시간과 최종 비용을 나란히 비교할 수 있습니다.",
            recommendationReasons: [
              "18홀 · 이동읍",
              "해솔리아CC와 인접 권역",
              "카트비·캐디피 포함 최종 비용 확인",
            ],
            relatedCourseId: "gc-af63c289d999",
            holeCount: 18,
            courseType: "대중제",
            priceLabel: "12만원~",
            regionLabel: "이동읍",
          },
          {
            title: "용인CC",
            description:
              "백암면의 대중제 코스입니다. GolfMap 개별 상세 페이지에서는 용인CC와 석천코스가 각각 9홀로 분리되어 있으나, 골프장 공식 코스 안내 기준으로는 용인 9홀과 석천 9홀을 합친 총 18홀 퍼블릭 골프장입니다. 이 글에서는 하나의 골프장으로 계산하며, 예약 화면에서 어떤 코스 조합으로 18홀을 이용하는지 확인하세요. GolfMap 참고 최저가는 10만원~입니다.",
            recommendationReasons: [
              "공식 기준 총 18홀(용인 9홀+석천 9홀)",
              "GolfMap에서는 코스가 두 항목으로 분리 등록",
              "9홀 단독 또는 18홀 예약 가능 여부 확인",
            ],
            relatedCourseId: "gc-928514cac4c6",
            courseType: "대중제",
            priceLabel: "10만원~",
            regionLabel: "백암면",
            operatingInfo: "공식 총 18홀(용인 9홀+석천 9홀)",
          },
          {
            title: "지산퍼블릭",
            description:
              "원삼면의 대중제 9홀 코스입니다. 공식 예약 페이지에서 9홀과 18홀 예약을 구분하고, 노캐디·개인카트 셀프 운영 조건을 안내합니다. GolfMap 참고 최저가는 4만원~입니다. 2인·3인 플레이 조건과 날짜별 요금은 변동될 수 있으므로 예약 전 공식 채널을 확인하세요.",
            recommendationReasons: [
              "9홀 · 원삼면",
              "공식 예약 페이지 9홀·18홀 선택 가능",
              "노캐디·개인카트 셀프 운영 안내",
            ],
            relatedCourseId: "gc-4687a4044d34",
            holeCount: 9,
            courseType: "대중제",
            priceLabel: "4만원~",
            regionLabel: "원삼면",
          },
          {
            title: "코리아퍼블릭CC",
            description:
              "기흥구의 9홀 대중제 코스입니다. 이번 10곳 가운데 유일하게 기흥구에 있습니다. GolfMap 참고 최저가는 6만원~입니다. 처인구 동부권까지 이동하지 않고 기흥권에서 후보를 찾는 경우 위치 측면에서 구분하기 쉽습니다.",
            recommendationReasons: [
              "9홀 · 기흥구",
              "10곳 중 유일한 기흥구 소재",
              "운영 시간과 9홀·18홀 이용 단위 확인",
            ],
            relatedCourseId: "gc-4487ee52808c",
            holeCount: 9,
            courseType: "대중제",
            priceLabel: "6만원~",
            regionLabel: "기흥구",
          },
          {
            title: "블루원용인CC(퍼블릭)",
            description:
              "원삼면의 퍼블릭 동코스 9홀입니다. 회원제 코스와 퍼블릭 코스가 함께 등록되어 있으므로 예약할 때 퍼블릭 동코스인지 확인해야 합니다. GolfMap 참고 최저가는 15만원~이며, 이를 9홀 단독 요금으로 단정하지 않습니다. 18홀 상품은 동코스 9홀을 두 차례 이용하는 방식인지 공식 예약 화면에서 확인하세요.",
            recommendationReasons: [
              "퍼블릭 동코스 9홀 · 원삼면",
              "회원제 등록 항목과 구분 필요",
              "참고 요금 적용 홀 수와 포함 항목 확인",
            ],
            relatedCourseId: "gc-2ef4e18d677b",
            holeCount: 9,
            courseType: "대중제",
            priceLabel: "15만원~",
            regionLabel: "원삼면",
          },
        ],
      },
      {
        heading: "목적에 따라 고르는 방법",
        body: [
          "여러 코스 조합을 먼저 보고 싶다면 36홀인 레이크사이드CC 퍼블릭과 27홀인 한림용인CC·해솔리아CC·양지파인GC를 비교할 수 있습니다. 코스 수가 많다고 특정 날짜의 예약이 더 쉽다는 뜻은 아니므로 실제 티타임을 확인해야 합니다.",
          "단일 18홀 대중제를 비교하고 싶다면 써닝포인트CC와 세현CC를 비교하고, 용인CC는 용인·석천 두 9홀 코스를 합친 총 18홀 구조라는 점을 함께 고려하세요.",
          "9홀 또는 셀프 라운드를 찾는다면 지산퍼블릭, 코리아퍼블릭CC, 블루원용인CC 퍼블릭을 확인할 수 있습니다. 표에 표시된 금액을 먼저 볼 수 있지만, 9홀과 18홀 이상은 같은 상품이 아닙니다.",
          "위치를 먼저 고른다면 기흥권은 코리아퍼블릭CC, 모현권은 레이크사이드CC, 남사권은 한림용인CC, 이동권은 해솔리아CC·세현CC, 양지·원삼권은 양지파인GC·지산퍼블릭·블루원용인CC, 백암권은 써닝포인트CC·용인CC입니다. 출발지에 따라 고속도로 진입로와 국도 이동 시간이 달라지므로 예약 전 지도 서비스에서 실제 출발 시간 기준 경로를 확인하세요.",
        ],
        items: [
          {
            title: "서울 근교 9홀 골프장 비교",
            description: "9홀 단축 라운드 후보 비교",
            relatedPostSlug: "seoul-nine-hole-beginner-golf-top-5",
          },
          {
            title: "서울 근교 참고 요금 비교",
            description: "참고 요금 중심 컬렉션",
            relatedCollectionSlug: "near-seoul-budget",
          },
        ],
      },
      {
        heading: "이번 핵심 10곳에서 제외한 용인 골프장",
        body: [
          "용인에는 이번 글에 포함하지 않은 회원제·대중제 골프장이 더 있습니다. 지역형 비교 글의 첫 버전에서는 대중제 여부와 GolfMap 참고 요금, 홀 수를 함께 비교할 수 있는 곳을 우선했습니다.",
          "글렌로스 골프클럽은 GolfMap의 홀 수 표기와 외부 공식 안내 사이에 차이가 있어 핵심 10곳에서 보류했습니다. 태광CC 퍼블릭은 회원제·퍼블릭 구분과 참고 요금의 이용 단위를 다시 확인한 뒤 비교하는 편이 안전합니다. 그 밖의 회원제 코스는 대중제 중심 검색 의도와 달라 이번 목록에서 제외했습니다.",
        ],
      },
      {
        heading: "자주 묻는 질문",
        body: [
          "용인에서 가장 좋은 골프장은 어디인가요? — 한 곳을 일괄적으로 가장 좋다고 정하기는 어렵습니다. 36홀 규모를 원하면 레이크사이드CC 퍼블릭, 27홀 후보를 원하면 한림용인CC·해솔리아CC·양지파인GC, 9홀 중심이라면 지산퍼블릭·코리아퍼블릭CC·블루원용인CC 퍼블릭처럼 목적에 따라 후보가 달라집니다.",
          "용인에 9홀 퍼블릭 골프장이 있나요? — GolfMap 기준으로 지산퍼블릭, 코리아퍼블릭CC, 블루원용인CC 퍼블릭을 비교할 수 있습니다. 용인CC도 GolfMap에서는 코스가 9홀씩 분리되어 있지만 공식 전체 구성은 용인 9홀과 석천 9홀을 합친 18홀입니다.",
          "표의 요금으로 바로 예약할 수 있나요? — 아닙니다. 표의 금액은 GolfMap에 등록된 참고 최저가입니다. 실제 금액은 날짜, 시간대, 인원, 예약 채널, 이용 홀 수에 따라 달라질 수 있으며 카트비와 캐디피가 별도일 수 있습니다.",
          "용인CC는 9홀인가요, 18홀인가요? — 공식 안내 기준으로는 용인 9홀과 석천 9홀을 합친 총 18홀 퍼블릭 골프장입니다. GolfMap에서는 두 코스가 분리 등록되어 있어 개별 상세 페이지에 9홀로 표시됩니다.",
          "서울에서 가까운 용인 골프장은 어디인가요? — 출발 지역에 따라 다릅니다. 모현읍의 레이크사이드CC와 기흥구의 코리아퍼블릭CC는 처인구 동부의 원삼·백암권 코스와 이동 방향이 다릅니다. 고정 분 단위 표현보다 실제 출발 시각을 넣어 지도 경로를 확인하는 것이 정확합니다.",
          "첫 라운드라면 무엇을 추가로 확인해야 하나요? — 그린피 외에 카트비·캐디피, 클럽 대여, 복장 규정, 체크인 시간, 2인·3인 플레이 가능 여부를 확인하세요.",
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "포천 골프장 7곳 비교",
            description: "경기 북부 인접 지역 비교",
            relatedPostSlug: "pocheon-golf-best-7",
          },
          {
            title: "서울 근교 백돌이 골프장",
            description: "서울 근교 입문 후보",
            relatedPostSlug: "seoul-beginner-golf-best-5",
          },
          {
            title: "첫 골프장 준비물 체크리스트",
            description: "첫 라운드 전 준비물",
            relatedPostSlug: "first-golf-round-checklist",
          },
          {
            title: "경기 지역 골프장 전체",
            description: "GolfMap 경기 지역 페이지",
            relatedRegionSlug: "gyeonggi",
          },
          {
            title: "서울 근교 골프장",
            description: "수도권 접근성 기준 컬렉션",
            relatedCollectionSlug: "near-seoul",
          },
        ],
      },
      {
        heading: "결론",
        body: [
          "용인 골프장을 비교할 때는 같은 시 안에 있다는 이유만으로 이동 거리와 요금 조건이 비슷하다고 가정하지 않는 것이 좋습니다. 먼저 36홀·27홀·18홀·9홀 중 원하는 라운드 형태를 정하고, 출발지와 가까운 권역을 좁힌 다음 공식 예약 화면에서 최종 요금을 확인하세요.",
          "이 글의 정보 확인 기준일은 2026년 7월 10일입니다. 골프장 운영 정보와 요금은 변경될 수 있으므로 예약·내장 전 공식 홈페이지나 전화로 최신 내용을 확인하시기 바랍니다.",
        ],
      },
    ],
  },
  {
    slug: "hwaseong-golf-best-7",
    title: "화성 골프장 7곳 비교: 화성상록·리베라·발리오스·라비돌",
    description:
      "화성 골프장 7곳을 홀 수, 회원제·대중제, 위치, 9홀·18홀 예약 방식으로 비교했습니다. 동탄권 36홀 코스와 화성 9홀 퍼블릭 후보를 함께 확인하세요.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-07-11",
    dataCheckedAt: "2026-07-11",
    thumbnail: blogThumbnailPath("hwaseong-golf-best-7"),
    thumbnailAlt: blogThumbnailAlt("hwaseong-golf-best-7"),
    relatedRegionSlug: "gyeonggi",
    blogRegionLabel: "화성",
    relatedPostSlugs: [
      "yongin-golf-best-10",
      "pocheon-golf-best-7",
      "seoul-nine-hole-beginner-golf-top-5",
      "first-golf-round-checklist",
    ],
    quickConclusion: {
      title: "빠른 정리",
      items: [
        "36홀 회원제: 기흥컨트리클럽, 리베라컨트리클럽",
        "27홀 대중제: 화성상록GC",
        "회원제 18홀+대중제 9홀: 발리오스CC (시설 1곳)",
        "9홀 대중제: 화성골프클럽, 라비돌CC, 링크나인골프클럽",
        "동탄권: 화성상록GC, 기흥CC, 리베라CC",
        "서부·남부권: 발리오스CC, 화성골프클럽, 라비돌CC, 링크나인GC",
      ],
    },
    sections: [
      {
        heading: "화성 골프장을 고를 때",
        body: [
          "화성시는 동탄권부터 남양읍·정남면·팔탄면·마도면까지 면적이 넓어, 같은 화성 골프장이라도 이동 방향과 이용 방식이 크게 다릅니다. 동탄권에는 27홀·36홀 규모의 골프장이 모여 있고, 화성 서부와 남부에는 9홀 대중제 코스를 중심으로 비교할 수 있습니다.",
          "이 글은 특정 골프장의 순위를 매기는 글이 아닙니다. GolfMap에 등록된 화성 코스를 시설 기준으로 중복을 제거한 7곳을 홀 수, 회원제·대중제, 위치와 예약 단위로 정리한 비교 샘플입니다.",
          "GolfMap에는 발리오스CC의 회원제 코스와 퍼블릭 남코스가 별도 항목으로 등록되어 있어 8개처럼 보일 수 있습니다. 이 글에서는 같은 시설을 두 곳으로 세지 않고 발리오스CC 한 곳으로 계산합니다.",
          "아래 금액은 공식 홈페이지에서 확인한 기준요금 또는 예약 화면의 참고 정보입니다. 실제 그린피는 월별 탄력요금, 요일, 티타임, 회원 구분, 예약 채널과 9홀·18홀 이용 단위에 따라 달라집니다. 카트비와 캐디피도 별도일 수 있으므로 결제 전 최종 금액을 확인하세요.",
        ],
      },
      {
        heading: "비교해볼 만한 7곳",
        body: [
          "회원제 36홀과 대중제 9홀은 예약 자격과 이용 단위가 다릅니다. 표를 가격 순위로 해석하기보다, 먼저 원하는 라운드 형태와 이동 권역을 정한 뒤 예약 가능 여부를 확인하는 방식이 안전합니다.",
        ],
        table: {
          caption: "화성 골프장 7곳 비교표",
          columns: ["골프장", "권역", "운영·홀 수", "요금·예약 확인 포인트"],
          rows: [
            ["화성상록GC", "동탄권·중동", "대중제 27홀", "일반 기준요금과 월별 탄력요금을 함께 확인"],
            ["기흥컨트리클럽", "동탄권·신동", "회원제 36홀", "회원 구분과 예약 자격, 비회원 이용 조건 확인"],
            ["리베라컨트리클럽", "동탄권·중리", "회원제 36홀", "신안골프 예약 경로와 회원 구분 확인"],
            [
              "발리오스CC",
              "팔탄면",
              "회원제 18홀+대중제 남코스 9홀",
              "예약 상품이 회원제인지 퍼블릭인지, 이용 홀 수 확인",
            ],
            ["화성골프클럽", "남양읍", "대중제 9홀", "9홀·18홀 예약 단위와 조인 조건 확인"],
            ["라비돌CC", "정남면", "대중제 9홀", "주중 9홀, 주말 18홀 기본 등 요일별 예약 방식 확인"],
            ["링크나인골프클럽", "마도면", "대중제 9홀", "공식 요금표에서 9홀과 18홀 비용을 구분해 확인"],
          ],
        },
        items: [
          {
            title: "화성상록GC",
            description:
              "동탄권 중동에 있는 남·동·서코스 총 27홀 대중제 골프장입니다. 2026년 7월 확인 기준 일반인 기준요금은 주중 17만원, 주말·공휴일 22만원으로 안내되지만, 월별 탄력요금과 이벤트가 별도로 적용될 수 있습니다. 실시간·추첨 예약과 실제 배정 코스 조합을 함께 확인하세요.",
            recommendationReasons: [
              "27홀 대중제 · 동탄권",
              "기준요금과 월별 탄력요금 차이 확인",
              "실시간·추첨 예약 방식 확인",
            ],
            relatedCourseId: "gc-4905c6ca9b75",
            holeCount: 27,
            courseType: "대중제",
            priceLabel: "기준 주중 17만원·주말 22만원",
            address: "경기도 화성시 풀무골로60번길 80",
            phone: "031-371-0100",
            homepage: "https://www.sangnokresort.co.kr/M050000",
          },
          {
            title: "기흥컨트리클럽",
            description:
              "동탄권 신동의 동남 18홀·북서 18홀 총 36홀 회원제 골프장입니다. 대중제 코스와 달리 회원 구분과 예약 자격이 우선되므로, 일반 이용자가 공개 최저가만 보고 비교하기에는 적합하지 않습니다.",
            recommendationReasons: [
              "36홀 회원제 · 동탄권",
              "회원·가족회원·비회원 구분 확인",
              "배정 18홀 코스 조합 확인",
            ],
            relatedCourseId: "gc-7701abd77260",
            holeCount: 36,
            courseType: "회원제",
            priceLabel: "공식 예약 확인",
            address: "경기도 화성시 풀무골로106번길 244",
            phone: "031-376-4001",
            homepage: "https://www.ghcc.kr/",
          },
          {
            title: "리베라컨트리클럽",
            description:
              "동탄권 중리의 36홀 회원제 골프장입니다. 골프연습장과 Par3 코스는 36홀 본 코스와 별개의 부대시설로 운영됩니다. 예약 가능 여부와 이용 조건은 신안골프 공식 예약 안내에서 확인하세요.",
            recommendationReasons: [
              "36홀 회원제 · 동탄권",
              "본 코스와 Par3·연습장 부대시설 구분",
              "신안골프 예약 경로 확인",
            ],
            relatedCourseId: "gc-4731f8c98a6d",
            holeCount: 36,
            courseType: "회원제",
            priceLabel: "공식 예약 확인",
            address: "경기도 화성시 중리길 183",
            phone: "031-8047-8000",
            homepage: "https://www.shinan.co.kr/business/golf/rivieracc",
          },
          {
            title: "발리오스CC",
            description:
              "팔탄면 시설로, GolfMap에는 회원제 18홀과 퍼블릭 남코스 9홀이 분리 등록되어 있지만 시설 기준으로는 한 곳(총 27홀 구성)입니다. 이 글의 relatedCourseId는 퍼블릭 대표 항목 1개만 사용합니다. 공식 이용요금안내 기준 비회원제(9홀)는 평일 11만5천원·주말·공휴일 15만원이며, 회원제 18홀 비회원 요금과 혼동하지 않도록 예약 상품의 홀 수를 확인하세요.",
            recommendationReasons: [
              "회원제 18홀+퍼블릭 남코스 9홀 · 팔탄면",
              "시설 1곳으로 계산 (GolfMap 분리 등록 주의)",
              "9홀·18홀·회원 구분별 요금 확인",
            ],
            relatedCourseId: "gc-2db2d6cad688",
            holeCount: 9,
            courseType: "대중제",
            priceLabel: "9홀 11.5~15만원",
            operatingInfo: "회원제 18홀 + 퍼블릭 남코스 9홀 (시설 기준 총 27홀)",
            address: "경기도 화성시 팔탄면 3.1만세로 641-28",
            phone: "031-352-5061",
            homepage: "https://baliosgc.com/",
          },
          {
            title: "화성골프클럽",
            description:
              "남양읍의 9홀 대중제 코스입니다. 9홀 일정과 9홀 코스를 두 번 이용하는 18홀 일정은 비용과 소요시간이 다르므로 예약 화면에서 구분해야 합니다.",
            recommendationReasons: [
              "9홀 대중제 · 남양읍",
              "9홀·18홀 예약 단위 확인",
              "2인·3인 플레이·조인 조건 확인",
            ],
            relatedCourseId: "gc-5ec5b76d3c22",
            holeCount: 9,
            courseType: "대중제",
            priceLabel: "공식 예약 확인",
            address: "경기도 화성시 남양읍 화성로 1393-27",
            phone: "031-369-8900",
            homepage: "https://www.hwaseonggc.com/",
          },
          {
            title: "라비돌CC",
            description:
              "정남면의 9홀 대중제 코스입니다. 공식 예약 안내는 주중 온라인 예약을 9홀 기준으로 받고 18홀 추가는 전화로 확인하도록 안내합니다. 주말 예약은 9홀을 두 번 이용하는 18홀을 기본으로 안내하므로, 요일에 따라 예약 방식이 달라집니다.",
            recommendationReasons: [
              "9홀 대중제 · 정남면",
              "주중 9홀 / 주말 18홀 기본 예약 방식",
              "온라인·전화 예약 차이 확인",
            ],
            relatedCourseId: "gc-ee03e5ddbe9f",
            holeCount: 9,
            courseType: "대중제",
            priceLabel: "공식 예약 확인",
            address: "경기도 화성시 정남면 세자로 286",
            phone: "031-352-4457",
            homepage: "https://www.laviedor.com/la_cc1.asp",
          },
          {
            title: "링크나인골프클럽",
            description:
              "마도면의 9홀 대중제 코스입니다. 공식 요금표에서 9홀과 18홀 이용료를 구분합니다. 2026년 7월 확인 기준 그린피는 9홀 주중 6만5천원·주말 8만원, 18홀 주중 13만원·주말 16만원으로 안내됩니다. 이벤트와 예약 시점에 따라 달라질 수 있으며 캐디피·카트료는 별도입니다.",
            recommendationReasons: [
              "9홀 대중제 · 마도면",
              "공식 요금표에서 9홀·18홀 단위 구분",
              "2인 플레이 추가 조건 확인",
            ],
            relatedCourseId: "gc-c77232b99bd6",
            holeCount: 9,
            courseType: "대중제",
            priceLabel: "9홀 6.5~8만원 · 18홀 13~16만원",
            address: "경기도 화성시 마도면 해운로630번길 49",
            phone: "031-831-0900",
            homepage: "https://www.linknine.co.kr/",
          },
        ],
      },
      {
        heading: "목적별로 좁히는 방법",
        body: [
          "동탄권에서 27홀·36홀 규모를 찾는다면 화성상록GC, 기흥CC, 리베라CC를 먼저 비교할 수 있습니다. 화성상록은 대중제지만 기흥과 리베라는 회원제이므로, 홀 수가 비슷해도 예약 접근성은 같지 않습니다.",
          "공개 예약이 가능한 대중제를 중심으로 본다면 화성상록GC, 화성골프클럽, 라비돌CC, 링크나인GC를 우선 확인하고, 발리오스는 퍼블릭 남코스 예약 상품인지 확인하세요.",
          "9홀 짧은 일정을 찾는다면 화성골프클럽, 라비돌CC, 링크나인GC와 발리오스 퍼블릭 남코스를 확인할 수 있습니다. 다만 일부 예약 상품은 9홀을 두 번 도는 18홀 기준이므로 상품명을 꼭 확인해야 합니다.",
          "가격보다 이동 권역을 먼저 정한다면 동탄권(화성상록·기흥·리베라), 팔탄권(발리오스), 남양권(화성골프클럽), 정남권(라비돌), 마도권(링크나인)으로 나눌 수 있습니다. 화성시는 동서 이동 거리가 길 수 있으므로, 고정된 “서울에서 몇 분” 표현보다 출발 시각을 넣은 지도 경로를 확인하는 편이 정확합니다.",
        ],
        items: [
          {
            title: "서울 근교 9홀 골프장 비교",
            description: "9홀 단축 라운드 후보 비교",
            relatedPostSlug: "seoul-nine-hole-beginner-golf-top-5",
          },
          {
            title: "경기 골프장 전체 보기",
            description: "GolfMap 경기 지역 페이지",
            relatedRegionSlug: "gyeonggi",
          },
          {
            title: "서울 근교 골프장 모음",
            description: "수도권 접근성 기준 컬렉션",
            relatedCollectionSlug: "near-seoul",
          },
        ],
      },
      {
        heading: "자주 묻는 질문",
        body: [
          "화성 골프장은 7곳인가요, 8곳인가요? — GolfMap 항목 수는 발리오스 회원제와 퍼블릭이 분리되어 8개처럼 보일 수 있습니다. 시설 기준으로 중복을 제거하면 이 글의 비교 대상은 7곳입니다.",
          "화성에 9홀 퍼블릭 골프장이 있나요? — 화성골프클럽, 라비돌CC, 링크나인GC와 발리오스 퍼블릭 남코스를 확인할 수 있습니다. 각각 9홀 단독 또는 18홀 상품의 운영 방식이 다릅니다.",
          "동탄 근처 화성 골프장은 어디인가요? — 화성상록GC, 기흥컨트리클럽, 리베라컨트리클럽이 동탄권 후보입니다. 다만 기흥과 리베라는 회원제이므로 예약 조건을 별도로 확인해야 합니다.",
          "회원제 골프장도 일반인이 예약할 수 있나요? — 비회원 이용 가능 여부는 골프장과 예약 시점, 회원 동반 여부 및 제휴 채널에 따라 달라질 수 있습니다. 공개 예약이 항상 가능하다고 단정하지 말고 공식 예약 안내를 확인하세요.",
          "9홀 그린피가 가장 낮은 곳은 어디인가요? — 표시 요금은 날짜와 예약 단위가 다르기 때문에 고정 순위를 매기기 어렵습니다. 9홀 단독 비용뿐 아니라 카트비·캐디피와 2인 추가금까지 합산해 비교해야 합니다.",
          "첫 라운드 전에 무엇을 확인해야 하나요? — 체크인 시간, 복장 규정, 카트비·캐디피, 클럽 대여, 2인·3인 플레이 조건과 취소 규정을 확인하세요.",
        ],
        items: [
          {
            title: "첫 골프장 라운드 준비물",
            description: "첫 라운드 전 준비물 확인",
            relatedPostSlug: "first-golf-round-checklist",
          },
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "용인 골프장 10곳 비교",
            description: "경기 남부 인접 지역 비교",
            relatedPostSlug: "yongin-golf-best-10",
          },
          {
            title: "포천 골프장 7곳 비교",
            description: "경기 북부 지역 비교",
            relatedPostSlug: "pocheon-golf-best-7",
          },
          {
            title: "서울 근교 9홀 골프장 비교",
            description: "9홀 단축 라운드 후보",
            relatedPostSlug: "seoul-nine-hole-beginner-golf-top-5",
          },
          {
            title: "첫 골프장 준비물 체크리스트",
            description: "첫 라운드 전 준비물",
            relatedPostSlug: "first-golf-round-checklist",
          },
          {
            title: "경기 지역 골프장 전체",
            description: "GolfMap 경기 지역 페이지",
            relatedRegionSlug: "gyeonggi",
          },
          {
            title: "서울 근교 골프장",
            description: "수도권 접근성 기준 컬렉션",
            relatedCollectionSlug: "near-seoul",
          },
        ],
      },
      {
        heading: "결론",
        body: [
          "화성 골프장을 고를 때는 먼저 동탄권의 27홀·36홀 코스를 찾는지, 서부·남부권의 9홀 대중제를 찾는지 구분하는 것이 좋습니다. 그다음 회원제·대중제 여부와 9홀·18홀 예약 단위를 확인하고, 공식 예약 화면에서 최종 비용을 비교하세요.",
          "이 글의 정보 확인 기준일은 2026년 7월 11일입니다. 운영 방식과 요금은 변경될 수 있으므로 예약 전 공식 홈페이지나 예약실에서 최신 정보를 확인하시기 바랍니다.",
        ],
      },
    ],
  },
  {
    slug: "seoul-nine-hole-beginner-golf-top-5",
    title: "서울 근교 초보자 추천 9홀 골프장 BEST 5",
    description:
      "정규홀 첫 라운드가 부담스러운 입문 골퍼를 위해 서울 근교에서 접근성이 좋고 6~9홀로 연습 라운드를 하기 좋은 골프장 5곳을 정리했습니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-06-26",
    thumbnail: blogThumbnailPath("seoul-nine-hole-beginner-golf-top-5"),
    thumbnailAlt: blogThumbnailAlt("seoul-nine-hole-beginner-golf-top-5"),
    relatedCollectionSlug: "near-seoul-nine-hole",
    visitKoreaMetaDir: "near-seoul-nine-hole",
    blogRegionLabel: "서울 근교",
    relatedPostSlugs: [
      "seoul-beginner-golf-best-5",
      "seoul-par3-practice-range-top-10",
      "seoul-budget-golf-best-5",
      "beginner-golf-essentials-checklist",
      "golf-ball-type-guide",
    ],
    sections: [
      {
        heading: "서울 근교 9홀 골프장을 고를 때",
        body: [
          "초보자에게 9홀 골프장은 첫 정규 라운드 전 부담을 줄이는 좋은 중간 단계입니다. 18홀보다 시간이 짧고, 비용 부담도 비교적 낮아 필드 매너와 진행 흐름을 익히기 좋습니다.",
          "이번 글에서는 서울·경기권에서 당일 이동하기 좋고, 6홀 또는 9홀 구성으로 연습 라운드에 활용하기 좋은 코스를 중심으로 정리했습니다. 요금과 운영 방식은 시즌·요일·티타임에 따라 달라질 수 있으니 예약 전 공식 채널을 확인해 주세요.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "정규 18홀 라운드 전에 실전 감각을 익히고 싶은 분",
          "드라이버·아이언·퍼팅을 모두 경험할 수 있는 짧은 코스를 찾는 분",
          "서울 근교에서 이동 부담이 적은 6~9홀 코스를 비교하고 싶은 분",
        ],
      },
      {
        heading: "9홀 코스 선택 기준",
        body: [
          "홀 수와 반복 라운드 가능 여부: 6홀은 2바퀴 운영인지, 9홀은 추가 라운드가 가능한지 확인합니다.",
          "드라이버 사용 가능 여부: Par 3 위주인지, 티샷에서 드라이버를 칠 수 있는 홀 구성이 있는지 확인합니다.",
          "서울 접근성: 퇴근 후·주말 오전 라운드라면 이동 시간과 귀가 동선이 중요합니다.",
          "초보 친화도: 코스가 짧아도 그린 난이도나 해저드 배치가 부담스러울 수 있으니 후기를 함께 참고하세요.",
        ],
      },
      {
        heading: "서울 근교 초보자 추천 9홀 골프장 BEST 5",
        body: [
          "서울·경기권에서 6~9홀로 연습 라운드하기 좋은 코스 후보 5곳을 이동 거리, 홀 구성, 참고 요금 기준으로 정리했습니다.",
        ],
        items: [
          {
            title: "코리아퍼블릭CC",
            description:
              "용인 기흥권에 있는 9홀 대중제 코스로, 서울 남부·경기권에서 접근성이 좋습니다. 9홀 코스지만 드라이버를 칠 수 있는 구성이 있어 Par 3보다 실전 라운드 감각을 익히기 좋고, GolfMap 기준 참고 요금도 비교적 낮은 편입니다.",
            relatedCourseId: "gc-4487ee52808c",
          },
          {
            title: "올림픽 골프장",
            description:
              "고양시에 위치한 9홀 대중제 코스입니다. 서울 서북부에서 이동하기 좋고, 첫 9홀 라운드 후보로 검토하기 좋습니다. 그린이 다소 까다롭다는 의견도 있지만 전체 코스 난이도는 입문자가 도전하기 어려운 수준은 아닙니다.",
            relatedCourseId: "gc-18640b625b94",
          },
          {
            title: "파주제이퍼블릭골프클럽",
            description:
              "파주 조리읍에 있는 6홀 대중제 코스로, 2바퀴를 돌며 짧은 실전 라운드를 경험하기 좋습니다. 정규홀에서 머리 올리기 전에 진행 속도, 티샷, 어프로치, 퍼팅 흐름을 익히는 연습 라운드 후보로 추천할 만합니다.",
            relatedCourseId: "gc-81becbdb274e",
          },
          {
            title: "화성골프클럽",
            description:
              "화성 남양읍에 위치한 9홀 대중제 코스입니다. 경기 남부와 서울 남부권에서 접근성이 좋고, 9홀 라운드로 코스 난이도와 필드 흐름을 부담 없이 점검하기 좋습니다. 시즌별 요금과 예약 가능 시간은 공식 홈페이지 확인이 필요합니다.",
            relatedCourseId: "gc-5ec5b76d3c22",
          },
          {
            title: "남양주CC",
            description:
              "남양주 오남읍에 있는 9홀 대중제 코스입니다. 서울 동북부·경기 북동부에서 접근성이 좋아 짧은 라운드를 계획하기 좋습니다. 참고 요금과 홈페이지 정보가 등록되어 있어 예약 전 비교가 수월합니다.",
            relatedCourseId: "gc-29fa36946d15",
          },
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "서울 근교 9홀 골프장",
            description: "수도권 접근성 기준 9홀·짧은 코스 모음",
            relatedCollectionSlug: "near-seoul-nine-hole",
          },
          {
            title: "9홀 골프장 전국",
            description: "짧은 홀 수 코스 전체 비교",
            relatedCollectionSlug: "nine-hole",
          },
          {
            title: "서울 근교 초보자 골프장",
            description: "첫 라운드 후보로 볼 만한 코스",
            relatedCollectionSlug: "near-seoul-beginner",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "9홀 코스는 초보자에게 부담을 줄여 주지만, 짧다고 해서 무조건 쉬운 것은 아닙니다. 첫 라운드 전에는 티오프 시간, 카트·캐디 운영, 복장 규정, 추가 라운드 가능 여부를 공식 홈페이지나 예약 채널에서 확인해 주세요.",
        ],
      },
    ],
  },
  {
    slug: "seoul-par3-practice-range-top-10",
    title: "서울 근교 파3 연습장 총정리",
    description:
      "요금·위치·예약 방법을 기준으로 서울 근교 파3 연습장 10곳을 정리했습니다. 50~90m 안팎의 짧은 홀에서 아이언·웨지·어프로치·퍼팅 감각을 집중적으로 연습하기 좋은 후보입니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-06-26",
    thumbnail: blogThumbnailPath("seoul-par3-practice-range-top-10"),
    thumbnailAlt: blogThumbnailAlt("seoul-par3-practice-range-top-10"),
    relatedCollectionSlug: "near-seoul-par3",
    visitKoreaMetaDir: "near-seoul-par3-practice",
    blogRegionLabel: "서울 근교",
    relatedPostSlugs: [
      "seoul-nine-hole-beginner-golf-top-5",
      "first-golf-round-checklist",
      "golf-ball-type-guide",
      "beginner-golf-essentials-checklist",
    ],
    sections: [
      {
        heading: "서울 근교 파3 연습장이란",
        body: [
          "파3 연습장은 대부분 홀 길이가 50~90m 정도로 짧아, 정규 골프장처럼 드라이버를 마음껏 치는 공간이라기보다 아이언·웨지·어프로치·퍼팅 감각을 집중적으로 잡기 좋은 코스입니다.",
          "많은 시설이 연습장과 연계되어 운영되기 때문에 타석 연습 후 바로 파3 코스에서 어프로치 감각을 익히기 좋습니다. 초보 골퍼는 필드에 나가기 전 실전 분위기를 익히기 좋고, 중급 골퍼는 50~100m 안팎 거리 조절과 그린 주변 숏게임 연습에 활용하기 좋습니다.",
          "아래 요금은 작성 시점 기준이며, 시즌·요일·티타임·프로모션에 따라 달라질 수 있습니다. 예약 전 공식 홈페이지·전화·네이버 예약 채널에서 최신 정보를 확인해 주세요.",
        ],
      },
      {
        heading: "빠른 비교표",
        body: [
          "처음 방문 전에는 홀 수보다 예약 방식, 최소 인원, 클럽 제한을 먼저 확인하는 것이 좋습니다. 아래 표는 방문 후보를 빠르게 줄이기 위한 요약입니다.",
        ],
        table: {
          caption: "서울 근교 파3 연습장 빠른 비교",
          columns: ["시설명", "지역", "홀 수", "주중/주말 요금", "1인 가능 여부", "예약 방식", "특징"],
          rows: [
            ["더스테이힐링파크 링스파3", "가평", "파3", "3만원 / 3.5만원", "확인 필요", "네이버 예약", "리조트 부대시설 연계"],
            ["88CC Par3 골프장", "용인", "9홀", "2.3만원 / 2.8만원", "확인 필요", "홈페이지 문의", "정규 클럽 내 파3"],
            ["분당그린피아 파3", "분당", "파3", "2.2만원 / 2.8만원", "2인 이상", "홈페이지 문의", "서울 남부 접근성"],
            ["남서울 제2연습장 파3", "분당", "9홀", "3.2만원 / 3.8만원", "확인 필요", "홈페이지 예약", "타석 연습장 연계"],
            ["오성골프클럽", "파주", "16홀", "2.5만원 / 3.5만원", "2인 이상", "홈페이지 문의", "타석 추가·사우나 포함"],
            ["루이힐스CC", "양주", "9홀", "2.9만원 / 3.9만원", "확인 필요", "홈페이지 문의", "18홀 추가 가능"],
            ["리베라CC 파3코스", "화성", "9홀", "2만원 / 3만원", "1인 가능", "선착순·키오스크", "혼자 숏게임 연습 가능"],
            ["수원CC PAR3", "용인", "9홀", "2.3만원 / 3만원", "2인 이상", "네이버 예약", "클럽·하프백 규정 있음"],
            ["영재파3골프랜드", "여주", "파3", "3만원 / 3.5만원", "확인 필요", "전화 문의", "종일권 운영"],
            ["남양골프랜드", "화성", "파3", "2.5만원 / 3.5만원", "확인 필요", "전화·현장 접수", "드라이버 가능 롱홀 3개"],
          ],
        },
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "스크린·연습장 위주로 연습해 왔고, 짧은 필드 감각을 익히고 싶은 분",
          "어프로치·퍼팅 위주로 실전 연습을 하고 싶은 분",
          "18홀 라운드 전에 비용·시간 부담을 줄이며 필드 매너를 익히고 싶은 분",
        ],
      },
      {
        heading: "파3 연습장 고를 때 확인할 것",
        body: [
          "홀 길이와 홀 수: 9홀·16홀 등 구성과 드라이버 사용 가능 여부",
          "최소 인원·예약 방식: 2인 이상만 가능한지, 네이버·홈페이지·전화·현장 접수 중 무엇을 쓰는지",
          "연습장 연계: 타석 이용, 종일권, 패키지 상품 유무",
          "이용 규정: 클럽 제한, 하프백 사용, 사우나·식음 제공 여부",
        ],
      },
      {
        heading: "서울 근교 파3 연습장 10곳",
        body: [
          "가평·용인·분당·파주·양주·화성·여주 등 수도권에서 당일 이동이 가능한 파3 연습장을 정리했습니다. GolfMap에 등록된 모 골프장과 연계된 시설은 상세 페이지 링크도 함께 제공합니다.",
        ],
        items: [
          {
            title: "더스테이힐링파크 링스파3",
            description:
              "가평 설악면에 위치한 파3 코스로, 서울에서 당일 이동이 가능한 편입니다. 짧은 홀 구성으로 어프로치·퍼팅 연습에 적합하며, 리조트 부대시설과 함께 이용할 수 있습니다. 네이버 예약으로 주중·주말 티타임을 잡을 수 있습니다.",
            address: "경기 가평군 설악면 위곡리 1056",
            phone: "0507-1420-3900",
            homepage: "https://www.thestayhealingpark.com/active/index",
            regionLabel: "가평",
            priceLabel: "주중 3만원 · 주말 3.5만원",
            operatingInfo: "네이버 예약 가능 · 파3 코스",
          },
          {
            title: "88CC Par3 골프장",
            description:
              "용인 기흥구 88컨트리클럽 내 파3 코스입니다. 수도권 남부에서 접근성이 좋고, 본 클럽 정규 코스와 분리된 짧은 코스로 어프로치 감각을 익히기 좋습니다. 홈페이지에서 파3 코스 안내와 요금을 확인할 수 있습니다.",
            relatedCourseId: "gc-0f218a599984",
            visitKoreaKey: "88cc",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
            address: "경기 용인시 기흥구 석성로521번길 169 88컨트리클럽",
            phone: "031-899-8811",
            homepage: "https://www.88countryclub.co.kr/Course/Par3.aspx",
            regionLabel: "용인",
            holeCount: 9,
            priceLabel: "주중 2.3만원 · 주말 2.8만원",
            operatingInfo: "파3 전용 코스 · 홈페이지 예약/문의",
          },
          {
            title: "분당그린피아 파3",
            description:
              "성남 분당에 위치한 파3 코스로, 서울·분당 생활권에서 접근하기 좋습니다. 2인 이상 플레이 조건이 있으니 동반자와 함께 방문 계획을 세우는 것이 좋습니다. 연습장 시설과 함께 운영되는 경우가 많아 타석 연습과 연계하기 좋습니다.",
            address: "경기 성남시 분당구 새마을로 255 분당그린피아골프",
            phone: "0507-1490-9955",
            homepage: "http://www.bdgreenpia.co.kr/ren_facility/par3_t.php",
            regionLabel: "분당",
            priceLabel: "주중 2.2만원 · 주말 2.8만원",
            operatingInfo: "2인 이상 플레이 · 홈페이지 문의",
          },
          {
            title: "남서울 제2연습장 파3 골프장",
            description:
              "분당 판교 인근 남서울CC 제2연습장에 마련된 파3 코스입니다. 서울 남부·분당권에서 이동하기 좋고, 연습장과 파3가 한곳에 있어 타석 연습 후 바로 필드 감각을 이어가기 좋습니다. 파3 쿠폰(10+1매) 상품도 운영합니다.",
            relatedCourseId: "gc-210de13c89f8",
            visitKoreaKey: "nam-seoul",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
            address: "경기 성남시 분당구 판교원로82번길 51 제2연습장",
            phone: "031-8016-6030",
            homepage: "https://nscc.co.kr/swp/range3?tab=1",
            regionLabel: "분당",
            holeCount: 9,
            priceLabel: "주중 3.2만원 · 주말 3.8만원",
            operatingInfo: "파3 쿠폰 10+1매 32만원 · 홈페이지 예약",
          },
          {
            title: "오성골프클럽",
            description:
              "파주 운정에 위치한 16홀 파3 코스입니다. 2인 이상 플레이가 필요하며, 5,000원 추가 시 타석 30분 연습이 가능합니다. 사우나 서비스가 포함되어 있어 라운드 후 휴식까지 한 번에 해결하기 좋습니다.",
            visitKoreaKey: "osung",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
            address: "경기 파주시 운정4길 221 오성골프클럽",
            phone: "031-949-0300",
            homepage: "https://osung.cc/pay/",
            regionLabel: "파주",
            holeCount: 16,
            priceLabel: "16홀 주중 2.5만원 · 주말 3.5만원",
            operatingInfo: "2인 이상 · 타석 30분 +5,000원 · 사우나 포함",
          },
          {
            title: "루이힐스CC",
            description:
              "양주에 위치한 9홀 파3 코스로, 18홀 추가 라운드도 가능한 시설입니다. 타석 이용 패키지 상품도 판매 중이어서 연습과 라운드를 묶어 이용하기 좋습니다. 요금·패키지 구성은 홈페이지에서 최신 정보를 확인하세요.",
            visitKoreaKey: "lui-hills",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
            address: "경기 양주시 어하고개로 186-54 루이힐스C.C",
            phone: "031-842-0007",
            homepage: "https://www.luihills.com/bbs/content.php?co_id=course_charge",
            regionLabel: "양주",
            holeCount: 9,
            priceLabel: "9홀 주중 2.9만원 · 주말 3.9만원",
            operatingInfo: "18홀 추가 가능 · 타석 패키지 판매",
          },
          {
            title: "리베라CC 파3코스",
            description:
              "화성 동탄 인근 리베라CC 체리동에 위치한 파3 코스입니다. 선착순 입장이며 1인 플레이도 가능해 혼자 연습하기 좋습니다. 프론트 키오스크에서 인도어·파3 예약이 가능합니다.",
            relatedCourseId: "gc-4731f8c98a6d",
            visitKoreaKey: "riviera",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
            address: "경기 화성시 동탄 체리동 리베라CC 파3코스",
            phone: "031-8047-6711",
            homepage: "http://rtc.shinangolf.com/facilities/par3",
            regionLabel: "화성",
            holeCount: 9,
            priceLabel: "주중 2만원 · 주말 3만원",
            operatingInfo: "선착순 · 1인 가능 · 키오스크 예약",
          },
          {
            title: "수원CC PAR3",
            description:
              "용인 기흥구 수원컨트리클럽 내 파3 코스입니다. 네이버 예약 구매가 가능하고 2인 이상 플레이 조건이 있습니다. 클럽은 남성 P·S·퍼터, 여성 9번·P·S·퍼터만 사용 가능하며, 라운딩 시 비치된 하프백을 사용해야 합니다.",
            relatedCourseId: "gc-38b838344176",
            visitKoreaKey: "suwon",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
            address: "경기 용인시 기흥구 중부대로 495-1",
            phone: "031-285-6363",
            homepage: "https://driving-range.suwoncc.co.kr/course/tip",
            regionLabel: "용인",
            holeCount: 9,
            priceLabel: "주중 2.3만원 · 주말 3만원",
            operatingInfo: "네이버 예약 · 2인 이상 · 클럽·하프백 규정 있음",
          },
          {
            title: "영재파3골프랜드",
            description:
              "여주에 위치한 파3 전문 시설입니다. 종일권을 이용하면 오전 8시 30분부터 오후 5시 30분까지 무제한 이용이 가능합니다. 종일권은 전화로 잔여 여부를 먼저 확인하는 것이 좋습니다.",
            address: "경기 여주시 여주남로 343 영재파3골프랜드",
            phone: "031-884-7721",
            regionLabel: "여주",
            priceLabel: "주중 3만원 · 주말 3.5만원",
            operatingInfo: "종일권 주중 5.5만원 · 주말 6.5만원 · 전화 문의",
          },
          {
            title: "남양골프랜드",
            description:
              "화성 남양읍에 위치한 파3 시설로, 220m 이상 롱홀 3개가 있어 드라이버 사용이 가능한 파3 연습장입니다. 예약은 전화 문의 또는 현장 접수 방식이며, 드라이버 연습과 숏게임을 함께 하고 싶은 분에게 적합합니다.",
            address: "경기 화성시 만세구 남양읍 샘실길 100 남양골프랜드",
            phone: "031-355-4400",
            regionLabel: "화성",
            priceLabel: "주중 2.5만원 · 주말 3.5만원",
            operatingInfo: "전화·현장 접수 · 드라이버 사용 가능 롱홀 3개",
          },
        ],
      },
      {
        heading: "파3 이용 전 체크리스트",
        body: [
          "1인 플레이가 가능한지, 최소 2인 이상인지 먼저 확인하세요. 파3는 시설마다 운영 방식이 달라 혼자 방문했다가 이용이 어려울 수 있습니다.",
          "드라이버 사용 가능 여부와 클럽 제한을 확인하세요. 일부 시설은 웨지·퍼터만 허용하거나 비치된 하프백 사용을 요구합니다.",
          "현장 선착순인지 예약제인지 확인하세요. 네이버 예약, 홈페이지 예약, 전화 문의, 키오스크 접수 등 방식이 제각각입니다.",
          "처음 가는 시설은 요금표만 보지 말고 주차, 사우나 포함 여부, 타석 연습 패키지까지 함께 확인하면 실제 만족도가 높아집니다.",
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "서울 근교 Par 3 골프장",
            description: "짧은 코스·Par 3 성격 필드 목록",
            relatedCollectionSlug: "near-seoul-par3",
          },
          {
            title: "서울 근교 9홀 골프장",
            description: "9홀·짧은 라운드 코스 비교",
            relatedCollectionSlug: "near-seoul-nine-hole",
          },
          {
            title: "서울 근교 초보자 골프장",
            description: "입문 단계 필드 후보",
            relatedCollectionSlug: "near-seoul-beginner",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "파3 연습장은 정규 라운드보다 짧고 저렴하지만, 시설마다 최소 인원·클럽 규정·예약 방식이 다릅니다. 방문 전 요금과 운영 시간, 예약 가능 여부를 꼭 확인하고, 처음 방문하는 시설은 전화로 한 번 더 확인하면 실패 확률을 줄일 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "golf-ball-type-guide",
    title: "골프공 종류별 추천 가이드 — 유형·브랜드·가격",
    description:
      "소프트볼·비거리형·3피스·컬러볼·프리미엄 우레탄까지 골프공 유형 5가지를 브랜드 예시·추천 대상·참고 가격과 함께 정리했습니다. 로스트볼 사용 시 주의점도 마지막에 다룹니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-24",
    thumbnail: blogThumbnailPath("golf-ball-type-guide"),
    thumbnailAlt: blogThumbnailAlt("golf-ball-type-guide"),
    relatedPostSlugs: [
      "pro-tour-driver-brands-men",
      "pro-tour-driver-brands-women",
      "beginner-iron-top-5",
    ],
    sections: [
      {
        heading: "골프공을 유형별로 고르는 이유",
        body: [
          "입문 단계에서 Pro V1 같은 투어 볼을 무조건 쓰는 것보다, 스윙 속도·분실률·예산에 맞는 유형을 고르는 편이 실용적입니다. 헤드 스피드 80mph(약 36m/s) 전후의 초보는 저압축 소프트볼이, 90mph(약 40m/s) 이상으로 스윙이 잡히면 3피스·우레탄볼을 검토하는 흐름이 일반적입니다.",
          "아래는 2025~2026년 국내에서 흔히 구하는 브랜드·모델 예시입니다. 가격은 1더즌(12개) 기준이며 판매처·프로모션에 따라 달라질 수 있습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "첫 골프공을 사려는데 모델명이 너무 많아 헷갈리는 분",
          "소프트볼·비거리볼·3피스 차이를 알고 본인 스윙에 맞게 고르고 싶은 분",
          "로스트볼·리커버리볼이 싸 보이지만 실제로 써도 되는지 궁금한 분",
        ],
      },
      {
        heading: "구매 전에 알아둘 기준",
        body: [
          "컴프레션(압축도): 스윙이 느린 편(드라이버 80~85mph·약 36~38m/s)이면 저압축, 빠른 편(95mph+·약 42.5m/s+)이면 중·고압축이 맞는 경우가 많습니다.",
          "피스 수·커버: 2피스+서린 커버는 내구·가격 유리, 3피스는 비거리·숏게임 균형, 4피스 우레탄은 스핀·그린 컨트롤에 강점이 있습니다.",
          "분실률: 초보는 라운드당 3~6개 이상 잃기도 하므로, 처음엔 2~3만 원대 1더즌이 현실적입니다.",
          "색상: 옐로·오렌지 컬러볼은 러프·낙엽에서 찾기 쉬워 분실 비용을 줄여 줍니다.",
        ],
      },
      {
        heading: "골프공 유형 BEST 5",
        body: [
          "유형별 대표 브랜드·모델·참고 가격을 정리했습니다. 가격과 재고는 변동될 수 있습니다.",
        ],
        items: [
          {
            title: "1. 저압축 소프트볼 (2피스)",
            description:
              "가장 많이 추천되는 입문 유형입니다. 임팩트 시 잘 눌렸다가 튀어 올라, 스윙 속도가 70~85mph(약 31~38m/s)인 여성·시니어·초보에게 비거리를 내기 쉽습니다. 연습장·첫 필드 라운드·분실이 잦은 단계에 적합합니다. 대표 모델: 캘러웨이 Supersoft(약 2.7~3.3만 원/더즌), 타이틀리스트 TruFeel(약 3.4만 원/더즌), 스릭슨 Soft Feel(약 3~3.5만 원/더즌·24구 묶음 가성비), 테일러메이드 Noodle Long & Soft(약 2.5~3만 원/더즌).",
            image: "/promo-assets/blog/golf-ball/soft.jpg",
            imageAlt: "저압축 소프트 골프공",
            recommendationReasons: [
              "타구감이 부드러워 아이언·웨지에서도 손목 부담이 적음",
              "서린 커버로 내구성이 좋고 가격 대비 라운드 수가 많음",
              "스윙 속도가 아직 일정하지 않을 때 방향·거리 편차를 줄이는 데 도움",
            ],
            cons: [
              "스윙 스피드가 90mph(약 40m/s) 이상으로 올라가면 비거리·스핀 효율이 떨어질 수 있음",
              "그린에서 멈추는 스핀은 3피스·우레탄볼보다 약한 편",
              "프리미엄볼 대비 샷 느낌이 ‘가볍다’고 느끼는 중급자도 있음",
            ],
          },
          {
            title: "2. 비거리형 디스턴스볼 (2피스)",
            description:
              "롱게임 직진성·비거리를 우선하는 유형입니다. 스핀을 낮춰 훅·슬라이스 편차를 줄이려는 초보, 티샷이 자주 휘는 분에게 무난합니다. 드라이버 스피드 85~95mph(약 38~42.5m/s) 구간에서 체감되는 경우가 많습니다. 대표 모델: 타이틀리스트 Velocity(약 3.4~4만 원/더즌), 테일러메이드 Distance+(약 2.5~3.2만 원/더즌), 브리지스톤 e6·e12 Contact(약 3.5~4.5만 원/더즌), 캘러웨이 Warbird(약 2.5~3만 원/더즌).",
            image: "/promo-assets/blog/golf-ball/distance.jpg",
            imageAlt: "비거리형 골프공",
            recommendationReasons: [
              "티샷에서 볼 스피드·캐리 거리를 확보하기 쉬운 설계",
              "저스핀 성향으로 좌우 편차가 큰 스윙을 다소 보완",
              "소프트볼과 비슷한 가격대로 입문·연습에 부담이 적음",
            ],
            cons: [
              "웨지·어프로치에서 그린에 ‘세워 두기’가 어려울 수 있음",
              "단단한 타구감을 선호하는 골퍼에게는 Supersoft·TruFeel이 더 맞을 수 있음",
              "코스가 짧거나 어프로치 비중이 큰 라운드에는 3피스가 유리할 수 있음",
            ],
          },
          {
            title: "3. 3피스 밸런스형 (입문~중급)",
            description:
              "비거리와 숏게임 컨트롤의 균형을 노린 유형입니다. 스윙이 85~95mph(약 38~42.5m/s)대로 잡히고, 그린 공략 감각을 키우고 싶을 때 업그레이드 후보로 많이 고릅니다. 대표 모델: 타이틀리스트 Tour Soft(약 5.3만 원/더즌), 캘러웨이 ERC Soft·Chrome Soft Lite(약 4.3~5.5만 원/더즌), 스릭슨 Q-Star·Q-Star Tour(약 4~5만 원/더즌), 브리지스톤 Tour B RXS(약 5만 원대/더즌).",
            image: "/promo-assets/blog/golf-ball/three-piece.jpg",
            imageAlt: "3피스 골프공",
            recommendationReasons: [
              "티샷 비거리와 그린 주변 스핀을 동시에 신경 쓸 수 있음",
              "2피스 소프트볼보다 일관된 탄도·스핀으로 스코어 관리에 유리",
              "중급으로 넘어가는 단계에서 ‘한 단계 올린’ 체감이 분명한 편",
            ],
            cons: [
              "2피스 입문볼보다 1더즌당 1~2만 원 이상 비싼 경우가 많음",
              "분실이 잦으면 비용 부담이 커짐",
              "스윙 속도가 80mph(약 36m/s) 미만이면 압축이 맞지 않아 거리 손실이 날 수 있음",
            ],
          },
          {
            title: "4. 컬러볼 (시인성·로스트 방지)",
            description:
              "스펙은 위 유형과 동일하지만 옐로·오렌지·핑크 등 밝은 색상으로 출시된 모델입니다. 잔디·낙엽·러프에서 공을 찾는 시간을 줄여 라운드 템포를 지키는 데 실질적으로 도움이 됩니다. 초보·동반 라운드 모두 추천됩니다. 대표 모델: 볼빅 Vivid·Vivid Lite(약 2.5~3.5만 원/더즌), 캘러웨이 Supersoft 옐로(약 2.7~3.3만 원/더즌), 브리지스톤 e6 옐로·오렌지, 스릭슨 Soft Feel 브라이트. 동일 모델의 화이트와 가격 차이는 보통 크지 않습니다.",
            image: "/promo-assets/blog/golf-ball/color.jpg",
            imageAlt: "컬러 골프공",
            recommendationReasons: [
              "시인성이 좋아 분실·OB 시 공을 찾을 확률이 높아짐",
              "퍼팅 라인 정렬에 도움이 되는 트리플 트랙(ERC Soft 등) 모델도 있음",
              "화이트볼과 동일 스펙을 고르면 성능 차이 없이 색만 선택 가능",
            ],
            cons: [
              "그린 위에서 화이트볼보다 눈에 덜 띌 수 있어 퍼팅 시 선호가 갈림",
              "일부 대회·동호회에서 화이트만 허용하는 경우가 있음(사전 확인 필요)",
              "색상만 보고 스펙을 놓치면 본인 스윙에 안 맞는 볼을 살 수 있음",
            ],
          },
          {
            title: "5. 프리미엄 우레탄볼 (4피스·투어급)",
            description:
              "스코어를 본격적으로 줄이는 단계에서 검토하는 유형입니다. 우레탄 커버로 웨지 스핀·그린 컨트롤이 뛰어나고, 드라이버 스피드 95mph(약 42.5m/s) 이상·핸디캡 15 이하 골퍼에게 흔히 추천됩니다. PGA·LPGA에서 가장 많이 쓰이는 카테고리이나, 초보에게는 분실 비용이 큽니다. 대표 모델: 타이틀리스트 Pro V1·Pro V1x(약 6.5~7.5만 원/더즌), 캘러웨이 Chrome Tour·Chrome Tour X(약 6~7만 원/더즌), 테일러메이드 TP5·TP5x(약 6~7만 원/더즌), 스릭슨 Z-STAR·Z-STAR XV(약 5.5~6.5만 원/더즌).",
            image: "/promo-assets/blog/golf-ball/urethane.jpg",
            imageAlt: "프리미엄 우레탄 골프공",
            recommendationReasons: [
              "어프로치·웨지에서 스핀이 높아 그린에서 공을 세우기 쉬움",
              "일관된 탄도·스핀으로 거리 감각·코스 공략이 안정됨",
              "스윙이 일정해진 뒤 스코어 향상 체감이 큰 편",
            ],
            cons: [
              "가격이 높아 분실 1개당 부담이 큼(1개당 5,000~7,000원+)",
              "커버가 부드러워 트리·캐트트랙에 스치면 스크래치가 잘 남",
              "스윙 속도가 낮으면 압축이 맞지 않아 오히려 비거리·스핀이 불리할 수 있음",
            ],
          },
        ],
      },
      {
        heading: "로스트볼·리커버리볼, 왜 조심해야 할까",
        body: [
          "로스트볼은 ‘싸게 많이’ 살 수 있어 입문자에게 인기가 있지만, 실전 라운드용으로는 단점이 분명합니다. 아래는 매체·제조사 테스트에서 자주 언급되는 내용을 정리한 것입니다.",
          "가품·리피니시(재도색) 위험: 겉이 깨끗해도 페인트를 덧칠한 공은 딤플 형태·무게 중심이 달라져 같은 스윙인데도 방향·거리·스핀이 들쭉날쭉해질 수 있습니다. 정품 Pro V1과 리피니시 의심 볼을 비교한 테스트에서는 캐리·토털 비거리 손실과 스핀 편차가 크게 나타난 사례가 보고되었습니다.",
          "성능·수명 저하: 타이틀리스트가 공개한 비교 자료 기준, 로스트볼은 신품 대비 평균적으로 비거리 약 14%, 스핀 약 22% 감소가 관측됐다는 분석이 있습니다(개별 공 상태에 따라 더 나쁠 수 있음). 해저드·우천에 노출된 공은 코어가 경화되거나 수분이 스며들 수 있어, 겉모습만으로는 판단이 어렵습니다.",
          "일관성 부족: 로스트볼은 ‘어디서 얼마나 쓰였는지’ 알 수 없습니다. A급·민트급이라 해도 로트마다 편차가 크고, 웨지 스핀·그린에서의 구름 거리가 라운드마다 달라지면 거리 감각을 익히는 데 오히려 방해가 됩니다.",
          "언제 쓸 만한가: 동호회 스코어가 아닌 연습 라운드, OB가 잦은 코스에서 ‘막 치는’ 용도, 또는 분실 부담을 줄이기 위한 보조 공으로는 선택지가 될 수 있습니다. 다만 ‘싸서 이득’보다 ‘같은 스윙인데 결과가 달라지는’ 손해가 더 클 수 있으니, 본격적으로 스코어를 줄이려면 2~3만 원대 신품 2피스를 쓰는 편이 낫다는 의견이 많습니다.",
        ],
      },
      {
        heading: "마무리",
        body: [
          "입문에는 Supersoft·TruFeel 같은 소프트볼, 티샷 편차가 크면 Velocity·Distance+, 스윙이 잡히면 Tour Soft·Q-Star, 분실이 걱정되면 컬러볼, 스코어 관리 단계에서 Pro V1·TP5를 검토하는 흐름이 무난합니다. 로스트볼은 가격은 싸지만 진품 여부·수명·일관성 리스크가 있으니 신중히 선택하세요. 가격과 재고는 변동될 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "pro-tour-driver-brands-men",
    title: "프로들이 쓰는 드라이버, 초보자에게도 좋을까? 남자편",
    description:
      "PGA 투어에서 자주 보이는 드라이버 브랜드의 성향을 초보자 관점에서 해석합니다. 정확한 점유율 숫자는 원문을 확인하고, 구매는 피팅·로프트·샤프트부터 보세요.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-20",
    dataCheckedAt: "2026-06-20",
    thumbnail: blogThumbnailPath("pro-tour-driver-brands-men"),
    thumbnailAlt: blogThumbnailAlt("pro-tour-driver-brands-men"),
    relatedPostSlugs: [
      "beginner-driver-men",
      "driver-loft-shaft-guide-men",
      "golf-ball-type-guide",
      "beginner-iron-men",
    ],
    references: [
      {
        title: "투어 WITB / 장비 사용 현황 (시즌별 변동)",
        publisher: "공개 WITB·장비 집계 매체",
        checkedAt: "2026-06-20",
        note: "점유율·순위는 시즌·집계 대상에 따라 달라집니다. 아래 본문의 %는 확정 수치가 아니며, 구매 전 최신 원문을 확인하세요.",
      },
    ],
    quickConclusion: {
      title: "프로 장비를 그대로 따라 사면 안 되는 이유",
      items: [
        "스폰서·계약: 프로의 사용 브랜드는 성능뿐 아니라 계약 관계의 영향을 받을 수 있습니다",
        "피팅 전제: 투어 헤드는 로프트·샤프트·무게추를 선수 스윙에 맞춰 세밀하게 조정합니다",
        "스윙스피드 차이: 저스핀 투어 모델은 초보자가 쓰면 공이 뜨지 않거나 슬라이스가 커질 수 있습니다",
        "초보자 기준: 프로 장비는 브랜드 성향을 참고하고, 실제 구매는 관용성·로프트·샤프트부터 확인하세요",
      ],
    },
    sections: [
      {
        heading: "왜 프로 드라이버를 볼까",
        body: [
          "PGA 투어에서는 드라이버 선택이 스코어에 영향을 줍니다. 공개된 WITB·장비 집계를 보면 타이틀리스트·PING·캘러웨이·테일러메이드가 상위권에 자주 등장하고, 스릭슨도 꾸준히 언급됩니다. 다만 시즌·집계 대상에 따라 비중이 달라지므로, 특정 %를 ‘확정 순위’로 보지 않는 것이 좋습니다.",
          "아래는 특정 모델 구매 권유가 아니라, 투어에서 자주 보이는 브랜드별 성향을 이해하고 본인 스윙·예산에 맞는 선택을 돕기 위한 가이드입니다. 초보자는 저스핀 투어 헤드보다 관용성이 높은 Max 계열부터 비교하는 편이 안전합니다. 선수 장비는 시즌 중에도 바뀔 수 있습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "드라이버 업그레이드를 고민하지만 브랜드·모델이 너무 많아 헷갈리는 분",
          "투어에서 실제로 쓰이는 클럽의 성향이 궁금한 아마추어·중급 골퍼",
          "비거리·방향성·관용성 중 무엇을 우선할지 기준을 잡고 싶은 분",
        ],
      },
      {
        heading: "투어에서 자주 보이는 드라이버 브랜드 5곳",
        body: [
          "자료 확인 기준일: 2026-06-20. 아래 설명은 공개 WITB·장비 집계에서 자주 언급되는 브랜드 성향을 요약한 것이며, 정확한 점유율·순위는 최신 원문을 확인하세요. 가격과 재고는 변동될 수 있습니다.",
        ],
        items: [
          {
            title: "1. 타이틀리스트 (Titleist)",
            description:
              "투어 WITB에서 자주 보이는 브랜드입니다. 대표적으로 GT3(컴팩트·저스핀)와 GT2(관용·비거리 균형) 라인이 언급되며, 저스핀 헤드는 정밀한 CG 배치가 강조됩니다. 선수 사용 예시는 시즌마다 바뀔 수 있습니다.",
            image: "/promo-assets/blog/pro-driver/titleist.jpg",
            imageAlt: "타이틀리스트 드라이버 헤드",
            recommendationReasons: [
              "저스핀·중저스핀 헤드와 SureFit 조절 폭이 넓음",
              "투어에서 자주 언급되는 방향성·스핀 컨트롤 성향",
              "이전 세대(TSR 등) 중고 시장의 선택지도 있음",
            ],
            cons: [
              "신형 GT 시리즈는 가격대가 높은 편",
              "저스핀 모델은 스윙 스피드가 낮으면 관용성이 떨어질 수 있음",
              "초보에게는 Max 계열 관용 헤드가 더 맞는 경우가 많음",
            ],
          },
          {
            title: "2. PING",
            description:
              "투어에서 타이틀리스트와 함께 자주 언급되는 브랜드입니다. G440 LST·G440 Max, 이전 G430 세대가 WITB에 함께 보입니다. 항공역학·높은 MOI 설계로 미스 히트 시 거리 유지 성향이 강조됩니다.",
            image: "/promo-assets/blog/pro-driver/ping.jpg",
            imageAlt: "PING 드라이버",
            recommendationReasons: [
              "넓은 페이스·높은 MOI로 방향성·관용성 균형에 강점",
              "LST는 스핀·탄도 조절을 중시하는 선수에게 언급됨",
              "브랜드 신뢰도와 시인성(트림) 평가가 높은 편",
            ],
            cons: [
              "헤드 사운드·필이 ‘딱딱하다’고 느끼는 골퍼도 있음",
              "Max 계열은 비거리 극대화보다 안정 쪽에 치우칠 수 있음",
              "일부 모델은 국내 재고·핏팅 샤프트 옵션이 제한적일 수 있음",
            ],
          },
          {
            title: "3. 캘러웨이 (Callaway)",
            description:
              "투어 라인업에서 Paradym Ai Smoke Triple Diamond·Quantum 시리즈가 자주 언급됩니다. AI 페이스·볼 스피드 설계가 강조되며, 로프트·웨이트 조절로 드로우·페이드 바이어스 세팅이 가능합니다.",
            image: "/promo-assets/blog/pro-driver/callaway.jpg",
            imageAlt: "캘러웨이 드라이버",
            recommendationReasons: [
              "투어형 TD·Quantum 계열의 비거리 효율이 강조됨",
              "로프트·웨이트 조절 폭이 넓음",
              "Elyte·Paradym 등 관용형·투어형 선택지가 나뉨",
            ],
            cons: [
              "저스핀 TD 모델은 스윙 궤도가 불안정하면 훅이 나기 쉬움",
              "모델·서브라인이 많아 구매 전 시타가 필요",
              "프리미엄 라인 가격이 높고 출시 주기가 빠른 편",
            ],
          },
          {
            title: "4. 테일러메이드 (TaylorMade)",
            description:
              "메이저 우승자 등 유명 선수의 WITB에 자주 등장해 ‘빅 네임’ 이미지가 강합니다. Qi 시리즈(LS·Max 등)가 최근 시즌 주력으로 언급되며, 투어형과 아마추어용 라인이 구분되어 있습니다.",
            image: "/promo-assets/blog/pro-driver/taylormade.jpg",
            imageAlt: "테일러메이드 드라이버",
            recommendationReasons: [
              "카본 크라운·저중심 등 비거리 지향 설계가 강조됨",
              "투어 LS와 Max·Lite 등 아마추어 라인 분리가 명확",
              "국내 핏팅·시타 접근성이 비교적 좋은 편",
            ],
            cons: [
              "집계 시점에 따라 다른 브랜드보다 비중이 낮게 나올 수 있음",
              "LS 모델은 스윙이 맞지 않으면 방향성이 흔들릴 수 있음",
              "모델·헤드커버 교체가 빨라 중고 식별에 주의가 필요",
            ],
          },
          {
            title: "5. 스릭슨 (Srixon)",
            description:
              "빅4 다음으로 WITB에서 꾸준히 언급되는 브랜드입니다. ZXi·ZXi LS가 투어 모델로 소개되며, 아이언·웨지와 함께 풀백을 맞출 때 필 감 통일을 노리는 선택지로 거론됩니다.",
            image: "/promo-assets/blog/pro-driver/srixon.jpg",
            imageAlt: "스릭슨 드라이버",
            recommendationReasons: [
              "ZXi LS는 저스핀·컴팩트 헤드 선호에 맞추기 쉬운 편",
              "아이언과의 브랜드 통일 구성에 유리",
              "빅4 대비 프로모션·가격 경쟁력이 생길 때가 있음",
            ],
            cons: [
              "투어 비중이 낮아 지역별 핏팅·시타 매장이 적을 수 있음",
              "비거리 마케팅 이미지는 캘러웨이·테일러메이드보다 약한 편",
              "중고 매매 시 가격 형성이 불안정할 수 있음",
            ],
          },
        ],
      },
      {
        heading: "아마추어가 참고할 선택 팁",
        body: [
          "투어 프로는 저로프트·강한 샤프트를 쓰는 경우가 많습니다. 아마추어는 더 높은 로프트·R 샤프트가 방향성에 유리한 경우가 많습니다.",
          "투어형 저스핀 헤드는 스윙 스피드가 충분히 빠를 때 장점이 드러나는 편입니다. 속도가 낮다면 Max·관용 계열을 우선 시타해 보세요.",
          "브랜드보다 샤프트 플렉스·로프트·헤드 용량이 맞는지가 더 중요합니다. 가능하면 프로샵 핏팅 후 결정하세요.",
        ],
      },
      {
        heading: "마무리",
        body: [
          "투어에서 자주 보이는 브랜드는 타이틀리스트·PING·캘러웨이·테일러메이드·스릭슨 등입니다. 정확한 점유율은 시즌마다 달라지므로 원문 집계를 확인하고, 초보자는 관용성·로프트·샤프트부터 맞추는 것이 안전합니다. 여자편 LPGA 브랜드 비교는 관련 글을 참고하세요.",
        ],
      },
    ],
  },
  {
    slug: "pro-tour-driver-brands-women",
    title: "프로들이 쓰는 드라이버, 여자 초보자에게도 맞을까?",
    description:
      "LPGA 투어에서 많이 보이는 드라이버 브랜드를 여성 초보자 관점에서 정리했습니다. 프로가 참고하는 포인트와 입문자가 피해야 할 스펙을 함께 봅니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-22",
    dataCheckedAt: "2026-06-22",
    thumbnail: blogThumbnailPath("pro-tour-driver-brands-women"),
    thumbnailAlt: blogThumbnailAlt("pro-tour-driver-brands-women"),
    relatedPostSlugs: [
      "beginner-driver-women",
      "driver-loft-shaft-guide-women",
      "beginner-iron-women",
      "golf-ball-type-guide",
    ],
    references: [
      {
        title: "LPGA WITB / 시즌 장비·승수 집계 (시즌별 변동)",
        publisher: "공개 WITB·장비 집계 매체",
        checkedAt: "2026-06-22",
        note: "승수·비중은 시즌·집계 방식에 따라 달라집니다. 본문의 수치는 확정이 아니며 최신 원문을 확인하세요.",
      },
    ],
    quickConclusion: {
      title: "LPGA 선수 장비를 볼 때 주의할 점",
      items: [
        "피팅 영향: 선수 장비는 로프트·샤프트·헤드 무게를 본인 스윙에 맞춰 조정한 결과입니다",
        "스폰서 영향: 브랜드 선택에는 계약과 지원 환경도 작용할 수 있습니다",
        "스윙스피드 차이: 여성 초보자는 프로용 저스핀·강한 샤프트보다 공이 잘 뜨는 조합이 먼저입니다",
        "구매 기준: 브랜드보다 L/A/R 샤프트, 로프트, 총중량, 탄도를 먼저 확인하세요",
      ],
    },
    sections: [
      {
        heading: "LPGA 드라이버 시장은 어떻게 다를까",
        body: [
          "LPGA 투어는 한 브랜드 독점 흐름이 PGA보다 약한 편으로 보이며, 캘러웨이·타이틀리스트·테일러메이드·PING·스릭슨이 함께 언급되는 경우가 많습니다. 시즌 드라이버 승수·WITB 비중은 집계마다 달라지므로 특정 숫자를 고정 순위로 보지 마세요.",
          "여자 프로는 관용성 있는 Max·고로프트·가벼운 샤프트 조합이 자주 보이지만, 이 역시 선수별 피팅 결과입니다. 여성 초보자는 브랜드를 그대로 따르기보다 공이 뜨는지, 샤프트가 버거운지, 슬라이스가 커지는지를 먼저 보세요. 선수 장비는 시즌 중에도 바뀔 수 있습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "여성·시니어 골퍼가 드라이버를 처음 맞추거나 교체하려는 경우",
          "LPGA 선수 장비의 성향을 참고해 비거리와 방향성의 균형을 잡고 싶은 분",
          "남자편 투어 브랜드 글과 비교하며 본인에게 맞는 브랜드를 고르고 싶은 분",
        ],
      },
      {
        heading: "LPGA에서 자주 보이는 드라이버 브랜드 5곳",
        body: [
          "자료 확인 기준일: 2026-06-22. 공개 WITB·시즌 장비 집계에서 자주 언급되는 브랜드 성향을 요약한 글입니다. 정확한 승수·점유율은 최신 원문을 확인하세요. 가격과 재고는 변동될 수 있습니다.",
        ],
        items: [
          {
            title: "1. 캘러웨이 (Callaway)",
            description:
              "LPGA WITB에서 자주 보이는 브랜드입니다. Paradym Triple Diamond·Elyte·Quantum 라인이 언급되며, 관용형 Max와 저스핀 TD 계열로 선택지가 나뉩니다. 특정 시즌 승수 1위 기록은 원문 집계를 확인하세요.",
            image: "/promo-assets/blog/pro-driver/callaway-women.jpg",
            imageAlt: "캘러웨이 여성 투어 드라이버",
            recommendationReasons: [
              "Elyte Max 등 관용·비거리 균형 모델이 LPGA에서 자주 언급됨",
              "Triple Diamond는 스핀·샷 쉐이프 컨트롤 성향",
              "퍼터·아이언과 풀백 구성 시 브랜드 통일 피팅이 가능",
            ],
            cons: [
              "모델명이 많아 구매 전 시타가 필수",
              "TD·Quantum 등 저스핀 모델은 훅 위험이 커질 수 있음",
              "프리미엄 라인 가격이 높음",
            ],
          },
          {
            title: "2. 타이틀리스트 (Titleist)",
            description:
              "프로 V1 볼과 함께 GT2·GT3·TSR 드라이버가 LPGA WITB에 꾸준히 등장합니다. GT2는 관용·비거리, GT3는 저스핀 컨트롤형으로 남자 투어 라인업과 맞물립니다.",
            image: "/promo-assets/blog/pro-driver/titleist-women.jpg",
            imageAlt: "타이틀리스트 LPGA 드라이버",
            recommendationReasons: [
              "볼·웨지·드라이버를 타이틀리스트로 통일하기 좋음",
              "GT2는 방향성 피드백이 좋다는 평가가 많음",
              "SureFit 로프트 조절로 체격·스윙 변화에 대응하기 쉬움",
            ],
            cons: [
              "시즌·집계에 따라 승수·비중이 다른 브랜드보다 낮게 나올 수 있음",
              "GT3는 스윙 스피드가 낮으면 비거리 손실이 있을 수 있음",
              "신형 GT 가격대가 높음",
            ],
          },
          {
            title: "3. 테일러메이드 (TaylorMade)",
            description:
              "스타 플레이어 WITB에 자주 등장하는 브랜드입니다. Qi10 Max·Qi10·Qi4D 등이 LPGA에서 언급되며, 가벼운 샤프트·관용 헤드 옵션이 강조됩니다.",
            image: "/promo-assets/blog/pro-driver/taylormade-women.jpg",
            imageAlt: "테일러메이드 여성 투어 드라이버",
            recommendationReasons: [
              "Qi Max 계열은 가벼운 샤프트·관용성 조합이 강조됨",
              "업그레이드 동기를 주는 비거리 이미지가 강함",
              "아이언과 풀 테일러메이드 백 구성이 흔함",
            ],
            cons: [
              "투어 LS 모델은 여성 아마추어에게 과도하게 저스핀일 수 있음",
              "모델 교체 주기가 빨라 ‘최신’에 쫓기기 쉬움",
              "일부 샤프트 스펙은 국내 주문·핏팅 대기가 길 수 있음",
            ],
          },
          {
            title: "4. PING",
            description:
              "관용성·방향성으로 LPGA에서도 자주 언급됩니다. G430·G440 계열 Max/LST가 WITB에 보이며, 미스 히트 시 거리 유지 성향이 강조됩니다.",
            image: "/promo-assets/blog/pro-driver/ping-women.jpg",
            imageAlt: "PING 여성 투어 드라이버",
            recommendationReasons: [
              "높은 MOI·관용 헤드로 방향 안정에 강점",
              "Max 계열은 초보·중급 여성 아마추어 시타 후보로 무난",
              "브랜드 신뢰도와 색상 트림 시인성",
            ],
            cons: [
              "헤드 사운드·필 취향이 갈릴 수 있음",
              "비거리 극대화만 보면 다른 브랜드가 더 잘 맞을 수 있음",
              "국내 일부 샤프트 옵션 재고가 제한적일 수 있음",
            ],
          },
          {
            title: "5. 스릭슨 (Srixon)",
            description:
              "빅4 다음으로 LPGA WITB에 꾸준히 등장합니다. ZXi 시리즈가 언급되며, 아이언과의 필 감 통일을 노릴 때 후보가 됩니다. 메이저·승수 기록은 시즌 원문을 확인하세요.",
            image: "/promo-assets/blog/pro-driver/srixon-women.jpg",
            imageAlt: "스릭슨 여성 투어 드라이버",
            recommendationReasons: [
              "저스핀·컴팩트 헤드 취향과 맞는 경우가 있음",
              "아이언·웨지와 브랜드 통일 구성에 유리",
              "프로모션 구간에서 가격 경쟁력이 생길 때가 있음",
            ],
            cons: [
              "드라이버 단독 비중이 낮아 시타 매장이 지역별로 적을 수 있음",
              "비거리 마케팅 이미지는 다른 브랜드보다 약한 편",
              "중고 가격 형성이 불안정할 수 있음",
            ],
          },
        ],
      },
      {
        heading: "여성·시니어 골퍼 선택 팁",
        body: [
          "여성 초보·시니어는 고로프트·경량 샤프트(R·L) 조합을 먼저 시타하는 경우가 많습니다. 정확한 평균 스피드 수치는 원문·피팅 데이터를 확인하세요.",
          "투어 선수의 저스핀·저로프트 세팅을 그대로 따라 하기보다, Max·GT2·Elyte Max처럼 관용성 라인을 먼저 시타하는 것이 스코어에 유리한 경우가 많습니다.",
          "드라이버만 바꿀 때는 기존 볼 스핀·캐리 거리를 메모해 두고, 핏팅 전후로 비교하면 체감이 분명해집니다. 선수 장비는 시즌 중에도 바뀔 수 있습니다.",
        ],
      },
      {
        heading: "마무리",
        body: [
          "LPGA에서는 캘러웨이·PING·타이틀리스트·테일러메이드·스릭슨이 함께 언급됩니다. 시즌 승수·비중은 집계마다 달라지므로 최신 원문을 확인하고, 초보자는 관용성·로프트·샤프트부터 맞추는 것이 안전합니다. 남자편 PGA 브랜드 비교 글과 함께 보면 선택 폭이 넓어집니다.",
        ],
      },
    ],
  },
  {
    slug: "beginner-iron-top-5",
    title: "초보자 아이언 선택 기준 TOP 5",
    description:
      "초보자가 아이언 세트를 고를 때 우선 확인할 5가지 기준과 캐비티백·게임개선형 등 유형별 특징을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-04-15",
    thumbnail: blogThumbnailPath("beginner-iron-top-5"),
    thumbnailAlt: blogThumbnailAlt("beginner-iron-top-5"),
    sections: [
      {
        heading: "초보자 아이언 선택이 중요한 이유",
        body: [
          "아이언은 그린 공략의 핵심 클럽입니다. 입문 단계에서는 블레이드보다 캐비티백(게임개선형)이 미스 히트 관용성이 높아 스코어·자신감 관리에 유리합니다.",
          "이 글은 특정 브랜드 제품 순위가 아니라, 아이언 유형과 스펙을 고르는 기준을 설명합니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "7번~PW 첫 세트를 맞추려는 입문 골퍼",
          "아이언 샷이 자주 뒤땅·탑볼일 때 클럽 교체를 고민하는 분",
          "세트 구성(아이언 몇 번까지 포함할지)을 정하려는 분",
        ],
      },
      {
        heading: "아이언 구매 전 기본 개념",
        body: [
          "캐비티백: 뒤쪽이 비어 있어 관용성이 높고, 초보에게 흔히 추천됩니다.",
          "로프트·거리 간격: 세트에 6~9번·PW가 포함되는지, 갭 웨지가 필요한지 확인합니다.",
          "샤프트: 드라이버와 같이 플렉스·무게가 스윙에 맞아야 합니다.",
          "세트 vs 단품: 하이브리드로 장아이언을 대체하는 구성도 초보에게 효과적입니다.",
        ],
      },
      {
        heading: "초보자 아이언 선택 기준 TOP 5",
        body: [
          "아래 기준으로 매장·중고 시장에서 후보를 좁혀 보세요. 가격과 재고는 변동될 수 있습니다.",
        ],
        items: [
          {
            title: "캐비티백(게임개선형) 우선",
            description:
              "페이스 하단 맞춤에도 볼이 뜨기 쉬운 구조로, 뒤땅이 잦은 초보에게 체감 도움이 큽니다. 블레이드는 스윙이 안정된 뒤 고려해도 늦지 않습니다.",
          },
          {
            title: "오프셋·솔 폭이 있는 모델",
            description:
              "오프셋이 있으면 방향성 보정에 도움이 되고, 넓은 솔은 러프·라이 불리함을 줄입니다. 시타 시 볼 비행 방향을 비교해 보세요.",
          },
          {
            title: "7아이언 단품 시타 후 세트 결정",
            description:
              "7번 아이언이 가장 자주 쓰는 번호 중 하나입니다. 7번 느낌이 맞으면 같은 라인 세트로 통일하는 것이 일관성에 좋습니다.",
          },
          {
            title: "하이브리드 병행 구성",
            description:
              "4~5번 아이언 대신 하이브리드를 넣으면 장타족 공략이 쉬워지는 경우가 많습니다. 초보 세트에서 흔한 조합입니다.",
          },
          {
            title: "중고 세트·아울렛 라인",
            description:
              "아이언은 마모가 비교적 적어 중고 가성비가 좋습니다. 페이스·그루브 마모, 샤프트 휨 여부를 직접 확인하세요.",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "아이언은 연습량이 쌓일수록 요구 스펙이 바뀝니다. 처음에는 관용성 높은 캐비티백으로 일관된 접촉을 만드는 것이 우선입니다. 가격과 재고는 변동될 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "beginner-golf-essentials-checklist",
    title: "골프 처음 시작할 때 필요한 준비물 체크리스트",
    description:
      "골프를 처음 시작할 때 챙겨야 할 의류·장비·라운드 필수품을 체크리스트로 정리했습니다. 과도한 구매 없이 단계별로 준비하는 방법을 안내합니다.",
    category: "beginner-guide",
    categoryLabel: CATEGORY_LABELS["beginner-guide"],
    date: "2026-04-10",
    thumbnail: blogThumbnailPath("beginner-golf-essentials-checklist"),
    thumbnailAlt: blogThumbnailAlt("beginner-golf-essentials-checklist"),
    relatedCollectionSlug: "near-seoul-beginner",
    sections: [
      {
        heading: "골프 입문, 무엇부터 준비할까",
        body: [
          "골프를 시작할 때 모든 장비를 한꺼번에 갖출 필요는 없습니다. 연습장 등록 → 그립·스탠스 기초 → 짧은 필드(Par 3·9홀) 순으로 단계를 밟으면 비용과 부담을 줄일 수 있습니다.",
          "아래 체크리스트는 '꼭 필요한 것'과 '나중에 사도 되는 것'을 구분해 정리했습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "스크린·연습장만 다녀보았고 필드 준비를 시작하는 분",
          "선물·지인 권유로 골프를 시작하며 기본 준비물이 궁금한 분",
          "첫 라운드 전에 복장·에티켓·장비를 점검하고 싶은 분",
        ],
      },
      {
        heading: "준비 단계별 우선순위",
        body: [
          "1단계(연습장): 편한 운동복, 골프화 또는 운동화, 글로브 1개, 연습용 클럽 또는 대여",
          "2단계(스크린·첫 필드): 복장 규정에 맞는 의류, 골프화, 글로브, 티·볼·마커, 양말·모자",
          "3단계(본격 라운드): 풀 세트 또는 렌탈, 거리측정기(선택), 우산·우비, 쿨타월·물",
        ],
      },
      {
        heading: "입문 준비물 체크리스트",
        body: [
          "라운드 전날·당일 아래 항목을 점검해 보세요.",
        ],
        items: [
          {
            title: "골프화",
            description:
              "잔디 보호 스파이크(또는 코스 규정에 맞는 솔)가 필요합니다. 연습장 초기에는 운동화가 허용되는 곳도 있으나, 필드 전환 전 구매를 권장합니다.",
          },
          {
            title: "글로브(한쪽)",
            description:
              "양손 중 주로 쓰는 손에 맞는 사이즈 1개면 시작 가능합니다. 인조·천연 가죽은 예산에 따라 선택합니다.",
          },
          {
            title: "골프공·티·볼마커",
            description:
              "첫 라운드는 컬러볼·저압축 유형이 실용적입니다. 티와 마커는 작지만 필수입니다.",
          },
          {
            title: "복장(드레스 코드)",
            description:
              "컨트리클럽·퍼블릭 모두 반바지·티셔츠 규정이 다릅니다. 방문 코스 홈페이지에서 복장 규정을 반드시 확인하세요.",
          },
          {
            title: "거리측정기·우산·쿨타월(선택)",
            description:
              "첫 라운드 필수는 아니나 있으면 편합니다. 렌탈 클럽을 쓸 경우에는 가방·우산만 준비해도 됩니다.",
          },
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "서울 근교 백돌이 골프장",
            description: "첫 필드 후보 코스",
            relatedCollectionSlug: "near-seoul-baekdori",
          },
          {
            title: "서울 근교 Par 3",
            description: "짧은 라운드로 시작하기",
            relatedCollectionSlug: "near-seoul-par3",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "입문 시기에는 렌탈·중고·연습장 대여로 비용을 줄이고, 스윙이 잡힌 뒤 본인에게 맞는 클럽을 맞추는 것이 좋습니다. 첫 라운드 코스는 서울 근교 9홀·Par 3 컬렉션에서 비교해 보세요.",
        ],
      },
    ],
  },
  {
    slug: "beginner-iron-men",
    title: "남자 입문용 아이언 추천: 국민 골프채 V300, 미즈노 JPX, 야마하 UD+2 비교",
    description:
      "남자 골프 입문자를 위한 아이언 추천 비교 가이드입니다. 브리지스톤 V300, 미즈노 JPX, 야마하 인프레스 UD+2의 장단점과 중고 구매 팁을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-27",
    thumbnail: blogThumbnailPath("beginner-iron-men"),
    thumbnailAlt: blogThumbnailAlt("beginner-iron-men"),
    relatedPostSlugs: [
      "beginner-iron-top-5",
      "beginner-driver-men",
      "golf-ball-type-guide",
      "first-golf-round-checklist",
    ],
    quickConclusion: {
      title: "빠른 결론",
      items: [
        "실패 확률을 낮추고 싶다면: 브리지스톤 V300",
        "브랜드 신뢰도와 선택 폭을 보고 싶다면: 미즈노 JPX 계열",
        "편한 비거리와 가벼운 사용감을 원한다면: 야마하 인프레스 UD+2",
        "첫 구매라면 새 제품보다 상태 좋은 중고 인기 모델도 추천",
      ],
    },
    sections: [
      {
        heading: "아이언 선택이 더 어렵게 느껴지는 이유",
        body: [
          "처음 아이언을 살 때는 “가장 좋은 채”보다 “나중에 후회가 적은 채”를 고르는 것이 중요합니다. 입문 단계에서는 스윙이 계속 바뀌기 때문에 너무 어려운 머슬백이나 상급자용 아이언보다, 관용성이 좋고 중고 거래가 쉬운 인기 모델이 안전합니다. 남자 입문자라면 브리지스톤 V300을 기준점으로 보고, 예산과 취향에 따라 미즈노 JPX 계열이나 야마하 인프레스 UD+2 같은 일본계 아이언을 함께 비교하는 방식이 좋습니다.",
          "골프를 막 시작하면 드라이버보다 아이언 선택이 더 어렵게 느껴집니다. 드라이버는 “잘 맞으면 멀리 간다”는 기준이 비교적 단순하지만, 아이언은 7번 거리, 탄도, 샤프트 무게, 헤드 모양, 중고 가격까지 한꺼번에 봐야 하기 때문입니다.",
          "입문자에게 가장 중요한 기준은 세 가지입니다.",
          "첫째, 공이 잘 떠야 합니다. 처음에는 정타율이 낮기 때문에 헤드가 너무 작거나 어려우면 연습이 힘들어집니다. 둘째, 너무 무겁지 않아야 합니다. 남성이라고 무조건 무거운 스틸 샤프트를 고를 필요는 없습니다. 셋째, 중고가 잘 방어되는 모델이면 좋습니다. 입문 후 1~2년이 지나면 스윙이 바뀌고 취향도 생기기 때문에, 중고로 팔기 쉬운 인기 모델이 오히려 경제적입니다.",
          "이 글에서는 남자 골린이가 많이 고민하는 아이언 중에서 세 가지를 중심으로 정리했습니다. 아주 특이한 모델보다, 주변에서 많이 쓰고 중고 매물도 비교적 많은 “국민 골프채” 후보 위주입니다.",
        ],
      },
      {
        heading: "남자 입문자가 많이 고민하는 아이언 3가지",
        body: [
          "아래 표로 세 모델의 성격을 먼저 비교한 뒤, 각 모델의 자세한 설명을 이어서 확인해 보세요.",
        ],
        table: {
          caption: "남자 입문용 아이언 비교",
          columns: ["모델", "핵심 장점", "주의점", "추천 대상"],
          rows: [
            [
              "브리지스톤 V300",
              "무난한 관용성과 단조 타감, 활발한 중고 거래",
              "인기 모델이라 중고가가 아주 싸지 않고 세대별 가격 차이가 있음",
              "첫 아이언을 실패 없이 고르고 싶은 입문자",
            ],
            [
              "미즈노 JPX 계열",
              "브랜드 신뢰도와 넓은 선택 폭, 안정적인 타감",
              "모델별 성격 차이가 있어 너무 어려운 헤드는 피하는 것이 좋음",
              "일본 브랜드 타감과 선택 폭을 보고 싶은 사람",
            ],
            [
              "야마하 인프레스 UD+2",
              "쉬운 비거리와 경량감, 편한 탄도",
              "로프트가 서 있어 웨지 구성·거리 간격을 함께 고려해야 함",
              "7번 거리가 부족하거나 가벼운 아이언이 편한 사람",
            ],
          ],
        },
        items: [
          {
            title: "#1 브리지스톤 V300: 남자 입문용 아이언의 기준점",
            description:
              "브리지스톤 V300은 한국에서 “국민 아이언”이라고 불릴 만큼 입문자와 중급자 사이에서 오래 인기가 많은 모델입니다. 특히 골프를 막 시작했는데 무엇을 사야 할지 모르겠다면 V300을 기준으로 삼아도 됩니다.\n\nV300의 가장 큰 장점은 무난함입니다. 헤드가 너무 작지 않고, 단조 아이언 특유의 타감도 어느 정도 느낄 수 있으면서, 상급자용 아이언처럼 예민하지 않습니다. 쉽게 말하면 “초보가 써도 너무 어렵지 않고, 실력이 조금 늘어도 바로 바꾸고 싶어지지 않는” 쪽에 가깝습니다.\n\n또 하나 큰 장점은 중고 거래입니다. V300은 워낙 사용자가 많기 때문에 중고 매물이 많고, 찾는 사람도 많습니다. 처음부터 새 제품을 사는 것이 부담된다면 상태 좋은 중고 V300을 찾아보는 것도 좋은 선택입니다. 그립 상태, 샤프트 스펙, 헤드 찍힘, 세트 구성만 잘 확인하면 입문용으로 충분히 오래 쓸 수 있습니다.",
            recommendationReasons: [
              "첫 아이언을 실패 없이 고르고 싶은 남자 입문자",
              "너무 저렴한 무명 브랜드보다 나중에 되팔기 쉬운 모델을 원하는 사람",
              "1~2년 쓰고 실력이 늘면 다른 아이언으로 바꿀 가능성이 있는 사람",
              "“국민 골프채” 느낌의 검증된 모델을 원하는 사람",
            ],
            cons: [
              "V300은 인기가 많은 만큼 중고 가격이 아주 싸지는 않을 수 있습니다.",
              "또 세대가 여러 개라서 V300 6, 7, 8, 9처럼 모델별 가격 차이가 있습니다. 입문자라면 최신형만 고집하기보다 예산 안에서 상태 좋은 세대를 고르는 쪽이 현실적입니다.",
            ],
          },
          {
            title: "#2 미즈노 JPX 계열: 일본 아이언 특유의 안정감과 선택 폭",
            description:
              "두 번째 후보는 미즈노 JPX 계열입니다. 미즈노는 아이언 브랜드로 인지도가 높고, JPX 계열은 상급자용 MP 계열보다 대중적인 성향이 강합니다. 입문자 입장에서는 JPX Hot Metal, JPX Forged, MX 계열 등에서 예산과 실력에 맞는 모델을 찾아볼 수 있습니다.\n\n미즈노 아이언의 장점은 선택 폭입니다. 너무 쉬운 채만 있는 것도 아니고, 너무 어려운 채만 있는 것도 아니라서 본인의 스윙 수준에 맞춰 고르기 좋습니다. 특히 “너무 초보용처럼 보이는 채는 싫지만, 그렇다고 어려운 아이언은 부담스럽다”는 사람에게 잘 맞습니다.\n\n중고 시장에서도 미즈노 아이언은 꾸준히 거래됩니다. V300만큼 “국민 아이언” 이미지는 아니더라도, 브랜드 신뢰도와 아이언 전문 이미지가 있어서 상태 좋은 중고를 찾으면 만족도가 높을 수 있습니다.",
            recommendationReasons: [
              "V300 말고 다른 선택지도 보고 싶은 사람",
              "일본 브랜드 아이언의 타감과 안정감을 선호하는 사람",
              "중고로도 무난하게 거래되는 브랜드를 원하는 사람",
              "초보용과 중급자용 사이에서 오래 쓸 아이언을 찾는 사람",
            ],
            cons: [
              "다만 JPX 계열은 모델별 성격이 조금 다릅니다. Hot Metal 쪽은 관용성과 비거리 성향이 강하고, Forged 쪽은 타감과 컨트롤 성향이 조금 더 있습니다. 입문자라면 너무 어려운 헤드보다 관용성이 좋은 모델을 우선으로 보는 것이 좋습니다.",
            ],
          },
          {
            title: "#3 야마하 인프레스 UD+2: 편하게 띄우고 거리를 얻고 싶은 사람",
            description:
              "세 번째 후보는 야마하 인프레스 UD+2 계열입니다. 야마하 UD+2는 “쉽게 멀리 보내는 아이언” 이미지가 강한 모델입니다. 강한 로프트와 가벼운 구성 덕분에 7번 아이언 비거리가 부족하거나 공이 잘 뜨지 않는 입문자에게 매력적일 수 있습니다.\n\n특히 힘이 아주 강하지 않거나, 무거운 스틸 샤프트가 부담스러운 남자 입문자라면 일본계 경량 아이언을 고려해볼 수 있습니다. 일본 브랜드 아이언은 병행수입·중고 매물까지 포함하면 가격대 선택 폭이 넓은 편이라, 예산을 아끼고 싶은 사람에게도 후보가 됩니다.",
            recommendationReasons: [
              "7번 아이언 거리가 잘 안 나와서 고민인 사람",
              "공을 편하게 띄우고 싶은 사람",
              "무거운 아이언보다 가벼운 아이언이 편한 사람",
              "일본 병행수입 또는 중고 아이언도 괜찮은 사람",
            ],
            cons: [
              "단점도 있습니다. UD+2처럼 비거리형 아이언은 로프트가 서 있는 경우가 많아, 같은 7번 아이언이라도 일반 아이언보다 더 멀리 나갈 수 있습니다. 그래서 나중에 웨지 구성이나 거리 간격을 맞출 때 신경을 써야 합니다. 입문 단계에서는 장점이지만, 실력이 늘면 거리 간격이 고민이 될 수도 있습니다.",
            ],
          },
        ],
      },
      {
        heading: "새 제품 vs 중고, 입문자는 무엇이 나을까?",
        image: "/promo-assets/blog/source/beginner-iron-men-fitting.png",
        imageAlt: "남자 입문용 아이언 비교와 중고 골프채 선택",
        body: [
          "처음부터 새 아이언을 사도 되지만, 현실적으로는 중고도 꽤 좋은 선택입니다. 골프 입문자는 1년 안에 스윙이 많이 바뀝니다. 처음에는 편했던 샤프트가 나중에는 약하게 느껴질 수 있고, 반대로 처음에는 멋져 보였던 어려운 헤드가 연습을 방해할 수도 있습니다.",
          "그래서 첫 아이언은 “평생 쓸 채”라기보다 “내 스윙을 만들어갈 첫 장비”라고 보는 것이 좋습니다. 인기 모델을 중고로 사면 나중에 다시 팔기도 수월합니다. 특히 V300, 미즈노 JPX, 야마하 UD+2처럼 이름이 알려진 모델은 중고 구매자도 비교적 쉽게 찾을 수 있습니다.",
          "중고 구매 시에는 아래만 확인해도 실패 확률이 줄어듭니다.",
          "7번 아이언 기준 샤프트가 너무 무겁지 않은지",
          "그립이 딱딱하게 굳거나 많이 닳지 않았는지",
          "헤드 페이스 홈이 지나치게 닳지 않았는지",
          "세트 구성이 5-P인지, 6-P인지, 웨지가 포함되는지",
          "병행수입인지 정품인지, AS가 필요한 사람인지",
          "같은 모델이라도 세대와 샤프트가 다른지",
        ],
      },
      {
        heading: "결론: 남자 입문용 아이언은 V300을 기준으로 비교하자",
        body: [
          "남자 입문자에게 하나만 추천하라면 브리지스톤 V300이 가장 무난합니다. 이유는 단순합니다. 많이 쓰고, 중고 거래가 쉽고, 입문자부터 중급자까지 커버하기 좋기 때문입니다.",
          "다만 무조건 V300만 답은 아닙니다. 조금 더 일본 브랜드 특유의 타감과 선택 폭을 보고 싶다면 미즈노 JPX 계열이 좋고, 편한 비거리와 쉬운 탄도를 원한다면 야마하 인프레스 UD+2도 충분히 볼 만합니다.",
          "가장 좋은 방법은 세 가지를 기준으로 시타해보는 것입니다.",
          "V300: 국민 아이언, 중고 방어, 무난함",
          "미즈노 JPX: 브랜드 신뢰도, 선택 폭, 안정감",
          "야마하 UD+2: 쉬운 비거리, 경량감, 일본계 가성비",
          "처음부터 완벽한 아이언을 고르려고 하기보다, 나중에 팔기 쉬운 인기 모델을 합리적인 가격에 사서 1~2년 충분히 연습하는 것이 입문자에게는 더 현실적인 선택입니다.",
        ],
      },
    ],
  },
  {
    slug: "beginner-iron-women",
    title: "여자 입문용 아이언 추천: 젝시오, 핑 G Le, 온오프 여성 골프채 비교",
    description:
      "여자 골프 입문자를 위한 아이언 추천 비교 가이드입니다. 젝시오 레이디스, 핑 G Le, 온오프 레이디 아이언의 장단점과 중고 구매 팁을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-27",
    thumbnail: blogThumbnailPath("beginner-iron-women"),
    thumbnailAlt: blogThumbnailAlt("beginner-iron-women"),
    relatedPostSlugs: [
      "beginner-iron-top-5",
      "beginner-driver-women",
      "golf-ball-type-guide",
      "first-golf-round-checklist",
    ],
    quickConclusion: {
      title: "빠른 결론",
      items: [
        "가장 무난한 여성 국민 골프채 후보: 젝시오 레이디스",
        "깔끔하고 안정적인 여성용 아이언: 핑 G Le 계열",
        "가벼운 일본 감성과 디자인을 원한다면: 온오프/다이와 계열",
        "여성 입문자는 디자인보다 무게와 샤프트를 먼저 확인",
      ],
    },
    sections: [
      {
        heading: "여성 입문용 아이언은 무게와 샤프트가 먼저",
        body: [
          "여성 입문용 아이언은 남성용보다 “무게”와 “샤프트”가 훨씬 중요합니다. 예쁜 디자인만 보고 사면 처음에는 만족스럽지만, 실제 연습에서는 공이 뜨지 않거나 방향성이 흔들릴 수 있습니다. 여자 골린이라면 젝시오 레이디스, 핑 G Le, 온오프 레이디 계열처럼 가볍고 관용성이 좋은 모델을 기준으로 보고, 가능하면 시타 후 중고 가격까지 함께 확인하는 것이 좋습니다.",
          "여성 골프채를 고를 때 가장 많이 듣는 말은 “여자는 젝시오”입니다. 실제로 젝시오는 여성 골퍼 사이에서 인지도가 높고, 중고 거래도 활발한 편입니다. 하지만 모든 여성 입문자에게 젝시오가 정답은 아닙니다. 나이, 체격, 스윙 스피드, 디자인 취향, 예산에 따라 더 잘 맞는 아이언이 달라질 수 있습니다.",
          "여자 입문용 아이언을 고를 때는 세 가지를 먼저 봐야 합니다.",
          "첫째, 너무 무겁지 않아야 합니다. 여성용 아이언은 보통 그라파이트 샤프트를 많이 쓰지만, 브랜드마다 무게와 탄성이 다릅니다. 둘째, 공이 쉽게 떠야 합니다. 처음에는 탄도가 낮고 캐리가 부족한 경우가 많기 때문에 헤드가 너무 예민한 모델은 피하는 것이 좋습니다. 셋째, 중고로 팔기 쉬운 모델이면 좋습니다. 처음 산 아이언을 평생 쓰기보다는, 실력이 늘면서 바꾸는 경우가 많기 때문입니다.",
          "이번 글에서는 여성 입문자가 많이 고민하는 세 가지 모델군을 정리했습니다. 특정 모델 하나만 정답처럼 말하기보다, “어떤 성향의 골퍼에게 맞는지” 중심으로 보면 됩니다.",
        ],
      },
      {
        heading: "여성 입문자가 많이 고민하는 아이언 3가지",
        body: [
          "아래 표로 세 모델군의 성격을 먼저 비교한 뒤, 각 모델의 자세한 설명을 이어서 확인해 보세요.",
        ],
        table: {
          caption: "여자 입문용 아이언 비교",
          columns: ["모델", "핵심 장점", "주의점", "추천 대상"],
          rows: [
            [
              "젝시오 레이디스",
              "가볍고 공이 잘 뜨며 중고 거래가 수월함",
              "디자인·이미지 호불호, 스윙이 빨라지면 가볍게 느껴질 수 있음",
              "첫 여성 아이언을 무난하게 고르고 싶은 사람",
            ],
            [
              "핑 G Le 계열",
              "깔끔한 디자인과 안정적인 관용성",
              "신품 가격 부담, 중고는 샤프트 강도·길이 확인 필요",
              "젝시오 외 깔끔하고 안정적인 모델을 원하는 사람",
            ],
            [
              "온오프 레이디 / 다이와 계열",
              "가벼운 사용감과 일본 감성 디자인",
              "병행수입 제품은 국내 정식 AS 조건 확인 필요",
              "예쁜 디자인과 가벼운 사용감을 함께 원하는 사람",
            ],
          ],
        },
        items: [
          {
            title: "#1 젝시오 레이디스: 가장 무난한 여성 국민 골프채 후보",
            description:
              "젝시오 레이디스는 여성 골프채를 이야기할 때 빠지지 않는 대표 모델입니다. 가볍고, 공을 쉽게 띄우는 성향이 강하고, 여성용 풀세트나 아이언 세트로도 많이 유통됩니다. 처음 골프채를 사는 사람이 “실패 확률을 낮추고 싶다”고 한다면 젝시오는 반드시 비교해볼 만한 후보입니다.\n\n가장 큰 장점은 편안함입니다. 힘이 강하지 않은 여성 골퍼도 스윙하기 좋게 설계된 모델이 많고, 헤드도 입문자가 부담을 덜 느끼는 방향입니다. 또 워낙 유명한 브랜드라 중고 거래가 비교적 쉽습니다. 나중에 다른 브랜드로 바꾸더라도 되팔기 수월한 편이라는 점은 입문자에게 큰 장점입니다.",
            recommendationReasons: [
              "첫 여성 아이언을 무난하게 고르고 싶은 사람",
              "가볍고 공이 잘 뜨는 채를 원하는 사람",
              "중고 거래가 쉬운 인기 모델을 원하는 사람",
              "부모님이나 배우자 선물용으로 실패 확률을 낮추고 싶은 사람",
            ],
            cons: [
              "다만 젝시오가 모두에게 정답은 아닙니다. 일부 젊은 여성 골퍼는 젝시오의 디자인이나 이미지가 취향에 맞지 않는다고 느끼기도 합니다. 또 꾸준히 연습하고 스윙 스피드가 빨라지면 너무 가볍게 느껴질 수 있습니다. 그래서 가능하면 시타를 해보고, 본인이 실제로 편하게 느끼는지 확인하는 것이 좋습니다.",
            ],
          },
          {
            title: "#2 핑 G Le 계열: 가볍지만 너무 ‘시니어 느낌’은 싫다면",
            description:
              "핑 G Le 계열은 여성 전용 라인으로, 가볍고 편하게 치기 좋은 아이언을 찾는 입문자에게 많이 언급됩니다. 젝시오가 너무 흔하거나 디자인 취향이 맞지 않는다면 핑 G Le는 좋은 대안이 될 수 있습니다.\n\n핑의 장점은 안정감입니다. 헤드가 너무 예민하지 않고, 관용성을 중시하는 브랜드 이미지가 강합니다. 여성용 G Le 계열은 입문자도 부담 없이 잡을 수 있도록 설계된 라인이라, 공을 띄우고 방향성을 잡는 데 도움을 줄 수 있습니다.",
            recommendationReasons: [
              "젝시오 말고 다른 여성용 인기 모델을 보고 싶은 사람",
              "너무 화려한 디자인보다 깔끔한 느낌을 선호하는 사람",
              "가볍지만 안정적인 아이언을 원하는 사람",
              "브랜드 인지도와 중고 거래 가능성을 함께 보는 사람",
            ],
            cons: [
              "핑 G Le 계열은 신품 가격이 부담스러울 수 있으므로 중고도 함께 보는 것이 좋습니다. 상태 좋은 G Le2, G Le3 같은 이전 세대를 찾으면 예산을 줄일 수 있습니다. 다만 여성용 중고 아이언은 샤프트 강도와 길이, 그립 상태를 꼭 확인해야 합니다.",
            ],
          },
          {
            title: "#3 온오프 레이디 / 다이와 계열: 일본 감성과 가벼운 사용감을 원한다면",
            description:
              "온오프 레이디, 다이와 계열 아이언은 일본 여성용 골프채 특유의 가벼움과 디자인 감성을 원하는 사람에게 잘 맞습니다. 한국에서도 여성용 아이언 후보로 자주 언급되고, 신품·병행수입·중고 선택지가 다양합니다.\n\n이 계열의 장점은 사용감입니다. 여성 전용 설계 모델이 많고, 가벼운 샤프트와 부드러운 타감을 강조하는 제품이 많습니다. 디자인도 여성 골퍼가 선호하는 부드러운 컬러나 고급스러운 분위기가 많아, 처음 장비를 살 때 만족도가 높을 수 있습니다.",
            recommendationReasons: [
              "예쁜 디자인과 가벼운 사용감을 함께 원하는 사람",
              "젝시오보다 조금 다른 일본 브랜드를 찾는 사람",
              "병행수입이나 중고까지 포함해 예산을 조절하고 싶은 사람",
              "힘이 강하지 않고 편한 스윙을 우선하는 사람",
            ],
            cons: [
              "단, 일본 병행수입 제품은 AS 조건을 확인해야 합니다. 가격이 저렴해 보여도 국내 정식 AS가 어려울 수 있으므로, 초보자는 구매 전 판매처와 보증 조건을 확인하는 것이 좋습니다.",
            ],
          },
        ],
      },
      {
        heading: "여성 입문자는 “예쁜 채”보다 “나에게 맞는 무게”가 먼저",
        image: "/promo-assets/blog/source/beginner-iron-women-flatlay.png",
        imageAlt: "여성 입문용 아이언과 골프 용품 비교",
        body: [
          "여성 골프채는 디자인이 예쁜 모델이 많습니다. 그래서 처음에는 색상이나 캐디백 조합을 보고 고르기 쉽습니다. 하지만 실제로 연습을 시작하면 디자인보다 중요한 것은 무게와 샤프트입니다.",
          "너무 가벼운 채는 처음에는 편하지만, 스윙이 빨라지면 흔들릴 수 있습니다. 반대로 너무 무거운 채는 처음부터 공을 띄우기 어렵고 연습이 힘들어집니다. 따라서 7번 아이언을 직접 잡아보고, 몇 번 휘둘러보고, 가능하면 시타해보는 것이 가장 좋습니다.",
          "중고 구매 시에는 아래를 확인하세요.",
          "여성용 L 샤프트인지, A 또는 R인지",
          "클럽 길이가 본인 키에 너무 길거나 짧지 않은지",
          "그립이 손에 잘 맞고 미끄럽지 않은지",
          "헤드에 큰 찍힘이나 변형이 없는지",
          "세트 구성이 7-P, 6-P, 5-S 등 어떻게 되는지",
          "정품인지 병행수입인지, AS가 필요한지",
        ],
      },
      {
        heading: "결론: 여자 입문용 아이언은 젝시오를 기준으로, 핑과 온오프를 비교하자",
        body: [
          "여성 입문자에게 가장 무난한 기준점은 젝시오 레이디스입니다. 가볍고, 유명하고, 중고 거래가 수월하기 때문입니다. 하지만 젝시오의 이미지나 디자인이 마음에 들지 않는다면 핑 G Le 계열이나 온오프 레이디 계열도 충분히 좋은 선택입니다.",
          "정리하면 이렇게 볼 수 있습니다.",
          "젝시오 레이디스: 가장 무난한 여성 국민 골프채 후보",
          "핑 G Le 계열: 안정감 있고 깔끔한 여성용 아이언",
          "온오프 레이디 / 다이와 계열: 일본 감성과 가벼운 사용감",
          "처음 아이언은 “가장 비싼 채”보다 “연습을 계속하고 싶게 만드는 채”가 좋습니다. 예산이 충분하다면 신품도 좋지만, 입문 단계에서는 상태 좋은 중고 인기 모델을 찾아보는 것도 현실적인 선택입니다.",
        ],
      },
    ],
  },
  {
    slug: "first-golf-round-checklist",
    title:
      "첫 골프장, 머리올릴 때 필요한 준비물 체크리스트: 처음 필드 나가기 전 꼭 챙길 것",
    description:
      "첫 골프장, 머리올릴 때 꼭 챙겨야 할 준비물을 정리했습니다. 골프공, 장갑, 모자, 선크림부터 캐디백·파우치 체크리스트와 초보자 첫 라운드 팁까지 한 번에 확인하세요.",
    category: "beginner-guide",
    categoryLabel: CATEGORY_LABELS["beginner-guide"],
    date: "2026-06-28",
    thumbnail: blogThumbnailPath("first-golf-round-checklist"),
    thumbnailAlt: blogThumbnailAlt("first-golf-round-checklist"),
    relatedPostSlugs: [
      "beginner-golf-essentials-checklist",
      "golf-ball-type-guide",
      "seoul-beginner-golf-best-5",
      "beginner-driver-men",
    ],
    quickConclusion: {
      title: "빠른 결론",
      items: [
        "무조건 먼저 챙길 것: 골프채, 골프공, 장갑, 티, 골프화",
        "빠뜨리기 쉬운 것: 선크림, 모자, 물, 수건, 볼마커",
        "비가 오거나 땀이 많다면: 여벌 장갑과 여벌 양말도 추천",
        "처음 필드는 장비보다 체크리스트가 중요하니 전날 밤 미리 캐디백과 파우치를 점검하는 것이 좋습니다",
      ],
    },
    sections: [
      {
        heading: "처음 골프장에 나갈 때",
        body: [
          "첫 골프장에 나갈 때는 클럽보다 준비물이 더 중요하게 느껴질 수 있습니다. 실제로 초보자는 스윙보다 “뭘 챙겨야 하지?”에서 더 많이 긴장합니다. 첫 필드에서는 많은 장비보다 기본 준비물이 빠지지 않는 것이 우선입니다. 캐디백 안에 골프채, 골프공, 장갑, 티, 볼마커, 수건, 선크림, 물을 챙기고, 복장과 골프화, 모자, 여벌 장갑까지 준비해두면 훨씬 편합니다. 이 글에서는 첫 라운드 전에 꼭 챙겨야 할 준비물을 필수·있으면 좋은 것·전날 체크리스트로 나눠 정리했습니다.",
          "처음 골프장을 가는 날은 기대보다 긴장이 더 큽니다. 연습장에서는 잘 맞던 스윙도 필드에서는 달라지고, 티오프 시간에 맞춰 움직여야 하다 보니 준비물이 하나만 빠져도 당황하기 쉽습니다. 그래서 첫 라운드에서는 “이걸 꼭 챙겨야 하나?”보다 “빠지면 곤란한 게 무엇인가?” 기준으로 준비하는 것이 좋습니다.",
          "특히 처음 필드에 나가는 초보자는 클럽 세트만 있으면 된다고 생각하기 쉬운데, 실제로는 골프공, 티, 장갑, 모자, 선크림, 물처럼 자잘하지만 꼭 필요한 물건이 더 중요하게 느껴집니다. 골프장은 생각보다 오래 걷고 오래 서 있는 공간이기 때문에, 편안함과 컨디션 관리도 준비물의 일부라고 보면 됩니다.",
        ],
      },
      {
        heading: "1. 가장 먼저 챙길 필수 준비물",
        body: [
          "첫 번째는 당연히 골프채입니다. 드라이버, 아이언, 퍼터 정도의 기본 구성이 준비되어 있으면 충분합니다. 처음부터 클럽이 완벽하게 세팅되어 있지 않아도 괜찮지만, 퍼터가 빠지거나 필수 클럽이 누락되면 곤란합니다. 출발 전에 캐디백 안 클럽 개수를 한 번 확인하는 습관을 들이면 좋습니다.",
          "두 번째는 골프공입니다. 초보자는 필드에서 공을 잃어버릴 가능성이 높기 때문에 공을 넉넉히 챙기는 것이 좋습니다. 첫 라운드라면 최소 6개, 가능하면 1더즌까지 준비해도 부담이 덜합니다. 처음부터 비싼 투어볼보다 무난한 2피스 공이나 로스트볼도 충분합니다.",
          "세 번째는 장갑입니다. 연습장에서는 장갑 하나로 버텨도 되지만, 필드에서는 땀이나 습기 때문에 그립감이 달라질 수 있습니다. 가능하면 여벌 장갑 하나를 더 챙겨두는 것이 좋습니다. 특히 여름철이나 비 예보가 있는 날에는 장갑 한 장만으로는 부족할 수 있습니다.",
          "네 번째는 티입니다. 드라이버 티샷을 하려면 티가 꼭 필요합니다. 우드 티든 플라스틱 티든 상관없지만, 여러 개 챙겨두는 것이 좋습니다. 필드에서는 티를 잃어버리거나 부러뜨리는 일이 생각보다 자주 생깁니다.",
          "다섯 번째는 골프화입니다. 운동화를 신고 갈 수 있는 구장도 일부 있지만, 첫 라운드라면 가능한 한 골프화를 신는 것이 안전합니다. 잔디 위에서 미끄러짐을 줄여주고, 발 피로도도 덜합니다. 처음부터 아주 비싼 골프화가 필요한 것은 아니지만, 발이 편한 신발은 꼭 중요합니다.",
        ],
      },
      {
        heading: "2. 있으면 훨씬 편한 준비물",
        body: [
          "모자는 필수에 가깝습니다. 햇빛 차단에도 도움이 되고, 필드에서 시야를 안정적으로 잡는 데도 좋습니다. 여름뿐 아니라 봄·가을 라운드에서도 모자는 챙기는 편이 낫습니다.",
          "선크림도 꼭 챙기길 추천합니다. 필드에서는 생각보다 햇빛을 오래 받게 됩니다. 얼굴뿐 아니라 목, 팔, 다리까지 노출되는 부위가 많아 선크림이 없으면 라운드가 끝난 뒤 훨씬 피곤하게 느껴질 수 있습니다.",
          "수건이나 작은 타월도 있으면 좋습니다. 손을 닦거나 공, 클럽, 그립을 정리할 때 유용합니다. 특히 여름에는 땀을 닦는 용도로도 자주 쓰입니다.",
          "물 또는 작은 음료도 챙기는 편이 좋습니다. 구장 안에서 구입할 수도 있지만, 첫 라운드에서는 이동 동선이 낯설기 때문에 개인 물병 하나쯤 있으면 심리적으로 훨씬 안정됩니다.",
          "볼마커와 그린보수기(디봇툴)는 없으면 캐디나 동반자에게 빌릴 수는 있지만, 하나쯤 직접 챙기면 좋습니다. 퍼팅 그린에서 자기 공 위치를 표시할 때 볼마커가 있으면 훨씬 편하고, 기본적인 매너에도 도움이 됩니다.",
          "파우치나 작은 케이스도 유용합니다. 공, 티, 볼마커, 립밤, 선크림처럼 자잘한 준비물을 따로 넣어두면 캐디백 안에서 찾느라 헤매지 않아도 됩니다.",
        ],
      },
      {
        heading: "3. 복장 준비는 생각보다 중요합니다",
        body: [
          "첫 골프장에서는 복장이 괜히 부담스럽게 느껴질 수 있지만, 기본만 지키면 됩니다. 깔끔한 카라 티셔츠 또는 골프웨어 상의, 활동하기 편한 바지나 스커트, 그리고 벨트·양말 정도를 준비하면 충분합니다. 지나치게 멋을 내기보다 움직이기 편한 옷이 더 중요합니다.",
          "기온에 따라 얇은 바람막이나 가벼운 겉옷을 챙겨두는 것도 좋습니다. 이른 아침 티오프는 생각보다 쌀쌀할 수 있고, 오후에는 반대로 햇빛이 강할 수 있습니다. 일교차가 큰 날에는 입고 벗기 쉬운 옷이 훨씬 유용합니다.",
          "여벌 양말도 있으면 좋습니다. 비나 땀 때문에 발이 불편해질 때 갈아 신으면 훨씬 낫습니다. 특히 첫 라운드는 평소보다 더 많이 긴장하고 움직이기 때문에, 발 컨디션이 생각보다 중요합니다.",
        ],
      },
      {
        heading: "4. 캐디백과 보스턴백은 이렇게 나눠 생각하면 쉽습니다",
        body: [
          "초보자는 캐디백과 보스턴백 개념이 헷갈릴 수 있습니다. 캐디백에는 골프채와 라운드 중 바로 꺼내 쓸 물건을 넣는다고 생각하면 쉽습니다. 공, 티, 장갑, 수건, 거리측정기 파우치 등이 여기에 들어갑니다.",
          "보스턴백 또는 개인 가방에는 갈아입을 옷, 여벌 장갑, 세면도구, 개인 소지품을 넣으면 됩니다. 샤워 계획이 있다면 속옷, 여벌 옷, 간단한 세면도구까지 챙기면 좋습니다. 첫 라운드라면 복잡하게 생각하지 말고 “필드에서 바로 쓸 물건은 캐디백, 개인 정리 물건은 보스턴백”으로 구분하면 충분합니다.",
        ],
      },
      {
        heading: "5. 전날 밤 체크리스트",
        image: "/promo-assets/blog/source/first-golf-round-prep.png",
        imageAlt: "첫 라운드 전 장비를 점검하는 초보 골퍼",
        body: [
          "첫 필드는 당일 아침에 챙기기 시작하면 빠뜨리는 것이 생기기 쉽습니다. 그래서 전날 밤에 한 번 정리해두는 것이 좋습니다.",
          "체크리스트는 아래 정도면 충분합니다.",
          "골프채 세트 확인",
          "골프공 6개 이상 준비",
          "장갑과 여벌 장갑 준비",
          "티와 볼마커, 수건 넣기",
          "모자, 선크림, 물 준비",
          "골프화와 양말 준비",
          "티오프 시간과 이동 시간 다시 확인",
          "날씨 확인 후 바람막이 또는 우비 여부 결정",
          "휴대폰 배터리와 결제수단 확인",
          "처음에는 사소해 보여도 실제로는 이런 체크리스트가 긴장을 크게 줄여줍니다.",
        ],
      },
      {
        heading: "6. 첫 라운드에서 준비물만큼 중요한 팁",
        body: [
          "첫 라운드에서는 스코어보다 흐름이 더 중요합니다. 준비물을 잘 챙겨가면 심리적으로 훨씬 여유가 생깁니다. 공을 잃어버렸을 때 공이 더 있다는 것만으로도 부담이 줄고, 장갑이나 물이 준비되어 있으면 중간중간 리듬을 회복하기 쉽습니다.",
          "또한 초보자는 너무 많은 소품을 챙기기보다, “내가 실제로 쓸 것” 중심으로 준비하는 것이 좋습니다. 거리측정기, 그린보수기, 장비 커버 등은 있으면 좋지만 없어도 첫 라운드 자체가 불가능한 것은 아닙니다. 반대로 공, 장갑, 티, 골프화는 없으면 바로 불편해집니다.",
          "결국 첫 골프장에서 가장 중요한 준비물은 완벽한 장비가 아니라, 빠뜨리지 않는 기본입니다.",
        ],
      },
      {
        heading: "결론",
        body: [
          "첫 골프장, 이른바 머리올릴 때는 멋진 장비보다 기본 준비물을 제대로 챙기는 것이 더 중요합니다. 골프채, 공, 장갑, 티, 골프화는 반드시 챙기고, 모자·선크림·물·수건·여벌 장갑까지 준비하면 훨씬 편한 첫 라운드가 됩니다.",
          "처음 필드는 누구나 긴장합니다. 하지만 전날 밤 체크리스트로 한 번만 정리해두면 당일 아침이 훨씬 편해집니다. 첫 라운드에서는 스코어보다 무리 없이 즐기고 돌아오는 경험이 더 중요하니, 준비물만 잘 챙겨도 이미 절반은 성공이라고 봐도 됩니다.",
        ],
      },
    ],
  },
  {
    slug: "beginner-driver-men",
    title:
      "남자 입문용 드라이버 추천: 핑 G425 MAX, 테일러메이드 SIM2 MAX, 야마하 인프레스 UD+2 비교",
    description:
      "골프 입문 남성을 위한 드라이버 추천 가이드입니다. 핑 G425 MAX, 테일러메이드 SIM2 MAX, 야마하 인프레스 UD+2의 장단점과 중고 구매 팁을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-28",
    thumbnail: blogThumbnailPath("beginner-driver-men"),
    thumbnailAlt: blogThumbnailAlt("beginner-driver-men"),
    relatedPostSlugs: [
      "driver-loft-shaft-guide-men",
      "beginner-iron-men",
      "golf-ball-type-guide",
      "first-golf-round-checklist",
    ],
    quickConclusion: {
      title: "빠른 결론",
      items: [
        "실패 확률을 낮추고 싶다면: 핑 G425 MAX",
        "타구감과 볼 스피드, 대중성을 함께 보고 싶다면: 테일러메이드 SIM2 MAX",
        "일본계 경량 드라이버와 쉬운 비거리를 원한다면: 야마하 인프레스 UD+2",
        "첫 드라이버는 새 제품보다 상태 좋은 인기 중고 모델도 충분히 좋은 선택입니다",
      ],
    },
    sections: [
      {
        heading: "남자 입문용 드라이버를 고를 때",
        body: [
          "남자 입문용 드라이버는 “멀리 가는 채”보다 “미스샷이 덜 무서운 채”를 먼저 고르는 것이 좋습니다. 초보자는 슬라이스와 정타율 문제를 동시에 겪기 때문에, 관용성이 좋고 중고 거래가 쉬운 인기 모델이 유리합니다. 남자 입문자라면 핑 G425 MAX를 기준점으로 보고, 테일러메이드 SIM2 MAX, 야마하 인프레스 UD+2 같은 모델을 함께 비교하면 선택이 쉬워집니다. 이 글에서는 초보자에게 많이 언급되는 대표 모델 3개와 중고 구매 팁까지 정리했습니다.",
          "아이언보다 드라이버가 더 어렵다는 말을 많이 합니다. 실제로 초보자는 드라이버에서 슬라이스, 탑핑, 정타율 부족을 한꺼번에 겪기 쉽습니다. 그래서 첫 드라이버를 고를 때는 “가장 멀리 가는 채”보다 “조금 빗맞아도 버텨주는 채”를 고르는 것이 훨씬 현실적입니다.",
          "특히 남자 입문자는 처음부터 너무 무겁거나 너무 공격적인 드라이버를 고르면 연습이 오히려 어렵습니다. 브랜드 인지도, 중고 거래, 관용성, 샤프트 무게를 같이 봐야 하는 이유가 여기에 있습니다. 인기 모델을 고르면 나중에 다시 팔기도 수월하기 때문에, 결과적으로는 비용을 덜 들일 수도 있습니다.",
          "이번 글에서는 남자 입문자가 많이 고민하는 세 가지 모델을 기준으로 정리합니다. 모두 실제로 커뮤니티와 블로그에서 자주 언급되는 인기 계열이고, 중고 시장에서도 비교적 찾기 쉬운 편입니다.",
        ],
      },
      {
        heading: "비교 한눈에 보기",
        body: [],
        table: {
          caption: "남자 입문용 드라이버 비교",
          columns: ["모델", "핵심 장점", "주의할 점", "추천 대상"],
          rows: [
            [
              "핑 G425 MAX",
              "높은 관용성, 안정감, 중고 거래 활발",
              "최신 모델보다 디자인이 심심하다고 느낄 수 있음",
              "첫 드라이버를 실패 없이 고르고 싶은 입문자",
            ],
            [
              "테일러메이드 SIM2 MAX",
              "볼 스피드, 대중성, 넓은 유저층",
              "샤프트 선택에 따라 체감이 달라질 수 있음",
              "유명 모델 중 무난한 선택지를 찾는 사람",
            ],
            [
              "야마하 인프레스 UD+2",
              "경량감, 쉬운 비거리, 일본계 선택지",
              "로프트·샤프트에 따라 거리감 적응이 필요",
              "힘이 아주 강하지 않거나 편한 드라이버를 원하는 사람",
            ],
          ],
        },
        items: [
          {
            title: "핑 G425 MAX: 남자 입문용 국민 드라이버의 기준점",
            description:
              "입문용 남자 드라이버를 하나만 꼽으라면 많은 사람들이 핑 G425 MAX를 먼저 떠올립니다. 이유는 단순합니다. 관용성이 좋고, 방향 안정감이 좋아서 미스샷이 나도 결과가 완전히 무너지지 않는 편이기 때문입니다.\n\n초보자에게 드라이버는 멀리 보내는 클럽이기도 하지만, 동시에 자신감을 잃기 가장 쉬운 클럽이기도 합니다. 핑 G425 MAX는 이런 점에서 입문자에게 심리적으로 편한 선택입니다. 헤드가 안정적으로 느껴지고, 슬라이스를 크게 줄여주진 않더라도 “완전히 터지는 샷”이 덜하다는 인상을 주는 경우가 많습니다.\n\n또 한 가지 장점은 중고 거래입니다. 워낙 인기가 많고 사용자층이 넓어서 중고 매물도 많고, 다시 팔 때도 비교적 수월합니다. 처음 드라이버를 새것으로 사기 부담스럽다면 상태 좋은 G425 MAX 중고를 찾는 것도 충분히 합리적입니다.",
            recommendationReasons: [
              "첫 드라이버를 실패 없이 고르고 싶은 남자 입문자",
              "슬라이스가 걱정돼서 관용성을 우선하는 사람",
              "나중에 되팔기 쉬운 인기 모델을 원하는 사람",
              "너무 어려운 상급자용 드라이버는 부담스러운 사람",
            ],
            cons: [
              "인기 모델이라 중고 가격이 아주 싸게 내려가지는 않을 수 있습니다",
              "샤프트 무게와 강도에 따라 체감 난이도가 달라질 수 있습니다",
              "“최신작이 아니라서 뒤처진다”는 걱정은 크게 할 필요 없지만, 디자인 취향은 갈릴 수 있습니다",
            ],
          },
          {
            title: "테일러메이드 SIM2 MAX: 대중성과 타구감을 함께 보고 싶다면",
            description:
              "두 번째 후보는 테일러메이드 SIM2 MAX입니다. SIM2 MAX는 초보자와 중급자 사이에서 오랫동안 언급되는 대표적인 대중 모델입니다. 브랜드 인지도도 높고, 타구감과 볼 스피드를 장점으로 느끼는 사람이 많아 드라이버 입문용 후보로 자주 거론됩니다.\n\n입문자 입장에서는 “너무 초보용 느낌은 싫고, 그렇다고 어려운 모델은 부담스럽다”는 생각을 많이 합니다. SIM2 MAX는 이런 사람에게 중간 지점이 될 수 있습니다. 적당한 관용성과 대중성, 그리고 브랜드 선호도가 모두 있는 쪽입니다.\n\n중고 시장에서도 SIM2 MAX는 비교적 매물이 많습니다. 다만 드라이버는 같은 헤드여도 샤프트에 따라 체감이 달라지므로, 중고 구매 시에는 샤프트 스펙을 꼭 확인해야 합니다.",
            recommendationReasons: [
              "많이 알려진 모델이라 정보가 많고 비교가 쉽습니다",
              "타구감과 볼 스피드에 대한 만족도가 높은 편입니다",
              "중고 매물과 사용자 후기가 많아 선택이 편합니다",
              "초보에서 중급으로 넘어갈 때까지 무난하게 쓰기 좋습니다",
            ],
            cons: [
              "관용성만 놓고 보면 핑 G425 MAX가 더 편하다고 느끼는 사람도 있습니다",
              "샤프트가 너무 강하거나 무거우면 초보자에게 부담이 될 수 있습니다",
              "인기 모델이라 가품이나 상태가 좋지 않은 중고를 조심해야 합니다",
            ],
          },
          {
            title: "야마하 인프레스 UD+2: 일본계 드라이버를 찾는다면",
            description:
              "세 번째는 야마하 인프레스 UD+2입니다. 일본계 골프채는 “가볍고 편하다”는 이미지가 강하고, 병행수입이나 중고까지 포함하면 선택 폭이 넓다는 장점이 있습니다. 야마하 UD+2는 특히 “조금 더 쉽게 치고 싶다”, “힘으로 세게 치는 타입이 아니다”는 입문자에게 괜찮은 선택지입니다.\n\n일본계 드라이버의 장점 중 하나는 상대적으로 편한 스펙 구성이 많다는 점입니다. 헤드 스피드가 아주 빠르지 않은 골퍼에게 맞는 경량 샤프트가 많고, 체감 난이도가 낮게 느껴질 수 있습니다. 또 한국 시장에서 중고와 병행수입을 함께 보면 가격 선택지가 넓어지는 편입니다.",
            recommendationReasons: [
              "가볍고 편하게 느껴지는 일본계 드라이버 후보",
              "힘이 아주 강하지 않은 입문자도 부담이 덜할 수 있습니다",
              "병행수입·중고까지 포함하면 예산 조절이 쉽습니다",
              "쉬운 비거리 성향을 선호하는 사람에게 잘 맞습니다",
            ],
            cons: [
              "병행수입 제품은 AS 조건을 꼭 확인해야 합니다",
              "같은 모델이라도 로프트·샤프트 조합에 따라 체감 차이가 큽니다",
              "너무 가벼운 스펙은 나중에 스윙이 빨라지면 아쉽게 느껴질 수 있습니다",
            ],
          },
        ],
      },
      {
        heading: "로프트·샤프트 기준 먼저 보기",
        body: [
          "드라이버 모델을 고르기 전에 9도·10.5도 로프트와 R·SR·S 샤프트 기준을 먼저 잡아두면 중고 구매 실패 확률이 줄어듭니다.",
          "처음에는 헤드 이름보다 내 볼스피드, 공이 뜨는 정도, 슬라이스 방향을 먼저 확인하세요. 기준이 애매하다면 남자 드라이버 로프트·샤프트 가이드를 함께 보고 후보를 좁히는 것이 좋습니다.",
        ],
        items: [
          {
            title: "남자 드라이버 로프트·샤프트 기준 먼저 보기",
            description:
              "볼스피드·헤드스피드별 로프트와 R/SR/S 샤프트 선택 기준을 먼저 확인하세요.",
            relatedPostSlug: "driver-loft-shaft-guide-men",
          },
        ],
      },
      {
        heading: "새 제품 vs 중고, 첫 드라이버는 어떻게 고를까?",
        image: "/promo-assets/blog/source/beginner-driver-men-fitting.png",
        imageAlt: "남자 드라이버 비교와 피팅 이미지",
        body: [
          "첫 드라이버는 중고도 아주 좋은 선택입니다. 입문자는 1년 안에 스윙이 크게 바뀌는 경우가 많고, 처음에는 편했던 드라이버가 나중에는 약하게 느껴질 수도 있습니다. 그래서 첫 드라이버를 평생 쓸 채로 보기보다, 내 스윙을 익히는 과정의 장비로 보는 것이 현실적입니다.",
          "인기 모델을 중고로 구매하면 비용을 줄이면서도 나중에 다시 팔기 쉽습니다. 특히 핑 G425 MAX, SIM2 MAX처럼 인지도가 높은 모델은 중고 시장에서도 움직임이 비교적 좋습니다.",
          "중고 구매 시에는 아래를 체크하면 좋습니다.",
          "샤프트 강도가 R, SR, S 중 무엇인지",
          "샤프트 중량이 너무 무겁지 않은지",
          "헤드 크라운과 페이스에 큰 찍힘이 없는지",
          "슬리브, 조절 기능, 렌치 포함 여부",
          "정품인지 병행수입인지",
          "그립 상태가 괜찮은지",
        ],
      },
      {
        heading: "결론",
        body: [
          "남자 입문용 드라이버는 핑 G425 MAX를 기준으로 비교하면 선택이 쉬워집니다. 관용성과 안정감을 우선한다면 핑 G425 MAX가 가장 무난하고, 브랜드 대중성과 타구감까지 함께 보고 싶다면 테일러메이드 SIM2 MAX가 좋은 선택입니다. 일본계 경량 드라이버와 편한 비거리를 보고 싶다면 야마하 인프레스 UD+2도 충분히 고려할 만합니다.",
          "처음부터 완벽한 드라이버를 찾기보다, 중고 거래가 쉬운 인기 모델을 합리적인 가격에 구입해 충분히 연습하는 것이 더 현실적인 접근입니다.",
        ],
      },
    ],
  },
  {
    slug: "beginner-driver-women",
    title:
      "여자 입문용 드라이버 추천: 젝시오 레이디스, 핑 G Le, 온오프 레이디 비교",
    description:
      "여성 골프 입문자를 위한 드라이버 추천 가이드입니다. 젝시오 레이디스, 핑 G Le, 온오프 레이디 드라이버의 장단점과 중고 구매 팁을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-28",
    thumbnail: blogThumbnailPath("beginner-driver-women"),
    thumbnailAlt: blogThumbnailAlt("beginner-driver-women"),
    relatedPostSlugs: [
      "driver-loft-shaft-guide-women",
      "beginner-iron-women",
      "golf-ball-type-guide",
      "first-golf-round-checklist",
    ],
    quickConclusion: {
      title: "빠른 결론",
      items: [
        "가장 무난한 여성 국민 드라이버 후보: 젝시오 레이디스",
        "깔끔하고 안정적인 여성용 드라이버: 핑 G Le",
        "일본 감성과 가벼운 사용감을 원한다면: 온오프 레이디",
        "첫 드라이버는 디자인보다 무게와 샤프트 체감이 더 중요합니다",
      ],
    },
    sections: [
      {
        heading: "여성 입문용 드라이버를 고를 때",
        body: [
          "여성 입문용 드라이버는 “예쁜 채”보다 “편하게 휘둘러지는 채”를 고르는 것이 중요합니다. 초보 여성 골퍼는 공이 잘 안 뜨거나 슬라이스가 심해지는 경우가 많기 때문에, 가볍고 관용성이 좋은 모델을 먼저 보는 것이 좋습니다. 여성 드라이버 후보로는 젝시오 레이디스, 핑 G Le, 온오프 레이디 계열이 자주 언급됩니다. 이 글에서는 각 모델의 특징과 중고 구매 팁까지 정리했습니다.",
          "여성 골퍼가 처음 드라이버를 살 때 가장 많이 듣는 말은 “여자는 젝시오”일 것입니다. 실제로 젝시오는 여성 골프채 시장에서 인지도가 높고, 중고 거래도 활발한 편입니다. 하지만 모든 여성 입문자에게 무조건 같은 모델이 정답은 아닙니다. 나이, 체격, 힘, 스윙 스피드, 디자인 취향, 예산에 따라 더 잘 맞는 드라이버가 달라질 수 있습니다.",
          "특히 여성용 드라이버는 헤드만 볼 것이 아니라 샤프트 무게와 강도, 전체 밸런스를 함께 봐야 합니다. 연습장에서는 괜찮아 보여도 실제 필드에서는 체력이 달라지고, 드라이버는 아이언보다 미스샷의 체감이 더 크게 느껴지기 때문입니다.",
          "이번 글에서는 여성 입문자가 비교해볼 만한 대표 드라이버 세 가지를 기준으로 정리합니다.",
        ],
      },
      {
        heading: "비교 한눈에 보기",
        body: [],
        table: {
          caption: "여자 입문용 드라이버 비교",
          columns: ["모델", "핵심 장점", "주의할 점", "추천 대상"],
          rows: [
            [
              "젝시오 레이디스",
              "가벼움, 편안함, 높은 인지도",
              "디자인·이미지 취향 차이 가능",
              "첫 여성 드라이버를 무난하게 고르고 싶은 사람",
            ],
            [
              "핑 G Le",
              "안정감, 관용성, 깔끔한 인상",
              "신품 가격이 부담스러울 수 있음",
              "편한데 너무 과하게 화려하지 않은 드라이버를 찾는 사람",
            ],
            [
              "온오프 레이디",
              "일본 감성, 가벼운 사용감, 예쁜 구성",
              "병행수입 시 AS 조건 확인 필요",
              "디자인과 사용감을 함께 중시하는 사람",
            ],
          ],
        },
        items: [
          {
            title: "젝시오 레이디스: 여성 입문용 국민 드라이버의 기준점",
            description:
              "여성 드라이버를 처음 고른다면 젝시오 레이디스는 가장 먼저 비교해볼 만한 모델입니다. 이유는 명확합니다. 가볍고, 공이 잘 뜨는 편이며, 여성 골퍼 사이에서 워낙 널리 알려져 있어 실패 확률이 낮기 때문입니다.\n\n젝시오 레이디스의 가장 큰 장점은 편안함입니다. 힘이 아주 강하지 않은 여성 골퍼도 스윙하기 쉬운 쪽으로 설계된 모델이 많고, 임팩트 순간 부담이 덜하다고 느끼는 사람이 많습니다. 또 중고 시장에서도 수요가 비교적 꾸준하기 때문에, 나중에 다른 모델로 바꿀 때도 되팔기 쉬운 편입니다.",
            recommendationReasons: [
              "첫 여성 드라이버를 무난하게 고르고 싶은 사람에게 잘 맞습니다",
              "가볍고 편한 스윙감을 선호하는 입문자에게 유리합니다",
              "브랜드 인지도가 높아 정보와 후기, 중고 거래가 많습니다",
              "선물용이나 풀세트 구성 시에도 실패 확률이 낮은 편입니다",
            ],
            cons: [
              "디자인이나 이미지가 취향에 안 맞는 사람도 있습니다",
              "스윙 스피드가 빨라지면 너무 가볍게 느껴질 수 있습니다",
              "신품 가격은 부담스러울 수 있으니 중고도 함께 보는 것이 좋습니다",
            ],
          },
          {
            title: "핑 G Le: 깔끔하고 안정적인 여성용 드라이버",
            description:
              "핑 G Le 계열은 여성용 드라이버 중에서도 “과하게 화려하지 않으면서 편하다”는 평가를 많이 받는 쪽입니다. 여성 전용 설계이면서도 핑 특유의 관용성과 안정감을 기대하는 사람들이 많이 찾습니다.\n\n입문자 입장에서는 슬라이스를 크게 줄여주는지보다 “부담 없이 휘둘러지고 결과가 안정적인지”가 중요합니다. 핑 G Le는 이런 의미에서 여성 입문자에게 꽤 괜찮은 선택지입니다.",
            recommendationReasons: [
              "가볍지만 지나치게 약한 느낌이 아니라 안정감이 있습니다",
              "깔끔한 디자인을 선호하는 여성 골퍼에게 잘 맞습니다",
              "관용성을 중시하는 브랜드 이미지가 강합니다",
              "젝시오 외 다른 여성 인기 모델을 보고 싶은 사람에게 대안이 됩니다",
            ],
            cons: [
              "신품 가격은 만만하지 않을 수 있습니다",
              "중고라도 세대에 따라 가격 차이가 큽니다",
              "여성용 샤프트 스펙을 꼭 확인해야 본인에게 맞는 선택이 됩니다",
            ],
          },
          {
            title: "온오프 레이디: 일본 감성과 가벼운 사용감을 원한다면",
            description:
              "온오프 레이디는 일본 여성용 골프채를 찾는 사람에게 자주 언급되는 모델입니다. 예쁜 디자인, 가벼운 사용감, 부드러운 스윙감이 장점으로 꼽히며, 신품·병행수입·중고까지 포함하면 선택지가 다양합니다.\n\n여성 입문자는 처음 장비를 살 때 디자인 만족도도 무시하기 어렵습니다. 온오프 레이디는 그런 면에서 감성적인 만족감이 높은 편이면서도, 실제 사용감도 가벼운 쪽이라 초보자에게 잘 맞을 수 있습니다.",
            recommendationReasons: [
              "일본 여성용 드라이버 특유의 가벼운 사용감을 느끼기 좋습니다",
              "부드럽고 세련된 디자인을 선호하는 사람에게 잘 맞습니다",
              "병행수입과 중고까지 포함하면 예산 조절이 가능합니다",
              "힘이 강하지 않아도 편하게 휘두르기 좋은 편입니다",
            ],
            cons: [
              "병행수입 제품은 AS와 정품 여부를 꼭 확인해야 합니다",
              "지나치게 디자인만 보고 사면 무게가 안 맞을 수 있습니다",
              "나중에 스윙 스피드가 빨라지면 더 단단한 모델이 필요할 수 있습니다",
            ],
          },
        ],
      },
      {
        heading: "여성 드라이버는 L/A/R 샤프트 확인이 먼저",
        body: [
          "여성용 드라이버는 같은 헤드라도 L, A, R 샤프트에 따라 완전히 다른 클럽처럼 느껴질 수 있습니다. 디자인이 마음에 들어도 샤프트가 너무 약하거나 강하면 탄도와 방향성이 흔들립니다.",
          "볼스피드를 모른다면 최근 스크린골프 기록, 드라이버 캐리 거리, 공이 잘 뜨는지 여부를 기준으로 임시 범위를 잡고 시타해보세요. 더 자세한 기준은 여자 드라이버 로프트·샤프트 가이드에서 확인할 수 있습니다.",
        ],
        items: [
          {
            title: "여자 드라이버 로프트·샤프트 기준 먼저 보기",
            description:
              "볼스피드별 10.5도·11.5도·12도 기준과 L/A/R 샤프트 선택법을 확인하세요.",
            relatedPostSlug: "driver-loft-shaft-guide-women",
          },
        ],
      },
      {
        heading: "여성 드라이버는 예쁜 것보다 나에게 맞는 무게가 먼저",
        image: "/promo-assets/blog/source/beginner-driver-women-flatlay.png",
        imageAlt: "여성 드라이버와 골프 액세서리 이미지",
        body: [
          "여성용 드라이버는 확실히 디자인이 예쁜 모델이 많습니다. 하지만 첫 드라이버는 디자인보다 체감 무게와 샤프트가 더 중요합니다. 너무 가벼운 채는 처음에는 편해도 임팩트에서 흔들릴 수 있고, 반대로 너무 무거운 채는 공이 잘 뜨지 않아 드라이버가 더 무서워질 수 있습니다.",
          "가능하면 7번 아이언만큼이나 드라이버도 직접 휘둘러보는 것이 좋습니다. 한두 번 시타만 해봐도 “너무 가볍다”, “생각보다 부담 없다” 같은 감이 옵니다. 실제로는 이런 체감이 브랜드 이름보다 더 중요할 때가 많습니다.",
          "중고 구매 시에는 아래를 확인하세요.",
          "샤프트 강도가 L인지 A인지",
          "헤드와 샤프트에 큰 상처가 없는지",
          "그립 상태가 괜찮은지",
          "정품인지 병행수입인지",
          "로프트 각도가 본인에게 너무 낮지 않은지",
          "헤드 커버와 렌치 포함 여부",
        ],
      },
      {
        heading: "결론",
        body: [
          "여자 입문용 드라이버는 젝시오 레이디스를 기준으로 보고, 핑 G Le와 온오프 레이디를 함께 비교하면 선택이 쉬워집니다. 가장 무난한 기준점은 젝시오 레이디스이고, 안정적이고 깔끔한 방향을 원하면 핑 G Le, 일본 감성과 가벼운 사용감을 중시한다면 온오프 레이디가 좋은 후보가 됩니다.",
          "처음 드라이버는 가장 비싼 모델보다, 내가 편하게 휘두를 수 있고 나중에 다시 팔기 쉬운 인기 모델을 고르는 것이 훨씬 현실적입니다.",
        ],
      },
    ],
  },
  {
    slug: "driver-loft-shaft-guide-men",
    title: "남자 드라이버 로프트 선택 가이드: 헤드스피드·볼스피드별 샤프트 추천",
    description:
      "남성 골퍼를 위한 드라이버 로프트·샤프트 선택 가이드입니다. 헤드스피드와 볼스피드별 9도, 10.5도, 11.5도 로프트 기준과 R, SR, S 샤프트 선택 팁을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-29",
    thumbnail: blogThumbnailPath("driver-loft-shaft-guide-men"),
    thumbnailAlt: blogThumbnailAlt("driver-loft-shaft-guide-men"),
    relatedPostSlugs: [
      "beginner-driver-men",
      "beginner-iron-men",
      "golf-ball-type-guide",
      "beginner-golf-essentials-checklist",
    ],
    quickConclusion: {
      title: "빠른 결론",
      items: [
        "볼스피드 55m/s 이하라면 10.5도보다 11도 이상도 충분히 고려",
        "볼스피드 55~60m/s는 10.5도를 기준으로 R 또는 SR 샤프트부터 비교",
        "볼스피드 60~65m/s는 9도보다 10.5도, SR/S 샤프트를 함께 시타",
        "볼스피드 65m/s 이상은 9도와 S 샤프트도 후보지만 탄도와 스핀을 꼭 확인",
        "초보자는 “낮은 로프트 = 상급자”라는 생각보다 정타율과 방향성을 먼저 봐야 합니다",
      ],
    },
    sections: [
      {
        heading: "남자 드라이버 로프트를 고를 때",
        body: [
          "남자 드라이버는 “9도냐 10.5도냐”보다 내 헤드스피드와 볼스피드에 맞는 탄도를 만드는 것이 더 중요합니다. 초보자가 무조건 낮은 로프트와 강한 샤프트를 고르면 공이 뜨지 않거나 슬라이스가 심해질 수 있습니다. 반대로 스피드가 충분한 골퍼가 너무 높은 로프트를 쓰면 탄도가 뜨고 스핀량이 늘어 비거리 손해를 볼 수 있습니다.",
          "드라이버를 고를 때 가장 많이 하는 질문은 “저는 9도 써도 되나요?”입니다. 특히 남성 골퍼는 처음부터 9도 드라이버와 S 샤프트를 써야 할 것 같은 느낌을 받기도 합니다. 하지만 실제로는 로프트가 낮다고 무조건 멀리 가는 것도 아니고, 샤프트가 강하다고 무조건 좋은 것도 아닙니다.",
          "드라이버는 로프트, 샤프트, 헤드 특성, 스윙 궤도, 임팩트 위치가 함께 결과를 만듭니다. 같은 10.5도 드라이버라도 어떤 사람에게는 너무 뜨고, 어떤 사람에게는 오히려 잘 안 뜰 수 있습니다. 그래서 처음에는 본인의 헤드스피드와 볼스피드를 기준으로 대략적인 범위를 잡고, 시타나 피팅으로 확인하는 방식이 가장 안전합니다.",
        ],
      },
      {
        heading: "헤드스피드와 볼스피드는 무엇이 다를까?",
        body: [
          "헤드스피드는 클럽 헤드가 임팩트 순간 얼마나 빠르게 움직이는지를 뜻합니다. 볼스피드는 공이 맞고 나가는 속도입니다. 드라이버 비거리에 더 직접적인 영향을 주는 것은 볼스피드이지만, 볼스피드는 헤드스피드뿐 아니라 정타율과 스매시팩터에도 영향을 받습니다.",
          "예를 들어 헤드스피드가 빠른데 페이스 중앙에 잘 맞지 않으면 볼스피드는 생각보다 낮을 수 있습니다. 반대로 헤드스피드가 아주 빠르지 않아도 정타가 잘 나면 볼스피드가 안정적으로 나옵니다. 그래서 드라이버 선택에서는 “내가 세게 휘두르는지”보다 “공이 실제로 얼마나 빠르게 나가는지”를 함께 봐야 합니다.",
        ],
      },
      {
        heading: "남성 드라이버 로프트 선택 기준",
        body: [],
        table: {
          caption: "볼스피드·헤드스피드별 남성 드라이버 로프트·샤프트 기준",
          columns: [
            "볼스피드 기준",
            "대략적인 헤드스피드",
            "추천 로프트",
            "샤프트 출발점",
            "추천 대상",
          ],
          rows: [
            [
              "55m/s 이하",
              "38m/s 이하",
              "11도~12도",
              "R 또는 경량 R",
              "공이 잘 안 뜨고 슬라이스가 많은 초보",
            ],
            [
              "55~60m/s",
              "38~42m/s",
              "10.5도~11.5도",
              "R 또는 SR",
              "평균적인 남성 입문자",
            ],
            [
              "60~65m/s",
              "42~46m/s",
              "9.5도~10.5도",
              "SR 또는 S",
              "어느 정도 스피드가 있는 골퍼",
            ],
            [
              "65~70m/s",
              "46~50m/s",
              "9도~10.5도",
              "S",
              "탄도와 스핀을 줄이고 싶은 골퍼",
            ],
            [
              "70m/s 이상",
              "50m/s 이상",
              "8도~9.5도",
              "S 또는 X",
              "피팅이 필요한 빠른 스피드 골퍼",
            ],
          ],
        },
      },
      {
        heading: "9도, 10.5도, 11.5도는 어떻게 다를까?",
        body: [
          "9도 드라이버는 탄도를 낮추고 스핀을 줄이는 데 유리할 수 있습니다. 하지만 초보자에게는 공이 뜨지 않거나 오른쪽으로 밀리는 느낌이 강해질 수 있습니다. 헤드스피드가 충분하지 않은데 9도를 쓰면 볼이 낮게 깔리고 캐리 거리가 줄어드는 경우도 있습니다.",
          "10.5도는 남성 아마추어에게 가장 무난한 기준점입니다. 스피드가 아주 빠르지 않은 골퍼도 공을 띄우기 좋고, 너무 높게만 뜨지 않는다면 입문자부터 중급자까지 폭넓게 쓸 수 있습니다. 처음 드라이버를 산다면 10.5도를 기준으로 보는 것이 안전합니다.",
          "11.5도나 12도는 “여성용이나 시니어용 아니냐”고 생각하는 사람도 있지만, 꼭 그렇지는 않습니다. 공이 잘 안 뜨는 초보자, 슬라이스가 심한 골퍼, 캐리 거리가 부족한 골퍼에게는 더 높은 로프트가 오히려 도움이 될 수 있습니다. 특히 첫 드라이버라면 낮은 탄도로 굴러가는 거리보다 안정적인 캐리 거리를 먼저 확보하는 것이 좋습니다.",
        ],
      },
      {
        heading: "샤프트 강도 R, SR, S는 어떻게 고를까?",
        image: "/promo-assets/blog/source/driver-loft-shaft-men-fitting.png",
        imageAlt: "남자 드라이버 피팅과 샤프트 선택",
        body: [
          "남성 입문자는 보통 R 또는 SR에서 시작하는 경우가 많습니다. 스피드가 빠르고 전환이 강하면 S도 후보가 되지만, 초보자가 무조건 S를 고르면 드라이버가 버겁게 느껴질 수 있습니다.",
          "R: 헤드스피드가 빠르지 않고 부드러운 템포인 골퍼",
          "SR: R은 약하고 S는 부담스러운 중간 영역",
          "S: 스피드가 충분하고 전환이 빠른 골퍼",
          "X: 일반 입문자는 거의 필요 없고 피팅이 필요한 영역",
        ],
      },
      {
        heading: "슬라이스가 심하면 로프트를 높이는 게 도움이 될까?",
        body: [
          "슬라이스의 원인은 대부분 스윙 궤도와 페이스 방향입니다. 그래서 로프트만 바꾼다고 슬라이스가 완전히 사라지지는 않습니다. 하지만 초보자가 너무 낮은 로프트와 강한 샤프트를 쓰면 페이스가 열리고 공이 뜨지 않아 슬라이스가 더 심하게 느껴질 수 있습니다.",
          "이럴 때는 9도보다 10.5도, S보다 SR 또는 R처럼 조금 더 편한 조합을 시타해보는 것이 좋습니다. 드로우 바이어스 헤드나 SFT 계열처럼 슬라이스 완화 성향의 헤드도 후보가 될 수 있습니다. 다만 장비가 스윙 문제를 완전히 해결해주지는 않기 때문에, 장비는 “미스샷을 덜 벌주는 선택” 정도로 보는 것이 좋습니다.",
        ],
      },
      {
        heading: "초보자가 피해야 할 조합",
        body: [
          "볼스피드 55m/s 이하인데 9도 드라이버",
          "평균 헤드스피드가 낮은데 무거운 S 샤프트",
          "슬라이스가 심한데 낮은 탄도·저스핀 모델",
          "중고 가격만 보고 샤프트 정보를 확인하지 않은 매물",
          "최신 모델이라는 이유만으로 시타 없이 구매",
        ],
      },
      {
        heading: "중고 드라이버를 볼 때 확인할 것",
        body: [
          "드라이버는 중고 구매가 꽤 현실적인 선택입니다. 특히 입문자는 스윙이 빠르게 변하기 때문에 첫 드라이버를 무조건 새 제품으로 살 필요는 없습니다. 인기 모델을 중고로 사면 나중에 다시 팔기도 수월합니다.",
          "로프트: 9도, 10.5도, 12도 중 무엇인지",
          "샤프트: R, SR, S와 무게",
          "헤드 상태: 크라운 찍힘, 페이스 찍힘, 솔 긁힘",
          "조절 슬리브와 렌치 포함 여부",
          "정품/병행수입 여부",
          "그립 상태",
          "헤드커버 포함 여부",
        ],
      },
      {
        heading: "결론",
        body: [
          "남자 드라이버 로프트 선택은 자존심으로 고르는 것이 아닙니다. 9도와 S 샤프트가 멋져 보일 수는 있지만, 내 스피드와 탄도에 맞지 않으면 오히려 비거리와 방향성을 모두 잃을 수 있습니다. 입문자라면 10.5도 드라이버를 기준으로 보고, 볼스피드가 낮거나 공이 잘 안 뜨면 11도 이상도 충분히 고려하세요.",
        ],
      },
    ],
  },
  {
    slug: "driver-loft-shaft-guide-women",
    title: "여자 드라이버 로프트 선택 가이드: 볼스피드별 샤프트 L·A·R 추천",
    description:
      "여성 골퍼를 위한 드라이버 로프트·샤프트 선택 가이드입니다. 볼스피드별 10.5도, 11.5도, 12도 로프트 기준과 L, A, R 샤프트 선택 팁을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-29",
    thumbnail: blogThumbnailPath("driver-loft-shaft-guide-women"),
    thumbnailAlt: blogThumbnailAlt("driver-loft-shaft-guide-women"),
    relatedPostSlugs: [
      "beginner-driver-women",
      "beginner-iron-women",
      "golf-ball-type-guide",
      "beginner-golf-essentials-checklist",
    ],
    quickConclusion: {
      title: "빠른 결론",
      items: [
        "볼스피드 35m/s 이하라면 12도 이상과 L 샤프트를 먼저 고려",
        "볼스피드 35~40m/s는 11.5~12.5도, L 또는 A 샤프트를 비교",
        "볼스피드 40~45m/s는 10.5~11.5도, A 또는 여성용 R도 후보",
        "볼스피드 45~50m/s 이상이면 10.5도와 R 샤프트도 시타해볼 만함",
        "볼스피드 50m/s 이상인 여성 골퍼는 남성용 헤드·샤프트도 피팅으로 확인하는 것이 좋습니다",
      ],
    },
    sections: [
      {
        heading: "여자 드라이버 로프트를 고를 때",
        body: [
          "여성 드라이버는 “여자니까 무조건 12도, L 샤프트”처럼 고르면 안 됩니다. 볼스피드가 낮거나 공이 잘 안 뜨는 골퍼에게는 높은 로프트와 부드러운 샤프트가 도움이 되지만, 볼스피드가 빠르고 탄도가 높은 여성 골퍼라면 10.5도나 남성용 R/SR 샤프트가 더 잘 맞을 수도 있습니다. 중요한 것은 성별이 아니라 스피드, 탄도, 스핀, 체감 무게입니다.",
          "여성 드라이버를 고를 때 가장 많이 나오는 질문은 “여자는 몇 도를 써야 하나요?”입니다. 주변에서는 12도 이상을 추천하기도 하고, 어떤 사람은 10.5도도 괜찮다고 말합니다. 실제로는 둘 다 맞을 수 있습니다. 중요한 것은 여성이라는 기준 하나가 아니라, 본인의 볼스피드와 탄도입니다.",
          "여성 골퍼는 남성보다 평균적으로 클럽이 가볍고 로프트가 높은 드라이버를 많이 사용합니다. 하지만 모든 여성 골퍼가 같은 스피드와 같은 탄도를 갖는 것은 아닙니다. 키가 크고 근력이 있는 골퍼, 운동 경험이 있는 골퍼, 스윙 스피드가 빠른 골퍼는 여성용 L 샤프트가 너무 약하게 느껴질 수도 있습니다.",
        ],
      },
      {
        heading: "여성 드라이버에서 로프트가 중요한 이유",
        body: [
          "드라이버 로프트는 공이 출발하는 각도와 탄도에 큰 영향을 줍니다. 로프트가 높으면 공을 띄우기 쉽고, 캐리 거리를 확보하기 좋습니다. 반대로 로프트가 낮으면 탄도와 스핀을 줄일 수 있지만, 스피드가 충분하지 않으면 공이 낮게 깔리고 비거리 손해가 날 수 있습니다.",
          "초보 여성 골퍼는 드라이버가 잘 안 뜨거나 오른쪽으로 밀리는 경우가 많습니다. 이때 너무 낮은 로프트를 쓰면 더 어렵게 느껴질 수 있습니다. 10.5도보다 11.5도, 12도 이상이 더 편하게 느껴지는 이유가 여기에 있습니다.",
        ],
      },
      {
        heading: "여성 볼스피드별 드라이버 로프트 기준",
        body: [],
        table: {
          caption: "볼스피드·헤드스피드별 여성 드라이버 로프트·샤프트 기준",
          columns: [
            "볼스피드 기준",
            "대략적인 헤드스피드",
            "추천 로프트",
            "샤프트 출발점",
            "추천 대상",
          ],
          rows: [
            [
              "35m/s 이하",
              "25m/s 이하",
              "12도~13.5도",
              "L 또는 초경량 L",
              "공이 잘 안 뜨는 입문자",
            ],
            [
              "35~40m/s",
              "25~30m/s",
              "11.5도~12.5도",
              "L 또는 A",
              "평균적인 여성 입문자",
            ],
            [
              "40~45m/s",
              "30~34m/s",
              "10.5도~11.5도",
              "A 또는 여성용 R",
              "어느 정도 스피드가 있는 골퍼",
            ],
            [
              "45~50m/s",
              "34~38m/s",
              "10도~10.5도",
              "R 또는 남성 경량 R",
              "탄도가 높고 스피드가 빠른 여성",
            ],
            [
              "50m/s 이상",
              "38m/s 이상",
              "9도~10.5도",
              "R/SR 피팅 필요",
              "남성용도 시타해볼 수 있는 골퍼",
            ],
          ],
        },
      },
      {
        heading: "L, A, R 샤프트 차이는 어떻게 볼까?",
        image: "/promo-assets/blog/source/driver-loft-shaft-women-fitting.png",
        imageAlt: "여성 드라이버 피팅과 샤프트 선택",
        body: [
          "여성용 드라이버에서 가장 흔한 샤프트는 L입니다. L 샤프트는 가볍고 부드러운 편이라 힘이 강하지 않은 여성 골퍼나 초보자에게 편하게 느껴질 수 있습니다. 하지만 모든 여성에게 L이 맞는 것은 아닙니다.",
          "A 샤프트는 L보다 조금 더 단단한 영역으로 볼 수 있습니다. 스윙이 조금 빨라졌거나, L 샤프트가 임팩트에서 흔들리는 느낌이 든다면 A 샤프트를 비교해볼 수 있습니다.",
          "R 샤프트는 일반적으로 남성용 Regular로 생각하지만, 볼스피드가 빠른 여성 골퍼라면 충분히 후보가 됩니다. 특히 키가 크거나 운동 경험이 있고, 드라이버 볼스피드가 45m/s 이상이라면 여성용 L보다 R 샤프트가 더 안정적으로 느껴질 수도 있습니다.",
        ],
      },
      {
        heading: "여성이 9도 드라이버를 써도 될까?",
        body: [
          "가능은 합니다. 다만 조건이 있습니다. 볼스피드가 빠르고, 탄도가 너무 높고, 스핀량이 많은 여성 골퍼라면 9도 드라이버를 시타해볼 수 있습니다. 실제로 일부 여성 골퍼는 남성용 헤드와 R/SR 샤프트가 더 잘 맞기도 합니다.",
          "하지만 입문자에게 9도는 대체로 어렵습니다. 공이 뜨지 않거나 슬라이스가 심해질 수 있고, 정타가 아닐 때 캐리 거리가 크게 줄 수 있습니다. 더 정확히는 “평균적인 입문 여성에게 9도는 어려울 가능성이 높다”입니다.",
          "9도를 고민한다면 반드시 아래 데이터를 비교하세요.",
          "발사각이 너무 낮지 않은지",
          "백스핀이 너무 적거나 많지 않은지",
          "캐리 거리가 줄지 않는지",
          "오른쪽 미스가 심해지지 않는지",
          "10.5도와 비교했을 때 평균값이 좋아지는지",
        ],
      },
      {
        heading: "초보 여성 골퍼가 피해야 할 조합",
        body: [
          "볼스피드 35m/s 이하인데 낮은 로프트",
          "처음부터 남성용 무거운 S 샤프트",
          "탄도가 낮은데 9도 드라이버",
          "슬라이스가 심한데 너무 단단한 샤프트",
          "병행수입 제품인데 AS 조건을 확인하지 않은 경우",
          "중고 매물에서 샤프트 강도와 로프트를 확인하지 않은 경우",
        ],
      },
      {
        heading: "중고 드라이버를 볼 때 확인할 것",
        body: [
          "여성 드라이버도 중고 구매가 좋은 선택이 될 수 있습니다. 젝시오, 핑 G Le, 온오프, 캘러웨이 REVA, 테일러메이드 Kalea 같은 여성용 인기 모델은 중고 시장에서도 비교적 찾기 쉽습니다.",
          "로프트: 10.5도, 11.5도, 12도 이상인지",
          "샤프트: L, A, R 중 무엇인지",
          "샤프트 무게가 너무 무겁지 않은지",
          "헤드 크라운에 큰 찍힘이 없는지",
          "페이스와 솔 상태",
          "그립이 미끄럽거나 닳지 않았는지",
          "헤드커버 포함 여부",
          "정품/병행수입 여부와 AS 조건",
        ],
      },
      {
        heading: "결론",
        body: [
          "여자 드라이버 로프트 선택은 성별보다 볼스피드와 탄도가 기준입니다. 평균적인 입문 여성이라면 11.5도~12도 이상과 L/A 샤프트에서 시작하는 것이 편할 수 있습니다. 하지만 볼스피드가 빠르고 탄도가 높은 골퍼라면 10.5도, R 샤프트, 경우에 따라 남성용 경량 스펙까지도 충분히 비교해볼 수 있습니다.",
        ],
      },
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getHomeBlogPosts(): BlogPost[] {
  return HOME_BLOG_SLUGS.map((slug) => {
    const post = getBlogPostBySlug(slug);
    if (!post) {
      throw new Error(`Home blog post not found: ${slug}`);
    }
    return post;
  });
}

/** @deprecated use getAllBlogPosts */
export function getBlogPostSummaries(): BlogPost[] {
  return getAllBlogPosts();
}
