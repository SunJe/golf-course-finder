# 골프장 링크·전화번호 보강 (Enrichment)

홈페이지 URL, 예약 링크, 전화번호를 **Supabase `public.golf_courses`에 반영**하기 위한 보강용 CSV와 SQL 생성 파이프라인입니다.

> **이번 단계(네이버 가격 후보)** 에서는 예약 링크(`booking_url`)를 수집하지 않습니다. 가격 후보도 DB에 자동 반영하지 않습니다.

## 네이버 가격 후보 수집 (검토용)

골프장명·주소·네이버 검색/플레이스에서 확인 가능한 **가격 후보**를 CSV로 쌓습니다. 사람이 검토한 뒤 별도 단계에서 DB 반영합니다.

### 절차

1. **후보 수집 (검색 URL 또는 API)**
   ```bash
   npm run collect:naver-price-candidates -- --limit 10
   ```
2. **Playwright 브라우저 수집** (`--scrape` 명시 시에만)
   ```bash
   npm run collect:naver-price-candidates -- --only "인천그랜드" --scrape
   npm run collect:naver-price-candidates -- --limit 10 --scrape --delay-ms 3000
   ```
3. **후보 확인** — `data/enrichment/naver_price_candidates.csv`
4. **검토** — `data/enrichment/naver_price_review.csv` (Excel)
5. `approve_phone` / `approve_homepage` / `approve_price` 및 review 컬럼 입력
6. **연락처·홈페이지 merge** — `npm run merge:approved-naver-contacts`
7. **가격 승인 merge** — `npm run merge:approved-naver-prices`
8. **SQL 생성** — `npm run generate:course-links-sql` (phone/homepage만)
9. Supabase SQL Editor에서 **수동 실행**

### 검토 → 반영 전체 절차

1. **후보 수집**
   ```bash
   npm run collect:naver-price-candidates -- --limit 50 --scrape
   ```
2. **`naver_price_review.csv` 열기** (Excel)
3. **phone 승인:** `approve_phone = y`, `review_phone` 확인 (비어 있으면 `candidate_phone` 사용)
4. **homepage 승인:** `approve_homepage = y`, `review_homepage_url` 확인
5. **price 승인:** `approve_price = y`, `review_price_min` / `review_price_max` / `review_price_type` 확인
6. **난이도/평균스코어 승인:** `approve_difficulty = y`, `approve_avg_score = y` (선택)
7. **연락처·홈페이지 merge**
   ```bash
   npm run merge:approved-naver-contacts
   ```
8. **가격 승인 merge**
   ```bash
   npm run merge:approved-naver-prices
   ```
9. **코스 통계 merge** (난이도·평균스코어 — DB 미반영)
   ```bash
   npm run merge:approved-naver-stats
   ```
10. **SQL 생성** (phone/homepage만)
    ```bash
    npm run generate:course-links-sql
    ```
11. Supabase SQL Editor에서 **수동 실행**

### 배치 수집 (Playwright)

한 번에 532개를 돌리지 말고 **소량씩** 진행합니다.

```bash
# 첫 20개 (이미 수집된 id는 skip)
npm run collect:naver-price-candidates -- --limit 20 --scrape --delay-ms 3000

# 다음 20개
npm run collect:naver-price-candidates -- --offset 20 --limit 20 --scrape --delay-ms 3000

# 50개씩
npm run collect:naver-price-candidates -- --limit 50 --scrape --delay-ms 4000

# 안전 배치 (점검 → 백업 → 수집 → 품질 리포트 → normalize → build)
npm run collect:naver-safe-batch -- --limit 50

# 점검만 (백업/수집/normalize/build 없음)
npm run collect:naver-safe-batch -- --limit 50 --dry-run

# 전체 수집 (first missing index부터 batch 반복)
npm run collect:naver-safe-all -- --batch-size 50 --dry-run
npm run collect:naver-safe-all -- --batch-size 50 --delay-ms 3000

# 기존 후보 빈칸만 보강 (approve/review·기존 candidate 값 보존)
npm run collect:naver-price-candidates -- --offset 0 --limit 20 --scrape --force --fill-missing-only --delay-ms 3000
```

