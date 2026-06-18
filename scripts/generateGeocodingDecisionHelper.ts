import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8 } from "./lib/csvUtils";
import { isValidWgs84Coordinate } from "./lib/geocodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const REVIEW_PATH = path.join(ROOT, "data/review/geocoding_manual_review.md");
const DECISIONS_PATH = path.join(
  ROOT,
  "data/geocoding/manual_geocoding_decisions.csv",
);
const OUTPUT_PATH = path.join(ROOT, "data/review/geocoding_decision_helper.md");

interface Candidate {
  rank: number;
  placeName: string;
  addressName: string;
  roadAddressName: string;
  latitude: string;
  longitude: string;
  confidence: string;
  note: string;
}

interface ReviewItem {
  name: string;
  id: string;
  region: string;
  city: string;
  address: string;
  query: string;
  status: string;
  candidates: Candidate[];
  recommendedName: string;
  recommendedRank: number;
  recommendedReason: string;
  userSelectionRequired: boolean;
  retryQueries: string[];
  retryStatus: string;
}

function parseField(line: string, label: string): string {
  const match = line.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)$`));
  return match?.[1]?.trim() ?? "";
}

function parseReviewMarkdown(content: string): ReviewItem[] {
  const items: ReviewItem[] = [];
  const sections = content.split(/^### /m).slice(1);

  for (const section of sections) {
    const lines = section.split("\n");
    const name = lines[0]?.trim() ?? "";
    const item: ReviewItem = {
      name,
      id: "",
      region: "",
      city: "",
      address: "",
      query: "",
      status: "multiple_candidates",
      candidates: [],
      recommendedName: "",
      recommendedRank: 0,
      recommendedReason: "",
      userSelectionRequired: true,
      retryQueries: [],
      retryStatus: "",
    };

    let mode: "meta" | "candidates" | "recommend" = "meta";
    let currentCandidate: Partial<Candidate> | null = null;

    for (const line of lines.slice(1)) {
      if (line.startsWith("#### 후보") || line.startsWith("#### retry 후보")) {
        mode = "candidates";
        continue;
      }
      if (line.startsWith("#### Cursor 추천")) {
        mode = "recommend";
        continue;
      }

      if (mode === "meta") {
        if (line.includes("**id:**")) item.id = parseField(line, "id");
        if (line.includes("**region / city:**")) {
          const value = parseField(line, "region / city");
          const [region, city] = value.split("/").map((part) => part.trim());
          item.region = region ?? "";
          item.city = city ?? "";
        }
        if (line.includes("**original address:**")) {
          item.address = parseField(line, "original address");
        }
        if (line.includes("**query:**")) {
          item.query = parseField(line, "query");
        }
        if (line.includes("**retry status:**")) {
          item.retryStatus = parseField(line, "retry status");
          item.status = item.retryStatus || item.status;
        }
        if (line.includes("**retry queries")) {
          const raw = line.replace(/^- \*\*retry queries.*?:\*\*\s*/, "");
          item.retryQueries = raw
            .split("|")
            .map((part) => part.trim())
            .filter(Boolean);
        }
      }

      if (mode === "candidates") {
        const rankMatch = line.match(/^- \*\*후보 (\d+)\*\*/);
        if (rankMatch) {
          if (currentCandidate?.rank) {
            item.candidates.push(currentCandidate as Candidate);
          }
          currentCandidate = {
            rank: Number(rankMatch[1]),
            placeName: "",
            addressName: "",
            roadAddressName: "",
            latitude: "",
            longitude: "",
            confidence: "",
            note: "",
          };
          continue;
        }
        if (!currentCandidate) continue;
        if (line.includes("place_name:")) {
          currentCandidate.placeName = line.split("place_name:")[1]?.trim() ?? "";
        }
        if (line.includes("road_address_name:")) {
          currentCandidate.roadAddressName =
            line.split("road_address_name:")[1]?.trim() ?? "";
        } else if (line.includes("address_name:")) {
          currentCandidate.addressName = line.split("address_name:")[1]?.trim() ?? "";
        }
        if (line.includes("latitude:")) {
          currentCandidate.latitude = line.split("latitude:")[1]?.trim() ?? "";
        }
        if (line.includes("longitude:")) {
          currentCandidate.longitude = line.split("longitude:")[1]?.trim() ?? "";
        }
        if (line.includes("confidence:")) {
          currentCandidate.confidence = line.split("confidence:")[1]?.trim() ?? "";
        }
        if (line.includes("이유:")) {
          currentCandidate.note = line.split("이유:")[1]?.trim() ?? "";
        }
      }

      if (mode === "recommend") {
        const recommendMatch = line.match(/\*\*추천 후보 (\d+):\*\*\s*(.+)$/);
        if (recommendMatch) {
          item.recommendedRank = Number(recommendMatch[1]);
          item.recommendedName = recommendMatch[2].trim();
        }
        if (line.includes("**추천 이유:**")) {
          item.recommendedReason = parseField(line, "추천 이유");
        }
        if (line.includes("**사용자 선택 필요:**")) {
          item.userSelectionRequired =
            parseField(line, "사용자 선택 필요") !== "아니오";
        }
      }
    }

    if (currentCandidate?.rank) {
      item.candidates.push(currentCandidate as Candidate);
    }

    if (!item.recommendedRank && item.recommendedName && item.candidates.length) {
      const found = item.candidates.find(
        (candidate) => candidate.placeName === item.recommendedName,
      );
      item.recommendedRank = found?.rank ?? 1;
    }

    if (item.id) items.push(item);
  }

  return items;
}

function loadDecisionStatus(): Map<string, string> {
  const { headers, rows } = parseCsv(readFileUtf8(DECISIONS_PATH));
  const statusIndex = headers.indexOf("status");
  const idIndex = headers.indexOf("id");
  const map = new Map<string, string>();
  for (const row of rows) {
    map.set(row[idIndex] ?? "", row[statusIndex] ?? "");
  }
  return map;
}

function simplifyName(name: string): string {
  return name
    .replace(/\(비회원제\)|\(회원제\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchQueries(item: ReviewItem): {
  kakao: string[];
  naver: string[];
} {
  const simple = simplifyName(item.name);
  const kakao = [
    `${simple} ${item.city}`.trim(),
    `${simple} ${item.region}`.trim(),
    item.address,
    `${simple} 골프장`,
    `${simple} CC`,
    item.query,
  ].filter(Boolean);

  const naver = [
    `${simple} ${item.city} 골프장`.trim(),
    `${simple} ${item.city}`.trim(),
    item.address,
    `${item.city} ${simple}`.trim(),
    `${simple} 컨트리클럽`,
  ].filter(Boolean);

  return {
    kakao: [...new Set(kakao)].slice(0, 4),
    naver: [...new Set(naver)].slice(0, 4),
  };
}

function candidateNote(candidate: Candidate, item: ReviewItem): string {
  const lat = Number(candidate.latitude);
  const lng = Number(candidate.longitude);
  const parts: string[] = [];

  if (!isValidWgs84Coordinate(lat, lng)) {
    parts.push("좌표 범위 확인 필요");
  }
  if (/전기차충전소|ATM|주차장|매점|파크골프|교차로|GS25|웰메이드|인테리어/.test(
    candidate.placeName,
  )) {
    parts.push("부대시설/타업종 가능");
  }
  if (
    item.address &&
    candidate.addressName &&
    !candidate.addressName.includes(item.city.replace(/(시|군|구)$/, ""))
  ) {
    parts.push("주소 city 불일치 검토");
  }
  if (candidate.rank === 1) parts.push("1순위 후보");
  return parts.join("; ") || "지도에서 place_name 확인";
}

function assessRecommendation(item: ReviewItem): {
  canRecommend: boolean;
  suggestedDecision: string;
  suggestedRank: number | null;
  caution: string;
} {
  if (item.candidates.length === 0 || item.status === "no_result") {
    return {
      canRecommend: false,
      suggestedDecision: "manual_coordinate 또는 keep_unresolved",
      suggestedRank: null,
      caution:
        "API 후보 없음 — 카카오/네이버 지도에서 직접 검색 후 좌표 입력. 임의 좌표 생성 금지.",
    };
  }

  const top = item.candidates[0];
  const tied =
    item.candidates.length > 1 &&
    top.confidence === item.candidates[1].confidence;
  const ancillary = /전기차충전소|ATM|주차장|매점|파크골프|교차로|GS25/.test(
    top.placeName,
  );

  if (item.id === "gc-dcb20414b48e") {
    return {
      canRecommend: true,
      suggestedDecision: "use_candidate (확인 후)",
      suggestedRank: 1,
      caution:
        "나주CC vs 나주힐스CC vs 파크골프장 혼재 — 후보 1(나주컨트리클럽)이 맞는지 주소 대조 필수",
    };
  }

  if (item.id === "gc-98e23645d4c7") {
    return {
      canRecommend: true,
      suggestedDecision: "use_candidate (확인 후)",
      suggestedRank: 1,
      caution:
        "휘닉스CC vs 태기산CC 동일 단지 — import name(회원제)과 코스명 일치 확인",
    };
  }

  if (item.id === "gc-716264430902") {
    return {
      canRecommend: false,
      suggestedDecision: "manual_coordinate (확인 후)",
      suggestedRank: null,
      caution:
        "휘닉스 컨트리클럽과 동일 주소 — 대중/퍼블릭 코스 좌표를 지도에서 별도 확인",
    };
  }

  if (ancillary && tied) {
    return {
      canRecommend: true,
      suggestedDecision: "use_candidate (확인 후)",
      suggestedRank: 1,
      caution: "동점 후보 — 1번이 본 시설인지 지도에서 확인 (2번은 부대시설일 수 있음)",
    };
  }

  if (tied) {
    return {
      canRecommend: true,
      suggestedDecision: "use_candidate (확인 후)",
      suggestedRank: 1,
      caution: "동점 score — 자동 확정 불가, 후보 1 vs 2 비교",
    };
  }

  return {
    canRecommend: true,
    suggestedDecision: "use_candidate (확인 후)",
    suggestedRank: item.recommendedRank || 1,
    caution: "추천 후보라도 지도에서 최종 확인",
  };
}

function formatCandidateTable(candidates: Candidate[], item: ReviewItem): string {
  if (candidates.length === 0) {
    return "_후보 없음 — 지도 검색 후 manual_coordinate_\n";
  }

  const header =
    "| 번호 | place_name | address | road_address | lat | lng | confidence | 비고 |\n| -- | ---------- | ------- | ------------ | --- | --- | ---------- | -- |";
  const rows = candidates.map(
    (candidate) =>
      `| ${candidate.rank} | ${candidate.placeName || "(none)"} | ${candidate.addressName || "(none)"} | ${candidate.roadAddressName || "(none)"} | ${candidate.latitude} | ${candidate.longitude} | ${candidate.confidence} | ${candidateNote(candidate, item)} |`,
  );
  return [header, ...rows].join("\n");
}

function decisionExample(item: ReviewItem, assessment: ReturnType<typeof assessRecommendation>): string {
  if (item.candidates.length > 0 && assessment.suggestedRank) {
    const candidate = item.candidates[assessment.suggestedRank - 1] ?? item.candidates[0];
    return [
      "```csv",
      "id,name,decision,selected_latitude,selected_longitude,selected_address,note",
      `${item.id},${item.name},use_candidate,${candidate.latitude},${candidate.longitude},${candidate.addressName},후보 ${candidate.rank} 선택 — 직접 확인 후 반영`,
      "```",
    ].join("\n");
  }

  return [
    "```csv",
    "id,name,decision,selected_latitude,selected_longitude,selected_address,note",
    `${item.id},${item.name},manual_coordinate,<위도>,<경도>,<지도에서 확인한 주소>,지도 검색 후 입력`,
    `${item.id},${item.name},keep_unresolved,,,,좌표 없이 유지`,
    "```",
  ].join("\n");
}

