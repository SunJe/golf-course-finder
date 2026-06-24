import {
  EXPECTED_ROW_COUNT,
  UPLOAD_CSV_COLUMNS,
  UPLOAD_CSV_PATH,
  loadSchemaColumns,
  loadUploadCsvRows,
  getExcludedCsvColumns,
  parseSeoAliases,
} from "./lib/golfCoursesSupabaseUpload";

interface AuditIssue {
  level: "critical" | "warning" | "info";
  message: string;
}

function audit(): { issues: AuditIssue[]; stats: Record<string, number | string> } {
  const issues: AuditIssue[] = [];
  const schemaColumns = loadSchemaColumns();
  const { headers, rows } = loadUploadCsvRows();

  const stats: Record<string, number | string> = {
    rowCount: rows.length,
    expectedRowCount: EXPECTED_ROW_COUNT,
  };

  if (rows.length !== EXPECTED_ROW_COUNT) {
    issues.push({
      level: "critical",
      message: `Row count ${rows.length} !== expected ${EXPECTED_ROW_COUNT}`,
    });
  }

  const ids = new Set<string>();
  let duplicateCount = 0;
  let missingId = 0;
  let missingName = 0;
  let missingLat = 0;
  let missingLng = 0;
  let emptyPriceMin = 0;
  let emptyPriceMax = 0;
  let priceMinGtMax = 0;
  let priceTextMismatch = 0;
  let emptySeoAliases = 0;
  let emptySearchKeywords = 0;
  let changeNameToCount = 0;
  let seoAliasesParseError = 0;

  for (const row of rows) {
    const id = (row.id ?? "").trim();
    const name = (row.name ?? "").trim();

    if (!id) {
      missingId += 1;
      continue;
    }
    if (!name) missingName += 1;

    if (ids.has(id)) duplicateCount += 1;
    else ids.add(id);

    const lat = (row.latitude ?? "").trim();
    const lng = (row.longitude ?? "").trim();
    if (!lat) missingLat += 1;
    if (!lng) missingLng += 1;

    const priceMinRaw = (row.price_min ?? "").trim();
    const priceMaxRaw = (row.price_max ?? "").trim();
    if (!priceMinRaw) emptyPriceMin += 1;
    if (!priceMaxRaw) emptyPriceMax += 1;

    if (priceMinRaw && priceMaxRaw) {
      const priceMin = Number(priceMinRaw);
      const priceMax = Number(priceMaxRaw);
      if (Number.isFinite(priceMin) && Number.isFinite(priceMax) && priceMin > priceMax) {
        priceMinGtMax += 1;
      }
    }

    const priceText = (row.price_text ?? "").trim();
    if (priceText && priceMinRaw && priceMaxRaw) {
      const priceMin = Number(priceMinRaw);
      const priceMax = Number(priceMaxRaw);
      if (Number.isFinite(priceMin) && Number.isFinite(priceMax)) {
        const minStr = priceMin.toLocaleString("ko-KR");
        const maxStr = priceMax.toLocaleString("ko-KR");
        const hasMin = priceText.includes(minStr);
        const hasMax = priceText.includes(maxStr);
        if (!hasMin && !hasMax) priceTextMismatch += 1;
      }
    }

    const changeNameTo = (row.change_name_to ?? "").trim();
    if (changeNameTo) changeNameToCount += 1;

    const seoAliasesRaw = (row.seo_aliases ?? "").trim();
    if (!seoAliasesRaw) {
      emptySeoAliases += 1;
    } else {
      const parsed = parseSeoAliases(seoAliasesRaw);
      if (!parsed || parsed.length === 0) seoAliasesParseError += 1;
      else if (seoAliasesRaw.includes("|")) {
        const pipeParts = seoAliasesRaw.split("|").map((part) => part.trim()).filter(Boolean);
        if (pipeParts.length !== parsed.length) seoAliasesParseError += 1;
      }
    }

    const searchKeywords = (row.search_keywords ?? "").trim();
    if (!searchKeywords) emptySearchKeywords += 1;
  }

  stats.duplicateIds = duplicateCount;
  stats.missingId = missingId;
  stats.missingName = missingName;
  stats.missingLatitude = missingLat;
  stats.missingLongitude = missingLng;
  stats.emptyPriceMin = emptyPriceMin;
  stats.emptyPriceMax = emptyPriceMax;
  stats.priceMinGtMax = priceMinGtMax;
  stats.priceTextMismatch = priceTextMismatch;
  stats.emptySeoAliases = emptySeoAliases;
  stats.emptySearchKeywords = emptySearchKeywords;
  stats.changeNameToCount = changeNameToCount;
  stats.seoAliasesParseError = seoAliasesParseError;

  const aliasColumns = ["change_name_to", "seo_aliases", "search_keywords"];
  const aliasExcluded = aliasColumns.filter((column) => !schemaColumns.has(column));
  if (aliasExcluded.length > 0) {
    issues.push({
      level: "critical",
      message: `SEO alias columns missing from DB schema: ${aliasExcluded.join(", ")}`,
    });
  }

  if (duplicateCount > 0) {
    issues.push({
      level: "critical",
      message: `Duplicate id count: ${duplicateCount}`,
    });
  }
  if (missingId > 0) {
    issues.push({
      level: "critical",
      message: `Rows missing id: ${missingId}`,
    });
  }
  if (missingName > 0) {
    issues.push({
      level: "critical",
      message: `Rows missing name: ${missingName}`,
    });
  }
  if (missingLat > 0 || missingLng > 0) {
    issues.push({
      level: "critical",
      message: `Rows missing latitude (${missingLat}) or longitude (${missingLng}) — schema NOT NULL`,
    });
  }
  if (priceMinGtMax > 0) {
    issues.push({
      level: "critical",
      message: `Rows with price_min > price_max: ${priceMinGtMax}`,
    });
  }

  const excluded = getExcludedCsvColumns(headers, schemaColumns);
  stats.excludedColumns = excluded.join(", ") || "(none)";
  if (excluded.length > 0) {
    issues.push({
      level: "warning",
      message: `CSV columns not in DB schema: ${excluded.join(", ")}`,
    });
  }

  if (headers.includes("avg_score")) {
    issues.push({
      level: "critical",
      message: "avg_score column present in CSV but not in upload schema",
    });
  }

  const teescannerCols = headers.filter((header) => header.startsWith("teescanner_"));
  const teescannerWithoutDb = teescannerCols.filter(
    (header) => !schemaColumns.has(header),
  );
  if (teescannerWithoutDb.length > 0) {
    issues.push({
      level: "critical",
      message: `teescanner_* columns without DB column: ${teescannerWithoutDb.join(", ")}`,
    });
  }

  const missingExpectedHeaders = UPLOAD_CSV_COLUMNS.filter(
    (column) => !headers.includes(column),
  );
  if (missingExpectedHeaders.length > 0) {
    issues.push({
      level: "warning",
      message: `Missing expected upload headers: ${missingExpectedHeaders.join(", ")}`,
    });
  }

  if (emptyPriceMin > 0 || emptyPriceMax > 0) {
    issues.push({
      level: "info",
      message: `Empty price_min: ${emptyPriceMin}, empty price_max: ${emptyPriceMax}`,
    });
  }
  if (priceTextMismatch > 0) {
    issues.push({
      level: "info",
      message: `price_text vs price_min/max possible mismatch: ${priceTextMismatch} row(s)`,
    });
  }
  if (emptySeoAliases > 0) {
    issues.push({
      level: "info",
      message: `Empty seo_aliases: ${emptySeoAliases} row(s)`,
    });
  }
  if (emptySearchKeywords > 0) {
    issues.push({
      level: "info",
      message: `Empty search_keywords: ${emptySearchKeywords} row(s)`,
    });
  }
  if (seoAliasesParseError > 0) {
    issues.push({
      level: "critical",
      message: `seo_aliases delimiter/array conversion errors: ${seoAliasesParseError} row(s)`,
    });
  }
  issues.push({
    level: "info",
    message: `change_name_to non-empty: ${changeNameToCount} row(s)`,
  });

  return { issues, stats };
}

function main(): void {
  console.log("");
  console.log("=== Golf courses Supabase upload audit ===");
  console.log(`input: ${UPLOAD_CSV_PATH}`);
  console.log("");

  const { issues, stats } = audit();

  for (const [key, value] of Object.entries(stats)) {
    console.log(`${key}: ${value}`);
  }

  console.log("");
  console.log("--- Issues ---");
  if (issues.length === 0) {
    console.log("(none)");
  } else {
    for (const issue of issues) {
      console.log(`[${issue.level}] ${issue.message}`);
    }
  }

  const critical = issues.filter((issue) => issue.level === "critical");
  console.log("");
  if (critical.length > 0) {
    console.log(`AUDIT FAILED — ${critical.length} critical issue(s)`);
    process.exitCode = 1;
  } else {
    console.log("AUDIT PASSED");
  }
}

main();
