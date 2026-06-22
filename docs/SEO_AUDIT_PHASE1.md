# GolfMap Korea SEO Phase 1 Audit

감사 일자: 2026-06-22  
범위: 크롤링·색인, 메타데이터, 컬렉션/지역 랜딩, 상세페이지 신뢰도, 내부 링크, 구조화 데이터, CWV 안전 개선  
원칙: URL/sitemap/robots 구조 무분별 변경 금지, 필터·DB 로직 변경 금지, 내부 점수·난이도 UI 비노출

---

## 감사 항목 요약

### 1. 크롤링/색인 가능성

항목: 크롤링/색인 가능성  
문제: Next.js SSG 랜딩(컬렉션·지역·상세)은 sitemap·robots로 노출되나, 홈은 클라이언트 지도 중심이라 본문 텍스트가 SSR 영역에 부족했음.  
영향: 검색엔진이 홈의 주제·내부 허브 역할을 약하게 이해할 수 있음.  
우선순위: P1  
수정 방향: `HomeIntro` SSR 섹션 추가, 컬렉션·지역 내부 링크 보강.  
수정 파일 후보: `components/HomeIntro.tsx`, `app/page.tsx`

---

### 2. Sitemap

항목: sitemap  
문제: 컬렉션 0건 페이지는 sitemap 제외 로직 존재(`getSitemapCollectionSlugs`). par3·near-seoul-par3 0건 시 자동 제외.  
영향: 빈 페이지가 sitemap에 포함되면 크롤 예산 낭비.  
우선순위: P1  
수정 방향: 기존 로직 유지, `npm run analyze:collections`로 주기 확인.  
수정 파일 후보: `lib/collectionIndex.ts`, `app/sitemap.ts`, `scripts/analyzeCollectionCounts.ts`

---

### 3. robots / noindex

항목: robots / noindex  
문제: admin 경로 disallow 정상. 컬렉션 0건은 `generateMetadata`에서 `noindex: true`.  
영향: 빈 컬렉션 색인 시 얇은 콘텐츠 패널티 위험.  
우선순위: P1  
수정 방향: 0건 noindex 유지, 내부 링크에서도 0건 slug 제외.  
수정 파일 후보: `app/collections/[slug]/page.tsx`, `components/CollectionLinks.tsx`, `app/robots.ts`

---

### 4. Canonical

항목: canonical  
문제: 홈 `/?region=`, `/?collection=` 등 쿼리 URL은 UX용이나 canonical은 `/`로 고정. 컬렉션·지역·상세는 self-canonical.  
영향: 쿼리 URL이 별도 URL로 색인되면 중복 가능 — 현재 메타는 `/` 고정으로 완화.  
우선순위: P1  
수정 방향: `buildHomeMetadata` canonical `/` 유지. 필터 URL은 공유 가능하되 색인 대표는 `/`.  
수정 파일 후보: `lib/seoMetadata.ts`, `app/page.tsx`, `app/layout.tsx`

---

### 5. Title / Description 중복

항목: title/description duplication  
문제: 일부 컬렉션 `description`과 `seoDescription`이 동일하거나 유사. 지역 페이지 description 패턴도 반복적.  
영향: SERP 스니펫 차별화 약화.  
우선순위: P2  
수정 방향: slug별 `seoDescription`·`seoIntro` 차별화 지속. 키워드 스터핑 금지.  
수정 파일 후보: `lib/collectionLanding.ts`, `lib/regionLanding.ts`

---

### 6. H1 중복

항목: H1 duplication  
문제: 컬렉션·지역 페이지는 slug별 고유 H1. 홈 데스크탑 H1은 `DesktopHero`의 "가까운 골프장을 찾아보세요"로 지도 UI용 — SSR `HomeIntro`는 h2.  
영향: 홈에서 검색 의도 키워드 H1 노출은 약함(의도적 UX 우선).  
우선순위: P2  
수정 방향: 랜딩 페이지 H1 유지. 홈은 SSR intro h2 + 지도 h1 병행.  
수정 파일 후보: `components/DesktopHero.tsx`, `components/HomeIntro.tsx`

