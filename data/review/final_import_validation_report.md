# Final Import Validation Report

> Generated: 2026-06-18T02:57:49.135Z

## 대상 파일

- **target:** `data\golf_courses_import_geocoded_final.csv`
- **expected row count:** 532
- **actual row count:** 532

## 검증 결과 요약

| 항목 | 결과 |
|------|------|
| row count (532) | 통과 |
| duplicate id | 없음 |
| 빈 name | 0 |
| 빈 address | 0 |
| 좌표 보유 | 532/532 |
| 좌표 없음 | 0 |
| 좌표 한국 범위 밖 (lat 33~39, lng 124~132) | 0 |
| invalid region | 0 |
| invalid course_type | 0 |
| invalid hole_count | 0 |
| invalid source | 0 |
| invalid updated_at/created_at | 0 |
| schema/CSV header 일치 | 통과 |
| 깨진 한글/이상 문자 | 0건 |
| duplicate name+address | 0건 |
| name quality errors | 0 |
| name quality warnings | 199 |

## Supabase import 가능 여부

- **가능** — blocking error 없음

## 의도적 제외 확인

- `gc-dbaa28f7b44e`: ✅ final에 없음
- `gc-d3a3acc83c4d`: ✅ final에 없음

## 병합 행 hole_count 확인

- `gc-bf183cd699c7` **로얄링스 CC** — hole_count 36 (expected 36) ✅ — 로얄링스1+2 병합
- `gc-167a7f95d402` **솔라고CC** — hole_count 36 (expected 36) ✅ — 솔라고CC1+2 병합
- `gc-74de2175f831` **블랙스톤제주** — hole_count 27 (expected 27) ✅ — 블랙스톤제주 중복 행 병합
- `gc-a043ad4dfcf6` **서경타니CC** — hole_count 36 (expected 36) ✅ — 36홀 유지
- `gc-01d6a94bf335` **골프존카운티 청통** — hole_count 18 (expected 18) ✅ — 청통골프장 → 골프존카운티 청통
- `gc-716264430902` **태기산 나인CC** — hole_count 9 (expected 9) ✅ — 휘닉스대중골프장 → 태기산 나인CC

## Schema vs CSV header

- **schema file:** `supabase\schema.sql`
- **match:** yes

## Errors

_없음_

## Warnings

_없음_

## Name quality outputs

- `data\review\final_name_quality_warnings.csv` (199 rows)
