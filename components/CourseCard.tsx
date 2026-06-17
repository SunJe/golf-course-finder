"use client";

import Link from "next/link";
import { MapPin, Flag, ChevronRight } from "lucide-react";
import type { Course } from "@/types/course";
import { formatPrice } from "@/lib/format";
import {
  getKakaoMapSearchUrl,
  getNaverMapSearchUrl,
} from "@/lib/externalMapLinks";
import Tag from "@/components/Tag";
import CourseFeatureBadges from "@/components/CourseFeatureBadges";
import CourseImage from "@/components/CourseImage";

interface CourseCardProps {
  course: Course;
  selected?: boolean;
  hovered?: boolean;
  onSelect?: (course: Course) => void;
  onHover?: (course: Course | null) => void;
}

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-brand-50 text-brand-700",
  회원제: "bg-indigo-50 text-indigo-700",
  "군 골프장": "bg-amber-50 text-amber-700",
  기타: "bg-gray-100 text-gray-600",
};

export default function CourseCard({
  course,
  selected = false,
  hovered = false,
  onSelect,
  onHover,
}: CourseCardProps) {
  return (
    <article
      id={`course-card-${course.id}`}
      onClick={() => onSelect?.(course)}
      onMouseEnter={() => onHover?.(course)}
      onMouseLeave={() => onHover?.(null)}
      className={`group cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all ${
        selected
          ? "border-brand-500 bg-brand-50/50 shadow-card-hover ring-2 ring-brand-200"
          : hovered
            ? "border-brand-300 bg-brand-50/30 shadow-card-hover"
            : "border-gray-200 shadow-card hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
      }`}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-20 flex-shrink-0 sm:h-[88px] sm:w-[88px]">
          <CourseImage
            src={course.imageUrl}
            alt={course.name}
            className="h-full w-full rounded-xl object-cover object-[center_35%]"
          />
          <span
            className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLES[course.courseType]}`}
          >
            {course.courseType}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 gap-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start gap-2">
              <h3 className="line-clamp-2 min-w-0 flex-1 break-keep text-[15px] font-bold leading-snug text-gray-900">
                {course.name}
              </h3>
              <span className="flex-shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">
                {course.region}
              </span>
            </div>

            <p className="mt-0.5 truncate text-[11px] font-medium text-gray-500">
              {course.city}
            </p>

            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-gray-400">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{course.address}</span>
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 rounded bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
                <Flag className="h-3 w-3 text-brand-600" />
                {course.holeCount}홀
              </span>
              <CourseFeatureBadges course={course} />
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-col items-end justify-end text-right">
            <span className="text-[10px] text-gray-400">주중</span>
            <span className="text-base font-extrabold leading-tight text-brand-700">
              {formatPrice(course.weekdayGreenFeeMin)}
            </span>
            <span className="mt-0.5 whitespace-nowrap text-[10px] text-gray-400">
              주말 {formatPrice(course.weekendGreenFeeMin)}~
            </span>
          </div>
        </div>
      </div>

      {course.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2">
          {course.tags.slice(0, 2).map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      )}

      <div className="flex items-stretch gap-1.5 border-t border-gray-100 px-3 py-2">
        <Link
          href={`/courses/${course.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-0.5 rounded-lg bg-brand-600 px-3 text-xs font-bold text-white transition hover:bg-brand-700 sm:min-h-0 sm:py-2"
        >
          상세보기
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <a
          href={getKakaoMapSearchUrl(course)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex min-h-[44px] min-w-[52px] items-center justify-center rounded-lg border border-gray-200 px-2 text-[11px] font-semibold text-gray-600 transition hover:border-[#fee500] hover:bg-[#fee500]/10 sm:min-h-0 sm:py-2"
          title="카카오맵"
        >
          카카오
        </a>
        <a
          href={getNaverMapSearchUrl(course)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex min-h-[44px] min-w-[52px] items-center justify-center rounded-lg border border-gray-200 px-2 text-[11px] font-semibold text-gray-600 transition hover:border-[#03c75a] hover:bg-[#03c75a]/5 sm:min-h-0 sm:py-2"
          title="네이버지도"
        >
          네이버
        </a>
      </div>
    </article>
  );
}
