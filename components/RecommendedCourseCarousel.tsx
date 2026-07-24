import Link from "next/link";
import { resolveResponsiveLocalImage } from "@/lib/responsiveLocalImage";

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

function RecommendedCourseCard({ course }: { course: RecommendedCarouselItem }) {
  const image = resolveResponsiveLocalImage(course.imagePath, {
    sizes: "(max-width: 1024px) 50vw, 180px",
  });

  return (
    <Link
      href={`/courses/${course.id}`}
      aria-label={`${course.name} 상세보기`}
      className={`group block h-full focus:outline-none ${FOCUS_RING}`}
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-emerald-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            srcSet={image.srcSet}
            sizes={image.sizes}
            alt=""
            width={480}
            height={300}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
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
  );
}

/**
 * 단일 DOM만 렌더링하고 CSS로 모바일(가로 스와이프 2열) /
 * 데스크톱(5열 그리드) 레이아웃만 바꾼다.
 */
export default function RecommendedCourseCarousel({
  courses,
}: RecommendedCourseCarouselProps) {
  return (
    <div
      className="grid grid-flow-col auto-cols-[calc(50%-0.5rem)] grid-rows-1 gap-4 overflow-x-auto overscroll-x-contain pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-5 lg:overflow-visible lg:pb-0 lg:snap-none"
      aria-label="추천 골프장 목록"
    >
      {courses.map((course) => (
        <div key={course.id} className="snap-start lg:snap-align-none">
          <RecommendedCourseCard course={course} />
        </div>
      ))}
    </div>
  );
}
