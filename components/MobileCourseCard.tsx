"use client";

import Link from "next/link";
import { MapPin, Flag, ChevronRight } from "lucide-react";
import type { Course } from "@/types/course";
import {
  formatOptionalPrice,
  formatHoleCount,
  isPriceAvailable,
} from "@/lib/courseDisplay";
import {
  getKakaoMapSearchUrl,
  getNaverMapSearchUrl,
} from "@/lib/externalMapLinks";

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-brand-50 text-brand-700",
  회원제: "bg-indigo-50 text-indigo-700",
  "군 골프장": "bg-amber-50 text-amber-700",
  기타: "bg-gray-100 text-gray-600",
};

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
      className={`cursor-pointer rounded-xl border bg-white transition ${
        selected
          ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-200"
          : "border-gray-200 shadow-sm active:bg-gray-50"
      } ${compact ? "p-2.5" : "p-3"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3
              className={`min-w-0 flex-1 font-bold leading-snug text-gray-900 ${
                compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-[15px]"
              }`}
            >
              {course.name}
            </h3>
            <span
              className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLES[course.courseType]}`}
            >
              {course.courseType}
            </span>
          </div>

          {!compact && (
            <>
              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {course.city} · {course.region}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{course.address}</span>
              </p>
            </>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-brand-700">
              <Flag className="h-3 w-3" />
              {formatHoleCount(course.holeCount)}
            </span>
            <span
              className={`text-[11px] font-semibold ${
                hasWeekdayPrice ? "text-brand-700" : "text-gray-500"
              }`}
            >
              주중 {formatOptionalPrice(course.weekdayGreenFeeMin)}
            </span>
          </div>
        </div>
      </div>

      {(!compact || showDetailLink) && (
        <div className="mt-2.5 flex items-stretch gap-1.5">
          <Link
            href={`/courses/${course.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`flex min-h-[44px] items-center justify-center gap-0.5 rounded-lg bg-brand-600 px-3 text-xs font-bold text-white ${
              compact ? "flex-1" : "flex-1"
            }`}
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
                className="flex min-h-[44px] min-w-[52px] items-center justify-center rounded-lg border border-gray-200 px-2 text-[11px] font-semibold text-gray-600"
              >
                카카오
              </a>
              <a
                href={getNaverMapSearchUrl(course)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex min-h-[44px] min-w-[52px] items-center justify-center rounded-lg border border-gray-200 px-2 text-[11px] font-semibold text-gray-600"
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
