import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import type { BlogPostSection } from "@/lib/blogPosts";
import { BlogCourseImageGallery } from "@/components/BlogCourseImageGallery";
import {
  getBlogCourseKakaoMapUrl,
  getBlogCourseNaverMapUrl,
  getBlogCourseNaverSearchUrl,
  resolveBlogCourseHomepageLink,
} from "@/lib/blogCourseLinks";
import { buildCourseRecommendationReasons } from "@/lib/blogCourseRecommendations";
import { formatHoleCount } from "@/lib/courseDisplay";

type BlogCourseItem = NonNullable<BlogPostSection["items"]>[number] & {
  relatedCourseId?: string;
};

const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800";

const BUTTON_BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-center text-xs font-semibold transition sm:text-sm";

const TEL_BUTTON_CLASS = `${BUTTON_BASE} border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-300 hover:bg-blue-100`;

const HOMEPAGE_BUTTON_CLASS = `${BUTTON_BASE} border-stone-200 bg-slate-50 text-slate-700 hover:border-stone-300 hover:bg-slate-100`;

const NAVER_MAP_BUTTON_CLASS = `${BUTTON_BASE} border-[#03C75A]/40 bg-[#03C75A]/10 text-[#028a42] hover:border-[#03C75A]/60 hover:bg-[#03C75A]/15`;

const KAKAO_MAP_BUTTON_CLASS = `${BUTTON_BASE} border-[#FEE500] bg-[#FEE500] text-stone-900 hover:bg-[#f5dc00]`;

const NAVER_SEARCH_BUTTON_CLASS = `${BUTTON_BASE} border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100`;

interface BlogCourseCardProps {
  item: BlogCourseItem;
  rank: number;
}

export function BlogCourseCard({ item, rank }: BlogCourseCardProps) {
  const galleryImages =
    item.images && item.images.length > 0
      ? item.images
      : [item.image, item.image2].filter((src): src is string => Boolean(src));
  const hasAnyImage = galleryImages.length > 0;
  const regionLabel = item.regionLabel;
  const golfMapHref = item.relatedCourseId
    ? `/courses/${item.relatedCourseId}`
    : null;

  const homepageLink = resolveBlogCourseHomepageLink(
    item.homepage,
    item.title,
    item.address,
  );
  const naverMapUrl = getBlogCourseNaverMapUrl(item.title, item.address);
  const kakaoMapUrl = getBlogCourseKakaoMapUrl(item.title, item.address);
  const naverSearchUrl = getBlogCourseNaverSearchUrl(item.title, item.address);
  const telHref = item.phone
    ? `tel:${item.phone.replace(/\s/g, "")}`
    : undefined;

  const holeLabel =
    item.holeCount != null ? formatHoleCount(item.holeCount) : undefined;

  const recommendationReasons =
    item.recommendationReasons && item.recommendationReasons.length > 0
      ? item.recommendationReasons
      : buildCourseRecommendationReasons(item.distanceFromSeoulKm);

  const infoChips = [
    regionLabel ? { label: "지역", value: regionLabel } : null,
    holeLabel ? { label: "홀수", value: holeLabel } : null,
    item.priceLabel ? { label: "참고 요금", value: item.priceLabel } : null,
    item.courseType ? { label: "코스 유형", value: item.courseType } : null,
    item.operatingInfo
      ? { label: "운영 정보", value: item.operatingInfo }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
      {/* 1. 순번 + 이름 + 주소/전화 */}
      <div className="px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
        <span className="inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
          #{rank}
        </span>

        <h3 className="mt-3 text-lg font-bold leading-snug text-stone-900 sm:text-xl">
          {item.title}
        </h3>

        {(item.address || item.phone) && (
          <dl className="mt-3 space-y-2 text-sm text-stone-600">
            {item.address ? (
              <div className="flex items-start gap-2">
                <dt className="sr-only">주소</dt>
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                  aria-hidden
                />
                <dd>
                  <span className="mr-1 text-xs font-medium text-stone-400">
                    주소
                  </span>
                  {item.address}
                </dd>
              </div>
            ) : null}
            {item.phone ? (
              <div className="flex items-center gap-2">
                <dt className="sr-only">전화</dt>
                <Phone
                  className="h-4 w-4 shrink-0 text-brand-600"
                  aria-hidden
                />
                <dd>
                  <span className="mr-1 text-xs font-medium text-stone-400">
                    전화
                  </span>
                  <a
                    href={`tel:${item.phone.replace(/\s/g, "")}`}
                    className="font-medium text-stone-800 hover:text-brand-800 hover:underline"
                  >
                    {item.phone}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        )}
      </div>

      {/* 4. API 이미지 (가로 스크롤) */}
      {hasAnyImage ? (
        <BlogCourseImageGallery
          images={galleryImages}
          courseName={item.title}
          regionLabel={regionLabel}
          imageCredit={item.imageCredit}
        />
      ) : null}

      {/* 5–6. 설명 + 추천 이유 */}
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm leading-relaxed text-stone-700 sm:text-base">
          {item.description}
        </p>

        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <h4 className="text-sm font-bold text-emerald-800">
            이 코스를 추천하는 이유
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            {recommendationReasons.map((reason) => (
              <li key={reason} className="flex gap-2">
                <span className="shrink-0 text-emerald-600" aria-hidden>
                  ✅
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 7. 홀 수 / 참고 요금 / 운영 정보 */}
        {infoChips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {infoChips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs"
              >
                <span className="font-medium text-stone-400">{chip.label}</span>
                <span className="font-semibold text-stone-800">
                  {chip.value}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 8–9. GolfMap primary + 외부 링크 */}
      <div className="space-y-3 border-t border-stone-100 bg-stone-50/60 p-4 sm:p-5">
        {golfMapHref ? (
          <Link href={golfMapHref} className={PRIMARY_BUTTON_CLASS}>
            <span aria-hidden>🟢</span>
            GolfMap에서 보기
          </Link>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
          {item.phone && telHref ? (
            <a href={telHref} className={TEL_BUTTON_CLASS}>
              <span aria-hidden>📞</span>
              전화 문의
            </a>
          ) : null}
          <a
            href={homepageLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className={HOMEPAGE_BUTTON_CLASS}
          >
            <span aria-hidden>🏠</span>
            {homepageLink.label}
          </a>
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={NAVER_MAP_BUTTON_CLASS}
          >
            <span aria-hidden>🗺️</span>
            네이버지도
          </a>
          <a
            href={kakaoMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={KAKAO_MAP_BUTTON_CLASS}
          >
            <span aria-hidden>💛</span>
            카카오맵
          </a>
          <a
            href={naverSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={NAVER_SEARCH_BUTTON_CLASS}
          >
            <span aria-hidden>🔎</span>
            네이버 검색
          </a>
        </div>
      </div>
    </article>
  );
}
