import Link from "next/link";
import type { ComponentType } from "react";
import {
  MapPin,
  Phone,
  Globe,
  ChevronRight,
  ArrowRight,
  LayoutGrid,
  Users,
  Crown,
  CircleDollarSign,
} from "lucide-react";
import type { Course } from "@/types/course";
import { cityAnchorId, getTopCityGroups } from "@/lib/regionCityHelpers";
import {
  formatRegionCoursePrice,
  type RegionLandingConfig,
  type RegionLandingStats,
  type ConditionalSectionConfig,
  buildRegionHeroDescription,
  buildRegionHeroPills,
  buildRegionSeoParagraph,
  buildRegionFaqItems,
  buildConditionalSectionIntro,
  buildConditionalChipLabel,
  getCityQuickLinkDescription,
  getRegionMapHref,
  buildRegionAllCoursesDescription,
  courseHasValidPhone,
  courseHasValidHomepage,
  pickFeaturedCourses,
  pickRepresentativeCourses,
  filterCoursesByCondition,
  CONDITIONAL_SECTIONS,
  PRIMARY_CONDITIONAL_SECTIONS,
  SECONDARY_CONDITIONAL_SECTIONS,
  getCityQuickLinkTitle,
} from "@/lib/regionLanding";
import RegionLinks from "@/components/RegionLinks";
import CollectionLinks from "@/components/CollectionLinks";
import SeoRepresentativeImage from "@/components/SeoRepresentativeImage";
import { RelatedGuidesSection } from "@/components/RelatedGuidesSection";
import { getRelatedBlogGuidesForRegion } from "@/lib/contentGuides";
import { getRegionSeoImagePath } from "@/lib/seoImages";
import { formatHoleCount } from "@/lib/courseDisplay";

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  회원제: "bg-slate-200 text-slate-900 ring-slate-300",
  "군 골프장": "bg-amber-100 text-amber-950 ring-amber-300",
  기타: "bg-stone-200 text-stone-800 ring-stone-300",
};

const PREVIEW_LIMIT = 5;
const ALL_COURSES_PREVIEW = 25;
const CITY_QUICK_LINK_LIMIT = 12;
const CITY_COURSES_MAX = 10;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const STAT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  전체: LayoutGrid,
  대중제: Users,
  회원제: Crown,
  전화번호: Phone,
  홈페이지: Globe,
  "요금 정보": CircleDollarSign,
};

