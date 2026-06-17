/**
 * 골프장 source raw data 다운로드 CLI (미구현)
 *
 * 미래 동작:
 * - data/sources/golf_course_sources.json 읽기
 * - source별 download_method에 따라 다운로드 시도
 * - 성공: data/raw/<expected_file_name> 저장, download_status 갱신
 * - 실패: data/review/download_failures.md 기록
 * - API 키: .env.local 의 DATA_GO_KR_SERVICE_KEY (예정)
 * - requires_login=true → 사용자 수동 다운로드 안내
 */

console.log("[download:golf-sources] Not implemented yet.");
console.log("");
console.log("다음 단계:");
console.log("  1. data/sources/golf_course_sources.json 에서 source 목록 확인");
console.log("  2. requires_login=false 인 source부터 수동 또는 API 다운로드");
console.log("  3. 파일을 data/raw/<expected_file_name> 에 저장");
console.log("  4. 실패 내역은 data/review/download_failures.md 에 기록");
console.log("");
console.log("병합 정책: data/sources/README.md (master-first)");
console.log("Review 구조: data/review/README.md");

process.exit(0);
