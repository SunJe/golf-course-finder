import fs from "fs";
import path from "path";
import { getCourseSeoImagePath } from "@/lib/seoImages";

export const DEFAULT_COURSE_THUMBNAIL = "/seo-images/collections/near-seoul.png";

export function courseSeoImageExists(courseId: string): boolean {
  const relativePath = getCourseSeoImagePath(courseId).replace(/^\//, "");
  return fs.existsSync(path.join(process.cwd(), "public", relativePath));
}

export function resolveCourseThumbnailPath(courseId: string): string {
  if (courseSeoImageExists(courseId)) {
    return getCourseSeoImagePath(courseId);
  }
  return DEFAULT_COURSE_THUMBNAIL;
}
