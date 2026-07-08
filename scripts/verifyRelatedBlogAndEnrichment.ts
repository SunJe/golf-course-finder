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
  getRelatedBlogPostsForCourse,
  isForeignRegionalPost,
  scorePostForCourse,
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

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

function titles(course: Course): string[] {
  return getRelatedBlogPostsForCourse(course, 4, BLOG_POSTS).map((p) => p.slug);
}

function main() {
  console.log("[verify] related blogs + overview merge");

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
  // images empty for this entry is OK; enrichment still keeps address/homepage from meta

  // 3) related blogs — 대영베이스
  const relatedDaeyoung = titles(daeyoung);
  console.log("대영베이스CC related:", relatedDaeyoung.join(", ") || "(none)");
  for (const slug of relatedDaeyoung) {
    assert(
      !["goyang-golf-best-5", "incheon-golf-top-5", "gapyeong-golf-best-6"].includes(
        slug,
      ),
      `대영베이스 must not get foreign regional ${slug}`,
    );
    assert(
      !slug.startsWith("seoul-") ||
        BLOG_POSTS.find((p) => p.slug === slug)?.category !== "course-guide" ||
        false,
      // seoul course-guides should be foreign for chungju
      `unexpected seoul course-guide for 대영베이스: ${slug}`,
    );
  }
  for (const slug of relatedDaeyoung) {
    if (slug.startsWith("seoul-") || slug.includes("goyang") || slug.includes("incheon") || slug.includes("gapyeong")) {
      const post = BLOG_POSTS.find((p) => p.slug === slug)!;
      assert(post.category !== "course-guide", `foreign regional slipped: ${slug}`);
    }
  }

  // foreign flags
  const goyangPostRef = BLOG_POSTS.find((p) => p.slug === "goyang-golf-best-5")!;
  assert(
    isForeignRegionalPost(goyangPostRef, daeyoung),
    "goyang post is foreign for 충주",
  );
  assert(
    scorePostForCourse(goyangPostRef, daeyoung).score === 0,
    "goyang score 0 for 충주",
  );

  // 4) regional preference
  const relatedGoyang = titles(goyangStub);
  console.log("123골프클럽 related:", relatedGoyang.join(", "));
  assert(
    relatedGoyang.includes("goyang-golf-best-5"),
    "goyang course should prefer goyang post",
  );

  const relatedGapyeong = titles(gapyeongStub);
  console.log("가평샘플 related:", relatedGapyeong.join(", "));
  assert(
    relatedGapyeong.includes("gapyeong-golf-best-6"),
    "gapyeong course should prefer gapyeong post",
  );

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

  // 5) deterministic
  assert(
    titles(daeyoung).join() === titles(daeyoung).join(),
    "related blogs must be deterministic",
  );

  // 6) do not pad with zero-score
  assert(
    getRelatedBlogPostsForCourse(daeyoung, 4, BLOG_POSTS).length <= 4,
    "limit respected",
  );

  console.log("[verify] OK");
}

main();
