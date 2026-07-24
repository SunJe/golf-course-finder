"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Map, Search } from "lucide-react";
import SiteContainer from "@/components/layout/SiteContainer";
import { trackEvent } from "@/lib/analytics";
import {
  buildMapQuickFilterHref,
  buildMapSearchHref,
} from "@/lib/mapUrlState";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const QUICK_CHIPS = [
  {
    id: "near-seoul" as const,
    label: "서울 근교",
    href: buildMapQuickFilterHref("near-seoul"),
  },
  {
    id: "budget" as const,
    label: "10만원 이하",
    href: buildMapQuickFilterHref("budget"),
  },
  {
    id: "nine-hole" as const,
    label: "9홀",
    href: buildMapQuickFilterHref("nine-hole"),
  },
  {
    id: "beginner" as const,
    label: "초보자",
    href: buildMapQuickFilterHref("beginner"),
  },
];

export default function HomeSearchHero() {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    trackEvent("mobile_home_search", {
      has_query: trimmed.length > 0,
      query_len: Math.min(trimmed.length, 40),
    });
    window.location.assign(buildMapSearchHref(trimmed));
  };

  return (
    <section className="border-b border-stone-100 bg-gradient-to-b from-emerald-50/70 via-white to-white">
      <SiteContainer variant="narrow" className="py-7 md:py-10">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          어디에서 라운드할까요?
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-[15px]">
          골프장명·지역으로 찾고, 그린피·홀 수 조건으로 바로 비교하세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="home-course-search" className="sr-only">
            골프장명 또는 지역 검색
          </label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden
              />
              <input
                id="home-course-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="골프장명·지역 검색"
                autoComplete="off"
                enterKeyHint="search"
                className={`h-12 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-3 text-base text-stone-900 shadow-sm placeholder:text-stone-400 ${FOCUS_RING}`}
              />
            </div>
            <button
              type="submit"
              className={`inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-brand-800 px-4 text-sm font-semibold text-white ${FOCUS_RING}`}
            >
              검색
            </button>
          </div>
        </form>

        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="빠른 조건"
        >
          {QUICK_CHIPS.map((chip) => (
            <Link
              key={chip.id}
              href={chip.href}
              onClick={() =>
                trackEvent("quick_filter_click", { chip: chip.id })
              }
              className={`inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-900 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 ${FOCUS_RING}`}
            >
              {chip.label}
            </Link>
          ))}
        </div>

        <Link
          href="/map"
          className={`mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-900 sm:w-auto ${FOCUS_RING}`}
        >
          <Map className="h-4 w-4" aria-hidden />
          지도로 찾기
        </Link>
      </SiteContainer>
    </section>
  );
}