function SectionShell({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-2xl border border-region-soft-border bg-white p-6 shadow-card sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-extrabold tracking-tight text-region-ink sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2.5 text-base leading-relaxed text-region-muted sm:text-[1.05rem]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  const Icon = STAT_ICONS[label] ?? LayoutGrid;
  return (
    <div className="relative overflow-hidden rounded-xl border border-region-soft-border bg-white px-5 py-5 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-700 to-brand-500" />
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-700" aria-hidden />
        <p className="text-sm font-semibold text-region-muted">{label}</p>
      </div>
      <p className="mt-2 text-4xl font-extrabold tabular-nums tracking-tight text-brand-800">
        {value.toLocaleString("ko-KR")}
      </p>
    </div>
  );
}

function HeroPill({ suffix, value }: { suffix: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-region-soft-border bg-region-soft px-4 py-2 text-sm shadow-sm">
      <span className="font-extrabold text-brand-800">
        {value.toLocaleString("ko-KR")}곳
      </span>
      <span className="font-medium text-region-ink">{suffix}</span>
    </span>
  );
}

function RegionCourseCard({ course }: { course: Course }) {
  const hasHomepage = courseHasValidHomepage(course);
  const hasPhone = courseHasValidPhone(course);
  const priceLabel = formatRegionCoursePrice(course);
  const hasPrice = priceLabel !== "요금 정보 준비 중";

  return (
    <li>
      <Link
        href={`/courses/${course.id}`}
        aria-label={`${course.name} 상세 정보 보기`}
        className={`group flex min-h-[148px] flex-col gap-4 rounded-2xl border border-region-soft-border bg-white p-5 transition hover:border-brand-600 hover:bg-region-soft hover:shadow-card-hover sm:flex-row sm:items-start sm:gap-6 sm:p-6 ${FOCUS_RING}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-extrabold text-region-ink group-hover:text-brand-800 sm:text-xl">
              {course.name}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                TYPE_STYLES[course.courseType] ?? TYPE_STYLES.기타
              }`}
            >
              {course.courseType || "기타"}
            </span>
            {course.holeCount ? (
              <span className="inline-flex items-center rounded-full bg-region-accent/60 px-2.5 py-0.5 text-xs font-bold text-region-ink ring-1 ring-inset ring-amber-200/80">
                {formatHoleCount(course.holeCount)}
              </span>
            ) : null}
          </div>
          <p className="mt-3 flex items-start gap-2 text-[0.95rem] leading-relaxed text-region-ink/90 sm:text-base">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-700/70"
              aria-hidden
            />
            <span>{course.address || "주소 정보 준비 중"}</span>
          </p>
          <div className="mt-3.5 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6 sm:text-[0.95rem]">
            <span
              className={`inline-flex items-center gap-1.5 ${hasPhone ? "font-medium text-region-ink" : "text-region-muted"}`}
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              {hasPhone ? course.phone : "전화번호 없음"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 ${hasHomepage ? "font-medium text-region-ink" : "text-region-muted"}`}
            >
              <Globe className="h-4 w-4 shrink-0" aria-hidden />
              {hasHomepage ? "홈페이지 있음" : "홈페이지 없음"}
            </span>
            <span
              className={`font-semibold ${hasPrice ? "text-brand-800" : "text-region-muted"}`}
            >
              참고 요금 {priceLabel}
            </span>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 self-end rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-800 transition group-hover:border-brand-400 group-hover:bg-brand-100 sm:self-center">
          상세보기
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      </Link>
    </li>
  );
}

function CompactCourseList({
  courses,
  emptyMessage,
}: {
  courses: Course[];
  emptyMessage: string;
}) {
  if (courses.length === 0) {
    return (
      <p className="rounded-xl border border-region-soft-border bg-region-soft/50 p-5 text-base text-region-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {courses.map((course) => (
        <RegionCourseCard key={course.id} course={course} />
      ))}
    </ul>
  );
}

function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={`mt-6 inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-region-soft px-5 py-3 text-sm font-bold text-brand-800 transition hover:border-brand-500 hover:bg-brand-100 ${FOCUS_RING}`}
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function ConditionalListSection({
  section,
  config,
  courses,
  stats,
  compact = false,
}: {
  section: ConditionalSectionConfig;
  config: RegionLandingConfig;
  courses: Course[];
  stats: RegionLandingStats;
  compact?: boolean;
}) {
  const filtered = filterCoursesByCondition(courses, section.key);
  const preview = filtered.slice(0, PREVIEW_LIMIT);
  const intro = buildConditionalSectionIntro(
    config.label,
    section,
    filtered.length,
  );

  if (filtered.length === 0 && compact) return null;

  return (
    <SectionShell id={section.id} className="mt-8">
      <SectionHeading title={section.title} description={intro} />
      <CompactCourseList
        courses={preview}
        emptyMessage={`현재 ${config.label} 지역에 해당 조건의 골프장 정보는 준비 중입니다.`}
      />
      {filtered.length > PREVIEW_LIMIT ? (
        <ViewAllLink
          href="#all-courses"
          label={`${config.label} 골프장 전체 ${stats.total}곳 보기`}
        />
      ) : null}
    </SectionShell>
  );
}

export default function RegionLandingView({
  config,
  courses,
  stats,
}: {
  config: RegionLandingConfig;
  courses: Course[];
  stats: RegionLandingStats;
}) {
  const featured = pickFeaturedCourses(courses, 5);
  const h1 = `${config.label} 골프장 지도`;
  const cityQuickLinks = getTopCityGroups(courses, CITY_QUICK_LINK_LIMIT);
  const faqItems = buildRegionFaqItems(config.label, stats);
  const heroPills = buildRegionHeroPills(config.label, stats);
  const mapHref = getRegionMapHref(config.slug);
  const previewCourses = courses.slice(0, ALL_COURSES_PREVIEW);

  return (
    <div className="min-h-screen bg-region-cream">
      <div className="mx-auto max-w-[920px] px-5 pb-20 pt-6 sm:px-6 sm:pt-10">
        <nav className="mb-6 text-sm font-medium text-region-muted">
          <Link href="/map" className={`text-brand-800 transition hover:text-brand-900 ${FOCUS_RING}`}>
            전국 골프장 지도
          </Link>
          <span className="mx-2 text-region-soft-border">/</span>
          <span className="text-region-ink">{config.label} 골프장</span>
        </nav>

        <header className="overflow-hidden rounded-2xl border border-region-soft-border bg-gradient-to-br from-region-soft via-white to-region-accent/25 p-7 shadow-card sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-region-ink sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {h1}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-[1.75] text-region-muted sm:text-lg sm:leading-[1.8]">
            {buildRegionHeroDescription(config.label, stats, courses)}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {heroPills.map((pill) => (
              <HeroPill key={pill.suffix} suffix={pill.suffix} value={pill.value} />
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={mapHref}
              className={`inline-flex min-h-[48px] items-center justify-center rounded-xl bg-brand-700 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-brand-800 ${FOCUS_RING}`}
            >
              {config.label} 골프장 지도에서 보기
            </Link>
            <Link
              href="/map"
              className={`inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-region-soft-border bg-white px-6 py-3 text-base font-bold text-region-ink transition hover:border-brand-600 hover:bg-region-soft ${FOCUS_RING}`}
            >
              전국 골프장 지도로 돌아가기
            </Link>
          </div>
        </header>

        <SectionShell className="mt-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="전체" value={stats.total} />
            <StatCard label="대중제" value={stats.publicCount} />
            <StatCard label="회원제" value={stats.memberCount} />
            <StatCard label="전화번호" value={stats.withPhone} />
            <StatCard label="홈페이지" value={stats.withHomepage} />
            <StatCard label="요금 정보" value={stats.withPrice} />
          </div>
        </SectionShell>

        <SectionShell className="mt-8 border-l-4 border-l-brand-600">
          <p className="text-base leading-[1.8] text-region-ink/90 sm:text-lg">
            {buildRegionSeoParagraph(config.label, stats, courses)}
          </p>
        </SectionShell>

        {cityQuickLinks.length > 0 ? (
          <SectionShell className="mt-8">
            <SectionHeading
              title={getCityQuickLinkTitle(config.label)}
              description={getCityQuickLinkDescription(config.label, courses)}
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cityQuickLinks.map((group) => {
                const samples = pickRepresentativeCourses(group.courses, 3);
                const anchor = cityAnchorId(group.slug);

                return (
                  <li key={group.slug}>
                    <Link
                      href={`#${anchor}`}
                      className={`group flex h-full flex-col rounded-xl border border-region-soft-border bg-white p-5 transition hover:border-brand-600 hover:bg-region-soft hover:shadow-card-hover ${FOCUS_RING}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-lg font-extrabold text-region-ink group-hover:text-brand-800 sm:text-xl">
                          {group.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-brand-700 px-3 py-1 text-sm font-bold text-white">
                          {group.count}곳
                        </span>
                      </div>
                      {samples.length > 0 ? (
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-region-muted sm:text-[0.95rem]">
                          {samples.map((c) => c.name).join(" · ")}
                        </p>
                      ) : null}
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-800 group-hover:text-brand-900">
                        {group.name} 골프장 {group.count}곳 보기 →
                        <ArrowRight
                          className="h-4 w-4 transition group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SectionShell>
        ) : null}

        <SectionShell className="mt-8">
          <SectionHeading
            title={`조건별로 ${config.label} 골프장 보기`}
            description="운영 형태·정보 유형별로 골프장을 빠르게 찾아볼 수 있습니다."
          />
          <ul className="flex flex-wrap gap-3">
            {CONDITIONAL_SECTIONS.map((section) => {
              const count = filterCoursesByCondition(
                courses,
                section.key,
              ).length;
              if (count === 0) return null;
              return (
                <li key={section.id}>
                  <Link
                    href={`#${section.id}`}
                    className={`inline-flex min-h-[44px] items-center rounded-full border-2 border-region-soft-border bg-white px-5 py-2.5 text-sm font-bold text-region-ink transition hover:border-brand-600 hover:bg-brand-700 hover:text-white sm:text-base ${FOCUS_RING}`}
                  >
                    {buildConditionalChipLabel(section.key, count)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </SectionShell>

        {featured.length > 0 ? (
          <SectionShell className="mt-8">
            <SectionHeading
              title="정보가 풍부한 골프장"
              description="전화번호, 홈페이지, 요금 정보가 함께 제공되는 골프장입니다."
            />
            <ul className="flex flex-col gap-3">
              {featured.map((course) => (
                <RegionCourseCard key={course.id} course={course} />
              ))}
            </ul>
          </SectionShell>
        ) : null}

        {PRIMARY_CONDITIONAL_SECTIONS.map((section) => (
          <ConditionalListSection
            key={section.id}
            section={section}
            config={config}
            courses={courses}
            stats={stats}
          />
        ))}

        {SECONDARY_CONDITIONAL_SECTIONS.map((section) => (
          <ConditionalListSection
            key={section.id}
            section={section}
            config={config}
            courses={courses}
            stats={stats}
            compact
          />
        ))}

        {cityQuickLinks.map((group) => {
          const showCount = Math.min(CITY_COURSES_MAX, group.count);
          const sectionCourses = group.courses.slice(0, showCount);
          return (
            <SectionShell
              key={group.slug}
              id={cityAnchorId(group.slug)}
              className="mt-8"
            >
              <SectionHeading
                title={`${group.displayName} 골프장`}
                description={`${group.name} 지역 골프장 ${group.count}곳`}
              />
              <ul className="flex flex-col gap-3">
                {sectionCourses.map((course) => (
                  <RegionCourseCard key={course.id} course={course} />
                ))}
              </ul>
              {group.count > sectionCourses.length ? (
                <ViewAllLink
                  href="#all-courses"
                  label={`${group.name} 포함 전체 ${stats.total}곳 보기`}
                />
              ) : null}
            </SectionShell>
          );
        })}

        <SectionShell id="all-courses" className="mt-10">
          <SectionHeading
            title={`${config.label} 골프장 전체 목록`}
            description={buildRegionAllCoursesDescription(config.label)}
          />
          {courses.length > 0 ? (
            <>
              <ul className="flex flex-col gap-3">
                {previewCourses.map((course) => (
                  <RegionCourseCard key={course.id} course={course} />
                ))}
              </ul>
              {courses.length > ALL_COURSES_PREVIEW ? (
                <p className="mt-4 text-sm text-region-muted">
                  전체 {stats.total.toLocaleString("ko-KR")}곳 중{" "}
                  {ALL_COURSES_PREVIEW}곳을 미리 보여드립니다.
                </p>
              ) : null}
              <Link
                href={mapHref}
                className={`mt-6 inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-region-soft px-5 py-3 text-sm font-bold text-brand-800 transition hover:border-brand-500 hover:bg-brand-100 ${FOCUS_RING}`}
              >
                {config.label} 골프장 지도에서 더 보기 →
              </Link>
            </>
          ) : (
            <p className="rounded-xl border border-region-soft-border bg-white p-6 text-base text-region-muted">
              현재 {config.label} 지역에 등록된 골프장이 없습니다.
            </p>
          )}
        </SectionShell>

        <SectionShell className="mt-10">
          <SeoRepresentativeImage
            src={getRegionSeoImagePath(config.slug)}
            alt={`${config.label} 골프장 지도`}
          />
        </SectionShell>

        <SectionShell id="faq" className="mt-10">
          <SectionHeading title={`${config.label} 골프장 자주 묻는 질문`} />
          <dl className="space-y-4">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="rounded-xl border border-region-soft-border bg-region-soft/40 p-5 sm:p-6"
              >
                <dt className="text-base font-bold text-region-ink sm:text-lg">
                  {item.question}
                </dt>
                <dd className="mt-2.5 text-base leading-relaxed text-region-muted">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </SectionShell>

        <RelatedGuidesSection
          className="mt-10"
          links={getRelatedBlogGuidesForRegion(config.slug)}
        />

        <RegionLinks currentSlug={config.slug} className="mt-12" />
        <CollectionLinks className="mt-8" />
      </div>
    </div>
  );
}
