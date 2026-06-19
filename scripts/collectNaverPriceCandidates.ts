import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { checkGeocodingEnvKeys, loadEnvLocal } from "./lib/envUtils";
import {
  NAVER_PRICE_CANDIDATE_HEADERS,
  NAVER_PRICE_REVIEW_HEADERS,
  buildReviewRowsFromCandidates,
  buildSearchQueries,
  candidateToCells,
  computeConfidence,
  getNaverMapSearchUrl,
  getNaverSearchUrl,
  loadCoursesFromCourseLinks,
  normalizeCsvHeader,
  parsePriceText,
  pickBestLocalItem,
  rowCellsToCandidate,
  searchNaverLocal,
  stripHtml,
  warnMojibakeInFields,
  type CourseInput,
  type NaverPriceCandidateRow,
} from "./lib/naverPriceCandidates";
import {
  buildScrapeCandidateRow,
  scrapeNaverSearchWithPlaywright,
} from "./lib/naverPlaywrightScraper";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const FINAL_IMPORT_CSV = path.join(
  ROOT,
  "data/golf_courses_import_geocoded_final.csv",
);
const COURSE_LINKS_CSV = path.join(ROOT, "data/enrichment/course_links.csv");
const CANDIDATES_CSV = path.join(
  ROOT,
  "data/enrichment/naver_price_candidates.csv",
);
const REVIEW_CSV = path.join(ROOT, "data/enrichment/naver_price_review.csv");

const API_RATE_LIMIT_MS = 350;
const DEFAULT_DELAY_MS = 3000;
const DEFAULT_SCRAPE_TIMEOUT_MS = 30_000;
const MAX_SCRAPE_WITHOUT_LIMIT = 20;

interface CliOptions {
  limit?: number;
  offset: number;
  force: boolean;
  dryRun: boolean;
  only?: string;
  scrape: boolean;
  delayMs: number;
  headful: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    offset: 0,
    force: false,
    dryRun: false,
    scrape: false,
    delayMs: DEFAULT_DELAY_MS,
    headful: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--force") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--scrape") {
      options.scrape = true;
    } else if (arg === "--headful") {
      options.headful = true;
    } else if (arg === "--no-scrape") {
      options.scrape = false;
    } else if (arg === "--limit") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("--limit requires a positive integer.");
      }
      options.limit = value;
      i += 1;
    } else if (arg === "--offset") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--offset requires a non-negative integer.");
      }
      options.offset = value;
      i += 1;
    } else if (arg === "--only") {
      const value = argv[i + 1]?.trim();
      if (!value) throw new Error("--only requires a search substring.");
      options.only = value;
      i += 1;
    } else if (arg === "--delay-ms") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 500) {
        throw new Error("--delay-ms requires an integer >= 500.");
      }
      options.delayMs = value;
      i += 1;
    }
  }

  return options;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emptyCandidateFields(): Pick<
  NaverPriceCandidateRow,
  | "candidate_phone"
  | "candidate_homepage_url"
  | "candidate_price_text"
  | "candidate_price_min"
  | "candidate_price_max"
  | "candidate_price_type"
> {
  return {
    candidate_phone: "",
    candidate_homepage_url: "",
    candidate_price_text: "",
    candidate_price_min: "",
    candidate_price_max: "",
    candidate_price_type: "unknown",
  };
}

function loadExistingCandidates(): Map<string, NaverPriceCandidateRow> {
  const map = new Map<string, NaverPriceCandidateRow>();
  if (!fs.existsSync(CANDIDATES_CSV)) return map;

  const encoding = readCsvWithEncodingGuess(CANDIDATES_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));

  for (const cells of parsed.rows) {
    const row = rowCellsToCandidate(cells, headers);
    if (!row.id) continue;
    map.set(row.id, row);
  }

  return map;
}

function writeCandidatesFile(rows: NaverPriceCandidateRow[]): void {
  const csvBody = rowsToCsv(
    [...NAVER_PRICE_CANDIDATE_HEADERS],
    rows.map(candidateToCells),
    { crlf: true },
  );
  writeFileUtf8Bom(CANDIDATES_CSV, csvBody);
}

function writeReviewFile(candidates: NaverPriceCandidateRow[]): void {
  const reviewRows = buildReviewRowsFromCandidates(candidates);
  const csvBody = rowsToCsv(
    [...NAVER_PRICE_REVIEW_HEADERS],
    reviewRows,
    { crlf: true },
  );
  writeFileUtf8Bom(REVIEW_CSV, csvBody);
}

