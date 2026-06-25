import type { Metadata } from "next";
import type { Course } from "@/types/course";
import {
  buildCourseDetailDescription,
  META_DESCRIPTION_MAX_LENGTH,
  truncateMetaDescription,
} from "@/lib/courseSeoCopy";
import {
  resolveCourseSearchAliases,
} from "@/lib/seo/courseNameAliases";
import type { RegionLandingConfig } from "@/lib/regionLanding";
import {
  getCollectionSeoImagePath,
  getCourseSeoImagePath,
  getRegionSeoImagePath,
  getSeoImageAbsoluteUrl,
  SEO_IMAGE_HEIGHT,
  SEO_IMAGE_WIDTH,
} from "@/lib/seoImages";
import { absoluteUrl, getNaverSiteVerification, getSiteUrl, siteConfig } from "@/lib/siteConfig";

const HOME_KEYWORDS = [
  "전국 골프장",
  "골프장 지도",
  "퍼블릭 골프장",
  "골프장 요금",
  "골프장 전화번호",
  "골프장 홈페이지",
  "골프장 위치",
];

/** `<meta name="naver-site-verification" content="..." />` */
export function buildNaverSiteVerificationMetadata(): Pick<
  Metadata,
  "other"
> | null {
  const token = getNaverSiteVerification();
  if (!token) return null;

  return {
    other: {
      "naver-site-verification": token,
    },
  };
}

function getDefaultOgImageAbsoluteUrl(): string {
  return absoluteUrl(siteConfig.defaultOgImage);
}

export function resolveSeoImageMetadata(
  imagePath: string,
  alt: string,
): { url: string; width: number; height: number; alt: string } {
  return {
    url: getSeoImageAbsoluteUrl(imagePath),
    width: SEO_IMAGE_WIDTH,
    height: SEO_IMAGE_HEIGHT,
    alt,
  };
}

function buildOpenGraph(
  title: string,
  description: string,
  url: string,
  imagePath?: string,
  imageAlt?: string,
): Metadata["openGraph"] {
  const og: Metadata["openGraph"] = {
    title,
    description,
    url,
    siteName: siteConfig.siteName,
    type: "website",
    locale: "ko_KR",
  };

  if (imagePath && imageAlt) {
    const image = resolveSeoImageMetadata(imagePath, imageAlt);
    og.images = [
      {
        url: image.url,
        width: image.width,
        height: image.height,
        alt: image.alt,
      },
    ];
  } else {
    og.images = [{ url: getDefaultOgImageAbsoluteUrl(), alt: siteConfig.defaultTitle }];
  }

  return og;
}

function buildTwitter(
  title: string,
  description: string,
  imagePath?: string,
  imageAlt?: string,
): Metadata["twitter"] {
  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title,
    description,
  };

  if (imagePath && imageAlt) {
    twitter.images = [resolveSeoImageMetadata(imagePath, imageAlt).url];
  } else {
    twitter.images = [getDefaultOgImageAbsoluteUrl()];
  }

  return twitter;
}

export function buildHomeMetadata(): Metadata {
  const title = "GolfMap Korea | 전국 골프장 지도·가격·추천 코스";
  const description =
    "전국 골프장을 지도에서 찾고, 서울 근교·저렴한 골프장·대중제·9홀·파3 골프장을 조건별로 비교해 보세요.";
  const url = absoluteUrl("/");

  return {
    title,
    description,
    keywords: HOME_KEYWORDS,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url),
    twitter: buildTwitter(title, description),
  };
}

export function buildRecommendedMetadata(): Metadata {
  return buildStaticPageMetadata({
    title: "추천 골프장 | GolfMap Korea",
    description:
      "접근성, 가격 정보, 운영 형태를 기준으로 골라본 추천 골프장입니다.",
    path: "/recommended",
  });
}

export function buildBlogMetadata(): Metadata {
  return buildStaticPageMetadata({
    title: "골프장 추천 블로그 | GolfMap Korea",
    description:
      "서울 근교, 저렴한 골프장, Par 3, 지역별 골프장 가이드를 정리한 GolfMap Korea 블로그입니다.",
    path: "/blog",
  });
}

