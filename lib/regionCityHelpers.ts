import type { Course } from "@/types/course";

/** 시·군·구 로마자 slug — `/regions/{region}/{city}` 확장용 */
const CITY_ROMAN_SLUGS: Record<string, string> = {
  가평: "gapyeong",
  가평군: "gapyeong",
  강릉: "gangneung",
  강릉시: "gangneung",
  강서: "gangseo",
  강서구: "gangseo",
  고양: "goyang",
  고양시: "goyang",
  고성: "goseong",
  고성군: "goseong",
  광주: "gwangju",
  광주시: "gwangju",
  구리: "guri",
  구리시: "guri",
  군포: "gunpo",
  군포시: "gunpo",
  김포: "gimpo",
  김포시: "gimpo",
  남양주: "namyangju",
  남양주시: "namyangju",
  동두천: "dongducheon",
  동두천시: "dongducheon",
  부천: "bucheon",
  부천시: "bucheon",
  성남: "seongnam",
  성남시: "seongnam",
  수원: "suwon",
  수원시: "suwon",
  시흥: "siheung",
  시흥시: "siheung",
  안산: "ansan",
  안산시: "ansan",
  안성: "anseong",
  안성시: "anseong",
  안양: "anyang",
  안양시: "anyang",
  양주: "yangju",
  양주시: "yangju",
  양평: "yangpyeong",
  양평군: "yangpyeong",
  여주: "yeoju",
  여주시: "yeoju",
  연천: "yeoncheon",
  연천군: "yeoncheon",
  오산: "osan",
  오산시: "osan",
  용인: "yongin",
  용인시: "yongin",
  의왕: "uiwang",
  의왕시: "uiwang",
  의정부: "uijeongbu",
  의정부시: "uijeongbu",
  이천: "icheon",
  이천시: "icheon",
  인천: "incheon",
  인천시: "incheon",
  파주: "paju",
  파주시: "paju",
  평택: "pyeongtaek",
  평택시: "pyeongtaek",
  포천: "pocheon",
  포천시: "pocheon",
  하남: "hanam",
  하남시: "hanam",
  화성: "hwaseong",
  화성시: "hwaseong",
  춘천: "chuncheon",
  춘천시: "chuncheon",
  원주: "wonju",
  원주시: "wonju",
  홍천: "hongcheon",
  홍천군: "hongcheon",
  횡성: "hoengseong",
  횡성군: "hoengseong",
  평창: "pyeongchang",
  평창군: "pyeongchang",
  태백: "taebaek",
  태백시: "taebaek",
  속초: "sokcho",
  속초시: "sokcho",
  삼척: "samcheok",
  삼척시: "samcheok",
  정선: "jeongseon",
  정선군: "jeongseon",
  양양: "yangyang",
  양양군: "yangyang",
  제주: "jeju",
  제주시: "jeju",
  서귀포: "seogwipo",
  서귀포시: "seogwipo",
  기장: "gijang",
  기장군: "gijang",
  금정: "geumjeong",
  금정구: "geumjeong",
  부산: "busan",
  기타: "other",
};

export interface CityGroup {
  name: string;
  displayName: string;
  slug: string;
  courses: Course[];
  count: number;
}

/** course.city 또는 address에서 시·군·구 이름 추출 */
export function extractCourseCity(course: Course): string | null {
  const city = course.city?.trim();
  if (city) {
    const match = city.match(/([가-힣]+(?:시|군|구))/);
    if (match) return match[1];
    const parts = city.split(/\s+/);
    return parts[parts.length - 1] || city;
  }

  const address = course.address?.trim();
  if (!address) return null;

  const fromDo = address.match(
    /(?:특별자치도|광역시|도)\s*([가-힣]+(?:시|군|구))/,
  );
  if (fromDo) return fromDo[1];

  const direct = address.match(/^([가-힣]+(?:시|군|구))/);
  return direct ? direct[1] : null;
}

export function cityDisplayName(cityName: string): string {
  return cityName.replace(/(특별자치)?(광역)?(시|군|구)$/, "").trim() || cityName;
}

export function cityToSlug(cityName: string): string {
  const trimmed = cityName.trim();
  if (CITY_ROMAN_SLUGS[trimmed]) return CITY_ROMAN_SLUGS[trimmed];

  const base = cityDisplayName(trimmed);
  if (CITY_ROMAN_SLUGS[base]) return CITY_ROMAN_SLUGS[base];

  return base
    .normalize("NFC")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9가-힣-]/g, "")
    .toLowerCase() || "other";
}

export function cityAnchorId(slug: string): string {
  return `city-${slug}`;
}

/** 향후 `/regions/{regionSlug}/{citySlug}` 경로용 */
export function buildCityRegionPath(
  regionSlug: string,
  citySlug: string,
): string {
  return `/regions/${regionSlug}/${citySlug}`;
}

export function groupCoursesByCity(courses: Course[]): CityGroup[] {
  const map = new Map<string, Course[]>();

  for (const course of courses) {
    const cityName = extractCourseCity(course) ?? "기타";
    const existing = map.get(cityName) ?? [];
    existing.push(course);
    map.set(cityName, existing);
  }

  return [...map.entries()]
    .map(([name, cityCourses]) => {
      const slug = cityToSlug(name);
      const sorted = [...cityCourses].sort((a, b) =>
        a.name.localeCompare(b.name, "ko"),
      );
      return {
        name,
        displayName: cityDisplayName(name),
        slug,
        courses: sorted,
        count: sorted.length,
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name, "ko");
    });
}

export function getTopCityGroups(
  courses: Course[],
  limit: number,
): CityGroup[] {
  return groupCoursesByCity(courses).slice(0, limit);
}

export function getTopCityDisplayNames(
  courses: Course[],
  limit = 3,
): string[] {
  return getTopCityGroups(courses, limit).map((group) => group.displayName);
}

export function formatCityNameList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} 등`;
}
