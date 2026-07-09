/**
 * GolfMap content quality audit (read-only).
 * Usage: npm run audit:content
 */
import fs from "node:fs";
import path from "node:path";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { COLLECTION_SLUGS, getCollectionBySlug } from "@/lib/collectionLanding";
import { resolveBlogItemDescription } from "@/lib/enrichBlogPost";
import { looksLikeSoftParticleTemplate } from "@/lib/koreanParticles";
import enrichmentFile from "@/data/course-content-enrichment.json";
import type { CourseContentEnrichmentFile } from "@/lib/enrichment/courseContentEnrichmentTypes";

type Severity = "error" | "warning";

type Finding = {
  severity: Severity;
  type: string;
  source: string;
  id?: string;
  message: string;
  autoFixed?: boolean;
};

const findings: Finding[] = [];

function add(
  severity: Severity,
  type: string,
  source: string,
  message: string,
  id?: string,
) {
  findings.push({ severity, type, source, id, message, autoFixed: false });
}

function auditBlogs() {
  const slugs = new Set<string>();
  for (const post of BLOG_POSTS) {
    if (slugs.has(post.slug)) {
      add("error", "duplicate_slug", "blogPosts", `duplicate slug ${post.slug}`, post.slug);
    }
    slugs.add(post.slug);

    const titleMatch = post.title.match(/(\d+)\s*곳|BEST\s*(\d+)|TOP\s*(\d+)/i);
    if (titleMatch) {
      const claimed = Number(titleMatch[1] || titleMatch[2] || titleMatch[3]);
      const courseItems = post.sections.flatMap((s) => s.items ?? []).filter(
        (item) => Boolean(item.relatedCourseId),
      );
      if (courseItems.length > 0 && courseItems.length !== claimed) {
        add(
          "warning",
          "title_count_mismatch",
          "blogPosts",
          `title claims ${claimed} but relatedCourseId items=${courseItems.length}`,
          post.slug,
        );
      }
    }

    if (/BEST|가장 저렴|초보자에게 가장/.test(post.title) && !post.sections.some((s) => /선정 기준|비교 기준|자료 확인/.test(s.heading))) {
      add(
        "warning",
        "best_without_criteria",
        "blogPosts",
        "BEST/최상급 표현이 있으나 선정·자료 기준 섹션이 약함",
        post.slug,
      );
    }

    const text = JSON.stringify(post.sections);
    if (looksLikeSoftParticleTemplate(text)) {
      add("error", "soft_particle", "blogPosts", "은(는)/이(가) soft josa in blog", post.slug);
    }
    if (/사계절 아름다운|자연 경관이 아름다운 코스|한국 최초의 퍼블릭/.test(text)) {
      add(
        "warning",
        "tourist_copy_suspect",
        "blogPosts",
        "관광·홍보성 또는 외부 소개 의심 문구",
        post.slug,
      );
    }
    if (/\d+%|점유율|상위 100/.test(text) && !(post.references && post.references.length > 0)) {
      add(
        "warning",
        "unsourced_stats",
        "blogPosts",
        "통계성 수치인데 references 없음",
        post.slug,
      );
    }

    for (const section of post.sections) {
      for (const item of section.items ?? []) {
        if (item.relatedCourseId && item.relatedCollectionSlug) {
          add(
            "warning",
            "mixed_item_links",
            "blogPosts",
            `item '${item.title}' has both course and collection link`,
            post.slug,
          );
        }
        // Visit Korea overview append 회귀 방지: 수동 description이 있으면
        // enrichment는 overview를 붙이지 않아야 한다 (런타임 정책과 동일 가정).
        const manual = item.description?.trim();
        if (
          manual &&
          /한국 최초의 퍼블릭|반세기의 역사|개나리|아카시아 향기|하얀 눈꽃/.test(
            manual,
          )
        ) {
          add(
            "warning",
            "manual_description_has_tourist_overview",
            "blogPosts",
            `item '${item.title}' 수동 description에 Visit Korea 홍보 overview 의심 문구`,
            post.slug,
          );
        }
      }
    }
  }
}

