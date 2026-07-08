"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Flag,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  CalendarCheck,
  Mail,
} from "lucide-react";
import type { PublicCourse } from "@/lib/publicCourse";
import {
  formatHoleCount,
  hasHomepage,
  hasPhone,
} from "@/lib/courseDisplay";
import {
  formatPriceBadge,
  formatPriceRange,
  hasPrice,
  PRICE_CHECK_ON_BOOKING_PAGE,
  PRICE_REFERENCE_DISCLAIMER,
  PRICE_UNAVAILABLE,
} from "@/lib/priceFormat";
import { formatDate } from "@/lib/format";
import { formatCourseLocationLabel } from "@/lib/regionUtils";
import {
  getKakaoMapSearchUrl,
  getNaverMapSearchUrl,
} from "@/lib/externalMapLinks";
import {
  getNaverSearchUrl,
  getNearbyRestaurantMapUrl,
  NEARBY_RESTAURANT_CATEGORIES,
} from "@/lib/externalSearchLinks";
import { formatDistanceKm } from "@/lib/geoUtils";
import { createCourseReportIssueMailto } from "@/lib/reportIssueLink";
import { resolveCourseIntroParagraph } from "@/lib/courseSeoCopy";
import { looksLikeSoftParticleTemplate } from "@/lib/koreanParticles";
import type { CourseContentEnrichment } from "@/lib/enrichment/courseContentEnrichmentTypes";
import { isDisplayableEnrichment } from "@/lib/enrichment/courseContentEnrichmentTypes";
import { CourseRecommendationBox } from "@/components/CourseRecommendationBox";
import { CourseVisitKoreaGallery } from "@/components/CourseVisitKoreaGallery";
import type { CourseVisitKoreaImageSet } from "@/lib/enrichment/courseVisitKoreaImages";
import {
  formatAliasesForBodyText,
  resolveCourseSearchAliases,
} from "@/lib/seo/courseNameAliases";
import HomeResetLink from "@/components/HomeResetLink";
import CourseMap from "@/components/maps/CourseMap";
import CourseDetailHeroImage from "@/components/CourseDetailHeroImage";
import { getCourseSeoImagePath } from "@/lib/seoImages";

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-brand-50 text-brand-700 ring-brand-100",
  회원제: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "군 골프장": "bg-amber-50 text-amber-700 ring-amber-100",
  기타: "bg-gray-100 text-gray-600 ring-gray-200",
};

const PRICE_BADGE_STYLES = {
  ready: "bg-white/90 text-gray-800 ring-white/50",
  priced: "bg-emerald-50/95 text-emerald-800 ring-emerald-100",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
      {children}
    </h2>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 transition hover:border-brand-300 hover:text-brand-700"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-brand-600" />
          복사됨
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          복사
        </>
      )}
    </button>
  );
}

function InfoCardRow({
  label,
  value,
  href,
  tel,
  external,
  copyValue,
}: {
  label: string;
  value: string;
  href?: string;
  tel?: boolean;
  external?: boolean;
  copyValue?: string;
}) {
  const isMissing = value === "정보 준비 중";
  const content = (
    <span
      className={`text-sm font-medium sm:text-base ${
        isMissing ? "text-gray-400" : "text-gray-900"
      }`}
    >
      {value}
    </span>
  );

  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-start sm:gap-4 sm:py-4">
      <dt className="w-full shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:w-28 sm:text-sm sm:normal-case sm:tracking-normal">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1">
          {href && !isMissing ? (
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 underline-offset-2 hover:underline sm:text-base"
            >
              {value}
              {external && <ExternalLink className="h-3.5 w-3.5 shrink-0" />}
            </a>
          ) : tel && !isMissing ? (
            <a
              href={`tel:${value.replace(/\s/g, "")}`}
              className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline sm:text-base"
            >
              {value}
            </a>
          ) : (
            content
          )}
          {copyValue && !isMissing ? <CopyButton value={copyValue} /> : null}
        </div>
      </dd>
    </div>
  );
}

function orPlaceholder(value?: string | null): string {
  return value?.trim() ? value.trim() : "정보 준비 중";
}

function formatRegionLine(course: PublicCourse): string {
  return formatCourseLocationLabel(course);
}

interface CourseDetailProps {
  course: PublicCourse;
  nearbyCourses?: PublicCourse[];
  enrichment?: CourseContentEnrichment | null;
  visitKoreaGallery?: CourseVisitKoreaImageSet | null;
  blogSlot?: React.ReactNode;
  regionSlot?: React.ReactNode;
}