- `--scrape` 없으면 검색 URL만 생성
- review CSV의 `approve_*` / `review_*` 입력값은 **재수집 시 보존**
- **`--fill-missing-only`**: 기존 `candidate_*` 값은 유지하고, 비어 있는 phone/homepage/price/difficulty/avg_score만 새 후보로 채움
- **`--force --fill-missing-only`**: 범위 내 골프장을 다시 스크래핑하되, 승인·검토값과 이미 채워진 candidate 필드는 덮어쓰지 않음

### 검색어 변형 (query variant)

정식 골프장명으로 네이버 검색이 잘 안 잡히는 경우, 아래 변형 검색어를 순차 시도합니다.

| 변형 | 예 |
|------|-----|
| `original` | `인천그랜드컨트리클럽` |
| `normalized` | `(회원제)`·`(주)`·`주식회사` 제거 |
| `cc` / `c_dot_c` | `컨트리클럽` → `CC` / `C.C` |
| `gc` / `g_dot_c` | `골프클럽` → `GC` / `G.C` |
| `no_golf_course` | `골프장` 제거 |
| `naver` / `green_fee` / `naver_reservation` | `{이름} 네이버`, `{이름} 그린피`, `{이름} 네이버 예약` |

후보 CSV 컬럼:

| 컬럼 | 설명 |
|------|------|
| `query_variant` | 성공한 검색어 유형 (`cc`, `gc`, `naver` 등) |
| `attempted_queries` | 이번 수집에서 시도한 검색어 목록 (` \| ` 구분) |
| `matched_query` | 실제 후보를 찾은 검색어 |

### Review UI (로컬 전용)

후보 CSV를 빠르게 검수·승인하는 개발 도구입니다. **DB에 자동 반영하지 않습니다.**

1. `.env.local`에 `REVIEW_ADMIN_ENABLED=true` 추가
2. `npm run dev` 실행
3. 브라우저에서 `/admin/naver-review` 접속
4. `source_url`을 **새 탭**으로 열어 네이버 페이지와 나란히 비교
5. 후보값 승인 또는 `review_*` 필드 직접 수정 후 **저장**
6. **저장 후 다음**으로 pending 항목 순차 검수
7. merge 스크립트 실행 (`merge:approved-naver-contacts` 등)
8. phone/homepage만 SQL 생성 후 Supabase **수동** 반영
9. price/stats는 override CSV로 보관

```bash
# .env.local
REVIEW_ADMIN_ENABLED=true
```

주의:

- **로컬 전용** — `NODE_ENV=production` 또는 `VERCEL_ENV=production`(Vercel 배포)에서는 페이지·API 모두 **404**
- **Vercel production 환경 변수에 `REVIEW_ADMIN_ENABLED`를 넣지 마세요** — 실수로 설정해도 production에서는 차단되지만, preview/staging 혼동을 피하기 위해 로컬 `.env.local`에만 두세요
- `REVIEW_ADMIN_ENABLED=true` 없으면 접근 불가
- iframe 삽입 없음 — source_url 새 탭 비교 방식
- 난이도는 CSV에 **숫자만** 저장 (`9`, `2.3`). UI에서만 `/10` 표시
- `review_difficulty`에 `9/10` 입력 시 저장 전 `9`로 normalize

---

### 가격·예약 정책

- **네이버 예약 패널**에 보이는 금액만 `candidate_price_text` / min / max에 저장
- 네이버 예약 패널에 금액이 **없으면** 가격 필드는 **비움**
- 블로그·본문·다른 검색 결과의 금액은 **가격 후보로 사용하지 않음**
- **예약 링크(`booking_url` / `candidate_booking_url`)는 수집하지 않음**
- 가격은 DB에 **자동 반영하지 않음** — review CSV 승인 후 merge 단계

### `course_stats_overrides.csv` (난이도·평균스코어)

```csv
id,name,difficulty,avg_score,reservation_prices_text,source_url,source,checked_at,note
```

