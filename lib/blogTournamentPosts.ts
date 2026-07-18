import type { BlogPost } from "@/lib/blogPosts";
import { blogThumbnailAlt, blogThumbnailPath } from "@/lib/blogThumbnailRules";

const TOURNAMENT_CATEGORY = "tournament-guide" as const;
const TOURNAMENT_LABEL = "대회 가이드";
const CHECKED_AT = "2026-07-18";
const PUBLISH_DATE = "2026-07-18";

const SHARED_REFS: NonNullable<BlogPost["references"]> = [
  {
    title: "PGA TOUR 2026 Schedule",
    publisher: "PGA TOUR",
    url: "https://www.pgatour.com/schedule/2026",
    checkedAt: CHECKED_AT,
  },
  {
    title: "LPGA Tournaments",
    publisher: "LPGA",
    url: "https://www.lpga.com/tournaments",
    checkedAt: CHECKED_AT,
  },
  {
    title: "KPGA 투어 일정",
    publisher: "KPGA",
    url: "https://www.kpga.co.kr/tours/schedule/schedule/?tourId=11",
    checkedAt: CHECKED_AT,
  },
  {
    title: "KLPGA 투어 일정",
    publisher: "KLPGA",
    url: "https://klpga.co.kr/web/tour/schedule",
    checkedAt: CHECKED_AT,
  },
];