function createSearchUrlCandidate(
  course: CourseInput,
  query: string,
  collectedAt: string,
): NaverPriceCandidateRow {
  const { confidence, reason } = computeConfidence(course, {
    title: "",
    address: "",
    priceText: "",
  });

  return {
    id: course.id,
    name: course.name,
    address: course.address,
    query,
    source: "naver_search",
    candidate_title: "",
    candidate_address: "",
    ...emptyCandidateFields(),
    candidate_confidence: confidence,
    needs_review: "true",
    reason: `NAVER API 미사용 — ${reason}. source_url에서 수동 확인`,
    source_url: getNaverSearchUrl(query),
    collected_at: collectedAt,
  };
}

async function collectWithApi(
  course: CourseInput,
  clientId: string,
  clientSecret: string,
): Promise<NaverPriceCandidateRow | null> {
  const queries = buildSearchQueries(course);
  const collectedAt = new Date().toISOString();

  for (const query of queries) {
    try {
      const items = await searchNaverLocal(query, clientId, clientSecret);
      await sleep(API_RATE_LIMIT_MS);

      const best = pickBestLocalItem(course, items);
      if (!best) continue;

      const title = stripHtml(best.title);
      const candidateAddress = best.roadAddress || best.address || "";
      const phone = best.telephone?.trim() ?? "";
      const priceText = stripHtml(best.description);
      const parsedPrice = parsePriceText(priceText);
      const { confidence, reason } = computeConfidence(course, {
        title,
        address: candidateAddress,
        priceText: parsedPrice.priceText,
        phone,
      });

      const sourceUrl =
        best.link || getNaverMapSearchUrl(query) || getNaverSearchUrl(query);

      return {
        id: course.id,
        name: course.name,
        address: course.address,
        query,
        source: "naver_place",
        candidate_title: title,
        candidate_address: candidateAddress,
        candidate_phone: phone,
        candidate_homepage_url: "",
        candidate_price_text: parsedPrice.priceText,
        candidate_price_min:
          parsedPrice.min !== undefined ? String(parsedPrice.min) : "",
        candidate_price_max:
          parsedPrice.max !== undefined ? String(parsedPrice.max) : "",
        candidate_price_type: parsedPrice.type,
        candidate_confidence: confidence,
        needs_review: "true",
        reason: parsedPrice.priceText
          ? reason
          : `${reason}. Naver Local API에는 가격 미포함 — Playwright 또는 수동 확인`,
        source_url: sourceUrl,
        collected_at: collectedAt,
      };
    } catch {
      await sleep(API_RATE_LIMIT_MS);
    }
  }

  return null;
}

async function collectWithScrape(
  course: CourseInput,
  headful: boolean,
  timeoutMs: number,
): Promise<NaverPriceCandidateRow> {
  const collectedAt = new Date().toISOString();
  const attempt = await scrapeNaverSearchWithPlaywright(course, {
    headful,
    timeoutMs,
  });

  if (!attempt) {
    const fallback = createSearchUrlCandidate(
      course,
      course.name,
      collectedAt,
    );
    fallback.reason = "Playwright scrape failed — search URL fallback";
    fallback.candidate_confidence = "low";
    return fallback;
  }

  return buildScrapeCandidateRow(course, attempt, collectedAt);
}