| 컬럼 | 설명 |
|------|------|
| `difficulty` | 코스 난이도 **숫자만** (예: `2.3`) — UI 표시 시 `/10` 붙임 |
| `avg_score` | 평균 스코어/타수 |
| `reservation_prices_text` | 네이버 예약 그린피 원문 (참고용) |

**DB 반영 없음** — Supabase schema에 해당 컬럼이 없습니다. 추후 UI/DB 설계 후 반영합니다.

### merge overwrite 정책

| 파일 | 기본 | `--overwrite` |
|------|------|-----------------|
| `course_links.csv` (phone/homepage) | 기존 값 있으면 **skip** | 승인 값으로 **덮어쓰기** |
| `course_price_overrides.csv` | 기존 가격 있으면 **skip** | 승인 값으로 **덮어쓰기** |
| `course_stats_overrides.csv` | 기존 통계 있으면 **skip** | 승인 값으로 **덮어쓰기** |

`booking_url`은 merge/SQL 어느 단계에서도 **수정·생성하지 않습니다.**

### `course_price_overrides.csv` (가격 승인 관리)

가격은 변동성이 크므로 **`course_links.csv`에 넣지 않고** 별도 파일로 관리합니다.

```csv
id,name,price_text,price_min,price_max,price_type,source_url,source,checked_at,note
```

| 컬럼 | 설명 |
|------|------|
| `price_text` | 사람이 확인한 **원문 가격** |
| `price_min` / `price_max` | 숫자 범위 |
| `price_type` | `green_fee` / `reservation_price` / `weekday_green_fee` / `weekend_green_fee` / `unknown` |
| `source_url` | 출처 (필수 관리) |
| `source` | `naver` / `official` / `manual` |
| `checked_at` | 확인 시각 ISO |

**가격 DB 반영:** 이번 단계에서는 **자동 반영하지 않습니다.** Supabase schema의 `weekday_green_fee_min` 등과 의미 매핑을 확인한 뒤 별도 단계에서 SQL/파이프라인을 만듭니다. 가격은 반드시 `source_url`과 `checked_at`을 함께 관리합니다.

### CLI 예시

```bash
# 특정 골프장 — Playwright 수집 (소량 테스트)
npm run collect:naver-price-candidates -- --only "인천그랜드" --scrape --headful

# 10개 Playwright 수집 (요청 간 delay)
npm run collect:naver-price-candidates -- --limit 10 --scrape --delay-ms 3000

# 검색 URL만 (API/스크래핑 없음)
npm run collect:naver-price-candidates -- --limit 20

# 다시 수집 (전체 덮어쓰기)
npm run collect:naver-price-candidates -- --only "인천그랜드" --scrape --force

# 빈칸만 보강 (승인·기존 값 보존)
npm run collect:naver-price-candidates -- --limit 20 --scrape --force --fill-missing-only --delay-ms 3000
```

### `naver_price_candidates.csv` 헤더

```csv
id,name,address,query,query_variant,attempted_queries,matched_query,source,candidate_title,candidate_address,candidate_phone,candidate_homepage_url,candidate_price_text,candidate_price_min,candidate_price_max,candidate_price_type,candidate_difficulty,candidate_difficulty_text,candidate_avg_score,candidate_reservation_prices_text,candidate_confidence,needs_review,reason,source_url,collected_at
```

| 컬럼 | 설명 |
|------|------|
| `candidate_phone` | 네이버 화면에서 추출한 **전화번호 후보** |
| `candidate_homepage_url` | 공식 홈페이지로 보이는 URL 후보 (naver 블로그/카페 제외) |
| `candidate_price_text` | 네이버 **예약 패널** 원문 가격 (없으면 빈칸) |
| `candidate_price_min` / `max` | 숫자 파싱 가능할 때만 채움 |
| `candidate_price_type` | `green_fee` / `reservation_price` / `unknown` |
| `candidate_difficulty` | 코스 난이도 **숫자만** (예: `9`, `2.3`) |
| `candidate_difficulty_text` | 원문 (예: `9/10`) — 참고용 |
| `candidate_confidence` | `high` / `medium` / `low` |
| `needs_review` | 항상 `true` — 자동 확정하지 않음 |
| `source_url` | 네이버 검색·플레이스 출처 URL |

