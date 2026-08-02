import type { BlogPost } from "@/lib/blogPosts";
import { VISIT_KOREA_IMAGE_CREDIT } from "@/lib/visitKoreaAttribution";

/**
 * Package: golfmap_capital_two_person_golf_10_package — source of truth 2026-08-02
 * Visual polish: editorial situational images (not course-specific fakes) + HTML table/checklist.
 *
 * courseId 매핑 (repo CSV + Production /courses 검증):
 * - 타이거CC gc-9eb46dae9c9d (18홀·대중제)
 * - 포레스트힐CC gc-b7fd5ee009ca (24홀·대중제)
 * - 지산 퍼블릭 gc-4687a4044d34 (9홀·대중제/퍼블릭)
 * - 한림안성CC gc-16fca0551d98 (9홀·대중제)
 * - 라싸GC gc-81ecacc0ae41 (27홀·대중제)
 * - 인서울27 gc-dd6fca373d1b (27홀·대중제)
 * - 아도니스 퍼블릭 gc-e2614722e86e (9홀·대중제/퍼블릭)
 * - 올림픽CC gc-18640b625b94 (9홀·대중제)
 * - 락가든·드림듄스: GolfMap 데이터셋에 동일 명칭 courseId 없음 → 임의 생성 금지, 공식 URL만 연결
 */
const IMG =
  "/images/blog/capital-region-two-person-golf-courses-10" as const;

