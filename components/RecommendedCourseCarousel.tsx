import Link from "next/link";
import Image from "next/image";

export type RecommendedCarouselItem = {
  id: string;
  name: string;
  locationLabel: string;
  priceLabel: string;
  imagePath: string;
};

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

interface RecommendedCourseCarouselProps {
  courses: RecommendedCarouselItem[];
}

/** 홈 추천 골프장 — 5열 × 2행 정적 그리드 */
export default function RecommendedCourseCarousel({
  courses,
}: RecommendedCourseCarouselProps) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5"
      aria-label="추천 골프장 목록"
    >
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/courses/${course.id}`}
          aria-label={`${course.name} 상세보기`}
          className={`group block focus:outline-none ${FOCUS_RING}`}
        >
          <article className="flex h-full flex-col">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-emerald-50">
              <Image
                src={course.imagePath}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
                className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
                draggable={false}
              />
            </div>
            <div className="flex flex-1 flex-col pt-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="line-clamp-1 text-sm font-bold text-slate-950 group-hover:text-emerald-700 sm:text-base">
                  {course.name}
                </h3>
                <span
                  className="shrink-0 text-lg leading-none text-slate-300 transition group-hover:text-emerald-700"
                  aria-hidden
                >
                  ›
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500 sm:text-sm">
                {course.locationLabel}
              </p>
              <p className="mt-2 text-right text-xs font-semibold text-emerald-700 sm:mt-3 sm:text-sm">
                {course.priceLabel}
              </p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
