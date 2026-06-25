"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronRight, Map, SlidersHorizontal } from "lucide-react";
import type { Course } from "@/types/course";
import type { CollectionSlug } from "@/lib/collectionLanding";
import type { MobileHubRegionLink } from "@/lib/regionIndex";
import SearchBar from "@/components/SearchBar";
import SearchSuggestions from "@/components/SearchSuggestions";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const CONDITION_ITEMS = [
  {
    label: "저렴한",
    href: "/collections/near-seoul-budget",
    ariaLabel: "서울 근교 저렴한 골프장 보기",
  },
  {
    label: "초보자",
    href: "/collections/near-seoul-beginner",
    ariaLabel: "서울 근교 초보자 골프장 보기",
  },
  {
    label: "백돌이",
    href: "/collections/near-seoul-baekdori",
    ariaLabel: "서울 근교 백돌이 골프장 보기",
  },
  {
    label: "대중제",
    href: "/collections/public",
    ariaLabel: "대중제 골프장 보기",
  },
  {
    label: "나인홀",
    href: "/collections/nine-hole",
    ariaLabel: "나인홀 골프장 보기",
  },
] as const;

const RECOMMENDED_ITEMS: {
  slug: CollectionSlug;
  title: string;
  href: string;
  description: string;
  ariaLabel: string;
}[] = [
  {
    slug: "near-seoul-budget",
    title: "서울 근교 저렴한 골프장",
    href: "/collections/near-seoul-budget",
    description: "참고 최저가 기준으로 서울 근교 골프장을 확인하세요.",
    ariaLabel: "서울 근교 저렴한 골프장 목록 보기",
  },
  {
    slug: "near-seoul-beginner",
    title: "서울 근교 초보자 골프장",
    href: "/collections/near-seoul-beginner",
    description: "초보자가 참고하기 좋은 조건의 골프장을 확인하세요.",
    ariaLabel: "서울 근교 초보자 골프장 목록 보기",
  },
  {
    slug: "near-seoul-baekdori",
    title: "서울 근교 백돌이 골프장",
    href: "/collections/near-seoul-baekdori",
    description: "백돌이 골퍼가 부담을 줄여볼 수 있는 조건의 골프장을 확인하세요.",
    ariaLabel: "서울 근교 백돌이 골프장 목록 보기",
  },
];