function main(): void {
  const content = fs.readFileSync(REVIEW_PATH, "utf8");
  const items = parseReviewMarkdown(content);
  const statusMap = loadDecisionStatus();

  for (const item of items) {
    const csvStatus = statusMap.get(item.id);
    if (csvStatus) item.status = csvStatus;
  }

  let multipleCount = 0;
  let noResultCount = 0;
  let recommendableCount = 0;

  const lines = [
    "# Geocoding Decision Helper",
    "",
    `> Generated: ${new Date().toISOString()}`,
    "",
    "27건 geocoding 실패/후보 다중 항목을 빠르게 판단하기 위한 검토표입니다.",
    "",
    "## 사용 방법",
    "",
    "1. 각 항목의 **추천 검색어**로 카카오맵/네이버지도에서 위치 확인",
    "2. **후보** 표에서 번호 선택 (동점이면 반드시 지도 대조)",
    "3. **decision 예시**를 복사해 `manual_geocoding_decisions.csv`에 붙여넣기",
    "4. `npm run apply:manual-geocoding` 실행 (별도 단계)",
    "",
    "## decision 값",
    "",
    "- `use_candidate` — 표의 후보 좌표 사용",
    "- `manual_coordinate` — 지도에서 확인한 좌표 직접 입력",
    "- `keep_unresolved` — 좌표 없이 유지",
    "- `exclude_from_import` — 최종 import 제외",
    "",
    "---",
    "",
  ];

  items.forEach((item, index) => {
    if (item.status === "no_result") noResultCount += 1;
    else multipleCount += 1;

    const search = buildSearchQueries(item);
    const assessment = assessRecommendation(item);
    if (assessment.canRecommend) recommendableCount += 1;

    lines.push(`## ${index + 1}. ${item.name}`);
    lines.push("");
    lines.push(`- **id:** ${item.id}`);
    lines.push(`- **name:** ${item.name}`);
    lines.push(`- **region:** ${item.region}`);
    lines.push(`- **city:** ${item.city}`);
    lines.push(`- **original address:** ${item.address}`);
    lines.push(`- **status:** ${item.status}`);
    lines.push("- **추천 검색어:**");
    lines.push(`  - **카카오맵 검색어:** ${search.kakao.join(" · ")}`);
    lines.push(`  - **네이버지도 검색어:** ${search.naver.join(" · ")}`);
    if (item.retryQueries.length > 0) {
      lines.push(
        `  - **retry query 참고:** ${item.retryQueries.slice(0, 6).join(" · ")}`,
      );
    }
    lines.push("");
    lines.push("### 후보");
    lines.push("");
    lines.push(formatCandidateTable(item.candidates, item));
    lines.push("");
    lines.push("### Cursor 추천");
    lines.push("");
    lines.push(`- **추천 decision:** ${assessment.suggestedDecision}`);
    lines.push(
      `- **추천 후보 번호:** ${assessment.suggestedRank ?? "(없음 — 지도 검색 필요)"}`,
    );
    if (item.recommendedName) {
      lines.push(`- **추천 place_name:** ${item.recommendedName}`);
    }
    lines.push(`- **추천 이유:** ${item.recommendedReason || assessment.caution}`);
    lines.push(`- **주의할 점:** ${assessment.caution}`);
    lines.push("");
    lines.push("### 내가 입력할 decision 예시");
    lines.push("");
    lines.push(decisionExample(item, assessment));
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  lines.push("## 요약");
  lines.push("");
  lines.push(`- **검토 대상:** ${items.length}건`);
  lines.push(`- **multiple_candidates:** ${multipleCount}건`);
  lines.push(`- **no_result:** ${noResultCount}건`);
  lines.push(`- **Cursor 추천 가능 (후보/방향 제시):** ${recommendableCount}건`);
  lines.push(`- **사람이 반드시 확인:** ${items.length}건 (자동 반영 없음)`);
  lines.push("");

  fs.writeFileSync(OUTPUT_PATH, lines.join("\n"), "utf8");

  console.log("[generate:decision-helper] Complete");
  console.log(`  Output: ${OUTPUT_PATH}`);
  console.log(`  Items: ${items.length}`);
  console.log(`  multiple_candidates: ${multipleCount}`);
  console.log(`  no_result: ${noResultCount}`);
  console.log(`  recommendable: ${recommendableCount}`);
}

main();
