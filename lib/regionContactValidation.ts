import type { Course } from "@/types/course";

const PLACEHOLDER_VALUES = new Set([
  "-",
  "--",
  "—",
  "–",
  "없음",
  "정보 없음",
  "정보없음",
  "미등록",
  "n/a",
  "na",
  "null",
  "undefined",
  ".",
  "..",
  "없습니다",
  "준비중",
  "준비 중",
]);

function normalizeField(value?: string | null): string {
  return value?.trim() ?? "";
}

export function isPlaceholderContactValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (PLACEHOLDER_VALUES.has(normalized)) return true;
  if (/^[-–—./\\|_\s]+$/.test(normalized)) return true;
  return false;
}

export function courseHasValidPhone(course: Course): boolean {
  const phone = normalizeField(course.phone);
  if (isPlaceholderContactValue(phone)) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8;
}

export function courseHasValidHomepage(course: Course): boolean {
  const url = normalizeField(course.homepageUrl);
  if (isPlaceholderContactValue(url)) return false;
  if (/^https?:\/\//i.test(url)) return true;
  return /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]{2,})+([/?#].*)?$/i.test(url);
}
