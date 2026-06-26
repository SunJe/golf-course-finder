# Visit Korea Image Match Audit

Generated: 2026-06-26T06:59:53.288Z

## Summary

- Visit Korea 골프장 전체 개수 (raw): **194**
- Visit Korea 이미지 보유 골프장 개수: **178**
- GolfMap 코스 전체 개수: **532**
- GolfMap ↔ Visit Korea 후보 매칭 성공(이미지 有): **211**
- 자동 적용(exact/high/조건부 medium): **146**
- review 필요 후보: **65**

### imageMatchConfidence counts (best match per course)

- exact: 121
- high: 25
- medium: 8
- low: 55
- ambiguous: 2

## 매칭 실패 상위 원인

1. Visit Korea 카탈로그에 해당 골프장 이미지가 없음
2. 이름 표기 차이(CC/GC/컨트리클럽/띄어쓰기/영문 표기)로 fuzzy 점수 부족
3. 주소·시군구 불일치로 medium 이상 조건 미충족
4. 유사 후보 2건 이상으로 ambiguous 처리
5. 기존 blog visit-korea-meta 수동 매칭만 존재하던 소수 코스

## 사람이 확인해야 할 ambiguous 후보

- 지산컨트리클럽 (`gc-20c1df4aa8fb`) ↔ 지산컨트리클럽 (`130980`)
- 그랜드cc (`gc-81f36c789316`) ↔ 그랜드컨트리클럽 (`131573`)

## review 후보 (low / medium / ambiguous)

