# Geocoding Quality Report — Phase 3 Sample

> Generated: 2026-06-18T01:45:11.682Z

## 실행 정보

- **mode:** execute
- **provider:** kakao
- **limit:** 20
- **offset:** 0
- **geocoding_input 총 행 수:** 534
- **샘플 처리 행 수:** 20
- **실제 API 호출 실행:** true

## API key 존재 여부 (값 미표시)

- KAKAO_REST_API_KEY: true
- NAVER_CLIENT_ID: false
- NAVER_CLIENT_SECRET: false

## status별 개수

- success: 20
- no_result: 0
- low_confidence: 0
- multiple_candidates: 0
- api_error: 0
- skipped: 0

## 좌표 품질 검증

- 한국 WGS84 범위 검증: 통과
- success 건 region/city 일치: 20건
- low_confidence / multiple_candidates는 **최종 import 미반영**

## success 목록 (상위 10)

- 라데나골프클럽 (강원/춘천시) → 37.8369429213366, 127.715838891863 — 강원특별자치도 춘천시 신동면 칠전동길 72
- 엘리시안 강촌컨트리클럽 (강원/춘천시) → 37.8300557977982, 127.57878172946 — 강원특별자치도 춘천시 남산면 북한강변길 688
- 제이드팰리스 골프클럽 (강원/춘천시) → 37.8307797553449, 127.548170460554 — 강원특별자치도 춘천시 남산면 경춘로 212-30
- 남춘천컨트리클럽 (강원/춘천시) → 37.7855926209548, 127.700960366465 — 강원특별자치도 춘천시 신동면 오봉길 156
- 휘슬링락컨트리클럽 (강원/춘천시) → 37.7730612102808, 127.669709976041 — 강원특별자치도 춘천시 남산면 동촌로 501
- 오너스골프클럽 (강원/춘천시) → 37.7721785570099, 127.654200050879 — 강원특별자치도 춘천시 남산면 동촌로 667
- 파가니카컨트리클럽 (강원/춘천시) → 37.7497160475065, 127.619928617296 — 강원특별자치도 춘천시 남면 소주고개로 145-10
- 더플레이어스 골프클럽 (강원/춘천시) → 37.7776204120147, 127.750533991715 — 강원특별자치도 춘천시 동산면 새술막길 438
- 로드힐스골프클럽 (강원/춘천시) → 37.747575327588, 127.725551235643 — 강원특별자치도 춘천시 동산면 종자리로 148-16
- 라비에벨컨트리클럽 (강원/춘천시) → 37.7411958192197, 127.757369977231 — 강원특별자치도 춘천시 동산면 종자리로 436

## 검토 필요 목록


## 전체 geocoding 실행 가능 여부

- **조건부 가능** — 샘플 success 비율 양호. manual_questions 검토 후 전체 실행 권장.

## 다음 단계

1. manual_questions.md 7건 사용자 확인 유지
2. low_confidence / multiple_candidates 수동 검토
3. 전체 실행: `npm run geocode:golf-courses -- --execute --provider kakao`
4. 결과: `data/golf_courses_import_geocoded.csv` (별도 파일, import 원본 유지)

## Fallback 통계

- address search 총 hit: 20
- keyword search 총 hit: 0
- API step calls: 20
