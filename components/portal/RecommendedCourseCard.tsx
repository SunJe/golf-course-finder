import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Globe, ChevronRight } from "lucide-react";
import type { RecommendedCourseMeta } from "@/lib/recommendedCourses";
import { formatCourseLocationLabel } from "@/lib/regionUtils";
import { formatHoleCount } from "@/lib/courseDisplay";
import { formatPriceRange, getPriceMin, hasPrice } from "@/lib/priceFormat";
import { getCourseSeoImagePath } from "@/lib/seoImages";
import { courseSeoImageExists } from "@/lib/courseSeoImage";
import { isNineHoleCourse } from "@/lib/collectionFilters";

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  회원제: "bg-slate-100 text-slate-700 ring-slate-200/80",
  "군 골프장": "bg-amber-50 text-amber-800 ring-amber-100",
  기타: "bg-stone-100 text-stone-600 ring-stone-200/80",
};

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

function formatDistanceLabel(distanceKm: number | null): string {
  if (distanceKm == null) return "거리 정보 없음";
  if (distanceKm < 1) return "서울 기준 1km 이내";
  return `서울 기준 ${Math.round(distanceKm)}km`;
}

function buildBadges(meta: RecommendedCourseMeta): string[] {
  const { course, nearSeoul, hasReferencePrice, hasPhone, hasHomepage } = meta;
  const badges: string[] = [];

  if (course.courseType === "대중제") badges.push("대중제");
  if (isNineHoleCourse(course)) badges.push("9홀");
  else if (course.holeCount === 18) badges.push("18홀");
  if (nearSeoul) badges.push("서울 근교");
  if (hasReferencePrice) {
    const min = getPriceMin(course);
    if (min != null && min <= 150_000) badges.push("저렴한 요금");
  }
  if (hasHomepage) badges.push("홈페이지 있음");
  if (hasPhone) badges.push("전화번호 있음");

  return badges.slice(0, 4);
}

interface RecommendedCourseCardProps {
  meta: RecommendedCourseMeta;
}

export default function RecommendedCourseCard({ meta }: RecommendedCourseCardProps) {
  const { course, distanceKm } = meta;
  const typeStyle = TYPE_STYLES[course.courseType ?? ""] ?? TYPE_STYLES.기타;
  const badges = buildBadges(meta);
  const hasImage = courseSeoImageExists(course.id);
  const imagePath = getCourseSeoImagePath(course.id);

  return (
    <Link
      href={`/courses/${course.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition hover:border-brand-300 hover:shadow-md ${FOCUS_RING}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-50 via-emerald-50/80 to-stone-100">
        {hasImage ? (
          <Image
            src={imagePath}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100">
              {course.courseType ?? "골프장"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-stone-900">
              {course.name}
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              {formatCourseLocationLabel(course)}
            </p>
          </div>
          <ChevronRight
            className="mt-0.5 h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-brand-600"
            aria-hidden
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {course.courseType ? (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${typeStyle}`}
            >
              {course.courseType}
            </span>
          ) : null}
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex rounded-full bg-stone-50 px-2.5 py-0.5 text-[11px] font-medium text-stone-600 ring-1 ring-stone-200/80"
            >
              {badge}
            </span>
          ))}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-stone-400">홀수</dt>
            <dd className="mt-0.5 font-medium text-stone-800">
              {formatHoleCount(course.holeCount)}
            </dd>
          </div>
          <div>
            <dt className="text-stone-400">참고 요금</dt>
            <dd className="mt-0.5 font-medium text-brand-800">
              {hasPrice(course) ? formatPriceRange(course) : "정보 없음"}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-stone-400">서울 기준 거리</dt>
            <dd className="mt-0.5 flex items-center gap-1 font-medium text-stone-700">
              <MapPin className="h-3 w-3 shrink-0 text-brand-600" aria-hidden />
              {formatDistanceLabel(distanceKm)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
          <span className="inline-flex items-center gap-3">
            {meta.hasPhone ? (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" aria-hidden />
                전화
              </span>
            ) : null}
            {meta.hasHomepage ? (
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" aria-hidden />
                홈페이지
              </span>
            ) : null}
          </span>
          <span className="font-semibold text-brand-800 group-hover:underline">
            상세보기
          </span>
        </div>
      </div>
    </Link>
  );
}
