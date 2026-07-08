/**
 * Related blog + visit-korea overview merge smoke checks.
 * Usage: npx tsx scripts/verifyRelatedBlogAndEnrichment.ts
 */
import fs from "node:fs";
import path from "node:path";
import { BLOG_POSTS } from "@/lib/blogPosts";
import {
  resolveBlogItemDescription,
  sanitizeVisitKoreaOverview,
} from "@/lib/enrichBlogPost";
import {
  BLOG_CONTENT_PURPOSE_BY_SLUG,
  BLOG_GEOGRAPHIC_SCOPE_BY_SLUG,
  getBlogContentPurpose,
  getRelatedBlogPostsForCourse,
  isCourseVisitGuidePost,
  isEquipmentOrTourPost,
  isForeignRegionalPost,
  scorePostForCourse,
  type BlogContentPurpose,
} from "@/lib/relatedBlogPosts";
import type { Course } from "@/types/course";

function stubCourse(partial: Partial<Course> & Pick<Course, "id" | "name">): Course {
  return {
    id: partial.id,
    name: partial.name,
    region: partial.region ?? "",
    city: partial.city ?? "",
    address: partial.address ?? "",
    latitude: partial.latitude ?? 0,
    longitude: partial.longitude ?? 0,
    holeCount: partial.holeCount ?? 18,
    courseType: partial.courseType ?? "대중제",
    priceMin: partial.priceMin,
    priceMax: partial.priceMax,
    nightRound: partial.nightRound ?? false,
    tags: partial.tags ?? [],
    source: partial.source ?? "manual",
    updatedAt: partial.updatedAt ?? "2026-07-08",
  };
}

const daeyoung = stubCourse({
  id: "gc-6bee4df56cf5",
  name: "대영베이스cc",
  region: "충청",
  city: "충주시",
  latitude: 36.97,
  longitude: 127.89,
});

const goyangStub = stubCourse({
  id: "gc-a80360466b97",
  name: "123골프클럽",
  region: "경기",
  city: "고양시",
  latitude: 37.65,
  longitude: 126.89,
  holeCount: 6,
});

const gapyeongStub = stubCourse({
  id: "gc-gapyeong-sample",
  name: "가평샘플CC",
  region: "경기",
  city: "가평군",
  latitude: 37.83,
  longitude: 127.51,
});

const incheonStub = stubCourse({
  id: "gc-incheon-sample",
  name: "인천샘플CC",
  region: "인천",
  city: "인천",
  latitude: 37.45,
  longitude: 126.7,
});

const nearSeoulStub = stubCourse({
  id: "gc-paju-sample",
  name: "파주샘플GC",
  region: "경기",
  city: "파주시",
  latitude: 37.76,
  longitude: 126.78,
});

const sparseRegionStub = stubCourse({
  id: "gc-sparse-sample",
  name: "데이터부족샘플CC",
  region: "",
  city: "",
  latitude: 0,
  longitude: 0,
});

const EQUIPMENT_SLUG_PREFIXES = [
  "driver-loft",
  "beginner-driver",
  "beginner-iron",
  "golf-ball",
  "pro-tour-driver",
] as const;

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

function titles(course: Course): string[] {
  return getRelatedBlogPostsForCourse(course, 4, BLOG_POSTS).map((p) => p.slug);
}

function assertNoEquipmentPadding(slugs: string[], label: string) {
  for (const slug of slugs) {
    const post = BLOG_POSTS.find((p) => p.slug === slug)!;
    assert(
      !isEquipmentOrTourPost(post),
      `${label} must not pad with equipment/tour post: ${slug}`,
    );
    for (const prefix of EQUIPMENT_SLUG_PREFIXES) {
      assert(!slug.startsWith(prefix), `${label} must not include ${slug}`);
    }
  }
}

