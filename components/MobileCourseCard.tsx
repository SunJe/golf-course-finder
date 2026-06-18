"use client";

import Link from "next/link";
import { Flag, ChevronRight } from "lucide-react";
import type { Course } from "@/types/course";
import {
  formatHoleCount,
  isPriceAvailable,
} from "@/lib/courseDisplay";
import { formatGreenFeeShort } from "@/lib/format";
import {
  getKakaoMapSearchUrl,
  getNaverMapSearchUrl,
} from "@/lib/externalMapLinks";

interface MobileCourseCardProps {
  course: Course;
  selected?: boolean;
  onSelect?: (course: Course) => void;
  compact?: boolean;
  showDetailLink?: boolean;
}

export default function MobileCourseCard({
  course,
  selected = false,
  onSelect,
  compact = false,
  showDetailLink = false,
}: MobileCourseCardProps) {
  const hasWeekdayPrice = isPriceAvailable(course.weekdayGreenFeeMin);

  return (
    <article
      id={`course-card-${course.id}`}
      onClick={() => onSelect?.(course)}
      className={`cursor-pointer rounded-2xl border bg-white transition active:scale-[0.99] ${
        selected
          ? "border-brand-600/40 shadow-md ring-2 ring-brand-200/80"
          : "border-stone-200/80 shadow-sm"
      } ${compact ? "p-2.5" : "p-3.5"}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            selected ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700"
          }`}
        >
          <Flag className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`min-w-0 flex-1 font-bold leading-snug text-gray-900 ${
                compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-[15px]"
              }`}
            >
              {course.name}
            </h3>
            {hasWeekdayPrice && !compact && (
              <span className="shrink-0 text-sm font-bold text-brand-800">
                {formatGreenFeeShort(course.weekdayGreenFeeMin)}
              </span>
            )}
          </div>

          {!compact && (
            <p className="mt-0.5 text-xs text-stone-500">
              {course.city} · {course.region} · {formatHoleCount(course.holeCount)}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
              {course.courseType}
            </span>
            {compact && hasWeekdayPrice && (
              <span className="text-[11px] font-semibold text-brand-800">
                {formatGreenFeeShort(course.weekdayGreenFeeMin)}
              </span>
            )}
            {!hasWeekdayPrice && !compact && (
              <span className="text-[11px] text-stone-400">가격 정보 없음</span>
            )}
          </div>
        </div>
      </div>

      {(!compact || showDetailLink) && (
        <div className="mt-3 flex items-stretch gap-1.5">
          <Link
            href={`/courses/${course.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-0.5 rounded-xl bg-brand-700 px-3 text-xs font-bold text-white"
          >
            상세보기
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          {!compact && (
            <>
              <a
                href={getKakaoMapSearchUrl(course)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex min-h-[44px] min-w-[52px] items-center justify-center rounded-xl border border-stone-200 bg-white px-2 text-[11px] font-semibold text-stone-600"
              >
                카카오
              </a>
              <a
                href={getNaverMapSearchUrl(course)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex min-h-[44px] min-w-[52px] items-center justify-center rounded-xl border border-stone-200 bg-white px-2 text-[11px] font-semibold text-stone-600"
              >
                네이버
              </a>
            </>
          )}
        </div>
      )}
    </article>
  );
}
