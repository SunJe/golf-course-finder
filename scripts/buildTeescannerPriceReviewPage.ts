/**
 * 티스캐너 가격 크롤 수동 검수용 HTML 페이지 생성
 * Usage: npm run build:teescanner-price-review-page
 */
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_DAILY_RESULTS_CSV,
  DEFAULT_SUMMARY_CSV,
  readDailyResults,
} from "./lib/teescanner/batchIo";
import { buildAllSummaries } from "./lib/teescanner/summary";
import {
  DEFAULT_CHECKPOINT_PATH,
  type PriceCheckpointEntry,
} from "./lib/teescanner/batchCheckpoint";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const OUT_HTML = path.join(ROOT, "reports/teescanner-price-review.html");
const OUT_JSON = path.join(ROOT, "data/enrichment/teescanner_price_review.json");
const DECISIONS_PATH = path.join(
  ROOT,
  "data/enrichment/teescanner_price_review_decisions.json",
);

function parseRowRangeArgs(argv: string[]): {
  minRow: number;
  maxRow: number;
  excludeDecided: boolean;
} {
  let minRow = 0;
  let maxRow = Number.POSITIVE_INFINITY;
  let excludeDecided = false;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--min-row") minRow = Number.parseInt(argv[++i] ?? "", 10) || 0;
    else if (argv[i] === "--max-row")
      maxRow = Number.parseInt(argv[++i] ?? "", 10) || Number.POSITIVE_INFINITY;
    else if (argv[i] === "--exclude-decided") excludeDecided = true;
  }
  return { minRow, maxRow, excludeDecided };
}

/** 이미 승인/거부된 courseId 집합 (resolved 파일 기준) */
function loadDecidedCourseIds(): Set<string> {
  const resolvedPath = path.join(
    ROOT,
    "data/enrichment/teescanner_price_review_resolved.json",
  );
  const decided = new Set<string>();
  if (!fs.existsSync(resolvedPath)) return decided;
  try {
    const resolved = JSON.parse(fs.readFileSync(resolvedPath, "utf8")) as {
      approved?: string[];
      rejected?: string[];
    };
    for (const id of resolved.approved ?? []) decided.add(id);
    for (const id of resolved.rejected ?? []) decided.add(id);
  } catch {
    // ignore malformed
  }
  return decided;
}

/** 체크포인트에서 courseId → 최신 rowIndex 매핑 */
function loadCourseRowIndex(): Map<string, number> {
  const map = new Map<string, number>();
  if (!fs.existsSync(DEFAULT_CHECKPOINT_PATH)) return map;
  const lines = fs
    .readFileSync(DEFAULT_CHECKPOINT_PATH, "utf8")
    .split("\n")
    .filter((line) => line.trim());
  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as PriceCheckpointEntry;
      if (entry.golfCourseId) map.set(entry.golfCourseId, entry.rowIndex);
    } catch {
      // skip malformed line
    }
  }
  return map;
}

type ReviewCategory = "priced_manual" | "ambiguous" | "no_match" | "failed";

