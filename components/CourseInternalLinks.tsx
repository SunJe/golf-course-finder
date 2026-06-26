import Link from "next/link";
import type { PublicCourse } from "@/lib/publicCourse";
import { getCourseInternalLinks } from "@/lib/contentGuides";

const PRIMARY_CLASS =
  "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800";

interface CourseInternalLinksProps {
  course: PublicCourse;
}

export function CourseInternalLinks({ course }: CourseInternalLinksProps) {
  const links = getCourseInternalLinks(course);

  return (
    <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
        GolfMap에서 더 비교하기
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        같은 지역·비슷한 조건의 골프장을 GolfMap 안에서 먼저 살펴보세요.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={PRIMARY_CLASS}>
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
