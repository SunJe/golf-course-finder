"use client";

import { Flag } from "lucide-react";
import type { CourseMapBaseProps } from "@/types/map";
import {
  projectToPercent,
  CUSTOM_REGION_LABELS,
} from "@/lib/mapProjection";
import { formatGreenFeeShort } from "@/lib/format";
import { resolveCourseMapBindings } from "@/lib/courseMapBindings";
import CourseMarkerPopup from "@/components/maps/CourseMarkerPopup";

/**
 * 커스텀 한국 지도 placeholder.
 *
 * TODO: Replace this placeholder with SVG or GeoJSON based Korea map.
 * TODO: Add region-level color scale based on golf course count.
 * TODO: Add average green fee color scale by region.
 * TODO: Add marker clustering by region.
 * TODO: Add courseType based marker color.
 */
export default function CustomKoreaMap(props: CourseMapBaseProps) {
  const { courses, className = "" } = props;
  const { selectedCourseId, selectCourseById } =
    resolveCourseMapBindings(props);

  const selected = courses.find((c) => c.id === selectedCourseId);
  const selectedPos = selected
    ? projectToPercent(selected.latitude, selected.longitude)
    : null;

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 ${className}`}
    >
      {/* 아이보리/연초록 톤 배경 */}
      <div className="absolute inset-0 bg-[#f4f7f0]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 50% 45%, #e8f0e4 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 75% 80%, #dceee0 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(100,130,90,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(100,130,90,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* 단순 한반도 실루엣 (placeholder) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-30"
        viewBox="0 0 100 130"
        preserveAspectRatio="xMidYMid meet"
      >
        <ellipse cx="52" cy="55" rx="22" ry="38" fill="#c8dcc0" />
        <ellipse cx="68" cy="108" rx="6" ry="8" fill="#c8dcc0" />
      </svg>

      {CUSTOM_REGION_LABELS.map((r) => {
        const pos = projectToPercent(r.lat, r.lng);
        return (
          <span
            key={r.name}
            style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none text-sm font-bold text-brand-800/50"
          >
            {r.name}
          </span>
        );
      })}

      {courses.map((course) => {
        const pos = projectToPercent(course.latitude, course.longitude);
        const isSel = course.id === selectedCourseId;
        return (
          <button
            key={course.id}
            type="button"
            onClick={() => selectCourseById(course.id)}
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
                isSel ? "scale-125" : "group-hover:scale-110"
              }`}
            >
              <span
                className={`flex items-center gap-1 rounded-full border-2 border-white font-bold text-white shadow-md ${
                  isSel
                    ? "bg-brand-700 px-3 py-1.5 text-xs"
                    : "bg-brand-500 px-2 py-0.5 text-[11px]"
                }`}
              >
                <Flag className={isSel ? "h-4 w-4" : "h-3 w-3"} />
                {formatGreenFeeShort(course.weekdayGreenFeeMin)}
              </span>
              <span
                className={`-mt-0.5 h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-white ${
                  isSel ? "bg-brand-700" : "bg-brand-500"
                }`}
              />
            </span>
          </button>
        );
      })}

      {selected && selectedPos && (
        <div
          style={{ left: `${selectedPos.left}%`, top: `${selectedPos.top}%` }}
          className="absolute z-40 w-64 -translate-x-1/2 -translate-y-[calc(100%+2.5rem)] animate-fade-in"
        >
          <CourseMarkerPopup
            course={selected}
            onClose={() => selectCourseById(selected.id)}
          />
        </div>
      )}

      <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
        커스텀 지도 · <span className="text-brand-600">{courses.length}</span>곳
      </div>
    </div>
  );
}
