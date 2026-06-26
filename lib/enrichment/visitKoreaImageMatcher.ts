import {
  addressOverlapScore,
  fuzzyNameScore,
  normalizeGolfCourseName,
} from "@/lib/enrichment/visitKoreaNormalize";

export type ImageMatchConfidence =
  | "exact"
  | "high"
  | "medium"
  | "low"
  | "ambiguous";

export interface VisitKoreaGolfEntry {
  contentId: string;
  title: string;
  addr1?: string;
  addr2?: string;
  firstimage?: string;
  firstimage2?: string;
  imageList?: string[];
  mapx?: string;
  mapy?: string;
  areaCode?: string;
}

export interface GolfMapCourseForMatch {
  id: string;
  name: string;
  region?: string;
  city?: string;
  address?: string;
  searchAliases?: string[];
}

export interface VisitKoreaMatchScore {
  exactNameMatch: boolean;
  normalizedNameMatch: boolean;
  aliasMatch: boolean;
  addressMatch: number;
  cityMatch: boolean;
  regionMatch: boolean;
  fuzzyScore: number;
  imageMatchConfidence: ImageMatchConfidence;
  autoApply: boolean;
}

export interface VisitKoreaImageMatchCandidate {
  courseId: string;
  courseName: string;
  visitKoreaContentId: string;
  visitKoreaTitle: string;
  visitKoreaAddr1?: string;
  visitKoreaAddr2?: string;
  images: string[];
  scores: VisitKoreaMatchScore;
}

export interface VisitKoreaImageMatchResult {
  courseId: string;
  courseName: string;
  best?: VisitKoreaImageMatchCandidate;
  alternatives: VisitKoreaImageMatchCandidate[];
}

function collectNameVariants(course: GolfMapCourseForMatch): string[] {
  const variants = new Set<string>();
  variants.add(course.name);
  for (const alias of course.searchAliases ?? []) {
    if (alias.trim()) variants.add(alias);
  }
  return [...variants];
}

function hasCityMatch(
  course: GolfMapCourseForMatch,
  entry: VisitKoreaGolfEntry,
): boolean {
  return addressOverlapScore(
    course.address ?? "",
    course.region,
    course.city,
    entry.addr1,
    entry.addr2,
  ) >= 0.35;
}

function hasRegionMatch(
  course: GolfMapCourseForMatch,
  entry: VisitKoreaGolfEntry,
): boolean {
  return addressOverlapScore(
    course.address ?? "",
    course.region,
    course.city,
    entry.addr1,
    entry.addr2,
  ) >= 0.2;
}

export function scoreVisitKoreaMatch(
  course: GolfMapCourseForMatch,
  entry: VisitKoreaGolfEntry,
): VisitKoreaMatchScore {
  const courseNormalized = normalizeGolfCourseName(course.name);
  const entryNormalized = normalizeGolfCourseName(entry.title);
  const exactNameMatch = courseNormalized === entryNormalized;

  const nameVariants = collectNameVariants(course);
  const fuzzyScores = nameVariants.map((variant) =>
    fuzzyNameScore(variant, entry.title),
  );
  const fuzzyScore = Math.max(...fuzzyScores, 0);

  const normalizedNameMatch =
    exactNameMatch || fuzzyScore >= 0.92 || courseNormalized.includes(entryNormalized) || entryNormalized.includes(courseNormalized);

  const aliasMatch = nameVariants.some((variant) => {
    const normalized = normalizeGolfCourseName(variant);
    return (
      normalized === entryNormalized ||
      fuzzyNameScore(variant, entry.title) >= 0.92
    );
  });

  const addressMatch = addressOverlapScore(
    course.address ?? "",
    course.region,
    course.city,
    entry.addr1,
    entry.addr2,
  );
  const cityMatch = hasCityMatch(course, entry);
  const regionMatch = hasRegionMatch(course, entry);

  let imageMatchConfidence: ImageMatchConfidence = "low";

  if (exactNameMatch && addressMatch >= 0.5) {
    imageMatchConfidence = "exact";
  } else if (exactNameMatch && cityMatch) {
    imageMatchConfidence = "high";
  } else if (fuzzyScore >= 0.98 && addressMatch >= 0.35) {
    imageMatchConfidence = "high";
  } else if ((normalizedNameMatch || aliasMatch) && addressMatch >= 0.55) {
    imageMatchConfidence = "high";
  } else if (
    (normalizedNameMatch || aliasMatch) &&
    cityMatch &&
    fuzzyScore >= 0.85
  ) {
    imageMatchConfidence = "medium";
  } else if (fuzzyScore >= 0.95 && addressMatch >= 0.3) {
    imageMatchConfidence = "medium";
  } else if (fuzzyScore >= 0.78 && cityMatch) {
    imageMatchConfidence = "low";
  } else if (fuzzyScore >= 0.7 && regionMatch) {
    imageMatchConfidence = "low";
  }

  const autoApply =
    imageMatchConfidence === "exact" ||
    imageMatchConfidence === "high" ||
    (imageMatchConfidence === "medium" &&
      (normalizedNameMatch || aliasMatch) &&
      addressMatch >= 0.35 &&
      fuzzyScore >= 0.82);

  return {
    exactNameMatch,
    normalizedNameMatch,
    aliasMatch,
    addressMatch,
    cityMatch,
    regionMatch,
    fuzzyScore,
    imageMatchConfidence,
    autoApply,
  };
}

