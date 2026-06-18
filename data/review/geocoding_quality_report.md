# Geocoding Quality Report — Full Run

> Generated: 2026-06-18T01:59:00.028Z

## 실행 정보

- **provider:** kakao
- **총 대상 행 수:** 534
- **처리 완료 행 수:** 534
- **자동 중단:** 아니오
- **API step calls:** 172
- **cache hit:** 415
- **address search hits:** 90
- **keyword search hits:** 78

## API key 존재 여부 (값 미표시)

- KAKAO_REST_API_KEY: true
- NAVER_CLIENT_ID: false
- NAVER_CLIENT_SECRET: false

## status별 개수

- success: 92
- no_result: 6
- low_confidence: 0
- multiple_candidates: 21
- api_error: 0
- skipped (cache): 415
- import 반영 가능 (success+캐시): 507
- **평균 confidence:** 85.6
- **좌표 한국 범위 밖:** 0

## region별 통계

| region | rows | success | no_result | low_confidence | multiple_candidates | api_error |
|--------|------|---------|-----------|----------------|---------------------|-----------|
| 서울 | 1 | 1 | 0 | 0 | 0 | 0 |
| 경기 | 169 | 166 | 1 | 0 | 2 | 0 |
| 강원 | 64 | 62 | 1 | 0 | 1 | 0 |
| 충청 | 74 | 62 | 4 | 0 | 8 | 0 |
| 전라 | 73 | 68 | 0 | 0 | 5 | 0 |
| 경상 | 113 | 108 | 0 | 0 | 5 | 0 |
| 제주 | 40 | 40 | 0 | 0 | 0 | 0 |

## geocoded import

- **golf_courses_import_geocoded.csv 행 수:** 534
- **좌표 없는 행 수:** 27
- **golf_courses_import.csv 수정:** 없음 (원본 유지)

## Supabase import 가능 여부

- **불가** — 27행 좌표 없음. schema NOT NULL 조건 때문에 바로 import 불가. 실패 행 수동 보정 또는 schema nullable 변경 필요.

## 실패/미반영 항목

- **휘닉스 컨트리클럽** (강원/평창군) [multiple_candidates] — 후보 4건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **휘닉스대중골프장** (강원/평창군) [no_result] — API 결과 0건; endpoint=none; steps=6
- **로제비앙GC** (경기/광주시) [multiple_candidates] — 후보 4건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **몽베르 컨트리클럽(비회원제)** (경기/포천시) [no_result] — API 결과 0건; endpoint=none; steps=6
- **의령 리온컨트리클럽** (경상/의령군) [multiple_candidates] — 후보 4건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **칠곡아이위시C.C** (경상/칠곡군) [multiple_candidates] — 후보 2건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **부산컨트리클럽** (경상/금정구) [multiple_candidates] — 후보 5건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **기장동원로얄컨트리클럽** (경상/기장군) [multiple_candidates] — 후보 3건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **오렌지듄스 영종골프클럽** (경기/인천시) [multiple_candidates] — 후보 2건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **파인힐스CC** (전라/전남) [multiple_candidates] — 후보 3건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **나주CC** (전라/전남) [multiple_candidates] — 후보 5건, top=80 vs next=80; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **나주힐스CC** (전라/전남) [multiple_candidates] — 후보 2건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **보성에덴CC** (전라/전남) [multiple_candidates] — 후보 2건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **군산CC** (전라/전북특별자치도) [multiple_candidates] — 후보 5건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **골드리버CC** (충청/공주시) [multiple_candidates] — 후보 3건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **골든베이골프&리조트** (충청/태안군) [multiple_candidates] — 후보 2건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **스톤비치컨트리클럽** (충청/태안군) [multiple_candidates] — 후보 2건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **로얄링스1** (충청/태안군) [no_result] — API 결과 0건; endpoint=none; steps=6
- **로얄링스2** (충청/태안군) [no_result] — API 결과 0건; endpoint=none; steps=6
- **솔라고CC1** (충청/태안군) [no_result] — API 결과 0건; endpoint=none; steps=6
- **솔라고CC2** (충청/태안군) [no_result] — API 결과 0건; endpoint=none; steps=6
- **그랜드cc** (충청/청주시) [multiple_candidates] — 후보 4건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **썬밸리cc** (충청/음성군) [multiple_candidates] — 후보 5건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **골드나인cc** (충청/청주시) [multiple_candidates] — 후보 4건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **일레븐cc** (충청/충주시) [multiple_candidates] — 후보 4건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **킹스데일cc** (충청/충주시) [multiple_candidates] — 후보 3건, top=110 vs next=110; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2
- **청통골프장** (경상/영천시) [multiple_candidates] — 후보 5건, top=80 vs next=80; endpoint=https://dapi.kakao.com/v2/local/search/keyword.json; steps=2

## 다음 단계

1. 실패/low_confidence 항목 수동 검토
2. golf_courses_import_geocoded.csv 품질 확인
3. Supabase import (별도 단계)

## 참고

- low_confidence / multiple_candidates / no_result 행은 import_geocoded에서 좌표 비움
- 재실행 시 geocoding_cache.json으로 API 호출 최소화
