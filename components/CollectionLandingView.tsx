import Link from "next/link";
import type { ComponentType } from "react";
import {
  MapPin,
  Phone,
  Globe,
  ChevronRight,
  LayoutGrid,
  CircleDollarSign,
  Flag,
  Users,
} from "lucide-react";
import type { Course } from "@/types/course";
import type { CollectionSlug } from "@/lib/collectionLanding";
import {
  COLLECTION_DISCLAIMER,
  NEAR_SEOUL_COLLECTION_DISCLAIMER,
  type CollectionConfig,
  type CollectionLandingStats,
  isNearSeoulCollectionSlug,
  buildCollectionHeroDescription,
  buildCollectionHeroPills,
  buildCollectionFaqItems,
  formatCollectionCardPrice,
  groupCoursesByRegionField,
  courseHasValidPhone,
  courseHasValidHomepage,
} from "@/lib/collectionLanding";
import { formatCourseLocationLabel } from "@/lib/regionUtils";
import type { CourseWithMeta } from "@/lib/collectionFilters";
import { formatHoleCount } from "@/lib/courseDisplay";
import {
  buildCollectionDisplayStats,
  buildCollectionSortDescription,
  buildCourseSelectionReasons,
  buildCardMetaBadges,
  getCollectionTypeDisclaimer,
} from "@/lib/collectionCardLabels";
import CollectionLinks from "@/components/CollectionLinks";
import RegionLinks from "@/components/RegionLinks";
import SeoRepresentativeImage from "@/components/SeoRepresentativeImage";
import { getCollectionSeoImagePath } from "@/lib/seoImages";

const ALL_COURSES_PREVIEW = 25;
const REGION_GROUP_LIMIT = 12;

const EMPTY_COLLECTION_MESSAGE =
  "현재 GolfMap Korea 데이터에서 이 조건으로 분류된 골프장이 없습니다. 데이터가 보강되면 페이지를 업데이트할 예정입니다.";

function isScoredCollectionSlug(slug: CollectionSlug): boolean {
  return (
    slug === "beginner" ||
    slug === "baekdori" ||
    slug === "near-seoul-beginner" ||
    slug === "near-seoul-baekdori"
  );
}

function isBudgetCollectionSlug(slug: CollectionSlug): boolean {
  return slug === "budget" || slug === "near-seoul-budget";
}

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  회원제: "bg-slate-200 text-slate-900 ring-slate-300",
  "군 골프장": "bg-amber-100 text-amber-950 ring-amber-300",
  기타: "bg-stone-200 text-stone-800 ring-stone-300",
};

const STAT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  전체: LayoutGrid,
  전화번호: Phone,
  홈페이지: Globe,
  "요금 정보": CircleDollarSign,
  "거리 정보": MapPin,
  대중제: Users,
  나인홀: Flag,
};

function InfoBadge({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        active
          ? "bg-brand-50 text-brand-900 ring-brand-200"
          : "bg-stone-100 text-stone-500 ring-stone-200"
      }`}
    >
      {children}
    </span>
  );
}

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

type PriceEmphasis = "strong" | "medium" | "normal";

function getPriceEmphasis(slug: CollectionSlug): PriceEmphasis {
  if (isBudgetCollectionSlug(slug)) return "strong";
  if (isScoredCollectionSlug(slug)) return "medium";
  return "normal";
}

function priceBoxClass(emphasis: PriceEmphasis, variant: "desktop" | "mobile"): string {
  const base =
    variant === "desktop"
      ? "w-full rounded-xl px-4 py-3"
      : "shrink-0 rounded-xl px-3 py-2";
  if (emphasis === "strong") {
    return `${base} bg-brand-50 ring-1 ring-brand-200`;
  }
  if (emphasis === "medium") {
    return `${base} bg-brand-50/70 ring-1 ring-brand-100`;
  }
  return `${base} bg-white ring-1 ring-region-soft-border`;
}

function priceValueClass(
  priced: boolean,
  emphasis: PriceEmphasis,
  variant: "desktop" | "mobile",
): string {
  if (!priced) {
    return variant === "desktop"
      ? "text-sm font-medium leading-snug text-stone-400"
      : "text-xs font-medium leading-snug text-stone-400";
  }
  if (emphasis === "strong") {
    return variant === "desktop"
      ? "text-2xl font-extrabold leading-none text-brand-800"
      : "text-lg font-extrabold leading-none text-brand-800";
  }
  if (emphasis === "medium") {
    return variant === "desktop"
      ? "text-xl font-extrabold leading-none text-brand-800"
      : "text-base font-extrabold leading-none text-brand-800";
  }
  return variant === "desktop"
    ? "text-lg font-extrabold leading-none text-brand-800"
    : "text-base font-extrabold leading-none text-brand-800";
}

function CollectionPriceBlock({
  course,
  emphasis = "normal",
  variant = "desktop",
  align = "end",
}: {
  course: Course;
  emphasis?: PriceEmphasis;
  variant?: "desktop" | "mobile";
  align?: "start" | "end";
}) {
  const { label, value, hasPrice: priced } = formatCollectionCardPrice(course);
  const alignClass = align === "end" ? "items-end text-right" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignClass}`}>
      <p className="text-[10px] font-semibold tracking-wide text-stone-500 sm:text-[11px]">
        {label}
      </p>
      <p className={`mt-1 tabular-nums ${priceValueClass(priced, emphasis, variant)}`}>
        {value}
      </p>
    </div>
  );
}

