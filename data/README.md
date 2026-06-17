# 골프장 데이터 파이프라인

공공·지자체·수동 source에서 **깨끗한 master dataset**을 만들고 Supabase `golf_courses`에 import하기 위한 가이드입니다.

## 핵심 원칙 (Master-first)

1. **많이 모으기 ≠ 목표** — 깨끗한 master dataset이 목표
2. **master source가 먼저** — 전국 골프장 identity·기본 필드의 기준
3. **supplement는 보강만** — master에 매칭된 행의 일부 필드만 자동 반영
4. **master에 없는 시설** — 자동 import ❌ → `review/new_course_candidates.csv`
5. **이름만 같고 주소 다름** — 임의 병합 ❌ → `review/ambiguous_courses.csv`
6. **연습장·스크린·파크골프** — import ❌ → `review/excluded_non_golf_courses.csv`
7. **애매한 데이터** — 반드시 review에 남기고 사람이 확인
8. **최종 import CSV** — review 통과 데이터만

자세한 정책: [`sources/README.md`](sources/README.md)  
Source 목록: [`sources/golf_course_sources.json`](sources/golf_course_sources.json)

---

## 권장 작업 순서 (raw data 다운로드 전·후)

### Phase 0 — 준비 (현재 단계)

- [x] Course / GolfCourseRow / mapper / repository
- [x] `supabase/schema.sql`, `golf_courses_template.csv`
- [x] source registry, review 폴더, master-first 문서

### Phase 1 — Raw 다운로드

1. `data/sources/golf_course_sources.json`에서 source 확인
2. **master** (`ministry_national_golf_courses`)부터 다운로드
3. 파일을 `data/raw/ministry_golf_courses.csv` 등 `expected_file_name`으로 저장
4. (미래) `npm run download:golf-sources` — 현재는 stub
5. 실패 시 `data/review/download_failures.md` 기록

### Phase 2 — Master 변환

1. master CSV를 import 형식으로 변환 (미래: master 전용 convert 또는 merge 1단계)
2. 좌표 없는 행 → `golf_courses_needs_geocoding.csv`
3. 제외 키워드 해당 → `review/excluded_non_golf_courses.csv`

### Phase 3 — Supplement 병합 (미래 `merge:golf-courses`)

1. supplement source 순회
2. master와 **확실히 매칭** → `trusted_fields`만 보강
3. 매칭 실패 / 충돌 / 중복 / 애매 → review CSV
4. `data/review/data_quality_report.md` 작성

### Phase 4 — Review & Manual 보강

1. `review/*.csv` 검토 → `suggested_action` 결정
2. `manual_course_enrichment.csv`로 홈페이지·가격 등 수동 보강
3. geocoding으로 좌표 채우기

### Phase 5 — Supabase Import

1. `golf_courses_import.csv` 최종 확인
2. Supabase Table Editor / CSV import
3. (향후) `courseRepository`를 Supabase query로 전환

---

## 단일 CSV 변환 (레거시 / 테스트)

공공데이터 **단일 파일**을 바로 변환할 때:

```bash
# data/raw/golf_courses_public.csv 에 저장 후
npm run convert:golf-courses
```

| 출력 | 설명 |
|------|------|
| `golf_courses_import.csv` | import 후보 |
| `golf_courses_errors.csv` | 변환 오류 |
| `golf_courses_needs_geocoding.csv` | 좌표 미보유 |

> 다중 source 운영 시에는 **merge + review 통과** 후 이 파일을 최종본으로 사용한다.

---

## Review 폴더

| 파일 | 용도 |
|------|------|
| `review/new_course_candidates.csv` | master에 없는 후보 |
| `review/ambiguous_courses.csv` | 매칭·값 충돌 애매 |
| `review/duplicate_candidates.csv` | 중복 의심 |
| `review/excluded_non_golf_courses.csv` | 연습장·스크린·파크골프 |
| `review/data_quality_report.md` | 품질 지표 |
| `review/download_failures.md` | 다운로드 실패 |

---

## 앱과의 관계

- Next.js 앱은 **mock data** (`lib/courseRepository.ts`)로 계속 동작
- `data/`, `scripts/`는 앱 번들과 무관
- Supabase env 없이 `npm run build` 성공

## id / region / course_type (변환 규칙 요약)

- **id:** `name|city|address` 해시 → `gc-xxxxxxxxxxxx`
- **region:** UI 필터 (`서울`, `경기`, `강원`, `충청`, `전라`, `경상`, `제주`)
- **course_type:** `대중제` | `회원제` | `군 골프장` | `기타`

변환 로직: `scripts/lib/golfCourseTransform.ts`