### `naver_price_review.csv` 헤더

```csv
id,name,address,candidate_title,candidate_address,candidate_phone,candidate_homepage_url,candidate_price_text,candidate_price_min,candidate_price_max,candidate_price_type,candidate_difficulty,candidate_difficulty_text,candidate_avg_score,candidate_reservation_prices_text,source_url,confidence,approve_phone,approve_homepage,approve_price,approve_difficulty,approve_avg_score,review_phone,review_homepage_url,review_price_min,review_price_max,review_price_type,review_difficulty,review_avg_score,review_note
```

| 검토 컬럼 | 설명 |
|-----------|------|
| `approve_phone` / `approve_homepage` / `approve_price` | `y` / `n` |
| `review_phone` / `review_homepage_url` | 사람이 확정한 값 |
| `review_price_min` / `max` / `type` | 사람이 확정한 가격 |
| `review_difficulty` | **숫자만** (예: `2.3`) — UI 표시 시 `/10` 붙임 |

### 수집 방식

| 조건 | 동작 |
|------|------|
| 기본 (옵션 없음) | Naver API 있으면 Local Search, 없으면 **검색 URL** 후보만 |
| `--scrape` | **Playwright**로 네이버 검색 페이지 접근 → phone/homepage/price 후보 추출 |
| `--headful` | 디버깅용 — 브라우저 창 표시 |
| `--delay-ms 3000` | 요청 간 delay (기본 3000ms) |
| `--fill-missing-only` | 기존 candidate 빈칸만 보강 (`--force`와 함께 사용 권장) |
| Naver Local Search API | 장소명·주소·전화·링크 (가격 필드 **미제공**) |

**Playwright 사전 준비 (최초 1회):**

```bash
npx playwright install chromium
```

### 주의

- **Naver API는 가격 정보를 제공하지 않습니다.** 가격은 `--scrape` 또는 수동 확인이 필요합니다.
- Playwright 수집은 **`--scrape`를 명시했을 때만** 실행합니다. 기본값은 비활성입니다.
- **532개 전체를 한 번에 돌리지 마세요.** 1개 → 10개 → 20개 순으로 테스트합니다.
- 수집 결과는 **후보일 뿐**이며 DB에 자동 반영하지 않습니다.
- **예약 링크(`booking_url`)는 수집하지 않습니다.**
- 전화번호·홈페이지·가격은 review CSV에서 승인(`approve_*`) 후 별도 단계에서 반영합니다.
- 네이버 **예약가**와 실제 **그린피**는 다를 수 있습니다.

---

## Schema 확인 (변경 없음)

`supabase/schema.sql` 기준으로 아래 컬럼이 **이미 존재**합니다. schema 변경은 필요 없습니다.

| CSV 컬럼 | DB 컬럼 | 타입 |
|----------|---------|------|
| `homepage_url` | `homepage_url` | `text` |
| `booking_url` | `booking_url` | `text` |
| `phone` | `phone` | `text` |

- raw import CSV (`data/golf_courses_import_geocoded_final.csv`)는 **수정하지 않습니다**.
- 보강 데이터는 **`data/enrichment/course_links.csv`** 에만 추가합니다.

## `course_links.csv` 작업표 (532개 전체)

`course_links.csv`는 예시 1줄짜리 템플릿이 **아닙니다**. 최종 import CSV 기준 **전체 532개 골프장**의 `id` / `name`이 미리 채워진 보강용 작업표입니다.

- `homepage_url`, `booking_url`, `phone` — 확인된 골프장만 나중에 채웁니다.
- `source_url`, `note` — 출처·메모 (선택)
- 빈 값 row는 SQL 생성 시 **자동 skip**됩니다 (`source_url` / `note`만 있어도 UPDATE 생성 안 함)

### 전체 row 재생성

```bash
npm run generate:course-links-template
```

