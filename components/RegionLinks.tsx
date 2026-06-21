import Link from "next/link";
import { regionLandingPages } from "@/lib/regionLanding";

interface RegionLinksProps {
  currentSlug?: string;
  className?: string;
  title?: string;
}

export default function RegionLinks({
  currentSlug,
  className = "",
  title = "다른 지역 골프장",
}: RegionLinksProps) {
  const pages = regionLandingPages.filter((page) => page.slug !== currentSlug);

  if (pages.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border border-region-soft-border bg-white p-6 shadow-card sm:p-7 ${className}`}
    >
      <h2 className="text-lg font-extrabold text-region-ink">{title}</h2>
      <p className="mt-2 text-sm text-region-muted sm:text-base">
        지역별 골프장 위치, 전화번호, 홈페이지, 참고 요금을 확인하세요.
      </p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/regions/${page.slug}`}
              className="inline-flex min-h-[44px] items-center rounded-full border-2 border-region-soft-border bg-region-soft/50 px-5 py-2 text-sm font-bold text-region-ink transition hover:border-brand-600 hover:bg-brand-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
            >
              {page.label} 골프장
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
