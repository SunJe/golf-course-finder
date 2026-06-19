"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
import FavoriteButton from "@/components/FavoriteButton";
import VisitedButton from "@/components/VisitedButton";

interface MobileCourseCardProps {
  course: Course;
  selected?: boolean;
  onSelect?: (course: Course) => void;
  compact?: boolean;
  showDetailLink?: boolean;
}

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-emerald-50 text-emerald-800",
  회원제: "bg-slate-100 text-slate-700",
  "군 골프장": "bg-amber-50 text-amber-800",
  기타: "bg-stone-100 text-stone-600",
};

export default function MobileCourseCard({
  course,
  selected = false,
  onSelect,
  compact = false,
  showDetailLink = false,
}: MobileCourseCardProps) {
  const hasWeekdayPrice = isPriceAvailable(course.weekdayGreenFeeMin);
  const showActions = !compact || showDetailLink;

  return (
    <article
      id={`course-card-${course.id}`}
      onClick={() => onSelect?.(course)}
      className={`cursor-pointer rounded-2xl border bg-white transition active:scale-[0.995] ${
        selected
          ? "border-brand-600/50 bg-brand-50/40 shadow-card ring-1 ring-brand-200/60"
          : "border-stone-200/80 shadow-card"
      } ${compact ? "p-3" : "p-3.5"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3
            className={`font-bold leading-snug text-stone-900 ${
              compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-[15px]"
            }`}
          >
            {course.name}
          </h3>
          {!compact && (
            <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">
              {course.city} · {course.region}
            </p>
          )}
          {compact && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-500">
              {course.city} · {course.region}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-0.5">
            <VisitedButton courseId={course.id} size="md" />
            <FavoriteButton courseId={course.id} size="md" />
          </div>
          {hasWeekdayPrice && (
            <span
              className={`font-bold text-brand-800 ${
                compact ? "text-[11px]" : "text-sm"
              }`}
            >
              {formatGreenFeeShort(course.weekdayGreenFeeMin)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            TYPE_STYLES[course.courseType] ?? TYPE_STYLES["기타"]
          }`}
        >
          {course.courseType}
        </span>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
          {formatHoleCount(course.holeCount)}
        </span>
        {!hasWeekdayPrice && !compact && (
          <span className="text-[10px] text-stone-400">요금 정보 준비 중</span>
        )}
      </div>

      {showActions && (
        <div className="mt-2.5 flex items-stretch gap-1.5">
          <Link
            href={`/courses/${course.id}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex min-h-[40px] flex-1 items-center justify-center gap-0.5 rounded-xl bg-brand-800 px-2.5 text-[11px] font-bold text-white"
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
                onMouseDown={(e) => e.stopPropagation()}
                className="flex min-h-[40px] min-w-[48px] items-center justify-center rounded-xl border border-stone-200/90 bg-white px-2 text-[10px] font-semibold text-stone-600"
              >
                카카오
              </a>
              <a
                href={getNaverMapSearchUrl(course)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex min-h-[40px] min-w-[48px] items-center justify-center rounded-xl border border-stone-200/90 bg-white px-2 text-[10px] font-semibold text-stone-600"
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
