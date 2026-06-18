# Download Failures & Manual Actions

> Last updated: 2026-06-17T23:47:58.763Z

Phase 1 — raw data collection. Failed, skipped, and manual-download sources.

| source_id | source_name | expected_file_name | reason | required_action | notes |
|-----------|-------------|-------------------|--------|-----------------|-------|
| ministry_national_golf_courses | 문화체육관광부 전국 골프장 현황 | ministry_golf_courses.csv | no_download_url_in_registry | 공공데이터/제공처에서 직접 다운로드 후 data/raw/ministry_golf_courses.csv 로 저장 | 전국 골프장 master dataset의 1차 기준. 다른 source와 자동 병합하지 않는다. |
| localdata_golf_courses | 행정안전부 지역별 인허가 데이터 (골프장) | localdata_golf_courses.csv | skipped_missing_api_key | .env.local에 DATA_GO_KR_SERVICE_KEY 설정 후 npm run download:golf-sources 재실행, 또는 공공데이터/제공처에서 직접 다운로드 후 data/raw/localdata_golf_courses.csv 로 저장 | open_api source without API key |
| gyeonggi_golf_courses | 경기도 골프장 현황 | gyeonggi_golf_courses.csv | manual_required | 공공데이터/제공처에서 직접 다운로드 후 data/raw/gyeonggi_golf_courses.csv 로 저장 | 경기 지역 master 행 보강용. master에 없는 행은 candidate로 review. |
| lx_spatial_golf_courses | LX 공간정보 / 좌표 보강 데이터 | lx_spatial_golf_courses.csv | manual_required | 공공데이터/제공처에서 직접 다운로드 후 data/raw/lx_spatial_golf_courses.csv 로 저장 | requires_login=true. User must download manually. |
| manual_enrichment | 수동 보강 데이터 | manual_course_enrichment.csv | manual_required | 공공데이터/제공처에서 직접 다운로드 후 data/raw/manual_course_enrichment.csv 로 저장 | master_id 또는 name+address로 master 행에 매칭 후 수동 보강 필드만 반영. |

## Reason codes

- `no_download_url_in_registry` — registry에 URL 없음, 수동 다운로드 필요
- `manual_required` — 로그인/활용신청 또는 manual download_method
- `skipped_missing_api_key` — `DATA_GO_KR_SERVICE_KEY` 미설정
- `download_failed` — URL fetch 실패
- `already_present` — (성공) raw 파일 이미 존재