type ReviewItem = {
  courseId: string;
  courseName: string;
  category: ReviewCategory;
  reviewAction: string;
  matchStatus: string;
  reviewReason: string;
  matchedTitle: string;
  matchedRegion: string;
  searchTerm: string;
  weekdayPrice: string;
  weekendPrice: string;
  overallPrice: string;
  priceScope: string;
  detailUrl: string;
  collectedAt: string;
  hasPrice: boolean;
  weekdayPriceMin: string;
  weekdayPriceMax: string;
  weekendPriceMin: string;
  weekendPriceMax: string;
  overallPriceMin: string;
  overallPriceMax: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPriceRange(min: string, max: string): string {
  const a = min.trim();
  const b = max.trim();
  if (!a && !b) return "가격 없음";
  const fmt = (v: string) => {
    const n = Number.parseInt(v.replace(/,/g, ""), 10);
    return Number.isFinite(n) ? `${n.toLocaleString("ko-KR")}원` : v;
  };
  if (a && b && a !== b) return `${fmt(a)} ~ ${fmt(b)}`;
  return fmt(a || b);
}

function categorize(
  reviewAction: string,
  matchStatus: string,
  hasPrice: boolean,
): ReviewCategory {
  if (hasPrice && reviewAction === "manual_review") return "priced_manual";
  if (matchStatus === "ambiguous") return "ambiguous";
  if (!hasPrice) return "no_match";
  return "failed";
}

function buildItem(row: ReturnType<typeof buildAllSummaries>[number]): ReviewItem {
  const hasPrice = Boolean(row.price_min.trim());
  return {
    courseId: row.id,
    courseName: row.name,
    category: categorize(row.review_action, row.match_status, hasPrice),
    reviewAction: row.review_action,
    matchStatus: row.match_status,
    reviewReason: row.review_reason,
    matchedTitle: row.matched_title || row.candidate_title,
    matchedRegion: [row.candidate_region, row.candidate_subregion].filter(Boolean).join(" > "),
    searchTerm: row.used_search_term || row.primary_search_term,
    weekdayPrice: formatPriceRange(row.weekday_price_min, row.weekday_price_max),
    weekendPrice: formatPriceRange(row.weekend_price_min, row.weekend_price_max),
    overallPrice: formatPriceRange(row.overall_price_min, row.overall_price_max),
    priceScope: row.price_scope_summary,
    detailUrl: row.detail_url,
    collectedAt: row.collected_at || row.last_collected_at,
    hasPrice,
    weekdayPriceMin: row.weekday_price_min,
    weekdayPriceMax: row.weekday_price_max,
    weekendPriceMin: row.weekend_price_min,
    weekendPriceMax: row.weekend_price_max,
    overallPriceMin: row.overall_price_min || row.price_min,
    overallPriceMax: row.overall_price_max || row.price_max,
  };
}

function renderCard(item: ReviewItem): string {
  const badgeClass =
    item.category === "priced_manual"
      ? "badge-priced"
      : item.category === "ambiguous"
        ? "badge-ambiguous"
        : "badge-nomatch";

  const detailLink = item.detailUrl
    ? `<a class="link" href="${escapeHtml(item.detailUrl)}" target="_blank" rel="noopener">티스캐너 상세 열기 ↗</a>`
    : `<span class="muted">티스캐너 상세 URL 없음</span>`;

  return `
  <div class="card" data-course-id="${escapeHtml(item.courseId)}" data-category="${item.category}">
    <div class="card-head">
      <span class="badge ${badgeClass}">${escapeHtml(item.category)}</span>
      <code>${escapeHtml(item.courseId)}</code>
    </div>
    <div class="compare">
      <div class="col">
        <div class="label">GolfMap 골프장</div>
        <div class="name">${escapeHtml(item.courseName)}</div>
        <div class="meta">검색어: ${escapeHtml(item.searchTerm || "-")}</div>
      </div>
      <div class="col">
        <div class="label">티스캐너 매칭</div>
        <div class="name">${escapeHtml(item.matchedTitle || "(매칭 없음)")}</div>
        <div class="meta">${escapeHtml(item.matchedRegion || "-")} · ${escapeHtml(item.matchStatus || "-")}</div>
        <div class="meta reason">${escapeHtml(item.reviewReason || item.reviewAction)}</div>
      </div>
    </div>
    <div class="prices">
      <div><span>평일</span><strong>${escapeHtml(item.weekdayPrice)}</strong></div>
      <div><span>주말</span><strong>${escapeHtml(item.weekendPrice)}</strong></div>
      <div><span>전체</span><strong>${escapeHtml(item.overallPrice)}</strong></div>
      <div><span>범위</span><strong>${escapeHtml(item.priceScope || "-")}</strong></div>
    </div>
    <div class="links">${detailLink}</div>
    <div class="manual-inputs">
      <div class="manual-title">직접 입력 (티스캐너·기타 검색 후)</div>
      <div class="input-grid">
        <label>평일 최저<input type="text" inputmode="numeric" data-field="weekday_min" placeholder="예: 100000" value="${escapeHtml(item.weekdayPriceMin)}" /></label>
        <label>평일 최고<input type="text" inputmode="numeric" data-field="weekday_max" placeholder="예: 150000" value="${escapeHtml(item.weekdayPriceMax)}" /></label>
        <label>주말 최저<input type="text" inputmode="numeric" data-field="weekend_min" placeholder="예: 200000" value="${escapeHtml(item.weekendPriceMin)}" /></label>
        <label>주말 최고<input type="text" inputmode="numeric" data-field="weekend_max" placeholder="예: 250000" value="${escapeHtml(item.weekendPriceMax)}" /></label>
        <label>전체 최저<input type="text" inputmode="numeric" data-field="price_min" placeholder="평일/주말 미입력 시" value="${escapeHtml(item.overallPriceMin)}" /></label>
        <label>전체 최고<input type="text" inputmode="numeric" data-field="price_max" placeholder="평일/주말 미입력 시" value="${escapeHtml(item.overallPriceMax)}" /></label>
      </div>
      <label class="url-label">출처 URL<input type="url" data-field="source_url" placeholder="https://www.teescanner.com/..." value="${escapeHtml(item.detailUrl)}" /></label>
      <label class="note-label">메모<input type="text" data-field="note" placeholder="검색 키워드, 코스명 등" /></label>
    </div>
    <div class="actions">
      <button class="btn btn-approve" onclick="decide('${escapeHtml(item.courseId)}','approve',this)">✅ 가격 승인</button>
      <button class="btn btn-reject" onclick="decide('${escapeHtml(item.courseId)}','reject',this)">❌ 가격 거부</button>
      <button class="btn btn-clear" onclick="decide('${escapeHtml(item.courseId)}','clear',this)">↺ 취소</button>
    </div>
  </div>`;
}

function renderSection(title: string, items: ReviewItem[]): string {
  if (items.length === 0) return `<h2>${title} (0건)</h2><p class="empty">없음</p>`;
  return `<h2>${title} (${items.length}건)</h2>\n${items.map(renderCard).join("\n")}`;
}

function main(): void {
  const { minRow, maxRow, excludeDecided } = parseRowRangeArgs(process.argv.slice(2));
  const rowFilterActive = minRow > 0 || Number.isFinite(maxRow);
  const courseRowIndex = rowFilterActive ? loadCourseRowIndex() : new Map();
  const decidedIds = excludeDecided ? loadDecidedCourseIds() : new Set<string>();

  const inRowRange = (courseId: string): boolean => {
    if (!rowFilterActive) return true;
    const rowIndex = courseRowIndex.get(courseId);
    if (rowIndex == null) return false;
    return rowIndex >= minRow && rowIndex <= maxRow;
  };

  let summaries = buildAllSummaries(readDailyResults(DEFAULT_DAILY_RESULTS_CSV));
  if (rowFilterActive) {
    summaries = summaries.filter((row) => inRowRange(row.id));
  }
  if (excludeDecided) {
    summaries = summaries.filter((row) => !decidedIds.has(row.id));
  }

  const manualItems = summaries
    .filter((row) => row.review_action === "manual_review")
    .map(buildItem);

  const pricedManual = manualItems.filter((item) => item.category === "priced_manual");
  const ambiguous = manualItems.filter((item) => item.category === "ambiguous");
  const noMatch = manualItems.filter((item) => item.category === "no_match");
  const failed = manualItems.filter((item) => item.category === "failed");

  const acceptSpotCheck = summaries
    .filter((row) => row.review_action === "accept_price")
    .map(buildItem)
    .slice(0, 30);

  const rowRangeLabel = rowFilterActive
    ? `행 범위: ${minRow > 0 ? minRow : 1} ~ ${Number.isFinite(maxRow) ? maxRow : "끝"}`
    : "행 범위: 전체";

  const reviewPayload = {
    generatedAt: new Date().toISOString(),
    rowRange: { minRow: minRow > 0 ? minRow : 1, maxRow: Number.isFinite(maxRow) ? maxRow : null },
    stats: {
      manualTotal: manualItems.length,
      pricedManual: pricedManual.length,
      ambiguous: ambiguous.length,
      noMatch: noMatch.length,
      failed: failed.length,
      acceptPrice: summaries.filter((row) => row.review_action === "accept_price").length,
    },
    items: manualItems,
    acceptSpotCheck,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(reviewPayload, null, 2), "utf8");

  if (!fs.existsSync(DECISIONS_PATH)) {
    fs.writeFileSync(
      DECISIONS_PATH,
      JSON.stringify({ approved: [], rejected: [], manualPrices: {} }, null, 2),
      "utf8",
    );
  }

  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>티스캐너 가격 검수</title>
<style>
  body { font-family: -apple-system, "Malgun Gothic", sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
  header { position: sticky; top: 0; background: #1e3a5f; color: #fff; padding: 14px 20px; z-index: 10; }
  header h1 { margin: 0 0 6px; font-size: 18px; }
  header p { margin: 0; font-size: 13px; opacity: .92; line-height: 1.5; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 20px; }
  h2 { margin: 28px 0 12px; font-size: 16px; border-left: 4px solid #2563eb; padding-left: 10px; }
  .empty { color: #64748b; font-size: 14px; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 16px; }
  .card.approved { outline: 3px solid #10b981; }
  .card.rejected { outline: 3px solid #ef4444; opacity: .72; }
  .card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 8px; }
  .badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; color: #fff; }
  .badge-priced { background: #d97706; }
  .badge-ambiguous { background: #dc2626; }
  .badge-nomatch { background: #64748b; }
  code { font-size: 11px; color: #64748b; word-break: break-all; }
  .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .col { background: #f8fafc; border-radius: 10px; padding: 10px; }
  .label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .name { font-size: 15px; font-weight: 700; }
  .meta { font-size: 12px; color: #475569; margin-top: 4px; }
  .reason { color: #b45309; }
  .prices { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
  .prices div { background: #eff6ff; border-radius: 8px; padding: 8px; font-size: 12px; }
  .prices span { display: block; color: #64748b; margin-bottom: 2px; }
  .prices strong { font-size: 13px; }
  .links { margin-bottom: 10px; }
  .manual-inputs { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; margin-bottom: 12px; }
  .manual-title { font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 8px; }
  .input-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
  .manual-inputs label { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #78716c; font-weight: 600; }
  .manual-inputs input { border: 1px solid #d6d3d1; border-radius: 8px; padding: 7px 9px; font-size: 13px; color: #1c1917; background: #fff; }
  .manual-inputs input:focus { outline: 2px solid #f59e0b; border-color: #f59e0b; }
  .url-label, .note-label { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #78716c; font-weight: 600; margin-top: 4px; }
  .link { color: #2563eb; font-size: 13px; font-weight: 600; text-decoration: none; }
  .muted { color: #94a3b8; font-size: 12px; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .btn { border: none; border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .btn-approve { background: #d1fae5; color: #065f46; }
  .btn-reject { background: #fee2e2; color: #991b1b; }
  .btn-clear { background: #f1f5f9; color: #475569; }
  #export-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #0f172a; color: #fff; padding: 12px 20px; display: flex; gap: 12px; align-items: center; }
  #export-bar textarea { flex: 1; height: 52px; font-size: 12px; border-radius: 8px; border: none; padding: 6px; font-family: monospace; }
  #export-bar button { background: #10b981; color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-weight: 700; cursor: pointer; }
  details { margin-top: 24px; }
  summary { cursor: pointer; font-weight: 700; padding: 8px 0; }
  @media (max-width: 720px) {
    .compare, .prices, .input-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<header>
  <h1>티스캐너 가격 검수 <span style="font-size:12px;font-weight:600;opacity:.85;">(${escapeHtml(rowRangeLabel)})</span></h1>
  <p>GolfMap 골프장명과 티스캐너 매칭·가격을 비교해 승인/거부하세요. 가격이 없거나 틀리면 <strong>직접 입력</strong>란에 숫자(원)를 넣고 승인하세요. 하단 결과를 복사해 채팅에 붙여넣으면 됩니다.</p>
</header>
<div class="wrap">
  ${renderSection("🟠 우선: 가격 있음 + 수동 검수", pricedManual)}
  ${renderSection("🔴 매칭 ambiguous", ambiguous)}
  ${renderSection("⚪ 가격 없음 / 미매칭", noMatch)}
  ${renderSection("⚫ 기타 실패", failed)}

  <details>
    <summary>🔵 자동 승인 스팟체크 (${acceptSpotCheck.length}건 샘플) — 펼치기</summary>
    ${acceptSpotCheck.map(renderCard).join("\n")}
  </details>

  <div style="height: 90px;"></div>
</div>

<div id="export-bar">
  <textarea id="export-text" readonly placeholder="승인/거부를 누르면 여기에 결과가 생성됩니다."></textarea>
  <button onclick="copyExport()">복사</button>
</div>

<script>
  const decisions = {};
  const manualPrices = {};

  function readCardInputs(card) {
    const get = (field) => {
      const el = card.querySelector('[data-field="' + field + '"]');
      return el ? el.value.trim().replace(/,/g, '') : '';
    };
    return {
      weekdayMin: get('weekday_min'),
      weekdayMax: get('weekday_max'),
      weekendMin: get('weekend_min'),
      weekendMax: get('weekend_max'),
      priceMin: get('price_min'),
      priceMax: get('price_max'),
      sourceUrl: get('source_url'),
      note: get('note'),
    };
  }

  function hasManualPriceInput(data) {
    return Boolean(
      data.weekdayMin || data.weekdayMax || data.weekendMin || data.weekendMax ||
      data.priceMin || data.priceMax
    );
  }

  function buildApproveLine(courseId, data) {
    const parts = [courseId, '승인'];
    if (data.weekdayMin || data.weekdayMax) {
      parts.push('평일', data.weekdayMin || '-', data.weekdayMax || data.weekdayMin || '-');
    }
    if (data.weekendMin || data.weekendMax) {
      parts.push('주말', data.weekendMin || '-', data.weekendMax || data.weekendMin || '-');
    }
    if (!data.weekdayMin && !data.weekdayMax && !data.weekendMin && !data.weekendMax) {
      if (data.priceMin || data.priceMax) {
        parts.push(data.priceMin || '-', data.priceMax || data.priceMin || '-');
      }
    }
    if (data.sourceUrl) parts.push('url=' + data.sourceUrl);
    if (data.note) parts.push('note=' + data.note);
    return parts.join(' ');
  }

  function decide(courseId, action, btn) {
    const card = btn.closest('.card');
    if (action === 'clear') {
      delete decisions[courseId];
      delete manualPrices[courseId];
      card.classList.remove('approved', 'rejected');
    } else if (action === 'approve') {
      const inputs = readCardInputs(card);
      decisions[courseId] = 'approve';
      if (hasManualPriceInput(inputs)) {
        manualPrices[courseId] = inputs;
      } else {
        delete manualPrices[courseId];
      }
      card.classList.add('approved');
      card.classList.remove('rejected');
    } else {
      delete manualPrices[courseId];
      decisions[courseId] = 'reject';
      card.classList.add('rejected');
      card.classList.remove('approved');
    }
    render();
  }

  function render() {
    const lines = [];
    for (const [id, action] of Object.entries(decisions)) {
      if (action === 'approve') {
        lines.push(manualPrices[id] ? buildApproveLine(id, manualPrices[id]) : id + ' 승인');
      } else {
        lines.push(id + ' 거부');
      }
    }
    document.getElementById('export-text').value = lines.join('\\n');
  }

  function copyExport() {
    const ta = document.getElementById('export-text');
    ta.select();
    navigator.clipboard.writeText(ta.value);
  }
</script>
</body>
</html>`;

  fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
  fs.writeFileSync(OUT_HTML, html, "utf8");

  // keep summary csv touch for reference in tooling
  if (fs.existsSync(DEFAULT_SUMMARY_CSV)) {
    // no-op reference
  }

  console.log(`saved: ${OUT_HTML}`);
  console.log(`saved: ${OUT_JSON}`);
  console.log(rowRangeLabel);
  console.log(
    `pricedManual=${pricedManual.length} ambiguous=${ambiguous.length} noMatch=${noMatch.length} accept=${reviewPayload.stats.acceptPrice}`,
  );
}

main();
