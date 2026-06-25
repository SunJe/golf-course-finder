import Link from "next/link";
import {
  Banknote,
  Building2,
  Flag,
  MapPinned,
  Mountain,
  Trees,
  Waves,
} from "lucide-react";
import PortalSection from "@/components/portal/PortalSection";
import PortalLinkCard from "@/components/portal/PortalLinkCard";

const POPULAR_CONDITIONS = [
  {
    href: "/collections/near-seoul",
    title: "서울 근교 골프장",
    description: "수도권에서 이동하기 좋은 코스",
    icon: MapPinned,
  },
  {
    href: "/collections/budget",
    title: "저렴한 골프장",
    description: "부담을 줄이고 싶을 때",
    icon: Banknote,
  },
  {
    href: "/collections/public",
    title: "대중제 골프장",
    description: "퍼블릭·대중제 위주로 보기",
    icon: Building2,
  },
  {
    href: "/regions/gyeonggi",
    title: "경기도 골프장",
    description: "경기 지역 골프장 모아보기",
    icon: Trees,
  },
  {
    href: "/regions/gangwon",
    title: "강원도 골프장",
    description: "강원 지역 골프장 모아보기",
    icon: Mountain,
  },
] as const;

const PURPOSE_COLLECTIONS = [
  {
    href: "/collections/budget",
    title: "가격 부담 적은 골프장",
    description: "참고 요금 기준으로 비교해 보세요",
    icon: Banknote,
  },
  {
    href: "/collections/near-seoul",
    title: "서울에서 가기 좋은 골프장",
    description: "서울·수도권 접근성 중심",
    icon: MapPinned,
  },
  {
    href: "/collections/public",
    title: "대중제 골프장",
    description: "대중제·퍼블릭 코스 위주",
    icon: Building2,
  },
  {
    href: "/regions/gyeonggi",
    title: "지역별 골프장",
    description: "경기부터 시작해 지역별로 탐색",
    icon: Trees,
  },
] as const;

const REGION_LINKS = [
  { slug: "gyeonggi", label: "경기" },
  { slug: "gangwon", label: "강원" },
  { slug: "chungcheong", label: "충청" },
  { slug: "jeolla", label: "전라" },
  { slug: "gyeongsang", label: "경상" },
  { slug: "jeju", label: "제주" },
] as const;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

export function PopularConditionsSection({ className = "" }: { className?: string }) {
  return (
    <PortalSection
      title="지금 많이 찾는 골프장 조건"
      description="목적에 맞는 골프장 목록으로 바로 이동할 수 있습니다."
      className={className}
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR_CONDITIONS.map((item) => (
          <li key={item.href}>
            <PortalLinkCard {...item} />
          </li>
        ))}
      </ul>
    </PortalSection>
  );
}

export function PurposeCollectionsSection({ className = "" }: { className?: string }) {
  return (
    <PortalSection
      title="목적별 골프장 찾기"
      description="컬렉션별로 정리된 골프장 목록을 확인해 보세요."
      className={`border-t border-stone-100 bg-white/50 ${className}`}
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PURPOSE_COLLECTIONS.map((item) => (
          <li key={item.href}>
            <PortalLinkCard {...item} />
          </li>
        ))}
      </ul>
    </PortalSection>
  );
}

export function RegionGridSection({ className = "" }: { className?: string }) {
  return (
    <PortalSection
      title="지역별 골프장 찾기"
      description="광역 지역 단위로 골프장을 모아볼 수 있습니다."
      className={className}
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {REGION_LINKS.map(({ slug, label }) => (
          <li key={slug}>
            <Link
              href={`/regions/${slug}`}
              className={`flex min-h-[52px] items-center justify-center rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-900 ${FOCUS_RING}`}
            >
              <Waves className="mr-1.5 hidden h-4 w-4 text-brand-600 sm:inline" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </PortalSection>
  );
}

export default function PortalDiscoverySections() {
  return (
    <>
      <PopularConditionsSection />
      <PurposeCollectionsSection />
      <RegionGridSection />
    </>
  );
}

export const RECOMMENDED_CONDITION_CARDS = [
  {
    href: "/collections/near-seoul",
    title: "서울 근교 골프장",
    description: "수도권 접근성 중심으로 비교해 보세요",
    icon: MapPinned,
  },
  {
    href: "/collections/budget",
    title: "저렴한 골프장",
    description: "참고 요금 기준으로 부담을 줄여보세요",
    icon: Banknote,
  },
  {
    href: "/collections/public",
    title: "대중제 골프장",
    description: "퍼블릭·대중제 코스 위주",
    icon: Building2,
  },
  {
    href: "/collections/nine-hole",
    title: "9홀 골프장",
    description: "짧은 라운드와 연습 목적에 적합한 코스",
    icon: Flag,
  },
  {
    href: "/collections/par3",
    title: "파3 골프장",
    description: "Par 3·파3 성격 코스를 모아봤어요",
    icon: Flag,
  },
  {
    href: "/regions/gyeonggi",
    title: "지역별 골프장",
    description: "경기부터 시작해 지역별로 탐색",
    icon: Trees,
  },
] as const;
