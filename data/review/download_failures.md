# Download Failures

> `npm run download:golf-sources` 실행 시 실패한 source를 기록합니다.

## 기록 형식 (예시)

| 일시 | source id | expected_file_name | 실패 사유 | 조치 |
|------|-----------|-------------------|-----------|------|
| | ministry_national_golf_courses | ministry_golf_courses.csv | | |

## 흔한 실패 원인

- 공공데이터 API 키 미설정 (`DATA_GO_KR_SERVICE_KEY`)
- 활용신청·로그인 필요 (`requires_login: true`)
- URL/데이터셋 ID 변경
- rate limit / 일시적 장애

## 조치

1. 수동 다운로드 후 `data/raw/<expected_file_name>`에 저장
2. `golf_course_sources.json`의 `download_status`를 `downloaded`로 수동 갱신 (향후 스크립트 자동화 예정)