export function collectVisitKoreaImages(entry: VisitKoreaGolfEntry): string[] {
  const images: string[] = [];
  const push = (url?: string) => {
    const trimmed = url?.trim();
    if (!trimmed) return;
    if (trimmed.includes("/promo-assets/blog/source/")) return;
    if (images.includes(trimmed)) return;
    images.push(trimmed);
  };

  push(entry.firstimage);
  push(entry.firstimage2);
  for (const url of entry.imageList ?? []) push(url);

  return images.slice(0, 4);
}

export function matchCourseToVisitKorea(
  course: GolfMapCourseForMatch,
  catalog: VisitKoreaGolfEntry[],
): VisitKoreaImageMatchResult {
  const candidates: VisitKoreaImageMatchCandidate[] = [];

  for (const entry of catalog) {
    const images = collectVisitKoreaImages(entry);
    if (images.length === 0) continue;

    const scores = scoreVisitKoreaMatch(course, entry);
    if (scores.fuzzyScore < 0.65 && !scores.exactNameMatch) continue;

    candidates.push({
      courseId: course.id,
      courseName: course.name,
      visitKoreaContentId: entry.contentId,
      visitKoreaTitle: entry.title,
      visitKoreaAddr1: entry.addr1,
      visitKoreaAddr2: entry.addr2,
      images,
      scores,
    });
  }

  candidates.sort((a, b) => {
    const rank = (value: ImageMatchConfidence) =>
      ({ exact: 5, high: 4, medium: 3, ambiguous: 2, low: 1 })[value];
    const confidenceDiff =
      rank(b.scores.imageMatchConfidence) - rank(a.scores.imageMatchConfidence);
    if (confidenceDiff !== 0) return confidenceDiff;
    if (b.scores.fuzzyScore !== a.scores.fuzzyScore) {
      return b.scores.fuzzyScore - a.scores.fuzzyScore;
    }
    return b.scores.addressMatch - a.scores.addressMatch;
  });

  if (candidates.length >= 2) {
    const [first, second] = candidates;
    const closeScore =
      Math.abs(first.scores.fuzzyScore - second.scores.fuzzyScore) <= 0.05;
    const sameBand =
      first.scores.imageMatchConfidence === second.scores.imageMatchConfidence;
    if (
      closeScore &&
      sameBand &&
      first.scores.fuzzyScore >= 0.8 &&
      second.scores.fuzzyScore >= 0.8
    ) {
      first.scores.imageMatchConfidence = "ambiguous";
      first.scores.autoApply = false;
    }
  }

  const best = candidates[0];
  return {
    courseId: course.id,
    courseName: course.name,
    best,
    alternatives: candidates.slice(1, 4),
  };
}

export function matchAllCoursesToVisitKorea(
  courses: GolfMapCourseForMatch[],
  catalog: VisitKoreaGolfEntry[],
): VisitKoreaImageMatchResult[] {
  return courses.map((course) => matchCourseToVisitKorea(course, catalog));
}
