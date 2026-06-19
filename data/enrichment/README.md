# 골프장 링크·전화번호 보강 (Enrichment)

홈페이지 URL, 예약 링크, 전화번호를 **Supabase `public.golf_courses`에 반영**하기 위한 보강용 CSV와 SQL 생성 파이프라인입니다.

## Schema 확인 (변경 없음)

`supabase/schema.sql` 기준으로 아래 컬럼이 **이미 존재**합니다. schema 변경은 필요 없습니다.

| CSV 컬럼 | DB 컬럼 | 타입 |
|----------|---------|------|
| `homepage_url` | `homepage_url` | `text` |
| `booking_url` | `booking_url` | `text` |
| `phone` | `phone` | `text` |

- raw import CSV (`data/golf_courses_import_geocoded_final.csv`)는 **수정하지 않습니다**.
- 보강 데이터는 **`data/enrichment/course_links.csv`** 에만 추가합니다.

## CSV encoding 정책

| 항목 | 정책 |
|------|------|
| 파일 형식 | **UTF-8 with BOM** (`\uFEFF`로 시작) |
| 줄바꿈 | **CRLF** (`\r\n`) — Windows / Excel 호환 |
| 필드 이스케이프 | 쉼표·따옴표·줄바꿈 포함 시 `"`로 감싸고 `""` 이스케이프 |
| Excel 저장 | **CSV UTF-8(쉼표로 분리)(*.csv)** 로 저장 권장 |
| 저장 후 확인 | 골프장명·메모 한글이 깨지지 않았는지 반드시 확인 |

스크립트는 BOM이 있어도 첫 헤더를 `id`로 정상 인식하며, mojibake(`�`, `Ã`, `ìíê` 등) 의심 문자열이 있으면 **warning**을 출력합니다.

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

1. `data/enrichment/course_links.csv`를 Excel 또는 에디터로 엽니다.
2. 보강할 골프장 한 줄씩 추가합니다. `id`는 `data/golf_courses_import_geocoded_final.csv`에서 복사합니다.
3. 채울 필드만 입력합니다 (나머지는 빈 칸).
4. UTF-8 BOM + 한글 깨짐 없음을 확인합니다.
5. 아래 SQL 생성 명령을 실행합니다.

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
