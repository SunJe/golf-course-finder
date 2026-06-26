import Link from "next/link";
import { getCoursesForStaticPages } from "@/lib/courseRepository";
import { regionLandingPages } from "@/lib/regionLanding";
import {
  computeRegionCounts,
  getSitemapRegionSlugs,
} from "@/lib/regionIndex";

interface RegionLinksProps {
  currentSlug?: string;
  className?: string;
  title?: string;
  variant?: "region" | "card";
}

export default async function RegionLinks({
  currentSlug,
  className = "",
  title = "다른 지역 골프장",
  variant = "region",
}: RegionLinksProps) {
  let indexableSlugs: string[] | null = null;
  try {
    const courses = await getCoursesForStaticPages();
    const counts = computeRegionCounts(courses);
    indexableSlugs = getSitemapRegionSlugs(counts);
  } catch (error) {
    console.warn("[RegionLinks] Failed to load region counts:", error);
  }

  const pages = regionLandingPages.filter((page) => {
    if (page.slug === currentSlug) return false;
    if (indexableSlugs && !indexableSlugs.includes(page.slug)) return false;
    return true;
  });

  if (pages.length === 0) return null;

  const isCard = variant === "card";

  const sectionClass = isCard
    ? `rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6 ${className}`
    : `rounded-2xl border border-region-soft-border bg-white p-6 shadow-card sm:p-7 ${className}`;

  const titleClass = isCard
    ? "text-lg font-bold tracking-tight text-gray-900 sm:text-xl"
    : "text-lg font-extrabold text-region-ink";

  const descClass = isCard
    ? "mt-1 text-sm text-gray-500"
    : "mt-2 text-sm text-region-muted sm:text-base";

  const linkClass = isCard
    ? "inline-flex min-h-[44px] items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
    : "inline-flex min-h-[44px] items-center rounded-full border-2 border-region-soft-border bg-region-soft/50 px-5 py-2 text-sm font-bold text-region-ink transition hover:border-brand-600 hover:bg-brand-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

  return (
    <section className={sectionClass}>
      <h2 className={titleClass}>{title}</h2>
      <p className={descClass}>
        지역별 골프장 위치, 전화번호, 홈페이지, 참고 요금을 확인하세요.
      </p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/regions/${page.slug}`}
              title={`${page.label} 골프장 목록 보기`}
              className={linkClass}
            >
              {page.label} 골프장
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
