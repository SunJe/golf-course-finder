import type { Course } from "@/types/course";
import { getNormalizedRegionLabel } from "@/lib/regionUtils";
import { formatRegionCoursePrice, courseHasPriceInfo } from "@/lib/regionLanding";
import { formatPriceRange, hasPrice } from "@/lib/priceFormat";
import {
  PRICE_FAQ_ANSWER,
  REPORT_ISSUE_ANSWER,
} from "@/lib/contentGuides";
import {
  courseHasValidHomepage,
  courseHasValidPhone,
} from "@/lib/regionContactValidation";
import { hasValidDifficulty } from "@/lib/difficulty";
import { groupCoursesByCity, type CityGroup } from "@/lib/regionCityHelpers";

export const COLLECTION_SLUGS = [
  "near-seoul",
  "public",
  "baekdori",
  "beginner",
  "par3",
  "nine-hole",
  "budget",
  "near-seoul-public",
  "near-seoul-baekdori",
  "near-seoul-beginner",
  "near-seoul-budget",
  "near-seoul-nine-hole",
  "near-seoul-par3",
] as const;

export const NATIONAL_COLLECTION_SLUGS = [
  "public",
  "baekdori",
  "beginner",
  "par3",
  "nine-hole",
  "budget",
] as const satisfies readonly CollectionSlug[];

export const NEAR_SEOUL_COLLECTION_SLUGS = [
  "near-seoul",
  "near-seoul-public",
  "near-seoul-baekdori",
  "near-seoul-beginner",
  "near-seoul-budget",
  "near-seoul-nine-hole",
  "near-seoul-par3",
] as const satisfies readonly CollectionSlug[];

export type NationalCollectionSlug = (typeof NATIONAL_COLLECTION_SLUGS)[number];
export type NearSeoulCollectionSlug = (typeof NEAR_SEOUL_COLLECTION_SLUGS)[number];

export type CollectionSlug = (typeof COLLECTION_SLUGS)[number];

export interface CollectionFaqItem {
  question: string;
  answer: string;
}

export interface CollectionConfig {
  slug: CollectionSlug;
  title: string;
  h1: string;
  description: string;
  seoDescription: string;
  primaryKeyword: string;
  relatedKeywords: string[];
  filterSummary: string;
  mapHref: string;
  breadcrumbLabel: string;
  seoIntro: string;
  faq: CollectionFaqItem[];
}

export interface CollectionLandingStats {
  total: number;
  withPhone: number;
  withHomepage: number;
  withPrice: number;
  withDifficulty: number;
}

const DISCLAIMER =
  "이 목록은 GolfMap Korea 데이터 기준 참고용입니다. 실제 체감 난이도와 요금은 코스 상태, 시즌, 예약 조건에 따라 달라질 수 있습니다.";

function mapHrefFor(slug: CollectionSlug): string {
  return `/map?collection=${slug}`;
}

function baseFaq(
  label: string,
  filterSummary: string,
  stats: CollectionLandingStats,
): CollectionFaqItem[] {
  return [
    {
      question: `${label} 목록은 어떤 기준으로 분류되나요?`,
      answer: `${filterSummary} ${DISCLAIMER}`,
    },
    {
      question: "요금 정보는 실시간 예약가인가요?",
      answer: PRICE_FAQ_ANSWER,
    },
    {
      question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
      answer: REPORT_ISSUE_ANSWER,
    },
  ];
}

const NEAR_SEOUL_DISCLAIMER =
  "서울 근교 기준은 서울시청 기준 거리와 경기·인천 등 수도권 접근성을 바탕으로 계산한 참고용 분류입니다.";

function nearSeoulComboFaq(
  label: string,
  criteria: string,
): CollectionFaqItem[] {
  return [
    {
      question: `${label}은 어떤 기준으로 보여주나요?`,
      answer: `${criteria} ${NEAR_SEOUL_DISCLAIMER} ${DISCLAIMER}`,
    },
    {
      question: "거리는 어떻게 계산되나요?",
      answer:
        "서울시청(37.5665, 126.9780) 좌표와 골프장 좌표를 기준으로 직선 거리(km)를 계산합니다. 실제 이동 시간·경로와는 다를 수 있습니다.",
    },
    {
      question: "요금은 실시간 예약가인가요?",
      answer: PRICE_FAQ_ANSWER,
    },
    {
      question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
      answer: REPORT_ISSUE_ANSWER,
    },
  ];
}

