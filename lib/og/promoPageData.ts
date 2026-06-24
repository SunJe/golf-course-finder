import fs from "fs";
import { collectionLandingPages } from "@/lib/collectionLanding";
import type { PromoPageData } from "@/lib/og/promoTypes";
import { DEFAULT_PROMO_EYEBROW } from "@/lib/og/promoTypes";

const SHORT_DESCRIPTIONS: Record<string, string> = {
  baekdori: "백돌이 골퍼에게 맞는 골프장 정보",
  beginner: "처음 라운드 준비에 좋은 골프장",
  budget: "가성비 좋은 골프장을 빠르게 비교",
  "nine-hole": "전국 나인홀 골프장 정보를 한눈에",
  par3: "파3·연습 라운드에 맞는 골프장",
  public: "대중제 골프장 위치·요금·연락처",
  "near-seoul": "서울 근교 골프장을 지도에서 비교",
  "near-seoul-public": "서울 근교 대중제 골프장 정보",
  "near-seoul-baekdori": "서울 근교 백돌이 골프장",
  "near-seoul-beginner": "서울 근교 초보자 골프장",
  "near-seoul-budget": "서울 근교 가성비 골프장",
  "near-seoul-nine-hole": "서울 근교 나인홀 골프장",
  "near-seoul-par3": "서울 근교 파3 골프장",
};

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function promoDataFromCollection(slug: string): PromoPageData | undefined {
  const config = collectionLandingPages.find((page) => page.slug === slug);
  if (!config) return undefined;

  return {
    slug: config.slug,
    title: config.h1 || config.title,
    eyebrow: DEFAULT_PROMO_EYEBROW,
    description:
      SHORT_DESCRIPTIONS[config.slug] ??
      truncate(config.seoDescription, 36),
    category: config.breadcrumbLabel,
    mapOverlayEnabled: true,
  };
}

export function buildAllCollectionPromoData(): PromoPageData[] {
  return collectionLandingPages.map((config) => ({
    slug: config.slug,
    title: config.h1 || config.title,
    eyebrow: DEFAULT_PROMO_EYEBROW,
    description:
      SHORT_DESCRIPTIONS[config.slug] ??
      truncate(config.seoDescription, 36),
    category: config.breadcrumbLabel,
    mapOverlayEnabled: true,
  }));
}

export function loadPromoPagesFromJson(filePath: string): PromoPageData[] {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as
    | PromoPageData[]
    | { pages: PromoPageData[] };
  return Array.isArray(raw) ? raw : raw.pages;
}