export const CAPITAL_REGION_TWO_PERSON_GOLF_10_POST: BlogPost = {
  slug: "capital-region-two-person-golf-courses-10",
  title: "수도권 2인 플레이 가능한 골프장 10곳—단독·노캐디·조인 조건 비교",
  seoTitle: "수도권 2인 플레이 골프장 10곳 | 노캐디·조인·추가요금",
  description:
    "수도권에서 두 명이 예약할 수 있는 골프장 10곳을 단독 2인, 노캐디, 3인 요금, 이벤트, 조인 방식으로 구분했습니다. 공식 홈페이지와 다수의 블로그 후기를 함께 확인했습니다.",
  category: "course-guide",
  categoryLabel: "코스 가이드",
  date: "2026-08-02",
  modifiedAt: "2026-08-02",
  dataCheckedAt: "2026-08-02",
  thumbnail: `${IMG}/two-person-golf-thumbnail.webp`,
  thumbnailAlt:
    "한국 골프장에서 두 명의 골퍼가 여유롭게 2인 라운드를 하는 모습",
  relatedRegionSlug: "gyeonggi",
  relatedCollectionSlug: "near-seoul-public",
  blogRegionLabel: "수도권",
  reasonsHeading: "예약 전 비교 포인트",
  relatedPostSlugs: [
    "seoul-one-hour-public-golf-courses-12",
    "paju-golf-courses-6",
    "pocheon-golf-best-7",
    "seoul-nine-hole-beginner-golf-top-5",
    "first-golf-round-checklist",
  ],
  references: [
    {
      title: "자료 확인 원칙",
      checkedAt: "2026-08-02",
      note: "공식 홈페이지·예약안내를 최우선으로 두고, 네이버·티스토리·독립 블로그에서 반복되는 후기는 ‘후기에서 반복되는 평가’로만 표현. 그린피 숫자는 시즌·요일·티오프·채널 변동이 커 본문에 고정하지 않음. 출처 매트릭스 39행(코스별 공식·후기·교차검증). 본문 상황 이미지는 특정 구장 실사가 아닌 일반 에디토리얼 컷입니다.",
    },
  ],
  quickConclusion: {
    title: "이런 분께 잘 맞아요",
    items: [
      "부부·커플 라운드: 조인 없이 둘만의 페이스로 치고 싶을 때",
      "친구 2명 라운드: 노캐디·셀프 진행이 가능한 시간대를 찾을 때",
      "빠른 진행 선호: 4인 대기보다 적은 인원 구성을 우선할 때",
      "초보 부담 완화: 단축·9홀·연습형 코스로 먼저 경험을 쌓을 때",
    ],
  },
  sections: [
    {
      heading: "‘2인 가능’의 뜻을 먼저 나누세요",
      image: `${IMG}/two-person-round-intro.webp`,
      imageAlt:
        "페어웨이를 따라 이동하는 두 명의 골퍼 — 2인 라운드의 여유로운 분위기",
      imageLayout: "natural",
      body: [
        "두 명이 골프를 치고 싶을 때 가장 큰 문제는 골프장을 찾는 일이 아니라 ‘2인 가능’이라는 말의 뜻을 해석하는 일입니다. 어떤 곳은 둘만 단독으로 플레이할 수 있고, 다른 곳은 두 명이 가도 3인 요금을 내거나 다른 골퍼와 조인됩니다.",
        "공식 홈페이지와 예약안내를 우선 확인하고 네이버·티스토리·독립 골프 블로그에서 반복되는 후기를 함께 비교했습니다. 확인일: 2026년 8월 2일.",
        "핵심: ‘2인 예약 가능’과 ‘둘만 단독 플레이 보장’은 같은 말이 아닙니다.",
      ],
    },
    {
      heading: "먼저 4가지 유형을 구분하세요",
      body: [
        "1. 단독 2인 상시형 — 둘만의 팀으로 예약할 수 있고 공식 2인 요금 또는 팀예약 규정이 명확합니다.",
        "2. 조건부 단독형 — 평일, 야간 3부, 특정 코스 또는 3인 요금 같은 조건이 붙습니다.",
        "3. 공지·이벤트형 — 최근 공식 공지는 확인되지만 상시 정책으로 보기 어렵습니다.",
        "4. 조인형 — 두 명으로 예약은 가능하지만 다른 1~2명이 붙을 수 있습니다.",
        "아래 카드의 ‘운영 정보’ 칩이 이 네 유형을 구분합니다. 단독·조건부·이벤트·조인을 한 배지로 합치지 않았습니다.",
      ],
    },
    {
      heading: "한눈에 보는 2인 플레이 골프장 비교",
      body: [
        "표의 조건은 2026년 8월 2일 기준 공식 안내·공지를 요약한 것입니다. 그린피는 시즌·요일·티오프·채널·인원 추가금에 따라 달라 고정하지 않았습니다. 예약 직전 공식 예약창과 전화 확인을 권장합니다.",
      ],
      table: {
        caption: "한눈에 보는 2인 플레이 골프장 비교",
        columns: [
          "골프장",
          "지역",
          "2인 운영 방식",
          "예약 팁",
          "추천 포인트",
        ],
        rows: [
          [
            "락가든 골프클럽",
            "경기 포천",
            "단독 2인 · 상시형",
            "전 시간대 2인·2인 요금제 문구 확인",
            "조인 없는 노캐디 셀프",
          ],
          [
            "타이거CC",
            "경기 파주",
            "3부 단독 2인 · 시간대 한정",
            "3부 노캐디·추가금 없음 / 1·2부 4인 기준",
            "퇴근 후 2인 18홀",
          ],
          [
            "포레스트힐CC",
            "경기 포천",
            "단독 2인 · 코스·시간 제한",
            "예약창에서 가능 코스·시간대 확인",
            "부담 적은 단축 노캐디",
          ],
          [
            "드림듄스",
            "인천 영종",
            "팀예약 2인 · 상시형",
            "팀예약(2~4인)과 조인예약을 구분",
            "가벼운 숏코스 연습",
          ],
          [
            "지산 퍼블릭",
            "경기 용인",
            "평일 단독 2인 · 요일·비용 조건",
            "주말은 3인 예약·결제 여부 확인",
            "평일 가성비 9홀",
          ],
          [
            "한림안성CC",
            "경기 안성",
            "단독 2인 · 추가비용형",
            "2인이어도 3인 요금 적용 확인",
            "부부·초보 셀프 9홀",
          ],
          [
            "라싸GC",
            "경기 포천",
            "단독 2인 · 3인 요금형",
            "2인 내장 시 3인 그린피·팀 비용 확인",
            "정규 코스 단독성 우선",
          ],
          [
            "인서울27",
            "서울 강서",
            "2·3인 공지형 · 이벤트",
            "공지 기간·추가요금을 예약일 재확인",
            "서울 이동시간 최소화",
          ],
          [
            "아도니스 퍼블릭",
            "경기 포천",
            "월별 이벤트 2인",
            "해당 월 공지·전화예약 조건 확인",
            "포천 9홀 이벤트 공략",
          ],
          [
            "올림픽CC",
            "경기 고양",
            "2인 조인예약 · 조인형",
            "단독 보장이 아님·미조인 시 팀 캐디피",
            "예약 성사·조인 편의",
          ],
        ],
      },
      callout: {
        title: "2인 플레이 예약 전 꼭 확인하세요",
        items: [
          "둘만 단독인지, 아니면 조인이 붙는 상품인지",
          "주중·주말·특정 부(시간대) 제한이 있는지",
          "2명인데 3인·4인 그린피가 적용되는지",
          "노캐디 가능 여부와 카트·진행 책임 범위",
          "카트비·캐디피가 팀 단위로 부과되는지",
          "최종 조건은 공식 예약창·전화로 재확인할지",
        ],
      },
    },
    {
      heading: "단독·조건부·이벤트·조인 10곳",
      body: [
        "아래 순서는 순위가 아니라 비교 순서입니다. ‘공식’과 ‘후기에서 반복’을 분리했고, 그린피 숫자는 새로 넣지 않았습니다. 락가든·드림듄스는 GolfMap 코스 DB에 동일 명칭 항목이 없어 상세 페이지 CTA 대신 공식 예약 안내 링크만 연결했습니다. 개별 구장 사진은 실제 제공 이미지가 있는 곳만 사용했으며, 없는 곳은 텍스트 중심으로 유지합니다.",
      ],
      items: [
        {
          title: "락가든 골프클럽",
          description:
            "경기 포천의 6·9·12·18홀 선택형 코스입니다. 공식 요금표에 모든 라운드 구성의 2인 요금과 전 시간대 2인 라운드 가능을 명시합니다. 블로그와 라운드 후기에서는 둘이서 눈치 보지 않고 셀프 라운드를 하기 좋다는 평가가 가장 반복됩니다. 관리 상태는 호평이 많지만 2인 18홀 요금은 싸지 않다는 반응도 있습니다.",
          recommendationReasons: [
            "유형: 단독 2인 · 상시형 (공식 확인)",
            "캐디: 노캐디",
            "공식: 주중·주말 전 시간대 2인·2인 요금제",
            "후기에서 반복: 조인 없는 셀프, 관리 호평·2인 요금 부담",
            "예약 전 확인: 2인 요금이 3·4인보다 높고 카트·진행을 직접 맡음",
          ],
          regionLabel: "경기 포천",
          courseType: "대중형·선택 홀",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "단독 2인 · 상시형",
          homepage: "https://www.rockgarden.kr/guide/fee",
        },
        {
          title: "타이거CC",
          description:
            "경기 파주의 정규 18홀 대중제입니다. 공식 예약안내에서 3부 노캐디 2~4인 자유 이용과 인원 추가 패널티 없음을 명시합니다. 1·2부는 4인 기준입니다. 블로그 후기에서는 서울 북서부에서 야간 2인 18홀을 잡기 쉽다는 장점이 반복되고, 잔디·그린 상태와 야간 조명 체감은 편차가 큽니다.",
          recommendationReasons: [
            "유형: 3부 단독 2인 · 시간대 한정 (공식 확인)",
            "캐디: 3부 노캐디",
            "공식: 3부 2~4인 자유·추가금 없음 / 1·2부 4인 기준",
            "후기에서 반복: 퇴근 후 야간 2인 접근성, 컨디션·조명 편차",
            "예약 전 확인: 계절별 3부 운영시간과 코스 상태",
          ],
          relatedCourseId: "gc-9eb46dae9c9d",
          regionLabel: "경기 파주",
          holeCount: 18,
          courseType: "대중제",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "3부 단독 2인 · 시간대 한정",
          homepage: "https://www.tigercc.co.kr/reservation/reserGuide.asp",
        },
        {
          title: "포레스트힐CC",
          description:
            "경기 포천의 단축·선택형 대중제 코스입니다. GolfMap 등록 기준 24홀 대중제입니다. 공식 이용요금에 2인 요금과 노캐디 운영을 명시하며 시간대별 인원 제한이 있습니다. 후기에서는 서울 북부 연습형·초보·부부 2인 후보로 자주 언급되고, 6홀 반복형에 대한 호불호도 있습니다.",
          recommendationReasons: [
            "유형: 단독 2인 · 코스·시간 제한 (공식 확인)",
            "캐디: 노캐디",
            "공식: 2인 요금·노캐디·시간대별 인원 제한",
            "후기에서 반복: 부담 적은 단축 라운드, 6홀 반복 호불호",
            "예약 전 확인: 정규 18홀과 동일 비교 금지, 예약창 코스·시간",
          ],
          relatedCourseId: "gc-b7fd5ee009ca",
          regionLabel: "경기 포천",
          holeCount: 24,
          courseType: "대중제",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "단독 2인 · 코스·시간 제한",
          homepage: "https://m.foresthill.kr/html/guide02.asp",
          images: [
            "/promo-assets/blog/tourapi-courses/gc-b7fd5ee009ca/2753756-01.jpg",
            "/promo-assets/blog/tourapi-courses/gc-b7fd5ee009ca/2753756-02.jpg",
            "/promo-assets/blog/tourapi-courses/gc-b7fd5ee009ca/2753756-03.jpg",
          ],
          imageCredit: VISIT_KOREA_IMAGE_CREDIT,
        },
        {
          title: "드림듄스",
          description:
            "인천 영종의 숏코스입니다. 공식 이용방법에 조인 없는 팀예약은 2~4인 신청 가능, 캐디 미동반을 명시합니다. 후기에서는 공항 인접 접근성, 숏게임·실전 감각 연습, 셀프 진행이 장점으로 언급되고, 바람과 숏코스 특성 때문에 정규 라운드 대체재로는 한계가 있다는 의견도 있습니다.",
          recommendationReasons: [
            "유형: 팀예약 2인 · 상시형 (공식 확인)",
            "캐디: 노캐디",
            "공식: 팀예약 2~4인 / 조인예약 별도",
            "후기에서 반복: 접근성·숏게임 연습, 정규 라운드 대체 한계",
            "예약 전 확인: 정규 18홀이 아닌 연습·숏코스 성격",
          ],
          regionLabel: "인천 영종",
          courseType: "숏코스",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "팀예약 2인 · 상시형",
          homepage: "https://www.sky72.com/kr/dunes/info/way.jsp",
        },
        {
          title: "지산 퍼블릭",
          description:
            "경기 용인의 9홀 대중제(퍼블릭)입니다. 공식 예약·요금 페이지에 주중 2인 가능, 주말 2인 시 3인 요금, 노캐디 셀프 운영을 명시합니다. 후기에서는 회원제 옆 퍼블릭이라 관리가 괜찮고 아이언·경사 연습에 좋다는 평가가 많으며, 9홀 반복과 예약 방식이 헷갈린다는 의견도 있습니다.",
          recommendationReasons: [
            "유형: 평일 단독 2인 · 요일·비용 조건 (공식 확인)",
            "캐디: 노캐디",
            "공식: 주중 2인 / 주말 2인은 3인 예약·결제",
            "후기에서 반복: 관리·아이언 연습, 예약 방식 혼동",
            "예약 전 확인: 주말 3인 비용·조인 문구와 실제 단독 여부",
          ],
          relatedCourseId: "gc-4687a4044d34",
          regionLabel: "경기 용인",
          holeCount: 9,
          courseType: "대중제",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "평일 단독 2인 · 요일·비용 조건",
          homepage:
            "https://jisanresort.co.kr/w/reservation/golfResv/public_reserv01.asp",
          images: [
            "/promo-assets/blog/tourapi-courses/gc-4687a4044d34/2746451-01.jpg",
            "/promo-assets/blog/tourapi-courses/gc-4687a4044d34/2746451-02.jpg",
            "/promo-assets/blog/tourapi-courses/gc-4687a4044d34/2746451-03.jpg",
          ],
          imageCredit: VISIT_KOREA_IMAGE_CREDIT,
        },
        {
          title: "한림안성CC",
          description:
            "경기 안성의 9홀 반복형 대중제입니다. 공식 위약·이용안내에 2인 플레이 시 3인 요금 적용을 명시합니다. 후기에서는 자동카트, 셀프 체크인, 비교적 평탄한 9홀을 편하게 도는 부부·초보 코스로 반복 소개됩니다.",
          recommendationReasons: [
            "유형: 단독 2인 · 추가비용형 (공식 확인)",
            "캐디: 노캐디 셀프",
            "공식: 2인 플레이 시 3인 요금",
            "후기에서 반복: 자동카트·셀프 체크인·부부·초보 편의",
            "예약 전 확인: 2명이어도 3인 요금·9홀 반복 구조",
          ],
          relatedCourseId: "gc-16fca0551d98",
          regionLabel: "경기 안성",
          holeCount: 9,
          courseType: "대중제",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "단독 2인 · 추가비용형",
          homepage: "https://ansung.hanlimgolf.co.kr/html/guide03.asp",
        },
        {
          title: "라싸GC",
          description:
            "경기 포천의 정규 규모 대중제(GolfMap 기준 27홀)입니다. 공식 예약안내에 2인 내장 시 3인 그린피 적용을 명시합니다. 후기에서는 정규 코스를 둘이서 플레이할 수 있다는 점이 장점이지만, 3인 그린피와 팀 단위 비용 때문에 체감 가격이 높다는 반응이 많습니다.",
          recommendationReasons: [
            "유형: 단독 2인 · 3인 요금형 (공식 확인)",
            "캐디: 캐디 운영",
            "공식: 2인 내장 가능·3인 그린피",
            "후기에서 반복: 정규 코스 단독성 vs 체감 가격",
            "예약 전 확인: 2인 허용 ≠ 저렴한 2인 라운드",
          ],
          relatedCourseId: "gc-81ecacc0ae41",
          regionLabel: "경기 포천",
          holeCount: 27,
          courseType: "대중제",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "단독 2인 · 3인 요금형",
          homepage: "https://www.lassagc.com/reservation/guide",
        },
        {
          title: "인서울27골프클럽",
          description:
            "서울 강서의 27홀 대중제입니다. 2026년 7월 14일 공식 메인 공지 목록에 2~3인 플레이 가능 안내가 게시되었습니다. 상시 요금표 정책이 아니라 공지·이벤트형으로 봐야 합니다. 후기에서는 서울 안에서 이동 시간을 크게 줄일 수 있다는 평가가 압도적이며, 희소성만큼 가격 부담도 자주 언급됩니다.",
          recommendationReasons: [
            "유형: 2·3인 공지형 · 공지·이벤트형 (공식 공지)",
            "캐디: 예약 조건 확인",
            "공식: 2026-07-14 2~3인 플레이 가능 공지",
            "후기에서 반복: 서울 접근성 강점, 가격 부담",
            "예약 전 확인: 적용 기간·시간대·추가요금을 예약일 재확인",
          ],
          relatedCourseId: "gc-dd6fca373d1b",
          regionLabel: "서울 강서",
          holeCount: 27,
          courseType: "대중제",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "2·3인 공지형 · 공지·이벤트형",
          homepage: "https://inseoul27.co.kr/",
        },
        {
          title: "아도니스 퍼블릭",
          description:
            "경기 포천의 9홀 대중제(퍼블릭)입니다. 공식 월별 이벤트 공지에서 조인 없는 2인 플레이 조건을 반복 안내했으며, 2026년 5·6월 공지에는 5일 전 전화예약·1인 추가요금 조건이 있습니다. 상시 정책이 아니라 월별 이벤트형입니다. 후기에서는 짧고 부담 없는 9홀·포천 북부 연습형 2인 코스로 자주 소개됩니다.",
          recommendationReasons: [
            "유형: 월별 이벤트 2인 · 월별 이벤트형 (공식 공지)",
            "캐디: 예약 조건 확인",
            "공식: 5·6월 조인 없는 2인·전화예약·1인 추가요금",
            "후기에서 반복: 짧은 9홀·연습형 2인",
            "예약 전 확인: 해당 월 공지·전화 가능 여부",
          ],
          relatedCourseId: "gc-e2614722e86e",
          regionLabel: "경기 포천",
          holeCount: 9,
          courseType: "대중제",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "월별 이벤트 2인 · 월별 이벤트형",
          homepage: "https://www.adoniscc.co.kr/public/notice/11751",
        },
        {
          title: "올림픽CC",
          description:
            "경기 고양의 9홀 반복형 대중제입니다. 공식 예약안내에 주중·주말 1~2인 예약 가능과 조인 시스템 운영을 명시합니다. 2인 예약 가능이지 2인 단독 보장이 아닙니다. 후기에서는 서울 북부 접근성과 조인 편의성이 강점으로 반복되며, 조인이 안 되면 팀 캐디피가 부과될 수 있습니다.",
          recommendationReasons: [
            "유형: 2인 조인예약 · 조인형 (공식 확인)",
            "캐디: 캐디 운영",
            "공식: 1~2인 예약 가능·조인 시스템",
            "후기에서 반복: 접근성·조인 편의, 단독 보장 아님",
            "예약 전 확인: 미조인 시 팀 캐디피·실제 팀 구성",
          ],
          relatedCourseId: "gc-18640b625b94",
          regionLabel: "경기 고양",
          holeCount: 9,
          courseType: "대중제",
          priceLabel: "공식 예약창 확인",
          operatingInfo: "2인 조인예약 · 조인형",
          homepage: "https://www.olympicgolf.co.kr/reservation/information",
        },
      ],
    },
    {
      heading: "예약 방식 선택 가이드",
      image: `${IMG}/golf-tee-time-check.webp`,
      imageAlt:
        "라운드 전 티타임·장비를 확인하는 골퍼 — 2인 플레이 예약 준비 장면",
      imageLayout: "natural",
      body: [
        "둘만 조용히 치고 싶다면: 락가든 → 타이거 3부 → 드림듄스 → 포레스트힐 → 한림안성·지산(평일) 순으로 조건을 확인하세요.",
        "2인인데 비용이 비싸지는 흔한 이유: 카트비·캐디피의 팀 단위 부과, 3인 기준 요금, 2인 전용 요금제, 잔여티·이벤트 상품 조건입니다.",
        "예약 전 전화로 물어볼 문장: “두 명만 단독으로 플레이하는 상품인가요, 아니면 조인이 붙나요?” / “2명이 가면 2인 그린피만 내나요, 3인 또는 4인 기준 요금이 적용되나요?” / “캐디피와 카트비는 팀당 얼마이고, 노캐디가 가능한 시간대가 따로 있나요?” / “9홀 반복인지, 정규 18홀인지, 실제 예약 상품의 홀 수가 어떻게 되나요?”",
      ],
    },
    {
      heading: "블로그에서 자주 보이지만 그대로 믿으면 안 되는 정보",
      body: [
        "여러 블로그에 2인 가능이라고 적혀 있어도 과거 이벤트나 평일 잔여티일 수 있습니다.",
        "한양파인은 블로그 목록에 자주 등장하지만 공식 예약안내는 현재 3인 또는 4인 원칙이라 이번 10곳에서 제외했습니다.",
        "빅토리아(과거 이벤트), 페럼(공식 원문 미확인), 더크로스비·마이다스·클럽72·화성GC(현재 공식 조건 미확인)도 본문 코스 카드에 넣지 않았습니다.",
      ],
    },
    {
      heading: "관련 링크",
      body: [],
      items: [
        {
          title: "서울에서 1시간 안팎 퍼블릭 골프장 12곳",
          description: "출발권역별 가까운 퍼블릭 비교",
          relatedPostSlug: "seoul-one-hour-public-golf-courses-12",
        },
        {
          title: "파주 골프장 6곳 비교",
          description: "타이거CC 등 파주 대중제 비교",
          relatedPostSlug: "paju-golf-courses-6",
        },
        {
          title: "포천 골프장 7곳 비교",
          description: "포레스트힐·아도니스 등 포천 비교",
          relatedPostSlug: "pocheon-golf-best-7",
        },
        {
          title: "서울 근교 6·9홀 골프장",
          description: "단축·9홀 상품 비교",
          relatedPostSlug: "seoul-nine-hole-beginner-golf-top-5",
        },
        {
          title: "첫 라운딩 준비물과 비용",
          description: "입문 라운드 체크리스트",
          relatedPostSlug: "first-golf-round-checklist",
        },
        {
          title: "수도권 퍼블릭 지도",
          description: "GolfMap에서 검색·필터로 비교",
          relatedHref: "/map?collection=near-seoul-public&view=list",
        },
      ],
    },
    {
      heading: "자주 묻는 질문",
      body: [
        "2인 플레이 가능이면 정말 둘만 치나요? — 아닙니다. 단독 2인, 3인 요금 적용, 이벤트, 2인 예약 후 조인으로 나뉩니다.",
        "수도권에서 상시 2인이 가장 명확한 곳은 어디인가요? — 락가든은 공식 요금표에 전 시간대 2인을 명시하고, 드림듄스는 팀예약을 2~4인으로 받습니다.",
        "정규 18홀을 둘이서 노캐디로 돌 수 있나요? — 타이거CC 3부가 공식 확인 사례이며 계절별 운영을 확인해야 합니다.",
        "주말 2인도 가능한가요? — 락가든은 주말 2인 요금이 있고, 지산은 주말 2인 시 3인 예약·결제가 필요합니다.",
        "2인 조인은 무엇인가요? — 두 명이 예약한 뒤 다른 골퍼를 연결해 3~4인 팀으로 플레이하는 방식입니다.",
        "노캐디 2인은 초보자에게 좋은가요? — 자유롭지만 진행과 안전을 직접 책임져야 하므로 완전 초보 두 명에게는 캐디 동반이 편할 수 있습니다.",
        "왜 가격을 정확히 적지 않았나요? — 시즌·시간대·예약 채널과 인원 추가금이 자주 바뀌기 때문에 공식 예약창의 최종 조건이 정확합니다.",
      ],
    },
    {
      heading: "마무리",
      image: `${IMG}/relaxed-golf-finish.webp`,
      imageAlt:
        "라운드를 마친 두 골퍼가 카트 쪽으로 이동하는 차분한 마무리 장면",
      imageLayout: "natural",
      body: [
        "둘만 단독으로 치려면 락가든·타이거 3부·드림듄스·포레스트힐을, 비용을 감수할 수 있으면 지산·한림안성·라싸를, 최근 공지를 공략하려면 인서울27·아도니스를, 단독보다 예약 성사가 중요하면 올림픽CC 조인을 우선 확인하세요.",
        "이 글의 정보는 2026년 8월 2일 기준으로 확인했습니다. 운영 방식과 요금은 계속 바뀔 수 있으므로 최종 예약 전 공식 홈페이지를 다시 확인하세요.",
      ],
    },
  ],
};