- [low] 엘리시안제주 (회원제) (`gc-7ef835cc44ce`) ↔ 엘리시안 강촌 컨트리클럽 — fuzzy 0.67, addr 0.00
- [low] 해비치CC (대중제) (`gc-a34d1218714a`) ↔ 드비치골프클럽 — fuzzy 0.67, addr 0.00
- [low] 웰리힐리퍼블릭 (`gc-ec8024eb7955`) ↔ 코리아퍼블릭CC — fuzzy 0.70, addr 0.00
- [low] 메이플비치골프&리조트 (`gc-b768a2002431`) ↔ 오션비치골프앤리조트 — fuzzy 0.70, addr 0.00
- [low] 지산퍼블릭 (`gc-4687a4044d34`) ↔ 제이퍼블릭컨트리클럽 — fuzzy 0.75, addr 0.25
- [low] 자유컨트리클럽 (`gc-51bfec26aa96`) ↔ 자유로CC — fuzzy 0.67, addr 0.25
- [low] 렉스필드 컨트리클럽(회원) (`gc-61ba4f976442`) ↔ 젠스필드CC — fuzzy 0.75, addr 0.00
- [low] 렉스필드 컨트리클럽(비회원) (`gc-657d8f5d1426`) ↔ 젠스필드CC — fuzzy 0.75, addr 0.00
- [low] 에덴밸리컨트리클럽 (`gc-68d69c3be5e4`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 가든골프클럽 (`gc-eb9124b06908`) ↔ 락가든GC — fuzzy 0.67, addr 0.00
- [low] 더골프골프장 (`gc-9407b216837c`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골든베이골프&리조트 (`gc-b21ce78f76ca`) ↔ 올데이 골프앤리조트 — fuzzy 0.67, addr 0.00
- [low] 엘리시안제주 (대중제) (`gc-48b0d3b9c2cb`) ↔ 엘리시안 강촌 컨트리클럽 — fuzzy 0.67, addr 0.00
- [low] 해비치CC (회원제) (`gc-e51deb9a5cbf`) ↔ 드비치골프클럽 — fuzzy 0.67, addr 0.00
- [low] 파가니카컨트리클럽 (`gc-9e436bbbf364`) ↔ 세레니티CC (구, 실크리버 컨트리클럽) — fuzzy 0.67, addr 0.00
- [low] 베어크리크 춘천 (`gc-d7a401a860d3`) ↔ 베어크리크GC — fuzzy 0.71, addr 0.00
- [low] 오로라 골프 앤 리조트 (`gc-aca146079a3b`) ↔ 오라컨트리클럽 — fuzzy 0.67, addr 0.00
- [low] 파인밸리컨트리클럽 (`gc-5d96ff075544`) ↔ 파크밸리골프클럽 — fuzzy 0.75, addr 0.25
- [low] 샤인데일골프&리조트 (`gc-690b34d2b582`) ↔ 올데이 골프앤리조트 — fuzzy 0.67, addr 0.00
- [low] 올데이 옥스필드 (`gc-535182f1f0fa`) ↔ 젠스필드CC — fuzzy 0.75, addr 0.00
- [low] 아시아나컨트리클럽 (`gc-25de9ff08a30`) ↔ 아시아드 컨트리클럽 — fuzzy 0.75, addr 0.00
- [ambiguous] 지산컨트리클럽 (`gc-20c1df4aa8fb`) ↔ 지산컨트리클럽 — fuzzy 1.00, addr 1.00
- [low] 뉴코리아 컨트리클럽 (`gc-3b60b2dadb3f`) ↔ 코리아 컨트리클럽 — fuzzy 0.75, addr 0.25
- [low] 해비치 컨트리클럽 (`gc-01a5e4501db9`) ↔ 드비치골프클럽 — fuzzy 0.67, addr 0.00
- [low] 남양주CC (`gc-29fa36946d15`) ↔ 남여주GC(남여주골프클럽) — fuzzy 0.67, addr 0.25
- [low] 서서울 컨트리클럽 (`gc-962dc7cafd46`) ↔ 남서울컨트리클럽 — fuzzy 0.67, addr 0.25
- [low] 이스트밸리CC (`gc-b37c66474de6`) ↔ 베스트밸리GC — fuzzy 0.80, addr 0.25
- [low] 캐슬렉스골프클럽 (`gc-3e570fca0614`) ↔ 캐슬렉스제주 골프클럽 — fuzzy 0.67, addr 0.00
- [low] 세라지오GC (`gc-30fa81244c96`) ↔ 파라지오CC — fuzzy 0.75, addr 0.00
- [low] 프리스틴밸리 골프클럽 (`gc-b4f940680084`) ↔ 크리스탈밸리 — fuzzy 0.67, addr 0.55
- [low] 포웰CC 김해 (`gc-60d067e583df`) ↔ 포웰CC 안성 — fuzzy 0.67, addr 0.00
- [low] 에이원컨트리클럽 (`gc-e85969d2e40c`) ↔ 하이원 컨트리클럽 — fuzzy 0.67, addr 0.00
- [medium] 아시아드컨트리클럽 (`gc-2070c1511760`) ↔ 아시아드 컨트리클럽 — fuzzy 1.00, addr 0.30
- [low] 오렌지듄스 영종골프클럽 (`gc-496303f3c77c`) ↔ 오렌지듄스 GC — fuzzy 0.71, addr 0.30
- [low] 파인힐스CC (`gc-95d86b96417d`) ↔ 신동파인힐스 — fuzzy 0.67, addr 0.00
- [low] 더시에나CC (`gc-5f82bbc964a8`) ↔ 더 시에나 서울 컨트리클럽 — fuzzy 0.67, addr 0.00
- [medium] 아리스타 CC (`gc-c0cdb2271518`) ↔ 아리스타CC — fuzzy 1.00, addr 0.30
- [medium] 솔라고CC (`gc-167a7f95d402`) ↔ 솔라고CC — fuzzy 1.00, addr 0.30
- [ambiguous] 그랜드cc (`gc-81f36c789316`) ↔ 그랜드컨트리클럽 — fuzzy 1.00, addr 0.30
- [medium] 천 룡cc (`gc-760b850e4451`) ↔ 천룡컨트리클럽 — fuzzy 1.00, addr 0.30
- [medium] 썬밸리cc (`gc-ac8ec878e912`) ↔ 썬밸리컨트리클럽 — fuzzy 1.00, addr 0.30
- [medium] 일레븐cc (`gc-e14661a32922`) ↔ 일레븐CC — fuzzy 1.00, addr 0.30
- [medium] 킹스데일cc (`gc-8d9ee33d1f22`) ↔ 킹스데일골프클럽 — fuzzy 1.00, addr 0.30
- [low] 세레니티cc (`gc-736ecb0e589a`) ↔ 세레니티CC (구, 실크리버 컨트리클럽) — fuzzy 0.67, addr 0.30
- [low] 골프존카운티 사천 (`gc-945ef0204a99`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티 경남 (`gc-09693194d3fb`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티 감포 (`gc-96bed6159452`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티 선산 (`gc-6a587177a23c`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티 구미 (`gc-a944350f5db1`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티 청통 (`gc-01d6a94bf335`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 잭 니클라우스 골프클럽 코리아 (`gc-3f766167d45e`) ↔ 잭니클라우스GC코리아 — fuzzy 0.69, addr 1.00
- [low] 골프존카운티 송도 골프장 (`gc-4005648f63d2`) ↔ 골프존카운티 안성H — fuzzy 0.67, addr 0.25
- [low] 골프존카운티 (`gc-3269edc70897`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티 영암 (`gc-982325a51789`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티무주 (`gc-2a867c283a2c`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.30
- [low] 골프존카운티선운 (`gc-1f1578e897f2`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.30
- [low] 골프존카운티 천안 (`gc-adeec421c374`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티 진천cc (`gc-226b2263c6f6`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티 화랑cc (`gc-ab22b2f16924`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [medium] 골프존 카운티 드래곤 (`gc-01762fe809b0`) ↔ 골프존카운티 드래곤 — fuzzy 1.00, addr 0.30
- [low] 골프존카운티오라 (회원제) (`gc-d780ed19a4d0`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 골프존카운티오라 (대중제) (`gc-4949c11c28bf`) ↔ 골프존카운티 드래곤 — fuzzy 0.67, addr 0.00
- [low] 동서울레스피아 (`gc-3eb069c5fb2a`) ↔ 남서울컨트리클럽 — fuzzy 0.67, addr 0.00
- [low] 신안 퍼블릭 CC (`gc-2c90528d411e`) ↔ 제이퍼블릭컨트리클럽 — fuzzy 0.75, addr 0.25
- [low] 해운대비치골프앤리조트 (`gc-a9d6992e56d4`) ↔ 오션비치골프앤리조트 — fuzzy 0.70, addr 0.00

## 이름은 비슷하지만 자동 적용되지 않은 후보

- 지산퍼블릭 (`gc-4687a4044d34`) ↔ 제이퍼블릭컨트리클럽 — fuzzy 0.75 (low)
- 렉스필드 컨트리클럽(회원) (`gc-61ba4f976442`) ↔ 젠스필드CC — fuzzy 0.75 (low)
- 렉스필드 컨트리클럽(비회원) (`gc-657d8f5d1426`) ↔ 젠스필드CC — fuzzy 0.75 (low)
- 파인밸리컨트리클럽 (`gc-5d96ff075544`) ↔ 파크밸리골프클럽 — fuzzy 0.75 (low)
- 올데이 옥스필드 (`gc-535182f1f0fa`) ↔ 젠스필드CC — fuzzy 0.75 (low)
- 아시아나컨트리클럽 (`gc-25de9ff08a30`) ↔ 아시아드 컨트리클럽 — fuzzy 0.75 (low)
- 지산컨트리클럽 (`gc-20c1df4aa8fb`) ↔ 지산컨트리클럽 — fuzzy 1.00 (ambiguous)
- 뉴코리아 컨트리클럽 (`gc-3b60b2dadb3f`) ↔ 코리아 컨트리클럽 — fuzzy 0.75 (low)
- 이스트밸리CC (`gc-b37c66474de6`) ↔ 베스트밸리GC — fuzzy 0.80 (low)
- 세라지오GC (`gc-30fa81244c96`) ↔ 파라지오CC — fuzzy 0.75 (low)
- 아시아드컨트리클럽 (`gc-2070c1511760`) ↔ 아시아드 컨트리클럽 — fuzzy 1.00 (medium)
- 아리스타 CC (`gc-c0cdb2271518`) ↔ 아리스타CC — fuzzy 1.00 (medium)
- 솔라고CC (`gc-167a7f95d402`) ↔ 솔라고CC — fuzzy 1.00 (medium)
- 그랜드cc (`gc-81f36c789316`) ↔ 그랜드컨트리클럽 — fuzzy 1.00 (ambiguous)
- 천 룡cc (`gc-760b850e4451`) ↔ 천룡컨트리클럽 — fuzzy 1.00 (medium)
- 썬밸리cc (`gc-ac8ec878e912`) ↔ 썬밸리컨트리클럽 — fuzzy 1.00 (medium)
- 일레븐cc (`gc-e14661a32922`) ↔ 일레븐CC — fuzzy 1.00 (medium)
- 킹스데일cc (`gc-8d9ee33d1f22`) ↔ 킹스데일골프클럽 — fuzzy 1.00 (medium)
- 골프존 카운티 드래곤 (`gc-01762fe809b0`) ↔ 골프존카운티 드래곤 — fuzzy 1.00 (medium)
- 신안 퍼블릭 CC (`gc-2c90528d411e`) ↔ 제이퍼블릭컨트리클럽 — fuzzy 0.75 (low)

## 다음 수동 확인 권장 목록

- ambiguous 후보 전체
- medium 후보 중 주소 overlap < 0.4
- blog visit-korea-meta에만 있고 자동 매칭 실패한 코스
