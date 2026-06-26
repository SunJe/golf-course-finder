/**
 * Visit Korea 골프장 이미지 ↔ GolfMap 코스 매칭 audit
 * Usage: npm run audit:visit-korea-image-match
 */
import fs from "node:fs";
import path from "node:path";
import {
  matchAllCoursesToVisitKorea,
  type GolfMapCourseForMatch,
  type ImageMatchConfidence,
  type VisitKoreaGolfEntry,
  type VisitKoreaImageMatchResult,
} from "@/lib/enrichment/visitKoreaImageMatcher";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const FULL_SET_CSV = path.join(ROOT, "data/enrichment/golf_courses_full_set.csv");
const IMAGES_PATH = path.join(ROOT, "data/visit-korea-golf-images.json");
const RAW_PATH = path.join(ROOT, "data/visit-korea-golf-raw.json");
const MATCHES_PATH = path.join(ROOT, "data/visit-korea-golf-image-matches.json");
const APPLIED_PATH = path.join(ROOT, "data/visit-korea-golf-image-matches-applied.json");
const REVIEW_PATH = path.join(ROOT, "data/visit-korea-golf-image-review.json");
const AUDIT_REPORT_PATH = path.join(ROOT, "reports/visit-korea-image-match-audit.md");

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

function loadCoursesFromCsv(): GolfMapCourseForMatch[] {
  const lines = fs.readFileSync(FULL_SET_CSV, "utf8").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]).map((header) =>
    header.replace(/^\uFEFF/, ""),
  );
  const index = (name: string) => headers.indexOf(name);

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const get = (field: string) => cols[index(field)] ?? "";
    const aliasesRaw = get("seo_aliases");
    const searchAliases = aliasesRaw
      ? aliasesRaw.split("|").map((value) => value.trim()).filter(Boolean)
      : undefined;

    return {
      id: get("id"),
      name: get("name"),
      region: get("region") || undefined,
      city: get("city") || undefined,
      address: get("address") || undefined,
      searchAliases,
    };
  });
}

function loadVisitKoreaCatalog(): {
  rawTotal: number;
  catalog: VisitKoreaGolfEntry[];
} {
  if (fs.existsSync(IMAGES_PATH)) {
    const imagesFile = JSON.parse(fs.readFileSync(IMAGES_PATH, "utf8")) as {
      totalCount?: number;
      items: VisitKoreaGolfEntry[];
    };
    const rawTotal = fs.existsSync(RAW_PATH)
      ? ((JSON.parse(fs.readFileSync(RAW_PATH, "utf8")) as { totalCount?: number })
          .totalCount ?? imagesFile.items.length)
      : imagesFile.items.length;
    return { rawTotal, catalog: imagesFile.items };
  }

  throw new Error(
    "data/visit-korea-golf-images.json not found. Run npm run fetch:visit-korea-golf-catalog first.",
  );
}

function countByConfidence(
  results: VisitKoreaImageMatchResult[],
): Record<ImageMatchConfidence, number> {
  const counts: Record<ImageMatchConfidence, number> = {
    exact: 0,
    high: 0,
    medium: 0,
    low: 0,
    ambiguous: 0,
  };

  for (const result of results) {
    if (!result.best) continue;
    counts[result.best.scores.imageMatchConfidence] += 1;
  }

  return counts;
}

