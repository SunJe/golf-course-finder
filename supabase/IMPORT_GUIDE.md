# Supabase Import Guide — GolfMap Korea

골프장 데이터(`data/golf_courses_import_geocoded_final.csv`, **532 rows**)를 Supabase `golf_courses` 테이블에 업로드하는 절차입니다.

> **이 단계에서는 DB import만 수행합니다.**  
> 앱(`app/page.tsx`, `courseRepository` 등)은 **아직 mock data**를 사용합니다. import 성공을 확인한 뒤 별도 작업에서 Supabase fetch로 전환합니다.

---

## 사전 준비

| 항목 | 상태 |
|------|------|
| 최종 CSV | `data/golf_courses_import_geocoded_final.csv` (532 rows, 좌표 100%) |
| Schema | `supabase/schema.sql` |
| 업로드 후 검증 SQL | `supabase/verify_import.sql` |
| Sanity check | `data/review/final_sanity_check_report.md` |
| Import readiness | `data/review/supabase_import_readiness.md` |

**수정하지 않는 파일**

- `data/raw/ministry_golf_courses.csv`
- `data/golf_courses_import.csv`

---

## 1. Supabase 프로젝트 접속

1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. GolfMap Korea용 프로젝트 선택 (없으면 새 프로젝트 생성)
3. **Project Settings → API**에서 아래 값을 확인 (값은 문서에 기록하지 마세요)
   - Project URL → `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `.env.local`의 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 환경변수 (다음 단계 fetch용 — 지금은 import만)

`.env.local` (git 커밋 금지):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase REST/Realtime 엔드포인트 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저 클라이언트용 anon key |

**주의**

- `service_role` key는 **프론트엔드·브라우저에 넣지 않습니다.**
- CSV import는 Dashboard Table Editor 또는 SQL로 수행하며, anon key만으로는 bulk import가 제한될 수 있습니다.
- 실제 key 값은 `.env.local`에만 보관하고 저장소·문서에 넣지 마세요.

---

## 2. SQL Editor에서 schema 실행

1. Dashboard → **SQL Editor** → **New query**
2. `supabase/schema.sql` 전체 내용 붙여넣기
3. **Run** 실행
4. 성공 메시지 확인 (`create table`, `create index` 등)

테이블 정의 요약:

- **27 columns** — CSV 헤더와 이름·순서 일치
- `latitude`, `longitude` — **NOT NULL** (현재 final CSV는 532행 모두 좌표 보유 → import 가능)
- `tags` — `text[]`, default `'{}'`
- boolean 컬럼 — CSV 값 `true` / `false`

---

## 3. Table Editor에서 테이블 확인

1. **Table Editor** → `golf_courses`
2. 컬럼 27개 존재 확인
3. 행이 0건인 상태(신규 테이블)인지 확인

기존 데이터가 있다면 import 전 **truncate 또는 backup** 정책을 팀에서 결정하세요.

```sql
-- 개발 환경에서만: 기존 데이터 삭제 후 재import
-- truncate table public.golf_courses;
```

---

## 4. CSV import

**파일:** `data/golf_courses_import_geocoded_final.csv`  
**인코딩:** UTF-8 (Excel 더블클릭 편집 시 한글 깨짐 주의 — Cursor/VS Code 사용 권장)

### 방법 A — Table Editor (권장: 소량·검증용)

1. Table Editor → `golf_courses` → **Insert** → **Import data from CSV**
2. CSV 파일 선택
3. 헤더 행 매핑 확인 (컬럼명이 schema와 1:1 일치해야 함)
4. Import 실행

### 방법 B — SQL COPY (대량·tags/boolean 이슈 시)

Dashboard SQL Editor 또는 `psql`에서 CSV 경로를 지정해 import합니다.  
로컬 파일 경로는 Supabase 호스팅 환경에 따라 다릅니다. 필요 시 CSV를 Storage에 올리거나 `psql \copy` 사용.

### Import 시 알아둘 형식

| CSV 컬럼 | 값 예 | DB 타입 |
|----------|-------|---------|
| `tags` | `{}` | `text[]` 빈 배열 |
| `night_round` 등 | `true` / `false` | `boolean` |
| `hole_count` 등 | `18` 또는 빈 칸 | `integer` / NULL |
| `updated_at`, `created_at` | `2026-06-18T01:00:04.006Z` | `timestamptz` |

`tags`가 `{}`로 import 실패하면 빈 칸으로 두고 DB default `'{}'`를 사용하거나, SQL `COPY`로 import하세요.

---

## 5. 업로드 후 row count 확인

SQL Editor에서 `supabase/verify_import.sql` 실행.

**기대값**

```text
total_rows = 532
```

---

## 6. 좌표 누락 확인

```sql
select count(*) from public.golf_courses where latitude is null or longitude is null;
-- 기대: 0
```

---

## 7. 중복 id 확인

```sql
select id, count(*) from public.golf_courses group by id having count(*) > 1;
-- 기대: 0 rows
```

---

## 8. region / course_type 분포 확인

`verify_import.sql`의 분포 쿼리 결과가 아래 집합과 일치하는지 확인:

**region:** 서울, 경기, 강원, 충청, 전라, 경상, 제주  
**course_type:** 대중제, 회원제, 군 골프장, 기타

---

## 9. 문제 없으면 다음 단계

- [ ] `verify_import.sql` 모든 검증 통과
- [ ] **`supabase/enable_public_read.sql` 실행** — anon key로 앱 fetch 가능 (RLS SELECT policy)
- [ ] `final_sanity_check_report.md` 재확인
- [ ] `.env.local`에 Supabase URL / anon key 설정 (값은 커밋하지 않음)
- [ ] **그 다음 PR/작업:** `courseRepository` 등을 Supabase fetch로 전환
- [ ] 전환 전까지 앱은 mock data로 정상 동작 유지

---

## Import 후에도 유지해야 하는 앱 기능 (mock 단계)

전환 전 regression 기준:

- 메인 페이지, 지도, 검색, 필터
- 지도 기준 보기 / 전체 결과 보기
- 카드 hover / click, 마커 click, 클러스터 click
- 상세 페이지, 외부 카카오맵·네이버지도 링크
- 모바일 레이아웃

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `supabase/schema.sql` | 테이블 DDL |
| `supabase/verify_import.sql` | 업로드 후 검증 쿼리 |
| `data/review/final_sanity_check_report.md` | 문자열 sanity check |
| `data/review/supabase_import_readiness.md` | import 가능 판정 |
| `data/review/final_name_quality_warnings.csv` | 이름 CC/GC 등 warning |
| `.env.local.example` | 환경변수 템플릿 |

---

## 로컬 검증 명령 (업로드 전)

```bash
npm run validate:final-import -- --file data/golf_courses_import_geocoded_final.csv
npx tsx scripts/finalSanityCheck.ts
npm run build
```
