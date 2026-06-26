# 티스캐너 가격 크롤 진행 현황

생성: 2026-06-26T11:35:11.161Z

## 전체 진행

| 항목 | 값 |
|------|-----|
| 전체 골프장 | 532 |
| 체크포인트 수집 완료 | **140** (26.3%) |
| 미수집 | 392 |
| 체크포인트 성공 | 84 |
| 마지막 수집 | row 235 / 뉴코리아 컨트리클럽 |
| 마지막 시각 | 2026-06-26T07:34:43.891Z |

## 요약 CSV 기준 (238건)

| 구분 | 건수 |
|------|------|
| 자동 승인 가능 (`accept_price`) | 166 |
| 수동 검수 필요 (`manual_review`) | 56 |
| └ 가격 있음 (우선 검수) | **0** |
| └ 가격 없음 | 56 |
| 매칭 ambiguous | 4 |
| partial_day_slots | 2 |
| daily 결과 row | 391 |
| manual_review_list row | 56 |

## enrichment 반영 (마지막 merge)

- 시각: 2026-06-26T11:33:51.732Z
- CSV 반영: 완료
- 가격 업데이트: 166건
- accept_price: 166건
- manual_review(가격 있음): 0건

## 다음 단계

1. **미수집 392건** 계속 크롤:
   ```bash
   npm run collect:teescanner-price-batch -- --start-row 236 --limit 20
   ```
2. **수동 검수 HTML** 생성 후 브라우저에서 확인:
   ```bash
   npm run build:teescanner-price-review-page
   ```
   → `reports/teescanner-price-review.html`
3. 검수 완료 후 채팅에 결과 붙여넣기 → `npm run apply:teescanner-review-decisions`
4. 전체 반영:
   ```bash
   npm run apply:teescanner-review-decisions
   npm run merge:teescanner-prices -- --apply-csv true
   ```

## 가격 있는 수동 검수 샘플 (상위 15)

(없음)
