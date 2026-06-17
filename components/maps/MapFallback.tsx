"use client";

import { Flag, Plus, Minus } from "lucide-react";
import type { Course } from "@/types/course";
import type { MapProvider } from "@/types/map";
import {
  projectToPercent,
  FALLBACK_REGION_LABELS,
} from "@/lib/mapProjection";
import { formatGreenFeeShort } from "@/lib/format";
import CourseMarkerPopup from "@/components/maps/CourseMarkerPopup";

interface MapFallbackProps {
  courses: Course[];
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string) => void;
  provider?: MapProvider;
  message?: string;
  className?: string;
}

const DEFAULT_MESSAGES: Record<MapProvider, string> = {
  kakao: "Kakao Map API 키를 설정하면 실제 지도가 표시됩니다.",
  naver: "Naver Map API 키를 설정하면 실제 지도가 표시됩니다.",
  custom: "지도 API 키를 설정하면 실제 지도가 표시됩니다.",
};

export default function MapFallback({
  courses,
  selectedCourseId,
  onSelectCourse,
  provider = "kakao",
  message,
  className = "",
}: MapFallbackProps) {
  const selected = courses.find((c) => c.id === selectedCourseId);
  const selectedPos = selected
    ? projectToPercent(selected.latitude, selected.longitude)
    : null;

  const notice = message ?? DEFAULT_MESSAGES[provider];

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-label="지도 placeholder"
    >
      <div className="absolute inset-0" style={{ backgroundColor: "#cfe3ee" }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 48% 42%, #e8f3e6 0%, #e2efdf 38%, rgba(226,239,223,0) 62%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(80,110,90,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(80,110,90,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-50"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path d="M20,8 C30,30 25,55 38,78 L42,98" stroke="#b9d3c4" strokeWidth="0.6" fill="none" />
        <path d="M62,4 C58,28 70,46 64,70 L70,96" stroke="#b9d3c4" strokeWidth="0.6" fill="none" />
        <path d="M8,40 C35,36 60,52 95,46" stroke="#cfe0d6" strokeWidth="0.5" fill="none" />
        <path d="M14,66 C40,62 70,72 92,68" stroke="#cfe0d6" strokeWidth="0.5" fill="none" />
      </svg>

      {FALLBACK_REGION_LABELS.map((r) => {
        const pos = projectToPercent(r.lat, r.lng);
        return (
          <span
            key={r.name}
            style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none text-[13px] font-bold text-gray-500/70"
          >
            {r.name}
          </span>
        );
      })}

      <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <span className="flex h-8 w-8 items-center justify-center border-b border-gray-100 text-gray-400">
          <Plus className="h-4 w-4" />
        </span>
        <span className="flex h-8 w-8 items-center justify-center text-gray-400">
          <Minus className="h-4 w-4" />
        </span>
      </div>

      {courses.map((course) => {
        const pos = projectToPercent(course.latitude, course.longitude);
        const isSel = course.id === selectedCourseId;
        return (
          <button
            key={course.id}
            type="button"
            onClick={() => onSelectCourse?.(course.id)}
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              zIndex: isSel ? 30 : 10,
            }}
            className="group absolute -translate-x-1/2 -translate-y-full focus:outline-none"
            aria-label={course.name}
          >
            <span
              className={`flex flex-col items-center transition-transform ${
                isSel ? "scale-110" : "group-hover:scale-105"
              }`}
            >
              <span
                className={`flex items-center gap-1 rounded-full border-2 border-white font-bold text-white shadow-md ${
                  isSel
                    ? "bg-brand-600 px-2.5 py-1 text-xs"
                    : "bg-brand-500 px-2 py-0.5 text-[11px] group-hover:bg-brand-600"
                }`}
              >
                <Flag className={isSel ? "h-3.5 w-3.5" : "h-3 w-3"} />
                {formatGreenFeeShort(course.weekdayGreenFeeMin)}
              </span>
              <span
                className={`-mt-0.5 h-2 w-2 rotate-45 border-b-2 border-r-2 border-white ${
                  isSel ? "bg-brand-600" : "bg-brand-500"
                }`}
              />
            </span>
          </button>
        );
      })}

      {selected && selectedPos && (
        <div
          style={{ left: `${selectedPos.left}%`, top: `${selectedPos.top}%` }}
          className="absolute z-40 w-64 -translate-x-1/2 -translate-y-[calc(100%+2.25rem)] animate-fade-in"
        >
          <CourseMarkerPopup
            course={selected}
            onClose={() => onSelectCourse?.(selected.id)}
          />
        </div>
      )}

      <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
        지도에 <span className="text-brand-600">{courses.length}</span>곳 표시
      </div>

      <div className="absolute bottom-2 right-2 z-10 max-w-[55%] rounded bg-black/30 px-2 py-1 text-right text-[10px] leading-tight text-white/85">
        {notice}
      </div>
    </div>
  );
}
