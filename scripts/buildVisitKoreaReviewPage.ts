/**
 * Visit Korea 이미지 매칭 검수용 정적 HTML 페이지 생성
 * Usage: npm run build:visit-korea-review-page
 */
import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const REVIEW_PATH = path.join(ROOT, "data/visit-korea-golf-image-review.json");
const APPLIED_PATH = path.join(ROOT, "data/visit-korea-golf-image-matches-applied.json");
const FULL_SET_CSV = path.join(ROOT, "data/enrichment/golf_courses_full_set.csv");
const OUT_PATH = path.join(ROOT, "reports/visit-korea-image-review.html");

type Scores = {
  imageMatchConfidence: string;
  fuzzyScore: number;
  addressMatch: number;
};

type Candidate = {
  courseId: string;
  courseName: string;
  visitKoreaContentId: string;
  visitKoreaTitle: string;
  visitKoreaAddr1?: string;
  visitKoreaAddr2?: string;
  images: string[];
  scores: Scores;
};

type ReviewItem = {
  courseId: string;
  courseName: string;
  best?: Candidate;
  alternatives: Candidate[];
};

type AppliedItem = {
  courseId: string;
  courseName: string;
  visitKoreaContentId: string;
  visitKoreaTitle: string;
  images: string[];
  imageMatchConfidence: string;
};

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

function loadCourseAddresses(): Map<string, string> {
  const lines = fs.readFileSync(FULL_SET_CSV, "utf8").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^\uFEFF/, ""));
  const idIndex = headers.indexOf("id");
  const addrIndex = headers.indexOf("address");
  const map = new Map<string, string>();
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const id = cols[idIndex];
    if (id) map.set(id, cols[addrIndex] ?? "");
  }
  return map;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderImages(images: string[]): string {
  return images
    .slice(0, 4)
    .map(
      (src) =>
        `<img loading="lazy" src="${escapeHtml(src)}" alt="후보 이미지" />`,
    )
    .join("");
}

function renderCard(
  courseId: string,
  courseName: string,
  courseAddress: string,
  candidate: Candidate,
  kind: "review" | "ambiguous" | "applied",
): string {
  const visitAddr = [candidate.visitKoreaAddr1, candidate.visitKoreaAddr2]
    .filter(Boolean)
    .join(" ");
  const badge = candidate.scores
    ? `${candidate.scores.imageMatchConfidence} · fuzzy ${candidate.scores.fuzzyScore.toFixed(2)} · addr ${candidate.scores.addressMatch.toFixed(2)}`
    : kind;

  return `
  <div class="card" data-course-id="${escapeHtml(courseId)}" data-kind="${kind}">
    <div class="card-head">
      <span class="badge badge-${kind}">${escapeHtml(badge)}</span>
      <code>${escapeHtml(courseId)}</code>
    </div>
    <div class="compare">
      <div class="col">
        <div class="label">GolfMap 골프장</div>
        <div class="name">${escapeHtml(courseName)}</div>
        <div class="addr">${escapeHtml(courseAddress || "(주소 없음)")}</div>
      </div>
      <div class="col">
        <div class="label">Visit Korea 후보</div>
        <div class="name">${escapeHtml(candidate.visitKoreaTitle)}</div>
        <div class="addr">${escapeHtml(visitAddr || "(주소 없음)")}</div>
      </div>
    </div>
    <div class="images">${renderImages(candidate.images)}</div>
    <div class="actions">
      <button class="btn btn-approve" onclick="decide('${escapeHtml(courseId)}','approve',this)">✅ 승인 (이미지 적용)</button>
      <button class="btn btn-reject" onclick="decide('${escapeHtml(courseId)}','reject',this)">❌ 거부 (빼기)</button>
      <button class="btn btn-clear" onclick="decide('${escapeHtml(courseId)}','clear',this)">↺ 취소</button>
    </div>
  </div>`;
}