---

### 7. Developer terms on UI

항목: developer terms on UI  
문제: 과거 컬렉션 카드에 difficulty/score/referenceScore 노출 이력. 현재 공개 UI는 "선정 이유"·연락처·요금 중심. admin·scripts에만 내부 필드명 잔존.  
영향: 신뢰도·E-E-A-T 저하, 내부 데이터 유출 인상.  
우선순위: P0  
수정 방향: 공개 컴포넌트에서 score/difficulty/slug/field 등 비노출 유지.  
수정 파일 후보: `components/CollectionLandingView.tsx`, `lib/collectionCardLabels.ts`, `components/CourseDetail.tsx`

---

### 8. Collection FAQ / body duplication

항목: collection FAQ/body duplication  
문제: `baseFaq`·`nearSeoulComboFaq` 템플릿으로 public/par3/nine-hole 등 FAQ가 유사했음.  
영향: 컬렉션 간 중복 콘텐츠·얇은 페이지 판정 위험.  
우선순위: P1  
수정 방향: slug별 고유 FAQ 3개 이상, `seoIntro`·`filterSummary` 검색 의도별 차별화.  
수정 파일 후보: `lib/collectionLanding.ts`

---

### 9. Internal link anchor quality

항목: internal link anchor quality  
문제: "상세보기", "지도에서 더 보기" 등 맥락 없는 앵커 다수. 외부 링크 rel 누락 구간 일부.  
영향: 접근성·크롤 힌트·사용자 예측 가능성 저하.  
우선순위: P1  
수정 방향: `aria-label`/`title`에 골프장명·목적 포함, 외부 링크 `rel="noopener noreferrer"`.  
수정 파일 후보: `components/CollectionLandingView.tsx`, `components/RegionLandingView.tsx`, `components/CourseCard.tsx`, `components/CourseDetail.tsx`, `components/CollectionLinks.tsx`, `components/RegionLinks.tsx`, `components/HomeIntro.tsx`

---

### 10. Detail page trust

항목: detail page trust  
문제: 참고 데이터임을 명시하는 상단 고지 부족. 홈페이지 링크가 raw URL 표시.  
영향: 요금·연락처 오류 시 신뢰 하락.  
우선순위: P1  
수정 방향: 신뢰 고지 배너, `tel:` 링크, 공식 홈페이지·지도 링크 라벨 개선, 정정 CTA 유지.  
수정 파일 후보: `components/CourseDetail.tsx`

---

### 11. Map-centric text weakness

항목: map-centric text weakness  
문제: 홈·컬렉션 CTA가 "지도에서 보기" 중심. 텍스트만으로도 가치 전달 필요.  
영향: 맵 미로딩·봇 환경에서 콘텐츠 얇음.  
우선순위: P1  
수정 방향: 컬렉션 목록·FAQ·통계 카드 SSR 유지, 홈 intro 추가.  
수정 파일 후보: `components/HomeIntro.tsx`, `components/CollectionLandingView.tsx`

---

### 12. Mobile UX

항목: mobile UX  
문제: 모바일 지도+바텀시트 구조로 목록 탐색은 양호. 카드 터치 영역·min-height 일부 적용됨.  
영향: SEO 직접 영향은 제한적이나 체류·이탈에 간접 영향.  
우선순위: P2  
수정 방향: 카드 min-height·버튼 44px+ 유지.  
수정 파일 후보: `components/MobileCourseCard.tsx`, `components/MobileBottomSheet.tsx`

---

### 13. CWV / CLS risks

항목: CWV/CLS risks  
문제: 지도 컨테이너·카드 리스트 높이 미고정 시 CLS 가능. 지도 SDK 로딩 시 레이아웃 shift.  
영향: LCP/CLS 검색 순위 간접 요소.  
우선순위: P1(안전 수정) / P2(심층)  
수정 방향: 지도 wrapper 고정 높이, 카드 `min-h` 유지. 지도 lazy/스켈레톤은 P2.  
수정 파일 후보: `components/HomeClient.tsx`, `components/CourseCard.tsx`, `components/CollectionLandingView.tsx`, `components/CourseDetail.tsx`

