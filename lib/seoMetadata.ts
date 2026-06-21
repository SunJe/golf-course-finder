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

function buildOpenGraph(
  title: string,
  description: string,
  url: string,
): Metadata["openGraph"] {
  const og: Metadata["openGraph"] = {
    title,
    description,
    url,
    siteName: siteConfig.siteName,
    type: "website",
    locale: "ko_KR",
  };

  const image = getDefaultOgImageAbsoluteUrl();
  if (image) {
    og.images = [{ url: image, alt: siteConfig.defaultTitle }];
  }

  return og;
}

function buildTwitter(title: string, description: string): Metadata["twitter"] {
  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title,
    description,
  };

  const image = getDefaultOgImageAbsoluteUrl();
  if (image) {
    twitter.images = [image];
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

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url),
    twitter: buildTwitter(title, description),
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
): Metadata {
  const title = `${config.label} 골프장 지도 | 전화번호·홈페이지·요금 정보 | ${siteConfig.siteName}`;
  const description = truncateMetaDescription(
    `${config.label} 골프장 위치, 전화번호, 홈페이지, 요금 정보를 ${siteConfig.siteName}에서 확인하세요.`,
    META_DESCRIPTION_MAX_LENGTH,
  );
  const url = absoluteUrl(`/regions/${config.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url),
    twitter: buildTwitter(title, description),
  };
}
