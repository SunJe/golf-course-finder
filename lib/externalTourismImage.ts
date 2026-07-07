/**
 * 한국관광공사 · 한국관광콘텐츠랩 · VisitKorea 등 외부 관광 이미지 호스트.
 * Vercel Image Optimization quota를 보호하기 위해 이 호스트만 unoptimized 처리한다.
 */
const EXTERNAL_TOURISM_IMAGE_HOST_SUFFIXES = [
  ".visitkorea.or.kr",
  ".knto.or.kr",
] as const;

const EXTERNAL_TOURISM_IMAGE_EXACT_HOSTS = new Set([
  "visitkorea.or.kr",
  "knto.or.kr",
  "tong.visitkorea.or.kr",
  "api.visitkorea.or.kr",
  "www.visitkorea.or.kr",
  "kto.visitkorea.or.kr",
]);

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase();
}

function isExternalTourismImageHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  if (EXTERNAL_TOURISM_IMAGE_EXACT_HOSTS.has(normalized)) return true;
  return EXTERNAL_TOURISM_IMAGE_HOST_SUFFIXES.some((suffix) =>
    normalized.endsWith(suffix),
  );
}

function resolveImageSrc(src: string): string {
  return src.trim();
}

/**
 * 절대 URL이 한국 관광 콘텐츠 외부 호스트인지 판별한다.
 * 로컬 public 경로(`/`, 상대 경로)는 false.
 */
export function isExternalTourismImageSrc(src: string): boolean {
  const trimmed = resolveImageSrc(src);
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return false;

  try {
    const { hostname, protocol } = new URL(trimmed);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return isExternalTourismImageHostname(hostname);
  } catch {
    return false;
  }
}

/** 외부 관광 이미지일 때만 Vercel Image Optimization을 우회한다. */
export function shouldBypassVercelImageOptimization(src: string): boolean {
  return isExternalTourismImageSrc(src);
}
