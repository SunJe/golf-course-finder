"use client";

import Link from "next/link";
import { X, MapPin, Flag, ChevronRight } from "lucide-react";
import type { Course } from "@/types/course";
import { formatPrice } from "@/lib/format";

interface CourseMarkerPopupProps {
  course: Course;
  onClose?: () => void;
}

/** Kakao / Naver / Custom / Fallback 지도 공통 마커 팝업 */
export default function CourseMarkerPopup({
  course,
  onClose,
}: CourseMarkerPopupProps) {
  return (
    <div className="w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card-hover">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.imageUrl}
          alt={course.name}
          className="h-24 w-full object-cover"
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-2 top-2 rounded-full bg-black/40 p-1 text-white transition hover:bg-black/60"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold text-brand-700">
          {course.courseType}
        </span>
      </div>

      <div className="p-3">
        <h4 className="truncate text-sm font-bold text-gray-900">
          {course.name}
        </h4>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{course.address}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1 font-medium">
            <Flag className="h-3 w-3 text-brand-600" />
            {course.holeCount}홀
          </span>
          <span className="text-gray-300">|</span>
          <span>{course.courseType}</span>
          <span className="text-gray-300">|</span>
          <span>
            주중{" "}
            <span className="font-semibold text-brand-700">
              {formatPrice(course.weekdayGreenFeeMin)}
            </span>
          </span>
        </div>
        <Link
          href={`/courses/${course.id}`}
          className="mt-2.5 flex w-full items-center justify-center gap-0.5 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
          상세보기
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