export default function CourseDetail({
  course,
  nearbyCourses = [],
  enrichment = null,
  visitKoreaGallery = null,
  blogSlot = null,
  regionSlot = null,
}: CourseDetailProps) {
  const router = useRouter();
  const [hoveredNearbyId, setHoveredNearbyId] = useState<string | null>(null);

  const showPhone = hasPhone(course);
  const showHomepage = hasHomepage(course);
  const priced = hasPrice(course);
  const priceBadge = formatPriceBadge(course);
  const priceSummary = formatPriceRange(course);
  const naverMapUrl = getNaverMapSearchUrl(course);
  const bookingHref = showHomepage ? course.homepageUrl : naverMapUrl;
  const naverSearchUrl = getNaverSearchUrl(course);

  const mapCourses = useMemo(
    () => [course, ...nearbyCourses],
    [course, nearbyCourses],
  );
  const reportIssueMailto = createCourseReportIssueMailto(course);
  const seoIntro = resolveCourseIntroParagraph(course, enrichment);
  const recommendationReasons = isDisplayableEnrichment(enrichment)
    ? enrichment.recommendationReasons.filter(
        (reason) =>
          !looksLikeSoftParticleTemplate(reason) &&
          !/라운드 후보를 비교할 때 참고할 수 있는 골프장|규모 정보를 확인할 수 있습니다/.test(
            reason,
          ),
      )
    : [];
  const recommendationConfidence = isDisplayableEnrichment(enrichment)
    ? enrichment.confidence
    : undefined;
  const searchAliases = useMemo(
    () => resolveCourseSearchAliases(course),
    [course],
  );
  const aliasBodyText = formatAliasesForBodyText(searchAliases);

  const actionButtonClass =
    "flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition active:scale-[0.98]";

  const externalButtonClass =
    "flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition active:scale-[0.98]";

  const handleNearbyMarkerSelect = useCallback(
    (courseId: string) => {
      if (courseId !== course.id) {
        router.push(`/courses/${courseId}`);
      }
    },
    [course.id, router],
  );

  return (
    <div className="mx-auto max-w-3xl bg-app-warm px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 md:max-w-4xl">
      <HomeResetLink className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" />
        목록으로 돌아가기
      </HomeResetLink>

      {/* Hero */}
      <header className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="relative">
          <CourseDetailHeroImage
            src={course.imageUrl}
            fallbackSrc={getCourseSeoImagePath(course.id)}
            alt={course.name}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <p className="mb-2 text-sm font-medium text-white/90">
              {formatRegionLine(course)}
            </p>
            <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl">
              {course.name}
            </h1>
            <p className="mt-2 flex items-start gap-1.5 text-sm text-white/90 sm:text-base">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{orPlaceholder(course.address)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 py-3 sm:px-6">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
              TYPE_STYLES[course.courseType] ?? TYPE_STYLES.기타
            }`}
          >
            {course.courseType || "기타"}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 ring-1 ring-inset ring-gray-200">
            <Flag className="mr-1 h-3 w-3" />
            {formatHoleCount(course.holeCount)}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
              priced ? PRICE_BADGE_STYLES.priced : PRICE_BADGE_STYLES.ready
            }`}
          >
            {priceBadge}
          </span>
        </div>

        <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
          <p className="text-xs text-stone-500 sm:text-sm">
            연락처·지도·예약 확인은 아래 보조 링크에서 이용할 수 있습니다.
          </p>
        </div>
      </header>

      <p className="mt-4 rounded-xl border border-gray-100 bg-white/90 px-4 py-3 text-sm leading-relaxed text-gray-600 shadow-sm sm:px-5">
        {seoIntro}
      </p>

      <CourseRecommendationBox
        reasons={recommendationReasons}
        confidence={recommendationConfidence}
      />

      {visitKoreaGallery ? (
        <CourseVisitKoreaGallery
          courseName={course.name}
          regionLabel={formatRegionLine(course)}
          gallery={visitKoreaGallery}
        />
      ) : null}

      {searchAliases.length > 1 && aliasBodyText ? (
        <p className="mt-3 text-sm text-slate-500">
          이 골프장은 {aliasBodyText} 등으로도 검색됩니다.
        </p>
      ) : null}

      {/* 기본 정보 */}
      <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
          <SectionTitle>기본 정보</SectionTitle>
        </div>
        <dl>
          <InfoCardRow
            label="주소"
            value={orPlaceholder(course.address)}
            copyValue={course.address?.trim() || undefined}
          />
          <InfoCardRow
            label="전화번호"
            value={orPlaceholder(course.phone)}
            tel={showPhone}
          />
          <InfoCardRow
            label="홈페이지"
            value={showHomepage ? "공식 홈페이지 열기" : "정보 준비 중"}
            href={showHomepage ? course.homepageUrl : undefined}
            external
          />
          <InfoCardRow
            label="참고 요금"
            value={priced ? priceSummary : PRICE_UNAVAILABLE}
          />
          <InfoCardRow
            label="운영 형태"
            value={orPlaceholder(course.courseType)}
          />
          <InfoCardRow
            label="홀수"
            value={
              course.holeCount
                ? formatHoleCount(course.holeCount)
                : "정보 준비 중"
            }
          />
          <InfoCardRow label="지역" value={formatRegionLine(course)} />
          <InfoCardRow
            label="업데이트 기준"
            value={formatDate(course.updatedAt)}
          />
        </dl>
        <div className="border-t border-gray-100 px-4 py-3 sm:px-6">
          <a
            href={reportIssueMailto}
            className="-mx-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-gray-500 underline-offset-2 transition hover:bg-gray-50 hover:text-brand-700 hover:underline sm:text-sm"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            정보가 틀렸나요?
          </a>
        </div>
      </section>

      {/* 요금 정보 */}
      <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
        <SectionTitle>요금 정보</SectionTitle>
        <p className="mb-4 text-xs leading-relaxed text-stone-500 sm:text-sm">
          {PRICE_REFERENCE_DISCLAIMER}
        </p>
        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5">
          <p
            className={`text-lg font-bold sm:text-xl ${
              priced ? "text-brand-900" : "text-stone-500"
            }`}
          >
            {priced ? priceSummary : PRICE_CHECK_ON_BOOKING_PAGE}
          </p>
        </div>
        <div className="mt-4">
          <a
            href={bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#03c75a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#02b350] sm:w-auto sm:min-w-[160px]"
          >
            <CalendarCheck className="h-4 w-4" />
            예약 정보 확인
          </a>
          <p className="mt-2 text-xs text-stone-500">
            네이버지도 또는 공식 홈페이지에서 예약 가능 여부를 확인해보세요.
          </p>
        </div>
      </section>

      {/* 연락·지도·예약 */}
      <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
        <SectionTitle>연락·지도·예약 확인</SectionTitle>
        <p className="mb-4 text-xs leading-relaxed text-stone-500 sm:text-sm">
          아래 링크는 골프장 공식 채널·지도 서비스로 이동합니다. 예약 가능
          여부와 최신 요금은 해당 페이지에서 확인해 주세요.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {showPhone ? (
            <a
              href={`tel:${course.phone!.replace(/\s/g, "")}`}
              className={`${externalButtonClass} border-stone-200 bg-stone-50 text-stone-800 hover:border-brand-300 hover:bg-brand-50`}
            >
              <span aria-hidden>📞</span>
              전화 문의
            </a>
          ) : null}

          {showHomepage ? (
            <a
              href={course.homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${externalButtonClass} border-stone-200 bg-white text-stone-800 hover:border-brand-300 hover:bg-brand-50`}
              aria-label={`${course.name} 공식 홈페이지 열기`}
            >
              <span aria-hidden>🏠</span>
              공식 홈페이지
            </a>
          ) : null}

          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${externalButtonClass} border-emerald-200/80 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/80`}
            aria-label={`${course.name} 네이버지도에서 보기`}
          >
            <span aria-hidden>🗺️</span>
            네이버지도
          </a>
          <a
            href={getKakaoMapSearchUrl(course)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${externalButtonClass} border-amber-200/80 bg-amber-50/70 text-stone-800 hover:bg-amber-100/80`}
            aria-label={`${course.name} 카카오맵에서 보기`}
          >
            <span aria-hidden>💛</span>
            카카오맵
          </a>
          <a
            href={naverSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${externalButtonClass} border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50/80 sm:col-span-1`}
          >
            <span aria-hidden>🔎</span>
            네이버 검색
          </a>
          <a
            href={bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${externalButtonClass} col-span-2 border-stone-200 bg-white text-stone-700 hover:border-brand-300 hover:bg-brand-50 sm:col-span-1`}
          >
            <CalendarCheck className="h-4 w-4" />
            예약 정보 확인
          </a>
        </div>
      </section>

      {/* 위치 */}
      <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
        <SectionTitle>위치</SectionTitle>
        <p className="mb-3 text-sm font-medium text-gray-700">
          {nearbyCourses.length > 0
            ? "현재 골프장과 근처 골프장"
            : "골프장 위치"}
        </p>
        <div className="h-48 w-full overflow-hidden rounded-xl border border-gray-200 sm:h-56">
          <CourseMap
            courses={mapCourses}
            selectedId={course.id}
            detailPrimaryCourseId={course.id}
            hoveredCourseId={hoveredNearbyId}
            onHoverCourseChange={setHoveredNearbyId}
            onSelectCourse={handleNearbyMarkerSelect}
            mapMode="detail"
          />
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-sm text-gray-700 sm:text-base">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          {orPlaceholder(course.address)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${externalButtonClass} border-emerald-200/80 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/80`}
          >
            <span aria-hidden>🗺️</span>
            네이버지도
          </a>
          <a
            href={getKakaoMapSearchUrl(course)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${externalButtonClass} border-amber-200/80 bg-amber-50/70 text-stone-800 hover:bg-amber-100/80`}
          >
            <span aria-hidden>💛</span>
            카카오맵
          </a>
        </div>
      </section>

      {/* 근처 맛집 */}
      <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
        <SectionTitle>근처 맛집 찾기</SectionTitle>
        <p className="mb-4 text-xs text-stone-500 sm:text-sm">
          네이버지도에서 골프장 주변 음식점을 검색합니다.
        </p>
        <div className="flex flex-wrap gap-2">
          {NEARBY_RESTAURANT_CATEGORIES.map((category) => (
            <a
              key={category}
              href={getNearbyRestaurantMapUrl(course, category)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#03c75a]/40 hover:bg-[#03c75a]/5 hover:text-[#03c75a]"
            >
              {category}
            </a>
          ))}
        </div>
      </section>

      {/* 근처 골프장 */}
      {nearbyCourses.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle>근처 골프장</SectionTitle>
          <ul className="flex flex-col gap-2">
            {nearbyCourses.map((nearby) => {
              const nearbyPrice = formatPriceRange(nearby);
              const distance = formatDistanceKm(course, nearby);
              const isHovered = hoveredNearbyId === nearby.id;

              return (
                <li key={nearby.id}>
                  <Link
                    href={`/courses/${nearby.id}`}
                    aria-label={`${nearby.name} 상세 정보 보기`}
                    onMouseEnter={() => setHoveredNearbyId(nearby.id)}
                    onMouseLeave={() => setHoveredNearbyId(null)}
                    className={`group flex items-center gap-3 rounded-xl border px-4 py-3.5 transition ${
                      isHovered
                        ? "border-brand-400 bg-brand-50/60 shadow-sm"
                        : "border-gray-200 bg-gray-50/50 hover:border-brand-300 hover:bg-brand-50/40"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        isHovered ? "bg-orange-500 ring-2 ring-orange-200" : "bg-orange-400"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900 group-hover:text-brand-800 sm:text-base">
                        {nearby.name}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                        {formatRegionLine(nearby)}
                        {distance ? (
                          <>
                            <span className="mx-1.5 text-gray-300">·</span>
                            <span>{distance}</span>
                          </>
                        ) : null}
                        <span className="mx-1.5 text-gray-300">·</span>
                        <span
                          className={
                            hasPrice(nearby) ? "text-gray-700" : "text-gray-400"
                          }
                        >
                          {nearbyPrice}
                        </span>
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-brand-700 sm:text-sm">
                      상세보기
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 text-center">
        <HomeResetLink className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
          전국 골프장 지도로 돌아가기
        </HomeResetLink>
      </div>

      {blogSlot}

      <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-950 shadow-sm sm:px-5">
        GolfMap Korea에 표시되는 주소, 전화번호, 홈페이지, 참고 요금은 수집·정리
        기준이며 실제와 다를 수 있습니다. 예약·내장 전에는 골프장 공식 채널에서
        최신 정보를 확인해 주세요.
      </p>

      {regionSlot}
    </div>
  );
}
