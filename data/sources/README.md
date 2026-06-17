# 골프장 데이터 Source Registry

`golf_course_sources.json`은 raw data 다운로드·병합 스크립트가 참조하는 **기준 파일**입니다.

## Source role

| Role | 설명 | 자동 import |
|------|------|-------------|
| `master` | 전국 골프장 기본 목록 (이름·주소·홀수·운영구분 기준) | ✅ master 기준 행 생성 |
| `supplement` | master에 매칭된 행의 일부 필드 보강 | ⚠️ 매칭 성공 시에만 |
| `candidate` | master에 없는 후보 | ❌ → `review/new_course_candidates.csv` |
| `excluded` | 연습장·스크린·파크골프 등 | ❌ → `review/excluded_non_golf_courses.csv` |
| `manual` | 운영자 수동 보강 | ⚠️ master 매칭 후에만 |

## 등록된 source (요약)

| id | role | expected_file_name |
|----|------|-------------------|
| `ministry_national_golf_courses` | master | `ministry_golf_courses.csv` |
| `localdata_golf_courses` | supplement | `localdata_golf_courses.csv` |
| `gyeonggi_golf_courses` | supplement | `gyeonggi_golf_courses.csv` |
| `lx_spatial_golf_courses` | supplement | `lx_spatial_golf_courses.csv` |
| `manual_enrichment` | manual | `manual_course_enrichment.csv` |

raw 파일 보관 위치: `data/raw/<expected_file_name>`

---

## Master-first 병합 정책

### 1. Master dataset이 먼저다

- import의 **행 수·골프장 identity(id)** 는 master source에서만 결정한다.
- supplement / manual은 master에 **이미 존재하는 골프장**을 보강할 때만 사용한다.

### 2. Supplement는 매칭 성공 시에만 보강

보강 가능 필드 (source별 `trusted_fields` 참고):

- `latitude`, `longitude`
- `phone`, `business_status`
- `road_address` (address 보조)
- `updated_at`

**금지:**

- master에 없는 supplement 행을 import에 **새 골프장으로 추가**하지 않는다.
- → `data/review/new_course_candidates.csv`

### 3. 매칭이 애매하면 review

| 상황 | review 파일 |
|------|-------------|
| master에 없는 골프장 후보 | `new_course_candidates.csv` |
| 이름은 비슷한데 주소가 다름 | `ambiguous_courses.csv` |
| 중복 가능성 (유사 이름·근접 주소) | `duplicate_candidates.csv` |
| 골프연습장·스크린·파크골프 | `excluded_non_golf_courses.csv` |
| 주소만 있고 좌표 없음 | `../golf_courses_needs_geocoding.csv` |
| 좌표계 불명확 (X/Y 등) | `ambiguous_courses.csv` (임의 변환 금지) |

### 4. 병합 금지 조건

다음 경우 **자동 병합하지 않는다:**

1. 이름만 같고 주소가 다름
2. 주소만 같고 시설 유형이 다름 (연습장 vs 필드)
3. supplement source에만 존재하는 신규 시설
4. 좌표계가 WGS84로 확인되지 않은 X/Y 좌표
5. `excluded_category_keywords`에 해당하는 업종/명칭

### 5. 최종 import

- `data/golf_courses_import.csv`에는 **review를 통과한 데이터만** 포함한다.
- `npm run convert:golf-courses`는 단일 raw CSV 변환용.
- 다중 source 병합은 미래 `npm run merge:golf-courses` (설계 단계)에서 master-first로 처리한다.

---

## Registry 필드 설명

| 필드 | 설명 |
|------|------|
| `id` | source 고유 식별자 |
| `name` | 사람이 읽는 이름 |
| `role` | master / supplement / candidate / excluded / manual |
| `provider` | 제공 기관 |
| `expected_file_name` | `data/raw/`에 둘 파일명 |
| `download_status` | pending / downloaded / failed |
| `download_method` | manual / open_api / manual_or_open_api |
| `requires_login` | 활용신청·로그인 필요 여부 |
| `requires_api_key` | API 키 필요 여부 |
| `expected_columns` | 예상 원본 컬럼명 |
| `trusted_fields` | 이 source에서 자동 반영 가능한 필드 |
| `notes` | 운영 메모 |

---

## 관련 문서

- [`../README.md`](../README.md) — CSV 변환·Supabase import
- [`../review/README.md`](../review/README.md) — review 파일 설명
- [`../../scripts/README.md`](../../scripts/README.md) — 다운로드·병합 CLI 설계