function auditEnrichment() {
  const store = enrichmentFile as CourseContentEnrichmentFile;
  let soft = 0;
  let regionDup = 0;
  let genericReasons = 0;
  for (const item of Object.values(store.items ?? {})) {
    if (looksLikeSoftParticleTemplate(item.featureSummary ?? "")) {
      soft += 1;
    }
    if (/충청·충주|경기·용인|전라·전북/.test(item.featureSummary ?? "")) {
      regionDup += 1;
    }
    for (const reason of item.recommendationReasons ?? []) {
      if (/라운드 후보를 비교할 때 참고할 수 있는 골프장|규모 정보를 확인할 수 있습니다/.test(reason)) {
        genericReasons += 1;
        break;
      }
    }
  }
  add(
    "warning",
    "soft_particle_enrichment_total",
    "course-content-enrichment.json",
    `soft-josa featureSummary count=${soft} (display path regenerates)`,
  );
  add(
    "warning",
    "region_dup_label_total",
    "course-content-enrichment.json",
    `광역·시군 결합 표기 추정 count=${regionDup}`,
  );
  add(
    "warning",
    "generic_recommendation_total",
    "course-content-enrichment.json",
    `generic recommendationReasons count=${genericReasons} (filtered at display)`,
  );
}

function auditCollections() {
  for (const slug of COLLECTION_SLUGS) {
    const config = getCollectionBySlug(slug);
    if (!config) {
      add("error", "missing_collection_config", "collectionLanding", slug, slug);
      continue;
    }
    if (!config.filterSummary || config.filterSummary.length < 20) {
      add(
        "warning",
        "thin_filter_summary",
        "collectionLanding",
        "filterSummary가 비어 있거나 짧음",
        slug,
      );
    }
    if (/가성비 좋은/.test(config.seoDescription)) {
      add(
        "warning",
        "vague_value_claim",
        "collectionLanding",
        "seoDescription에 근거 없는 가성비 표현",
        slug,
      );
    }
  }
}

function auditVisitKoreaOverviewMerge() {
  let manualWithOverview = 0;
  for (const post of BLOG_POSTS) {
    if (!post.visitKoreaMetaDir) continue;
    const metaPath = path.join(
      process.cwd(),
      `public/promo-assets/blog/${post.visitKoreaMetaDir}/visit-korea-meta.json`,
    );
    if (!fs.existsSync(metaPath)) continue;
    const entries = JSON.parse(fs.readFileSync(metaPath, "utf8")) as Array<{
      courseId?: string;
      key?: string;
      overview?: string;
    }>;
    const byCourseId = new Map(
      entries.filter((e) => e.courseId).map((e) => [e.courseId!, e]),
    );
    const byKey = new Map(
      entries.filter((e) => e.key).map((e) => [e.key!, e]),
    );

    for (const section of post.sections) {
      for (const item of section.items ?? []) {
        const meta =
          (item.relatedCourseId
            ? byCourseId.get(item.relatedCourseId)
            : undefined) ??
          (item.visitKoreaKey ? byKey.get(item.visitKoreaKey) : undefined);
        const overview = meta?.overview?.trim();
        const manual = item.description?.trim();
        if (!overview || !manual) continue;
        manualWithOverview += 1;
        const merged = resolveBlogItemDescription(manual, overview);
        if (merged !== manual) {
          add(
            "error",
            "overview_appended_despite_manual",
            "enrichBlogPost",
            `item '${item.title}' — 수동 description이 있어도 overview가 병합됨`,
            post.slug,
          );
        }
        if (merged.includes(overview.slice(0, 48)) && !manual.includes(overview.slice(0, 48))) {
          add(
            "error",
            "duplicate_overview_in_final",
            "enrichBlogPost",
            `item '${item.title}' — 최종 본문에 external overview 중복`,
            post.slug,
          );
        }
      }
    }
  }
  if (manualWithOverview > 0) {
    add(
      "warning",
      "manual_and_overview_pairs",
      "visit-korea-meta",
      `수동 description + overview 동시 존재 ${manualWithOverview}건 (append 금지 정책으로 병합하지 않음)`,
    );
  }
}

function main() {
  console.log("[audit:content] GolfMap content quality audit");
  auditBlogs();
  auditVisitKoreaOverviewMerge();
  auditEnrichment();
  auditCollections();

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");

  for (const f of findings) {
    console.log(
      `[${f.severity}] ${f.type} | ${f.source}${f.id ? ` | ${f.id}` : ""} | ${f.message}`,
    );
  }

  console.log(
    `[audit:content] done — errors=${errors.length} warnings=${warnings.length}`,
  );
  if (errors.length > 0) process.exit(1);
}

main();