function buildAuditReport(input: {
  rawTotal: number;
  catalogWithImages: number;
  golfMapTotal: number;
  results: VisitKoreaImageMatchResult[];
  appliedCount: number;
  reviewCount: number;
}): string {
  const confidenceCounts = countByConfidence(input.results);
  const matchedAny = input.results.filter((result) => result.best).length;
  const autoApplied = input.results.filter((result) => result.best?.scores.autoApply);
  const failedNameSimilar = input.results
    .filter((result) => !result.best)
    .flatMap((result) => {
      return input.results
        .filter((candidate) => candidate.courseId === result.courseId)
        .slice(0, 0);
    });

  const nearMisses: Array<{
    courseName: string;
    courseId: string;
    visitTitle: string;
    fuzzy: number;
    reason: string;
  }> = [];

  for (const result of input.results) {
    if (result.best?.scores.autoApply) continue;
    const topAlt = result.best ?? result.alternatives[0];
    if (!topAlt) continue;
    if (topAlt.scores.fuzzyScore >= 0.72) {
      nearMisses.push({
        courseName: result.courseName,
        courseId: result.courseId,
        visitTitle: topAlt.visitKoreaTitle,
        fuzzy: topAlt.scores.fuzzyScore,
        reason: topAlt.scores.imageMatchConfidence,
      });
    }
  }

  const reviewItems = input.results
    .filter((result) => result.best && !result.best.scores.autoApply)
    .map((result) => result.best!);

  const ambiguousItems = input.results
    .filter(
      (result) =>
        result.best?.scores.imageMatchConfidence === "ambiguous",
    )
    .map((result) => result.best!);

  const lines = [
    "# Visit Korea Image Match Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Visit Korea 골프장 전체 개수 (raw): **${input.rawTotal}**`,
    `- Visit Korea 이미지 보유 골프장 개수: **${input.catalogWithImages}**`,
    `- GolfMap 코스 전체 개수: **${input.golfMapTotal}**`,
    `- GolfMap ↔ Visit Korea 후보 매칭 성공(이미지 有): **${matchedAny}**`,
    `- 자동 적용(exact/high/조건부 medium): **${input.appliedCount}**`,
    `- review 필요 후보: **${input.reviewCount}**`,
    "",
    "### imageMatchConfidence counts (best match per course)",
    "",
    `- exact: ${confidenceCounts.exact}`,
    `- high: ${confidenceCounts.high}`,
    `- medium: ${confidenceCounts.medium}`,
    `- low: ${confidenceCounts.low}`,
    `- ambiguous: ${confidenceCounts.ambiguous}`,
    "",
    "## 매칭 실패 상위 원인",
    "",
    "1. Visit Korea 카탈로그에 해당 골프장 이미지가 없음",
    "2. 이름 표기 차이(CC/GC/컨트리클럽/띄어쓰기/영문 표기)로 fuzzy 점수 부족",
    "3. 주소·시군구 불일치로 medium 이상 조건 미충족",
    "4. 유사 후보 2건 이상으로 ambiguous 처리",
    "5. 기존 blog visit-korea-meta 수동 매칭만 존재하던 소수 코스",
    "",
    "## 사람이 확인해야 할 ambiguous 후보",
    "",
  ];

  if (ambiguousItems.length === 0) {
    lines.push("- 없음");
  } else {
    for (const item of ambiguousItems) {
      lines.push(
        `- ${item.courseName} (\`${item.courseId}\`) ↔ ${item.visitKoreaTitle} (\`${item.visitKoreaContentId}\`)`,
      );
    }
  }

  lines.push("", "## review 후보 (low / medium / ambiguous)", "");
  if (reviewItems.length === 0) {
    lines.push("- 없음");
  } else {
    for (const item of reviewItems.slice(0, 80)) {
      lines.push(
        `- [${item.scores.imageMatchConfidence}] ${item.courseName} (\`${item.courseId}\`) ↔ ${item.visitKoreaTitle} — fuzzy ${item.scores.fuzzyScore.toFixed(2)}, addr ${item.scores.addressMatch.toFixed(2)}`,
      );
    }
    if (reviewItems.length > 80) {
      lines.push(`- … 외 ${reviewItems.length - 80}건 (data/visit-korea-golf-image-review.json 참고)`);
    }
  }

  lines.push("", "## 이름은 비슷하지만 자동 적용되지 않은 후보", "");
  if (nearMisses.length === 0) {
    lines.push("- 없음");
  } else {
    for (const item of nearMisses.slice(0, 40)) {
      lines.push(
        `- ${item.courseName} (\`${item.courseId}\`) ↔ ${item.visitTitle} — fuzzy ${item.fuzzy.toFixed(2)} (${item.reason})`,
      );
    }
  }

  lines.push("", "## 다음 수동 확인 권장 목록", "");
  lines.push("- ambiguous 후보 전체");
  lines.push("- medium 후보 중 주소 overlap < 0.4");
  lines.push("- blog visit-korea-meta에만 있고 자동 매칭 실패한 코스");
  lines.push("");

  return lines.join("\n");
}

async function main(): Promise<void> {
  const courses = loadCoursesFromCsv();
  const { rawTotal, catalog } = loadVisitKoreaCatalog();
  const results = matchAllCoursesToVisitKorea(courses, catalog);

  const applied = results
    .filter((result) => result.best?.scores.autoApply)
    .map((result) => ({
      courseId: result.courseId,
      courseName: result.courseName,
      visitKoreaContentId: result.best!.visitKoreaContentId,
      visitKoreaTitle: result.best!.visitKoreaTitle,
      images: result.best!.images,
      imageMatchConfidence: result.best!.scores.imageMatchConfidence,
      scores: result.best!.scores,
      appliedAt: new Date().toISOString(),
    }));

  const review = results
    .filter((result) => result.best && !result.best.scores.autoApply)
    .map((result) => ({
      courseId: result.courseId,
      courseName: result.courseName,
      best: result.best,
      alternatives: result.alternatives,
    }));

  fs.mkdirSync(path.dirname(MATCHES_PATH), { recursive: true });
  fs.writeFileSync(
    MATCHES_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        golfMapTotal: courses.length,
        visitKoreaWithImages: catalog.length,
        results,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  fs.writeFileSync(
    APPLIED_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        appliedCount: applied.length,
        items: applied,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  fs.writeFileSync(
    REVIEW_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        reviewCount: review.length,
        items: review,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const report = buildAuditReport({
    rawTotal,
    catalogWithImages: catalog.length,
    golfMapTotal: courses.length,
    results,
    appliedCount: applied.length,
    reviewCount: review.length,
  });

  fs.mkdirSync(path.dirname(AUDIT_REPORT_PATH), { recursive: true });
  fs.writeFileSync(AUDIT_REPORT_PATH, report, "utf8");

  console.log("=== Visit Korea image match audit ===");
  console.log(`visitKoreaRaw=${rawTotal}`);
  console.log(`visitKoreaWithImages=${catalog.length}`);
  console.log(`golfMapCourses=${courses.length}`);
  console.log(`autoApplied=${applied.length}`);
  console.log(`review=${review.length}`);
  console.log(`saved: ${MATCHES_PATH}`);
  console.log(`saved: ${APPLIED_PATH}`);
  console.log(`saved: ${AUDIT_REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
