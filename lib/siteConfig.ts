const DEFAULT_SITE_URL = "https://golfmap.kr";

function normalizeSiteUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

export const siteConfig = {
  siteName: "GolfMap",
  siteNameKo: "골프맵",
  siteUrl: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL,
  ),
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "golfmap.kr@gmail.com",
  defaultTitle: "GolfMap | 전국 골프장 지도",
  defaultDescription:
    "전국 골프장의 위치, 요금, 전화번호, 홈페이지 정보를 지도에서 한눈에 확인하세요.",
  defaultOgImage: "/og-image.png",
  naverSiteVerification:
    process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION?.trim() ||
    "53952bdb168063a9886fe7d056af1061aa692392",
} as const;

/** 네이버 서치어드바이저 소유 확인 meta (값 없으면 undefined) */
export function getNaverSiteVerification(): string | undefined {
  const value = siteConfig.naverSiteVerification?.trim();
  return value || undefined;
}

export function getSiteUrl(): string {
  return siteConfig.siteUrl || DEFAULT_SITE_URL;
}

/** canonical / sitemap용 절대 URL */
export function absoluteUrl(path: string = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