function CollectionDetailButton({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-800 transition group-hover:border-brand-400 group-hover:bg-brand-100 ${className}`}
    >
      상세보기
      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
    </span>
  );
}

function CollectionCourseCard({
  course,
  slug,
}: {
  course: Course;
  slug: CollectionSlug;
}) {
  const hasHomepage = courseHasValidHomepage(course);
  const hasPhone = courseHasValidPhone(course);
  const nearSeoul = course as CourseWithMeta;
  const priceEmphasis = getPriceEmphasis(slug);
  const regionLabel = formatCourseLocationLabel(course);
  const selectionReasons = buildCourseSelectionReasons(course, slug, nearSeoul, false);
  const mobileSelectionReasons = buildCourseSelectionReasons(course, slug, nearSeoul, true);
  const desktopMetaBadges = buildCardMetaBadges({
    slug,
    meta: nearSeoul,
    hasPhone,
    hasHomepage,
    mobile: false,
  });
  const mobileMetaBadges = buildCardMetaBadges({
    slug,
    meta: nearSeoul,
    hasPhone,
    hasHomepage,
    mobile: true,
  });

  return (
    <li>
      <Link
        href={`/courses/${course.id}`}
        aria-label={`${course.name} 상세 정보 보기`}
        className={`group grid min-h-[148px] grid-cols-1 overflow-hidden rounded-2xl border border-region-soft-border bg-white transition hover:border-brand-600 hover:bg-region-soft hover:shadow-card-hover sm:grid-cols-[minmax(0,1fr)_180px] sm:items-stretch ${FOCUS_RING}`}
      >
        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 sm:block">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <h3 className="text-lg font-extrabold leading-tight text-region-ink group-hover:text-brand-800 sm:text-xl">
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
            </div>
            <div
              className={`sm:hidden ${priceBoxClass(priceEmphasis, "mobile")}`}
            >
              <CollectionPriceBlock
                course={course}
                emphasis={priceEmphasis}
                variant="mobile"
                align="end"
              />
            </div>
          </div>

          {regionLabel ? (
            <p className="mt-2 text-sm font-medium text-region-muted">
              {regionLabel}
            </p>
          ) : null}

          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-region-ink/90 sm:text-[0.95rem]">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-700/70"
              aria-hidden
            />
            <span>{course.address || "주소 정보 준비 중"}</span>
          </p>

          {selectionReasons.length > 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-region-muted sm:text-sm">
              <span className="font-semibold text-region-ink">선정 이유</span>{" "}
              <span className="hidden sm:inline">{selectionReasons.join(" · ")}</span>
              <span className="sm:hidden">{mobileSelectionReasons.join(" · ")}</span>
            </p>
          ) : null}

          <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
            {desktopMetaBadges.map((badge) => (
              <InfoBadge key={badge.text} active={badge.active}>
                {badge.text}
              </InfoBadge>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            {mobileMetaBadges.map((badge) => (
              <InfoBadge key={badge.text} active={badge.active}>
                {badge.text}
              </InfoBadge>
            ))}
          </div>

          <div className="mt-4 sm:hidden">
            <CollectionDetailButton className="w-full" />
          </div>
        </div>

        <div className="hidden min-h-full flex-col justify-between border-l border-region-soft-border bg-region-soft/20 p-4 sm:flex">
          <div className={priceBoxClass(priceEmphasis, "desktop")}>
            <CollectionPriceBlock
              course={course}
              emphasis={priceEmphasis}
              variant="desktop"
              align="end"
            />
          </div>
          <CollectionDetailButton className="mt-4 w-full" />
        </div>
      </Link>
    </li>
  );
}

export default function CollectionLandingView({
  config,
  courses,
  stats,
}: {
  config: CollectionConfig;
  courses: Course[];
  stats: CollectionLandingStats;
}) {
  const heroPills = buildCollectionHeroPills(stats);
  const faqItems = buildCollectionFaqItems(config, stats);
  const regionGroups = groupCoursesByRegionField(courses).slice(
    0,
    REGION_GROUP_LIMIT,
  );
  const previewCourses = courses.slice(0, ALL_COURSES_PREVIEW);
  const mapHref = config.mapHref;
  const displayStats = buildCollectionDisplayStats(config.slug, courses);
  const sortDescription = buildCollectionSortDescription(config.slug);
  const typeDisclaimer = getCollectionTypeDisclaimer(config.slug);
  const showNearSeoulNote = isNearSeoulCollectionSlug(config.slug);
  const showBudgetNote =
    isBudgetCollectionSlug(config.slug) && typeDisclaimer == null;

  return (
    <div className="min-h-screen bg-region-cream">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
        <nav className="mb-6 text-sm font-medium text-region-muted">
          <Link
            href="/"
            className={`text-brand-800 transition hover:text-brand-900 ${FOCUS_RING}`}
          >
            전국 골프장 지도
          </Link>
          <span className="mx-2 text-region-soft-border">/</span>
          <span className="text-region-ink">{config.breadcrumbLabel}</span>
        </nav>

        <header className="overflow-hidden rounded-2xl border border-region-soft-border bg-gradient-to-br from-region-soft via-white to-region-accent/25 p-7 shadow-card sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-region-ink sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {config.h1}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-[1.75] text-region-muted sm:text-lg sm:leading-[1.8]">
            {buildCollectionHeroDescription(config, stats)}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {heroPills.map((pill) => (
              <HeroPill key={pill.suffix} suffix={pill.suffix} value={pill.value} />
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={mapHref}
              title={`${config.h1} 지도에서 보기`}
              className={`inline-flex min-h-[48px] items-center justify-center rounded-xl bg-brand-700 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-brand-800 ${FOCUS_RING}`}
            >
              지도에서 보기
            </Link>
            <Link
              href="/"
              className={`inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-region-soft-border bg-white px-6 py-3 text-base font-bold text-region-ink transition hover:border-brand-600 hover:bg-region-soft ${FOCUS_RING}`}
            >
              전국 골프장 지도로 돌아가기
            </Link>
          </div>
        </header>

        <SectionShell className="mt-8 border-l-4 border-l-amber-400">
          <p className="text-sm font-semibold text-region-ink sm:text-base">
            {typeDisclaimer ?? COLLECTION_DISCLAIMER}
          </p>
          {showNearSeoulNote ? (
            <p className="mt-3 text-sm font-medium text-region-ink sm:text-base">
              {NEAR_SEOUL_COLLECTION_DISCLAIMER}
            </p>
          ) : null}
          {showBudgetNote && !typeDisclaimer ? (
            <p className="mt-3 text-sm font-medium text-amber-900">
              요금 정보는 참고용이며 실제 예약가와 다를 수 있습니다.
            </p>
          ) : null}
          <p className="mt-3 text-base leading-relaxed text-region-muted">
            {config.filterSummary}
          </p>
        </SectionShell>

        <SectionShell className="mt-8">
          <div
            className={`grid grid-cols-2 gap-4 ${
              displayStats.length >= 5
                ? "sm:grid-cols-3 lg:grid-cols-5"
                : "sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {displayStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </SectionShell>

        <SectionShell className="mt-8 border-l-4 border-l-brand-600">
          <p className="text-base leading-[1.8] text-region-ink/90 sm:text-lg">
            {config.seoIntro}
          </p>
          {showBudgetNote && !typeDisclaimer ? (
            <p className="mt-4 text-sm font-medium text-amber-900">
              요금 정보는 참고용이며 실제 예약가와 다를 수 있습니다.
            </p>
          ) : null}
        </SectionShell>

        <SectionShell id="all-courses" className="mt-8">
          <SectionHeading
            title={`${config.h1} 목록`}
            description={`${config.primaryKeyword} 조건에 해당하는 골프장 ${stats.total.toLocaleString("ko-KR")}곳 · ${sortDescription}`}
          />
          {courses.length > 0 ? (
            <>
              <ul className="flex flex-col gap-3">
                {previewCourses.map((course) => (
                  <CollectionCourseCard
                    key={course.id}
                    course={course}
                    slug={config.slug}
                  />
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
                title={`${config.h1} 전체 목록 지도에서 보기`}
                className={`mt-6 inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-region-soft px-5 py-3 text-sm font-bold text-brand-800 transition hover:border-brand-500 hover:bg-brand-100 ${FOCUS_RING}`}
              >
                {config.h1} 지도에서 더 보기 →
              </Link>
            </>
          ) : (
            <p className="rounded-xl border border-region-soft-border bg-white p-6 text-base text-region-muted">
              {EMPTY_COLLECTION_MESSAGE}
            </p>
          )}
        </SectionShell>

        {regionGroups.length > 0 ? (
          <SectionShell className="mt-8 py-5 sm:py-6">
            <h2 className="text-base font-extrabold text-region-ink sm:text-lg">
              지역별 보기
            </h2>
            <p className="mt-1.5 text-sm text-region-muted">
              지역별로 분류된 골프장 수를 확인할 수 있습니다.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {regionGroups.map((group) => (
                <span
                  key={group.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-region-soft-border bg-region-soft/50 px-3 py-1.5 text-sm font-medium text-region-ink"
                >
                  <span className="font-bold text-brand-800">{group.name}</span>
                  <span className="text-region-muted">{group.count}곳</span>
                </span>
              ))}
            </div>
          </SectionShell>
        ) : null}

        <SectionShell className="mt-10">
          <SeoRepresentativeImage
            src={getCollectionSeoImagePath(config.slug)}
            alt={`${config.h1} | ${config.title}`}
          />
        </SectionShell>

        <SectionShell id="faq" className="mt-10">
          <SectionHeading title={`${config.h1} 자주 묻는 질문`} />
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

        <CollectionLinks currentSlug={config.slug} className="mt-12" />
        <RegionLinks className="mt-8" />
      </div>
    </div>
  );
}
