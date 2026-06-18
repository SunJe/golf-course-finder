# Geocoding Regional Quality Report

> Generated: 2026-06-18T01:51:38.676Z

## 실행 정보

- **지역별 샘플 limit:** 5
- **총 샘플 행 수:** 31
- **geocoding_input 총 행 수:** 534
- **address search hits:** 26
- **keyword search hits:** 0
- **API step calls:** 26

## region별 결과

| region | 샘플 | success | no_result | low_confidence | multiple_candidates | api_error | avg confidence | pass rate |
|--------|------|---------|-----------|----------------|---------------------|-----------|----------------|-----------|
| 서울 | 1 | 1 | 0 | 0 | 0 | 0 | 80 | 100% ✓ |
| 경기 | 5 | 5 | 0 | 0 | 0 | 0 | 80 | 100% ✓ |
| 강원 | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 100% ✓ |
| 충청 | 5 | 5 | 0 | 0 | 0 | 0 | 80 | 100% ✓ |
| 전라 | 5 | 5 | 0 | 0 | 0 | 0 | 80 | 100% ✓ |
| 경상 | 5 | 5 | 0 | 0 | 0 | 0 | 80 | 100% ✓ |
| 제주 | 5 | 5 | 0 | 0 | 0 | 0 | 80 | 100% ✓ |

## 전체 status

- success: 26
- no_result: 0
- low_confidence: 0
- multiple_candidates: 0
- api_error: 0
- skipped: 5

## 실패/검토 필요 목록

_없음_

## 원인 추정

- 모든 region 80% 이상 통과

## address normalization 점검

- 서울/경기/강원/제주: region prefix 직접 매핑
- 충청/전라/경상: **city → 시·도** 매핑 (청주→충청북도, 천안→충청남도 등)
- address에 경북/전남 등 포함 시 address 내용 우선
- 시·도 확정 불가 시 keyword fallback

## 전체 geocoding 실행 가능 여부

- **조건부 가능** — 모든 region 샘플 pass rate ≥ 80%. manual_questions 검토 후 전체 실행.

## 다음 단계 (전체 실행 — 아직 실행하지 않음)

```bash
npm run geocode:golf-courses -- --execute --provider kakao --all
```

현재 `--all`은 regional 검증 완료 후 별도 승인 단계에서 활성화.
