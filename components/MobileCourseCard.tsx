"use client";

import Link from "next/link";
import type { Course } from "@/types/course";
import { formatHoleCount } from "@/lib/courseDisplay";
import {
  formatCardReservationPriceParts,
  hasReservationPrice,
} from "@/lib/coursePrice";
import FavoriteButton from "@/components/FavoriteButton";
import VisitedButton from "@/components/VisitedButton";

interface MobileCourseCardProps {
  course: Course;
  selected?: boolean;
}

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-emerald-50 text-emerald-800",
  회원제: "bg-slate-100 text-slate-700",
  "군 골프장": "bg-amber-50 text-amber-800",
  기타: "bg-stone-100 text-stone-600",
};

function formatCardPrice(course: Course): string {
  const { label, value } = formatCardReservationPriceParts(course);
  if (value === "요금 정보 준비 중") return value;
  if (label === "최저 예약가") return `최저 ${value}`;
  if (label === "예약가") return `예약가 ${value}`;
  return value;
}

export default function MobileCourseCard({
  course,
  selected = false,
}: MobileCourseCardProps) {
  const hasPrice = hasReservationPrice(course);
  const locationLabel = [course.city, course.region].filter(Boolean).join(" · ");

  return (
    <div
      className={`relative min-h-[52px] rounded-xl border bg-white transition active:scale-[0.995] ${
        selected
          ? "border-brand-600/45 bg-brand-50/35 ring-1 ring-brand-200/50"
          : "border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      }`}
    >
      <Link
        href={`/courses/${course.id}`}
        id={`course-card-${course.id}`}
        className="flex flex-col px-3.5 py-3 pr-[4.25rem]"
      >
        <h3 className="truncate text-[14px] font-bold leading-tight text-stone-900">
          {course.name}
        </h3>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
            {locationLabel && (
              <span className="truncate text-[11px] text-stone-500">
                {locationLabel}
              </span>
            )}
            <span
              className={`shrink-0 rounded px-1.5 py-px text-[10px] font-semibold leading-none ${
                TYPE_STYLES[course.courseType] ?? TYPE_STYLES["기타"]
              }`}
            >
              {course.courseType}
            </span>
            <span className="shrink-0 rounded bg-brand-50 px-1.5 py-px text-[10px] font-semibold leading-none text-brand-800">
              {formatHoleCount(course.holeCount)}
            </span>
          </div>
          <span
            className={`max-w-[108px] shrink-0 truncate text-right text-[11px] font-semibold leading-none ${
              hasPrice ? "text-brand-900" : "font-normal text-stone-400"
            }`}
          >
            {formatCardPrice(course)}
          </span>
        </div>
      </Link>

      <div className="absolute right-0.5 top-1.5 flex items-center">
        <VisitedButton courseId={course.id} size="sm" />
        <FavoriteButton courseId={course.id} size="sm" />
      </div>
    </div>
  );
}
