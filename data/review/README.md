# Data Review

master-first 병합 과정에서 **자동 import하지 않는** 행을 모아 두는 폴더입니다.

Supabase 최종 import CSV에는 review를 통과한 데이터만 포함합니다.

## 파일 목록

| 파일 | 용도 |
|------|------|
| `new_course_candidates.csv` | master에 없지만 다른 source에서 발견된 골프장 후보 |
| `ambiguous_courses.csv` | 이름/주소 매칭 애매, 값 충돌, 좌표계 불명 |
| `duplicate_candidates.csv` | 중복 가능성 있는 master/supplement 쌍 |
| `excluded_non_golf_courses.csv` | 연습장·스크린·파크골프 등 제외 대상 |
| `data_quality_report.md` | 병합 실행 후 품질 지표 (템플릿) |
| `download_failures.md` | source 다운로드 실패 기록 |

생성 파이프라인 출력 (review 폴더 밖):

- `../golf_courses_import.csv` — review 통과 후 최종 import
- `../golf_courses_errors.csv` — 변환 오류
- `../golf_courses_needs_geocoding.csv` — 좌표 미보유

## 처리 원칙

1. review CSV는 **삭제하지 말고** 판단 근거로 보관한다.
2. `suggested_action` 컬럼에 `accept` / `reject` / `merge` / `needs_geocoding` 등을 기록한다.
3. 사용자 확인 전까지 Supabase import에 반영하지 않는다.
