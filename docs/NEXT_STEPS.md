# GolfMap Korea — 다음 단계

> 현재 단계: **지도 / 검색 / 상세 UX 안정화** (Supabase 532곳 연동 완료)

## 완료된 것

- Supabase `golf_courses` 532행 import 및 앱 연동
- mock fallback 유지
- 메인 지도 클러스터 / 개별 pin 정책
- 검색·필터 결과 적을 때 클러스터 해제
- 상세 페이지 위치 지도
- 외부 카카오/네이버 링크 (골프장명 검색)
- 가격·이미지·연락처 빈 값 fallback UI

## 추천 진행 순서 (데이터 보강)

1. **기본 링크 보강** — `homepage_url`, `booking_url`, `phone`
2. **가격 정보 보강** — `weekday_green_fee_min`, `weekend_green_fee_min`, `caddie_fee`, `cart_fee`
3. **이미지 보강** — `image_url`
4. **장소 링크 보강** — 카카오/네이버 place URL (필요 시 DB 컬럼 추가 검토)
5. **상세 페이지 고도화** — 주변 정보, 실제 후기 연동
6. **배포 준비** — Vercel, env, 성능 모니터링

## 이번 단계에서 하지 않은 것

- CSV / Supabase 데이터 직접 수정
- 네이버 Map provider 구조 변경
- 블로그/주변 POI 실데이터 연동

## 검증 체크리스트 (UX)

- [ ] 전국 줌: 클러스터 위주, 성능 유지
- [ ] 경기/용인 등 중간 줌: 작은 클러스터 해제, 개별 pin 증가
- [ ] 검색 1~30건: 항상 개별 pin
- [ ] 검색 1건 + 「결과 위치로 이동」: level 6 전후
- [ ] 상세 위치 지도: level 6, 단일 pin
- [ ] 가격 없는 카드/상세: 회색 톤, UI 깨짐 없음
