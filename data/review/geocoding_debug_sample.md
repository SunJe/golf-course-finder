# Geocoding Debug Sample

> Generated: 2026-06-18T01:51:38.677Z

## no_result 20건 원인 추정 (수정 전)

- master CSV 주소에 **시·도 접두(예: 강원특별자치도)가 없음**
- geocoding_input query에 **골프장명+주소 혼합** → address search 부적합
- Kakao address search는 **도로명/지번 + 시도** 형태를 선호

## 샘플 20행 분석

### 1. 인서울27골프클럽

- **id:** gc-dd6fca373d1b
- **region / city:** 서울 / 강서구
- **address:** 서울특별시 강서구 오정로 443-198
- **generated query (기존):** 서울특별시 강서구 오정로 443-198
- **normalized address (신규):** 서울특별시 강서구 오정로 443-198
- **address search query (신규):** 서울특별시 강서구 오정로 443-198
- **query length:** 21
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 2. 한원컨트리클럽

- **id:** gc-9a7ff16abcee
- **region / city:** 경기 / 용인시
- **address:** 경기도 용인시 처인구 남사읍 전나무골길2번길 94
- **generated query (기존):** 경기도 용인시 처인구 남사읍 전나무골길2번길 94
- **normalized address (신규):** 경기도 용인시 처인구 남사읍 전나무골길2번길 94
- **address search query (신규):** 경기도 용인시 처인구 남사읍 전나무골길2번길 94
- **query length:** 27
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 3. 양지파인골프클럽

- **id:** gc-897c73dbf41b
- **region / city:** 경기 / 용인시
- **address:** 경기도 용인시 처인구 양지면 남평로 112
- **generated query (기존):** 경기도 용인시 처인구 양지면 남평로 112
- **normalized address (신규):** 경기도 용인시 처인구 양지면 남평로 112
- **address search query (신규):** 경기도 용인시 처인구 양지면 남평로 112
- **query length:** 23
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 4. 수원컨트리클럽

- **id:** gc-38b838344176
- **region / city:** 경기 / 용인시
- **address:** 경기도 용인시 기흥구 중부대로 495
- **generated query (기존):** 경기도 용인시 기흥구 중부대로 495
- **normalized address (신규):** 경기도 용인시 기흥구 중부대로 495
- **address search query (신규):** 경기도 용인시 기흥구 중부대로 495
- **query length:** 20
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 5. 플라자CC

- **id:** gc-4af8a2f8ed32
- **region / city:** 경기 / 용인시
- **address:** 경기도 용인시 처인구 남사읍 봉무로 153번길 79
- **generated query (기존):** 경기도 용인시 처인구 남사읍 봉무로 153번길 79
- **normalized address (신규):** 경기도 용인시 처인구 남사읍 봉무로 153번길 79
- **address search query (신규):** 경기도 용인시 처인구 남사읍 봉무로 153번길 79
- **query length:** 28
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 6. 태광컨트리클럽(회원제)

- **id:** gc-9da6f2a0f2d9
- **region / city:** 경기 / 용인시
- **address:** 경기도 용인시 기흥구 흥덕4로 77
- **generated query (기존):** 경기도 용인시 기흥구 흥덕4로 77
- **normalized address (신규):** 경기도 용인시 기흥구 흥덕4로 77
- **address search query (신규):** 경기도 용인시 기흥구 흥덕4로 77
- **query length:** 19
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 7. 라데나골프클럽

- **id:** gc-18f9f355721d
- **region / city:** 강원 / 춘천시
- **address:** 춘천시 신동면 칠전동길 72
- **generated query (기존):** 라데나골프클럽 춘천시 신동면 칠전동길 72
- **normalized address (신규):** 강원특별자치도 춘천시 신동면 칠전동길 72
- **address search query (신규):** 강원특별자치도 춘천시 신동면 칠전동길 72
- **query length:** 23
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 8. 엘리시안 강촌컨트리클럽

- **id:** gc-669d8ad13333
- **region / city:** 강원 / 춘천시
- **address:** 춘천시 남산면 북한강변길 688
- **generated query (기존):** 엘리시안 강촌컨트리클럽 춘천시 남산면 북한강변길 688
- **normalized address (신규):** 강원특별자치도 춘천시 남산면 북한강변길 688
- **address search query (신규):** 강원특별자치도 춘천시 남산면 북한강변길 688
- **query length:** 30
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 9. 제이드팰리스 골프클럽

- **id:** gc-5acca8d60a68
- **region / city:** 강원 / 춘천시
- **address:** 춘천시 남산면 경춘로 212-30
- **generated query (기존):** 제이드팰리스 골프클럽 춘천시 남산면 경춘로 212-30
- **normalized address (신규):** 강원특별자치도 춘천시 남산면 경춘로 212-30
- **address search query (신규):** 강원특별자치도 춘천시 남산면 경춘로 212-30
- **query length:** 30
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 10. 남춘천컨트리클럽

