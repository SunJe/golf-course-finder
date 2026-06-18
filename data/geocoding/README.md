# Geocoding Data

Phase 2.5에서 생성된 geocoding 입력/결과 파일입니다.

## 파일

| 파일 | 설명 |
|------|------|
| `geocoding_input.csv` | geocoding API 입력 (id, name, address, query) |
| `geocoding_results.csv` | geocoding 성공 결과 (실행 후 채움) |
| `geocoding_failures.csv` | 실패·빈 주소·0건 결과 |
| `geocoding_cache.json` | address/query 캐시 (중복 API 호출 방지) |

## query 생성 규칙

1. 기본: `address`
2. address가 짧거나(<12자) 시·도 접두가 없으면: `name + city + address`
3. 빈 address → `geocoding_failures.csv`로 사전 분리

## 실행

```bash
# dry-run (기본)
npm run geocode:golf-courses

# 실제 API 호출 (다음 단계)
npm run geocode:golf-courses -- --execute
```

## API key (.env.local)

- `KAKAO_REST_API_KEY` — Kakao Local API (주소→좌표). **지도 JS 키와 다름**
- `NAVER_CLIENT_ID` + `NAVER_CLIENT_SECRET` — Naver Geocoding (대안)

## 출력 정책

- `golf_courses_import.csv`는 **직접 덮어쓰지 않음**
- 좌표 보강 결과는 `data/golf_courses_import_geocoded.csv` (execute 후 별도 생성)
- latitude/longitude 임의 생성 금지, WGS84 검증
