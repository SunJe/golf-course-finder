# Final Import Validation Report

> Generated: 2026-06-18T02:42:43.235Z

## 대상 파일

- **baseline:** C:\Users\이선제\golf-course-finder\data\golf_courses_import.csv (534 rows)
- **target:** C:\Users\이선제\golf-course-finder\data\golf_courses_import_geocoded_final.csv (532 rows)

## 검증 결과

- **row count 일치:** 실패
- **duplicate id:** 없음
- **빈 name:** 0
- **빈 address:** 0
- **좌표 없음:** 0
- **좌표 범위 밖:** 0
- **invalid region:** 0
- **invalid course_type:** 0
- **invalid hole_count:** 0

## Supabase import 가능 여부

- **불가** — 아래 issue 해결 필요

## Issues

- **[error]** row count mismatch: baseline=534, target=532
- **[error]** missing id in target: gc-dbaa28f7b44e
- **[error]** missing id in target: gc-d3a3acc83c4d