- **id:** gc-fa1419df8b1e
- **region / city:** 강원 / 춘천시
- **address:** 춘천시 신동면 오봉길 156
- **generated query (기존):** 남춘천컨트리클럽 춘천시 신동면 오봉길 156
- **normalized address (신규):** 강원특별자치도 춘천시 신동면 오봉길 156
- **address search query (신규):** 강원특별자치도 춘천시 신동면 오봉길 156
- **query length:** 24
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 11. 휘슬링락컨트리클럽

- **id:** gc-3526f59318a4
- **region / city:** 강원 / 춘천시
- **address:** 춘천시 남산면 동촌로 501
- **generated query (기존):** 휘슬링락컨트리클럽 춘천시 남산면 동촌로 501
- **normalized address (신규):** 강원특별자치도 춘천시 남산면 동촌로 501
- **address search query (신규):** 강원특별자치도 춘천시 남산면 동촌로 501
- **query length:** 25
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 12. 유성컨트리클럽

- **id:** gc-28ed803e0e26
- **region / city:** 충청 / 대전
- **address:** 대전 유성구 현충원로 200(덕명동 215-7번지)
- **generated query (기존):** 유성컨트리클럽 대전 유성구 현충원로 200(덕명동 215-7번지)
- **normalized address (신규):** 대전 유성구 현충원로 200
- **address search query (신규):** 대전 유성구 현충원로 200
- **query length:** 36
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 13. 대덕복지센터

- **id:** gc-4906278997cc
- **region / city:** 충청 / 대전
- **address:** 대전 유성구 유성대로 1689번길 69(전민동 463번지)
- **generated query (기존):** 대덕복지센터 대전 유성구 유성대로 1689번길 69(전민동 463번지)
- **normalized address (신규):** 대전 유성구 유성대로 1689번길 69
- **address search query (신규):** 대전 유성구 유성대로 1689번길 69
- **query length:** 39
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 14. 금실대덕밸리CC

- **id:** gc-c9369c96907d
- **region / city:** 충청 / 대전
- **address:** 대전 유성구 테크노중앙로 210(용산동 676번지)
- **generated query (기존):** 금실대덕밸리CC 대전 유성구 테크노중앙로 210(용산동 676번지)
- **normalized address (신규):** 대전 유성구 테크노중앙로 210
- **address search query (신규):** 대전 유성구 테크노중앙로 210
- **query length:** 37
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 15. 세종에머슨컨트리클럽

- **id:** gc-2b09ff38b37c
- **region / city:** 충청 / 전의면
- **address:** 세종특별자치시 전의면 운주산로 1510
- **generated query (기존):** 세종특별자치시 전의면 운주산로 1510
- **normalized address (신규):** 세종특별자치시 전의면 운주산로 1510
- **address search query (신규):** 세종특별자치시 전의면 운주산로 1510
- **query length:** 21
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 16. 건설공제조합세종필드골프클럽

- **id:** gc-dc3aed15fe4c
- **region / city:** 충청 / 정안세종로
- **address:** 세종특별자치시 정안세종로  1569
- **generated query (기존):** 세종특별자치시 정안세종로  1569
- **normalized address (신규):** 세종특별자치시 정안세종로 1569
- **address search query (신규):** 세종특별자치시 정안세종로 1569
- **query length:** 19
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 17. 빛고을컨트리클럽

- **id:** gc-abff7021616b
- **region / city:** 전라 / 남구
- **address:** 광주광역시 남구 효우로 153(노대동)
- **generated query (기존):** 광주광역시 남구 효우로 153(노대동)
- **normalized address (신규):** 광주광역시 남구 효우로 153
- **address search query (신규):** 광주광역시 남구 효우로 153
- **query length:** 21
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 18. 에콜리안광산골프장

- **id:** gc-2159121d90f9
- **region / city:** 전라 / 광산구
- **address:** 광주광역시 광산구 오목내길 26(연산동)
- **generated query (기존):** 광주광역시 광산구 오목내길 26(연산동)
- **normalized address (신규):** 광주광역시 광산구 오목내길 26
- **address search query (신규):** 광주광역시 광산구 오목내길 26
- **query length:** 22
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 19. 어등산컨트리클럽

- **id:** gc-96881a9924c5
- **region / city:** 전라 / 광산구
- **address:** 광주광역시 광산구 무진대로 31(운수동)
- **generated query (기존):** 광주광역시 광산구 무진대로 31(운수동)
- **normalized address (신규):** 광주광역시 광산구 무진대로 31
- **address search query (신규):** 광주광역시 광산구 무진대로 31
- **query length:** 22
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 20. 디오션CC

- **id:** gc-4c57c6fd7298
- **region / city:** 전라 / 전남
- **address:** 전남 여수시 화양면 안포리 1917
- **generated query (기존):** 디오션CC 전남 여수시 화양면 안포리 1917
- **normalized address (신규):** 전라남도 전남 여수시 화양면 안포리 1917
- **address search query (신규):** 전라남도 전남 여수시 화양면 안포리 1917
- **query length:** 25
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 21. 세이지우드 여수경도

- **id:** gc-349a94f1be3f
- **region / city:** 전라 / 전남
- **address:** 전남 여수시 대경도길 111
- **generated query (기존):** 전남 여수시 대경도길 111
- **normalized address (신규):** 전라남도 전남 여수시 대경도길 111
- **address search query (신규):** 전라남도 전남 여수시 대경도길 111
- **query length:** 15
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 22. 창원컨트리클럽