export const TOURNAMENT_BLOG_POSTS: BlogPost[] = [
  {
    slug: "2026-golf-tournament-schedule-august-october",
    title: "2026 골프대회 일정 총정리: 8월·9월·10월 PGA·LPGA·KPGA·KLPGA",
    description:
      "2026년 8월·9월·10월 PGA TOUR·LPGA·KPGA·KLPGA 일정을 월별 글로 연결하는 허브입니다. FedExCup 플레이오프, Solheim Cup, BMW Ladies Championship까지 한곳에서 확인하세요.",
    category: TOURNAMENT_CATEGORY,
    categoryLabel: TOURNAMENT_LABEL,
    date: PUBLISH_DATE,
    dataCheckedAt: CHECKED_AT,
    thumbnail: blogThumbnailPath(
      "2026-golf-tournament-schedule-august-october",
    ),
    thumbnailAlt: blogThumbnailAlt(
      "2026-golf-tournament-schedule-august-october",
    ),
    relatedPostSlugs: [
      "2026-august-golf-tournament-schedule",
      "2026-september-golf-tournament-schedule",
      "2026-october-golf-tournament-schedule",
      "2026-mediheal-hankook-ilbo-montvert-guide",
      "2026-bmw-ladies-championship-guide",
      "pocheon-golf-best-7",
    ],
    references: SHARED_REFS,
    sections: [
      {
        heading: "8월·9월·10월 일정을 한곳에서",
        body: [
          "2026년 늦여름부터 가을까지는 국내외 골프 투어의 흐름이 빠르게 바뀌는 시기입니다. 8월에는 PGA TOUR FedExCup 플레이오프가 진행되고, 9월에는 Solheim Cup과 Presidents Cup 같은 팀 대항전이 열립니다. 10월에는 LPGA 아시아 일정과 국내 남녀 투어 대회가 연이어 예정돼 있습니다.",
          "이 페이지는 2026년 8월·9월·10월 월별 일정 글을 연결하는 허브입니다. 구체적인 대회 기간과 개최 코스는 각 월별 글에서 확인하세요.",
          "최종 확인일: 2026년 7월 18일. 대회명, 장소, 상금, 티켓과 중계 편성은 변경될 수 있습니다. 출발이나 예매 전 각 투어 공식 페이지를 다시 확인하세요.",
        ],
      },
      {
        heading: "월별 일정 바로가기",
        body: [
          "월별 상세 일정과 국내 관전 가이드는 아래 표와 링크에서 바로 이어갈 수 있습니다.",
        ],
        table: {
          caption: "2026년 8~10월 월별 일정 바로가기",
          columns: ["월", "핵심 일정", "상세 글"],
          rows: [
            [
              "8월",
              "PGA TOUR 플레이오프, 메디힐·한국일보 챔피언십, AIG Women's Open",
              "2026년 8월 골프대회 일정",
            ],
            [
              "9월",
              "Solheim Cup, Presidents Cup, KLPGA·KPGA 가을 일정",
              "2026년 9월 골프대회 일정",
            ],
            [
              "10월",
              "BMW Ladies Championship, LPGA 아시아 스윙, 국내 투어 종반전",
              "2026년 10월 골프대회 일정",
            ],
          ],
        },
        items: [
          {
            title: "2026년 8월 골프대회 일정",
            description:
              "PGA TOUR FedExCup 플레이오프와 KLPGA 국내 대회를 포함한 8월 일정표입니다.",
            relatedPostSlug: "2026-august-golf-tournament-schedule",
          },
          {
            title: "2026년 9월 골프대회 일정",
            description:
              "Solheim Cup·Presidents Cup과 국내 가을 투어 일정을 정리했습니다.",
            relatedPostSlug: "2026-september-golf-tournament-schedule",
          },
          {
            title: "2026년 10월 골프대회 일정",
            description:
              "BMW Ladies Championship과 LPGA 아시아 스윙, 국내 종반전 일정입니다.",
            relatedPostSlug: "2026-october-golf-tournament-schedule",
          },
        ],
      },
      {
        heading: "8월에 주목할 대회",
        body: [
          "PGA TOUR는 Wyndham Championship 뒤 FedEx St. Jude Championship, BMW Championship, TOUR Championship으로 이어집니다. 국내에서는 몽베르에서 열리는 메디힐·한국일보 챔피언십과 포천힐스에서 예정된 KLPGA 챔피언십을 기존 GolfMap 포천 콘텐츠와 연결해 볼 수 있습니다.",
        ],
        items: [
          {
            title: "메디힐·한국일보 챔피언십 몽베르 관전 가이드",
            description:
              "8월 13~16일 포천 몽베르 개최 예정 대회의 일정·티켓·주차 확인 포인트입니다.",
            relatedPostSlug: "2026-mediheal-hankook-ilbo-montvert-guide",
          },
          {
            title: "포천 골프장 7곳 비교",
            description:
              "몽베르·아도니스·포천힐스 등 포천권 대중제 골프장을 비교한 기존 가이드입니다.",
            relatedPostSlug: "pocheon-golf-best-7",
          },
        ],
      },
      {
        heading: "9월에 주목할 대회",
        body: [
          "LPGA의 Solheim Cup과 PGA TOUR의 Presidents Cup은 일반 스트로크플레이가 아닌 팀 대항전입니다. 국내에서는 KLPGA와 KPGA의 가을 일정이 재개되므로 공식 장소와 티켓 공지를 함께 확인하는 편이 좋습니다.",
        ],
      },
      {
        heading: "10월에 주목할 대회",
        body: [
          "LPGA는 하와이, 상하이, 한국, 말레이시아로 이어집니다. 한국에서 열리는 BMW Ladies Championship은 10월 22~25일 전남 해남 파인비치 골프링크스에서 예정돼 있습니다.",
        ],
        items: [
          {
            title: "BMW 레이디스 챔피언십 관전 가이드",
            description:
              "해남 파인비치에서 열리는 LPGA 대회의 티켓·이동·관람 준비 정보를 정리했습니다.",
            relatedPostSlug: "2026-bmw-ladies-championship-guide",
          },
        ],
      },
      {
        heading: "이 시리즈를 보는 방법",
        body: [
          "일정만 빠르게 확인하려면 월별 표를 봅니다.",
          "한국 개최 대회를 직접 관람하려면 별도 관전 가이드를 확인합니다.",
          "개최 코스가 GolfMap에 등록돼 있으면 코스 상세 페이지와 지역 비교 글로 연결합니다.",
          "중계 시작 시각은 시차와 방송 편성에 따라 바뀌므로 글에 고정하지 않습니다.",
        ],
      },
      {
        heading: "자주 묻는 질문",
        body: [
          "일정은 한국 날짜 기준인가요? — KPGA와 KLPGA는 한국 날짜 기준이고, PGA TOUR와 LPGA는 공식 현지 대회 기간을 표시합니다. 한국 시청 시 날짜가 하루 넘어갈 수 있습니다.",
          "대회 일정이 바뀌면 어떻게 하나요? — 월별 글 상단의 최종 확인일을 갱신하고 변경된 대회명·장소만 수정합니다. 미정 항목은 공식 발표 전까지 추측하지 않습니다.",
          "모든 대회의 티켓 정보가 있나요? — 아닙니다. 티켓·주차·셔틀이 공식 발표된 한국 개최 대회만 별도 가이드에 반영합니다.",
        ],
      },
    ],
  },
  {
    slug: "2026-august-golf-tournament-schedule",
    title: "2026년 8월 골프대회 일정: PGA·LPGA·KPGA·KLPGA",
    description:
      "2026년 8월 PGA TOUR FedExCup 플레이오프, LPGA, KPGA, KLPGA 일정을 정리했습니다. 메디힐·한국일보 챔피언십 등 국내 관전 포인트도 함께 확인하세요.",
    category: TOURNAMENT_CATEGORY,
    categoryLabel: TOURNAMENT_LABEL,
    date: PUBLISH_DATE,
    dataCheckedAt: CHECKED_AT,
    thumbnail: blogThumbnailPath("2026-august-golf-tournament-schedule"),
    thumbnailAlt: blogThumbnailAlt("2026-august-golf-tournament-schedule"),
    tournamentCalendarMonth: "2026-08",
    relatedPostSlugs: [
      "2026-golf-tournament-schedule-august-october",
      "2026-september-golf-tournament-schedule",
      "2026-october-golf-tournament-schedule",
      "2026-mediheal-hankook-ilbo-montvert-guide",
      "pocheon-golf-best-7",
    ],
    references: [
      ...SHARED_REFS,
      {
        title: "메디힐·한국일보 챔피언십",
        publisher: "KLPGA",
        url: "https://klpga.co.kr/web/tourInfo/tourInfo?gameCode=2026080003",
        checkedAt: CHECKED_AT,
      },
    ],
    sections: [
      {
        heading: "2026년 8월 골프 시즌 개요",
        body: [
          "2026년 8월은 PGA TOUR의 시즌 결산 구간과 KLPGA의 국내 대회가 동시에 이어지는 달입니다. 아래 일정은 2026년 7월 18일 기준이며, 해외 대회는 현지 날짜 기준입니다.",
          "한국 중계 시간은 아직 고정하지 않습니다. 방송사 편성과 현지 티타임에 따라 바뀔 수 있습니다.",
          "최종 확인일: 2026년 7월 18일. 일정은 변경될 수 있습니다.",
        ],
      },
      {
        heading: "8월 일정 빠른 요약",
        body: [
          "KLPGA: 제주삼다수 마스터스, 메디힐·한국일보 챔피언십 등",
          "KPGA: 동아회원권그룹 오픈",
          "LPGA: AIG Women's Open, Portland Classic, CPKC Women's Open, FM Championship",
          "PGA TOUR: Wyndham Championship과 FedExCup 플레이오프 3개 대회",
        ],
      },
      {
        heading: "KLPGA 8월 일정",
        body: [
          "국내 여자 투어는 제주·포천·써닝포인트 일정으로 이어집니다. 티켓과 셔틀은 대회별 공식 공지를 확인하세요.",
        ],
        table: {
          caption: "KLPGA 2026년 8월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "8월 6~9일",
              "제13회 제주삼다수 마스터스",
              "테디밸리 골프앤리조트",
              "최종 공지 재확인",
            ],
            [
              "8월 13~16일",
              "메디힐·한국일보 챔피언십",
              "몽베르 · 명성산 OUT/IN",
              "12억원",
            ],
            [
              "8월 20~23일",
              "BC카드·한경 제48회 KLPGA 챔피언십",
              "포천힐스CC",
              "최종 공지 재확인",
            ],
            [
              "8월 27~30일",
              "제15회 KG 레이디스 오픈",
              "써닝포인트CC",
              "최종 공지 재확인",
            ],
          ],
        },
      },
      {
        heading: "메디힐·한국일보 챔피언십",
        body: [
          "8월 13~16일 포천 몽베르 명성산 OUT·IN 코스에서 열리며 총상금은 12억원, 경기 방식은 72홀 스트로크플레이입니다.",
        ],
        items: [
          {
            title: "메디힐·한국일보 챔피언십 몽베르 관전 가이드",
            description:
              "티켓·주차·셔틀과 관람 전 확인 사항을 정리한 별도 가이드입니다.",
            relatedPostSlug: "2026-mediheal-hankook-ilbo-montvert-guide",
          },
          {
            title: "포천 골프장 7곳 비교",
            description: "몽베르를 포함한 포천권 대중제 골프장 비교 글입니다.",
            relatedPostSlug: "pocheon-golf-best-7",
          },
          {
            title: "몽베르CC(퍼블릭)",
            description:
              "대회 개최 예정 코스입니다. 일반 라운드 예약은 골프장 공식 안내를 별도로 확인하세요.",
            relatedCourseId: "gc-9d709ff43c33",
            courseCardVariant: "tournament",
            tournamentEventName: "메디힐·한국일보 챔피언십",
            tournamentEventDates: "2026-08-13 ~ 2026-08-16",
            tournamentOfficialUrl:
              "https://klpga.co.kr/web/tourInfo/tourInfo?gameCode=2026080003",
            recommendationReasons: [
              "2026 메디힐·한국일보 챔피언십 개최 예정 코스",
              "명성산 OUT·IN 사용 예정",
              "대회 기간 일반 예약 여부 별도 확인",
              "티켓·셔틀은 KLPGA 공식 공지 우선",
            ],
          },
        ],
      },
      {
        heading: "KPGA 8월 일정",
        body: [
          "동아회원권그룹 오픈은 8월 20~23일 솔라고CC에서 예정돼 있습니다. 일정과 총상금은 KPGA 공식 페이지에서 최종 확인하세요.",
        ],
        table: {
          caption: "KPGA 2026년 8월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            ["8월 20~23일", "동아회원권그룹 오픈", "솔라고CC", "7억원"],
          ],
        },
      },
      {
        heading: "LPGA 8월 일정",
        body: [
          "AIG Women's Open은 7월 30일 시작해 8월 2일 끝나는 월간 경계 대회입니다. 월별 검색 편의를 위해 8월 글에도 포함했습니다.",
        ],
        table: {
          caption: "LPGA 2026년 8월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "7월 30일~8월 2일",
              "AIG Women's Open",
              "Royal Lytham & St. Annes Golf Club",
              "$10M",
            ],
            [
              "8월 13~16일",
              "The Standard Portland Classic",
              "Columbia Edgewater Country Club",
              "$2M",
            ],
            [
              "8월 20~23일",
              "CPKC Women's Open",
              "Royal Mayfair Golf Club",
              "$2.75M",
            ],
            ["8월 27~30일", "FM Championship", "TPC Boston", "$4.4M"],
          ],
        },
      },
      {
        heading: "PGA TOUR 8월 일정",
        body: [
          "정규 시즌 마지막 대회인 Wyndham Championship 뒤에 FedEx St. Jude Championship, BMW Championship, TOUR Championship이 순서대로 이어집니다.",
        ],
        table: {
          caption: "PGA TOUR 2026년 8월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "8월 6~9일",
              "Wyndham Championship",
              "Sedgefield Country Club",
              "—",
            ],
            [
              "8월 13~16일",
              "FedEx St. Jude Championship",
              "TPC Southwind",
              "FedExCup Playoffs",
            ],
            [
              "8월 20~23일",
              "BMW Championship",
              "Bellerive Country Club",
              "FedExCup Playoffs",
            ],
            [
              "8월 27~30일",
              "TOUR Championship",
              "East Lake Golf Club",
              "FedExCup Playoffs",
            ],
          ],
        },
      },
      {
        heading: "FedExCup 플레이오프 흐름",
        body: [
          "정규 시즌 마지막 대회인 Wyndham Championship 뒤에 FedEx St. Jude Championship, BMW Championship, TOUR Championship이 순서대로 이어집니다. 매 대회가 같은 출전 규모로 진행된다고 단정하지 말고 PGA TOUR의 최신 FedExCup 순위와 출전 명단을 확인하세요.",
        ],
      },
      {
        heading: "8월에 직접 관람하기 좋은 국내 대회",
        body: [
          "포천에서 열리는 KLPGA 대회들은 GolfMap의 포천 지역 콘텐츠와 연결하기 좋습니다. 다만 티켓, 갤러리 주차장과 셔틀은 대회별 공식 공지가 나온 뒤 확인해야 합니다.",
        ],
        items: [
          {
            title: "포천힐스CC",
            description:
              "KLPGA 챔피언십 개최 예정지로 안내된 코스입니다. 최종 운영·갤러리 안내는 공식 공지를 확인하세요.",
            relatedCourseId: "gc-564e2ae6067a",
            courseCardVariant: "tournament",
            tournamentEventName: "BC카드·한경 제48회 KLPGA 챔피언십",
            tournamentEventDates: "2026-08-20 ~ 2026-08-23",
            recommendationReasons: [
              "2026 KLPGA 챔피언십 개최 예정지로 안내",
              "대회 기간 일반 예약·출입은 별도 확인",
              "갤러리 주차·셔틀은 대회 공식 공지 우선",
              "최종 공지 재확인 필요",
            ],
          },
          {
            title: "써닝포인트 컨트리클럽",
            description:
              "KG 레이디스 오픈 개최 예정지로 안내된 코스입니다. 최종 공지를 다시 확인하세요.",
            relatedCourseId: "gc-c45d3f5d316d",
            courseCardVariant: "tournament",
            tournamentEventName: "제15회 KG 레이디스 오픈",
            tournamentEventDates: "2026-08-27 ~ 2026-08-30",
            recommendationReasons: [
              "2026 KG 레이디스 오픈 개최 예정지로 안내",
              "대회 기간 일반 예약·출입은 별도 확인",
              "갤러리 주차·셔틀은 대회 공식 공지 우선",
              "최종 공지 재확인 필요",
            ],
          },
        ],
      },
      {
        heading: "자주 묻는 질문",
        body: [
          "8월 PGA TOUR에서 가장 중요한 구간은 무엇인가요? — FedEx St. Jude Championship부터 TOUR Championship까지 이어지는 FedExCup 플레이오프 구간입니다.",
          "AIG Women's Open은 왜 8월 일정에 있나요? — 대회가 7월 30일 시작해 8월 2일 끝나기 때문에 8월에 결승 라운드가 진행됩니다.",
          "국내 대회 입장권은 어디서 확인하나요? — KLPGA·KPGA 공식 대회 페이지의 티켓 또는 갤러리 공지를 확인하세요. 발표 전 내용을 추측해서 안내하지 않습니다.",
        ],
      },
      {
        heading: "일정 변경 안내",
        body: [
          "이 글의 최종 확인일은 2026년 7월 18일입니다. 대회 장소와 세부 운영은 변경될 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "2026-september-golf-tournament-schedule",
    title: "2026년 9월 골프대회 일정: PGA·LPGA·KPGA·KLPGA",
    description:
      "2026년 9월 Solheim Cup·Presidents Cup과 KLPGA·KPGA 가을 일정, PGA TOUR FedExCup Fall 일정을 정리했습니다.",
    category: TOURNAMENT_CATEGORY,
    categoryLabel: TOURNAMENT_LABEL,
    date: PUBLISH_DATE,
    dataCheckedAt: CHECKED_AT,
    thumbnail: blogThumbnailPath("2026-september-golf-tournament-schedule"),
    thumbnailAlt: blogThumbnailAlt("2026-september-golf-tournament-schedule"),
    tournamentCalendarMonth: "2026-09",
    relatedPostSlugs: [
      "2026-golf-tournament-schedule-august-october",
      "2026-august-golf-tournament-schedule",
      "2026-october-golf-tournament-schedule",
      "pocheon-golf-best-7",
    ],
    references: SHARED_REFS,
    sections: [
      {
        heading: "2026년 9월 골프 시즌 개요",
        body: [
          "2026년 9월에는 일반 스트로크플레이 대회뿐 아니라 Solheim Cup과 Presidents Cup 같은 팀 대항전이 예정돼 있습니다. 국내 투어도 가을 일정이 이어지지만 일부 장소는 최종 발표를 다시 확인해야 합니다.",
          "최종 확인일: 2026년 7월 18일. 일정은 변경될 수 있습니다.",
        ],
      },
      {
        heading: "KLPGA 9월 일정",
        body: [
          "OK저축은행 읏맨 오픈이 포천 아도니스에서 확정될 경우 기존 포천 비교 글과 연결할 수 있습니다.",
          "하나금융그룹 챔피언십의 장소처럼 최종 공지가 필요한 항목은 배포 직전 KLPGA 공식 일정에서 다시 확인합니다.",
        ],
        table: {
          caption: "KLPGA 2026년 9월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "9월 3~6일",
              "KB금융 골든라이프 챔피언십",
              "블랙스톤 이천",
              "최종 공지 재확인",
            ],
            [
              "9월 4~6일",
              "OK저축은행 읏맨 오픈",
              "포천 아도니스",
              "최종 공지 재확인",
            ],
            [
              "9월 17~20일",
              "하나금융그룹 챔피언십",
              "공식 최종 공지 확인",
              "최종 공지 재확인",
            ],
            [
              "9월 25~27일",
              "K-FOOD 놀부·화미 마스터즈",
              "클럽72 하늘코스",
              "최종 공지 재확인",
            ],
          ],
        },
        items: [
          {
            title: "포천 골프장 7곳 비교",
            description:
              "포천 아도니스 등 포천권 코스를 비교할 때 참고할 수 있는 글입니다.",
            relatedPostSlug: "pocheon-golf-best-7",
          },
          {
            title: "포천아도니스 퍼블릭",
            description:
              "OK저축은행 읏맨 오픈 개최지로 안내된 코스입니다. 최종 공지 후 연결을 유지합니다.",
            relatedCourseId: "gc-e2614722e86e",
            courseCardVariant: "tournament",
            tournamentEventName: "OK저축은행 읏맨 오픈",
            tournamentEventDates: "2026-09-04 ~ 2026-09-06",
            recommendationReasons: [
              "2026 OK저축은행 읏맨 오픈 개최지로 안내",
              "대회 기간 일반 예약·출입은 별도 확인",
              "갤러리 주차·셔틀은 대회 공식 공지 우선",
              "최종 공지 재확인 필요",
            ],
          },
        ],
      },
      {
        heading: "KPGA 9월 일정",
        body: [
          "KPGA 가을 일정은 대회명과 날짜가 먼저 공지되고 개최 코스가 이후 변경될 수 있으므로, 장소가 확인되지 않은 상태에서 임의의 골프장을 연결하지 않습니다.",
        ],
        table: {
          caption: "KPGA 2026년 9월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "9월 3~6일",
              "인스앤코 인비테이셔널",
              "KPGA 공식 일정 확인",
              "최종 공지 재확인",
            ],
            [
              "9월 10~13일",
              "제42회 신한동해오픈",
              "KPGA 공식 일정 확인",
              "최종 공지 재확인",
            ],
            [
              "9월 17~20일",
              "골프존 오픈",
              "KPGA 공식 일정 확인",
              "최종 공지 재확인",
            ],
          ],
        },
      },
      {
        heading: "LPGA 9월 일정",
        body: [
          "미국과 유럽 여자 골프 대표팀이 맞붙는 Solheim Cup은 일반 LPGA 대회의 개인 스트로크플레이 순위와 다른 방식으로 진행됩니다.",
        ],
        table: {
          caption: "LPGA 2026년 9월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "9월 11~13일",
              "Solheim Cup",
              "Bernardus Golf",
              "USA vs Europe team match",
            ],
            [
              "9월 25~27일",
              "Walmart NW Arkansas Championship presented by P&G",
              "Pinnacle Country Club",
              "$3M",
            ],
          ],
        },
      },
      {
        heading: "Solheim Cup은 어떤 대회인가요?",
        body: [
          "미국과 유럽 여자 골프 대표팀이 맞붙는 팀 대항전입니다. 일반 LPGA 대회의 개인 스트로크플레이 순위와 다른 방식으로 진행됩니다.",
        ],
      },
      {
        heading: "PGA TOUR 9월 일정",
        body: [
          "Biltmore Championship Asheville은 2026 FedExCup Fall의 첫 대회입니다. Presidents Cup 뒤 Bank of Utah Championship 대회 주간이 9월 28일 시작되지만 실제 경쟁 라운드는 10월 1~4일로 예정돼 있어 10월 글에도 포함합니다.",
        ],
        table: {
          caption: "PGA TOUR 2026년 9월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "9월 17~20일",
              "Biltmore Championship Asheville",
              "The Cliffs at Walnut Cove",
              "FedExCup Fall",
            ],
            [
              "9월 24~27일",
              "Presidents Cup",
              "Medinah Country Club",
              "USA vs International team match",
            ],
            [
              "9월 28일~10월 4일",
              "Bank of Utah Championship",
              "Black Desert Resort",
              "FedExCup Fall",
            ],
          ],
        },
      },
      {
        heading: "9월에 주목할 포인트",
        body: [
          "Solheim Cup: 미국 대 유럽 여자 팀 대항전",
          "Presidents Cup: 미국 대 인터내셔널 남자 팀 대항전",
          "국내 투어: 최종 장소와 갤러리 안내 재확인",
          "월말 대회: 9월과 10월 일정에 중복 표기될 수 있음",
        ],
      },
      {
        heading: "자주 묻는 질문",
        body: [
          "Solheim Cup과 Presidents Cup은 같은 대회인가요? — 아닙니다. Solheim Cup은 미국과 유럽 여자 대표팀, Presidents Cup은 미국과 인터내셔널 남자 대표팀의 대항전입니다.",
          "9월 말 Bank of Utah Championship은 9월 대회인가요? — 공식 대회 주간은 9월 28일 시작하지만 경쟁 라운드는 10월 1~4일입니다. 검색 편의를 위해 9월과 10월 글에서 모두 설명합니다.",
          "장소가 미정인 국내 대회도 게시해도 되나요? — 가능하지만 반드시 ‘공식 최종 공지 확인’으로 표시하고, 골프장 상세 링크를 임의로 연결하지 않아야 합니다.",
        ],
      },
    ],
  },
  {
    slug: "2026-october-golf-tournament-schedule",
    title: "2026년 10월 골프대회 일정: PGA·LPGA·KPGA·KLPGA",
    description:
      "2026년 10월 LPGA 아시아 스윙과 BMW Ladies Championship, KPGA·KLPGA 종반전 일정을 정리했습니다. 미정 대회명은 공식 표기 그대로 유지합니다.",
    category: TOURNAMENT_CATEGORY,
    categoryLabel: TOURNAMENT_LABEL,
    date: PUBLISH_DATE,
    dataCheckedAt: CHECKED_AT,
    thumbnail: blogThumbnailPath("2026-october-golf-tournament-schedule"),
    thumbnailAlt: blogThumbnailAlt("2026-october-golf-tournament-schedule"),
    tournamentCalendarMonth: "2026-10",
    relatedPostSlugs: [
      "2026-golf-tournament-schedule-august-october",
      "2026-august-golf-tournament-schedule",
      "2026-september-golf-tournament-schedule",
      "2026-bmw-ladies-championship-guide",
    ],
    references: [
      ...SHARED_REFS,
      {
        title: "BMW Ladies Championship",
        publisher: "LPGA",
        url: "https://www.lpga.com/tournaments/bmw-lpga-championship/overview",
        checkedAt: CHECKED_AT,
      },
    ],
    sections: [
      {
        heading: "2026년 10월 골프 시즌 개요",
        body: [
          "2026년 10월은 LPGA 아시아 일정과 국내 투어 종반전이 겹치는 달입니다. 특히 BMW Ladies Championship이 전남 해남에서 열릴 예정이라 국내 관람 수요가 예상됩니다.",
          "최종 확인일: 2026년 7월 18일. 대회명이 아직 확정되지 않은 국내 일정은 공식 표기 그대로 ‘미정’으로 남겼습니다. 일정은 변경될 수 있습니다.",
        ],
      },
      {
        heading: "KLPGA 10월 일정",
        body: [
          "10월 15~18일 일정은 대회명과 장소가 확정되지 않은 상태이므로 임의의 스폰서명이나 골프장을 넣지 않습니다.",
        ],
        table: {
          caption: "KLPGA 2026년 10월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "10월 1~4일",
              "제26회 하이트진로 챔피언십",
              "블루헤런",
              "최종 공지 재확인",
            ],
            [
              "10월 8~11일",
              "2026 동부건설·한국토지신탁 챔피언십",
              "익산",
              "최종 공지 재확인",
            ],
            [
              "10월 15~18일",
              "대회명 미정",
              "장소 미정",
              "최종 공지 재확인",
            ],
            [
              "10월 22~25일",
              "광남일보·해피니스 오픈",
              "해피니스CC",
              "10억원",
            ],
            [
              "10월 29일~11월 1일",
              "S-OIL 챔피언십 2026",
              "엘리시안 제주",
              "10억원",
            ],
          ],
        },
      },
      {
        heading: "KPGA 10월 일정",
        body: [
          "KPGA 공식 일정표에 임시 명칭으로 표시된 대회는 최종 명칭 발표 후 업데이트합니다.",
        ],
        table: {
          caption: "KPGA 2026년 10월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "10월 1~4일",
              "현대해상 최경주 인비테이셔널",
              "페럼클럽",
              "—",
            ],
            [
              "10월 8~11일",
              "대회명 미정(공식 일정표 임시 표기)",
              "KPGA 공식 공지 확인",
              "최종 공지 재확인",
            ],
            [
              "10월 15~18일",
              "더채리티클래식 2026",
              "서원밸리CC",
              "최종 공지 재확인",
            ],
            [
              "10월 22~25일",
              "제네시스 챔피언십",
              "우정힐스CC",
              "최종 공지 재확인",
            ],
            [
              "10월 29일~11월 1일",
              "2026 렉서스 마스터즈",
              "클럽72CC",
              "최종 공지 재확인",
            ],
          ],
        },
      },
      {
        heading: "LPGA 10월 일정",
        body: [
          "10월 22~25일 전남 해남 파인비치 골프링크스에서 예정돼 있으며 공식 LPGA 일정상 총상금은 235만 달러입니다.",
        ],
        table: {
          caption: "LPGA 2026년 10월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "10월 1~4일",
              "LOTTE Championship presented by Hoakalei",
              "Hoakalei Country Club",
              "$3M",
            ],
            [
              "10월 15~18일",
              "Buick LPGA Shanghai",
              "Sheshan Golf Club",
              "$3.2M",
            ],
            [
              "10월 22~25일",
              "BMW Ladies Championship",
              "Pine Beach Golf Links",
              "$2.35M",
            ],
            [
              "10월 29일~11월 1일",
              "Maybank Championship",
              "Kuala Lumpur Golf & Country Club, West Course",
              "$3M",
            ],
          ],
        },
        items: [
          {
            title: "2026 BMW 레이디스 챔피언십 관전 가이드",
            description:
              "해남 파인비치 관전을 위한 티켓·이동·준비물 가이드입니다.",
            relatedPostSlug: "2026-bmw-ladies-championship-guide",
          },
        ],
      },
      {
        heading: "BMW Ladies Championship",
        body: [
          "10월 22~25일 전남 해남 파인비치 골프링크스에서 예정돼 있으며 공식 LPGA 일정상 총상금은 235만 달러입니다.",
        ],
        items: [
          {
            title: "파인비치골프링크스",
            description:
              "대회 개최 예정 코스입니다. 갤러리 동선은 공식 교통 공지를 우선 확인하세요.",
            relatedCourseId: "gc-437ea8156737",
            courseCardVariant: "tournament",
            tournamentEventName: "BMW Ladies Championship",
            tournamentEventDates: "2026-10-22 ~ 2026-10-25",
            tournamentOfficialUrl:
              "https://www.lpga.com/tournaments/bmw-lpga-championship/overview",
            recommendationReasons: [
              "2026 BMW Ladies Championship 개최 예정 코스",
              "전남 해남 파인비치 골프링크스",
              "장거리 관람 계획 시 숙박·셔틀 함께 확인",
              "클럽하우스 일반 방문 동선과 갤러리 동선을 동일하게 보지 않음",
            ],
          },
        ],
      },
      {
        heading: "PGA TOUR 10월 일정",
        body: [
          "10월 12~18일 주간에는 공식 FedExCup Fall 대회가 배치되지 않았으며, 이후 버뮤다와 멕시코 일정이 이어집니다.",
        ],
        table: {
          caption: "PGA TOUR 2026년 10월 일정",
          columns: ["기간", "대회", "장소", "비고"],
          rows: [
            [
              "10월 1~4일",
              "Bank of Utah Championship",
              "Black Desert Resort",
              "FedExCup Fall",
            ],
            [
              "10월 8~11일",
              "Baycurrent Classic",
              "Yokohama Country Club",
              "FedExCup Fall",
            ],
            [
              "10월 22~25일",
              "Butterfield Bermuda Championship",
              "Port Royal Golf Course",
              "FedExCup Fall",
            ],
            [
              "10월 29일~11월 1일",
              "VidantaWorld Mexico Open",
              "Vidanta Vallarta Golf Course",
              "FedExCup Fall",
            ],
          ],
        },
      },
      {
        heading: "10월 관람 계획을 세울 때",
        body: [
          "BMW Ladies Championship의 티켓·주차·셔틀은 공식 발표 뒤 확인",
          "국내 투어의 미정 대회명은 배포 직전 재검증",
          "해외 중계는 한국 날짜가 하루 넘어갈 수 있음",
          "태풍이나 기상 상황으로 경기 시간이 바뀔 수 있음",
        ],
      },
      {
        heading: "자주 묻는 질문",
        body: [
          "2026 BMW Ladies Championship은 어디서 열리나요? — 공식 LPGA 일정 기준 전남 해남 파인비치 골프링크스에서 10월 22~25일 열릴 예정입니다.",
          "KLPGA와 KPGA의 ‘미정’ 대회는 왜 삭제하지 않나요? — 공식 투어 일정에 해당 주간이 배정돼 있기 때문입니다. 다만 확정되지 않은 대회명과 장소는 추측하지 않습니다.",
          "Maybank Championship은 10월 대회인가요, 11월 대회인가요? — 10월 29일 시작해 11월 1일 끝나는 월간 경계 대회라 10월 글에 포함합니다.",
        ],
      },
    ],
  },
  {
    slug: "2026-mediheal-hankook-ilbo-montvert-guide",
    title: "2026 메디힐·한국일보 챔피언십 일정: 몽베르CC 관전 정보",
    description:
      "2026년 8월 13~16일 포천 몽베르에서 열리는 메디힐·한국일보 챔피언십의 일정, 코스, 티켓·주차·셔틀 확인 포인트를 정리했습니다.",
    category: TOURNAMENT_CATEGORY,
    categoryLabel: TOURNAMENT_LABEL,
    date: PUBLISH_DATE,
    dataCheckedAt: CHECKED_AT,
    thumbnail: blogThumbnailPath("2026-mediheal-hankook-ilbo-montvert-guide"),
    thumbnailAlt: blogThumbnailAlt("2026-mediheal-hankook-ilbo-montvert-guide"),
    relatedRegionSlug: "gyeonggi",
    blogRegionLabel: "포천",
    relatedPostSlugs: [
      "2026-august-golf-tournament-schedule",
      "2026-golf-tournament-schedule-august-october",
      "pocheon-golf-best-7",
    ],
    references: [
      {
        title: "메디힐·한국일보 챔피언십",
        publisher: "KLPGA",
        url: "https://klpga.co.kr/web/tourInfo/tourInfo?gameCode=2026080003",
        checkedAt: CHECKED_AT,
      },
      {
        title: "KLPGA 투어 일정",
        publisher: "KLPGA",
        url: "https://klpga.co.kr/web/tour/schedule",
        checkedAt: CHECKED_AT,
      },
    ],
    sections: [
      {
        heading: "대회 개요",
        body: [
          "2026 메디힐·한국일보 챔피언십은 8월 13일부터 16일까지 경기도 포천 몽베르에서 열릴 예정입니다. KLPGA 공식 대회 페이지 기준 명성산 OUT·IN 코스를 사용하며, 파72·72홀 스트로크플레이로 진행되고 총상금은 12억원입니다.",
          "최종 확인일: 2026년 7월 18일. 티켓, 주차장, 셔틀버스와 갤러리 출입구는 공식 공지가 갱신될 수 있습니다.",
        ],
      },
      {
        heading: "대회 기본 정보",
        body: ["관람 전 아래 기본 정보를 먼저 확인하세요."],
        table: {
          caption: "메디힐·한국일보 챔피언십 기본 정보",
          columns: ["항목", "내용"],
          rows: [
            ["대회명", "메디힐·한국일보 챔피언십"],
            ["기간", "2026년 8월 13~16일"],
            ["개최지", "몽베르"],
            ["코스", "명성산 OUT·IN"],
            ["기준파", "파72"],
            ["경기 방식", "72홀 스트로크플레이"],
            ["총상금", "12억원"],
            ["지역", "경기도 포천시"],
          ],
        },
        officialPhotoEventSlug: "2026-mediheal-hankook-ilbo-montvert-guide",
        officialPhotoIds: ["mediheal-2025-02"],
        officialPhotoCredit:
          "사진: KLPGA 공식 사진 · 2025 메디힐·한국일보 챔피언십",
      },
      {
        heading: "대회 주간 일정",
        body: [
          "KLPGA 공식 페이지에는 8월 10일과 11일 프로암, 12일 공식 연습일, 13일부터 16일까지 본 대회 일정이 표시돼 있습니다. 일반 갤러리가 참여할 수 있는 범위와 입장 시간은 티켓·셔틀 공지를 따릅니다.",
        ],
        officialPhotoEventSlug: "2026-mediheal-hankook-ilbo-montvert-guide",
        officialPhotoIds: ["mediheal-2025-03", "mediheal-2025-04"],
        officialPhotoCredit:
          "사진: KLPGA 공식 사진 · 2025 메디힐·한국일보 챔피언십",
      },
      {
        heading: "몽베르와 포천 골프장 함께 보기",
        body: [
          "몽베르는 GolfMap 포천 비교 글의 대상 코스입니다. 대회를 관람하려는 사람과 대회 코스 주변의 골프장을 비교하려는 검색 의도를 연결할 수 있습니다.",
        ],
        items: [
          {
            title: "포천 골프장 7곳 비교",
            description:
              "몽베르를 포함한 포천시 대중제 골프장 비교 가이드입니다.",
            relatedPostSlug: "pocheon-golf-best-7",
          },
          {
            title: "몽베르CC(퍼블릭)",
            description:
              "대회 개최 예정 코스입니다. 이름·주소를 GolfMap 데이터와 대조해 연결했습니다.",
            relatedCourseId: "gc-9d709ff43c33",
            courseCardVariant: "tournament",
            tournamentEventName: "메디힐·한국일보 챔피언십",
            tournamentEventDates: "2026-08-13 ~ 2026-08-16",
            tournamentOfficialUrl:
              "https://klpga.co.kr/web/tourInfo/tourInfo?gameCode=2026080003",
            recommendationReasons: [
              "2026 메디힐·한국일보 챔피언십 개최 예정",
              "명성산 OUT·IN 사용 예정",
              "대회 기간 일반 예약 여부 별도 확인",
              "티켓·셔틀 공식 공지 우선",
            ],
          },
        ],
      },
      {
        heading: "티켓과 입장",
        body: [
          "KLPGA 공식 대회 페이지에 ‘티켓/셔틀’ 메뉴가 있지만, 세부 내용은 대회 시점에 갱신될 수 있습니다.",
          "무료 입장을 보장하지 않기",
          "사전 예매 여부를 추측하지 않기",
          "현장 판매 가격을 임의로 만들지 않기",
          "어린이·우대 입장 조건은 공식 공지 확인",
        ],
      },
      {
        heading: "주차와 셔틀",
        body: [
          "갤러리 주차장이 골프장 클럽하우스 주차장과 같다고 가정하지 않습니다. 공식 셔틀 승차장, 운영 시간과 마지막 운행 시각이 발표되면 이 섹션을 업데이트합니다.",
          "갤러리 주차장과 셔틀버스 세부 정보는 KLPGA 공식 ‘티켓/셔틀’ 공지를 확인하세요.",
        ],
      },
      {
        heading: "관람 전 확인할 것",
        body: [
          "우산보다 관람 동선을 방해하지 않는 우비 준비",
          "편한 신발과 자외선 차단용품",
          "휴대전화 무음 설정",
          "선수 샷 준비 중 이동과 촬영 자제",
          "입장 가능 가방과 음식물 규정 확인",
          "기상으로 인한 출발 시간 변경 확인",
        ],
      },
      {
        heading: "2025 우승·시상 공식 사진",
        body: [
          "아래 사진은 2025 메디힐·한국일보 챔피언십 공식 갤러리입니다. 2026 대회 현장과 다를 수 있습니다.",
        ],
        officialPhotoEventSlug: "2026-mediheal-hankook-ilbo-montvert-guide",
        officialPhotoIds: ["mediheal-2025-01"],
        officialPhotoCredit:
          "사진: KLPGA 공식 사진 · 2025 메디힐·한국일보 챔피언십",
      },
      {
        heading: "자주 묻는 질문",
        body: [
          "메디힐·한국일보 챔피언십은 언제 열리나요? — 2026년 8월 13~16일로 예정돼 있습니다.",
          "어느 코스를 사용하나요? — KLPGA 공식 페이지 기준 몽베르 명성산 OUT·IN 코스입니다.",
          "티켓과 셔틀은 확정됐나요? — 대회 페이지에 티켓·셔틀 메뉴가 있지만 세부 운영은 변경될 수 있으므로 관람 직전 공식 공지를 확인해야 합니다.",
          "몽베르에서 직접 라운드할 수 있나요? — 대회 기간의 일반 영업과 예약 가능 여부는 골프장 공식 예약 안내에서 별도로 확인해야 합니다.",
        ],
      },
    ],
  },
  {
    slug: "2026-bmw-ladies-championship-guide",
    title: "2026 BMW 레이디스 챔피언십 일정·장소: 해남 파인비치 관전 가이드",
    description:
      "2026년 10월 22~25일 전남 해남 파인비치 골프링크스에서 열리는 BMW Ladies Championship의 일정, 티켓, 이동·숙박 확인 포인트를 정리했습니다.",
    category: TOURNAMENT_CATEGORY,
    categoryLabel: TOURNAMENT_LABEL,
    date: PUBLISH_DATE,
    dataCheckedAt: CHECKED_AT,
    thumbnail: blogThumbnailPath("2026-bmw-ladies-championship-guide"),
    thumbnailAlt: blogThumbnailAlt("2026-bmw-ladies-championship-guide"),
    relatedPostSlugs: [
      "2026-october-golf-tournament-schedule",
      "2026-golf-tournament-schedule-august-october",
    ],
    references: [
      {
        title: "BMW Ladies Championship",
        publisher: "LPGA",
        url: "https://www.lpga.com/tournaments/bmw-lpga-championship/overview",
        checkedAt: CHECKED_AT,
      },
      {
        title: "LPGA Tournaments",
        publisher: "LPGA",
        url: "https://www.lpga.com/tournaments",
        checkedAt: CHECKED_AT,
      },
    ],
    sections: [
      {
        heading: "대회 개요",
        body: [
          "2026 BMW Ladies Championship은 LPGA 공식 일정 기준 10월 22일부터 25일까지 전라남도 해남 파인비치 골프링크스에서 열릴 예정입니다. 공식 일정에 표시된 총상금은 235만 달러입니다.",
          "최종 확인일: 2026년 7월 18일. 티켓 판매, 갤러리 주차, 셔틀버스와 출전 선수 명단은 아직 변경될 수 있습니다.",
        ],
      },
      {
        heading: "대회 기본 정보",
        body: ["관람 계획을 세우기 전 아래 기본 정보를 확인하세요."],
        table: {
          caption: "BMW Ladies Championship 기본 정보",
          columns: ["항목", "내용"],
          rows: [
            ["대회명", "BMW Ladies Championship"],
            ["기간", "2026년 10월 22~25일"],
            ["개최지", "Pine Beach Golf Links"],
            ["지역", "전라남도 해남군"],
            ["투어", "LPGA Tour"],
            ["총상금", "235만 달러"],
          ],
        },
        officialPhotoEventSlug: "2026-bmw-ladies-championship-guide",
        officialPhotoIds: ["bmw-ladies-2025-02"],
        officialPhotoCredit:
          "사진: BMW Group PressClub · BMW Ladies Championship 2025",
      },
      {
        heading: "왜 별도 관전 가이드가 필요한가요?",
        body: [
          "한국에서 열리는 LPGA 대회이고, 수도권에서 이동할 경우 숙박과 장거리 교통을 함께 계획해야 하기 때문입니다. 단순 일정표보다 티켓, 셔틀, 숙박권역과 기상 확인 정보가 필요합니다.",
        ],
        officialPhotoEventSlug: "2026-bmw-ladies-championship-guide",
        officialPhotoIds: ["bmw-ladies-2025-03"],
        officialPhotoCredit:
          "사진: BMW Group PressClub · BMW Ladies Championship 2025",
        items: [
          {
            title: "파인비치골프링크스",
            description:
              "대회 개최 예정 코스입니다. 이름·주소를 GolfMap 데이터와 대조해 연결했습니다.",
            relatedCourseId: "gc-437ea8156737",
            courseCardVariant: "tournament",
            tournamentEventName: "BMW Ladies Championship",
            tournamentEventDates: "2026-10-22 ~ 2026-10-25",
            tournamentOfficialUrl:
              "https://www.lpga.com/tournaments/bmw-lpga-championship/overview",
            recommendationReasons: [
              "2026 BMW Ladies Championship 개최 예정",
              "전남 해남 파인비치 골프링크스",
              "장거리 관람 계획 시 숙박·셔틀 함께 확인",
              "클럽하우스 일반 방문 동선과 갤러리 동선을 동일하게 보지 않음",
            ],
          },
        ],
      },
      {
        heading: "티켓",
        body: [
          "공식 티켓 판매가 시작되기 전에는 가격과 무료 입장 조건을 단정하지 않습니다.",
          "티켓 예매처와 권종은 대회 주최 측의 2026 공식 발표 후 업데이트합니다.",
          "업데이트할 항목: 일일권·주간권, 청소년·어린이 정책, 현장 구매 가능 여부, 모바일 티켓 사용 방식, 재입장 가능 여부",
        ],
      },
      {
        heading: "해남 이동과 숙박",
        body: [
          "파인비치 골프링크스로 가는 정확한 갤러리 셔틀 경로가 발표되기 전에는 클럽하우스까지 자가용 진입이 가능하다고 가정하지 않습니다.",
          "관람 계획은 다음 순서로 세우는 것이 안전합니다. 1) 공식 갤러리 주차장 위치 확인 2) 셔틀 승차장과 첫차·막차 확인 3) 목포·해남 등 숙박권역 비교 4) 경기 시작 시간보다 여유 있게 이동 5) 강풍·우천 예보 확인",
          "특정 소요시간은 출발지와 교통 상황에 따라 달라지므로 고정된 ‘서울에서 몇 시간’ 문구를 쓰지 않습니다.",
        ],
      },
      {
        heading: "출전 선수와 조 편성",
        body: [
          "LPGA 공식 Entries 페이지가 갱신되기 전에는 특정 선수가 반드시 출전한다고 표현하지 않습니다. 출전 명단과 1·2라운드 조 편성은 대회 직전에 다시 확인합니다.",
        ],
        officialPhotoEventSlug: "2026-bmw-ladies-championship-guide",
        officialPhotoIds: ["bmw-ladies-2025-04"],
        officialPhotoCredit:
          "사진: BMW Group PressClub · BMW Ladies Championship 2025",
      },
      {
        heading: "관람 준비물",
        body: [
          "비와 바람을 함께 고려한 겉옷",
          "편한 방수 신발",
          "자외선 차단제와 모자",
          "휴대전화 보조배터리",
          "망원경",
          "공식 반입 규정에 맞는 작은 가방",
        ],
      },
      {
        heading: "2025 우승·시상 공식 사진",
        body: [
          "아래 사진은 BMW Group PressClub의 2025 BMW Ladies Championship 공식 사진입니다. 2026 대회 현장과 다를 수 있습니다.",
        ],
        officialPhotoEventSlug: "2026-bmw-ladies-championship-guide",
        officialPhotoIds: ["bmw-ladies-2025-01"],
        officialPhotoCredit:
          "사진: BMW Group PressClub · BMW Ladies Championship 2025",
      },
      {
        heading: "함께 볼 글",
        body: [
          "월별 일정과 허브 글에서 같은 시기의 다른 대회를 이어서 확인할 수 있습니다.",
        ],
        items: [
          {
            title: "2026년 10월 골프대회 일정",
            description: "10월 PGA·LPGA·KPGA·KLPGA 전체 일정표입니다.",
            relatedPostSlug: "2026-october-golf-tournament-schedule",
          },
          {
            title: "2026년 8~10월 골프대회 일정 허브",
            description: "8월·9월·10월 일정 글을 연결하는 허브 페이지입니다.",
            relatedPostSlug: "2026-golf-tournament-schedule-august-october",
          },
        ],
      },
      {
        heading: "자주 묻는 질문",
        body: [
          "2026 BMW 레이디스 챔피언십은 언제 열리나요? — LPGA 공식 일정 기준 2026년 10월 22~25일입니다.",
          "어디에서 열리나요? — 전라남도 해남군 파인비치 골프링크스입니다.",
          "출전 선수는 확정됐나요? — 공식 Entries가 갱신될 때까지 특정 선수의 출전을 보장하지 않습니다.",
          "주차와 셔틀 정보가 있나요? — 공식 갤러리 교통 공지가 발표된 뒤 업데이트해야 합니다. 골프장 일반 방문 경로를 갤러리 동선으로 단정하지 않습니다.",
        ],
      },
    ],
  },
];
