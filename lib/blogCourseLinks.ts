import {
  getNaverMapSearchUrlFromQuery,
} from "@/lib/externalMapLinks";

/** 블로그 카드용 외부 검색 query — 이름 + 주소 */
export function buildBlogCourseSearchQuery(
  name: string,
  address?: string,
): string {
  const trimmedName = name.trim();
  const trimmedAddress = address?.trim() ?? "";
  if (trimmedName && trimmedAddress) {
    return `${trimmedName} ${trimmedAddress}`;
  }
  return trimmedName || trimmedAddress;
}

export function getBlogCourseNaverMapUrl(
  name: string,
  address?: string,
): string {
  return getNaverMapSearchUrlFromQuery(
    buildBlogCourseSearchQuery(name, address),
  );
}

export function getBlogCourseKakaoMapUrl(
  name: string,
  address?: string,
): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(buildBlogCourseSearchQuery(name, address))}`;
}

export function getBlogCourseNaverSearchUrl(
  name: string,
  address?: string,
): string {
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(buildBlogCourseSearchQuery(name, address))}`;
}

/**
 * 확인된 공식 홈페이지 URL만 반환한다.
 * 검색 결과·비공식 링크로 대체하지 않으며, 없으면 null → CTA 숨김.
 */
export function resolveBlogCourseHomepageLink(
  homepage: string | undefined,
  _name?: string,
  _address?: string,
): { href: string; label: string } | null {
  const trimmed = homepage?.trim();
  if (!trimmed) return null;
  const href =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  return { href, label: "공식 홈페이지" };
}
