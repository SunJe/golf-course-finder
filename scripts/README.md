# Scripts

데이터 CLI는 Next.js 앱과 분리되어 있습니다 (`tsconfig.json`에서 `scripts` 제외).

## 현재 구현됨

### Phase 1 — Source 다운로드

```bash
npm run download:golf-sources
```

- `data/sources/golf_course_sources.json` 읽기
- master source 우선 처리
- URL 없음 / 로그인 필요 → `download_failures.md` (manual required)
- API 키 필요 & 미설정 → skipped (not failure)
- 성공 시 `data/raw/<expected_file_name>` 저장
- master 미확보 시 exit code 1

### Phase 1 — Raw CSV 분석

```bash
npm run analyze:golf-raw
```

- `data/raw/*.csv` 인코딩·컬럼·행 수·샘플 5행 분석
- `data/review/data_quality_report.md` 갱신
- 병합/import 생성 **하지 않음**

### Phase 2 — Master CSV 변환

```bash
npm run convert:master-courses
```

- 입력: `data/raw/ministry_golf_courses.csv`
- 출력: `data/golf_courses_import.csv`, `golf_courses_needs_geocoding.csv`, review CSV
- supplement 병합 **하지 않음**

### CSV 변환 (단일 raw → import 형식, 레거시)

```bash
npm run convert:golf-courses
```

- 입력: `data/raw/golf_courses_public.csv` (레거시 단일 파일 경로)
- 출력: `data/golf_courses_import.csv`, errors, needs_geocoding
- 로직: `convertGolfCourses.ts`, `lib/golfCourseTransform.ts`

## 설계만 준비됨 (미구현)

### Source 다운로드

```bash
npm run download:golf-sources
```

**현재:** `Not implemented yet` 메시지 후 종료 (exit 0)

**미래 동작:**

1. `data/sources/golf_course_sources.json` 읽기
2. source별 `download_method` / `requires_api_key` / `requires_login` 확인
3. 다운로드 시도 → `data/raw/<expected_file_name>` 저장
4. 실패 시 `data/review/download_failures.md` 기록
5. API 키: `.env.local`의 `DATA_GO_KR_SERVICE_KEY` (예정)
6. 로그인·활용신청 필요 source → 사용자 수동 다운로드 안내

### Master-first 병합

```bash
# npm run merge:golf-courses  (package.json 미등록 — 구현 시 추가)
```

**미래 동작** (`scripts/lib/dataStrategy.ts` 참고):

1. **master** source 먼저 로드 → 기준 `CourseCandidate[]` 생성
2. **supplement** source는 master와 **확실히 매칭**될 때만 `trusted_fields` 보강
3. master에 없는 supplement 행 → `data/review/new_course_candidates.csv`
4. 이름 유사·주소 다름 / 값 충돌 → `ambiguous_courses.csv`
5. 중복 의심 → `duplicate_candidates.csv`
6. 연습장·스크린·파크골프 → `excluded_non_golf_courses.csv`
7. 좌표 없음 → `golf_courses_needs_geocoding.csv`
8. **review 통과분만** `golf_courses_import.csv` 생성
9. `data/review/data_quality_report.md` 갱신

**병합 금지:**

- 이름만 같고 주소 다름 → 임의 merge ❌
- supplement-only 신규 시설 → 자동 import ❌
- WGS84 미확인 좌표 → 임의 변환 ❌

## 파일 구조

| 경로 | 역할 |
|------|------|
| `lib/csvUtils.ts` | CSV read/write |
| `lib/golfCourseTransform.ts` | 단일 CSV 컬럼 매핑·정규화 |
| `lib/dataStrategy.ts` | source registry 경로·병합 정책 상수 |
| `convertGolfCourses.ts` | 단일 raw 변환 CLI |
| `downloadGolfSources.ts` | 다운로드 CLI (stub) |

## 문서

- [`data/README.md`](../data/README.md) — 파이프라인 개요
- [`data/sources/README.md`](../data/sources/README.md) — master-first 정책
- [`data/review/README.md`](../data/review/README.md) — review CSV