async function collectForCourse(
  course: CourseInput,
  options: CliOptions,
  hasNaverApi: boolean,
  clientId: string,
  clientSecret: string,
): Promise<NaverPriceCandidateRow> {
  const primaryQuery = buildSearchQueries(course)[0] ?? course.name;
  const collectedAt = new Date().toISOString();

  if (options.scrape) {
    return collectWithScrape(course, options.headful, DEFAULT_SCRAPE_TIMEOUT_MS);
  }

  if (hasNaverApi) {
    const apiRow = await collectWithApi(course, clientId, clientSecret);
    if (apiRow) return apiRow;
  }

  return createSearchUrlCandidate(course, primaryQuery, collectedAt);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const env = loadEnvLocal(ROOT);
  const keys = checkGeocodingEnvKeys(ROOT);
  const hasNaverApi = keys.naverClientId && keys.naverClientSecret;
  const clientId = env.NAVER_CLIENT_ID?.trim() ?? "";
  const clientSecret = env.NAVER_CLIENT_SECRET?.trim() ?? "";

  let courses = loadCoursesFromCourseLinks(COURSE_LINKS_CSV, FINAL_IMPORT_CSV);

  if (options.only) {
    const needle = options.only.toLowerCase();
    courses = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(needle) ||
        course.id.toLowerCase().includes(needle),
    );
  }

  courses = courses.slice(options.offset);
  if (options.limit !== undefined) {
    courses = courses.slice(0, options.limit);
  }

  if (options.scrape && options.limit === undefined && courses.length > MAX_SCRAPE_WITHOUT_LIMIT) {
    console.warn(
      `[warn] --scrape without --limit: capping to ${MAX_SCRAPE_WITHOUT_LIMIT} courses. Use --limit explicitly.`,
    );
    courses = courses.slice(0, MAX_SCRAPE_WITHOUT_LIMIT);
  }

  const existing = loadExistingCandidates();
  const outputById = new Map(existing);

  if (options.force) {
    for (const course of courses) {
      outputById.delete(course.id);
    }
  }

  const toCollect = courses.filter(
    (course) => options.force || !outputById.has(course.id),
  );

  console.log("");
  console.log("=== Naver price candidate collection ===");
  console.log(`Courses in scope : ${courses.length}`);
  console.log(`To collect       : ${toCollect.length}`);
  console.log(`Resume skip      : ${courses.length - toCollect.length}`);
  console.log(`Naver API        : ${hasNaverApi ? "enabled" : "disabled"}`);
  console.log(`Playwright scrape: ${options.scrape ? "enabled" : "disabled (use --scrape)"}`);
  if (options.scrape) {
    console.log(`Headful          : ${options.headful ? "yes" : "no"}`);
    console.log(`Delay between    : ${options.delayMs}ms`);
  }
  console.log(`Dry run          : ${options.dryRun ? "yes" : "no"}`);
  console.log(`Output candidates: ${CANDIDATES_CSV}`);
  console.log(`Output review    : ${REVIEW_CSV}`);
  console.log("");

  if (options.dryRun) {
    for (const course of toCollect.slice(0, 5)) {
      console.log(`[dry-run] ${course.id} ${course.name}`);
      console.log(`  scrape queries: ${course.name} | ${course.name} 골프장`);
    }
    if (toCollect.length > 5) {
      console.log(`[dry-run] ... and ${toCollect.length - 5} more`);
    }
    return;
  }

  let collected = 0;
  let failed = 0;

  for (const course of toCollect) {
    try {
      let row: NaverPriceCandidateRow | null = null;
      let lastError: unknown;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          row = await collectForCourse(
            course,
            options,
            hasNaverApi,
            clientId,
            clientSecret,
          );
          break;
        } catch (error) {
          lastError = error;
          if (attempt === 0 && options.scrape) {
            console.warn(`[retry] ${course.name}: retrying once...`);
            await sleep(options.delayMs);
          }
        }
      }

      if (!row) {
        throw lastError instanceof Error
          ? lastError
          : new Error(String(lastError));
      }

      warnMojibakeInFields(
        [
          row.name,
          row.address,
          row.candidate_title,
          row.candidate_address,
          row.candidate_phone,
        ],
        `${course.id}`,
      );
      outputById.set(course.id, row);
      collected += 1;

      const allRows = [...outputById.values()].sort((a, b) =>
        a.name.localeCompare(b.name, "ko"),
      );
      writeCandidatesFile(allRows);
      writeReviewFile(allRows);

      const extras = [
        row.candidate_phone && `phone=${row.candidate_phone}`,
        row.candidate_homepage_url && "homepage",
        row.candidate_price_text && `price=${row.candidate_price_text.slice(0, 30)}`,
      ]
        .filter(Boolean)
        .join(", ");

      console.log(
        `[ok] ${course.name} → ${row.candidate_title || "(search URL)"} (${row.candidate_confidence})${extras ? ` [${extras}]` : ""}`,
      );

      if (toCollect.indexOf(course) < toCollect.length - 1) {
        await sleep(options.scrape ? options.delayMs : API_RATE_LIMIT_MS);
      }
    } catch (error) {
      failed += 1;
      console.error(
        `[error] ${course.id} ${course.name}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  const finalRows = [...outputById.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "ko"),
  );
  writeCandidatesFile(finalRows);
  writeReviewFile(finalRows);

  const written = fs.readFileSync(CANDIDATES_CSV);
  const hasBom =
    written.length >= 3 &&
    written[0] === 0xef &&
    written[1] === 0xbb &&
    written[2] === 0xbf;

  console.log("");
  console.log("=== Collection complete ===");
  console.log(`Collected this run: ${collected}`);
  console.log(`Failed this run   : ${failed}`);
  console.log(`Total candidates  : ${finalRows.length}`);
  console.log(`Encoding          : UTF-8 with BOM (${hasBom ? "verified" : "missing"})`);
  console.log(`Line endings      : CRLF`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