- **id:** gc-ba63455c375f
- **region / city:** 경상 / 창원시
- **address:** 창원시 의창구 대봉로 137
- **generated query (기존):** 창원컨트리클럽 창원시 의창구 대봉로 137
- **normalized address (신규):** 경상남도 창원시 의창구 대봉로 137
- **address search query (신규):** 경상남도 창원시 의창구 대봉로 137
- **query length:** 23
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 23. 용원컨트리클럽

- **id:** gc-bfc85ba9acd0
- **region / city:** 경상 / 창원시
- **address:** 창원시 진해구 가주로 133
- **generated query (기존):** 용원컨트리클럽 창원시 진해구 가주로 133
- **normalized address (신규):** 경상남도 창원시 진해구 가주로 133
- **address search query (신규):** 경상남도 창원시 진해구 가주로 133
- **query length:** 23
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 24. 아라미르골프앤리조트

- **id:** gc-745bb2ca1c75
- **region / city:** 경상 / 창원시
- **address:** 창원시 진해구 수제로 36
- **generated query (기존):** 아라미르골프앤리조트 창원시 진해구 수제로 36
- **normalized address (신규):** 경상남도 창원시 진해구 수제로 36
- **address search query (신규):** 경상남도 창원시 진해구 수제로 36
- **query length:** 25
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 25. 진주컨트리클럽

- **id:** gc-25bf0a715d27
- **region / city:** 경상 / 진주시
- **address:** 진주시 진성면 진성로 464번길 82
- **generated query (기존):** 진주컨트리클럽 진주시 진성면 진성로 464번길 82
- **normalized address (신규):** 경상남도 진주시 진성면 진성로 464번길 82
- **address search query (신규):** 경상남도 진주시 진성면 진성로 464번길 82
- **query length:** 28
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 26. 통영동원로얄컨트리클럽

- **id:** gc-d18fa63ecde3
- **region / city:** 경상 / 통영시
- **address:** 통영시 산양읍 담안길 240
- **generated query (기존):** 통영동원로얄컨트리클럽 통영시 산양읍 담안길 240
- **normalized address (신규):** 경상남도 통영시 산양읍 담안길 240
- **address search query (신규):** 경상남도 통영시 산양읍 담안길 240
- **query length:** 27
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** query에 시설명 포함 — address API에 부적합, normalized address 단독 검색 필요

### 27. 타미우스cc

- **id:** gc-c96a1655bd5c
- **region / city:** 제주 / 제주시
- **address:** 제주특별자치도 제주시 애월읍 화전길 201
- **generated query (기존):** 제주특별자치도 제주시 애월읍 화전길 201
- **normalized address (신규):** 제주특별자치도 제주시 애월읍 화전길 201
- **address search query (신규):** 제주특별자치도 제주시 애월읍 화전길 201
- **query length:** 23
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 28. 그린필드GC

- **id:** gc-7d2ed71b8086
- **region / city:** 제주 / 제주시
- **address:** 제주특별자치도 제주시 조천읍 번영로 1040-70
- **generated query (기존):** 제주특별자치도 제주시 조천읍 번영로 1040-70
- **normalized address (신규):** 제주특별자치도 제주시 조천읍 번영로 1040-70
- **address search query (신규):** 제주특별자치도 제주시 조천읍 번영로 1040-70
- **query length:** 27
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 29. 라헨느CC

- **id:** gc-aff117457c45
- **region / city:** 제주 / 제주시
- **address:** 제주특별자치도 제주시 봉개동 241-13
- **generated query (기존):** 제주특별자치도 제주시 봉개동 241-13
- **normalized address (신규):** 제주특별자치도 제주시 봉개동 241-13
- **address search query (신규):** 제주특별자치도 제주시 봉개동 241-13
- **query length:** 22
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 30. 볼카노골프앤리조트

- **id:** gc-ed4f10d4c149
- **region / city:** 제주 / 서귀포시
- **address:** 제주특별자치도 서귀포시 산록남로 1391
- **generated query (기존):** 제주특별자치도 서귀포시 산록남로 1391
- **normalized address (신규):** 제주특별자치도 서귀포시 산록남로 1391
- **address search query (신규):** 제주특별자치도 서귀포시 산록남로 1391
- **query length:** 22
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능

### 31. 테디밸리

- **id:** gc-7860808d29d1
- **region / city:** 제주 / 서귀포시
- **address:** 제주특별자치도 서귀포시 한창로 365
- **generated query (기존):** 제주특별자치도 서귀포시 한창로 365
- **normalized address (신규):** 제주특별자치도 서귀포시 한창로 365
- **address search query (신규):** 제주특별자치도 서귀포시 한창로 365
- **query length:** 20
- **query empty:** false
- **도로명/지번 주소:** yes
- **Kakao endpoint (기존):** https://dapi.kakao.com/v2/local/search/address.json
- **no_result 원인 추정:** 시·도 접두 없는 주소 — address search miss 가능
