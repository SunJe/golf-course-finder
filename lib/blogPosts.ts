import { blogThumbnailAlt, blogThumbnailPath } from "@/lib/blogThumbnailRules";
import { VISIT_KOREA_IMAGE_CREDIT } from "@/lib/visitKoreaAttribution";

export type BlogPostCategory = "course-guide" | "gear-guide" | "beginner-guide";

export type BlogPostSection = {
  heading: string;
  body: string[];
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
    /** 두 번째 카드 이미지 */
    image2?: string;
    /** 예: 출처 : ⓒ한국관광콘텐츠랩 */
    imageCredit?: string;
    /** Visit Korea 메타 key (courseId 없을 때 이미지 매칭) */
    visitKoreaKey?: string;
    relatedCourseId?: string;
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
  /** Visit Korea 메타·이미지 폴더 (public/promo-assets/blog/{dir}) */
  visitKoreaMetaDir?: string;
  /** 카드 alt·추천 문구용 지역 라벨 (예: 가평, 인천) */
  blogRegionLabel?: string;
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
          "GolfMap Korea에 등록된 연락처, 홈페이지, 참고 요금 정보를 바탕으로 비교 포인트를 정리했습니다. 아래 목록은 순위가 아니라 조건별로 살펴볼 만한 후보입니다.",
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
  },
  {
    slug: "seoul-budget-golf-best-5",
    title: "서울 근교 저렴한 골프장 BEST 5",
    description:
      "참고 요금과 접근성을 기준으로, 서울 근교에서 비용 부담을 줄이며 비교해볼 만한 골프장 후보 5곳을 정리했습니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-05-05",
    thumbnail: blogThumbnailPath("seoul-budget-golf-best-5"),
    thumbnailAlt: blogThumbnailAlt("seoul-budget-golf-best-5"),
    relatedCollectionSlug: "near-seoul-budget",
    sections: [
      {
        heading: "서울 근교 저렴한 골프장을 찾을 때",
        body: [
          "수도권 골프장 그린피는 요일·시간대·시즌에 따라 크게 달라집니다. GolfMap에 등록된 참고 요금(price_min/price_max)과 서울 기준 거리를 함께 보면, 예산에 맞는 후보를 좁히는 데 도움이 됩니다.",
          "표시 요금은 참고용이며, 실제 예약가·카트비·캐디피는 별도일 수 있습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "첫 필드 라운드 비용을 최대한 줄이고 싶은 분",
          "평일·오전·오후 타임 등 조건을 조합해 알뜰하게 라운드하고 싶은 분",
          "서울 근교에서 당일 이동 가능한 저렴한 코스를 비교하는 분",
        ],
      },
      {
        heading: "저렴한 골프장 비교 기준",
        body: [
          "GolfMap 참고 요금(최저·최고) 존재 여부",
          "서울 시청 기준 거리(80km 이내 near-seoul)",
          "대중제·퍼블릭 등 회원권 없이 이용 가능한지",
          "홀 수·라운드 시간 대비 가격 대비 만족도(개인 선호)",
        ],
      },
      {
        heading: "서울 근교 저렴한 골프장 BEST 5",
        body: [
          "아래 후보는 참고 요금 정보가 있는 서울 근교 코스 중 비교해볼 만한 곳입니다. 주말·성수기에는 요금이 크게 오를 수 있습니다.",
        ],
        items: [
          {
            title: "파주제이퍼블릭골프클럽",
            description:
              "6홀 대중제 코스로, 등록된 참고 요금 대비 수도권에서 비교적 부담이 적은 편에 속합니다. 짧은 라운드로 가성비를 노리기 좋습니다.",
            relatedCourseId: "gc-81becbdb274e",
          },
          {
            title: "남양주CC",
            description:
              "9홀 대중제 코스로 참고 요금 범위가 등록되어 있습니다. 서울 동북부 방향 이동 시 가격·거리 균형을 맞추기 좋은 후보입니다.",
            relatedCourseId: "gc-29fa36946d15",
          },
          {
            title: "골프존카운티 송도",
            description:
              "인천 연수구 18홀 대중제 코스로, 참고 요금 하한이 비교적 낮게 잡혀 있는 편입니다. 인천·서울 남부권 거주자에게 후보가 됩니다.",
            relatedCourseId: "gc-4005648f63d2",
          },
          {
            title: "일산스프링힐스 컨트리클럽",
            description:
              "고양시 9홀 대중제 코스입니다. 일산·서울 서북부에서 이동 거리가 가깝고 참고 요금 정보가 있어 비교가 수월합니다.",
            relatedCourseId: "gc-41b5c15f44da",
          },
          {
            title: "서울 근교 저렴한 골프장 컬렉션",
            description:
              "참고 요금 기준으로 정렬·필터링한 서울 근교 목록입니다. 더 넓은 범위에서 가격대를 비교해 보세요.",
            relatedCollectionSlug: "near-seoul-budget",
          },
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "저렴한 골프장 전국",
            description: "수도권 외 지역까지 가격 비교",
            relatedCollectionSlug: "budget",
          },
          {
            title: "대중제 골프장",
            description: "퍼블릭·대중제 위주 목록",
            relatedCollectionSlug: "public",
          },
          {
            title: "서울 근교 골프장",
            description: "접근성 기준 전체 목록",
            relatedCollectionSlug: "near-seoul",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "그린피는 예약 채널·프로모션·조인 여부에 따라 달라집니다. GolfMap 요금은 참고용이며, 최종 예약 전 공식 홈페이지와 예약 사이트에서 확인해 주세요.",
        ],
      },
    ],
  },
  {
    slug: "incheon-golf-top-5",
    title: "인천 골프장 BEST 6 추천",
    description:
      "인천그랜드CC를 포함해 인천 대표 골프장 6곳을 소개합니다. 한국관광콘텐츠랩 소개와 GolfMap 등록 정보(홀 수·요금·연락처)를 함께 정리했습니다.",
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
      "서울에서 1시간 내외로 닿기 좋은 가평 대표 골프장 6곳을 정리했습니다. 한국관광콘텐츠랩 소개와 GolfMap 등록 정보(홀 수·요금·연락처)를 함께 담았습니다.",
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
    title: "고양시 골프장 BEST 5 추천",
    description:
      "고양CC·한양파인CC·일산스프링힐스CC·123골프클럽·올림픽 골프장 등 서울에서 30분 내 닿기 좋은 고양시 대표 퍼블릭 5곳을 정리했습니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-06-26",
    thumbnail: blogThumbnailPath("goyang-golf-best-5"),
    thumbnailAlt: blogThumbnailAlt("goyang-golf-best-5"),
    relatedRegionSlug: "gyeonggi",
    visitKoreaMetaDir: "goyang",
    blogRegionLabel: "고양",
    relatedPostSlugs: [
      "seoul-beginner-golf-best-5",
      "seoul-budget-golf-best-5",
      "incheon-golf-top-5",
      "gapyeong-golf-best-6",
      "beginner-golf-essentials-checklist",
    ],
    sections: [
      {
        heading: "고양시 골프장을 고를 때",
        body: [
          "고양시는 덕양구·일산동구·일산서구로 나뉘며, 서울 강북·서북·일산 생활권에서 당일 라운드가 가장 쉬운 수도권 권역 중 하나입니다. 9홀·6홀 위주 코스가 많아 짧은 라운드와 가성비를 동시에 노리기 좋습니다.",
          "이번 글에서는 한국관광콘텐츠랩에 등록된 고양시 대표 골프장 5곳을 GolfMap 등록 정보와 함께 정리했습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "서울 강북·서북·일산에서 30분 내 라운드를 계획하는 분",
          "9홀·6홀 짧은 코스로 부담 없이 필드를 즐기고 싶은 분",
          "퇴근 후·주말 오전 가성비 라운드를 찾는 분",
        ],
      },
      {
        heading: "고양시 골프장 BEST 5",
        body: [],
        items: [
          {
            title: "고양CC",
            description:
              "고양시 덕양구에 있는 9홀 대중제 골프장입니다. 파5 홀이 3개 들어가 있어 9홀이지만 드라이버부터 숏게임까지 리듬 있게 칠 수 있고, 9홀·18홀 모두 예약이 가능합니다. 110타석 규모 연습장과 함께 운영되어 타석 연습 후 바로 필드로 이어가기 좋은 실전형 코스로 소개됩니다.",
            recommendationReasons: [
              "서울·일산·고양 생활권 접근성",
              "연습장과 필드를 한 번에 이용",
              "9홀·18홀 선택 가능",
              "가성비 좋은 퍼블릭 연습형 코스",
            ],
            relatedCourseId: "gc-8fbc2ee961a0",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "한양파인CC",
            description:
              "서울컨트리클럽 회원들이 직접 조성한 9홀 퍼블릭 골프장으로, 2015년 개장했습니다. 원앙포 지형 위에 북한산을 배경으로 펼쳐진 코스가 특징이며, 전장 약 3,129야드로 비교적 짧고 평지에 가깝습니다. 자연 녹지 비율이 높아 도심에서 가깝게 산림욕 분위기를 느끼기 좋다는 후기가 많습니다.",
            recommendationReasons: [
              "북한산 전망·도심 속 힐링 코스",
              "짧고 평지에 가까운 9홀 구성",
              "서울 도심에서 가까운 명품 퍼블릭",
              "초보·시니어 입문 후기가 많음",
            ],
            relatedCourseId: "gc-1faa083d0616",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "일산스프링힐스CC",
            description:
              "고양시 일산동구에 위치한 9홀 대중제 코스입니다. 일산 신도시 생활권과 가깝고 주변 상권·편의시설 접근이 좋아 주말 짧은 라운드에 자주 쓰입니다. 코스 리뉴얼 이후 잔디·시설에 대한 긍정 후기가 늘고 있으며, GolfMap 기준 참고 그린피도 부담 적은 편입니다.",
            recommendationReasons: [
              "일산·서울 서북부 접근성",
              "9홀 빠른 라운드",
              "주변 생활 인프라와 연계 용이",
              "리뉴얼 후 코스 관리 호평",
            ],
            relatedCourseId: "gc-41b5c15f44da",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "123골프클럽",
            description:
              "1970년 문을 연 한국 최초의 퍼블릭 골프장으로, 응봉산 자락 6홀 코스를 운영합니다. 노캐디 셀프 라운드가 기본이고 선착순 티켓팅이라 예약 부담이 적으며, 6홀·12홀·18홀 반복 라운드도 가능합니다. 지하철 3호선 구파발역에서 차량 10분 내외 거리로 수도권 최저 수준 그린피 후기가 많습니다.",
            recommendationReasons: [
              "한국 최초 퍼블릭 골프장 역사",
              "노캐디·선착순으로 부담 적은 이용",
              "수도권 최저 수준 그린피 후기",
              "6·12·18홀 반복 라운드 가능",
            ],
            relatedCourseId: "gc-a80360466b97",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "올림픽 골프장",
            description:
              "고양시 덕양구 벽제 일대에 있는 9홀 대중제 코스입니다. 전 홀 라이트 시설을 갖춰 퇴근 후·야간 라운드 계획에 적합하고, 9홀 기본 운영에 18홀 이용도 가능합니다. 서울 강북에서 15~30분 내외로 이동한다는 관광 안내가 있어, 짧은 라운드를 서울 근처에서 찾는 분에게 자주 추천됩니다.",
            recommendationReasons: [
              "전 홀 라이트·퇴근 라운드 가능",
              "9홀·18홀 선택 가능",
              "서울 강북 30분 내 접근",
              "벽제·북한산 인근 경관",
            ],
            relatedCourseId: "gc-18640b625b94",
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
            title: "서울 근교 백돌이 골프장",
            description: "입문·첫 라운드 후보",
            relatedCollectionSlug: "near-seoul-baekdori",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "고양시 골프장은 9홀·6홀 비중이 높아 라운드 시간과 비용을 함께 줄이기 좋습니다. 그린피·티타임·운영 방식은 시즌별로 달라질 수 있으니 방문 전 공식 홈페이지와 예약 채널에서 최신 정보를 확인해 주세요.",
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
          "아래 후보는 GolfMap 등록 정보와 사용자가 제공한 코스 특징을 바탕으로 정리했습니다. 사진 등 관광콘텐츠 정보가 없는 코스는 이미지 없이 기본 정보 카드로 안내합니다.",
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
      "seoul-beginner-golf-best-5",
      "beginner-golf-essentials-checklist",
      "golf-ball-type-guide",
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
    title: "프로들이 사용하는 드라이버 종류 및 장단점 (남자편)",
    description:
      "PGA 투어 상위 100명 기준으로 가장 많이 쓰이는 드라이버 브랜드 5곳—타이틀리스트, PING, 캘러웨이, 테일러메이드, 스릭슨—의 대표 모델·투어 점유율·장단점을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-20",
    thumbnail: blogThumbnailPath("pro-tour-driver-brands-men"),
    thumbnailAlt: blogThumbnailAlt("pro-tour-driver-brands-men"),
    relatedPostSlugs: [
      "pro-tour-driver-brands-women",
      "golf-ball-type-guide",
      "beginner-iron-top-5",
    ],
    sections: [
      {
        heading: "왜 프로 드라이버를 볼까",
        body: [
          "PGA 투어에서는 드라이버 한 방이 스코어와 직결됩니다. 2025~2026 시즌 기준 상위 100명 프로 중 약 87%가 타이틀리스트·PING·캘러웨이·테일러메이드 네 브랜드에 몰려 있고, 스릭슨이 그다음 그룹을 이끕니다.",
          "아래는 특정 모델 구매 권유가 아니라, 투어에서 검증된 브랜드별 특성을 이해하고 본인 스윙·예산에 맞는 선택을 돕기 위한 가이드입니다. 투어 사용 비율은 시즌·대회마다 변동될 수 있습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "드라이버 업그레이드를 고민하지만 브랜드·모델이 너무 많아 헷갈리는 분",
          "투어에서 실제로 쓰이는 클럽이 궁금한 아마추어·중급 골퍼",
          "비거리·방향성·관용성 중 무엇을 우선할지 기준을 잡고 싶은 분",
        ],
      },
      {
        heading: "투어 드라이버 브랜드 BEST 5",
        body: [
          "PGA 투어 상위 100명 장비 통계(2025/26 시즌, Golfing Focus·WITBhub 등 참고)를 바탕으로 브랜드별 점유율과 대표 모델을 정리했습니다. 가격과 재고는 변동될 수 있습니다.",
        ],
        items: [
          {
            title: "1. 타이틀리스트 (Titleist)",
            description:
              "PGA 투어 드라이버 점유율 약 34%로 1위. 대표 모델은 GT3(컴팩트·저스핀)와 GT2(관용·비거리 균형)이며, 저스핀 GT3는 투어에서 단일 모델 기준 가장 많이 쓰입니다. 저스핀·중저스핀 헤드에 정밀한 CG 배치가 강점이고, 캐머런 영·저스틴 토마스·루드비그 오베리 등이 사용합니다.",
            image: "/promo-assets/blog/pro-driver/titleist.jpg",
            imageAlt: "타이틀리스트 드라이버 헤드",
            recommendationReasons: [
              "투어 검증된 방향성·스핀 컨트롤, 특히 GT3의 저스핀 안정감",
              "로프트·각도 조절 가능한 SureFit 시스템으로 핏팅 폭이 넓음",
              "프리미엄 이미지와 중고·이전 세대(TSR 시리즈) 시장이 커 가성비 선택지도 있음",
            ],
            cons: [
              "신형 GT 시리즈는 가격대가 높은 편",
              "GT3 등 저스핀 모델은 스윙 스피드가 낮으면(예: 90mph·약 40m/s 미만) 관용성이 떨어질 수 있음",
              "최대 비거리만 노리는 초보에게는 PING·테일러메이드 Max 라인이 더 쉬울 수 있음",
            ],
          },
          {
            title: "2. PING",
            description:
              "점유율 약 26%로 2위. G440 LST·G440 Max가 투어 주력이며, G430 세대도 여전히 다수 사용됩니다. 항공역학·관용성 설계로 ‘미스 히트에도 거리 유지’ 평가가 많고, 빅터 호브란·코리 콘너스·토니 피나우 등이 PING 드라이버를 씁니다.",
            image: "/promo-assets/blog/pro-driver/ping.jpg",
            imageAlt: "PING 드라이버",
            recommendationReasons: [
              "넓은 페이스·높은 MOI로 방향성과 관용성의 균형이 우수",
              "G440 LST는 롱 드라이버들 사이에서 스핀·탄도 조절에 강점",
              "색상 트림이 뚜렷해 시인성이 좋고 브랜드 신뢰도가 높음",
            ],
            cons: [
              "헤드 사운드·필이 ‘딱딱하다’고 느끼는 골퍼도 있음",
              "Max 계열은 스핀이 높아 비거리 극대화보다 안정 쪽에 치우침",
              "일부 모델은 국내 재고·핏팅 샤프트 옵션이 제한적일 수 있음",
            ],
          },
          {
            title: "3. 캘러웨이 (Callaway)",
            description:
              "점유율 약 15%. Paradym Ai Smoke Triple Diamond·Quantum 시리즈가 투어 라인업입니다. AI 페이스 설계로 볼 스피드를 끌어올리는 데 강점이 있으며, 잰더 슈펠레·샘 번스·토마스 데트리 등이 사용합니다.",
            image: "/promo-assets/blog/pro-driver/callaway.jpg",
            imageAlt: "캘러웨이 드라이버",
            recommendationReasons: [
              "Triple Diamond·Quantum TD 등 투어 모델의 비거리 효율이 뛰어남",
              "로프트·웨이트 조절로 드로우·페이드 바이어스 세팅이 가능",
              "Elyte·Paradym 라인으로 투어형·관용형 선택 폭이 넓음",
            ],
            cons: [
              "저스핀 TD 모델은 스윙 궤도가 안정되지 않으면 훅이 나기 쉬움",
              "모델·서브라인이 많아 구매 전 시타로 헤드 형태를 확인하는 것이 좋음",
              "프리미엄 라인 가격이 높고, 출시 주기가 빨라 구형 가격이 급락하기도 함",
            ],
          },
          {
            title: "4. 테일러메이드 (TaylorMade)",
            description:
              "점유율 약 12%이나 스코티 셰플러·로리 맥킬로이·콜린 모리카와 등 메이저 우승자 다수가 사용해 ‘빅 네임’ 브랜드 이미지가 강합니다. Qi35 LS·Qi4D가 2025~26 시즌 주력이며, 과거 Qi10도 여전히 투어에 남아 있습니다.",
            image: "/promo-assets/blog/pro-driver/taylormade.jpg",
            imageAlt: "테일러메이드 드라이버",
            recommendationReasons: [
              "카본 크라운·저중심 설계로 비거리 지향 설계가 뚜렷함",
              "Qi 시리즈는 투어 LS와 Max·Lite 등 아마추어 라인이 분리돼 선택이 쉬움",
              "한국 LPGA·KLPGA에서도 Qi4D 등 신형 채택 사례가 많아 국내 핏팅·시타 접근성이 좋음",
            ],
            cons: [
              "투어 점유율은 2024년 대비 회복 중이나 여전히 타이틀리스트·PING보다 낮음",
              "LS 모델은 스윙 스피드·궤도가 맞지 않으면 방향성이 흔들릴 수 있음",
              "헤드 커버·부속 디자인이 자주 바뀌어 중고 식별에 주의가 필요",
            ],
          },
          {
            title: "5. 스릭슨 (Srixon)",
            description:
              "점유율 약 5%로 ‘빅4’ 다음 그룹 1위. ZXi·ZXi LS가 투어 모델이며, 히데키 마츠야마·셰인 로우리·라이언 폭스 등이 사용합니다. 상대적으로 투어 점유는 낮지만 아이언·웨지와 함께 풀백 구성 시 일관된 필 감을 주는 브랜드입니다.",
            image: "/promo-assets/blog/pro-driver/srixon.jpg",
            imageAlt: "스릭슨 드라이버",
            recommendationReasons: [
              "ZXi LS는 저스핀·컴팩트 헤드 선호자에게 방향성이 좋다는 평가",
              "아이언 ZXi7이 투어에서 인기가 높아 드라이버·아이언 통일 브랜딩에 유리",
              "빅4 대비 가격·프로모션이 유리한 경우가 많아 가성비 투어 브랜드로 주목",
            ],
            cons: [
              "PGA 투어 점유율이 낮아 핏팅·시타 매장 수가 지역별로 적을 수 있음",
              "비거리 ‘폭발력’ 이미지는 캘러웨이·테일러메이드보다 약한 편",
              "모델 인지도가 낮아 중고 매매 시 가격 형성이 불안정할 수 있음",
            ],
          },
        ],
      },
      {
        heading: "아마추어가 참고할 선택 팁",
        body: [
          "투어 프로는 대부분 9° 전후 저로프트·X·S 샤프트를 씁니다. 아마추어는 10.5°~12°·R 샤프트가 방향성에 유리한 경우가 많습니다.",
          "Triple Diamond·GT3·ZXi LS 같은 ‘투어 헤드’는 스윙 스피드 95mph(약 42.5m/s) 이상에서 장점이 드러나는 편입니다. 속도가 90mph(약 40m/s) 이하라면 Max·GT2·G440 Max 계열을 우선 시타해 보세요.",
          "브랜드보다 샤프트 플렉스·로프트·헤드 용량(460cc)이 맞는지가 더 중요합니다. 가능하면 프로샵 핏팅 후 결정하세요.",
        ],
      },
      {
        heading: "마무리",
        body: [
          "PGA 투어 드라이버 시장은 타이틀리스트와 PING이 양강이고, 캘러웨이·테일러메이드가 비거리형, 스릭슨이 저스핀·가성비 대안으로 자리 잡고 있습니다. 여자편 LPGA 브랜드 비교는 관련 글을 참고하세요. 가격과 재고는 변동될 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "pro-tour-driver-brands-women",
    title: "프로들이 사용하는 드라이버 종류 및 장단점 (여자편)",
    description:
      "LPGA 투어에서 가장 많이 보이는 드라이버 브랜드 5곳—캘러웨이, 타이틀리스트, 테일러메이드, PING, 스릭슨—의 대표 모델·투어 특징·장단점을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-06-22",
    thumbnail: blogThumbnailPath("pro-tour-driver-brands-women"),
    thumbnailAlt: blogThumbnailAlt("pro-tour-driver-brands-women"),
    relatedPostSlugs: [
      "pro-tour-driver-brands-men",
      "golf-ball-type-guide",
      "beginner-iron-top-5",
    ],
    sections: [
      {
        heading: "LPGA 드라이버 시장은 어떻게 다를까",
        body: [
          "LPGA 투어는 PGA와 달리 한 브랜드 독점이 약하고, 캘러웨이·타이틀리스트·테일러메이드·PING·스릭슨이 고르게 경쟁합니다. 2025 시즌 드라이버 승수 기준으로는 캘러웨이·PING이 앞섰고, 메이저 우승에는 스릭슨 ZXi가 두 차례 기록되기도 했습니다.",
          "여자 프로는 평균 드라이브 비거리가 남자보다 짧아, 관용성 있는 Max·고로프트(10.5°~12°)·가벼운 샤프트(50~60g) 조합이 흔합니다. 아래는 브랜드별 투어에서 검증된 특성을 정리한 것입니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "여성·시니어 골퍼가 드라이버를 처음 맞추거나 교체하려는 경우",
          "LPGA 선수 장비를 참고해 비거리와 방향성의 균형을 잡고 싶은 분",
          "남자편 투어 브랜드 글과 비교하며 본인에게 맞는 브랜드를 고르고 싶은 분",
        ],
      },
      {
        heading: "LPGA 투어 드라이버 브랜드 BEST 5",
        body: [
          "LPGA 상위권 장비 통계·2025 시즌 드라이버 승수(WITBhub, Golf Monthly, Golfing Focus 등 참고)를 바탕으로 정리했습니다. 투어 사용 비율은 시즌마다 달라질 수 있으며, 가격과 재고는 변동될 수 있습니다.",
        ],
        items: [
          {
            title: "1. 캘러웨이 (Callaway)",
            description:
              "LPGA에서 클럽 전반 점유율이 높은 브랜드로, Paradym Triple Diamond·Elyte·Elyte Triple Diamond·Quantum 라인이 투어에 많습니다. 2025 시즌 드라이버 승수 1위(7승)를 기록했으며, 민지 리·유카 사소·황유민(Quantum) 등이 대표 사용자입니다.",
            image: "/promo-assets/blog/pro-driver/callaway-women.jpg",
            imageAlt: "캘러웨이 여성 투어 드라이버",
            recommendationReasons: [
              "Elyte Max는 관용성·비거리 균형이 좋아 LPGA에서 채택률이 높음",
              "Triple Diamond는 스핀 조절·샷 쉐이프 컨트롤에 강점",
              "오디세이 퍼터·캘러웨이 아이언과 풀백 구성 시 일관된 브랜드 핏팅이 가능",
            ],
            cons: [
              "모델명이 Paradym·Elyte·Quantum으로 많아 구매 전 시타가 필수",
              "TD·Quantum 등 저스핀 모델은 스윙 궤도가 불안정하면 훅 위험",
              "프리미엄 라인 가격이 높음",
            ],
          },
          {
            title: "2. 타이틀리스트 (Titleist)",
            description:
              "프로 V1 볼 점유율 1위와 함께 GT2·GT3·TSR 시리즈 드라이버도 LPGA에서 꾸준히 사용됩니다. GT2는 관용·비거리, GT3는 저스핀 컨트롤형으로 남자 투어와 라인업이 맞물립니다.",
            image: "/promo-assets/blog/pro-driver/titleist-women.jpg",
            imageAlt: "타이틀리스트 LPGA 드라이버",
            recommendationReasons: [
              "볼·웨지·드라이버를 타이틀리스트로 통일하기 좋음",
              "GT2는 여성 프로·아마추어 모두 방향성 피드백이 좋다는 평가",
              "SureFit 로프트 조절로 체격·스윙 변화에 대응하기 쉬움",
            ],
            cons: [
              "2025 LPGA 드라이버 승수는 캘러웨이·PING보다 낮은 편",
              "GT3는 스윙 스피드가 낮으면 비거리 손실이 있을 수 있음",
              "신형 GT 가격대가 높음",
            ],
          },
          {
            title: "3. 테일러메이드 (TaylorMade)",
            description:
              "넬리 코르다·브룩 헨더슨·유해란·윤이나(Qi4D) 등 스타 플레이어가 많은 브랜드입니다. Qi10 Max·Qi10·Qi4D가 LPGA 주력이며, 한국 선수들의 신형 채택 사례도 늘고 있습니다.",
            image: "/promo-assets/blog/pro-driver/taylormade-women.jpg",
            imageAlt: "테일러메이드 여성 투어 드라이버",
            recommendationReasons: [
              "Qi10 Max·Qi4D Max는 가벼운 샤프트 옵션과 높은 관용성",
              "비거리 마케팅·연구개발 이미지가 강해 업그레이드 동기를 주기 쉬움",
              "P770·P7MC 아이언과 함께 쓰는 풀 테일러메이드 백 구성이 흔함",
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
              "G440 K·G440 Max·G430 LST가 LPGA에서 두드러집니다. 리디아 고는 장타계약 없이 G440 K를 선택했고, 2025 시즌 드라이버 승수 6회로 캘러웨이에 이은 성적을 냈습니다. 알리슨 코퍼스·리오나 매귀어 등도 PING 사용자입니다.",
            image: "/promo-assets/blog/pro-driver/ping-women.jpg",
            imageAlt: "PING LPGA 드라이버",
            recommendationReasons: [
              "G440 Max·G430 Max 10K는 미스 히트 관용성이 뛰어나 여성·시니어에 적합",
              "색상·시인성이 좋고 브랜드 신뢰도가 높음",
              "페어웨이·하이브리드 G440 라인과 세트 감각이 맞음",
            ],
            cons: [
              "LST 등 저스핀 모델은 스윙 스피드가 필요",
              "필·사운드가 단단하게 느껴질 수 있음",
              "투어 점유는 캘러웨이·타이틀리스트와 비슷한 구간에서 경쟁",
            ],
          },
          {
            title: "5. 스릭슨 (Srixon)",
            description:
              "LPGA에서 아이언·웨지 점유가 높고, ZXi 드라이버는 2025 메이저 2승(에비안·AIG 여자 오픈)을 기록했습니다. 비거리보다 정확한 볼 플라이트·스핀 관리를 중시하는 선수들이 선택합니다.",
            image: "/promo-assets/blog/pro-driver/srixon-women.jpg",
            imageAlt: "스릭슨 LPGA 드라이버",
            recommendationReasons: [
              "ZXi·ZXi7 아이언과 드라이버를 맞추면 일관된 타구감",
              "메이저 우승 실적으로 투어 신뢰도 상승",
              "빅3 대비 프로모션·가격 경쟁력이 있는 경우가 많음",
            ],
            cons: [
              "드라이버 단독 점유율은 캘러웨이·PING보다 낮음",
              "국내 매장·시타존이 지역별로 적을 수 있음",
              "Max·고관용 라인 선택지가 빅3보다 좁은 편",
            ],
          },
        ],
      },
      {
        heading: "여성·시니어 골퍼 선택 팁",
        body: [
          "LPGA 평균 드라이브 스피드는 약 94mph(약 42m/s) 전후입니다. 이 속도대에서는 10.5°~12° 로프트, 50~55g 경량 샤프트(R·L)가 흔한 조합입니다.",
          "투어 선수의 Triple Diamond·9° 세팅을 그대로 따라 하기보다, Max·GT2·Elyte Max처럼 관용성 라인을 먼저 시타하는 것이 스코어에 유리한 경우가 많습니다.",
          "드라이버만 바꿀 때는 기존 볼 스핀·캐리 거리를 메모해 두고, 핏팅 전후로 비교하면 체감이 분명해집니다.",
        ],
      },
      {
        heading: "마무리",
        body: [
          "LPGA는 캘러웨이와 PING이 드라이버 승수·채택에서 앞서고, 타이틀리스트는 볼·웨지와 함께 강세, 테일러메이드는 스타 마케팅과 Qi 시리즈, 스릭슨은 메이저 검증 ZXi로 각각 강점이 있습니다. 남자편 PGA 브랜드 비교 글과 함께 보면 선택 폭이 넓어집니다. 가격과 재고는 변동될 수 있습니다.",
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
