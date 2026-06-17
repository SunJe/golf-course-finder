/**
 * Source registry 경로 및 master-first 병합 정책 상수.
 * 미래 download / merge 스크립트에서 사용한다.
 * Next.js 앱 번들과 분리 (scripts/ 전용).
 */

export const SOURCE_REGISTRY_PATH = "data/sources/golf_course_sources.json";

export const RAW_DATA_DIR = "data/raw";
export const REVIEW_DIR = "data/review";
export const IMPORT_CSV_PATH = "data/golf_courses_import.csv";
export const NEEDS_GEOCODING_CSV_PATH = "data/golf_courses_needs_geocoding.csv";

export const REVIEW_FILES = {
  newCourseCandidates: "data/review/new_course_candidates.csv",
  ambiguousCourses: "data/review/ambiguous_courses.csv",
  duplicateCandidates: "data/review/duplicate_candidates.csv",
  excludedNonGolf: "data/review/excluded_non_golf_courses.csv",
  dataQualityReport: "data/review/data_quality_report.md",
  downloadFailures: "data/review/download_failures.md",
} as const;

/** master-first 병합 금지 조건 (자동 처리하지 않음) */
export const MERGE_BLOCK_RULES = [
  "name_only_match_different_address",
  "supplement_row_not_in_master",
  "excluded_facility_category",
  "uncertain_coordinate_system",
  "conflicting_trusted_field_values",
] as const;

/**
 * 미래 mergeGolfCourses.ts 처리 순서 (설계)
 *
 * 1. golf_course_sources.json 로드
 * 2. role=master source → CourseCandidate[] 생성
 * 3. excluded 키워드 필터 → excluded_non_golf_courses.csv
 * 4. role=supplement source 순회
 *    - master와 확실히 매칭 → trusted_fields만 보강
 *    - 매칭 실패 → new_course_candidates.csv
 *    - 값 충돌 → ambiguous_courses.csv
 *    - 중복 의심 → duplicate_candidates.csv
 * 5. role=manual source → master 매칭 후 수동 필드 보강
 * 6. 좌표 없음 → golf_courses_needs_geocoding.csv
 * 7. review 통과분만 golf_courses_import.csv 출력
 * 8. data_quality_report.md 갱신
 */
