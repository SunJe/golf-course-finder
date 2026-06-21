import Link from "next/link";
import { getCoursesForStaticPages } from "@/lib/courseRepository";
import {
  collectionLandingPages,
  NATIONAL_COLLECTION_SLUGS,
  NEAR_SEOUL_COLLECTION_SLUGS,
  type CollectionSlug,
} from "@/lib/collectionLanding";
import { computeCollectionCounts } from "@/lib/collectionIndex";

const COLLECTION_CARD_LABELS: Record<CollectionSlug, string> = {
  "near-seoul": "서울 근교 골프장",
  public: "대중제 골프장",
  baekdori: "백돌이 골프장",
  beginner: "초보자 골프장",
  par3: "파3 골프장",
  "nine-hole": "나인홀 골프장",
  budget: "저렴한 골프장",
  "near-seoul-public": "서울 근교 대중제 골프장",
  "near-seoul-baekdori": "서울 근교 백돌이 골프장",
  "near-seoul-beginner": "서울 근교 초보자 골프장",
  "near-seoul-budget": "서울 근교 저렴한 골프장",
  "near-seoul-nine-hole": "서울 근교 나인홀 골프장",
  "near-seoul-par3": "서울 근교 파3 골프장",
};

interface CollectionLinksProps {
  currentSlug?: CollectionSlug;
  className?: string;
}

function CollectionLinkGrid({
  slugs,
  currentSlug,
}: {
  slugs: readonly CollectionSlug[];
  currentSlug?: CollectionSlug;
}) {
  const pages = collectionLandingPages.filter(
    (page) => slugs.includes(page.slug) && page.slug !== currentSlug,
  );

  if (pages.length === 0) return null;

  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((page) => (
        <li key={page.slug}>
          <Link
            href={`/collections/${page.slug}`}
            className="flex h-full flex-col rounded-xl border border-region-soft-border bg-region-soft/40 p-4 transition hover:border-brand-600 hover:bg-region-soft hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            <span className="text-base font-extrabold text-region-ink">
              {COLLECTION_CARD_LABELS[page.slug]}
            </span>
            <span className="mt-2 text-sm leading-relaxed text-region-muted">
              {page.seoDescription}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function CollectionLinks({
  currentSlug,
  className = "",
}: CollectionLinksProps) {
  let counts: Record<CollectionSlug, number> | null = null;
  try {
    const courses = await getCoursesForStaticPages();
    counts = computeCollectionCounts(courses);
  } catch (error) {
    console.warn("[CollectionLinks] Failed to load collection counts:", error);
  }

  const nationalSlugs = NATIONAL_COLLECTION_SLUGS.filter((slug) => {
    if (counts && counts[slug] === 0) return false;
    return true;
  });

  const nearSeoulSlugs = NEAR_SEOUL_COLLECTION_SLUGS.filter((slug) => {
    if (slug === "near-seoul-par3" && counts && counts["near-seoul-par3"] === 0) {
      return false;
    }
    if (counts && counts[slug] === 0) return false;
    return true;
  });

  const showNational =
    nationalSlugs.filter((slug) => slug !== currentSlug).length > 0;
  const showNearSeoul =
    nearSeoulSlugs.filter((slug) => slug !== currentSlug).length > 0;

  if (!showNational && !showNearSeoul) return null;

  return (
    <div className={className}>
      {showNational ? (
        <section className="rounded-2xl border border-region-soft-border bg-white p-6 shadow-card sm:p-7">
          <h2 className="text-lg font-extrabold text-region-ink">
            조건별 골프장 찾기
          </h2>
          <p className="mt-2 text-sm text-region-muted sm:text-base">
            목적별 골프장 목록을 참고용으로 확인하세요. GolfMap Korea 데이터
            기준 분류입니다.
          </p>
          <CollectionLinkGrid slugs={nationalSlugs} currentSlug={currentSlug} />
        </section>
      ) : null}

      {showNearSeoul ? (
        <section
          className={`rounded-2xl border border-region-soft-border bg-white p-6 shadow-card sm:p-7 ${showNational ? "mt-8" : ""}`}
        >
          <h2 className="text-lg font-extrabold text-region-ink">
            서울 근교 골프장 찾기
          </h2>
          <p className="mt-2 text-sm text-region-muted sm:text-base">
            서울에서 접근하기 좋은 골프장을 목적별로 확인하세요. 서울시청 기준
            거리와 경기·인천 지역 정보를 활용합니다.
          </p>
          <CollectionLinkGrid
            slugs={nearSeoulSlugs}
            currentSlug={currentSlug}
          />
        </section>
      ) : null}
    </div>
  );
}