- 소스: `data/golf_courses_import_geocoded_final.csv`
- 출력: `data/enrichment/course_links.csv` (header 1 + course 532 = **533줄**)
- 기존 CSV에 입력한 `homepage_url` / `booking_url` / `phone` / `source_url` / `note`는 **같은 id 기준으로 보존**
- `name`은 최종 import CSV 기준으로 갱신
- import 목록에 없는 id는 경고 후 제외

새 골프장이 import CSV에 추가·변경되면 위 명령을 다시 실행하세요.

## CSV encoding 정책

| 항목 | 정책 |
|------|------|
| 파일 형식 | **UTF-8 with BOM** (`\uFEFF`로 시작) |
| 줄바꿈 | **CRLF** (`\r\n`) — Windows / Excel 호환 |
| 필드 이스케이프 | 쉼표·따옴표·줄바꿈 포함 시 `"`로 감싸고 `""` 이스케이프 |
| Excel 저장 | **CSV UTF-8(쉼표로 분리)(*.csv)** 로 저장 권장 |
| 저장 후 확인 | 골프장명·메모 한글이 깨지지 않았는지 반드시 확인 |

스크립트는 BOM이 있어도 첫 헤더를 `id`로 정상 인식하며, mojibake(`�`, `Ã`, `ìíê` 등) 의심 문자열이 있으면 **warning**을 출력합니다.

### Excel과 난이도 컬럼 주의

- Excel은 `9/10` 같은 값을 **날짜(9월 10일)** 로 자동 변환할 수 있습니다.
- 저장 시 CSV 값이 날짜 형식으로 **망가질 위험**이 있으므로, machine-readable 난이도 필드에는 **숫자만** 저장합니다 (`9`, `2.3`).
- 화면(UI)에서 보여줄 때만 `${value}/10` 형식으로 표시합니다.
- CSV 확인은 가능하면 **VS Code** 또는 CSV-aware 에디터를 사용하세요.
- Excel에서 편집해야 한다면 해당 컬럼을 **텍스트**로 가져오거나, `review_difficulty`에는 **숫자만** 입력하세요.
- 기존 `9/10` 형식 데이터는 `npm run normalize:naver-stats`로 일괄 변환할 수 있습니다.

```bash
npm run normalize:naver-stats
```

## `course_links.csv` 헤더

```csv
id,name,homepage_url,booking_url,phone,source_url,note
```

| 컬럼 | 필수 | 설명 |
|------|------|------|
| `id` | ✅ | `gc-...` course id (최종 import CSV와 동일) |
| `name` | 참고용 | 사람이 확인하기 위한 골프장명 |
| `homepage_url` | 선택 | `http://` 또는 `https://` 로 시작 |
| `booking_url` | 선택 | `http://` 또는 `https://` 로 시작 |
| `phone` | 선택 | 숫자 / `-` / 공백 / `()` / `+` 만 허용 |
| `source_url` | 선택 | 출처 URL (SQL 주석에 기록) |
| `note` | 선택 | 메모 (SQL 주석에 기록) |

**규칙**

- 값이 **비어 있는 컬럼**은 SQL `UPDATE`에 포함하지 않습니다.
- 같은 `id`가 두 번 있으면 **에러**입니다.
- `id`가 비어 있으면 **에러**입니다.
- import CSV에 없는 `id`는 **경고**만 출력합니다.

## 작성 방법

1. `npm run generate:course-links-template`으로 532개 row 작업표를 생성·갱신합니다.
2. `data/enrichment/course_links.csv`를 Excel 또는 에디터로 엽니다.
3. 보강할 골프장 row에서 `homepage_url` / `booking_url` / `phone`만 채웁니다.
4. UTF-8 BOM + 한글 깨짐 없음을 확인합니다. (Excel 저장 시 **CSV UTF-8** 선택)
5. `npm run generate:course-links-sql`로 SQL을 생성합니다.

한글이 깨졌다면 저장하지 말고 `generate:course-links-template`을 다시 실행하세요.

### 입력 예시

