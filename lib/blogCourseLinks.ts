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

export function resolveBlogCourseHomepageLink(
  homepage: string | undefined,
  name: string,
  address?: string,
): { href: string; label: string } {
  const trimmed = homepage?.trim();
  if (trimmed) {
    const href =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    return { href, label: "공식 홈페이지" };
  }
  return {
    href: getBlogCourseNaverSearchUrl(name, address),
    label: "공식 홈페이지 검색",
  };
}
