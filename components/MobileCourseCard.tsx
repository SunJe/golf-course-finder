"use client";

import Link from "next/link";
import type { Course } from "@/types/course";
import { formatHoleCount } from "@/lib/courseDisplay";
import { getMobilePriceText } from "@/lib/coursePrice";
import { formatCourseLocationLabel } from "@/lib/regionUtils";

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

export default function MobileCourseCard({
  course,
  selected = false,
}: MobileCourseCardProps) {
  const locationLabel = formatCourseLocationLabel(course);
  const price = getMobilePriceText(course);

  return (
    <div
      className={`relative min-h-[72px] rounded-xl border bg-white transition active:scale-[0.995] ${
        selected
          ? "border-brand-600/45 bg-brand-50/35 ring-1 ring-brand-200/50"
          : "border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      }`}
    >
      <Link
        href={`/courses/${course.id}`}
        id={`course-card-${course.id}`}
        aria-label={`${course.name} 상세 정보 보기`}
        className="block px-3.5 py-3"
      >
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-stone-900">
          {course.name}
        </h3>

        <p
          className={
            price.tone === "highlight"
              ? "mt-1 text-[18px] font-bold leading-tight tracking-tight text-blue-700"
              : "mt-1 text-[13px] font-medium leading-snug text-stone-400"
          }
        >
          {price.value}
        </p>

        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
          {locationLabel ? (
            <span className="max-w-full truncate text-[11px] text-stone-500">
              {locationLabel}
            </span>
          ) : null}
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

        {course.address ? (
          <p className="mt-1 truncate text-[11px] text-stone-400">
            {course.address}
          </p>
        ) : null}
      </Link>
    </div>
  );
}
