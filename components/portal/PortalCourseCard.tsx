import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import type { Course } from "@/types/course";
import { formatCourseLocationLabel } from "@/lib/regionUtils";
import { formatPriceRange, hasPrice } from "@/lib/priceFormat";

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-emerald-50 text-emerald-800",
  회원제: "bg-slate-100 text-slate-700",
  "군 골프장": "bg-amber-50 text-amber-800",
  기타: "bg-stone-100 text-stone-600",
};

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

interface PortalCourseCardProps {
  course: Course;
}

export default function PortalCourseCard({ course }: PortalCourseCardProps) {
  const typeStyle =
    TYPE_STYLES[course.courseType ?? ""] ?? TYPE_STYLES.기타;
  const priceLabel = hasPrice(course) ? formatPriceRange(course) : null;

  return (
    <Link
      href={`/courses/${course.id}`}
      className={`group flex h-full flex-col rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md sm:p-5 ${FOCUS_RING}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-stone-900">
          {course.name}
        </h3>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-brand-600"
          aria-hidden
        />
      </div>
      <p className="mt-1 text-sm text-stone-500">
        {formatCourseLocationLabel(course)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {course.courseType ? (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeStyle}`}
          >
            {course.courseType}
          </span>
        ) : null}
        {priceLabel ? (
          <span className="text-xs font-medium text-brand-800">
            참고 {priceLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-auto flex items-center gap-1 pt-3 text-xs text-stone-400">
        <MapPin className="h-3 w-3 shrink-0" aria-hidden />
        <span className="line-clamp-1">{course.address}</span>
      </p>
    </Link>
  );
}