---

### 14. 0-result pages

항목: 0-result pages  
문제: par3, near-seoul-par3 등 데이터 0건 시 빈 랜딩 생성 가능.  
영향: 얇은 URL 색인·사이트맵 노이즈.  
우선순위: P1  
수정 방향: noindex + sitemap 제외 + `CollectionLinks`에서 링크 제거.  
수정 파일 후보: `lib/collectionIndex.ts`, `app/collections/[slug]/page.tsx`, `components/CollectionLinks.tsx`

---

### 15. Structured data vs screen match

항목: structured data vs screen match  
문제: CollectionJsonLd FAQ·ItemList는 화면과 동일 소스. Course JSON-LD는 화면 필드 subset. 정기 검증 스크립트 없었음.  
영향: 리치 결과 불일치·Search Console 경고.  
우선순위: P1  
수정 방향: `scripts/auditStructuredData.ts` 추가, FAQ 수·ItemList 수·null/NaN 점검.  
수정 파일 후보: `components/CollectionJsonLd.tsx`, `components/RegionJsonLd.tsx`, `components/CourseJsonLd.tsx`, `scripts/auditStructuredData.ts`

---

### 16. OG / Image

항목: OG/image  
문제: `public/og-image.png` 존재 시 `seoMetadata`가 OG/Twitter image 자동 포함. 없으면 image 필드 생략(깨진 URL 방지).  
영향: SNS·메신저 공유 시 CTR.  
우선순위: P1  
수정 방향: og-image 유지, indexable 페이지 metadata helper 경유 확인.  
수정 파일 후보: `lib/seoMetadata.ts`, `public/og-image.png`

---

## 장기 과제 (구현 없음)

### Course detail slug URLs

항목: 골프장 상세 slug URL (`/courses/{slug}`)  
문제: 현재 `/courses/{id}` — URL에 의미 없음, 공유·기억 어려움.  
영향: 브랜드 검색·롱테일 키워드 URL 매칭 제한.  
우선순위: 장기  
수정 방향: DB에 slug 컬럼·301 from id·sitemap 갱신 — **Phase 1 범위 외, 설계만 기록.**  
수정 파일 후보: `app/courses/[id]/page.tsx`, `lib/courseRepository.ts`, `app/sitemap.ts` (향후)

---

## P2 운영 액션 (코드 변경 없음)

| 액션 | 담당 | 비고 |
|------|------|------|
| Google Search Console 속성 등록·sitemap 제출 | 운영 | `https://golfmap.kr/sitemap.xml` |
| URL 검사: `/`, 대표 컬렉션, 대표 상세 | 운영 | 색인 요청 |
| 네이버 서치어드바이저 등록·소유 확인 | 운영 | meta verification 이미 layout 지원 |
| 네이버 사이트맵 제출·수집 요청 | 운영 | 주요 랜딩 URL |
| Core Web Vitals Field Data 모니터링 | 운영 | Speed Insights + CrUX |
| 정기 `npm run analyze:collections` | 개발 | 배포 전 0건 slug 확인 |
| 정기 `npm run audit:structured-data` | 개발 | FAQ/ItemList 불일치 확인 |
| 외부 프로모션·백링크 | 마케팅 | Phase 1 범위 외 |

---

## Phase 1 구현 체크리스트

- [x] P0: 공개 UI developer terms 제거·유지
- [x] P1: 컬렉션 FAQ/intro 차별화
- [x] P1: 홈 SSR intro + 내부 링크
- [x] P1: 앵커/aria-label 개선
- [x] P1: 상세 신뢰 고지·링크 라벨
- [x] P1: 0건 noindex/sitemap/내부링크 제외 확인
- [x] P1: `auditStructuredData` 스크립트
- [x] P1: OG image 경로 확인
- [x] P1: CWV 안전 min-height 유지

---

## 참고 명령

```bash
npm run analyze:collections
npm run audit:structured-data
npm run build
npm run lint
```
