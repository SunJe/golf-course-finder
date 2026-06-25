import PortalSection from "@/components/portal/PortalSection";
import RecommendedCourseCard from "@/components/portal/RecommendedCourseCard";
import PortalLinkCard from "@/components/portal/PortalLinkCard";
import { RECOMMENDED_CONDITION_CARDS } from "@/components/portal/PortalDiscoverySections";
import { loadRecommendedCourses } from "@/components/portal/HomeRecommendedSection";
import { buildRecommendedMetadata } from "@/lib/seoMetadata";

export const metadata = buildRecommendedMetadata();
export const revalidate = 86400;

export default async function RecommendedPage() {
  const recommended = await loadRecommendedCourses();

  return (
    <>
      <section className="border-b border-stone-200/80 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
            추천 골프장
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            접근성, 가격 정보, 운영 형태를 기준으로 골라본 추천 골프장입니다.
          </p>
        </div>
      </section>

      <PortalSection
        title="에디터 추천 TOP 10"
        description="정보 완성도와 접근성을 기준으로 선정한 추천 골프장입니다."
      >
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {recommended.map((meta) => (
            <li key={meta.course.id}>
              <RecommendedCourseCard meta={meta} />
            </li>
          ))}
        </ul>
      </PortalSection>

      <PortalSection
        title="조건별 추천"
        description="목적에 맞는 골프장 목록으로 더 넓게 탐색해 보세요."
        className="border-t border-stone-100 bg-white/50"
      >
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RECOMMENDED_CONDITION_CARDS.map((item) => (
            <li key={item.href}>
              <PortalLinkCard {...item} />
            </li>
          ))}
        </ul>
      </PortalSection>
    </>
  );
}
