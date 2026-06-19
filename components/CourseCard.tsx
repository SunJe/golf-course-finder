"use client";

import Link from "next/link";
import { MapPin, ExternalLink, ChevronRight } from "lucide-react";
import type { Course } from "@/types/course";
import { formatHoleCount, isPriceAvailable } from "@/lib/courseDisplay";
import { formatGreenFeeShort } from "@/lib/format";
import {
  getKakaoMapSearchUrl,
  getNaverMapSearchUrl,
} from "@/lib/externalMapLinks";
import CourseFeatureBadges from "@/components/CourseFeatureBadges";

interface CourseCardProps {
  course: Course;
  selected?: boolean;
  hovered?: boolean;
  onSelect?: (course: Course) => void;
  onHover?: (course: Course | null) => void;
}

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  회원제: "bg-slate-100 text-slate-700 ring-slate-200/80",
  "군 골프장": "bg-amber-50 text-amber-800 ring-amber-100",
  기타: "bg-stone-100 text-stone-600 ring-stone-200/80",
};

export default function CourseCard({
  course,
  selected = false,
  hovered = false,
  onSelect,
  onHover,
}: CourseCardProps) {
  const hasWeekdayPrice = isPriceAvailable(course.weekdayGreenFeeMin);

  return (
    <article
      id={`course-card-${course.id}`}
      onClick={() => onSelect?.(course)}
      onMouseEnter={() => onHover?.(course)}
      onMouseLeave={() => onHover?.(null)}
      className={`group cursor-pointer rounded-2xl border bg-white transition-all duration-200 ${
        selected
          ? "border-brand-600/50 shadow-md ring-2 ring-brand-200/80"
          : hovered
            ? "border-brand-300/60 shadow-md"
            : "border-stone-200/80 shadow-sm hover:border-stone-300 hover:shadow-md"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-stone-900">
              {course.name}
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              {course.city} · {course.region}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{course.address}</span>
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TYPE_STYLES[course.courseType]}`}
              >
                {course.courseType}
              </span>
              <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-800 ring-1 ring-inset ring-brand-100">
                {formatHoleCount(course.holeCount)}
              </span>
              <CourseFeatureBadges course={course} />
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[11px] font-medium text-stone-400">
              그린피
            </span>
            <p
              className={`mt-0.5 text-lg font-bold leading-tight ${
                hasWeekdayPrice ? "text-brand-800" : "text-sm font-medium text-stone-400"
              }`}
            >
              {hasWeekdayPrice
                ? formatGreenFeeShort(course.weekdayGreenFeeMin)
                : "정보 없음"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-stretch border-t border-stone-100 text-sm">
        <Link
          href={`/courses/${course.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-1 items-center justify-center gap-1 py-3 font-semibold text-brand-800 transition hover:bg-brand-50/50"
        >
          상세보기
          <ChevronRight className="h-4 w-4" />
        </Link>
        <span className="w-px self-stretch bg-stone-100" />
        <a
          href={getKakaoMapSearchUrl(course)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-1 items-center justify-center gap-1 py-3 font-medium text-stone-600 transition hover:bg-stone-50"
        >
          카카오
          <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
        </a>
        <span className="w-px self-stretch bg-stone-100" />
        <a
          href={getNaverMapSearchUrl(course)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-1 items-center justify-center gap-1 py-3 font-medium text-stone-600 transition hover:bg-stone-50"
        >
          네이버
          <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
        </a>
      </div>
    </article>
  );
}
