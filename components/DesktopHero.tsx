"use client";

import SearchBar from "@/components/SearchBar";

interface DesktopHeroProps {
  totalCourses: number;
  query: string;
  onQueryChange: (query: string) => void;
}

export default function DesktopHero({
  totalCourses,
  query,
  onQueryChange,
}: DesktopHeroProps) {
  return (
    <section className="shrink-0 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-800 px-6 py-8">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-5 text-center">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-brand-100/90">
            전국 {totalCourses.toLocaleString()}개 골프장
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
            가까운 골프장을 찾아보세요
          </h1>
          <p className="text-sm text-brand-100/80">
            지역, 홀수, 캐디 여부까지 한번에 비교
          </p>
        </div>
        <div className="w-full max-w-xl">
          <SearchBar
            value={query}
            onChange={onQueryChange}
            placeholder="골프장명, 지역, 주소로 검색"
            size="lg"
            variant="hero"
          />
        </div>
      </div>
    </section>
  );
}
