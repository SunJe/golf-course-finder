"use client";

import type { Course } from "@/types/course";
import { formatHoleCount } from "@/lib/courseDisplay";

interface SearchSuggestionsProps {
  courses: Course[];
  onSelect: (course: Course) => void;
  onMouseDown?: (course: Course) => void;
}

export default function SearchSuggestions({
  courses,
  onSelect,
  onMouseDown,
}: SearchSuggestionsProps) {
  if (courses.length === 0) return null;

  return (
    <ul
      className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(280px,40dvh)] overflow-y-auto overscroll-contain rounded-2xl border border-stone-200/80 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] [-webkit-overflow-scrolling:touch]"
      role="listbox"
    >
      {courses.map((course) => (
        <li key={course.id} role="option">
          <button
            type="button"
            className="flex w-full min-h-[44px] flex-col items-start gap-0.5 px-3.5 py-2.5 text-left transition hover:bg-stone-50 active:bg-stone-100"
            onMouseDown={(e) => {
              e.preventDefault();
              onMouseDown?.(course);
            }}
            onClick={() => onSelect(course)}
          >
            <span className="line-clamp-1 text-[14px] font-semibold text-stone-900">
              {course.name}
            </span>
            <span className="line-clamp-1 text-[11px] text-stone-500">
              {[course.city, course.region].filter(Boolean).join(" · ")}
              <span className="mx-1 text-stone-300">·</span>
              {course.courseType}
              <span className="mx-1 text-stone-300">·</span>
              {formatHoleCount(course.holeCount)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
