import type { Course } from "@/types/course";

export type RegionSlug =
  | "seoul"
  | "gyeonggi"
  | "incheon"
  | "gangwon"
  | "chungcheong"
  | "jeolla"
  | "gyeongsang"
  | "jeju"
  | "busan";

function fieldText(course: Pick<Course, "region" | "city" | "address">): string {
  return [course.region, course.city, course.address]
    .map((value) => value?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
}

function resolveFromText(text: string): RegionSlug | null {
  if (!text) return null;

  if (matchesBusan(text)) return "busan";
  if (matchesIncheon(text)) return "incheon";
  if (matchesSeoul(text)) return "seoul";
  if (matchesJeju(text)) return "jeju";
  if (matchesGangwon(text)) return "gangwon";
  if (matchesChungcheong(text)) return "chungcheong";
  if (matchesJeolla(text)) return "jeolla";
  if (matchesGyeongsang(text)) return "gyeongsang";
  if (matchesGyeonggi(text)) return "gyeonggi";

  return null;
}

/** region/city/address 기준 canonical 지역 slug — 주소 > city > region 순 */
export function resolveCourseRegionSlug(
  course: Pick<Course, "region" | "city" | "address">,
): RegionSlug | null {
  const address = course.address?.trim() ?? "";
  const city = course.city?.trim() ?? "";
  const region = course.region?.trim() ?? "";

  return (
    resolveFromText(address) ??
    resolveFromText(city) ??
    resolveFromText(region) ??
    resolveFromText(fieldText(course))
  );
}

function matchesBusan(text: string): boolean {
  return /부산/.test(text);
}

function matchesIncheon(text: string): boolean {
  return /인천/.test(text);
}

function matchesSeoul(text: string): boolean {
  return /서울/.test(text);
}

function matchesGyeonggi(text: string): boolean {
  return /경기/.test(text);
}

function matchesGangwon(text: string): boolean {
  return /강원/.test(text);
}

function matchesChungcheong(text: string): boolean {
  return (
    /충청/.test(text) ||
    /충북/.test(text) ||
    /충남/.test(text) ||
    /충청북/.test(text) ||
    /충청남/.test(text) ||
    /세종/.test(text) ||
    /대전/.test(text)
  );
}

function matchesJeolla(text: string): boolean {
  if (/경기/.test(text)) return false;
  return (
    /전라/.test(text) ||
    /전북/.test(text) ||
    /전남/.test(text) ||
    /전라북/.test(text) ||
    /전라남/.test(text) ||
    /광주광역시/.test(text) ||
    /^광주(?:시|\s)/.test(text)
  );
}

function matchesGyeongsang(text: string): boolean {
  return (
    /경상/.test(text) ||
    /경북/.test(text) ||
    /경남/.test(text) ||
    /경상북/.test(text) ||
    /경상남/.test(text) ||
    /울산/.test(text) ||
    /대구/.test(text)
  );
}

function matchesJeju(text: string): boolean {
  return /제주/.test(text);
}
