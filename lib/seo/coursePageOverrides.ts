import type { Course } from "@/types/course";

export type CoursePageFaqItem = {
  question: string;
  answer: string;
};

export type CoursePageOverride = {
  seoTitle: string;
  metaDescription: string;
  bookingUrl: string;
  faq: CoursePageFaqItem[];
};

/**
 * 네이버 검색 노출이 큰 코스만 보강하는 페이지 단위 설정입니다.
 * 공통 템플릿이나 원본 골프장 데이터는 변경하지 않습니다.
 */
export const COURSE_PAGE_OVERRIDES: Readonly<
  Record<string, CoursePageOverride>
> = {
  "gc-bc41a2489944": {
    seoTitle: "칠곡 아이위시CC 9홀 그린피·예약·코스 안내 | 골프맵",
    metaDescription:
      "칠곡 아이위시CC는 경북 칠곡의 9홀 파36 대중제입니다. 공식 실시간 예약, 변동 그린피, 카트·캐디 조건, 전화번호와 위치를 확인하세요.",
    bookingUrl: "https://www.iwishcc.com/reservation/golf",
    faq: [
      {
        question: "칠곡 아이위시CC는 몇 홀인가요?",
        answer:
          "공식 코스 안내 기준 9홀 파36 대중제 골프장입니다. 예약 상품의 실제 이용 홀 수와 반복 라운드 방식은 예약 화면에서 확인해 주세요.",
      },
      {
        question: "칠곡 아이위시CC는 어떻게 예약하나요?",
        answer:
          "공식 안내는 인터넷 회원 가입 후 홈페이지 또는 모바일 실시간 예약을 이용하도록 안내합니다. 예약 오픈일과 취소 가능 시점은 공식 예약 안내에서 최종 확인하세요.",
      },
      {
        question: "칠곡 아이위시CC 그린피는 얼마인가요?",
        answer:
          "그린피는 월·요일·시간대에 따라 변동됩니다. 표시된 참고 요금만으로 결제 금액을 확정하지 말고 공식 실시간 예약에서 그린피와 카트비·캐디피를 함께 확인하세요.",
      },
      {
        question: "칠곡 아이위시CC 주소와 전화번호는 무엇인가요?",
        answer:
          "주소는 경상북도 칠곡군 기산면 도고산길 109이며, 예약 문의 전화는 054-970-9700입니다. 방문 전 공식 홈페이지의 오시는 길을 다시 확인하세요.",
      },
    ],
  },
  "gc-9655898af6a6": {
    seoTitle: "포웰CC 프린세스 그린피·예약·코스 안내 | 골프맵",
    metaDescription:
      "포웰CC 프린세스의 EAST·WEST 코스와 공식 예약 일정, 변동 그린피, 주소·전화번호를 확인하세요.",
    bookingUrl: "https://www.princessgc.co.kr/reservation/golf",
    faq: [
      {
        question: "포웰CC 프린세스는 몇 홀인가요?",
        answer:
          "공식 코스 안내에는 EAST와 WEST 코스가 소개됩니다. 실제 이용 홀 수와 당일 운영 코스는 예약 정보에서 확인하세요.",
      },
      {
        question: "포웰CC 프린세스는 어떻게 예약하나요?",
        answer:
          "공식 인터넷 예약 페이지에서 날짜별 티타임을 확인할 수 있습니다. 회원·비회원 조건과 예약 가능 여부는 선택한 날짜의 예약 화면을 기준으로 확인하세요.",
      },
      {
        question: "포웰CC 프린세스 그린피는 얼마인가요?",
        answer:
          "그린피는 날짜·시간대·회원 조건에 따라 달라질 수 있습니다. 예약 직전 공식 페이지에서 그린피와 카트비·캐디피, 추가 조건을 확인하세요.",
      },
      {
        question: "포웰CC 프린세스 주소와 전화번호는 무엇인가요?",
        answer:
          "주소는 충청남도 공주시 정안면 방자들길 81-50이며, 고객센터 전화는 041-851-6300입니다.",
      },
    ],
  },
  "gc-0665bc0c6cce": {
    seoTitle: "고령 유니밸리CC 그린피·예약·코스 안내 | 골프맵",
    metaDescription:
      "고령 유니밸리CC는 GolfMap에 9홀 대중제로 등록되어 있습니다. 공식 예약 화면에서 현재 18홀 상품과 이용 홀 수·그린피를 확인하세요.",
    bookingUrl: "https://www.univalley.co.kr/reservation/golf",
    faq: [
      {
        question: "고령 유니밸리CC는 몇 홀인가요?",
        answer:
          "GolfMap에는 9홀 대중제로 등록되어 있습니다. 공식 예약 화면에는 18홀 상품이 표시될 수 있으니 실제 이용 홀 수와 운영 방식은 예약 전에 확인하세요.",
      },
      {
        question: "고령 유니밸리CC는 어떻게 예약하나요?",
        answer:
          "공식 인터넷 예약 페이지에서 날짜와 티타임을 선택할 수 있습니다. 공식 안내상 당일 예약은 전화로만 가능하므로 고객센터에 확인하세요.",
      },
      {
        question: "고령 유니밸리CC 그린피는 얼마인가요?",
        answer:
          "그린피는 시즌·요일·시간대와 이벤트에 따라 변동됩니다. 공식 예약 화면에서 선택한 티타임의 그린피와 카트비·운영 조건을 확인하세요.",
      },
      {
        question: "고령 유니밸리CC 주소와 전화번호는 무엇인가요?",
        answer:
          "주소는 경상북도 고령군 대가야읍 일량로 588이며, 고객센터 전화는 054-956-7575~6입니다.",
      },
    ],
  },
};

export function getCoursePageOverride(
  courseId: string,
): CoursePageOverride | null {
  return COURSE_PAGE_OVERRIDES[courseId] ?? null;
}

export function applyCoursePageOverride(course: Course): Course {
  const override = getCoursePageOverride(course.id);
  if (!override) return course;

  return {
    ...course,
    bookingUrl: override.bookingUrl,
  };
}