function HubChip({
  href,
  label,
  ariaLabel,
}: {
  href: string;
  label: string;
  ariaLabel: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 ${FOCUS_RING}`}
    >
      {label}
    </Link>
  );
}

export interface MobileHomeHubToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onFilterOpen: () => void;
  activeFilterCount: number;
  suggestions: Course[];
  onSuggestionSelect: (course: Course) => void;
}

/** 검색 + 필터 (모바일 골프맵 상단 고정) */
export function MobileHomeHubToolbar({
  query,
  onQueryChange,
  onFilterOpen,
  activeFilterCount,
  suggestions,
  onSuggestionSelect,
}: MobileHomeHubToolbarProps) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuggestions =
    suggestionsOpen && query.trim().length > 0 && suggestions.length > 0;

  const handleSuggestionPick = (course: Course) => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    onSuggestionSelect(course);
    setSuggestionsOpen(false);
  };

  return (
    <div className="bg-[#F3F2EA] px-4 pb-3 pt-3">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchBar
            value={query}
            onChange={(value) => {
              onQueryChange(value);
              setSuggestionsOpen(true);
            }}
            placeholder="골프장명, 지역, 주소로 검색"
            variant="mobile"
            onFocus={() => {
              if (blurTimerRef.current) {
                clearTimeout(blurTimerRef.current);
                blurTimerRef.current = null;
              }
              setSuggestionsOpen(true);
            }}
            onBlur={() => {
              blurTimerRef.current = setTimeout(() => {
                setSuggestionsOpen(false);
              }, 180);
            }}
            onClear={() => setSuggestionsOpen(false)}
          />
          {showSuggestions && (
            <SearchSuggestions
              courses={suggestions}
              onSelect={handleSuggestionPick}
              onMouseDown={handleSuggestionPick}
            />
          )}
        </div>
        <button
          type="button"
          onClick={onFilterOpen}
          aria-label="필터 열기"
          className={`relative flex h-12 min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-stone-200/90 bg-white px-3.5 text-xs font-semibold text-stone-700 shadow-card ${FOCUS_RING}`}
        >
          <SlidersHorizontal className="h-4 w-4 text-stone-500" />
          필터
          {activeFilterCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}

export interface MobileHomeHubDiscoveryProps {
  collectionCounts: Partial<Record<CollectionSlug, number>>;
  regionLinks: MobileHubRegionLink[];
  onShowMap?: () => void;
  showMapCta?: boolean;
  showIntro?: boolean;
}

/** 지역·조건·추천 목록 (모바일 골프맵 — 지도 아래) */
export function MobileHomeHubDiscovery({
  collectionCounts,
  regionLinks,
  onShowMap,
  showMapCta = false,
  showIntro = true,
}: MobileHomeHubDiscoveryProps) {
  return (
    <div className="border-t border-stone-200/60 bg-[#F3F2EA] px-4 pb-6 pt-5">
      {showIntro ? (
        <div className="mb-6">
          <h1 className="text-xl font-extrabold leading-snug tracking-tight text-stone-900">
            가까운 골프장을 빠르게 찾아보세요
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            지역과 조건을 고르면 맞는 골프장 목록을 바로 볼 수 있어요.
          </p>
        </div>
      ) : null}

      <section aria-labelledby="mobile-hub-regions">
        <h2
          id="mobile-hub-regions"
          className="text-sm font-bold text-stone-800"
        >
          지역으로 찾기
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {regionLinks.map((item) => (
            <HubChip key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section className="mt-6" aria-labelledby="mobile-hub-conditions">
        <h2
          id="mobile-hub-conditions"
          className="text-sm font-bold text-stone-800"
        >
          조건으로 찾기
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONDITION_ITEMS.map((item) => (
            <HubChip key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section className="mt-6" aria-labelledby="mobile-hub-recommended">
        <h2
          id="mobile-hub-recommended"
          className="text-sm font-bold text-stone-800"
        >
          많이 찾는 골프장 목록
        </h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {RECOMMENDED_ITEMS.map((item) => {
            const count = collectionCounts[item.slug];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.ariaLabel}
                  className={`group flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40 ${FOCUS_RING}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-stone-900 group-hover:text-brand-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {item.description}
                    </p>
                    {count != null && count > 0 ? (
                      <p className="mt-2 text-xs font-semibold text-brand-800">
                        {count.toLocaleString()}곳
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight
                    className="mt-0.5 h-5 w-5 shrink-0 text-stone-400 group-hover:text-brand-700"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {showMapCta && onShowMap ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={onShowMap}
            className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-800 px-5 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-brand-900 ${FOCUS_RING}`}
          >
            <Map className="h-5 w-5" aria-hidden />
            전체 골프장 지도 보기
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use MobileHomeHubToolbar + MobileHomeHubDiscovery */
export interface MobileHomeHubProps extends MobileHomeHubToolbarProps {
  collectionCounts: Partial<Record<CollectionSlug, number>>;
  regionLinks: MobileHubRegionLink[];
  onShowMap: () => void;
}

export default function MobileHomeHub({
  onShowMap,
  collectionCounts,
  regionLinks,
  ...toolbarProps
}: MobileHomeHubProps) {
  return (
    <>
      <MobileHomeHubToolbar {...toolbarProps} />
      <MobileHomeHubDiscovery
        collectionCounts={collectionCounts}
        regionLinks={regionLinks}
        onShowMap={onShowMap}
        showMapCta
      />
    </>
  );
}