export function buildBlogPostMetadata(post: {
  title: string;
  description: string;
  slug: string;
  thumbnail: string;
  thumbnailAlt: string;
}): Metadata {
  const pageTitle = `${post.title} | GolfMap Korea`;
  const description = truncateMetaDescription(
    post.description,
    META_DESCRIPTION_MAX_LENGTH,
  );
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    title: pageTitle,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(
      pageTitle,
      description,
      url,
      post.thumbnail,
      post.thumbnailAlt,
    ),
    twitter: buildTwitter(
      pageTitle,
      description,
      post.thumbnail,
      post.thumbnailAlt,
    ),
  };
}

export function buildMapMetadata(): Metadata {
  const title = "골프장 지도 | GolfMap Korea";
  const description =
    "전국 골프장을 지도에서 확인하고 지역, 가격, 운영 형태 기준으로 필터링해 보세요.";
  const url = absoluteUrl("/map");

  return {
    title,
    description,
    keywords: HOME_KEYWORDS,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url),
    twitter: buildTwitter(title, description),
  };
}

export function buildCourseDetailTitle(course: Course): string {
  const name = course.name.trim() || "골프장";
  const aliases = resolveCourseSearchAliases(course);
  const primaryAlias = aliases.find((alias) => alias !== name);
  if (primaryAlias) {
    return `${name} ${primaryAlias} | 위치·요금 | ${siteConfig.siteName}`;
  }
  return `${name} | 위치·요금 | ${siteConfig.siteName}`;
}

export function buildCourseMetadata(course: Course): Metadata {
  const title = buildCourseDetailTitle(course);
  const description = buildCourseDetailDescription(course);
  const url = absoluteUrl(`/courses/${course.id}`);
  const imagePath = getCourseSeoImagePath(course.id);
  const imageAlt = `${course.name} 골프장 정보 | ${siteConfig.siteName}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url, imagePath, imageAlt),
    twitter: buildTwitter(title, description, imagePath, imageAlt),
  };
}

export function buildNotFoundCourseMetadata(): Metadata {
  return {
    title: `골프장을 찾을 수 없습니다 | ${siteConfig.siteName}`,
    robots: { index: false, follow: false },
  };
}

export function buildRegionMetadata(
  config: RegionLandingConfig,
  _courses: Course[] = [],
  options?: { noindex?: boolean },
): Metadata {
  const title = `${config.label} 골프장 지도 | 전화번호·홈페이지·요금 정보 | ${siteConfig.siteName}`;
  const description = truncateMetaDescription(
    config.description,
    META_DESCRIPTION_MAX_LENGTH,
  );
  const url = absoluteUrl(`/regions/${config.slug}`);
  const imagePath = getRegionSeoImagePath(config.slug);
  const imageAlt = `${config.label} 골프장 지도 | ${siteConfig.siteName}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url, imagePath, imageAlt),
    twitter: buildTwitter(title, description, imagePath, imageAlt),
    ...(options?.noindex ? { robots: { index: false } } : {}),
  };
}

export function buildStaticPageMetadata(options: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const pageTitle = options.title.includes(siteConfig.siteName)
    ? options.title
    : `${options.title} | ${siteConfig.siteName}`;
  const description = truncateMetaDescription(
    options.description,
    META_DESCRIPTION_MAX_LENGTH,
  );
  const url = absoluteUrl(options.path);

  return {
    title: pageTitle,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(pageTitle, description, url),
    twitter: buildTwitter(pageTitle, description),
  };
}

export function buildCollectionMetadata(
  config: {
    title: string;
    seoDescription: string;
    slug: string;
  },
  options?: { noindex?: boolean },
): Metadata {
  const title = config.title.includes(siteConfig.siteName)
    ? config.title
    : `${config.title} | ${siteConfig.siteName}`;
  const description = truncateMetaDescription(
    config.seoDescription,
    META_DESCRIPTION_MAX_LENGTH,
  );
  const url = absoluteUrl(`/collections/${config.slug}`);
  const imagePath = getCollectionSeoImagePath(config.slug);
  const imageAlt = config.title;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url, imagePath, imageAlt),
    twitter: buildTwitter(title, description, imagePath, imageAlt),
    ...(options?.noindex
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}