function main(): void {
  const review = JSON.parse(fs.readFileSync(REVIEW_PATH, "utf8")) as {
    items: ReviewItem[];
  };
  const applied = JSON.parse(fs.readFileSync(APPLIED_PATH, "utf8")) as {
    items: AppliedItem[];
  };
  const addresses = loadCourseAddresses();

  const ambiguous = review.items.filter(
    (item) => item.best?.scores.imageMatchConfidence === "ambiguous",
  );
  const regular = review.items.filter(
    (item) => item.best && item.best.scores.imageMatchConfidence !== "ambiguous",
  );

  const ambiguousCards = ambiguous
    .map((item) =>
      renderCard(
        item.courseId,
        item.courseName,
        addresses.get(item.courseId) ?? "",
        item.best!,
        "ambiguous",
      ),
    )
    .join("\n");

  const reviewCards = regular
    .map((item) =>
      renderCard(
        item.courseId,
        item.courseName,
        addresses.get(item.courseId) ?? "",
        item.best!,
        "review",
      ),
    )
    .join("\n");

  const appliedCards = applied.items
    .map((item) =>
      renderCard(
        item.courseId,
        item.courseName,
        addresses.get(item.courseId) ?? "",
        {
          courseId: item.courseId,
          courseName: item.courseName,
          visitKoreaContentId: item.visitKoreaContentId,
          visitKoreaTitle: item.visitKoreaTitle,
          images: item.images,
          scores: {
            imageMatchConfidence: item.imageMatchConfidence,
            fuzzyScore: 1,
            addressMatch: 1,
          },
        },
        "applied",
      ),
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Visit Korea 이미지 매칭 검수</title>
<style>
  body { font-family: -apple-system, "Malgun Gothic", sans-serif; margin: 0; background: #f5f5f4; color: #1c1917; }
  header { position: sticky; top: 0; background: #064e3b; color: #fff; padding: 14px 20px; z-index: 10; }
  header h1 { margin: 0 0 6px; font-size: 18px; }
  header p { margin: 0; font-size: 13px; opacity: .9; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 20px; }
  h2 { margin: 28px 0 12px; font-size: 16px; border-left: 4px solid #059669; padding-left: 10px; }
  .card { background: #fff; border: 1px solid #e7e5e4; border-radius: 14px; padding: 16px; margin-bottom: 16px; }
  .card.approved { outline: 3px solid #10b981; }
  .card.rejected { outline: 3px solid #ef4444; opacity: .6; }
  .card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; color: #fff; }
  .badge-review { background: #d97706; }
  .badge-ambiguous { background: #dc2626; }
  .badge-applied { background: #2563eb; }
  code { font-size: 11px; color: #78716c; }
  .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .col { background: #fafaf9; border-radius: 10px; padding: 10px; }
  .label { font-size: 11px; color: #78716c; margin-bottom: 4px; }
  .name { font-size: 15px; font-weight: 700; }
  .addr { font-size: 12px; color: #57534e; margin-top: 2px; }
  .images { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px; }
  .images img { width: 100%; height: 130px; object-fit: cover; border-radius: 8px; background: #e7e5e4; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .btn { border: none; border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .btn-approve { background: #d1fae5; color: #065f46; }
  .btn-reject { background: #fee2e2; color: #991b1b; }
  .btn-clear { background: #f5f5f4; color: #57534e; }
  #export-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #1c1917; color: #fff; padding: 12px 20px; display: flex; gap: 12px; align-items: center; }
  #export-bar textarea { flex: 1; height: 52px; font-size: 12px; border-radius: 8px; border: none; padding: 6px; font-family: monospace; }
  #export-bar button { background: #10b981; color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-weight: 700; cursor: pointer; }
  details { margin-top: 24px; }
  summary { cursor: pointer; font-weight: 700; padding: 8px 0; }
  @media (max-width: 640px) {
    .compare { grid-template-columns: 1fr; }
    .images { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>
<header>
  <h1>Visit Korea 이미지 매칭 검수</h1>
  <p>각 카드에서 GolfMap 골프장과 Visit Korea 후보 사진을 비교해 승인/거부하세요. 하단 박스의 결과를 복사해 채팅에 붙여넣으면 됩니다.</p>
</header>
<div class="wrap">
  <h2>🔴 우선 확인: ambiguous (${ambiguous.length}건)</h2>
  ${ambiguousCards || "<p>없음</p>"}

  <h2>🟠 review 후보 (${regular.length}건)</h2>
  ${reviewCards || "<p>없음</p>"}

  <details>
    <summary>🔵 자동 적용된 이미지 스팟체크 (${applied.items.length}건) — 펼치기</summary>
    ${appliedCards}
  </details>

  <div style="height: 90px;"></div>
</div>

<div id="export-bar">
  <textarea id="export-text" readonly placeholder="승인/거부를 누르면 여기에 결과가 생성됩니다."></textarea>
  <button onclick="copyExport()">복사</button>
</div>

<script>
  const decisions = {};
  function decide(courseId, action, btn) {
    const card = btn.closest('.card');
    if (action === 'clear') {
      delete decisions[courseId];
      card.classList.remove('approved', 'rejected');
    } else if (action === 'approve') {
      decisions[courseId] = 'approve';
      card.classList.add('approved');
      card.classList.remove('rejected');
    } else {
      decisions[courseId] = 'reject';
      card.classList.add('rejected');
      card.classList.remove('approved');
    }
    render();
  }
  function render() {
    const lines = [];
    for (const [id, action] of Object.entries(decisions)) {
      lines.push(id + ' ' + (action === 'approve' ? '승인' : '거부'));
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

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, html, "utf8");
  console.log(`saved: ${OUT_PATH}`);
  console.log(`ambiguous=${ambiguous.length} review=${regular.length} applied=${applied.items.length}`);
}

main();
