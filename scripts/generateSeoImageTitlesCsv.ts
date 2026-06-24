import fs from "fs";
import path from "path";
import { collectionLandingPages } from "../lib/collectionLanding";
import { regionLandingPages } from "../lib/regionLanding";
import {
  getCollectionSeoImagePath,
  getCourseSeoImagePath,
  getRegionSeoImagePath,
} from "../lib/seoImages";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

export type SeoImageTitleRow = {
  slug: string;
  title: string;
  output_path: string;
  type: "collection" | "region" | "course";
};

const PARENTHESES_SUFFIX =
  /(\((?:퍼블릭|회원제|대중형|대중제|일반|퍼블릭코스|회원|대중|9홀|18홀|파3|나인홀)[^)]*\))$/u;

function stripParentheticalSuffix(value: string): string {
  return value.replace(PARENTHESES_SUFFIX, "").trim();
}

function buildCourseTitle(
  name: string,
  changeNameTo: string,
  duplicateStripped: Set<string>,
): string {
  const preferred = (changeNameTo.trim() || name.trim()).replace(/\s+/g, " ");
  const stripped = stripParentheticalSuffix(preferred);
  if (!stripped) return preferred;
  if (duplicateStripped.has(stripped)) return preferred;
  return stripped;
}

export function buildSeoImageTitleRows(projectRoot: string): SeoImageTitleRow[] {
  const rows: SeoImageTitleRow[] = [];

  for (const page of collectionLandingPages) {
    rows.push({
      slug: page.slug,
      title: page.h1,
      output_path: `public${getCollectionSeoImagePath(page.slug)}`,
      type: "collection",
    });
  }

  for (const page of regionLandingPages) {
    rows.push({
      slug: page.slug,
      title: `${page.label} 골프장`,
      output_path: `public${getRegionSeoImagePath(page.slug)}`,
      type: "region",
    });
  }

  const editCsv = path.join(projectRoot, "data/enrichment/course_enrichment_edit.csv");
  const fallbackCsv = path.join(projectRoot, "data/golf_courses_import_geocoded_final.csv");
  const sourceCsv = fs.existsSync(editCsv) ? editCsv : fallbackCsv;
  const { headers, rows: courseRows } = parseCsv(
    readCsvWithEncodingGuess(sourceCsv).content,
  );

  const idIndex = headers.indexOf("id");
  const nameIndex = headers.indexOf("name");
  const changeIndex = headers.indexOf("change_name_to");
  if (idIndex < 0 || nameIndex < 0) {
    throw new Error(`Missing id/name columns in ${sourceCsv}`);
  }

  const prepared = courseRows
    .map((row) => ({
      id: (row[idIndex] ?? "").trim(),
      name: (row[nameIndex] ?? "").trim(),
      change_name_to:
        changeIndex >= 0 ? (row[changeIndex] ?? "").trim() : "",
    }))
    .filter((row) => row.id && row.name);

  const strippedCounts = new Map<string, number>();
  for (const course of prepared) {
    const preferred = (course.change_name_to || course.name).trim();
    const stripped = stripParentheticalSuffix(preferred);
    const key = stripped || preferred;
    strippedCounts.set(key, (strippedCounts.get(key) ?? 0) + 1);
  }

  const duplicateStripped = new Set(
    [...strippedCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([key]) => key),
  );

  for (const course of prepared) {
    rows.push({
      slug: course.id,
      title: buildCourseTitle(course.name, course.change_name_to, duplicateStripped),
      output_path: `public${getCourseSeoImagePath(course.id)}`,
      type: "course",
    });
  }

  return rows;
}

function main(): void {
  const root = getProjectRoot();
  const rows = buildSeoImageTitleRows(root);
  const outPath = path.join(root, "data/seo-image-titles.csv");

  const csv = rowsToCsv(
    ["slug", "title", "output_path", "type"],
    rows.map((row) => [row.slug, row.title, row.output_path, row.type]),
  );
  writeFileUtf8Bom(outPath, csv);

  const collections = rows.filter((row) => row.type === "collection").length;
  const regions = rows.filter((row) => row.type === "region").length;
  const courses = rows.filter((row) => row.type === "course").length;

  console.log(`Wrote ${outPath}`);
  console.log(`  total: ${rows.length}`);
  console.log(`  collections: ${collections}`);
  console.log(`  regions: ${regions}`);
  console.log(`  courses: ${courses}`);
}

if (require.main === module) {
  main();
}