```csv
id,name,homepage_url,booking_url,phone,source_url,note
gc-60319bf1693c,인천그랜드컨트리클럽,https://www.example.com/,https://www.example.com/booking,032-000-0000,https://www.example.com/,공식 홈페이지 확인
```

## SQL 생성

```bash
npm run generate:course-links-sql
```

생성 파일: **`supabase/course_links_update.sql`**

출력 SQL 예:

```sql
-- 인천그랜드컨트리클럽
-- source: https://www.example.com/
update public.golf_courses
set
  homepage_url = 'https://www.example.com/',
  booking_url = 'https://www.example.com/booking',
  phone = '032-000-0000',
  updated_at = now()
where id = 'gc-60319bf1693c';
```

- SQL 파일은 **UTF-8** (BOM 없음)으로 저장됩니다.
- 문자열 내 single quote(`'`)는 `''`로 이스케이프됩니다.

## Supabase 반영 방법

1. `npm run generate:course-links-sql` 실행 후 `supabase/course_links_update.sql` 내용을 확인합니다.
2. Supabase Dashboard → **SQL Editor**에서 해당 SQL을 붙여넣습니다.
3. **Preview / Run**으로 실행합니다.
4. `service_role` key는 로컬 스크립트에서 **사용하지 않습니다** (수동 실행만).

반영 확인 (예):

```sql
select id, name, homepage_url, booking_url, phone, updated_at
from public.golf_courses
where id = 'gc-60319bf1693c';
```

## 반복 보강

- 같은 CSV에 행을 추가하거나 값을 수정한 뒤 SQL을 **다시 생성**하면 됩니다.
- 이미 반영된 행을 다시 실행하면 값이 **덮어쓰기**됩니다.
- 부분 업데이트만 필요하면 해당 필드만 CSV에 채우고 나머지는 비워 두세요.

## 검증 요약

| 항목 | 처리 |
|------|------|
| URL | `http://` / `https://` 필수 |
| 전화번호 | `[\d\s\-()+]` 패턴 |
| id 중복 | error |
| id 누락 | error |
| unknown id | warning |
| UTF-8 BOM | read 시 자동 처리 |
| mojibake | warning |

## 수동 검수 (manual_review_worklist.csv)

전체 수집 완료 후:

```bash
npm run generate:manual-review-worklist
npm run generate:enrichment-quality-report
```

- `data/enrichment/manual_review_worklist.csv` — **532 rows**, candidate + `manual_*` 입력칸
- `manual_status` 기본값: `pending` (자동 ok 처리 없음)
- `manual_*` 컬럼은 비워 둠 — 사람이 직접 입력
- 정렬: suspected_mismatch → low confidence → 빈 필드 → pending

### Excel / CSV 편집 주의

- Excel에서 `9/10`이 **날짜**로 바뀔 수 있음 → `difficulty` / `manual_difficulty`는 **숫자만** (`9`, `2.3`)
- Excel 저장 시 자동 변환 위험 — VS Code, LibreOffice CSV import, CSV-aware editor 권장
- Excel 사용 시 difficulty 컬럼을 **숫자 형식**으로 확인
- 가격 숫자 컬럼: 쉼표 없는 숫자 (`250000`). 원문은 `*_price_text`에

이번 단계에서는 worklist를 **course_links / overrides / Supabase에 merge하지 않음**.

## 직접 수정용 CSV (course_enrichment_edit.csv) — **메인 편집 파일**

```bash
npm run generate:course-enrichment-edit
```

- `data/enrichment/course_enrichment_edit.csv` — **532 rows**, 단일 편집용
- `candidate_*` / `manual_*` 컬럼 **없음**
- `change_name_to` — 최종 표시 이름 변경용 (비어 있으면 `name` 사용)
- 크롤링 후보값이 `phone`, `homepage_url`, `price_*`, `difficulty`, `avg_score` 등에 이미 채워짐
- 빈칸은 직접 수정
- `needs_check=y` 인 row가 위로 정렬됨
- **재생성해도 기존 id row는 사람이 수정한 값을 그대로 보존** (새 id만 후보값으로 추가)

보조 파일 (삭제하지 않음, 직접 수정하지 않음):

