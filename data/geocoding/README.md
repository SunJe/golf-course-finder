# Geocoding Data

Phase 2.5+ geocoding 입력/결과 파일입니다.

## 파일

| 파일 | 설명 |
|------|------|
| `geocoding_input.csv` | geocoding API 입력 |
| `geocoding_sample_results.csv` | **Phase 3 샘플** 결과 (20건) |
| `geocoding_results.csv` | 전체 execute 성공 결과 (다음 단계) |
| `geocoding_failures.csv` | 실패·no_result·low_confidence |
| `geocoding_cache.json` | query 캐시 (중복 호출 방지) |

품질 리포트: `data/review/geocoding_quality_report.md`

## API key (.env.local)

```env
# JavaScript 지도 SDK용 — geocoding에 사용하지 않음
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=...

# Geocoding REST API용 — NEXT_PUBLIC_ 접두사 금지
KAKAO_REST_API_KEY=your_kakao_rest_api_key

# 대안
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
```

## 실행 (Phase 3: 샘플 20건)

```bash
# dry-run (기본, limit 20)
npm run geocode:golf-courses -- --dry-run --limit 20

# 샘플 실제 실행
npm run geocode:golf-courses -- --execute --limit 20 --provider kakao

# 전체 실행 (다음 단계, manual_questions 검토 후)
npm run geocode:golf-courses -- --execute --provider kakao
```

## CLI 옵션

| 옵션 | 설명 |
|------|------|
| `--dry-run` | API 미호출 (기본) |
| `--execute` | 실제 API 호출 |
| `--limit N` | 처리 행 수 |
| `--offset N` | 시작 offset |
| `--provider kakao\|naver` | 기본 kakao |

## 출력 정책

- `golf_courses_import.csv` **덮어쓰지 않음**
- 샘플 → `geocoding_sample_results.csv`
- 전체 → `golf_courses_import_geocoded.csv` (별도 파일)
- low_confidence / multiple_candidates → 최종 import 미반영
