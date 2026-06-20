import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import type { Course } from "@/types/course";
import { absoluteUrl, getNaverSiteVerification, getSiteUrl, siteConfig } from "@/lib/siteConfig";
import { hasPrice } from "@/lib/priceFormat";

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
    alternates: { canonical: url },
    openGraph: buildOpenGraph(title, description, url),
    twitter: buildTwitter(title, description),
  };
}

export function buildCourseDetailTitle(courseName: string): string {
  const name = courseName.trim() || "골프장";
  return `${name} | 요금·위치·전화번호 | ${siteConfig.siteName}`;
}

export function buildCourseDetailDescription(course: Course): string {
  const name = course.name.trim() || "골프장";
  if (hasPrice(course)) {
    return `${name}의 위치, 전화번호, 홈페이지, 참고 요금 정보를 ${siteConfig.siteName}에서 확인하세요.`;
  }
  return `${name}의 위치, 전화번호, 홈페이지 정보를 ${siteConfig.siteName}에서 확인하세요.`;
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