export const collectionLandingPages: CollectionConfig[] = [
  {
    slug: "near-seoul",
    title: "서울 근교 골프장 지도 | GolfMap Korea",
    h1: "서울 근교 골프장",
    description:
      "서울에서 접근하기 좋은 골프장의 위치, 참고 요금, 전화번호, 예약 확인 링크를 한곳에서 비교할 수 있습니다.",
    seoDescription:
      "서울 근교 골프장의 위치, 참고 요금, 전화번호, 홈페이지를 비교해 보세요. 이동 거리와 운영 형태를 함께 확인할 수 있습니다.",
    primaryKeyword: "서울 근교 골프장",
    relatedKeywords: ["서울 골프장", "경기 골프장", "인천 골프장"],
    filterSummary:
      "서울시청 기준 거리와 경기·인천 지역 정보를 바탕으로 서울에서 접근하기 좋은 골프장을 보여줍니다.",
    mapHref: mapHrefFor("near-seoul"),
    breadcrumbLabel: "서울 근교 골프장",
    seoIntro:
      "서울시청 기준 거리와 경기·인천 지역 정보를 바탕으로, 서울에서 당일 왕복이 가능한 골프장을 모아 비교하기 쉽게 정리했습니다. 대중제·회원제, 홀 수, 참고 요금을 상세 페이지에서 함께 확인해 보세요.",
    faq: [
      ...baseFaq(
        "서울 근교",
        "서울시청 기준 약 80~100km 이내 좌표가 있는 골프장을 우선 보여주고, 좌표가 없으면 경기·인천 주소 정보를 보조로 사용합니다.",
        { total: 0, withPhone: 0, withHomepage: 0, withPrice: 0, withDifficulty: 0 },
      ).slice(0, 1),
      {
        question: "거리는 어떻게 계산되나요?",
        answer:
          "서울시청(37.5665, 126.9780) 좌표와 골프장 좌표를 기준으로 직선 거리(km)를 계산합니다. 실제 이동 시간·경로와는 다를 수 있습니다.",
      },
      {
        question: "요금 정보는 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약·내장 가격과 다를 수 있습니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "public",
    title: "대중제 골프장 지도 | GolfMap Korea",
    h1: "대중제 골프장",
    description:
      "전국 대중제 골프장의 위치, 전화번호, 홈페이지, 요금 정보를 확인하세요.",
    seoDescription:
      "전국 대중제 골프장의 위치, 참고 요금, 연락처, 홈페이지를 비교해 회원권 없이 이용할 수 있는 코스를 찾아보세요.",
    primaryKeyword: "대중제 골프장",
    relatedKeywords: ["퍼블릭 골프장", "public golf", "대중 골프장"],
    filterSummary:
      "운영 형태에 대중제, 퍼블릭, public 정보가 있는 골프장을 보여줍니다.",
    mapHref: mapHrefFor("public"),
    breadcrumbLabel: "대중제 골프장",
    seoIntro:
      "전국 대중제·퍼블릭 골프장을 한곳에서 비교할 수 있는 참고용 목록입니다. 회원제와 구분해 보고, 상세 페이지에서 연락처와 참고 요금을 확인하세요.",
    faq: [
      {
        question: "대중제 골프장은 어떻게 분류되나요?",
        answer: `골프장명, 운영 형태, 설명 등에 대중제·퍼블릭·public 정보가 있는 골프장을 포함합니다. 회원제와 구분해 비교할 수 있습니다. ${DISCLAIMER}`,
      },
      {
        question: "회원제 골프장도 함께 보이나요?",
        answer:
          "이 페이지는 대중제·퍼블릭 골프장 위주로 정리합니다. 회원제 골프장은 지역별 페이지나 전국 지도에서 별도로 확인할 수 있습니다.",
      },
      {
        question: "요금 정보는 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약·내장 가격과 다를 수 있습니다. 정확한 요금은 골프장 공식 홈페이지나 예약 채널에서 확인해야 합니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "baekdori",
    title: "백돌이 골프장 찾기 | GolfMap Korea",
    h1: "백돌이 골프장",
    description:
      "백돌이 골퍼가 참고하기 좋은 대중제, 파3, 나인홀, 저렴한 골프장을 확인하세요.",
    seoDescription:
      "백돌이 골퍼가 참고하기 좋은 골프장 정보를 확인하세요.",
    primaryKeyword: "백돌이 골프장",
    relatedKeywords: ["백돌이", "100타", "초보 골프장"],
    filterSummary:
      "운영 형태, 홀 수, 참고 요금 등을 기준으로 백돌이 골퍼가 참고하기 좋은 조건의 골프장을 보여줍니다.",
    mapHref: mapHrefFor("baekdori"),
    breadcrumbLabel: "백돌이 골프장",
    seoIntro:
      "백돌이 골퍼가 부담을 줄여볼 수 있는 조건의 골프장을 GolfMap Korea 데이터로 정리한 참고용 목록입니다. 운영 형태, 홀 수, 참고 요금 등을 함께 반영해 정리했습니다.",
    faq: [
      {
        question: "백돌이 골프장은 어떻게 선정되나요?",
        answer: `운영 형태, 홀 수, 참고 요금, 대중제·나인홀 여부, 서울 근교 여부 등을 함께 반영해 정리합니다. ${DISCLAIMER}`,
      },
      {
        question: "무조건 쉬운 골프장인가요?",
        answer:
          "아닙니다. 데이터상 참고하기 좋은 조건이 많은 골프장을 보여줄 뿐, 실제 난이도와 체감은 다를 수 있습니다.",
      },
      {
        question: "요금 정보는 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약·내장 가격과 다를 수 있습니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "beginner",
    title: "초보자 골프장 찾기 | GolfMap Korea",
    h1: "초보자 골프장",
    description:
      "초보 골퍼가 참고하기 좋은 파3, 나인홀, 대중제 골프장을 확인하세요.",
    seoDescription:
      "초보 골퍼가 참고하기 좋은 골프장 위치, 전화번호, 요금 정보를 확인하세요.",
    primaryKeyword: "초보자 골프장",
    relatedKeywords: ["초보 골프장", "입문 골프장", "파3 골프장"],
    filterSummary:
      "홀 수, 대중제 여부, 참고 요금 등을 기준으로 초보자가 참고하기 좋은 골프장을 보여줍니다.",
    mapHref: mapHrefFor("beginner"),
    breadcrumbLabel: "초보자 골프장",
    seoIntro:
      "초보 골퍼가 참고하기 좋은 조건의 골프장을 GolfMap Korea 데이터 기준으로 정리한 페이지입니다. 홀 수, 운영 형태, 참고 요금 등을 함께 반영해 정리했습니다.",
    faq: [
      {
        question: "초보자 골프장은 어떻게 분류되나요?",
        answer: `홀 수, 대중제 여부, 참고 요금, 연락처 정보 등을 함께 반영해 정리합니다. ${DISCLAIMER}`,
      },
      {
        question: "초보자에게 무조건 쉬운 골프장인가요?",
        answer:
          "아닙니다. 데이터상 초보자가 참고하기 좋은 조건이 많은 골프장을 보여줄 뿐, 실제 난이도는 달라질 수 있습니다.",
      },
      {
        question: "요금 정보는 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약·내장 가격과 다를 수 있습니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "par3",
    title: "파3 골프장 지도 | GolfMap Korea",
    h1: "파3 골프장",
    description:
      "전국 파3 골프장의 위치, 전화번호, 홈페이지, 요금 정보를 확인하세요.",
    seoDescription:
      "전국 파3 골프장의 위치, 참고 요금, 연락처를 비교해 짧은 라운드·연습 코스를 찾아보세요.",
    primaryKeyword: "파3 골프장",
    relatedKeywords: ["PAR3", "Par3", "파 3 골프장"],
    filterSummary:
      "골프장명, 코스 정보, 분류 정보에 파3 또는 Par3 정보가 있는 골프장을 보여줍니다.",
    mapHref: mapHrefFor("par3"),
    breadcrumbLabel: "파3 골프장",
    seoIntro:
      "전국 파3·Par3 골프장을 모아 둔 참고용 목록입니다. 골프장명, 태그, 설명 등에 파3 정보가 있는 곳을 포함하며, 상세 페이지에서 연락처와 요금을 확인할 수 있습니다.",
    faq: [
      {
        question: "파3 골프장은 어떤 기준으로 모았나요?",
        answer: `골프장명, 운영 형태, 설명, 태그 등에 파3·Par3·PAR3 정보가 있는 골프장을 포함합니다. ${DISCLAIMER}`,
      },
      {
        question: "파3와 일반 18홀 골프장의 차이는 무엇인가요?",
        answer:
          "파3 골프장은 짧은 홀로 구성된 코스로, 연습·입문·가벼운 라운드에 활용되는 경우가 많습니다. 홀 수와 운영 형태는 골프장마다 다를 수 있으니 상세 페이지에서 확인해 주세요.",
      },
      {
        question: "요금 정보는 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약가와 다를 수 있습니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "nine-hole",
    title: "나인홀 골프장 지도 | GolfMap Korea",
    h1: "나인홀 골프장",
    description:
      "전국 나인홀 골프장의 위치, 전화번호, 홈페이지, 요금 정보를 확인하세요.",
    seoDescription:
      "전국 나인홀 골프장의 위치, 전화번호, 홈페이지, 요금 정보를 확인하세요.",
    primaryKeyword: "나인홀 골프장",
    relatedKeywords: ["9홀 골프장", "nine hole", "9홀"],
    filterSummary:
      "9홀 또는 나인홀로 분류된 골프장을 보여줍니다.",
    mapHref: mapHrefFor("nine-hole"),
    breadcrumbLabel: "나인홀 골프장",
    seoIntro:
      "9홀·나인홀 규모 골프장을 모아 둔 참고용 목록입니다. 홀 수가 9이거나 이름·설명에 나인홀 정보가 있는 골프장을 포함합니다.",
    faq: [
      {
        question: "나인홀 골프장은 어떻게 분류되나요?",
        answer: `홀 수가 9이거나 골프장명·설명에 9홀·나인홀 정보가 있는 골프장을 포함합니다. ${DISCLAIMER}`,
      },
      {
        question: "9홀 골프장은 누구에게 좋나요?",
        answer:
          "짧은 시간에 라운드를 마치고 싶을 때, 입문 단계에서 부담을 줄이고 싶을 때 참고하기 좋습니다. 실제 코스 길이와 난이도는 골프장마다 다를 수 있습니다.",
      },
      {
        question: "요금 정보는 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약·내장 가격과 다를 수 있습니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "budget",
    title: "저렴한 골프장 찾기 | GolfMap Korea",
    h1: "저렴한 골프장",
    description:
      "참고 요금 정보가 있는 골프장을 낮은 가격순으로 확인하세요.",
    seoDescription:
      "저렴한 골프장을 참고 요금 기준으로 확인하세요.",
    primaryKeyword: "저렴한 골프장",
    relatedKeywords: ["싼 골프장", "골프장 요금", "저가 골프장"],
    filterSummary:
      "참고 최저가 정보가 있는 골프장을 낮은 가격순으로 보여줍니다. 실제 예약가와 다를 수 있습니다.",
    mapHref: mapHrefFor("budget"),
    breadcrumbLabel: "저렴한 골프장",
    seoIntro:
      "참고 최저가 정보가 있는 골프장을 낮은 가격순으로 정렬한 참고용 목록입니다. 요금 정보는 참고용이며 실제 예약가와 다를 수 있습니다.",
    faq: [
      {
        question: "저렴한 골프장은 어떤 기준인가요?",
        answer: `참고 최저가 정보가 있는 골프장을 낮은 가격순으로 보여줍니다. ${DISCLAIMER}`,
      },
      {
        question: "최저가가 보장되나요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 날짜, 시간대, 예약 조건에 따라 실제 가격은 달라질 수 있습니다.",
      },
      {
        question: "요금 정보가 없는 골프장은?",
        answer:
          "참고 최저가 정보가 없는 골프장은 이 목록에서 제외됩니다. 상세 페이지에서 추가 정보를 확인해 주세요.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "near-seoul-public",
    title: "서울 근교 대중제 골프장 | GolfMap Korea",
    h1: "서울 근교 대중제 골프장",
    description:
      "서울에서 접근하기 좋은 대중제 골프장의 위치, 전화번호, 요금 정보를 확인하세요.",
    seoDescription:
      "서울 근교 대중제 골프장의 위치, 전화번호, 요금 정보를 확인하세요.",
    primaryKeyword: "서울 근교 대중제 골프장",
    relatedKeywords: ["서울 퍼블릭 골프장", "경기 대중제 골프장", "인천 골프장"],
    filterSummary:
      "서울시청 기준 거리와 경기·인천 지역 정보를 바탕으로, 대중제 또는 퍼블릭으로 분류된 골프장을 보여줍니다.",
    mapHref: mapHrefFor("near-seoul-public"),
    breadcrumbLabel: "서울 근교 대중제 골프장",
    seoIntro:
      "서울에서 접근하기 좋은 대중제·퍼블릭 골프장을 GolfMap Korea 데이터로 정리한 참고용 목록입니다. 서울시청 기준 거리와 경기·인천 지역 정보를 활용해 분류하며, 상세 페이지에서 연락처와 참고 요금을 확인할 수 있습니다.",
    faq: [
      {
        question: "서울 근교 대중제 골프장은 어떤 기준인가요?",
        answer: `서울시청 기준 거리와 경기·인천 등 수도권 접근성을 바탕으로, 대중제·퍼블릭으로 분류된 골프장을 보여줍니다. ${NEAR_SEOUL_DISCLAIMER} ${DISCLAIMER}`,
      },
      {
        question: "서울에서 가까운 순으로 정렬되나요?",
        answer:
          "거리 정보가 있는 골프장은 서울시청 기준 가까운 순으로 정렬합니다. 좌표가 없는 곳은 경기·인천 주소 정보를 보조로 사용합니다.",
      },
      {
        question: "요금은 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약가와 다를 수 있습니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "near-seoul-baekdori",
    title: "서울 근교 백돌이 골프장 | GolfMap Korea",
    h1: "서울 근교 백돌이 골프장",
    description:
      "서울 근교에서 백돌이 골퍼가 참고하기 좋은 조건의 골프장을 확인하세요.",
    seoDescription:
      "서울 근교 백돌이 골프장 정보를 GolfMap Korea에서 확인하세요.",
    primaryKeyword: "서울 근교 백돌이 골프장",
    relatedKeywords: ["서울 백돌이 골프장", "경기 백돌이 골프장", "100타 골프장"],
    filterSummary:
      "서울 근교 골프장 중 운영 형태, 홀 수, 참고 요금 등을 기준으로 백돌이 골퍼가 참고하기 좋은 조건의 골프장을 보여줍니다.",
    mapHref: mapHrefFor("near-seoul-baekdori"),
    breadcrumbLabel: "서울 근교 백돌이 골프장",
    seoIntro:
      "서울 근교에서 백돌이 골퍼가 참고하기 좋은 조건의 골프장을 GolfMap Korea 데이터로 정리한 참고용 목록입니다. 운영 형태, 홀 수, 참고 요금 등을 함께 반영해 정리했습니다.",
    faq: [
      {
        question: "서울 근교 백돌이 골프장은 어떤 기준으로 보여주나요?",
        answer: `서울시청 기준 거리와 경기·인천 등 수도권 접근성, 홀 수, 대중제 여부, 참고 요금 정보를 바탕으로 자동 분류한 참고용 목록입니다. ${NEAR_SEOUL_DISCLAIMER} ${DISCLAIMER}`,
      },
      {
        question: "무조건 쉬운 골프장인가요?",
        answer:
          "이 목록은 GolfMap Korea 데이터 기준 참고용이며, 실제 난이도는 코스 상태, 날씨, 개인 실력에 따라 달라질 수 있습니다.",
      },
      {
        question: "요금은 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약가와 다를 수 있습니다. 정확한 요금은 골프장 공식 홈페이지나 예약 채널에서 확인해야 합니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "near-seoul-beginner",
    title: "서울 근교 초보자 골프장 | GolfMap Korea",
    h1: "서울 근교 초보자 골프장",
    description:
      "서울 근교에서 초보 골퍼가 참고하기 좋은 골프장을 확인하세요.",
    seoDescription:
      "서울 근교 초보자 골프장 위치, 전화번호, 요금 정보를 확인하세요.",
    primaryKeyword: "서울 근교 초보자 골프장",
    relatedKeywords: ["서울 초보 골프장", "경기 입문 골프장", "서울 파3 골프장"],
    filterSummary:
      "서울 근교 골프장 중 홀 수, 대중제, 참고 요금 조건을 가진 골프장을 초보자가 참고하기 좋은 목록으로 보여줍니다.",
    mapHref: mapHrefFor("near-seoul-beginner"),
    breadcrumbLabel: "서울 근교 초보자 골프장",
    seoIntro:
      "서울 근교에서 초보 골퍼가 참고하기 좋은 조건의 골프장을 GolfMap Korea 데이터 기준으로 정리한 페이지입니다. 홀 수, 운영 형태, 참고 요금 등을 함께 반영해 정리했습니다.",
    faq: [
      {
        question: "서울 근교 초보자 골프장은 어떤 기준으로 보여주나요?",
        answer: `서울시청 기준 거리와 경기·인천 등 수도권 접근성, 홀 수, 대중제 여부, 참고 요금 정보를 바탕으로 자동 분류한 참고용 목록입니다. ${NEAR_SEOUL_DISCLAIMER} ${DISCLAIMER}`,
      },
      {
        question: "실제로 초보자에게 쉬운 골프장인가요?",
        answer:
          "이 목록은 GolfMap Korea 데이터 기준 참고용이며, 실제 난이도는 코스 상태, 날씨, 개인 실력에 따라 달라질 수 있습니다.",
      },
      {
        question: "요금은 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약가와 다를 수 있습니다. 정확한 요금은 골프장 공식 홈페이지나 예약 채널에서 확인해야 합니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "near-seoul-budget",
    title: "서울 근교 저렴한 골프장 | GolfMap Korea",
    h1: "서울 근교 저렴한 골프장",
    description:
      "서울 근교에서 참고 요금이 있는 골프장을 비교하기 쉽게 정리했습니다. 이동 거리, 홀 수, 대중제 여부를 함께 확인해 보세요.",
    seoDescription:
      "서울 근교에서 가성비 좋은 골프장을 찾는 분들을 위해 참고 요금, 위치, 전화번호, 예약 확인 링크를 함께 정리했습니다.",
    primaryKeyword: "서울 근교 저렴한 골프장",
    relatedKeywords: ["서울 싼 골프장", "경기 저렴한 골프장", "서울 골프장 요금"],
    filterSummary:
      "서울 근교 골프장 중 참고 최저가 정보가 있는 골프장을 낮은 가격순으로 정리합니다. 실제 예약가와 다를 수 있습니다.",
    mapHref: mapHrefFor("near-seoul-budget"),
    breadcrumbLabel: "서울 근교 저렴한 골프장",
    seoIntro:
      "서울 근교 저렴한 골프장을 고를 때는 단순 최저가뿐 아니라 이동 거리, 홀 수, 대중제 여부, 예약 가능한 시간대를 함께 보는 것이 좋습니다. 이 페이지는 참고 요금이 있는 골프장을 비교하기 쉽게 정리했으며, 실제 요금은 날짜·시간대·예약 조건에 따라 달라질 수 있습니다.",
    faq: [
      {
        question: "서울 근교 저렴한 골프장은 어떤 기준인가요?",
        answer: `서울 근교 골프장 중 참고 최저가 정보가 있는 골프장을 낮은 가격순으로 보여줍니다. ${NEAR_SEOUL_DISCLAIMER} ${DISCLAIMER}`,
      },
      {
        question: "최저가가 보장되나요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 날짜, 시간대, 예약 조건에 따라 실제 가격은 달라질 수 있습니다.",
      },
      {
        question: "요금 정보가 없는 골프장은?",
        answer:
          "참고 최저가 정보가 없는 골프장은 이 목록에서 제외됩니다. 상세 페이지에서 추가 정보를 확인해 주세요.",
      },
      {
        question: "골프장 정보가 틀렸나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "near-seoul-nine-hole",
    title: "서울 근교 나인홀 골프장 | GolfMap Korea",
    h1: "서울 근교 나인홀 골프장",
    description:
      "서울 근교 나인홀 골프장의 위치, 전화번호, 홈페이지, 요금 정보를 확인하세요.",
    seoDescription:
      "서울 근교 나인홀 골프장의 위치, 전화번호, 요금 정보를 확인하세요.",
    primaryKeyword: "서울 근교 나인홀 골프장",
    relatedKeywords: ["서울 9홀 골프장", "경기 나인홀", "서울 9홀"],
    filterSummary:
      "서울 근교 골프장 중 9홀 또는 나인홀로 분류된 골프장을 보여줍니다.",
    mapHref: mapHrefFor("near-seoul-nine-hole"),
    breadcrumbLabel: "서울 근교 나인홀 골프장",
    seoIntro:
      "서울 근교 9홀·나인홀 규모 골프장을 모아 둔 참고용 목록입니다. 홀 수가 9이거나 이름·설명에 나인홀 정보가 있는 골프장을 포함합니다.",
    faq: [
      {
        question: "서울 근교 나인홀 골프장은 어떤 기준인가요?",
        answer: `서울 근교 골프장 중 9홀·나인홀로 분류된 곳을 모았습니다. ${NEAR_SEOUL_DISCLAIMER} ${DISCLAIMER}`,
      },
      {
        question: "짧은 라운드를 찾을 때 참고할 수 있나요?",
        answer:
          "9홀 규모 골프장은 시간을 줄이고 싶을 때 비교해 보기 좋습니다. 실제 홀 구성과 운영 시간은 골프장마다 다를 수 있습니다.",
      },
      {
        question: "요금은 실시간 예약가인가요?",
        answer:
          "아닙니다. 표시되는 요금은 참고용이며 실제 예약가와 다를 수 있습니다.",
      },
      {
        question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
        answer:
          "각 골프장 상세 페이지 하단의 '정보가 틀렸나요?' 링크를 통해 제보해 주세요.",
      },
    ],
  },
  {
    slug: "near-seoul-par3",
    title: "서울 근교 파3 골프장 | GolfMap Korea",
    h1: "서울 근교 파3 골프장",
    description:
      "서울 근교 파3 골프장의 위치, 전화번호, 홈페이지, 요금 정보를 확인하세요.",
    seoDescription:
      "서울 근교 파3 골프장의 위치, 전화번호, 요금 정보를 확인하세요.",
    primaryKeyword: "서울 근교 파3 골프장",
    relatedKeywords: ["서울 파3", "경기 Par3", "서울 파 3 골프장"],
    filterSummary:
      "서울 근교 골프장 중 골프장명, 분류, 메모 정보에 파3 또는 Par3 정보가 있는 골프장을 보여줍니다.",
    mapHref: mapHrefFor("near-seoul-par3"),
    breadcrumbLabel: "서울 근교 파3 골프장",
    seoIntro:
      "서울 근교 파3·Par3 골프장을 모아 둔 참고용 목록입니다. 골프장명, 태그, 설명 등에 파3 정보가 있는 곳을 포함하며, 상세 페이지에서 연락처와 요금을 확인할 수 있습니다.",
    faq: nearSeoulComboFaq(
      "서울 근교 파3 골프장",
      "서울시청 기준 거리와 경기·인천 등 수도권 접근성, 파3·Par3 분류 정보를 바탕으로 자동 분류한 참고용 목록입니다.",
    ),
  },
];

export function getCollectionBySlug(
  slug: string,
): CollectionConfig | undefined {
  return collectionLandingPages.find((page) => page.slug === slug);
}

export function isCollectionSlug(slug: string): slug is CollectionSlug {
  return COLLECTION_SLUGS.includes(slug as CollectionSlug);
}

export function isNearSeoulCollectionSlug(
  slug: string,
): slug is NearSeoulCollectionSlug {
  return NEAR_SEOUL_COLLECTION_SLUGS.includes(slug as NearSeoulCollectionSlug);
}

export function computeCollectionStats(
  courses: Course[],
): CollectionLandingStats {
  return {
    total: courses.length,
    withPhone: courses.filter((c) => courseHasValidPhone(c)).length,
    withHomepage: courses.filter((c) => courseHasValidHomepage(c)).length,
    withPrice: courses.filter((c) => courseHasPriceInfo(c)).length,
    withDifficulty: courses.filter((c) => hasValidDifficulty(c.difficulty))
      .length,
  };
}

export function buildCollectionHeroDescription(
  config: CollectionConfig,
  stats: CollectionLandingStats,
): string {
  return `${config.description} GolfMap Korea에 ${stats.total.toLocaleString("ko-KR")}곳이 등록되어 있습니다. 전화번호 ${stats.withPhone}곳 · 홈페이지 ${stats.withHomepage}곳 · 요금 정보 ${stats.withPrice}곳.`;
}

export interface CollectionHeroPill {
  suffix: string;
  value: number;
}

export function buildCollectionHeroPills(
  stats: CollectionLandingStats,
): CollectionHeroPill[] {
  return [
    { suffix: "골프장", value: stats.total },
    { suffix: "전화번호", value: stats.withPhone },
    { suffix: "홈페이지", value: stats.withHomepage },
    { suffix: "요금 정보", value: stats.withPrice },
  ];
}

export function buildCollectionFaqItems(
  config: CollectionConfig,
  stats: CollectionLandingStats,
): CollectionFaqItem[] {
  return config.faq.map((item) => {
    let answer = item.answer;
    if (answer.includes("0곳") && stats.total > 0) {
      answer = answer.replace(/0곳/g, `${stats.withPrice}곳`);
    }
    return { ...item, answer };
  });
}

export interface RegionGroup {
  name: string;
  courses: Course[];
  count: number;
}

export function groupCoursesByRegionField(courses: Course[]): RegionGroup[] {
  const map = new Map<string, Course[]>();

  for (const course of courses) {
    const region =
      getNormalizedRegionLabel(course) ?? (course.region?.trim() || "기타");
    const existing = map.get(region) ?? [];
    existing.push(course);
    map.set(region, existing);
  }

  return [...map.entries()]
    .map(([name, regionCourses]) => ({
      name,
      courses: [...regionCourses].sort((a, b) =>
        a.name.localeCompare(b.name, "ko"),
      ),
      count: regionCourses.length,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name, "ko");
    });
}

export function formatCollectionCardPrice(course: Course): {
  label: string;
  value: string;
  hasPrice: boolean;
} {
  if (hasPrice(course)) {
    return {
      label: "참고 최저가",
      value: formatPriceRange(course),
      hasPrice: true,
    };
  }

  return {
    label: "요금",
    value: "정보 준비 중",
    hasPrice: false,
  };
}

export { formatRegionCoursePrice, courseHasValidPhone, courseHasValidHomepage };
export { type CityGroup, groupCoursesByCity };
export const COLLECTION_DISCLAIMER = DISCLAIMER;
export const NEAR_SEOUL_COLLECTION_DISCLAIMER = NEAR_SEOUL_DISCLAIMER;
export const SCORED_COLLECTION_DISCLAIMER =
  "이 목록은 GolfMap Korea 데이터 기준 참고용입니다. 실제 체감 난이도와 요금은 코스 상태, 시즌, 예약 조건에 따라 달라질 수 있습니다.";