function main() {
  console.log("[verify] related blogs + overview merge");

  // 0) content purpose mapping coverage
  for (const post of BLOG_POSTS) {
    assert(
      BLOG_CONTENT_PURPOSE_BY_SLUG[post.slug],
      `missing content purpose mapping: ${post.slug}`,
    );
    const purpose = getBlogContentPurpose(post);
    if (post.category === "gear-guide") {
      assert(
        purpose === "equipment-guide" || purpose === "tour-equipment",
        `gear-guide must be equipment*: ${post.slug}`,
      );
      assert(
        !isCourseVisitGuidePost(post),
        `equipment must not be course-visit fallback: ${post.slug}`,
      );
    }
    if (post.category === "course-guide") {
      assert(
        purpose === "regional-course-guide",
        `course-guide purpose mismatch: ${post.slug}`,
      );
      assert(
        BLOG_GEOGRAPHIC_SCOPE_BY_SLUG[post.slug]?.type === "regional",
        `course-guide needs regional geo scope: ${post.slug}`,
      );
    }
    if (purpose === "course-visit-guide") {
      assert(
        post.category === "beginner-guide",
        `visit guide should be beginner-guide: ${post.slug}`,
      );
    }
  }

  // 1) overview merge policy
  const promo =
    "123골프클럽은 한국 최초의 퍼블릭 골프장으로 반세기의 역사와 전통을 자랑하는 6홀 골프장이다. 나지막한 응봉산 양지바른 자락에 아담하게 위치하여 들어오는 입구에서부터 봄이면 개나리, 진달래, 벚꽃이, 여름이면 아카시아 향기, 가을이면 온통 불을 놓은 듯한 단풍이, 겨울이면 하얀 눈꽃이 절경을 이루어 뚜렷한 사계절을 느낄 수 있는 아름다운 경관을 자랑한다.";
  const manual =
    "고양시 덕양구 통일로 인근의 6홀 대중제 골프장입니다. 정규 18홀과 다른 짧은 일정용 코스로, 공식 홈페이지에서 6홀 경기 기준 시간과 코스 안내를 확인할 수 있습니다.";
  const merged = resolveBlogItemDescription(manual, promo);
  assert(merged === manual, "manual description must win");
  assert(!merged.includes("반세기의 역사"), "promo overview must not append");
  const blankFallback = resolveBlogItemDescription("  ", promo);
  assert(
    blankFallback !== undefined && !blankFallback.includes("반세기"),
    "blank manual must use sanitized fallback without promo sentences",
  );
  assert(
    !blankFallback.includes("개나리"),
    "blank manual fallback must drop tourist landscape sentences",
  );
  const fallback = sanitizeVisitKoreaOverview(
    "경기도 고양시에 위치한 6홀 대중제 골프장입니다. 반세기의 역사를 자랑한다.",
  );
  assert(fallback && !fallback.includes("반세기"), "sanitize drops promo sentence");

  // 2) goyang live meta + blogPosts item
  const goyangPost = BLOG_POSTS.find((p) => p.slug === "goyang-golf-best-5");
  assert(goyangPost, "goyang post exists");
  const item123 = goyangPost!.sections
    .flatMap((s) => s.items ?? [])
    .find((i) => i.title.includes("123"));
  assert(item123?.description?.trim(), "123 manual description exists");
  const metaPath = path.join(
    process.cwd(),
    "public/promo-assets/blog/goyang/visit-korea-meta.json",
  );
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as Array<{
    courseId?: string;
    overview?: string;
    apiAddr?: string;
    homepage?: string;
  }>;
  const entry = meta.find((e) => e.courseId === item123!.relatedCourseId);
  const finalDesc = resolveBlogItemDescription(
    item123!.description,
    entry?.overview,
  );
  assert(finalDesc === item123!.description!.trim(), "123 final == manual");
  assert(!/반세기|개나리|아카시아|눈꽃/.test(finalDesc), "123 no tourist promo");
  assert(entry?.apiAddr, "123 meta address retained in meta");
  assert(entry?.homepage, "123 meta homepage retained in meta");

  // 3) related blogs — 대영베이스 (visit guides only, no equipment pad)
  const relatedDaeyoung = titles(daeyoung);
  console.log("대영베이스CC related:", relatedDaeyoung.join(", ") || "(none)");
  assert(
    relatedDaeyoung.every((slug) => {
      const post = BLOG_POSTS.find((p) => p.slug === slug)!;
      return isCourseVisitGuidePost(post);
    }),
    "대영베이스 related must be visit guides only (or empty)",
  );
  assertNoEquipmentPadding(relatedDaeyoung, "대영베이스");
  assert(
    !relatedDaeyoung.some((s) => s.startsWith("driver-loft")),
    "대영베이스 must not include driver-loft",
  );
  assert(
    !relatedDaeyoung.some((s) => s.startsWith("beginner-driver")),
    "대영베이스 must not include beginner-driver",
  );
  for (const slug of relatedDaeyoung) {
    assert(
      !["goyang-golf-best-5", "incheon-golf-top-5", "gapyeong-golf-best-6"].includes(
        slug,
      ),
      `대영베이스 must not get foreign regional ${slug}`,
    );
    assert(
      !(slug.startsWith("seoul-") && BLOG_POSTS.find((p) => p.slug === slug)?.category === "course-guide"),
      `unexpected seoul course-guide for 대영베이스: ${slug}`,
    );
  }
  assert(
    relatedDaeyoung.length <= 4,
    "대영베이스 may have fewer than limit",
  );
  assert(
    relatedDaeyoung.includes("first-golf-round-checklist") ||
      relatedDaeyoung.includes("beginner-golf-essentials-checklist") ||
      relatedDaeyoung.length === 0,
    "대영베이스 should allow visit checklists when present",
  );

  const goyangPostRef = BLOG_POSTS.find((p) => p.slug === "goyang-golf-best-5")!;
  assert(
    isForeignRegionalPost(goyangPostRef, daeyoung),
    "goyang post is foreign for 충주",
  );
  assert(
    scorePostForCourse(goyangPostRef, daeyoung).score === 0,
    "goyang score 0 for 충주",
  );
  assert(
    scorePostForCourse(
      BLOG_POSTS.find((p) => p.slug === "driver-loft-shaft-guide-men")!,
      daeyoung,
    ).score === 0,
    "driver loft score 0 for 충주",
  );

  // 4) regional preference
  const relatedGoyang = titles(goyangStub);
  console.log("123골프클럽 related:", relatedGoyang.join(", "));
  assert(
    relatedGoyang.includes("goyang-golf-best-5"),
    "goyang course should prefer goyang post",
  );
  assertNoEquipmentPadding(relatedGoyang, "고양");

  const relatedGapyeong = titles(gapyeongStub);
  console.log("가평샘플 related:", relatedGapyeong.join(", "));
  assert(
    relatedGapyeong.includes("gapyeong-golf-best-6"),
    "gapyeong course should prefer gapyeong post",
  );
  assertNoEquipmentPadding(relatedGapyeong, "가평");

  const relatedIncheon = titles(incheonStub);
  console.log("인천샘플 related:", relatedIncheon.join(", "));
  assert(
    relatedIncheon.includes("incheon-golf-top-5"),
    "incheon course should prefer incheon post",
  );
  assert(
    !relatedIncheon.some((s) => s.startsWith("seoul-")),
    "incheon must not get seoul-only course guides",
  );
  assert(
    !relatedIncheon.includes("goyang-golf-best-5"),
    "incheon must not get goyang-only post",
  );
  assertNoEquipmentPadding(relatedIncheon, "인천");
  assert(
    relatedIncheon.every((slug) => {
      const post = BLOG_POSTS.find((p) => p.slug === slug)!;
      return (
        post.slug === "incheon-golf-top-5" ||
        isCourseVisitGuidePost(post)
      );
    }),
    "인천 related = incheon guide + visit guides only",
  );

  const relatedNearSeoul = titles(nearSeoulStub);
  console.log("파주샘플 related:", relatedNearSeoul.join(", "));
  assert(
    relatedNearSeoul.some((s) => s.startsWith("seoul-")),
    "near-seoul course should get seoul-near posts",
  );
  assert(
    !relatedNearSeoul.includes("goyang-golf-best-5"),
    "파주 must not get goyang-only post",
  );
  assert(
    !relatedNearSeoul.includes("incheon-golf-top-5"),
    "파주 must not get incheon-only post",
  );
  assert(
    !relatedNearSeoul.includes("gapyeong-golf-best-6"),
    "파주 must not get gapyeong-only post",
  );
  assertNoEquipmentPadding(relatedNearSeoul, "파주");

  const relatedSparse = titles(sparseRegionStub);
  console.log("데이터부족샘플 related:", relatedSparse.join(", ") || "(none)");
  assertNoEquipmentPadding(relatedSparse, "sparse");
  assert(
    relatedSparse.every((slug) =>
      isCourseVisitGuidePost(BLOG_POSTS.find((p) => p.slug === slug)!),
    ),
    "sparse course may only get visit guides",
  );

  // 5) deterministic + uniqueness + undersized ok
  assert(
    titles(daeyoung).join() === titles(daeyoung).join(),
    "related blogs must be deterministic",
  );
  const unique = new Set(relatedDaeyoung);
  assert(unique.size === relatedDaeyoung.length, "no duplicate slugs");
  assert(
    getRelatedBlogPostsForCourse(daeyoung, 4, BLOG_POSTS).length <= 4,
    "limit respected",
  );
  assert(
    relatedDaeyoung.length < 4 || relatedDaeyoung.length === 4,
    "결과 개수는 limit 이하 (undersize allowed)",
  );

  // purpose enum sanity
  const allowed: BlogContentPurpose[] = [
    "regional-course-guide",
    "course-visit-guide",
    "equipment-guide",
    "tour-equipment",
  ];
  for (const purpose of Object.values(BLOG_CONTENT_PURPOSE_BY_SLUG)) {
    assert(allowed.includes(purpose), `unknown purpose ${purpose}`);
  }

  console.log("[verify] OK");
}

main();
