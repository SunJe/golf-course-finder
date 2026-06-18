# Data Quality Report — Phase 2 (Master Conversion)

> Generated: 2026-06-18T01:00:03.566Z

Master-only conversion. **No supplement merge.**

---

## 실행 정보

- **실행 일시:** 2026-06-18T01:00:03.566Z
- **실행 명령:** `npm run convert:master-courses`
- **Master source:** `ministry_national_golf_courses`
- **Master raw file:** `data/raw/ministry_golf_courses.csv`

## Phase 2 변환 결과

| 항목 | 값 |
|------|-----|
| master 원본 행 수 | 541 |
| 정상 변환(import) 행 수 | 515 |
| golf_courses_import.csv 행 수 | 515 |
| 좌표 보유 행 수 | 0 |
| 좌표 없는 행 수 | 515 |
| geocoding 필요 행 수 | 515 |
| excluded_non_golf_courses 행 수 | 26 |
| ambiguous_courses 행 수 | 20 |
| 오류 행 수 | 0 |

## Supabase import 가능 여부

- **좌표 보강 전 업로드 불가** — schema.sql에서 latitude/longitude가 NOT NULL입니다. 현재 515행은 geocoding이 필요합니다.

## region별 행 수

- 경기: 164
- 경상: 108
- 충청: 72
- 전라: 68
- 강원: 63
- 제주: 39
- 서울: 1

## course_type별 행 수

- 대중제: 364
- 회원제: 151

## hole_count 분포 (상위)

- 18: 232
- 27: 124
- 9: 113
- 36: 25
- 6: 8
- 24: 2
- 45: 2
- 8: 1
- 10: 1
- 12: 1
- 21: 1
- 30: 1
- 41: 1
- 54: 1
- 63: 1

## 다음 단계 필요 작업

1. `data/review/excluded_non_golf_courses.csv` 검토
2. `data/review/ambiguous_courses.csv` 검토
3. `data/golf_courses_needs_geocoding.csv` 기준 geocoding (또는 supplement 좌표 보강)
4. Supplement 병합 (Phase 3, 별도 작업)
5. Review 통과 후 Supabase CSV import
---

## Phase 2.6 — Review Decision 반영

- **실행 일시:** 2026-06-18T01:00:04.006Z
- **excluded → import 복귀 행 수:** 26
- **회원제/대중제 분리 유지 행 수:** 30
- **이름 suffix 추가 행 수:** 30
- **홀수 합산 병합 그룹 수:** 6
- **병합으로 제거된 row 수:** 6
- **manual_questions.md 질문 수:** 7
- **최종 golf_courses_import.csv 행 수:** 535
- **중복 id:** 없음
- **좌표 보강 필요 행 수:** 535

### 다음 단계

1. manual_questions.md 사용자 응답
2. 필요 시 review_decisions 반영 후 재실행
3. geocoding_input 재생성 (`npm run prepare:phase25-review`)
4. geocoding 실행 후 Supabase import 검토
-
---

## Phase 2.5 — Review & Geocoding 준비

- **실행 일시:** 2026-06-18T01:21:16.781Z
- **excluded review summary:** 생성됨 (`data/review/excluded_review_summary.md`)
- **ambiguous review summary:** 생성됨 (`data/review/ambiguous_review_summary.md`)
- **geocoding_input.csv 행 수:** 534
- **geocoding_failures.csv (사전 분리) 행 수:** 0
- **geocoding 대상 행 수:** 534

### API key 존재 여부 (값 미표시)

- KAKAO_REST_API_KEY: false
- NAVER_CLIENT_ID: false
- NAVER_CLIENT_SECRET: false
- 사용 가능 provider: none

### dry-run 가능 여부

- **가능** — `npm run geocode:golf-courses` (기본 dry-run)

### 다음 단계

1. `excluded_review_summary.md` / `ambiguous_review_summary.md` 사용자 검토
2. review 반영 후 필요 시 `npm run convert:master-courses` 재실행
3. `.env.local`에 geocoding API key 설정
4. `npm run geocode:golf-courses -- --execute` 로 실제 geocoding
5. 좌표 보강 결과 확인 후 `golf_courses_import_geocoded.csv` 생성 (별도 단계)