- `data/enrichment/manual_review_worklist.csv`

나중 merge 기준: `course_enrichment_edit.csv` → `course_enrichment_upload.csv` / Supabase SQL

| 빈 row (url/phone 없음) | SQL UPDATE skip |

## 업로드용 CSV / Supabase SQL 생성

```bash
npm run generate:course-enrichment-upload
```

`course_enrichment_edit.csv`를 검증한 뒤 아래 파일을 생성합니다.

| 파일 | 용도 |
|------|------|
| `course_enrichment_upload.csv` | 최종 표시 이름(`change_name_to` 반영) + 추적용 `original_name` |
| `course_enrichment_update.sql` | Supabase `golf_courses` 전체 UPDATE (name/phone/homepage_url만) |
| `course_enrichment_update_preview.sql` | 테스트용 상위 20건 |
| `course_price_stats_upload.csv` | 가격/난이도/평균스코어 보관용 (DB 미반영) |

### 이름 규칙

- `change_name_to`가 비어 있지 않으면 **최종 표시/업로드용 name** = `change_name_to`
- 비어 있으면 기존 `name` 사용
- `naver_price_candidates.csv` 등 raw/candidate 파일은 **수정하지 않음**

### SQL 반영 범위

- **포함**: `name` (change_name_to 있을 때만), `phone`, `homepage_url`
- **제외**: `booking_url`, `price_*`, `difficulty`, `avg_score`
- SQL은 **자동 실행하지 않음** — Supabase SQL Editor에서 직접 확인 후 실행

### Vercel / 로컬 확인 방법

앱이 build 시 Supabase에서 course를 읽어 정적 페이지를 생성하므로, **Supabase SQL만 실행해도 Vercel 화면이 바로 바뀌지 않을 수 있습니다.** 데이터 반영 후 **Vercel redeploy**가 필요할 수 있습니다.

**로컬에서 먼저 확인:**

1. Supabase SQL Editor에서 `course_enrichment_update_preview.sql` 실행
2. `.env.local`이 Supabase를 바라보는지 확인
3. `npm run build`
4. `npm run start` 또는 `npm run dev`
5. 변경된 course 상세 페이지에서 이름/전화번호/홈페이지 확인

**Vercel에서 확인:**

1. Supabase SQL Editor에서 SQL 실행 (preview → full)
2. Vercel redeploy 또는 git push
3. 배포 URL에서 해당 골프장 검색/상세 페이지 확인

### Preview SQL 적용 후 체크리스트

Supabase에 **20건만** 먼저 반영할 때 아래 순서로 확인합니다.

- [ ] Supabase SQL Editor에서 `course_enrichment_update_preview.sql` **만** 실행 (full SQL은 아직 실행하지 않음)
- [ ] 로컬 `.env.local`이 대상 Supabase를 바라보는지 확인
- [ ] `npm run build`
- [ ] `npm run start` 또는 `npm run dev`
- [ ] preview에 포함된 골프장 **3곳** 검색 (예: 드림파크CC, 뉴스프링빌CC, 가산CC)
- [ ] 목록·상세 페이지에서 **이름 변경**, **전화번호**, **홈페이지** 링크가 기대값과 일치하는지 확인
- [ ] 문제 없으면 `course_enrichment_update.sql` 전체 실행 검토
- [ ] Vercel 반영 시: SQL 실행 후 **redeploy** 또는 git push (SSG이므로 DB만 바꿔도 배포 화면은 즉시 안 바뀔 수 있음)

**이번 단계에서 DB에 넣지 않음:** `difficulty`, `avg_score`, `booking_url`

## 요금(price) DB 반영

### 1. 컬럼 추가 (최초 1회)

Supabase SQL Editor에서 수동 실행:

```bash
# 파일: data/enrichment/add_price_columns.sql
```

추가 컬럼: `price_text`, `price_min`, `price_max`, `price_type`, `price_source_url`, `price_updated_at`

### 2. 가격 UPDATE SQL 생성

```bash
npm run generate:course-price-update
```

