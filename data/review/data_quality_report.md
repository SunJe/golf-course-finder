# Data Quality Report — Phase 2 (Master Conversion)

> Generated: 2026-06-18T00:01:20.599Z

Master-only conversion. **No supplement merge.**

---

## 실행 정보

- **실행 일시:** 2026-06-18T00:01:20.599Z
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
