import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import type { Course } from "@/types/course";
import {
  buildCourseDetailDescription,
  META_DESCRIPTION_MAX_LENGTH,
  truncateMetaDescription,
} from "@/lib/courseSeoCopy";
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

function getDefaultOgImageAbsoluteUrl(): string | undefined {
  const filePath = path.join(process.cwd(), "public", "og-image.png");
  if (!fs.existsSync(filePath)) return undefined;
  return absoluteUrl(siteConfig.defaultOgImage);
}

export function resolveSeoImageMetadata(
  imagePath: string,
  alt: string,
): { url: string; width: number; height: number; alt: string } | undefined {
  const publicPath = path.join(
    process.cwd(),
    "public",
    imagePath.replace(/^\//, ""),
  );
  if (!fs.existsSync(publicPath)) return undefined;

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

  const image =
    imagePath && imageAlt
      ? resolveSeoImageMetadata(imagePath, imageAlt)
      : undefined;
  const fallback = getDefaultOgImageAbsoluteUrl();

  if (image) {
    og.images = [
      {
        url: image.url,
        width: image.width,
        height: image.height,
        alt: image.alt,
      },
    ];
  } else if (fallback) {
    og.images = [{ url: fallback, alt: siteConfig.defaultTitle }];
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

  const image =
    imagePath && imageAlt
      ? resolveSeoImageMetadata(imagePath, imageAlt)
      : undefined;
  const fallback = getDefaultOgImageAbsoluteUrl();

  if (image) {
    twitter.images = [image.url];
  } else if (fallback) {
    twitter.images = [fallback];
  }

  return twitter;
}

export function buildHomeMetadata(): Metadata {
  const title = siteConfig.defaultTitle;
  const description = siteConfig.defaultDescription;
  const url = getSiteUrl();

  return {
    title,
    description,
    keywords: HOME_KEYWORDS,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url),
    twitter: buildTwitter(title, description),
  };
}

export function buildCourseDetailTitle(courseName: string): string {
  const name = courseName.trim() || "골프장";
  return `${name} | 요금·위치·전화번호 | ${siteConfig.siteName}`;
}

export function buildCourseMetadata(course: Course): Metadata {
  const title = buildCourseDetailTitle(course.name);
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
