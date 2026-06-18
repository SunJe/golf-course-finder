# Final Sanity Check Report

> Generated: 2026-06-18T02:58:20.704Z

## 대상 파일

- `data/golf_courses_import_geocoded_final.csv` (532 rows)

## 문자열 검색 결과

| 패턴 | 발견 건수 |
|------|-----------|
| ounty (Latin fragment) | 0 |
| 카ounty (Latin mixed) | 0 |
| 골프존카+Latin (should be 골프존카운티) | 0 |
| replacement char (�) | 0 |
| Ã (mojibake) | 0 |
| ë (mojibake) | 0 |
| ì (mojibake) | 0 |
| û (mojibake) | 0 |
| literal undefined | 0 |
| literal null | 0 |
| literal NaN | 0 |

## 골프존카운티 표기 확인

- **골프존카운티 포함 행:** 18건
- **Latin 혼입 자동 수정:** 0건
- **골프존카+Latin 잔존:** 0건

### 골프존카운티 행 샘플

- `gc-ba3362c686e4` **골프존카운티 안성H** — Latin 잔존: no
- `gc-411771a420e7` **골프존카운티 안성W** — Latin 잔존: no
- `gc-945ef0204a99` **골프존카운티 사천** — Latin 잔존: no
- `gc-09693194d3fb` **골프존카운티 경남** — Latin 잔존: no
- `gc-96bed6159452` **골프존카운티 감포** — Latin 잔존: no
- `gc-6a587177a23c` **골프존카운티 선산** — Latin 잔존: no
- `gc-a944350f5db1` **골프존카운티 구미** — Latin 잔존: no
- `gc-01d6a94bf335` **골프존카운티 청통** — Latin 잔존: no
- … 외 10건


## Schema / CSV 형식 확인

- **schema columns:** 27
- **CSV columns:** 27
- **이름/순서 일치:** yes
- **boolean 형식 (true/false):** 통과
- **integer 형식 (숫자 또는 빈 값):** 통과
- **tags 형식 ({} 빈 배열):** 통과 (532/532 rows = {})

> **tags import 참고:** CSV 값 `{}`는 PostgreSQL `text[]` 빈 배열 리터럴과 동일합니다. Supabase Table Editor CSV import에서 거부되면 SQL `COPY` 또는 `{}` → 빈 칸 후 default 사용을 검토하세요.

## 판정

- **업로드 직전 sanity check: 통과** — blocking 이상 문자열 없음

## 상세 hit 목록

_blocking hit 없음_

## CC/GC 등 정상 약어

CC, GC, C.C, G.C 등은 수정하지 않았습니다. name quality warning은 `data/review/final_name_quality_warnings.csv`를 참고하세요.
