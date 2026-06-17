# Data Quality Report

> 병합 실행 후 이 템플릿을 채워 품질을 기록합니다.  
> 자동 생성은 미래 `npm run merge:golf-courses`에서 수행 예정.

## 실행 정보

- **실행일:**
- **실행 명령:** (예: `npm run merge:golf-courses`)
- **master source:** (예: `ministry_national_golf_courses`)
- **supplement sources:** (예: `localdata_golf_courses`, `gyeonggi_golf_courses`)

---

## 행 수 요약

| 항목 | 값 | 비고 |
|------|-----|------|
| master 원본 행 수 | | |
| supplement 원본별 행 수 | | source id별로 기록 |
| 최종 import 행 수 | | `golf_courses_import.csv` |
| 좌표 보유 행 수 | | lat/lng 모두 있음 |
| 좌표 없는 행 수 | | `golf_courses_needs_geocoding.csv` |
| 좌표계 확인 필요 행 수 | | `ambiguous_courses.csv` |
| 자동 보강된 필드 수 | | 필드별로 세부 기록 가능 |
| 신규 후보 수 | | `new_course_candidates.csv` |
| 중복 후보 수 | | `duplicate_candidates.csv` |
| 애매한 행 수 | | `ambiguous_courses.csv` |
| 제외한 연습장/스크린/파크골프 수 | | `excluded_non_golf_courses.csv` |

---

## Supplement별 매칭 통계

| source id | 원본 행 | master 매칭 | 보강 필드 | candidate | ambiguous |
|-----------|---------|-------------|-----------|-----------|-------------|
| | | | | | |

---

## 사용자 확인 필요 질문

1. 
2. 
3. 

---

## 결정 사항

- [ ] review 파일 검토 완료
- [ ] `golf_courses_import.csv` Supabase 업로드 승인
- [ ] 좌표 geocoding 완료 (필요 시)
