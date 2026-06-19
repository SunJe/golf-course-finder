import path from "node:path";
import {
  loadCourseLinksCsv,
  resolveEnrichmentPath,
  verifyUtf8Bom,
  warnMojibakeInCsvFields,
  writeCourseLinksCsv,
} from "./lib/enrichmentCsvUtils";
import {
  loadNaverPriceReviewCsv,
  resolveApprovedHomepage,
  resolveApprovedPhone,
} from "./lib/naverPriceReviewMerge";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const REVIEW_CSV = resolveEnrichmentPath(
  ROOT,
  "data/enrichment/naver_price_review.csv",
);
const COURSE_LINKS_CSV = resolveEnrichmentPath(
  ROOT,
  "data/enrichment/course_links.csv",
);

interface CliOptions {
  overwrite: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  return { overwrite: argv.includes("--overwrite") };
}

function isValidHttpUrl(value: string): boolean {
  return /^https?:\/\/.+/i.test(value.trim());
}

function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[\d\s\-()+]+$/.test(trimmed);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const reviewRows = loadNaverPriceReviewCsv(REVIEW_CSV);
  const courseLinks = loadCourseLinksCsv(COURSE_LINKS_CSV);
  const linksById = new Map(courseLinks.map((row) => [row.id, row]));

  let phoneMerged = 0;
  let homepageMerged = 0;
  let phoneSkippedExisting = 0;
  let homepageSkippedExisting = 0;
  let unknownIds = 0;

  for (const review of reviewRows) {
    const link = linksById.get(review.id);
    if (!link) {
      unknownIds += 1;
      console.warn(`[warn] Review id "${review.id}" not in course_links.csv — skipped.`);
      continue;
    }

    const approvedPhone = resolveApprovedPhone(review);
    if (approvedPhone) {
      if (!isValidPhone(approvedPhone)) {
        console.warn(
          `[warn] Invalid phone for ${review.id}: ${approvedPhone} — skipped.`,
        );
      } else if (link.phone.trim() && !options.overwrite) {
        phoneSkippedExisting += 1;
      } else {
        link.phone = approvedPhone;
        phoneMerged += 1;
        if (
          review.source_url.trim() &&
          (!link.source_url.trim() || options.overwrite)
        ) {
          link.source_url = review.source_url.trim();
        }
      }
    }

    const approvedHomepage = resolveApprovedHomepage(review);
    if (approvedHomepage) {
      if (!isValidHttpUrl(approvedHomepage)) {
        console.warn(
          `[warn] Invalid homepage for ${review.id}: ${approvedHomepage} — skipped.`,
        );
      } else if (link.homepage_url.trim() && !options.overwrite) {
        homepageSkippedExisting += 1;
      } else {
        link.homepage_url = approvedHomepage;
        homepageMerged += 1;
        if (
          review.source_url.trim() &&
          (!link.source_url.trim() || options.overwrite)
        ) {
          link.source_url = review.source_url.trim();
        }
      }
    }

    warnMojibakeInCsvFields(
      [link.name, link.phone, link.homepage_url, link.note],
      review.id,
    );
  }

  writeCourseLinksCsv(COURSE_LINKS_CSV, courseLinks);

  const hasBom = verifyUtf8Bom(COURSE_LINKS_CSV);

  console.log("");
  console.log("=== Merge approved Naver contacts → course_links.csv ===");
  console.log(`Review rows read     : ${reviewRows.length}`);
  console.log(`Phone merged         : ${phoneMerged}`);
  console.log(`Homepage merged      : ${homepageMerged}`);
  console.log(`Phone skip (existing): ${phoneSkippedExisting}`);
  console.log(`Homepage skip (exist): ${homepageSkippedExisting}`);
  console.log(`Unknown review ids   : ${unknownIds}`);
  console.log(`Overwrite mode       : ${options.overwrite ? "yes" : "no"}`);
  console.log(`Output               : ${COURSE_LINKS_CSV}`);
  console.log(`Encoding             : UTF-8 with BOM (${hasBom ? "verified" : "missing"})`);
  console.log(`Line endings         : CRLF`);
  console.log(`booking_url          : not modified`);
}

main();
