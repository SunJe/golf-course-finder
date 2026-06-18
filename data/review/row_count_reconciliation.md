# Row Count Reconciliation

> Generated: 2026-06-18T02:11:25.314Z

## 행 수

- **기준 import (data rows):** 534
- **geocoding_input.csv:** 534
- **golf_courses_import_geocoded.csv:** 534

## ID 비교

### import에만 있음 (geocoding_input 누락)

_없음_

### geocoding_input에만 있음 (import에 없음)

_없음_

### import에만 있음 (geocoded output 누락)

_없음_

### geocoded output에만 있음

_없음_

## 원인

- Phase 2.6 `apply:manual-answers`에서 **블랙스톤제주** 2행(18홀+9홀)을 1행(27홀)으로 병합
- 제거된 id: `gc-74de2175f831-2` (병합 후 `gc-74de2175f831` 단일 row 유지)
- 이전 리포트의 **535행**은 병합 전 import 기준이며, 현재 기준 import **데이터 행 수는 534**
- geocoding 실행 시점 리포트의 534행은 병합 후 정상 수치
- 현재 import / geocoding_input / geocoded output id 집합은 **일치**

## 조치

- id 불일치 없음 — geocoding_input 수정 불필요
