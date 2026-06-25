import { blogThumbnailAlt, blogThumbnailPath } from "@/lib/blogThumbnailRules";
import { VISIT_KOREA_IMAGE_CREDIT } from "@/lib/visitKoreaAttribution";

export type BlogPostCategory = "course-guide" | "gear-guide" | "beginner-guide";

export type BlogPostSection = {
  heading: string;
  body: string[];
  items?: {
    title: string;
    description: string;
    /** 본문 카드용 이미지 (Visit Korea 등) */
    image?: string;
    /** 두 번째 카드 이미지 */
    image2?: string;
    /** 예: 출처 : ⓒ한국관광콘텐츠랩 */
    imageCredit?: string;
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
  "seoul-par3-golf-top-5",
  "beginner-golf-ball-top-5",
  "value-driver-buying-guide",
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
              "6홀 구성의 대중제 코스로, 짧은 라운드로 필드 감각을 익히기 좋습니다. 참고 요금 정보가 등록되어 있어 비용 비교도 수월합니다. 파주 지역에서 서울 서북부와 접근성이 좋은 편입니다.",
            relatedCourseId: "gc-81becbdb274e",
          },
          {
            title: "올림픽 골프장",
            description:
              "고양시에 위치한 9홀 대중제 코스입니다. 18홀 풀코스보다 짧아 첫 라운드 부담을 줄이기 좋고, 홈페이지와 연락처 정보가 잘 갖춰져 있습니다.",
            relatedCourseId: "gc-18640b625b94",
          },
          {
            title: "라싸GC",
            description:
              "포천 지역 대중제 코스로, 서울 북부에서 이동하기 좋습니다. 홈페이지 정보가 있어 예약·코스 안내를 미리 확인할 수 있습니다.",
            relatedCourseId: "gc-81ecacc0ae41",
          },
          {
            title: "남양주CC",
            description:
              "9홀 대중제 코스로 참고 요금이 등록되어 있습니다. 서울 동북부·남양주 방향 이동 시 후보로 삼기 좋습니다.",
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
    slug: "seoul-par3-golf-top-5",
    title: "서울 근교 Par 3 골프장 TOP 5",
    description:
      "짧은 라운드와 숏게임 연습에 적합한 서울 근교 Par 3·짧은 홀 구성 골프장 후보 5곳과 고를 때의 기준을 정리했습니다.",
    category: "course-guide",
    categoryLabel: CATEGORY_LABELS["course-guide"],
    date: "2026-05-08",
    thumbnail: blogThumbnailPath("seoul-par3-golf-top-5"),
    thumbnailAlt: blogThumbnailAlt("seoul-par3-golf-top-5"),
    relatedCollectionSlug: "near-seoul-par3",
    sections: [
      {
        heading: "Par 3·짧은 코스가 입문에 유리한 이유",
        body: [
          "Par 3 코스나 6~9홀 규모의 짧은 코스는 라운드 시간과 비용 부담을 줄이면서 티샷·어프로치·퍼팅을 균형 있게 연습하기 좋습니다. 스크린에서 필드로 넘어가는 중간 단계로도 많이 활용됩니다.",
          "GolfMap에서는 코스명·홀 수·지역 정보를 기준으로 서울 근교의 짧은 코스 후보를 비교할 수 있습니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "풀 18홀은 부담스럽고, 짧은 라운드로 경험을 쌓고 싶은 분",
          "어프로치·퍼팅 위주로 실전 감각을 키우고 싶은 분",
          "시간·비용을 줄이면서 주 1회 이상 필드를 다니고 싶은 분",
        ],
      },
      {
        heading: "Par 3·짧은 코스 선택 기준",
        body: [
          "홀 수(6홀·8홀·9홀 등)와 예상 라운드 소요 시간",
          "서울 기준 이동 거리와 주차·대중교통 접근성",
          "대중제·퍼블릭 이용 가능 여부",
          "연락처·홈페이지·참고 요금 정보 유무",
        ],
      },
      {
        heading: "서울 근교 Par 3·짧은 코스 TOP 5",
        body: [
          "아래 목록은 GolfMap 등록 정보를 바탕으로 한 비교 후보입니다. 코스가 전 구간 Par 3인지, 일부 홀만 짧은 구성인지는 방문 전 홈페이지에서 확인하는 것이 좋습니다.",
        ],
        items: [
          {
            title: "파주제이퍼블릭골프클럽",
            description:
              "6홀 대중제 코스로, 서울 서북부에서 접근하기 좋습니다. 짧은 라운드로 필드 매너와 동반 플레이 흐름을 익히기에 적합한 후보입니다.",
            relatedCourseId: "gc-81becbdb274e",
          },
          {
            title: "올림픽 골프장",
            description:
              "고양시 9홀 대중제 코스입니다. 수도권 서북부에서 당일 라운드 계획을 세울 때 자주 검색되는 코스 중 하나입니다.",
            relatedCourseId: "gc-18640b625b94",
          },
          {
            title: "강화 선두리 골프장",
            description:
              "인천 강화군 9홀 대중제 코스로, 서울 서부·인천 방향 이동 시 후보가 됩니다. 홈페이지 정보가 있어 사전 문의가 가능합니다.",
            relatedCourseId: "gc-868a31e611a3",
          },
          {
            title: "송도골프클럽",
            description:
              "인천 연수구 8홀 대중제 코스입니다. 인천·서울 남부권에서 짧은 라운드를 찾을 때 비교해 볼 만합니다.",
            relatedCourseId: "gc-68bd427a4957",
          },
          {
            title: "서울 근교 Par 3 컬렉션",
            description:
              "GolfMap에서 Par 3·짧은 코스 조건으로 모아둔 목록입니다. 아래 후보 외 추가 코스를 한곳에서 비교할 수 있습니다.",
            relatedCollectionSlug: "near-seoul-par3",
          },
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "Par 3 골프장 전국",
            description: "전국 Par 3 성격 코스 모음",
            relatedCollectionSlug: "par3",
          },
          {
            title: "9홀 골프장",
            description: "짧은 홀 수 코스 비교",
            relatedCollectionSlug: "nine-hole",
          },
          {
            title: "서울 근교 골프장",
            description: "수도권 접근성 기준 목록",
            relatedCollectionSlug: "near-seoul",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "Par 3·짧은 코스도 시즌·리모델링·운영 방식에 따라 홀 구성이 달라질 수 있습니다. 예약 전 코스 레이아웃과 이용 요금을 공식 채널에서 확인해 주세요.",
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
      "seoul-par3-golf-top-5",
      "seoul-budget-golf-best-5",
      "beginner-golf-essentials-checklist",
      "beginner-golf-ball-top-5",
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
              "서울에서 약 30분, 서인천IC 인근에 위치한 18홀 대중제 코스입니다. 수도권 접근성이 좋아 인천 서부 라운드의 대표 후보로 꼽힙니다. GolfMap 기준 참고 그린피는 22만~26만 원대이며, 난이도는 비교적 낮은 편(약 2.3)으로 등록되어 있습니다. 예약·요금·운영 시간은 방문 전 공식 홈페이지 확인을 권장합니다.",
            relatedCourseId: "gc-60319bf1693c",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "드림파크CC",
            description:
              "1992년부터 2000년까지 매립되었던 제1매립지 상부에 2013년 개장한 친환경 대중 골프장입니다. 인위적 조경을 최소화하고 매립지 지형을 살린 36홀(드림·파크 2코스) 규모입니다. GolfMap 등록명은 드림파크CC이며, 인천 서구에 위치합니다. 홀 수·요금·예약은 공식 홈페이지를 참고하세요.",
            relatedCourseId: "gc-fa86c43067e7",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "베어즈베스트청라GC",
            description:
              "잭 니클라우스가 설계에 참여한 청라 신도시 인근 골프장으로, 세계적인 시그니처 홀을 갖춘 코스로 소개됩니다. GolfMap 기준 27홀 대중제 코스이며, 인천 서구 청라 일대 거주자에게 자주 검색되는 후보입니다. 코스 난이도·그린피·티타임은 시즌별로 달라질 수 있으니 사전 문의가 필요합니다.",
            relatedCourseId: "gc-fa55dbc73e9b",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "송도골프클럽",
            description:
              "1991년 송도 일대에 조성된 친환경 골프장으로, 연수구 송도 생활권과 가깝습니다. 송도 지역 대표 레저 스포츠 시설로 소개됩니다. GolfMap 기준 8홀 대중제 코스로 등록되어 있어, 짧은 라운드·입문 연습 목적에 맞는지 홀 구성을 미리 확인하는 것이 좋습니다.",
            relatedCourseId: "gc-68bd427a4957",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "오렌지듄스 영종골프클럽",
            description:
              "영종도에 위치한 18홀 대중제 코스입니다. 인천공항·영종도 일정과 연계해 검토할 수 있으며, GolfMap 기준 난이도는 약 8.5로 비교적 높게 등록되어 있습니다. 해안·섬 지역 특성상 바람 변수가 클 수 있으니, 라운드 당일 기상과 운영 공지를 확인하세요.",
            relatedCourseId: "gc-496303f3c77c",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "잭니클라우스GC코리아",
            description:
              "송도 국제도시에 위치하며, 세계적인 골프 대회 개최 이력이 있는 코스로 소개됩니다. GolfMap 기준 18홀 대중제 코스이며, 난이도는 약 6.1로 등록되어 있습니다. 프리미엄 코스답게 그린피·예약 조건이 다른 퍼블릭 코스와 다를 수 있으니, 공식 홈페이지에서 최신 정보를 확인하세요.",
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
      "seoul-par3-golf-top-5",
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
              "가평 조종면에 위치한 36홀 대중제 골프장입니다. 산세를 살린 코스로 서울 근교에서 비교적 많이 검색되는 가평 후보 중 하나입니다. GolfMap 기준 참고 그린피는 평일·주말 구간이 나뉘어 있으니 방문 전 요금과 예약 조건을 확인하세요.",
            relatedCourseId: "gc-d14f87b6bb30",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "리앤리CC",
            description:
              "가평 조종면 운악청계 인근 27홀 대중제 코스입니다. 썬힐과 인접 권역이라 동선을 묶어 비교하기 좋습니다. GolfMap에 참고 요금이 등록되어 있어 사전 비교에 활용할 수 있습니다.",
            relatedCourseId: "gc-8503021b2f0d",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "베뉴지CC",
            description:
              "가평읍 일대에 위치한 27홀 대중제 골프장입니다. 가평 시내와 가깝다는 점이 장점으로 꼽힙니다. GolfMap 기준 난이도 정보가 등록되어 있어 코스 성향을 미리 파악할 수 있습니다.",
            relatedCourseId: "gc-068617149ff3",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "가평 베네스트GC",
            description:
              "가평 상면에 조성된 27홀 골프장입니다. 수도권 매립지 관리공사가 운영하는 시설로, 가평 북부 라운드 코스로 자주 언급됩니다. 회원제·대중제 운영 형태와 요금은 시즌별로 달라질 수 있으니 공식 홈페이지 확인이 필요합니다.",
            relatedCourseId: "gc-a8d0095f2145",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "크리스탈밸리CC",
            description:
              "가평 상면 대보간선로 인근 18홀 코스입니다. 계곡 지형을 활용한 코스로 소개되며, 가평 서북부 라운드 후보로 검토할 수 있습니다. 홀 수·요금·예약은 공식 안내를 참고하세요.",
            relatedCourseId: "gc-f0e079a5a368",
            imageCredit: VISIT_KOREA_IMAGE_CREDIT,
          },
          {
            title: "마이다스밸리 청평 골프클럽",
            description:
              "가평 설악면 청평 일대에 위치한 18홀 코스입니다. 청평호·설악 인근 자연 경관과 함께 라운드 계획을 세우기 좋은 위치입니다. GolfMap 등록 정보와 공식 홈페이지를 함께 확인하는 것을 권장합니다.",
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
    slug: "beginner-golf-ball-top-5",
    title: "초보자 골프공 고르는 법과 추천 유형 TOP 5",
    description:
      "처음 골프공을 살 때 알아두면 좋은 선택 기준과, 초보자에게 맞는 공 유형 5가지를 정리했습니다. 특정 제품 순위가 아닌 유형·특성 기준 가이드입니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-04-22",
    thumbnail: blogThumbnailPath("beginner-golf-ball-top-5"),
    thumbnailAlt: blogThumbnailAlt("beginner-golf-ball-top-5"),
    sections: [
      {
        heading: "초보자가 골프공을 고를 때",
        body: [
          "입문 단계에서는 프로가 쓰는 고가 프리미엄볼보다, 비거리·내구·가격 균형이 맞는 연습용·입문용 공이 실용적입니다. 스윙 속도가 아직 일정하지 않을 때는 과도하게 소프트하거나 하이스핀 전용볼이 오히려 방해가 될 수 있습니다.",
          "이 글은 특정 브랜드·모델의 판매 순위가 아니라, 초보자가 이해하기 쉬운 공 유형과 선택 기준을 설명합니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "필드·연습장용으로 첫 골프공을 구매하려는 분",
          "로스트볼이 잦아 비용 부담을 줄이고 싶은 분",
          "스윙 속도·비거리에 맞는 공 특성을 알고 싶은 분",
        ],
      },
      {
        heading: "골프공 선택 기준",
        body: [
          "컴프레션(압축도): 스윙 속도가 느린 편이면 저압축(소프트) 공이 비거리에 유리한 경우가 많습니다.",
          "커버 소재: 우레탄은 스핀·촉감이 좋지만 가격이 높고, 입문에는 서린·이온머 등 내구성 있는 재질이 경제적입니다.",
          "가격 대비 분실률: 초보자는 로스트가 잦으므로 다이존·리커버리볼 활용도 고려합니다.",
          "색상: 화이트 외 옐로·오렌지는 잔디·러프에서 찾기 쉽습니다.",
        ],
      },
      {
        heading: "초보자에게 맞는 골프공 유형 TOP 5",
        body: [
          "아래는 시중에서 흔히 찾아볼 수 있는 유형입니다. 모델명은 매장·시즌마다 다를 수 있으며, 가격과 재고는 변동될 수 있습니다.",
        ],
        items: [
          {
            title: "2피스 저압축(소프트) 볼",
            description:
              "속도가 낮은 스윙에서도 비거리를 내기 쉬운 기본 유형입니다. 연습장·첫 필드 라운드에 무난하며 가격대가 부담이 적은 편입니다.",
          },
          {
            title: "2피스 비거리형(디스턴스) 볼",
            description:
              "롱게임 비거리를 우선할 때 선택하는 유형입니다. 스핀보다 직진성을 강조하는 모델이 많아 티샷이 불안정한 초보에게 도움이 될 수 있습니다.",
          },
          {
            title: "3피스 미드레인지 입문볼",
            description:
              "비거리와 쇼트게임 감각의 균형을 노린 유형입니다. 어느 정도 스윙이 잡힌 뒤 업그레이드 후보로 검토하기 좋습니다.",
          },
          {
            title: "컬러볼(옐로·오렌지 등)",
            description:
              "시인성이 좋아 로스트를 줄이는 데 실질적으로 도움이 됩니다. 동일 스펙이라면 초보자에게 컬러 선택을 권장합니다.",
          },
          {
            title: "리커버리·다이존 연습볼",
            description:
              "분실이 잦은 단계에서는 신품 프리미엄볼 대신 상태 좋은 리커버리볼이나 다이존 대량 구매가 경제적입니다. 스코어 공식 라운드가 아닌 연습 목적에 적합합니다.",
          },
        ],
      },
      {
        heading: "관련 링크",
        body: [],
        items: [
          {
            title: "골프 처음 시작 준비물",
            description: "공 외에 챙겨야 할 기본 장비",
            relatedCollectionSlug: "near-seoul-beginner",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "골프공은 스윙이 발전하면서 바꿔가는 소모품입니다. 처음부터 최고가 모델을 고집하기보다, 연습량과 분실률에 맞는 유형을 고르는 것이 좋습니다. 가격과 재고는 변동될 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "value-driver-buying-guide",
    title: "가성비 드라이버 고르는 법 BEST 5",
    description:
      "초보·중급 골퍼가 가성비 좋은 드라이버를 고를 때 확인할 체크포인트 5가지와 클럽 유형별 선택 팁을 정리했습니다.",
    category: "gear-guide",
    categoryLabel: CATEGORY_LABELS["gear-guide"],
    date: "2026-04-18",
    thumbnail: blogThumbnailPath("value-driver-buying-guide"),
    thumbnailAlt: blogThumbnailAlt("value-driver-buying-guide"),
    sections: [
      {
        heading: "가성비 드라이버를 찾는 이유",
        body: [
          "드라이버는 비거리뿐 아니라 방향성·헤드 용량·샤프트 강도가 스코어에 큰 영향을 줍니다. 신형 프리미엄 모델은 가격이 높지만, 입문·연습 단계에서는 핏팅에 맞는 중가·전시·아울렛 모델이 더 실용적인 경우가 많습니다.",
          "이 글은 특정 제품 랭킹이 아니라, 가성비를 판단하는 선택 기준을 설명합니다.",
        ],
      },
      {
        heading: "이런 분께 추천합니다",
        body: [
          "첫 드라이버 구매 또는 업그레이드를 고민하는 분",
          "비거리보다 방향성·일관성을 우선하는 입문 단계 골퍼",
          "예산 20~50만 원대에서 합리적인 선택을 하고 싶은 분",
        ],
      },
      {
        heading: "드라이버 구매 전 체크포인트",
        body: [
          "로프트: 스윙 속도가 느리면 10.5°~12° 고로프트가 방향성에 유리한 경우가 많습니다.",
          "샤프트 플렉스: R(레귤러)·SR 등 본인 스윙에 맞지 않으면 비거리·방향 모두 손해입니다.",
          "헤드 용량: 460cc 내외의 대용량 헤드는 미스 히트 관용성이 높아 초보에게 흔히 추천됩니다.",
          "중고·아울렛: 상태 확인 후 구매하면 가성비가 크게 올라갑니다.",
        ],
      },
      {
        heading: "가성비 드라이버 선택 기준 BEST 5",
        body: [
          "아래는 구매 결정 시 우선순위를 정하는 기준입니다. 브랜드·모델 순위가 아닙니다. 가격과 재고는 변동될 수 있습니다.",
        ],
        items: [
          {
            title: "고관용(대용량·관용성) 헤드 유형",
            description:
              "페이스 밖 맞춤에도 비거리 손실이 적은 모델이 초보에게 유리합니다. 시타로 본인 스윙에서 미스 히트 시 방향·거리 편차를 비교해 보세요.",
          },
          {
            title: "조절 가능한 로프트·각도 모델",
            description:
              "스윙이 발전하면서 로프트를 바꿀 수 있어 한 클럽을 오래 쓸 수 있습니다. 초기 핏팅 비용을 아끼는 데 도움이 됩니다.",
          },
          {
            title: "본인 스윙 속도에 맞는 샤프트 플렉스",
            description:
              "가장 저렴한 드라이버라도 플렉스가 맞지 않으면 가성비가 없습니다. 매장 핏팅·스윙 속도 측정을 우선 권장합니다.",
          },
          {
            title: "전시·아울렛·신품 이전 세대 모델",
            description:
              "1~2년 전 출시 모델은 성능 대비 가격이 낮은 경우가 많습니다. 기술 차이가 체감되지 않으면 이전 세대가 합리적입니다.",
          },
          {
            title: "커스텀 피팅 후 중고 구매",
            description:
              "샤프트만 본인 스펙으로 교체한 중고 드라이버는 신품 대비 비용을 크게 줄일 수 있습니다. 헤드 상태·샤프트 길이·그립을 반드시 확인하세요.",
          },
        ],
      },
      {
        heading: "마무리",
        body: [
          "드라이버는 '비싼 것'보다 '맞는 것'이 가성비입니다. 구매 전 시타와 핏팅 데이터를 확보하고, 필요하면 프로샵에 샤프트 교체 비용까지 포함해 총액을 비교해 보세요. 가격과 재고는 변동될 수 있습니다.",
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
