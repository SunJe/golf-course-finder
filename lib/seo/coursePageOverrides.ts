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
  displayName?: string;
  address?: string;
  phone?: string;
  homepageUrl?: string;
  searchAliases?: string[];
};

/**
 * 네이버 검색 노출이 큰 코스만 보강하는 페이지 단위 설정입니다.
 * 공통 템플릿이나 원본 골프장 데이터는 변경하지 않습니다.
 */
export const COURSE_PAGE_OVERRIDES: Readonly<
  Record<string, CoursePageOverride>
> = {
  "gc-63e74643a178": {
    seoTitle: "더헤븐CC 27홀 그린피·공식예약·코스 안내 | 골프맵",
    metaDescription:
      "안산 대부도의 더헤븐CC는 바다로 둘러싸인 27홀 골프장입니다. 공식 골프 예약, 변동 그린피, 코스와 예약 전화번호를 확인하세요.",
    bookingUrl:
      "https://www.theheavenresort.com/html/reserve/reserve01_new.asp",
    homepageUrl: "https://www.theheavenresort.com/ISLANDRESORT/main.asp",
    searchAliases: [
      "더헤븐CC",
      "더헤븐GC",
      "더헤븐 컨트리클럽",
      "더헤븐골프클럽",
    ],
    faq: [
      {
        question: "더헤븐CC는 몇 홀인가요?",
        answer:
          "공식 컨트리클럽 안내 기준 3면이 바다로 둘러싸인 총 27홀 코스입니다. 당일 운영 코스와 조합은 예약 정보에서 확인하세요.",
      },
      {
        question: "더헤븐CC는 어떻게 예약하나요?",
        answer:
          "공식 홈페이지의 골프 예약 메뉴에서 로그인 후 예약할 수 있습니다. 예약 가능 날짜와 남은 티타임은 공식 예약 화면에서 확인하세요.",
      },
      {
        question: "더헤븐CC 그린피는 얼마인가요?",
        answer:
          "그린피는 날짜와 시간대, 이용 조건에 따라 달라질 수 있습니다. 공식 그린피 안내와 예약 화면에서 선택한 티타임의 최종 금액을 확인하세요.",
      },
      {
        question: "더헤븐CC 주소와 예약 전화번호는 무엇인가요?",
        answer:
          "공식 홈페이지 기준 주소는 경기도 안산시 단원구 대선로 466이며, 골프 예약 문의는 1533-1001 또는 032-884-1004입니다.",
      },
    ],
  },
  "gc-88fd5807de80": {
    seoTitle: "평창 알펜시아 700CC 18홀 그린피·예약 안내 | 골프맵",
    metaDescription:
      "평창 알펜시아 700GC는 알프스·아시아 코스 18홀 파72입니다. 4주 전 월요일 9시 예약, 4인·캐디 조건과 변동 그린피를 확인하세요.",
    bookingUrl: "https://www.alpensia.com/reservation/index.do",
    homepageUrl: "https://www.alpensia.com/golf/gc700/course-info.do",
    displayName: "알펜시아 700GC",
    searchAliases: [
      "알펜시아 700GC",
      "알펜시아 700CC",
      "알펜시아700cc",
      "알펜시아 700골프클럽",
    ],
    faq: [
      {
        question: "알펜시아 700GC는 몇 홀인가요?",
        answer:
          "공식 코스 안내 기준 알프스 코스 9홀과 아시아 코스 9홀로 구성된 총 18홀 파72 코스입니다.",
      },
      {
        question: "알펜시아 700GC 예약은 언제 열리나요?",
        answer:
          "공식 이용 안내상 예약일 기준 4주 전, 주 단위 월요일 오전 9시부터 홈페이지 실시간 예약이 선착순으로 열립니다.",
      },
      {
        question: "알펜시아 700GC는 2인이나 3인 플레이가 가능한가요?",
        answer:
          "공식 이용 안내에는 2~3인 플레이가 불가하고 1팀 4인 기준이며 캐디 배정이 필수라고 안내되어 있습니다. 결원 시 과금 조건은 예약 전에 확인하세요.",
      },
      {
        question: "알펜시아 700GC 그린피는 얼마인가요?",
        answer:
          "공식 안내는 통합예약의 실시간 그린피를 적용합니다. 날짜와 시간대에 따라 달라질 수 있으므로 예약 화면에서 최종 그린피와 부대비용을 확인하세요.",
      },
    ],
  },
  "gc-825e9c261de2": {
    seoTitle: "코브스윙(구 참밸리CC) 그린피·예약·18홀 안내 | 골프맵",
    metaDescription:
      "포천 코브스윙은 구 참밸리CC가 리브랜딩한 18홀 대중제 골프장입니다. 코브·스윙 9홀씩, 공식 예약, 변동 그린피, 전화번호를 확인하세요.",
    bookingUrl: "https://www.coveswing.com/mobile/reservation/reservation.asp",
    displayName: "코브스윙",
    searchAliases: [
      "코브스윙",
      "코브스윙CC",
      "COVE Swing",
      "참밸리CC",
      "참밸리 컨트리클럽",
    ],
    faq: [
      {
        question: "참밸리CC와 코브스윙은 같은 골프장인가요?",
        answer:
          "네. 포천 참밸리CC는 2026년 코브스윙(COVE Swing)으로 리브랜딩됐습니다. 현재 공식 홈페이지와 예약 페이지는 코브스윙 이름으로 운영됩니다.",
      },
      {
        question: "코브스윙은 몇 홀인가요?",
        answer:
          "공식 코스 안내에는 코브 코스 9홀 파36과 스윙 코스 9홀 파36이 안내되어 있어 총 18홀입니다.",
      },
      {
        question: "코브스윙은 어떻게 예약하나요?",
        answer:
          "공식 홈페이지의 실시간 예약에서 날짜와 코스를 선택할 수 있습니다. 공식 이용안내상 홈페이지 예약은 이용일 3주 전부터 열리며, 실제 티타임과 그린피는 예약 화면에서 확인해야 합니다.",
      },
      {
        question: "코브스윙 그린피는 얼마인가요?",
        answer:
          "공식 이용요금 안내는 월·요일·시간대별로 그린피를 탄력 운영한다고 안내합니다. 예약하려는 날짜의 공식 요금표와 실시간 예약 화면에서 최종 금액을 확인하세요.",
      },
    ],
  },
  "gc-e2614722e86e": {
    seoTitle: "포천 아도니스 퍼블릭 9홀 그린피·예약·2인 안내 | 골프맵",
    metaDescription:
      "포천 아도니스 퍼블릭은 공식 안내 기준 9홀입니다. 2인 예약·조인 방식, 9·18홀 예약, 변동 그린피와 전화번호를 확인하세요.",
    bookingUrl: "https://www.adoniscc.co.kr/public/booking",
    displayName: "아도니스 퍼블릭",
    phone: "031-530-9140",
    homepageUrl: "https://www.adoniscc.co.kr/public",
    faq: [
      {
        question: "아도니스 퍼블릭은 몇 홀인가요?",
        answer:
          "공식 퍼블릭 소개 기준 9홀 코스입니다. 공식 예약은 9홀과 18홀 상품으로 구분되어 있으므로 실제 이용 홀 수는 선택한 예약 상품에서 확인하세요.",
      },
      {
        question: "아도니스 퍼블릭은 2인 예약이 가능한가요?",
        answer:
          "공식 예약 안내상 2인 예약이 가능합니다. 다만 1~3인 예약은 다른 이용자와 조인해 팀이 구성되므로 2인만 단독으로 플레이하는 조건과는 다릅니다.",
      },
      {
        question: "아도니스 퍼블릭은 언제 예약할 수 있나요?",
        answer:
          "공식 안내상 2인 예약과 9홀 예약은 2주 전 같은 요일 00시부터, 3·4인 18홀 예약은 3주 전 같은 요일 00시부터 실시간 예약할 수 있습니다. 당일 예약은 전화로만 가능합니다.",
      },
      {
        question: "아도니스 퍼블릭 그린피는 얼마인가요?",
        answer:
          "그린피는 날짜와 시간대, 월별 이벤트에 따라 달라집니다. 공식 이용요금 공지와 예약 화면에서 선택한 날짜의 9홀·18홀 요금을 최종 확인하세요.",
      },
    ],
  },
  "gc-9bd0f98bfdee": {
    seoTitle: "김해 가야CC 퍼블릭 9홀 그린피·예약·전화번호 | 골프맵",
    metaDescription:
      "김해 가야CC 퍼블릭은 대중제 9홀입니다. 공식 홈페이지 예약, 변동 요금, 인제로 502 주소와 전화번호, 회원제 코스와의 구분을 확인하세요.",
    bookingUrl: "https://www.gayacc.com/reserve.php?location=04",
    displayName: "가야컨트리클럽 퍼블릭",
    address: "경상남도 김해시 인제로 502",
    homepageUrl: "https://www.gayacc.com/main_new.php",
    searchAliases: [
      "가야컨트리클럽 퍼블릭",
      "가야CC 퍼블릭",
      "가야퍼블릭CC",
      "김해 가야퍼블릭CC",
    ],
    faq: [
      {
        question: "가야CC 퍼블릭은 몇 홀인가요?",
        answer:
          "공공데이터와 한국관광공사 안내 기준 가야컨트리클럽은 회원제 45홀과 퍼블릭 9홀로 구성되어 있으며, 이 페이지는 대중제 퍼블릭 9홀을 안내합니다.",
      },
      {
        question: "가야CC 퍼블릭은 어떻게 예약하나요?",
        answer:
          "가야컨트리클럽 공식 홈페이지에서 인터넷 예약과 퍼블릭 예약 메뉴를 운영합니다. 예약 가능 날짜와 이용 조건은 공식 예약 화면에서 최종 확인하세요.",
      },
      {
        question: "가야CC 퍼블릭 그린피는 얼마인가요?",
        answer:
          "그린피와 이용 조건은 예약 날짜와 운영 정책에 따라 달라질 수 있습니다. 고정 가격으로 판단하지 말고 공식 홈페이지의 예약·요금 안내에서 최신 금액을 확인하세요.",
      },
      {
        question: "가야CC 퍼블릭 주소와 전화번호는 무엇인가요?",
        answer:
          "대중제 9홀의 공공데이터 주소는 경상남도 김해시 인제로 502이며, 가야컨트리클럽 대표전화는 055-337-0091입니다. 회원제 45홀은 별도 주소 항목으로 관리되므로 혼동하지 않도록 주의하세요.",
      },
    ],
  },
  "gc-411771a420e7": {
    seoTitle: "골프존카운티 안성W 그린피·예약·18홀 안내 | 골프맵",
    metaDescription:
      "골프존카운티 안성W는 경기 안성의 18홀 파72 대중제입니다. 공식 인터넷·전화 예약, 변동 그린피, 주소와 전화번호를 확인하세요.",
    bookingUrl: "https://www.golfzoncounty.com/reserve/main",
    faq: [
      {
        question: "골프존카운티 안성W는 몇 홀인가요?",
        answer: "공식 골프장 소개 기준 18홀 파72 코스입니다.",
      },
      {
        question: "골프존카운티 안성W 인터넷 예약은 언제 열리나요?",
        answer:
          "공식 예약 안내상 매주 월요일 오전 9시에 오픈 주를 포함해 4주 뒤 월요일부터 일요일까지의 일정이 열립니다. 골프존 회원가입 후 앱과 PC에서 예약할 수 있습니다.",
      },
      {
        question: "골프존카운티 안성W는 전화 예약이 가능한가요?",
        answer:
          "공식 안내 기준 전화 예약 업무시간은 09:00~17:00이며 예약 전화는 031-670-0500입니다.",
      },
      {
        question: "골프존카운티 안성W 그린피는 얼마인가요?",
        answer:
          "그린피와 판매 상품은 날짜와 시간대에 따라 달라질 수 있습니다. 공식 예약 화면에서 선택한 날짜의 그린피와 이용 조건을 확인하세요.",
      },
    ],
  },
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
  "gc-496303f3c77c": {
    seoTitle: "영종 오렌지듄스CC 18홀 그린피·예약 안내 | 골프맵",
    metaDescription:
      "영종 오렌지듄스 골프클럽은 인천공항 인근 18홀 대중제입니다. 공식 추첨·실시간 예약, 변동 그린피, 주소와 전화번호를 확인하세요.",
    bookingUrl: "https://www.orangedunesyj.com/calendar",
    address: "인천광역시 영종구 영종해안남로321번길 184",
    phone: "032-745-3000",
    homepageUrl: "https://www.orangedunesyj.com/",
    searchAliases: [
      "오렌지듄스 영종",
      "영종 오렌지듄스",
      "영종 오렌지듄스CC",
      "오렌지듄스 영종CC",
    ],
    faq: [
      {
        question: "영종 오렌지듄스CC는 몇 홀인가요?",
        answer:
          "공식 골프장 소개 기준 18홀 대중제 골프장입니다. 인천공항 인근 영종도에 있으며 듄스 지형을 살린 코스로 안내됩니다.",
      },
      {
        question: "영종 오렌지듄스CC는 어떻게 예약하나요?",
        answer:
          "공식 홈페이지는 회원가입 후 이용하는 추첨 예약과 실시간 예약을 운영합니다. 예약 가능 날짜와 남은 티타임은 공식 예약 화면에서 확인하세요.",
      },
      {
        question: "영종 오렌지듄스CC 그린피는 얼마인가요?",
        answer:
          "그린피는 날짜·시간대와 운영 정책에 따라 달라질 수 있습니다. 공식 이용요금 안내와 예약 화면에서 선택한 티타임의 최종 금액을 확인하세요.",
      },
      {
        question: "영종 오렌지듄스CC 주소와 전화번호는 무엇인가요?",
        answer:
          "공식 홈페이지 기준 주소는 인천광역시 영종구 영종해안남로321번길 184이며, 대표전화는 032-745-3000입니다.",
      },
    ],
  },
  "gc-f7e7bf534d31": {
    seoTitle: "영천 오션힐스CC 27홀 회원제·예약 안내 | 골프맵",
    metaDescription:
      "영천 오션힐스CC는 경북 영천의 27홀 회원제 골프장입니다. 공식 회원 예약, 코스 안내, 변동 그린피, 주소와 전화번호를 확인하세요.",
    bookingUrl: "https://www.oceanhills.com/reservation/intro",
    homepageUrl: "https://www.oceanhills.com/yc/introduction",
    searchAliases: [
      "오션힐스 영천CC",
      "오션힐스영천CC",
      "영천 오션힐스CC",
      "영천오션힐스CC",
    ],
    faq: [
      {
        question: "영천 오션힐스CC는 몇 홀인가요?",
        answer:
          "GolfMap 등록 정보 기준 27홀 회원제 골프장입니다. 당일 운영 코스와 실제 이용 홀 수는 예약 정보에서 확인하세요.",
      },
      {
        question: "영천 오션힐스CC는 어떻게 예약하나요?",
        answer:
          "공식 홈페이지의 실시간 예약은 로그인 후 이용할 수 있습니다. 공식 약관상 영천 인터넷 예약은 정회원 자격에 제공되므로 예약 자격과 가능 일정은 로그인 후 확인하세요.",
      },
      {
        question: "영천 오션힐스CC 그린피는 얼마인가요?",
        answer:
          "그린피는 날짜·시간대와 회원 조건에 따라 달라질 수 있습니다. 공식 예약 화면과 이용요금 안내에서 적용 요금과 부대비용을 확인하세요.",
      },
      {
        question: "영천 오션힐스CC 주소와 전화번호는 무엇인가요?",
        answer:
          "주소는 경상북도 영천시 임고면 방목길 34-2이며, GolfMap 등록 대표전화는 054-330-9000입니다. 방문 전 공식 홈페이지에서 최신 안내를 확인하세요.",
      },
    ],
  },
  "gc-783a937fe067": {
    seoTitle: "엠스클럽 의성CC 27홀 그린피·통합예약 안내 | 골프맵",
    metaDescription:
      "엠스클럽 의성CC는 챔피언·마스터·챌린저 27홀 대중제입니다. CLUB LONGE 통합예약, 변동 그린피, 주소와 전화번호를 확인하세요.",
    bookingUrl: "https://www.clublonge.com/Reservation",
    homepageUrl: "https://www.clublonge.com/Club/uiseong/Information",
    searchAliases: [
      "엠스클럽의성",
      "엠스클럽 의성",
      "엠스클럽 의성CC",
      "의성 엠스클럽",
    ],
    faq: [
      {
        question: "엠스클럽 의성CC는 몇 홀인가요?",
        answer:
          "공식 코스 안내 기준 챔피언·마스터·챌린저 코스 각 9홀, 총 27홀입니다. 예약 상품에서 당일 운영 코스와 조합을 확인하세요.",
      },
      {
        question: "엠스클럽 의성CC는 어떻게 예약하나요?",
        answer:
          "현재 공식 예약은 CLUB LONGE 통합 홈페이지에서 제공합니다. 기존 골프장 회원도 통합 사이트 회원가입이 필요하다고 안내되므로 로그인 후 예약 가능 일정을 확인하세요.",
      },
      {
        question: "엠스클럽 의성CC 그린피는 얼마인가요?",
        answer:
          "그린피는 날짜·시간대와 상품에 따라 달라질 수 있습니다. CLUB LONGE 공식 예약 화면에서 선택한 티타임의 그린피와 이용 조건을 확인하세요.",
      },
      {
        question: "엠스클럽 의성CC 주소와 전화번호는 무엇인가요?",
        answer:
          "주소는 경상북도 의성군 봉양면 농공마전길 125-78이며, 대표전화는 054-830-3300입니다. 방문 전 공식 홈페이지에서 최신 안내를 확인하세요.",
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
    name: override.displayName ?? course.name,
    address: override.address ?? course.address,
    phone: override.phone ?? course.phone,
    homepageUrl: override.homepageUrl ?? course.homepageUrl,
    searchAliases: override.searchAliases ?? course.searchAliases,
    bookingUrl: override.bookingUrl,
  };
}
