import fs from "node:fs";
import path from "node:path";
import {
  appendPhase25ToQualityReport,
  generateAmbiguousReviewSummary,
  generateExcludedReviewSummary,
} from "./lib/phase25Review";
import { checkGeocodingEnvKeys } from "./lib/envUtils";
import { prepareGeocodingFiles } from "./lib/geocodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const REVIEW_DIR = path.join(ROOT, "data/review");
const GEOCODING_DIR = path.join(ROOT, "data/geocoding");

function writeGeocodingReadme(): void {
  const readme = `# Geocoding Data

Phase 2.5에서 생성된 geocoding 입력/결과 파일입니다.

## 파일

| 파일 | 설명 |
|------|------|
| \`geocoding_input.csv\` | geocoding API 입력 (id, name, address, query) |
| \`geocoding_results.csv\` | geocoding 성공 결과 (실행 후 채움) |
| \`geocoding_failures.csv\` | 실패·빈 주소·0건 결과 |
| \`geocoding_cache.json\` | address/query 캐시 (중복 API 호출 방지) |

## query 생성 규칙

1. 기본: \`address\`
2. address가 짧거나(<12자) 시·도 접두가 없으면: \`name + city + address\`
3. 빈 address → \`geocoding_failures.csv\`로 사전 분리

## 실행

\`\`\`bash
# dry-run (기본)
npm run geocode:golf-courses

# 실제 API 호출 (다음 단계)
npm run geocode:golf-courses -- --execute
\`\`\`

## API key (.env.local)

- \`KAKAO_REST_API_KEY\` — Kakao Local API (주소→좌표). **지도 JS 키와 다름**
- \`NAVER_CLIENT_ID\` + \`NAVER_CLIENT_SECRET\` — Naver Geocoding (대안)

## 출력 정책

- \`golf_courses_import.csv\`는 **직접 덮어쓰지 않음**
- 좌표 보강 결과는 \`data/golf_courses_import_geocoded.csv\` (execute 후 별도 생성)
- latitude/longitude 임의 생성 금지, WGS84 검증
`;

  fs.mkdirSync(GEOCODING_DIR, { recursive: true });
  fs.writeFileSync(path.join(GEOCODING_DIR, "README.md"), readme, "utf8");
}

function main(): void {
  const runAt = new Date().toISOString();

  const excluded = generateExcludedReviewSummary(
    path.join(REVIEW_DIR, "excluded_non_golf_courses.csv"),
    path.join(REVIEW_DIR, "excluded_review_summary.md"),
  );

  const ambiguous = generateAmbiguousReviewSummary(
    path.join(REVIEW_DIR, "ambiguous_courses.csv"),
    path.join(ROOT, "data/golf_courses_import.csv"),
    path.join(REVIEW_DIR, "ambiguous_review_summary.md"),
  );

  const geocoding = prepareGeocodingFiles(
    path.join(ROOT, "data/golf_courses_needs_geocoding.csv"),
    GEOCODING_DIR,
  );

  writeGeocodingReadme();

  const apiKeys = checkGeocodingEnvKeys(ROOT);

  appendPhase25ToQualityReport(path.join(REVIEW_DIR, "data_quality_report.md"), {
    runAt,
    excludedSummaryCreated: true,
    ambiguousSummaryCreated: true,
    geocodingInputCount: geocoding.inputCount,
    geocodingFailureCount: geocoding.failureCount,
    geocodingTargetCount: geocoding.inputCount,
    apiKeys,
    dryRunReady: geocoding.inputCount > 0,
  });

  console.log("[prepare:phase25-review] Phase 2.5 preparation complete");
  console.log(`  Excluded review:     ${excluded.total} rows (${excluded.confirmationCount} need confirmation)`);
  console.log(`  Ambiguous review:    ${ambiguous.total} rows (${ambiguous.groupCount} groups)`);
  console.log(`  Geocoding input:     ${geocoding.inputCount}`);
  console.log(`  Geocoding failures:  ${geocoding.failureCount} (pre-split)`);
  console.log(`  API keys configured: kakao=${apiKeys.kakaoRestApiKey}, naver=${apiKeys.naverClientId && apiKeys.naverClientSecret}`);
}

main();