| 파일 | 내용 |
|------|------|
| `course_price_update_preview.sql` | 가격 있는 row 상위 20건 |
| `course_price_update.sql` | 가격 있는 전체 row (현재 ~181건) |

입력: `course_enrichment_edit.csv` (네이버 예약 패널 가격만)

### 3. 테스트 순서

1. `add_price_columns.sql` 실행
2. `course_price_update_preview.sql` 실행
3. `.next` 삭제 후 `npm run build` → `npm run dev`
4. 카드/상세 **예약가** 표시, 가격대 필터 확인
5. 문제 없으면 `course_price_update.sql` 전체 실행
6. Vercel redeploy

가격 없는 골프장: **요금 정보 준비 중**

### 가격 필터 정책 (앱)

| 항목 | 정책 |
|------|------|
| 필터 기준 | Supabase `price_min` only (`weekdayGreenFeeMin` / mock 미사용) |
| 필터 미선택 | 가격 없는 골프장 **포함** |
| 필터 선택 | `price_min` 없으면 **제외** |
| 다중 선택 | 같은 가격 그룹 **OR** (예: 10~15 + 15~20 → 10만 초과 20만 이하) |
| 다른 필터와 | **AND** (지역 OR × 가격 OR × …) |
| `price_max` | 카드/상세 **표시용**, 필터 기준 아님 |
| `price_text` | 상세 **원문 표시용** |
| 데이터 출처 | 네이버 예약 패널 후보값 — **변동 가능**, 확정가 아님 |

**UI 라벨:** 데스크탑 `최저 예약가` / 모바일 필터 시트 `예약가`

**옵션:** 전체 · 10만원 이하 · 10~15만원 · 15~20만원 · 20만원 이상

```bash
npm run verify:price-filter
```

### 필터 중복 선택

지역·홀수·운영·가격대·태그 모두 **다중 선택** (칩 toggle). 같은 그룹 OR, 그룹 간 AND.

### SQL 했는데 화면이 안 바뀔 때

1. **Supabase에 실제 반영됐는지 먼저 확인** (Table Editor 또는 아래 쿼리)
   ```sql
   select id, name, phone, homepage_url
   from public.golf_courses
   where id = 'gc-1f14d0ca89b4';
   ```
   `name`이 `가산CC`면 DB 반영은 된 것입니다.

2. **실행 순서가 중요합니다** — 반드시 이 순서:
   - ① Supabase SQL 실행
   - ② **`.next` 폴더 삭제** (예전 build 캐시 제거)
   - ③ `npm run build`
   - ④ `npm run start` 또는 `npm run dev` (**이전 서버 프로세스는 종료 후 재실행**)

   PowerShell:
   ```powershell
   Remove-Item -Recurse -Force .next
   npm run build
   npm run start
   ```

3. **`npm run dev`도 예전 `.next`를 재사용할 수 있습니다.** SQL만 실행하고 옛 `.next`가 남아 있으면 dev에서도 옛 이름(예: 마이다스 구미 골프아카데미)이 보일 수 있습니다. Supabase Table Editor에서 `name`이 이미 바뀌었는데 앱만 안 바뀌면 **거의 항상 이 캐시 문제**입니다.

4. **`npm run start`는 `.next` 빌드 결과를 씁니다.** SQL 이후 rebuild 없이 start하면 반영되지 않습니다.

5. **Vercel URL**을 보고 있다면 로컬 rebuild만으로는 안 바뀝니다 → redeploy 필요.

6. **데이터 소스 확인:** 앱은 Supabase `public.golf_courses`만 읽습니다 (mock은 env 없을 때만). 로컬 CSV는 앱 런타임에 사용하지 않습니다.

7. **검색어 주의:** `가산`은 이름뿐 아니라 **주소의 `가산면`**도 매칭합니다. 그래서 `푸른솔 골프클럽 포천`(포천시 가산면)도 함께 나올 수 있습니다. 이름 변경 확인은 **`가산CC`로 검색**하거나 `/courses/gc-1f14d0ca89b4` 상세 페이지를 직접 여세요.
```bash
npx tsx scripts/checkPreviewCourses.ts
```
